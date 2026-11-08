import React, { useState } from 'react';
import {
  Trophy,
  Medal,
  Award,
  Sparkles,
  CheckCircle2,
  Clock,
  Search,
  Database,
  Info,
  ShieldCheck,
  TrendingUp,
} from 'lucide-react';
import { LeaderboardStats, TaskItem } from '../types';

interface LeaderboardViewProps {
  leaderboard: LeaderboardStats[];
  totalSavedTasks: number;
  totalCompletedTasks: number;
  onSeedSampleData: () => Promise<void>;
  isSeeding: boolean;
}

export const LeaderboardView: React.FC<LeaderboardViewProps> = ({
  leaderboard,
  totalSavedTasks,
  totalCompletedTasks,
  onSeedSampleData,
  isSeeding,
}) => {
  const [search, setSearch] = useState('');

  const filtered = leaderboard.filter((item) => {
    if (!search.trim()) return true;
    const q = search.toLowerCase();
    return (
      item.displayName.toLowerCase().includes(q) ||
      item.role.toLowerCase().includes(q) ||
      item.department.toLowerCase().includes(q)
    );
  });

  const topThree = leaderboard.slice(0, 3);

  const getRankBadge = (rank: number) => {
    switch (rank) {
      case 1:
        return (
          <div className="w-7 h-7 rounded-full bg-amber-100 border border-amber-300 text-amber-700 font-extrabold flex items-center justify-center text-xs shadow-2xs">
            🥇
          </div>
        );
      case 2:
        return (
          <div className="w-7 h-7 rounded-full bg-slate-200 border border-slate-300 text-slate-700 font-extrabold flex items-center justify-center text-xs shadow-2xs">
            🥈
          </div>
        );
      case 3:
        return (
          <div className="w-7 h-7 rounded-full bg-orange-100 border border-orange-300 text-orange-800 font-extrabold flex items-center justify-center text-xs shadow-2xs">
            🥉
          </div>
        );
      default:
        return (
          <div className="w-7 h-7 rounded-full bg-slate-100 border border-slate-200 text-slate-600 font-bold flex items-center justify-center text-xs">
            #{rank}
          </div>
        );
    }
  };

  return (
    <div className="space-y-4 sm:space-y-5 pb-24 md:pb-8">
      {/* Header Banner */}
      <div className="bg-gradient-to-br from-amber-500 via-amber-600 to-amber-700 rounded-3xl p-5 sm:p-6 text-white shadow-md relative overflow-hidden">
        <div className="relative z-10">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-black/15 text-amber-100 text-xs font-bold backdrop-blur-xs mb-2">
            <Trophy className="w-3.5 h-3.5 text-amber-200" />
            <span>Small Business Standings</span>
          </div>

          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h2 className="text-xl sm:text-2xl font-extrabold tracking-tight">
                Team Points Leaderboard
              </h2>
              <p className="text-xs sm:text-sm text-amber-100 mt-1 max-w-md leading-relaxed">
                Every task completed by an employee grants <strong className="text-white">1 Point</strong>. Totals are derived from persistent Firestore task records and never reset.
              </p>
            </div>

            {/* Quick aggregate cards */}
            <div className="flex items-center gap-2 bg-black/20 backdrop-blur-md rounded-2xl p-2.5 border border-white/20 self-start sm:self-auto">
              <div className="px-3 text-center">
                <span className="text-[10px] uppercase font-bold text-amber-200 tracking-wider block">
                  Total Points
                </span>
                <span className="text-lg sm:text-xl font-black text-white">
                  ⭐ {totalCompletedTasks}
                </span>
              </div>
              <div className="w-px h-8 bg-white/20" />
              <div className="px-3 text-center">
                <span className="text-[10px] uppercase font-bold text-amber-200 tracking-wider block">
                  Completed Tasks
                </span>
                <span className="text-lg sm:text-xl font-black text-white">
                  {totalCompletedTasks}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Top 3 Podium Cards (if at least 2 members) */}
      {topThree.length >= 2 && (
        <div className="grid grid-cols-3 gap-2 sm:gap-3 items-end pt-3">
          {/* 2nd Place */}
          {topThree[1] && (
            <div className="bg-white rounded-2xl p-3 sm:p-4 border border-slate-200 shadow-xs flex flex-col items-center text-center relative order-1 sm:order-1">
              <div className="absolute -top-3 w-6 h-6 rounded-full bg-slate-200 text-slate-700 font-extrabold text-[11px] flex items-center justify-center border border-slate-300">
                2
              </div>
              <div
                className="w-11 h-11 sm:w-12 sm:h-12 rounded-full flex items-center justify-center text-white font-bold text-sm shadow-2xs mb-2 mt-1"
                style={{ backgroundColor: topThree[1].avatarColor || '#64748B' }}
              >
                {topThree[1].displayName.charAt(0)}
              </div>
              <h4 className="text-xs sm:text-sm font-bold text-slate-900 truncate max-w-full">
                {topThree[1].displayName}
              </h4>
              <p className="text-[10px] text-slate-500 truncate max-w-full">
                {topThree[1].role}
              </p>
              <div className="mt-2 px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-800 text-xs font-black">
                {topThree[1].totalPoints} pts
              </div>
            </div>
          )}

          {/* 1st Place (Center & Prominent) */}
          {topThree[0] && (
            <div className="bg-gradient-to-b from-amber-50 to-white rounded-2xl p-3.5 sm:p-5 border-2 border-amber-300 shadow-md flex flex-col items-center text-center relative order-2 sm:order-2 -mt-2">
              <div className="absolute -top-3.5 px-2 py-0.5 rounded-full bg-amber-500 text-white font-extrabold text-[10px] flex items-center gap-1 shadow-xs uppercase tracking-wider">
                👑 Rank 1
              </div>
              <div
                className="w-13 h-13 sm:w-15 sm:h-15 rounded-full flex items-center justify-center text-white font-bold text-base shadow-sm ring-4 ring-amber-200 mb-2 mt-1"
                style={{ backgroundColor: topThree[0].avatarColor || '#F59E0B' }}
              >
                {topThree[0].displayName.charAt(0)}
              </div>
              <h4 className="text-xs sm:text-sm font-extrabold text-slate-900 truncate max-w-full">
                {topThree[0].displayName}
              </h4>
              <p className="text-[10px] text-amber-800 font-medium truncate max-w-full">
                {topThree[0].role}
              </p>
              <div className="mt-2 px-3 py-1 rounded-full bg-amber-500 text-white text-xs sm:text-sm font-black shadow-xs">
                ⭐ {topThree[0].totalPoints} pts
              </div>
            </div>
          )}

          {/* 3rd Place */}
          {topThree[2] && (
            <div className="bg-white rounded-2xl p-3 sm:p-4 border border-slate-200 shadow-xs flex flex-col items-center text-center relative order-3 sm:order-3">
              <div className="absolute -top-3 w-6 h-6 rounded-full bg-orange-100 text-orange-800 font-extrabold text-[11px] flex items-center justify-center border border-orange-300">
                3
              </div>
              <div
                className="w-11 h-11 sm:w-12 sm:h-12 rounded-full flex items-center justify-center text-white font-bold text-sm shadow-2xs mb-2 mt-1"
                style={{ backgroundColor: topThree[2].avatarColor || '#F97316' }}
              >
                {topThree[2].displayName.charAt(0)}
              </div>
              <h4 className="text-xs sm:text-sm font-bold text-slate-900 truncate max-w-full">
                {topThree[2].displayName}
              </h4>
              <p className="text-[10px] text-slate-500 truncate max-w-full">
                {topThree[2].role}
              </p>
              <div className="mt-2 px-2.5 py-0.5 rounded-full bg-orange-50 text-orange-800 text-xs font-black">
                {topThree[2].totalPoints} pts
              </div>
            </div>
          )}
        </div>
      )}

      {/* Search and Helper Filter */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-2">
        <div className="flex items-center gap-2">
          <h3 className="text-sm font-bold text-slate-900">All Team Rankings</h3>
          <span className="text-xs text-slate-500">({leaderboard.length} employees)</span>
        </div>

        <div className="flex items-center gap-2">
          <div className="relative flex-1 sm:w-60">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search member or role..."
              className="w-full pl-8 pr-3 py-1.5 rounded-xl border border-slate-200 bg-white text-xs placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          {leaderboard.length <= 1 && (
            <button
              onClick={onSeedSampleData}
              disabled={isSeeding}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 border border-slate-300 text-xs font-semibold text-slate-700 transition-colors cursor-pointer flex-shrink-0"
              title="Populate team members and completed tasks in Firestore"
            >
              <Database className="w-3.5 h-3.5 text-slate-500" />
              <span>{isSeeding ? 'Loading sample...' : 'Seed Sample Team'}</span>
            </button>
          )}
        </div>
      </div>

      {/* Full Leaderboard List */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs divide-y divide-slate-100 overflow-hidden">
        {filtered.length > 0 ? (
          filtered.map((member) => (
            <div
              key={member.userId}
              className={`p-3.5 sm:p-4 flex items-center justify-between gap-3 transition-colors ${
                member.isCurrentUser
                  ? 'bg-indigo-50/70 hover:bg-indigo-50'
                  : 'hover:bg-slate-50/80'
              }`}
            >
              <div className="flex items-center gap-3 min-w-0">
                {/* Rank Badge */}
                {getRankBadge(member.rank)}

                {/* Avatar */}
                <div
                  className="w-10 h-10 rounded-full flex items-center justify-center text-white font-bold text-xs shadow-2xs flex-shrink-0 relative"
                  style={{ backgroundColor: member.avatarColor || '#6366F1' }}
                >
                  {member.photoURL ? (
                    <img
                      src={member.photoURL}
                      alt={member.displayName}
                      className="w-full h-full rounded-full object-cover"
                    />
                  ) : (
                    member.displayName.charAt(0).toUpperCase()
                  )}
                  {member.isCurrentUser && (
                    <span className="absolute -bottom-1 -right-1 w-3.5 h-3.5 bg-indigo-600 rounded-full border-2 border-white" />
                  )}
                </div>

                {/* Details */}
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-bold text-slate-900 truncate">
                      {member.displayName}
                    </span>
                    {member.isCurrentUser && (
                      <span className="px-1.5 py-0.2 rounded-md bg-indigo-600 text-white text-[10px] font-extrabold uppercase tracking-wide">
                        You
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-1.5 text-xs text-slate-500 truncate">
                    <span className="truncate">{member.role}</span>
                    <span>•</span>
                    <span className="text-[11px] text-slate-400">{member.department}</span>
                  </div>
                </div>
              </div>

              {/* Stats & Points pill */}
              <div className="flex items-center gap-3 flex-shrink-0 text-right">
                <div className="hidden sm:block text-right">
                  <div className="text-xs font-semibold text-slate-700">
                    {member.completedTasksCount} done
                  </div>
                  <div className="text-[10px] text-slate-400">
                    {member.pendingTasksCount} pending
                  </div>
                </div>

                {/* Big Points Pill */}
                <div className="flex items-center gap-1 px-3 py-1.5 rounded-xl bg-amber-50 border border-amber-200 text-amber-900 text-xs sm:text-sm font-black shadow-2xs">
                  <Sparkles className="w-3.5 h-3.5 text-amber-500 fill-amber-500" />
                  <span>{member.totalPoints} pts</span>
                </div>
              </div>
            </div>
          ))
        ) : (
          <div className="text-center py-10 px-4">
            <p className="text-xs text-slate-500">No team members match "{search}"</p>
          </div>
        )}
      </div>

      {/* Rules & Calculation info footer */}
      <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 flex items-start gap-2.5 text-xs text-slate-600">
        <Info className="w-4 h-4 text-indigo-600 flex-shrink-0 mt-0.5" />
        <div className="space-y-0.5">
          <p className="font-semibold text-slate-800">
            How Points &amp; Rankings Work
          </p>
          <p className="text-[11px] text-slate-500 leading-relaxed">
            Every completed task in Cloud Firestore is worth exactly 1 point. Scores are computed on the fly from the persistent task database records. Completed tasks are never cleared automatically, ensuring lifetime accuracy.
          </p>
        </div>
      </div>
    </div>
  );
};
