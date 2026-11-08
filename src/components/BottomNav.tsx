import React from 'react';
import { CheckCircle2, Trophy, Users, Plus } from 'lucide-react';

interface BottomNavProps {
  currentTab: 'my-tasks' | 'leaderboard' | 'team-tasks';
  onTabChange: (tab: 'my-tasks' | 'leaderboard' | 'team-tasks') => void;
  onOpenAddTask: () => void;
  myPendingCount: number;
}

export const BottomNav: React.FC<BottomNavProps> = ({
  currentTab,
  onTabChange,
  onOpenAddTask,
  myPendingCount,
}) => {
  return (
    <div className="md:hidden fixed bottom-0 left-0 right-0 z-30 bg-white/95 backdrop-blur-md border-t border-slate-200 px-3 py-2 shadow-lg">
      <div className="max-w-md mx-auto flex items-center justify-around relative">
        {/* My Tasks Tab */}
        <button
          onClick={() => onTabChange('my-tasks')}
          className={`flex flex-col items-center py-1 px-3 rounded-xl transition-all relative ${
            currentTab === 'my-tasks'
              ? 'text-indigo-600 font-bold'
              : 'text-slate-700 hover:text-slate-900 font-medium'
          }`}
        >
          <div className="relative">
            <CheckCircle2 className="w-5 h-5" />
            {myPendingCount > 0 && (
              <span className="absolute -top-1.5 -right-2 px-1.5 py-0.2 rounded-full text-[9px] bg-indigo-600 text-white font-extrabold shadow-2xs">
                {myPendingCount}
              </span>
            )}
          </div>
          <span className="text-[10px] mt-1">My Tasks</span>
        </button>

        {/* Center Floating Add Task Button */}
        <button
          onClick={onOpenAddTask}
          className="flex items-center justify-center w-12 h-12 -mt-5 rounded-full bg-gradient-to-tr from-indigo-600 to-blue-600 text-white shadow-md hover:scale-105 active:scale-95 transition-transform"
          aria-label="Add Task"
        >
          <Plus className="w-6 h-6 stroke-[2.5]" />
        </button>

        {/* Leaderboard Tab */}
        <button
          onClick={() => onTabChange('leaderboard')}
          className={`flex flex-col items-center py-1 px-3 rounded-xl transition-all ${
            currentTab === 'leaderboard'
              ? 'text-indigo-600 font-bold'
              : 'text-slate-700 hover:text-slate-900 font-medium'
          }`}
        >
          <Trophy className="w-5 h-5" />
          <span className="text-[10px] mt-1">Leaderboard</span>
        </button>

        {/* Team Feed Tab */}
        <button
          onClick={() => onTabChange('team-tasks')}
          className={`flex flex-col items-center py-1 px-3 rounded-xl transition-all ${
            currentTab === 'team-tasks'
              ? 'text-indigo-600 font-bold'
              : 'text-slate-700 hover:text-slate-900 font-medium'
          }`}
        >
          <Users className="w-5 h-5" />
          <span className="text-[10px] mt-1">Team Feed</span>
        </button>
      </div>
    </div>
  );
};
