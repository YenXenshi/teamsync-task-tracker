import React, { useState, useMemo } from 'react';
import {
  Users,
  Search,
  Filter,
  CheckCircle2,
  Clock,
  Sparkles,
  ArrowUpDown,
} from 'lucide-react';
import { TaskItem, UserProfile } from '../types';
import { TaskCard } from './TaskCard';

interface TeamTasksViewProps {
  tasks: TaskItem[];
  users: UserProfile[];
  currentUserId: string;
  onToggleComplete: (taskId: string, currentStatus: boolean) => Promise<void>;
  onDeleteTask: (taskId: string) => Promise<void>;
  onOpenAddTask: () => void;
}

export const TeamTasksView: React.FC<TeamTasksViewProps> = ({
  tasks,
  users,
  currentUserId,
  onToggleComplete,
  onDeleteTask,
  onOpenAddTask,
}) => {
  const [memberFilter, setMemberFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'completed'>('all');
  const [search, setSearch] = useState('');

  const filteredTasks = useMemo(() => {
    return tasks.filter((task) => {
      // Member filter
      if (memberFilter !== 'all' && task.userId !== memberFilter) return false;

      // Status filter
      if (statusFilter === 'active' && task.completed) return false;
      if (statusFilter === 'completed' && !task.completed) return false;

      // Search filter
      if (search.trim()) {
        const q = search.toLowerCase();
        const matchesTitle = task.title.toLowerCase().includes(q);
        const matchesDesc = task.description?.toLowerCase().includes(q);
        const matchesUser = task.userName.toLowerCase().includes(q);
        const matchesCat = task.category.toLowerCase().includes(q);
        if (!matchesTitle && !matchesDesc && !matchesUser && !matchesCat) return false;
      }

      return true;
    });
  }, [tasks, memberFilter, statusFilter, search]);

  const totalCompleted = tasks.filter((t) => t.completed).length;
  const totalActive = tasks.length - totalCompleted;

  return (
    <div className="space-y-4 sm:space-y-5 pb-24 md:pb-8">
      {/* Header Banner */}
      <div className="bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-800 rounded-3xl p-5 sm:p-6 text-white shadow-md relative overflow-hidden">
        <div className="relative z-10 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/10 text-indigo-200 text-xs font-bold backdrop-blur-xs mb-2">
              <Users className="w-3.5 h-3.5" />
              <span>Workspace Collaboration</span>
            </div>
            <h2 className="text-xl sm:text-2xl font-extrabold tracking-tight">
              Team Activity Feed
            </h2>
            <p className="text-xs sm:text-sm text-indigo-200 mt-1 max-w-md leading-relaxed">
              Real-time Firestore sync of all business tasks across team members.
            </p>
          </div>

          <div className="flex items-center gap-2 bg-white/10 backdrop-blur-md rounded-2xl p-2.5 border border-white/10 self-start sm:self-auto">
            <div className="px-3 text-center">
              <span className="text-[10px] uppercase font-bold text-indigo-200 tracking-wider block">
                Total Tasks
              </span>
              <span className="text-lg sm:text-xl font-black text-white">
                {tasks.length}
              </span>
            </div>
            <div className="w-px h-8 bg-white/10" />
            <div className="px-3 text-center">
              <span className="text-[10px] uppercase font-bold text-emerald-300 tracking-wider block">
                Completed
              </span>
              <span className="text-lg sm:text-xl font-black text-white">
                {totalCompleted}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Filter and Member Picker */}
      <div className="space-y-2.5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
          {/* Status Tabs */}
          <div className="flex items-center gap-1 p-1 bg-slate-100 rounded-xl border border-slate-200 self-start">
            <button
              onClick={() => setStatusFilter('all')}
              className={`px-3 py-1 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                statusFilter === 'all'
                  ? 'bg-white text-indigo-700 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              All ({tasks.length})
            </button>
            <button
              onClick={() => setStatusFilter('active')}
              className={`px-3 py-1 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                statusFilter === 'active'
                  ? 'bg-white text-indigo-700 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Active ({totalActive})
            </button>
            <button
              onClick={() => setStatusFilter('completed')}
              className={`px-3 py-1 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                statusFilter === 'completed'
                  ? 'bg-white text-indigo-700 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Done ({totalCompleted})
            </button>
          </div>

          {/* Search bar */}
          <div className="relative flex-1 sm:max-w-xs">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search team tasks..."
              className="w-full pl-8 pr-3 py-1.5 rounded-xl border border-slate-200 bg-white text-xs placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>
        </div>

        {/* Member filter buttons */}
        {users.length > 0 && (
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none text-xs">
            <button
              onClick={() => setMemberFilter('all')}
              className={`px-2.5 py-1 rounded-full font-medium transition-all cursor-pointer flex-shrink-0 ${
                memberFilter === 'all'
                  ? 'bg-slate-900 text-white'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              All Colleagues
            </button>
            {users.map((u) => (
              <button
                key={u.uid}
                onClick={() => setMemberFilter(u.uid)}
                className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full font-medium transition-all cursor-pointer flex-shrink-0 ${
                  memberFilter === u.uid
                    ? 'bg-indigo-600 text-white'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                <div
                  className="w-3.5 h-3.5 rounded-full flex items-center justify-center text-[9px] text-white font-bold"
                  style={{ backgroundColor: u.avatarColor || '#6366F1' }}
                >
                  {u.displayName.charAt(0)}
                </div>
                <span>{u.displayName}</span>
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Task List */}
      <div className="space-y-2.5">
        {filteredTasks.length > 0 ? (
          filteredTasks.map((task) => (
            <TaskCard
              key={task.id}
              task={task}
              isOwner={task.userId === currentUserId}
              onToggleComplete={onToggleComplete}
              onDeleteTask={onDeleteTask}
              showOwner={true}
            />
          ))
        ) : (
          <div className="text-center py-12 px-4 rounded-3xl bg-slate-50 border border-dashed border-slate-200">
            <p className="text-xs text-slate-500">No team tasks found matching current filters.</p>
          </div>
        )}
      </div>
    </div>
  );
};
