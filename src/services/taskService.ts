import {
  collection,
  doc,
  addDoc,
  updateDoc,
  deleteDoc,
  setDoc,
  getDoc,
  onSnapshot,
  query,
  orderBy,
  Unsubscribe,
} from 'firebase/firestore';
import { db, handleFirestoreError, OperationType, FirebaseUser } from '../firebase';
import { TaskItem, UserProfile, LeaderboardStats, TaskPriority } from '../types';

export const TEAM_WORKSPACE_ID = 'apex-craft-team';

// Sample made-up names for realistic small business environment
export const SAMPLE_TEAM_MEMBERS = [
  {
    name: 'Taylor Chen',
    role: 'Customer Support Lead',
    department: 'Support',
    color: '#0EA5E9', // sky
    email: 'taylor.chen@smallbiz.local',
  },
  {
    name: 'Jordan Blake',
    role: 'Inventory & Logistics',
    department: 'Operations',
    color: '#F59E0B', // amber
    email: 'jordan.blake@smallbiz.local',
  },
  {
    name: 'Samira Patel',
    role: 'Client Partnerships Lead',
    department: 'Sales',
    color: '#8B5CF6', // purple
    email: 'samira.patel@smallbiz.local',
  },
  {
    name: 'Morgan Vance',
    role: 'Office & Admin Manager',
    department: 'Administration',
    color: '#EC4899', // pink
    email: 'morgan.vance@smallbiz.local',
  },
  {
    name: 'Riley Cooper',
    role: 'Digital Marketing & Content',
    department: 'Marketing',
    color: '#10B981', // emerald
    email: 'riley.cooper@smallbiz.local',
  },
];

// Subscribe to all tasks in Firestore
export function subscribeToAllTasks(
  onUpdate: (tasks: TaskItem[]) => void,
  onError?: (error: Error) => void
): Unsubscribe {
  const tasksRef = collection(db, 'tasks');
  const q = query(tasksRef, orderBy('createdAt', 'desc'));

  return onSnapshot(
    q,
    (snapshot) => {
      const tasks: TaskItem[] = [];
      snapshot.forEach((docSnapshot) => {
        const data = docSnapshot.data();
        tasks.push({
          id: docSnapshot.id, // Firestore generated unique ID
          userId: data.userId || '',
          userName: data.userName || 'Team Member',
          userEmail: data.userEmail,
          userPhoto: data.userPhoto,
          title: data.title || '',
          description: data.description || '',
          category: data.category || 'General',
          priority: (data.priority as TaskPriority) || 'medium',
          completed: Boolean(data.completed),
          pointsAwarded: Number(data.pointsAwarded ?? 1),
          teamId: data.teamId || TEAM_WORKSPACE_ID,
          completedAt: data.completedAt,
          createdAt: data.createdAt || new Date().toISOString(),
          updatedAt: data.updatedAt || new Date().toISOString(),
          isSample: Boolean(data.isSample),
        });
      });
      onUpdate(tasks);
    },
    (error) => {
      if (onError) onError(error);
      handleFirestoreError(error, OperationType.LIST, 'tasks');
    }
  );
}

// Subscribe to all users in Firestore
export function subscribeToAllUsers(
  onUpdate: (users: UserProfile[]) => void,
  onError?: (error: Error) => void
): Unsubscribe {
  const usersRef = collection(db, 'users');

  return onSnapshot(
    usersRef,
    (snapshot) => {
      const users: UserProfile[] = [];
      snapshot.forEach((docSnapshot) => {
        const data = docSnapshot.data();
        users.push({
          id: docSnapshot.id, // Firestore generated unique ID
          uid: data.uid || docSnapshot.id,
          displayName: data.displayName || 'Employee',
          email: data.email || '',
          role: data.role || 'Team Member',
          department: data.department || 'Operations',
          avatarColor: data.avatarColor || '#6366F1',
          photoURL: data.photoURL,
          createdAt: data.createdAt || new Date().toISOString(),
          updatedAt: data.updatedAt || new Date().toISOString(),
          isSample: Boolean(data.isSample),
        });
      });
      onUpdate(users);
    },
    (error) => {
      if (onError) onError(error);
      handleFirestoreError(error, OperationType.LIST, 'users');
    }
  );
}

// Add a new task: Firestore database generates the unique ID
export async function addTaskToFirestore(taskData: {
  userId: string;
  userName: string;
  userEmail?: string;
  userPhoto?: string;
  title: string;
  description?: string;
  category: string;
  priority: TaskPriority;
}): Promise<string> {
  const now = new Date().toISOString();
  const payload = {
    userId: taskData.userId,
    userName: taskData.userName,
    userEmail: taskData.userEmail || '',
    userPhoto: taskData.userPhoto || '',
    title: taskData.title.trim(),
    description: taskData.description?.trim() || '',
    category: taskData.category,
    priority: taskData.priority,
    completed: false,
    pointsAwarded: 1, // 1 point per completed task
    teamId: TEAM_WORKSPACE_ID,
    createdAt: now,
    updatedAt: now,
  };

  try {
    // Database generates the unique alphanumeric ID
    const docRef = await addDoc(collection(db, 'tasks'), payload);
    return docRef.id;
  } catch (error) {
    handleFirestoreError(error, OperationType.CREATE, 'tasks');
  }
}

// Toggle or update task completion in Firestore
export async function toggleTaskCompletionInFirestore(
  taskId: string,
  currentStatus: boolean
): Promise<void> {
  const now = new Date().toISOString();
  const newStatus = !currentStatus;
  const updates: Record<string, any> = {
    completed: newStatus,
    updatedAt: now,
  };
  if (newStatus) {
    updates.completedAt = now;
  } else {
    updates.completedAt = '';
  }

  try {
    const taskRef = doc(db, 'tasks', taskId);
    await updateDoc(taskRef, updates);
  } catch (error) {
    handleFirestoreError(error, OperationType.UPDATE, `tasks/${taskId}`);
  }
}

// Delete task from Firestore
export async function deleteTaskFromFirestore(taskId: string): Promise<void> {
  try {
    const taskRef = doc(db, 'tasks', taskId);
    await deleteDoc(taskRef);
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, `tasks/${taskId}`);
  }
}

// Synchronize signed-in Google user profile into Firestore
export async function syncUserProfileToFirestore(
  user: FirebaseUser,
  customRole?: string,
  customDepartment?: string
): Promise<UserProfile> {
  const userId = user.uid;
  const userDocRef = doc(db, 'users', userId);
  const now = new Date().toISOString();

  // Pick a consistent avatar color based on UID
  const avatarColors = [
    '#3B82F6', '#10B981', '#8B5CF6', '#F59E0B', '#EC4899', '#06B6D4', '#6366F1'
  ];
  const colorIndex = Math.abs(
    userId.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0)
  ) % avatarColors.length;
  const chosenColor = avatarColors[colorIndex];

  try {
    const snapshot = await getDoc(userDocRef);
    if (snapshot.exists()) {
      const existing = snapshot.data();
      const profile: UserProfile = {
        id: userDocRef.id,
        uid: user.uid,
        displayName: existing.displayName || user.displayName || 'Alex Morgan',
        email: user.email || '',
        role: customRole || existing.role || 'Team Member',
        department: customDepartment || existing.department || 'Operations',
        avatarColor: existing.avatarColor || chosenColor,
        photoURL: user.photoURL || existing.photoURL || '',
        createdAt: existing.createdAt || now,
        updatedAt: now,
      };
      await updateDoc(userDocRef, {
        displayName: profile.displayName,
        email: profile.email,
        role: profile.role,
        department: profile.department,
        photoURL: profile.photoURL,
        updatedAt: now,
      });
      return profile;
    } else {
      // Create fresh user profile in Firestore
      const newProfile: UserProfile = {
        id: userDocRef.id,
        uid: user.uid,
        displayName: user.displayName || 'Jordan Blake',
        email: user.email || '',
        role: customRole || 'Team Member',
        department: customDepartment || 'Operations',
        avatarColor: chosenColor,
        photoURL: user.photoURL || '',
        createdAt: now,
        updatedAt: now,
      };
      await setDoc(userDocRef, newProfile);
      return newProfile;
    }
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, `users/${userId}`);
  }
}

// Calculate leaderboard dynamically from saved task records
export function calculateLeaderboard(
  users: UserProfile[],
  tasks: TaskItem[],
  currentUserId?: string
): LeaderboardStats[] {
  // Map of userId -> stats
  const statsMap = new Map<string, {
    completed: number;
    pending: number;
    total: number;
    displayName: string;
    email?: string;
    role: string;
    department: string;
    avatarColor: string;
    photoURL?: string;
  }>();

  // First seed known users from Firestore
  users.forEach((u) => {
    statsMap.set(u.uid, {
      completed: 0,
      pending: 0,
      total: 0,
      displayName: u.displayName,
      email: u.email,
      role: u.role,
      department: u.department,
      avatarColor: u.avatarColor || '#6366F1',
      photoURL: u.photoURL,
    });
  });

  // Calculate totals strictly from the saved Firestore task records
  tasks.forEach((task) => {
    let entry = statsMap.get(task.userId);
    if (!entry) {
      entry = {
        completed: 0,
        pending: 0,
        total: 0,
        displayName: task.userName || 'Team Member',
        email: task.userEmail,
        role: 'Team Member',
        department: 'Operations',
        avatarColor: '#3B82F6',
        photoURL: task.userPhoto,
      };
      statsMap.set(task.userId, entry);
    }

    entry.total += 1;
    if (task.completed) {
      entry.completed += 1;
    } else {
      entry.pending += 1;
    }
  });

  // Convert to array and calculate points (1 pt per completed task)
  const results: LeaderboardStats[] = Array.from(statsMap.entries()).map(
    ([userId, data]) => {
      const points = data.completed * 1; // Each completed task is worth 1 point
      return {
        userId,
        displayName: data.displayName,
        email: data.email,
        role: data.role,
        department: data.department,
        avatarColor: data.avatarColor,
        photoURL: data.photoURL,
        completedTasksCount: data.completed,
        totalPoints: points,
        pendingTasksCount: data.pending,
        totalTasksCount: data.total,
        isCurrentUser: currentUserId === userId,
        rank: 0, // Assigned below
      };
    }
  );

  // Sort descending by points, then by completed tasks, then alphabetically
  results.sort((a, b) => {
    if (b.totalPoints !== a.totalPoints) {
      return b.totalPoints - a.totalPoints;
    }
    if (b.completedTasksCount !== a.completedTasksCount) {
      return b.completedTasksCount - a.completedTasksCount;
    }
    return a.displayName.localeCompare(b.displayName);
  });

  // Assign ranks
  results.forEach((item, index) => {
    item.rank = index + 1;
  });

  return results;
}

// Seed realistic made-up team sample tasks and members into Firestore
export async function seedSampleTeamInFirestore(): Promise<void> {
  const now = new Date();

  // Create sample users in Firestore
  for (let i = 0; i < SAMPLE_TEAM_MEMBERS.length; i++) {
    const member = SAMPLE_TEAM_MEMBERS[i];
    const sampleUid = `sample_member_${i + 1}`;
    const userRef = doc(db, 'users', sampleUid);

    await setDoc(userRef, {
      uid: sampleUid,
      displayName: member.name,
      email: member.email,
      role: member.role,
      department: member.department,
      avatarColor: member.color,
      photoURL: '',
      isSample: true,
      createdAt: new Date(now.getTime() - (7 - i) * 86400000).toISOString(),
      updatedAt: now.toISOString(),
    });
  }

  // Realistic small business tasks with varied completed states
  const sampleTasks = [
    {
      memberIdx: 0, // Taylor Chen
      title: 'Resolve priority client escalation for Order #4928',
      description: 'Contact customer regarding shipment replacement and issue refund voucher.',
      category: 'Customer Support',
      priority: 'urgent' as TaskPriority,
      completed: true,
      daysAgo: 4,
    },
    {
      memberIdx: 0, // Taylor Chen
      title: 'Update standard response templates for holiday FAQ',
      description: 'Review common shipping cutoff queries and refine chatbot macros.',
      category: 'Customer Support',
      priority: 'medium' as TaskPriority,
      completed: true,
      daysAgo: 3,
    },
    {
      memberIdx: 0, // Taylor Chen
      title: 'Conduct weekly support queue audit & response time check',
      description: 'Check average first response time across email and live desk.',
      category: 'Customer Support',
      priority: 'high' as TaskPriority,
      completed: true,
      daysAgo: 1,
    },
    {
      memberIdx: 0, // Taylor Chen
      title: 'Draft customer satisfaction survey for Q4 clients',
      description: 'Prepare 3-question CSAT follow-up email sequence.',
      category: 'Customer Support',
      priority: 'low' as TaskPriority,
      completed: false,
      daysAgo: 0,
    },
    {
      memberIdx: 1, // Jordan Blake
      title: 'Quarterly inventory count for warehouse aisle 3 & 4',
      description: 'Reconcile physical stock with ERP catalog entries.',
      category: 'Inventory & Stock',
      priority: 'high' as TaskPriority,
      completed: true,
      daysAgo: 5,
    },
    {
      memberIdx: 1, // Jordan Blake
      title: 'Inspect packing supply restock delivery from supplier',
      description: 'Verify 500 corrugated boxes, eco-bubble mailers, and label rolls.',
      category: 'Inventory & Stock',
      priority: 'medium' as TaskPriority,
      completed: true,
      daysAgo: 2,
    },
    {
      memberIdx: 1, // Jordan Blake
      title: 'Calibrate digital thermal barcode label printers',
      description: 'Clean print heads and run test alignment pass for shipping bay.',
      category: 'Operations',
      priority: 'low' as TaskPriority,
      completed: true,
      daysAgo: 2,
    },
    {
      memberIdx: 1, // Jordan Blake
      title: 'Reorganize fast-moving SKU dispatch shelving bins',
      description: 'Place top 20 weekly sellers within primary picking perimeter.',
      category: 'Operations',
      priority: 'medium' as TaskPriority,
      completed: false,
      daysAgo: 0,
    },
    {
      memberIdx: 2, // Samira Patel
      title: 'Follow up with Northside Cafe wholesale partnership',
      description: 'Send updated seasonal bean sample catalog and bulk wholesale tier pricing.',
      category: 'Sales & Outreach',
      priority: 'urgent' as TaskPriority,
      completed: true,
      daysAgo: 6,
    },
    {
      memberIdx: 2, // Samira Patel
      title: 'Finalize vendor contract terms for Summit Retailers',
      description: 'Review delivery SLA, net-30 terms, and return guidelines with counsel.',
      category: 'Sales & Outreach',
      priority: 'high' as TaskPriority,
      completed: true,
      daysAgo: 4,
    },
    {
      memberIdx: 2, // Samira Patel
      title: 'Prepare pitch deck for Regional Chamber of Commerce expo',
      description: 'Include client case study, local business discounts, and booth mockups.',
      category: 'Sales & Outreach',
      priority: 'medium' as TaskPriority,
      completed: true,
      daysAgo: 1,
    },
    {
      memberIdx: 2, // Samira Patel
      title: 'Send demo samples to 5 boutique downtown stores',
      description: 'Curate gift packaging with personalized handwritten founder note.',
      category: 'Sales & Outreach',
      priority: 'medium' as TaskPriority,
      completed: false,
      daysAgo: 0,
    },
    {
      memberIdx: 3, // Morgan Vance
      title: 'Process bi-weekly payroll and contractor expense invoices',
      description: 'Verify timesheet submissions and approve direct deposits in banking portal.',
      category: 'Admin & Billing',
      priority: 'urgent' as TaskPriority,
      completed: true,
      daysAgo: 5,
    },
    {
      memberIdx: 3, // Morgan Vance
      title: 'Renew annual commercial general liability insurance policy',
      description: 'Submit updated revenue figures and team headcount verification.',
      category: 'Admin & Billing',
      priority: 'high' as TaskPriority,
      completed: true,
      daysAgo: 3,
    },
    {
      memberIdx: 3, // Morgan Vance
      title: 'Order healthy pantry snacks & fair-trade breakroom coffee',
      description: 'Restock sparkling water, herbal teas, fruit basket, and oat milk.',
      category: 'Office Management',
      priority: 'low' as TaskPriority,
      completed: true,
      daysAgo: 1,
    },
    {
      memberIdx: 4, // Riley Cooper
      title: 'Publish Instagram reels showcasing artisan roasting process',
      description: 'Feature head roaster interview and behind-the-scenes beans sorting.',
      category: 'Marketing',
      priority: 'medium' as TaskPriority,
      completed: true,
      daysAgo: 3,
    },
    {
      memberIdx: 4, // Riley Cooper
      title: 'Schedule weekly promotional newsletter campaign to 4,200 subscribers',
      description: 'Subject: "Behind the craft: Meet our local roasting crew".',
      category: 'Marketing',
      priority: 'high' as TaskPriority,
      completed: true,
      daysAgo: 2,
    },
    {
      memberIdx: 4, // Riley Cooper
      title: 'Design storefront sidewalk chalkboard promotions',
      description: 'Showcase seasonal Maple Pecan brew and loyalty punchcard promo.',
      category: 'Marketing',
      priority: 'medium' as TaskPriority,
      completed: false,
      daysAgo: 0,
    },
  ];

  for (const t of sampleTasks) {
    const member = SAMPLE_TEAM_MEMBERS[t.memberIdx];
    const sampleUid = `sample_member_${t.memberIdx + 1}`;
    const createdAt = new Date(now.getTime() - t.daysAgo * 86400000).toISOString();
    const completedAt = t.completed ? createdAt : '';

    await addDoc(collection(db, 'tasks'), {
      userId: sampleUid,
      userName: member.name,
      userEmail: member.email,
      userPhoto: '',
      title: t.title,
      description: t.description,
      category: t.category,
      priority: t.priority,
      completed: t.completed,
      pointsAwarded: 1,
      teamId: TEAM_WORKSPACE_ID,
      completedAt,
      createdAt,
      updatedAt: createdAt,
      isSample: true,
    });
  }
}
