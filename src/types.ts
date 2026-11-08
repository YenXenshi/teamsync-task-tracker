export type TaskPriority = 'low' | 'medium' | 'high' | 'urgent';

export interface TaskItem {
  id: string; // Database generated unique ID
  userId: string;
  userName: string;
  userEmail?: string;
  userPhoto?: string;
  title: string;
  description?: string;
  category: string;
  priority: TaskPriority;
  completed: boolean;
  pointsAwarded: number; // 1 point per completed task
  teamId: string;
  completedAt?: string;
  createdAt: string;
  updatedAt: string;
  isSample?: boolean;
}

export interface UserProfile {
  id: string; // Database generated unique ID
  uid: string;
  displayName: string;
  email: string;
  role: string;
  department: string;
  avatarColor: string;
  photoURL?: string;
  createdAt: string;
  updatedAt: string;
  isSample?: boolean;
}

export interface LeaderboardStats {
  userId: string;
  displayName: string;
  email?: string;
  role: string;
  department: string;
  avatarColor: string;
  photoURL?: string;
  completedTasksCount: number;
  totalPoints: number; // calculated dynamically: completedTasksCount * 1
  pendingTasksCount: number;
  totalTasksCount: number;
  isCurrentUser: boolean;
  rank: number;
}
