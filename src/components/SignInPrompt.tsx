import React, { useState } from 'react';
import {
  CheckCircle2,
  Trophy,
  Sparkles,
  ShieldCheck,
  Users,
  ArrowRight,
  Database,
  Flame,
} from 'lucide-react';

interface SignInPromptProps {
  onSignIn: () => Promise<void>;
  onExploreLeaderboard: () => void;
}

export const SignInPrompt: React.FC<SignInPromptProps> = ({
  onSignIn,
  onExploreLeaderboard,
}) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSignIn = async () => {
    setLoading(true);
    setError(null);
    try {
      await onSignIn();
    } catch (err: any) {
      if (err?.code !== 'auth/popup-closed-by-user') {
        setError(err?.message || 'Failed to sign in with Google');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto py-8 sm:py-12 px-4 space-y-6">
      {/* Hero Card */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/90 shadow-xl text-center relative overflow-hidden">
        {/* Glow */}
        <div className="absolute -top-12 -right-12 w-36 h-36 bg-indigo-500/10 rounded-full blur-2xl pointer-events-none" />

        <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-indigo-600 to-blue-600 text-white flex items-center justify-center mx-auto mb-4 shadow-md">
          <CheckCircle2 className="w-8 h-8 stroke-[2.5]" />
        </div>

        <span className="inline-block px-3 py-1 rounded-full bg-indigo-50 text-indigo-700 text-xs font-bold uppercase tracking-wider mb-2 border border-indigo-100">
          Small Business Task Tracker
        </span>

        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight leading-tight">
          Apex Peak Works
        </h1>
        <p className="text-xs sm:text-sm text-slate-600 mt-2 max-w-xs mx-auto leading-relaxed">
          Sign in with your Google account to track your daily tasks, earn points on completion, and compete on the live team leaderboard.
        </p>

        {error && (
          <div className="mt-4 p-3 rounded-xl bg-red-50 border border-red-200 text-xs text-red-700 text-left">
            {error}
          </div>
        )}

        {/* Google Sign-in Button */}
        <div className="mt-6 space-y-2.5">
          <button
            onClick={handleSignIn}
            disabled={loading}
            className="w-full py-3.5 px-4 rounded-2xl bg-white hover:bg-slate-50 border border-slate-300 text-slate-800 font-bold text-sm shadow-xs hover:shadow transition-all flex items-center justify-center gap-3 cursor-pointer group disabled:opacity-50"
          >
            {/* Google SVG Icon */}
            <svg className="w-5 h-5 flex-shrink-0" viewBox="0 0 24 24">
              <path
                fill="#4285F4"
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
              />
              <path
                fill="#34A853"
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
              />
              <path
                fill="#FBBC05"
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
              />
              <path
                fill="#EA4335"
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
              />
            </svg>
            <span>{loading ? 'Signing in with Google...' : 'Continue with Google'}</span>
          </button>

          <button
            onClick={onExploreLeaderboard}
            className="w-full py-2.5 px-4 rounded-xl text-xs font-semibold text-indigo-600 hover:text-indigo-800 hover:bg-indigo-50 transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
          >
            <Trophy className="w-3.5 h-3.5 text-amber-500" />
            <span>View Team Leaderboard as Guest</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Feature Highlights */}
        <div className="mt-8 pt-6 border-t border-slate-100 grid grid-cols-2 gap-3 text-left">
          <div className="p-3 rounded-xl bg-slate-50 border border-slate-100">
            <Sparkles className="w-4 h-4 text-amber-500 mb-1" />
            <h4 className="text-xs font-bold text-slate-800">1 Pt per Task</h4>
            <p className="text-[11px] text-slate-500 leading-tight mt-0.5">
              Completed tasks instantly score 1 point.
            </p>
          </div>
          <div className="p-3 rounded-xl bg-slate-50 border border-slate-100">
            <Database className="w-4 h-4 text-indigo-500 mb-1" />
            <h4 className="text-xs font-bold text-slate-800">Persistent Data</h4>
            <p className="text-[11px] text-slate-500 leading-tight mt-0.5">
              100% stored in Cloud Firestore.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
