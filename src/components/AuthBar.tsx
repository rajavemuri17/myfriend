import { useState, useEffect } from 'react';
import { User } from 'firebase/auth';
import { auth, loginWithGoogle, logoutUser, onAuthStateChanged, loadUserProfile, saveUserProfile } from '../lib/firebase';
import { Cloud, LogIn, LogOut, Check, Sparkles, Loader2 } from 'lucide-react';

interface AuthBarProps {
  currentLanguage: string;
  currentVoice: string;
  onPreferencesLoaded?: (prefs: { preferredLanguage?: string; preferredVoice?: string }) => void;
}

export function AuthBar({ currentLanguage, currentVoice, onPreferencesLoaded }: AuthBarProps) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [syncing, setSyncing] = useState<boolean>(false);
  const [showProfileMenu, setShowProfileMenu] = useState<boolean>(false);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser: User | null) => {
      setUser(currentUser);
      setLoading(false);
      if (currentUser) {
        // Load stored cloud preferences
        try {
          const profile = await loadUserProfile(currentUser.uid);
          if (profile && onPreferencesLoaded) {
            onPreferencesLoaded({
              preferredLanguage: profile.preferredLanguage,
              preferredVoice: profile.preferredVoice,
            });
          }
        } catch (e) {
          console.warn('Could not load user profile:', e);
        }
      }
    });

    return () => unsubscribe();
  }, [onPreferencesLoaded]);

  // Sync preference updates to Firestore when user changes language or voice
  useEffect(() => {
    if (!user) return;
    const syncPrefs = async () => {
      setSyncing(true);
      try {
        await saveUserProfile(user.uid, {
          userId: user.uid,
          email: user.email || '',
          preferredLanguage: currentLanguage,
          preferredVoice: currentVoice,
          updatedAt: new Date().toISOString(),
        });
      } catch (err) {
        console.warn('Failed to sync profile preferences:', err);
      } finally {
        setSyncing(false);
      }
    };
    const t = setTimeout(syncPrefs, 1000);
    return () => clearTimeout(t);
  }, [currentLanguage, currentVoice, user]);

  const handleLogin = async () => {
    try {
      setLoading(true);
      await loginWithGoogle();
    } catch (err) {
      console.error('Login error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    try {
      await logoutUser();
      setShowProfileMenu(false);
    } catch (err) {
      console.error('Logout error:', err);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-slate-800/40 text-slate-400 text-xs">
        <Loader2 className="w-3.5 h-3.5 animate-spin" />
      </div>
    );
  }

  if (!user) {
    return (
      <button
        onClick={handleLogin}
        className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-gradient-to-r from-amber-500/20 to-rose-500/20 hover:from-amber-500/30 hover:to-rose-500/30 border border-amber-500/40 text-amber-200 text-xs font-medium transition cursor-pointer"
        title="Sign in with Google to sync companion settings & history"
      >
        <LogIn className="w-3.5 h-3.5 text-amber-400" />
        <span className="hidden sm:inline">Sign In</span>
      </button>
    );
  }

  return (
    <div className="relative">
      <button
        onClick={() => setShowProfileMenu((prev) => !prev)}
        className="flex items-center gap-2 p-1 pl-2 pr-2.5 rounded-full bg-slate-800/70 border border-slate-700 hover:border-slate-600 transition cursor-pointer"
      >
        {user.photoURL ? (
          <img
            src={user.photoURL}
            alt={user.displayName || 'User'}
            className="w-6 h-6 rounded-full object-cover border border-amber-400/40"
          />
        ) : (
          <div className="w-6 h-6 rounded-full bg-gradient-to-tr from-amber-500 to-rose-500 text-[10px] font-bold text-slate-950 flex items-center justify-center">
            {user.displayName?.charAt(0) || user.email?.charAt(0) || 'U'}
          </div>
        )}
        <span className="text-xs font-medium text-slate-200 max-w-[80px] sm:max-w-[110px] truncate hidden sm:inline">
          {user.displayName || user.email?.split('@')[0]}
        </span>
        <Cloud className={`w-3.5 h-3.5 ${syncing ? 'text-amber-400 animate-pulse' : 'text-emerald-400'}`} />
      </button>

      {showProfileMenu && (
        <div className="absolute right-0 top-full mt-2 z-50 w-64 rounded-2xl bg-slate-900 border border-slate-700 shadow-2xl p-4 text-slate-100 animate-in fade-in zoom-in-95 duration-150">
          <div className="flex items-center gap-3 pb-3 border-b border-slate-800">
            {user.photoURL ? (
              <img src={user.photoURL} alt="" className="w-10 h-10 rounded-full" />
            ) : (
              <div className="w-10 h-10 rounded-full bg-amber-500/20 text-amber-300 font-bold flex items-center justify-center">
                {user.displayName?.charAt(0) || 'U'}
              </div>
            )}
            <div className="overflow-hidden">
              <div className="font-semibold text-xs text-white truncate">{user.displayName || 'Companion Friend'}</div>
              <div className="text-[11px] text-slate-400 truncate">{user.email}</div>
            </div>
          </div>

          <div className="py-2.5 space-y-1.5 text-xs text-slate-300">
            <div className="flex items-center justify-between text-[11px] text-slate-400">
              <span className="flex items-center gap-1.5">
                <Check className="w-3.5 h-3.5 text-emerald-400" /> Firestore Cloud Sync
              </span>
              <span className="text-emerald-400 font-medium">Active</span>
            </div>
            <div className="flex items-center justify-between text-[11px] text-slate-400">
              <span className="flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-amber-400" /> Offline Persistence
              </span>
              <span className="text-amber-300 font-medium">Enabled</span>
            </div>
          </div>

          <div className="pt-2 border-t border-slate-800">
            <button
              onClick={handleLogout}
              className="w-full flex items-center justify-center gap-2 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-rose-300 text-xs font-medium transition cursor-pointer"
            >
              <LogOut className="w-3.5 h-3.5" /> Sign Out
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
