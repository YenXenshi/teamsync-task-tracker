import React, { useState, useMemo } from 'react';
import {
  Plus,
  CheckCircle2,
  Clock,
  Sparkles,
  Filter,
  Search,
  Layers,
  ArrowRight,
  TrendingUp,
} from 'lucide-react';
import { TaskItem, TaskPriority } from '../types';
import { TaskCard } from './TaskCard';

interface MyTasksViewProps {
  tasks: TaskItem[];
  userId: string;
  userName: string;
  onOpenAddTask: () => void;
  onToggleComplete: (taskId: string, currentStatus: boolean) => Promise<void>;
  onDeleteTask: (taskId: string) => Promise<void>;
  onQuickAddTask: (title: string) => Promise<void>;
  onGoToLeaderboard: () => void;
}

export const MyTasksView: React.FC<MyTasksViewProps> = ({
  tasks,
  userId,
  userName,
  onOpenAddTask,
  onToggleComplete,
  onDeleteTask,
  onQuickAddTask,
  onGoToLeaderboard,
}) => {
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'completed'>('all');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [quickTitle, setQuickTitle] = useState('');
  const [isQuickAdding, setIsQuickAdding] = useState(false);

  // Filter tasks belonging to the signed-in user
  const myTasks = useMemo(() => {
    return tasks.filter((t) => t.userId === userId);
  }, [tasks, userId]);

  // Aggregate stats strictly from saved records
  const stats = useMemo(() => {
    const total = myTasks.length;
    const completed = myTasks.filter((t) => t.completed).length;
    const active = total - completed;
    const points = completed * 1; // 1 point per completed task
    return { total, completed, active, points };
  }, [myTasks]);

  // Distinct categories in user's tasks
  const availableCategories = useMemo(() => {
    const set = new Set<string>();
    myTasks.forEach((t) => {
      if (t.category) set.add(t.category);
    });
    return Array.from(set);
  }, [myTasks]);

  // Filtered view
  const filteredTasks = useMemo(() => {
    return myTasks.filter((task) => {
      // Status
      if (statusFilter === 'active' && task.completed) return false;
      if (statusFilter === 'completed' && !task.completed) return false;

      // Category
      if (categoryFilter !== 'all' && task.category !== categoryFilter) return false;

      // Search
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchesTitle = task.title.toLowerCase().includes(q);
        const matchesDesc = task.description?.toLowerCase().includes(q);
        const matchesCat = task.category.toLowerCase().includes(q);
        if (!matchesTitle && !matchesDesc && !matchesCat) return false;
      }

      return true;
    });
  }, [myTasks, statusFilter, categoryFilter, searchQuery]);

  const handleQuickAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!quickTitle.trim() || isQuickAdding) return;
    setIsQuickAdding(true);
    try {
      await onQuickAddTask(quickTitle.trim());
      setQuickTitle('');
    } finally {
      setIsQuickAdding(false);
    }
  };

  return (
    <div className="space-y-4 sm:space-y-5 pb-24 md:pb-8">
      {/* Overview Metric Banner */}
      <div className="bg-gradient-to-br from-indigo-900 via-indigo-800 to-slate-900 rounded-3xl p-5 sm:p-6 text-white shadow-md relative overflow-hidden">
        {/* Subtle decorative background circle */}
        <div className="absolute -right-8 -bottom-8 w-44 h-44 rounded-full bg-indigo-500/10 blur-2xl pointer-events-none" />

        <div className="relative z-10 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-white/10 text-indigo-200 text-xs font-semibold backdrop-blur-xs mb-2">
              <Sparkles className="w-3 h-3 text-amber-300 fill-amber-300" />
              <span>Personal Task Tracker</span>
            </div>
            <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-white">
              Hello, {userName}
            </h2>
            <p className="text-xs sm:text-sm text-indigo-200 mt-0.5">
              Each task you complete permanently adds <strong className="text-white">+1 point</strong> to the team leaderboard.
            </p>
          </div>

          {/* Quick Stats Grid */}
          <div className="grid grid-cols-3 gap-2 sm:gap-3 bg-white/10 backdrop-blur-md rounded-2xl p-3 border border-white/10 text-center">
            <div className="px-2">
              <span className="text-[10px] uppercase font-bold text-indigo-200 tracking-wider block">
                Active
              </span>
              <span className="text-lg sm:text-xl font-extrabold text-white">
                {stats.active}
              </span>
            </div>
            <div className="px-2 border-x border-white/10">
              <span className="text-[10px] uppercase font-bold text-emerald-300 tracking-wider block">
                Done
              </span>
              <span className="text-lg sm:text-xl font-extrabold text-white">
                {stats.completed}
              </span>
            </div>
            <div
              onClick={onGoToLeaderboard}
              className="px-2 cursor-pointer hover:bg-white/10 rounded-xl transition-colors"
              title="Click to view full Leaderboard"
            >
              <span className="text-[10px] uppercase font-bold text-amber-300 tracking-wider block">
                Points
              </span>
              <span className="text-lg sm:text-xl font-extrabold text-amber-300 flex items-center justify-center gap-1">
                ⭐ {stats.points}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Add Inline Bar */}
      <form
        onSubmit={handleQuickAdd}
        className="flex items-center gap-2 bg-white p-2 rounded-2xl border border-slate-200 shadow-xs focus-within:border-indigo-500 focus-within:ring-2 focus-within:ring-indigo-100 transition-all"
      >
        <input
          type="text"
          value={quickTitle}
          onChange={(e) => setQuickTitle(e.target.value)}
          placeholder="Quick add a task (e.g. Finish shipping manifests) + Enter..."
          className="flex-1 px-3 py-2 text-xs sm:text-sm text-slate-800 placeholder:text-slate-400 focus:outline-none"
        />
        <button
          type="submit"
          disabled={!quickTitle.trim() || isQuickAdding}
          className="px-3.5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold transition-all disabled:opacity-40 flex items-center gap-1 cursor-pointer flex-shrink-0"
        >
          <Plus className="w-3.5 h-3.5 stroke-[3]" />
          <span className="hidden sm:inline">Add Task</span>
        </button>
        <button
          type="button"
          onClick={onOpenAddTask}
          className="p-2 rounded-xl text-slate-500 hover:text-indigo-600 hover:bg-indigo-50 border border-slate-200 transition-colors flex-shrink-0 cursor-pointer"
          title="Open full task creator with categories & notes"
        >
          <Layers className="w-4 h-4" />
        </button>
      </form>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
        {/* Status Filter Buttons */}
        <div className="flex items-center gap-1 p-1 bg-slate-100 rounded-xl border border-slate-200 self-start">
          <button
            onClick={() => setStatusFilter('all')}
            className={`px-3 py-1 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
              statusFilter === 'all'
                ? 'bg-white text-indigo-700 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            All ({myTasks.length})
          </button>
          <button
            onClick={() => setStatusFilter('active')}
            className={`px-3 py-1 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
              statusFilter === 'active'
                ? 'bg-white text-indigo-700 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Active ({stats.active})
          </button>
          <button
            onClick={() => setStatusFilter('completed')}
            className={`px-3 py-1 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
              statusFilter === 'completed'
                ? 'bg-white text-indigo-700 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Completed ({stats.completed})
          </button>
        </div>

        {/* Search input */}
        <div className="relative flex-1 sm:max-w-xs">
          <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search my tasks..."
            className="w-full pl-8 pr-3 py-1.5 rounded-xl border border-slate-200 bg-white text-xs placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
        </div>
      </div>

      {/* Category Pills (if any exist) */}
      {availableCategories.length > 0 && (
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none text-xs">
          <button
            onClick={() => setCategoryFilter('all')}
            className={`px-2.5 py-1 rounded-full font-medium transition-all cursor-pointer flex-shrink-0 ${
              categoryFilter === 'all'
                ? 'bg-slate-900 text-white'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            All Categories
          </button>
          {availableCategories.map((cat) => (
            <button
              key={cat}
              onClick={() => setCategoryFilter(cat)}
              className={`px-2.5 py-1 rounded-full font-medium transition-all cursor-pointer flex-shrink-0 ${
                categoryFilter === cat
                  ? 'bg-indigo-600 text-white'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      )}

      {/* Task List */}
      <div className="space-y-2.5">
        {filteredTasks.length > 0 ? (
          filteredTasks.map((task) => (
            <TaskCard
              key={task.id}
              task={task}
              isOwner={true}
              onToggleComplete={onToggleComplete}
              onDeleteTask={onDeleteTask}
            />
          ))
        ) : (
          <div className="text-center py-12 px-4 rounded-3xl bg-slate-50 border border-dashed border-slate-200">
            <div className="w-12 h-12 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center mx-auto mb-3">
              <CheckCircle2 className="w-6 h-6" />
            </div>
            <h3 className="text-sm font-bold text-slate-800">
              {myTasks.length === 0
                ? 'No tasks assigned yet'
                : 'No tasks match current filter'}
            </h3>
            <p className="text-xs text-slate-500 max-w-xs mx-auto mt-1 mb-4">
              {myTasks.length === 0
                ? 'Add your first task above. When you mark it done, you will earn 1 point on the leaderboard!'
                : 'Try clearing the search or switching filters to see other tasks.'}
            </p>
            {myTasks.length === 0 && (
              <button
                onClick={onOpenAddTask}
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold transition-all shadow-xs cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5 stroke-[3]" />
                <span>Create a Task (+1 pt on completion)</span>
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
