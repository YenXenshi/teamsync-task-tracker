import React, { useState } from 'react';
import {
  X,
  User,
  Mail,
  Briefcase,
  Building,
  Sparkles,
  LogOut,
  Database,
  CheckCircle2,
  Save,
} from 'lucide-react';
import { UserProfile } from '../types';

interface UserProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  profile: UserProfile | null;
  myPoints: number;
  completedTasksCount: number;
  totalTasksCount: number;
  onUpdateProfile: (name: string, role: string, department: string) => Promise<void>;
  onSignOut: () => Promise<void>;
}

export const UserProfileModal: React.FC<UserProfileModalProps> = ({
  isOpen,
  onClose,
  profile,
  myPoints,
  completedTasksCount,
  totalTasksCount,
  onUpdateProfile,
  onSignOut,
}) => {
  if (!isOpen || !profile) return null;

  const [displayName, setDisplayName] = useState(profile.displayName);
  const [role, setRole] = useState(profile.role || 'Team Member');
  const [department, setDepartment] = useState(profile.department || 'Operations');
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!displayName.trim()) return;
    setIsSaving(true);
    setSaveSuccess(false);
    try {
      await onUpdateProfile(displayName.trim(), role.trim(), department.trim());
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 2000);
    } finally {
      setIsSaving(false);
    }
  };

  const completionRate =
    totalTasksCount > 0 ? Math.round((completedTasksCount / totalTasksCount) * 100) : 0;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs">
      <div className="w-full max-w-md bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="p-5 bg-gradient-to-br from-indigo-900 to-slate-900 text-white relative">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-1.5 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors cursor-pointer"
            aria-label="Close"
          >
            <X className="w-4 h-4" />
          </button>

          <div className="flex items-center gap-3.5">
            <div
              className="w-14 h-14 rounded-2xl flex items-center justify-center text-white text-xl font-black shadow-md border-2 border-white/20"
              style={{ backgroundColor: profile.avatarColor || '#6366F1' }}
            >
              {profile.photoURL ? (
                <img
                  src={profile.photoURL}
                  alt={profile.displayName}
                  className="w-full h-full rounded-2xl object-cover"
                />
              ) : (
                profile.displayName.charAt(0).toUpperCase()
              )}
            </div>

            <div className="min-w-0">
              <h2 className="text-base font-bold truncate leading-snug">
                {profile.displayName}
              </h2>
              <p className="text-xs text-indigo-200 truncate">{profile.email}</p>
              <div className="mt-1 inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-amber-400/20 text-amber-300 text-[11px] font-bold border border-amber-300/30">
                <Sparkles className="w-3 h-3 text-amber-400 fill-amber-400" />
                <span>{myPoints} Points Earned</span>
              </div>
            </div>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-3 divide-x divide-slate-100 bg-slate-50 border-b border-slate-200 py-3 text-center text-xs">
          <div>
            <span className="text-[10px] font-bold uppercase text-slate-400 block">
              Total Points
            </span>
            <span className="text-base font-black text-indigo-700">⭐ {myPoints}</span>
          </div>
          <div>
            <span className="text-[10px] font-bold uppercase text-slate-400 block">
              Completed
            </span>
            <span className="text-base font-black text-emerald-600">
              {completedTasksCount}
            </span>
          </div>
          <div>
            <span className="text-[10px] font-bold uppercase text-slate-400 block">
              Success Rate
            </span>
            <span className="text-base font-black text-slate-800">{completionRate}%</span>
          </div>
        </div>

        {/* Edit Form */}
        <form onSubmit={handleSave} className="p-5 space-y-3.5">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Display Name (Sample / Employee Name)
            </label>
            <div className="relative">
              <User className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                required
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                className="w-full pl-8 pr-3 py-2 rounded-xl border border-slate-300 text-xs focus:ring-2 focus:ring-indigo-500 focus:outline-none"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Business Role
              </label>
              <div className="relative">
                <Briefcase className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={role}
                  onChange={(e) => setRole(e.target.value)}
                  placeholder="e.g. Operations Lead"
                  className="w-full pl-8 pr-3 py-2 rounded-xl border border-slate-300 text-xs focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Department
              </label>
              <div className="relative">
                <Building className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={department}
                  onChange={(e) => setDepartment(e.target.value)}
                  placeholder="e.g. Logistics"
                  className="w-full pl-8 pr-3 py-2 rounded-xl border border-slate-300 text-xs focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                />
              </div>
            </div>
          </div>

          {/* Database Identity Verification */}
          <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200 text-[11px] text-slate-600 flex items-center justify-between">
            <div className="flex items-center gap-1.5 truncate">
              <Database className="w-3.5 h-3.5 text-indigo-500 flex-shrink-0" />
              <span className="font-mono truncate">UID: {profile.uid}</span>
            </div>
            <span className="text-[10px] text-slate-400 flex-shrink-0 font-medium">
              Firestore Doc
            </span>
          </div>

          {saveSuccess && (
            <p className="text-xs font-semibold text-emerald-600 flex items-center gap-1">
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>Profile updated in Firestore!</span>
            </p>
          )}

          <div className="pt-2 flex items-center justify-between gap-3">
            <button
              type="button"
              onClick={onSignOut}
              className="px-3.5 py-2 rounded-xl text-xs font-semibold text-red-600 hover:bg-red-50 transition-colors flex items-center gap-1.5 cursor-pointer"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>Sign Out</span>
            </button>

            <button
              type="submit"
              disabled={isSaving}
              className="px-5 py-2 rounded-xl text-xs font-bold bg-indigo-600 hover:bg-indigo-700 text-white shadow-xs transition-colors flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
            >
              <Save className="w-3.5 h-3.5" />
              <span>{isSaving ? 'Saving...' : 'Save Profile'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
