import React, { useState } from 'react';
import {
  Check,
  Trash2,
  AlertCircle,
  Tag,
  Sparkles,
  ChevronDown,
  ChevronUp,
  User,
  Clock,
} from 'lucide-react';
import { TaskItem, TaskPriority } from '../types';
import { fireTaskCompletionConfetti } from '../utils/confetti';

interface TaskCardProps {
  task: TaskItem;
  isOwner: boolean;
  onToggleComplete: (taskId: string, currentStatus: boolean) => Promise<void>;
  onDeleteTask: (taskId: string) => Promise<void>;
  showOwner?: boolean;
}

export const TaskCard: React.FC<TaskCardProps> = ({
  task,
  isOwner,
  onToggleComplete,
  onDeleteTask,
  showOwner = false,
}) => {
  const [isUpdating, setIsUpdating] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);

  const handleToggle = async () => {
    if (isUpdating) return;
    setIsUpdating(true);
    try {
      const willBeCompleted = !task.completed;
      if (willBeCompleted) {
        fireTaskCompletionConfetti();
      }
      await onToggleComplete(task.id, task.completed);
    } finally {
      setIsUpdating(false);
    }
  };

  const handleDelete = async () => {
    if (isDeleting) return;
    if (window.confirm('Delete this task?')) {
      setIsDeleting(true);
      try {
        await onDeleteTask(task.id);
      } finally {
        setIsDeleting(false);
      }
    }
  };

  const getPriorityStyle = (priority: TaskPriority) => {
    switch (priority) {
      case 'urgent':
        return 'bg-red-50 text-red-700 border-red-200';
      case 'high':
        return 'bg-orange-50 text-orange-700 border-orange-200';
      case 'medium':
        return 'bg-amber-50 text-amber-700 border-amber-200';
      case 'low':
      default:
        return 'bg-emerald-50 text-emerald-700 border-emerald-200';
    }
  };

  return (
    <div
      className={`group relative rounded-2xl border transition-all duration-200 ${
        task.completed
          ? 'bg-slate-50/80 border-slate-200/90 text-slate-500'
          : 'bg-white border-slate-200/90 text-slate-800 hover:border-slate-300 hover:shadow-xs'
      }`}
    >
      <div className="p-3.5 sm:p-4">
        <div className="flex items-start gap-3">
          {/* Checkbox button */}
          <button
            onClick={handleToggle}
            disabled={isUpdating}
            className={`mt-0.5 w-6 h-6 rounded-lg flex items-center justify-center transition-all flex-shrink-0 cursor-pointer ${
              task.completed
                ? 'bg-emerald-500 text-white shadow-xs'
                : 'border-2 border-slate-300 hover:border-indigo-500 bg-white'
            }`}
            aria-label={task.completed ? 'Mark task as active' : 'Mark task as done'}
          >
            {task.completed && <Check className="w-4 h-4 stroke-[3]" />}
          </button>

          {/* Main Task Content */}
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-2">
              <h3
                onClick={handleToggle}
                className={`text-sm font-semibold cursor-pointer select-none leading-snug transition-all ${
                  task.completed
                    ? 'line-through text-slate-400 font-normal'
                    : 'text-slate-900 group-hover:text-indigo-950'
                }`}
              >
                {task.title}
              </h3>

              {/* Point Value Badge */}
              <div
                className={`flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-bold flex-shrink-0 border ${
                  task.completed
                    ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                    : 'bg-amber-50 text-amber-800 border-amber-200'
                }`}
              >
                <Sparkles className="w-3 h-3 text-amber-500 fill-amber-500" />
                <span>{task.completed ? '+1 pt earned' : '1 pt'}</span>
              </div>
            </div>

            {/* Optional Description / Details */}
            {task.description && (
              <div className="mt-1">
                <p
                  className={`text-xs text-slate-600 leading-relaxed transition-all ${
                    !isExpanded ? 'line-clamp-2' : ''
                  }`}
                >
                  {task.description}
                </p>
                {task.description.length > 90 && (
                  <button
                    onClick={() => setIsExpanded(!isExpanded)}
                    className="text-[11px] font-semibold text-indigo-600 hover:text-indigo-700 mt-0.5 flex items-center gap-0.5 cursor-pointer"
                  >
                    <span>{isExpanded ? 'Show less' : 'Read details'}</span>
                    {isExpanded ? (
                      <ChevronUp className="w-3 h-3" />
                    ) : (
                      <ChevronDown className="w-3 h-3" />
                    )}
                  </button>
                )}
              </div>
            )}

            {/* Badges / Metadata row */}
            <div className="mt-2.5 flex flex-wrap items-center gap-1.5 text-[11px]">
              {/* Category */}
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-slate-100 text-slate-600 font-medium">
                <Tag className="w-2.5 h-2.5 text-slate-400" />
                <span>{task.category}</span>
              </span>

              {/* Priority */}
              <span
                className={`inline-flex items-center px-2 py-0.5 rounded-md font-semibold border capitalize ${getPriorityStyle(
                  task.priority
                )}`}
              >
                {task.priority}
              </span>

              {/* Owner tag (in team feed view) */}
              {showOwner && (
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-indigo-50 text-indigo-700 font-medium border border-indigo-100">
                  <User className="w-2.5 h-2.5 text-indigo-500" />
                  <span>{task.userName}</span>
                </span>
              )}

              {/* Completed timestamp */}
              {task.completed && task.completedAt && (
                <span className="inline-flex items-center gap-1 text-[10px] text-slate-400 ml-auto">
                  <Clock className="w-2.5 h-2.5" />
                  <span>Completed</span>
                </span>
              )}

              {/* Unique Firestore ID badge */}
              <span
                className="hidden sm:inline-block text-[9px] font-mono text-slate-400 ml-auto"
                title={`Firestore Auto ID: ${task.id}`}
              >
                ID: {task.id.slice(0, 7)}…
              </span>
            </div>
          </div>

          {/* Delete Action (if owner) */}
          {isOwner && (
            <button
              onClick={handleDelete}
              disabled={isDeleting}
              className="opacity-0 group-hover:opacity-100 focus:opacity-100 p-1.5 text-slate-400 hover:text-red-500 rounded-lg hover:bg-red-50 transition-all flex-shrink-0 cursor-pointer"
              aria-label="Delete Task"
              title="Delete task"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
