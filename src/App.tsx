import React, { useState, useEffect, useMemo, useTransition } from 'react';
import {
  auth,
  onAuthStateChanged,
  signInWithGoogle,
  signOutFromApp,
  testFirestoreConnection,
  FirebaseUser,
} from './firebase';
import {
  subscribeToAllTasks,
  subscribeToAllUsers,
  addTaskToFirestore,
  toggleTaskCompletionInFirestore,
  deleteTaskFromFirestore,
  syncUserProfileToFirestore,
  calculateLeaderboard,
  seedSampleTeamInFirestore,
} from './services/taskService';
import { TaskItem, UserProfile, LeaderboardStats, TaskPriority } from './types';
import { Navbar } from './components/Navbar';
import { BottomNav } from './components/BottomNav';
import { MyTasksView } from './components/MyTasksView';
import { LeaderboardView } from './components/LeaderboardView';
import { TeamTasksView } from './components/TeamTasksView';
import { AddTaskModal } from './components/AddTaskModal';
import { UserProfileModal } from './components/UserProfileModal';
import { SignInPrompt } from './components/SignInPrompt';
import { CheckCircle2, Loader2, Sparkles, AlertTriangle } from 'lucide-react';

export default function App() {
  const [currentUser, setCurrentUser] = useState<FirebaseUser | null>(null);
  const [currentUserProfile, setCurrentUserProfile] = useState<UserProfile | null>(null);
  const [tasks, setTasks] = useState<TaskItem[]>([]);
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [loadingAuth, setLoadingAuth] = useState(true);
  const [loadingData, setLoadingData] = useState(true);
  const [currentTab, setCurrentTab] = useState<'my-tasks' | 'leaderboard' | 'team-tasks'>('my-tasks');
  const [isAddTaskOpen, setIsAddTaskOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isSeeding, setIsSeeding] = useState(false);
  const [notification, setNotification] = useState<{ message: string; type: 'success' | 'info' } | null>(null);

  // Show transient toast notification
  const showToast = (message: string, type: 'success' | 'info' = 'success') => {
    setNotification({ message, type });
    setTimeout(() => {
      setNotification((prev) => (prev?.message === message ? null : prev));
    }, 3200);
  };

  // Test connection on boot per Firebase guidelines
  useEffect(() => {
    testFirestoreConnection().catch((err) => {
      console.warn('Firestore boot test status:', err);
    });
  }, []);

  // Listen to Auth State
  useEffect(() => {
    const unsubscribeAuth = onAuthStateChanged(auth, async (user) => {
      setCurrentUser(user);
      setLoadingAuth(false);

      if (user) {
        try {
          const profile = await syncUserProfileToFirestore(user);
          setCurrentUserProfile(profile);
        } catch (error) {
          console.error('Failed to sync user profile:', error);
        }
      } else {
        setCurrentUserProfile(null);
      }
    });

    return () => unsubscribeAuth();
  }, []);

  // Subscribe to real-time Firestore collections (Tasks and Users)
  useEffect(() => {
    let unsubTasks: (() => void) | undefined;
    let unsubUsers: (() => void) | undefined;

    if (!currentUser) {
      setTasks([]);
      setUsers([]);
      setLoadingData(false);
      return;
    }

    try {
      unsubTasks = subscribeToAllTasks(
        (fetchedTasks) => {
          setTasks(fetchedTasks);
          setLoadingData(false);
        },
        (error) => {
          console.error('Task listener error:', error);
          setLoadingData(false);
        }
      );

      unsubUsers = subscribeToAllUsers(
        (fetchedUsers) => {
          setUsers(fetchedUsers);
        },
        (error) => {
          console.error('Users listener error:', error);
        }
      );
    } catch (e) {
      console.error('Subscription init failed:', e);
      setLoadingData(false);
    }

    return () => {
      if (unsubTasks) unsubTasks();
      if (unsubUsers) unsubUsers();
    };
  }, [currentUser]);

  // Calculate leaderboard dynamically from saved Firestore task records
  const leaderboard = useMemo(() => {
    return calculateLeaderboard(users, tasks, currentUser?.uid);
  }, [users, tasks, currentUser]);

  // Aggregate user's personal points from saved tasks in Firestore
  const myStats = useMemo(() => {
    if (!currentUser) return { points: 0, pending: 0, completed: 0, total: 0 };
    const myTasks = tasks.filter((t) => t.userId === currentUser.uid);
    const completed = myTasks.filter((t) => t.completed).length;
    const pending = myTasks.length - completed;
    const points = completed * 1; // 1 point per completed task
    return { points, pending, completed, total: myTasks.length };
  }, [tasks, currentUser]);

  // Handle Google Sign-in
  const handleSignIn = async () => {
    try {
      const user = await signInWithGoogle();
      if (user) {
        const profile = await syncUserProfileToFirestore(user);
        setCurrentUserProfile(profile);
        setCurrentTab('my-tasks');
        showToast(`Welcome back, ${profile.displayName}!`);
      }
    } catch (error: any) {
      console.error('Sign-in failed:', error);
      throw error;
    }
  };

  // Handle Sign-out
  const handleSignOut = async () => {
    try {
      await signOutFromApp();
      setCurrentUserProfile(null);
      setIsProfileOpen(false);
      showToast('Signed out safely', 'info');
    } catch (error) {
      console.error('Sign-out failed:', error);
    }
  };

  // Handle adding task to Firestore
  const handleAddTask = async (taskData: {
    title: string;
    description?: string;
    category: string;
    priority: TaskPriority;
  }) => {
    if (!currentUser) return;
    const userName = currentUserProfile?.displayName || currentUser.displayName || 'Employee';

    await addTaskToFirestore({
      userId: currentUser.uid,
      userName,
      userEmail: currentUser.email || '',
      userPhoto: currentUser.photoURL || '',
      title: taskData.title,
      description: taskData.description,
      category: taskData.category,
      priority: taskData.priority,
    });

    showToast('Task saved to Cloud Firestore');
  };

  // Handle quick inline add
  const handleQuickAddTask = async (title: string) => {
    if (!currentUser) return;
    const userName = currentUserProfile?.displayName || currentUser.displayName || 'Employee';

    await addTaskToFirestore({
      userId: currentUser.uid,
      userName,
      userEmail: currentUser.email || '',
      userPhoto: currentUser.photoURL || '',
      title,
      category: 'General',
      priority: 'medium',
    });

    showToast('Task added! Complete it to earn +1 pt');
  };

  // Handle toggling task completion in Firestore
  const handleToggleComplete = async (taskId: string, currentStatus: boolean) => {
    await toggleTaskCompletionInFirestore(taskId, currentStatus);
    if (!currentStatus) {
      showToast('🎉 Task completed! +1 Point added to your leaderboard score');
    } else {
      showToast('Task reopened', 'info');
    }
  };

  // Handle deleting a task
  const handleDeleteTask = async (taskId: string) => {
    await deleteTaskFromFirestore(taskId);
    showToast('Task deleted from Firestore', 'info');
  };

  // Handle seeding sample team data in Firestore
  const handleSeedSampleData = async () => {
    if (isSeeding) return;
    setIsSeeding(true);
    try {
      await seedSampleTeamInFirestore();
      showToast('Sample small business team and tasks loaded into Firestore!');
    } catch (error: any) {
      console.error('Seeding error:', error);
      showToast(error?.message || 'Failed to seed sample team', 'info');
    } finally {
      setIsSeeding(false);
    }
  };

  // Handle updating user profile
  const handleUpdateProfile = async (displayName: string, role: string, department: string) => {
    if (!currentUser) return;
    const updated = await syncUserProfileToFirestore(currentUser, role, department);
    setCurrentUserProfile(updated);
    showToast('Profile updated in Firestore');
  };

  // Total completed tasks across the entire business
  const totalCompletedTasks = useMemo(() => {
    return tasks.filter((t) => t.completed).length;
  }, [tasks]);

  return (
    <div className="min-h-screen bg-slate-100/70 text-slate-900 font-sans flex flex-col antialiased selection:bg-indigo-100 selection:text-indigo-900">
      {/* Toast Notification Banner */}
      {notification && (
        <div className="fixed top-3 left-1/2 -translate-x-1/2 z-50 max-w-sm w-11/12 animate-in slide-in-from-top duration-200">
          <div
            className={`px-4 py-2.5 rounded-2xl text-xs font-bold shadow-lg flex items-center justify-between gap-2 border ${
              notification.type === 'success'
                ? 'bg-slate-900 text-white border-slate-700'
                : 'bg-indigo-900 text-white border-indigo-700'
            }`}
          >
            <div className="flex items-center gap-2">
              <Sparkles className="w-3.5 h-3.5 text-amber-400 fill-amber-400 flex-shrink-0" />
              <span>{notification.message}</span>
            </div>
          </div>
        </div>
      )}

      {/* Main Top Navigation */}
      <Navbar
        currentTab={currentTab}
        onTabChange={setCurrentTab}
        currentUserProfile={currentUserProfile}
        myPoints={myStats.points}
        myPendingCount={myStats.pending}
        onOpenProfile={() => setIsProfileOpen(true)}
        onSignIn={handleSignIn}
        onSignOut={handleSignOut}
        hasTasks={tasks.length > 0}
        onSeedData={handleSeedSampleData}
        isSeeding={isSeeding}
      />

      {/* Main Content Area */}
      <main className="flex-1 max-w-4xl w-full mx-auto px-4 py-4 sm:py-6">
        {loadingAuth ? (
          <div className="py-24 flex flex-col items-center justify-center text-slate-400">
            <Loader2 className="w-8 h-8 animate-spin text-indigo-600 mb-2" />
            <span className="text-xs font-semibold">Connecting to Firebase...</span>
          </div>
        ) : !currentUser && currentTab === 'my-tasks' ? (
          <SignInPrompt
            onSignIn={handleSignIn}
            onExploreLeaderboard={() => setCurrentTab('leaderboard')}
          />
        ) : (
          <>
            {currentTab === 'my-tasks' && currentUser && (
              <MyTasksView
                tasks={tasks}
                userId={currentUser.uid}
                userName={currentUserProfile?.displayName || currentUser.displayName || 'Team Member'}
                onOpenAddTask={() => setIsAddTaskOpen(true)}
                onToggleComplete={handleToggleComplete}
                onDeleteTask={handleDeleteTask}
                onQuickAddTask={handleQuickAddTask}
                onGoToLeaderboard={() => setCurrentTab('leaderboard')}
              />
            )}

            {currentTab === 'leaderboard' && (
              <LeaderboardView
                leaderboard={leaderboard}
                totalSavedTasks={tasks.length}
                totalCompletedTasks={totalCompletedTasks}
                onSeedSampleData={handleSeedSampleData}
                isSeeding={isSeeding}
              />
            )}

            {currentTab === 'team-tasks' && (
              <TeamTasksView
                tasks={tasks}
                users={users}
                currentUserId={currentUser?.uid || ''}
                onToggleComplete={handleToggleComplete}
                onDeleteTask={handleDeleteTask}
                onOpenAddTask={() => {
                  if (currentUser) {
                    setIsAddTaskOpen(true);
                  } else {
                    handleSignIn();
                  }
                }}
              />
            )}
          </>
        )}
      </main>

      {/* Mobile Bottom Navigation */}
      {currentUser && (
        <BottomNav
          currentTab={currentTab}
          onTabChange={setCurrentTab}
          onOpenAddTask={() => setIsAddTaskOpen(true)}
          myPendingCount={myStats.pending}
        />
      )}

      {/* Add Task Modal */}
      {currentUser && (
        <AddTaskModal
          isOpen={isAddTaskOpen}
          onClose={() => setIsAddTaskOpen(false)}
          onAddTask={handleAddTask}
          userName={currentUserProfile?.displayName || currentUser.displayName || 'Team Member'}
        />
      )}

      {/* User Profile Modal */}
      {currentUser && (
        <UserProfileModal
          isOpen={isProfileOpen}
          onClose={() => setIsProfileOpen(false)}
          profile={currentUserProfile}
          myPoints={myStats.points}
          completedTasksCount={myStats.completed}
          totalTasksCount={myStats.total}
          onUpdateProfile={handleUpdateProfile}
          onSignOut={handleSignOut}
        />
      )}
    </div>
  );
}
