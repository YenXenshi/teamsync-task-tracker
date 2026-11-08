import React from 'react';
import {
  Trophy,
  CheckCircle2,
  Users,
  Sparkles,
  LogOut,
  LogIn,
  Layers,
  Database,
} from 'lucide-react';
import { UserProfile } from '../types';

interface NavbarProps {
  currentTab: 'my-tasks' | 'leaderboard' | 'team-tasks';
  onTabChange: (tab: 'my-tasks' | 'leaderboard' | 'team-tasks') => void;
  currentUserProfile: UserProfile | null;
  myPoints: number;
  myPendingCount: number;
  onOpenProfile: () => void;
  onSignIn: () => void;
  onSignOut: () => void;
  hasTasks: boolean;
  onSeedData: () => void;
  isSeeding: boolean;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentTab,
  onTabChange,
  currentUserProfile,
  myPoints,
  myPendingCount,
  onOpenProfile,
  onSignIn,
  onSignOut,
  hasTasks,
  onSeedData,
  isSeeding,
}) => {
  return (
    <header className="sticky top-0 z-30 bg-white/95 backdrop-blur-md border-b border-slate-200 shadow-xs">
      <div className="max-w-4xl mx-auto px-4 h-16 flex items-center justify-between gap-3">
        {/* Brand & Workspace */}
        <div className="flex items-center gap-2.5 min-w-0">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-indigo-600 to-blue-500 flex items-center justify-center text-white shadow-sm flex-shrink-0">
            <CheckCircle2 className="w-5 h-5 stroke-[2.5]" />
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-1.5">
              <h1 className="font-bold text-slate-900 text-base tracking-tight truncate leading-tight">
                TeamSync
              </h1>
              <span className="hidden sm:inline-block text-[10px] font-semibold tracking-wider uppercase px-1.5 py-0.5 rounded bg-blue-50 text-blue-700 border border-blue-200">
                Apex Works
              </span>
            </div>
            <p className="text-[11px] text-slate-700 hidden sm:block truncate">
              Small Business Task &amp; Points Tracker
            </p>
          </div>
        </div>

        {/* Desktop Tab Navigation */}
        <div className="hidden md:flex items-center p-1 bg-slate-100 rounded-xl border border-slate-200">
          <button
            onClick={() => onTabChange('my-tasks')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              currentTab === 'my-tasks'
                ? 'bg-white text-indigo-700 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span>My Tasks</span>
            {myPendingCount > 0 && (
              <span className="ml-0.5 px-1.5 py-0.2 rounded-full text-[10px] bg-indigo-100 text-indigo-700 font-bold">
                {myPendingCount}
              </span>
            )}
          </button>
          <button
            onClick={() => onTabChange('leaderboard')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              currentTab === 'leaderboard'
                ? 'bg-white text-indigo-700 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Trophy className="w-3.5 h-3.5 text-amber-500" />
            <span>Leaderboard</span>
          </button>
          <button
            onClick={() => onTabChange('team-tasks')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              currentTab === 'team-tasks'
                ? 'bg-white text-indigo-700 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Users className="w-3.5 h-3.5" />
            <span>Team Feed</span>
          </button>
        </div>

        {/* Right Section: Points Chip, Seed Button, User Profile */}
        <div className="flex items-center gap-2">
          {currentUserProfile ? (
            <>
              {/* Personal Points Badge */}
              <div
                onClick={() => onTabChange('leaderboard')}
                className="cursor-pointer flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-amber-50 border border-amber-200 text-amber-900 text-xs font-bold hover:bg-amber-100 transition-colors shadow-2xs"
                title="Your total points (1 pt per completed task)"
              >
                <Sparkles className="w-3.5 h-3.5 text-amber-500 fill-amber-500" />
                <span>{myPoints} pts</span>
              </div>

              {/* Seed Sample Data button if no tasks yet */}
              {!hasTasks && (
                <button
                  onClick={onSeedData}
                  disabled={isSeeding}
                  className="hidden sm:flex items-center gap-1 px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-slate-200 border border-slate-300 text-[11px] font-medium text-slate-700 transition-colors"
                  title="Seed sample made-up team tasks in Firestore"
                >
                  <Database className="w-3 h-3 text-slate-500" />
                  <span>{isSeeding ? 'Seeding...' : 'Load Sample Team'}</span>
                </button>
              )}

              {/* Profile Avatar Button */}
              <button
                onClick={onOpenProfile}
                className="flex items-center gap-1.5 p-1 rounded-full hover:ring-2 hover:ring-indigo-300 transition-all focus:outline-none"
                aria-label="View Profile"
              >
                {currentUserProfile.photoURL ? (
                  <img
                    src={currentUserProfile.photoURL}
                    alt={currentUserProfile.displayName}
                    className="w-8 h-8 rounded-full object-cover ring-1 ring-slate-300"
                  />
                ) : (
                  <div
                    className="w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-bold shadow-2xs"
                    style={{ backgroundColor: currentUserProfile.avatarColor || '#6366F1' }}
                  >
                    {currentUserProfile.displayName.charAt(0).toUpperCase()}
                  </div>
                )}
              </button>
            </>
          ) : (
            <button
              onClick={onSignIn}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold transition-all shadow-xs"
            >
              <LogIn className="w-3.5 h-3.5" />
              <span>Sign In with Google</span>
            </button>
          )}
        </div>
      </div>
    </header>
  );
};
