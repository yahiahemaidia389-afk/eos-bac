import React, { createContext, useContext, useState, useEffect } from 'react';
import { UserAccount, UserRole, StreamType } from '../types';
import { supabase, isSupabaseConfigured } from '../lib/supabase';
import { Language } from '../i18n/types';
import { getAuthRedirectUrl } from '../lib/authRedirect';

// Initial fallback users for local state
const INITIAL_USERS: UserAccount[] = [
  {
    id: 'usr-admin-1',
    full_name: 'Administrateur EOS BAC',
    email: 'admin@eosbac.dz',
    role: 'admin',
    stream: 'sciences_experimentales',
    language: 'fr',
    avatar_url: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=256&q=80',
    created_at: '2026-09-01T10:00:00Z',
  },
];

interface AuthContextType {
  currentUser: UserAccount | null;
  role: UserRole;
  isAdmin: boolean;
  isStudent: boolean;
  users: UserAccount[];
  isLoadingUsers: boolean;
  refreshUsers: () => Promise<void>;
  showStudentOnboarding: boolean;
  setShowStudentOnboarding: (show: boolean) => void;
  completeStudentOnboarding: (data: {
    stream: StreamType;
    dream: string;
    goal: string;
    targetScore?: string;
    studyFocus?: string;
  }) => Promise<void>;
  showStreamOnboarding: boolean;
  setShowStreamOnboarding: (show: boolean) => void;
  completeStreamOnboarding: (stream: StreamType) => Promise<void>;
  login: (email: string, password?: string) => Promise<{ success: boolean; user?: UserAccount; error?: string }>;
  signup: (data: {
    fullName: string;
    email: string;
    password?: string;
    stream: StreamType;
    language?: Language;
  }) => Promise<{ success: boolean; user?: UserAccount; requiresVerification?: boolean; error?: string }>;
  resetPassword: (email: string) => Promise<{ success: boolean; error?: string }>;
  updatePassword: (newPassword: string) => Promise<{ success: boolean; error?: string }>;
  resendVerificationEmail: (email: string) => Promise<{ success: boolean; error?: string }>;
  isRecoveryMode: boolean;
  setIsRecoveryMode: (active: boolean) => void;
  loginWithGoogle: () => Promise<{ success: boolean; error?: string }>;
  logout: () => Promise<void>;
  promoteUserToAdmin: (targetUserId: string) => Promise<{ success: boolean; error?: string }>;
  demoteAdminToStudent: (targetUserId: string) => Promise<{ success: boolean; error?: string }>;
  updateCurrentUserProfile: (data: {
    fullName?: string;
    stream?: StreamType;
    language?: Language;
    avatarUrl?: string;
    dream?: string;
    goal?: string;
    targetScore?: string;
    studyFocus?: string;
  }) => Promise<{ success: boolean; error?: string }>;
  switchAccountForTesting: (userId: string) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Load users list from local storage or use initial seed
  const [users, setUsers] = useState<UserAccount[]>(() => {
    const saved = localStorage.getItem('eosbac_users') || localStorage.getItem('bacnext_users');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch {
        return INITIAL_USERS;
      }
    }
    return INITIAL_USERS;
  });

  const [isLoadingUsers, setIsLoadingUsers] = useState<boolean>(false);

  // Load current session
  const [currentUser, setCurrentUser] = useState<UserAccount | null>(() => {
    // Check if user was explicitly logged out
    const wasLoggedOut =
      localStorage.getItem('eosbac_logged_out') === 'true' ||
      localStorage.getItem('bacnext_logged_out') === 'true';
    if (wasLoggedOut) {
      return null;
    }
    const saved = localStorage.getItem('eosbac_current_user') || localStorage.getItem('bacnext_current_user');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (parsed && parsed.id) return parsed;
      } catch {
        return null;
      }
    }
    // Anonymous unauthenticated user by default
    return null;
  });

  // Password Recovery Detection Mode
  const [isRecoveryMode, setIsRecoveryMode] = useState<boolean>(() => {
    if (typeof window !== 'undefined') {
      const hash = window.location.hash || '';
      const search = window.location.search || '';
      return hash.includes('type=recovery') || search.includes('type=recovery');
    }
    return false;
  });

  // State to trigger the student onboarding modal for new students
  const [showStudentOnboarding, setShowStudentOnboarding] = useState<boolean>(() => {
    const pending =
      localStorage.getItem('eosbac_pending_student_onboarding') ||
      localStorage.getItem('bacnext_pending_student_onboarding') ||
      localStorage.getItem('eosbac_pending_stream_onboarding') ||
      localStorage.getItem('bacnext_pending_stream_onboarding');
    return pending === 'true';
  });

  const showStreamOnboarding = showStudentOnboarding;
  const setShowStreamOnboarding = setShowStudentOnboarding;

  useEffect(() => {
    if (showStudentOnboarding) {
      localStorage.setItem('eosbac_pending_student_onboarding', 'true');
      localStorage.setItem('bacnext_pending_student_onboarding', 'true');
      localStorage.setItem('eosbac_pending_stream_onboarding', 'true');
      localStorage.setItem('bacnext_pending_stream_onboarding', 'true');
    } else {
      localStorage.removeItem('eosbac_pending_student_onboarding');
      localStorage.removeItem('bacnext_pending_student_onboarding');
      localStorage.removeItem('eosbac_pending_stream_onboarding');
      localStorage.removeItem('bacnext_pending_stream_onboarding');
    }
  }, [showStudentOnboarding]);

  // Save users list to localStorage whenever updated
  useEffect(() => {
    const serialized = JSON.stringify(users);
    localStorage.setItem('eosbac_users', serialized);
    localStorage.setItem('bacnext_users', serialized);
  }, [users]);

  // Save current user to localStorage whenever updated
  useEffect(() => {
    if (currentUser) {
      const serialized = JSON.stringify(currentUser);
      localStorage.setItem('eosbac_current_user', serialized);
      localStorage.setItem('bacnext_current_user', serialized);
      localStorage.setItem('eosbac_role', currentUser.role);
      localStorage.setItem('bacnext_role', currentUser.role);
    } else {
      localStorage.removeItem('eosbac_current_user');
      localStorage.removeItem('bacnext_current_user');
      localStorage.setItem('eosbac_role', 'student');
      localStorage.setItem('bacnext_role', 'student');
    }
  }, [currentUser]);

  const refreshUsersPromiseRef = React.useRef<Promise<void> | null>(null);

  // Synchronize authenticated Supabase user profile with DB profiles table
  const refreshUsers = async (): Promise<void> => {
    if (refreshUsersPromiseRef.current) {
      return refreshUsersPromiseRef.current;
    }

    const task = (async () => {
      setIsLoadingUsers(true);
      try {
        if (isSupabaseConfigured && supabase) {
          // Select only required columns rather than SELECT *
          const { data, error } = await supabase
            .from('profiles')
            .select('id, full_name, email, role, stream, language, avatar_url, dream, goal, target_score, study_focus, onboarding_completed, created_at')
            .order('created_at', { ascending: false });

          if (!error && data && data.length > 0) {
            const mappedUsers: UserAccount[] = data.map((p) => ({
              id: p.id,
              full_name: p.full_name || 'Utilisateur',
              email: p.email || '',
              role: (p.role === 'admin' ? 'admin' : 'student') as UserRole,
              stream: (p.stream as StreamType) || 'sciences_experimentales',
              language: (p.language as Language) || 'fr',
              avatar_url: p.avatar_url,
              dream: p.dream || undefined,
              goal: p.goal || undefined,
              target_score: p.target_score || undefined,
              study_focus: p.study_focus || undefined,
              onboarding_completed: Boolean(p.onboarding_completed),
              created_at: p.created_at,
            }));

            setUsers(mappedUsers);
            const serialized = JSON.stringify(mappedUsers);
            localStorage.setItem('eosbac_users', serialized);
            localStorage.setItem('bacnext_users', serialized);

            // Also keep currentUser synced if changed in Supabase
            const savedCurrent = localStorage.getItem('eosbac_current_user') || localStorage.getItem('bacnext_current_user');
            if (savedCurrent) {
              try {
                const currentObj = JSON.parse(savedCurrent);
                const freshCurrent = mappedUsers.find(
                  (u) =>
                    u.id === currentObj.id ||
                    (u.email && currentObj.email && u.email.toLowerCase() === currentObj.email.toLowerCase())
                );
                if (freshCurrent && (freshCurrent.role !== currentObj.role || freshCurrent.full_name !== currentObj.full_name)) {
                  setCurrentUser(freshCurrent);
                  const freshSerialized = JSON.stringify(freshCurrent);
                  localStorage.setItem('eosbac_current_user', freshSerialized);
                  localStorage.setItem('bacnext_current_user', freshSerialized);
                  localStorage.setItem('eosbac_role', freshCurrent.role);
                  localStorage.setItem('bacnext_role', freshCurrent.role);
                }
              } catch {}
            }
          }
        }
      } catch (err) {
        console.error('Error refreshing users list from Supabase:', err);
      } finally {
        setIsLoadingUsers(false);
        refreshUsersPromiseRef.current = null;
      }
    })();

    refreshUsersPromiseRef.current = task;
    return task;
  };

  // Synchronize authenticated Supabase user profile with DB profiles table
  const syncSupabaseUserProfile = async (authUser: any): Promise<UserAccount | null> => {
    if (!supabase) return null;

    try {
      // 1. Detect the authenticated Supabase user (authUser)
      // 2. Check whether a profile already exists
      const { data: profile, error: profileErr } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', authUser.id)
        .maybeSingle();

      let userProfile = profile;

      // Also check by email to prevent creating duplicate profiles if user previously registered with email
      if (!userProfile && authUser.email) {
        const { data: profileByEmail } = await supabase
          .from('profiles')
          .select('*')
          .ilike('email', authUser.email)
          .maybeSingle();
        if (profileByEmail) {
          userProfile = profileByEmail;
        }
      }

      const googleName =
        authUser.user_metadata?.full_name ||
        authUser.user_metadata?.name ||
        authUser.email?.split('@')[0] ||
        'Élève EOS BAC';

      const googleAvatar =
        authUser.user_metadata?.avatar_url ||
        authUser.user_metadata?.picture ||
        null;

      // 3. If the profile does not exist:
      //    - create the profile
      //    - use the Google user's name
      //    - use the Google user's email
      //    - use the Google avatar if available
      //    - set role = "student"
      // 4. Never allow Google users to choose "admin"
      if (!userProfile) {
        const newProfileData = {
          id: authUser.id,
          full_name: googleName,
          email: authUser.email || '',
          role: 'student', // ALWAYS student! Never allow admin for Google users!
          stream: null, // No stream chosen yet -> triggers stream onboarding
          language: 'fr',
          avatar_url: googleAvatar,
          created_at: new Date().toISOString(),
        };

        const { data: inserted, error: insertErr } = await supabase
          .from('profiles')
          .insert([newProfileData])
          .select()
          .maybeSingle();

        if (insertErr) {
          // In case DB trigger handle_new_user() created it concurrently:
          const { data: refetched } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', authUser.id)
            .maybeSingle();
          userProfile = refetched || newProfileData;
        } else {
          userProfile = inserted || newProfileData;
        }
      }

      // 5. If profile already exists, do not create a duplicate.
      // 6. Load the existing role, stream, language and progress.
      const resolvedRole: UserRole = userProfile.role === 'admin' ? 'admin' : 'student';
      const loadedAccount: UserAccount = {
        id: authUser.id,
        full_name: userProfile.full_name || googleName,
        email: authUser.email || userProfile.email,
        role: resolvedRole,
        stream: (userProfile.stream as StreamType) || (null as any),
        language: (userProfile.language as Language) || 'fr',
        avatar_url: userProfile.avatar_url || googleAvatar,
        dream: userProfile.dream || undefined,
        goal: userProfile.goal || undefined,
        target_score: userProfile.target_score || undefined,
        study_focus: userProfile.study_focus || undefined,
        onboarding_completed: Boolean(userProfile.onboarding_completed),
        created_at: userProfile.created_at || new Date().toISOString(),
      };

      setCurrentUser(loadedAccount);
      setUsers((prev) => {
        const idx = prev.findIndex(
          (u) =>
            u.id === loadedAccount.id ||
            (u.email && loadedAccount.email && u.email.toLowerCase() === loadedAccount.email.toLowerCase())
        );
        if (idx >= 0) {
          const next = [...prev];
          next[idx] = loadedAccount;
          return next;
        }
        return [...prev, loadedAccount];
      });

      // 9. First-Time Detection: If a student hasn't completed onboarding or has no stream:
      // Show the student onboarding experience (stream, dream, goal)
      if (resolvedRole === 'student' && (!userProfile.onboarding_completed || !userProfile.stream || userProfile.stream === '')) {
        setShowStudentOnboarding(true);
      } else {
        setShowStudentOnboarding(false);
      }

      // Clear any prior logged-out indicator
      try {
        localStorage.removeItem('bacnext_logged_out');
      } catch {}

      // Clean up OAuth tokens or callback codes from the browser address bar for a pristine URL
      if (typeof window !== 'undefined' && (window.location.hash || window.location.search)) {
        if (
          window.location.hash.includes('access_token') ||
          window.location.hash.includes('refresh_token') ||
          window.location.search.includes('code=') ||
          window.location.search.includes('error=')
        ) {
          window.history.replaceState(null, '', window.location.pathname);
        }
      }

      return loadedAccount;
    } catch (err) {
      console.error('Error synchronizing Supabase profile:', err);
      return null;
    }
  };

  // Handle Supabase OAuth session and Auth State Listener
  useEffect(() => {
    const client = supabase;
    if (!isSupabaseConfigured || !client) return;

    // 1. Initial fetch of existing profiles
    refreshUsers();

    // 2. Check active session immediately on mount (handles Google OAuth callback redirects and recovery)
    client.auth.getSession().then(({ data: { session } }) => {
      const isRecovery =
        typeof window !== 'undefined' &&
        (window.location.hash.includes('type=recovery') || window.location.search.includes('type=recovery'));
      if (isRecovery) {
        setIsRecoveryMode(true);
      } else if (session?.user) {
        syncSupabaseUserProfile(session.user);
      } else {
        // If Supabase has no active session and local storage was not explicitly restored, ensure null
        const saved = localStorage.getItem('eosbac_current_user') || localStorage.getItem('bacnext_current_user');
        if (!saved) {
          setCurrentUser(null);
        }
      }
    });

    // 3. Real-time auth state listener (OAuth callbacks, login, logout, token refresh, password recovery)
    const { data: { subscription } } = client.auth.onAuthStateChange(async (event, session) => {
      if (event === 'PASSWORD_RECOVERY') {
        setIsRecoveryMode(true);
      } else if (
        session?.user &&
        (event === 'SIGNED_IN' ||
          event === 'INITIAL_SESSION' ||
          event === 'USER_UPDATED' ||
          event === 'TOKEN_REFRESHED')
      ) {
        if (!isRecoveryMode && !window.location.hash.includes('type=recovery')) {
          await syncSupabaseUserProfile(session.user);
        }
      } else if (event === 'SIGNED_OUT') {
        setCurrentUser(null);
        setShowStreamOnboarding(false);
        setIsRecoveryMode(false);
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const role: UserRole = currentUser ? currentUser.role : 'student';
  const isAdmin = role === 'admin';
  const isStudent = role === 'student';

  // LOGIN
  const login = async (
    email: string,
    password?: string
  ): Promise<{ success: boolean; user?: UserAccount; error?: string }> => {
    const cleanEmail = email.trim().toLowerCase();

    if (!cleanEmail || !password) {
      return { success: false, error: 'Veuillez saisir votre email et votre mot de passe.' };
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(cleanEmail)) {
      return { success: false, error: "Format d'adresse email invalide." };
    }

    // If Supabase is active, authenticate with Supabase
    if (isSupabaseConfigured && supabase) {
      try {
        const { data, error } = await supabase.auth.signInWithPassword({
          email: cleanEmail,
          password: password,
        });
        if (error) {
          const msg = error.message.toLowerCase();
          if (msg.includes('invalid login credentials') || msg.includes('invalid credentials')) {
            return { success: false, error: 'Email ou mot de passe incorrect.' };
          }
          if (msg.includes('email not confirmed')) {
            return { success: false, error: 'Veuillez confirmer votre adresse email avant de vous connecter.' };
          }
          if (error.status === 429 || msg.includes('rate limit')) {
            return { success: false, error: 'Trop de tentatives. Veuillez patienter avant de réessayer.' };
          }
          return { success: false, error: error.message };
        }
        if (data.user) {
          const loadedUser = await syncSupabaseUserProfile(data.user);
          if (loadedUser) {
            return { success: true, user: loadedUser };
          }
        }
      } catch (err: any) {
        return { success: false, error: err.message || 'Erreur de connexion.' };
      }
    }

    // Local state fallback for offline development
    const matchedUser = users.find((u) => u.email.toLowerCase() === cleanEmail);
    if (matchedUser) {
      localStorage.removeItem('bacnext_logged_out');
      localStorage.removeItem('eosbac_logged_out');
      localStorage.setItem('bacnext_current_user', JSON.stringify(matchedUser));
      localStorage.setItem('eosbac_current_user', JSON.stringify(matchedUser));
      setCurrentUser(matchedUser);
      return { success: true, user: matchedUser };
    }

    return { success: false, error: 'Compte introuvable. Veuillez vérifier vos identifiants.' };
  };

  // SIGNUP
  // MANDATORY SECURITY RULE: Public signup ONLY creates accounts with role = 'student'.
  // No public user can ever self-assign the admin role.
  const signup = async ({
    fullName,
    email,
    password,
    stream,
    language = 'fr',
  }: {
    fullName: string;
    email: string;
    password?: string;
    stream: StreamType;
    language?: Language;
  }): Promise<{ success: boolean; user?: UserAccount; requiresVerification?: boolean; error?: string }> => {
    const cleanEmail = email.trim().toLowerCase();
    const cleanName = fullName.trim();

    if (!cleanName || cleanName.length < 2) {
      return { success: false, error: 'Veuillez renseigner votre nom complet (au moins 2 caractères).' };
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!cleanEmail || !emailRegex.test(cleanEmail)) {
      return { success: false, error: "Format d'adresse email invalide." };
    }

    if (!password || password.length < 6) {
      return { success: false, error: 'Le mot de passe doit comporter au moins 6 caractères.' };
    }

    // If Supabase is active, register with Supabase Auth
    if (isSupabaseConfigured && supabase) {
      try {
        const { data, error } = await supabase.auth.signUp({
          email: cleanEmail,
          password,
          options: {
            data: {
              full_name: cleanName,
              stream,
              language,
            },
            emailRedirectTo: getAuthRedirectUrl(),
          },
        });

        if (error) {
          const msg = error.message.toLowerCase();
          if (
            msg.includes('already registered') ||
            msg.includes('already exists') ||
            msg.includes('user already exists')
          ) {
            return { success: false, error: 'Un compte avec cette adresse email existe déjà.' };
          }
          if (error.status === 429 || msg.includes('rate limit')) {
            return { success: false, error: 'Trop de tentatives. Veuillez patienter un instant avant de réessayer.' };
          }
          return { success: false, error: error.message };
        }

        if (data.user) {
          // Supabase duplicate check for existing identities
          if (data.user.identities && data.user.identities.length === 0) {
            return { success: false, error: 'Un compte avec cette adresse email existe déjà.' };
          }

          // If email verification is required and no session yet
          if (!data.session) {
            return { success: true, requiresVerification: true };
          }

          const synced = await syncSupabaseUserProfile(data.user);
          setShowStudentOnboarding(true);
          return { success: true, user: synced || undefined };
        }
      } catch (err: any) {
        return { success: false, error: err.message || 'Erreur lors de la création du compte.' };
      }
    }

    // Local state fallback for offline development
    const existingUser = users.find((u) => u.email.toLowerCase() === cleanEmail);
    if (existingUser) {
      return { success: false, error: 'Un compte avec cette adresse email existe déjà.' };
    }

    // Default role is strictly 'student'
    const newStudentUser: UserAccount = {
      id: `usr-${Date.now()}`,
      full_name: cleanName,
      email: cleanEmail,
      role: 'student', // ALWAYS student!
      stream,
      language,
      avatar_url: `https://api.dicebear.com/7.x/bottts/svg?seed=${encodeURIComponent(cleanName)}`,
      onboarding_completed: false,
      created_at: new Date().toISOString(),
    };

    localStorage.removeItem('bacnext_logged_out');
    localStorage.removeItem('eosbac_logged_out');
    localStorage.setItem('bacnext_current_user', JSON.stringify(newStudentUser));
    localStorage.setItem('eosbac_current_user', JSON.stringify(newStudentUser));
    setUsers((prev) => [...prev, newStudentUser]);
    setCurrentUser(newStudentUser);
    setShowStudentOnboarding(true);

    return { success: true, user: newStudentUser };
  };

  // RESET PASSWORD (Supabase Password Recovery)
  const resetPassword = async (email: string): Promise<{ success: boolean; error?: string }> => {
    const cleanEmail = email.trim().toLowerCase();
    if (!cleanEmail) {
      return { success: false, error: 'Veuillez renseigner votre adresse email.' };
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(cleanEmail)) {
      return { success: false, error: "Format d'adresse email invalide." };
    }

    if (isSupabaseConfigured && supabase) {
      try {
        const redirectUrl = getAuthRedirectUrl();
        const { error } = await supabase.auth.resetPasswordForEmail(cleanEmail, {
          redirectTo: redirectUrl,
        });
        if (error) {
          if (error.status === 429 || error.message.toLowerCase().includes('rate limit')) {
            return { success: false, error: 'Trop de tentatives. Veuillez patienter avant de réessayer.' };
          }
          // Anti-enumeration: Always return success for user privacy
          return { success: true };
        }
        return { success: true };
      } catch (err: any) {
        return { success: true };
      }
    }

    return { success: true };
  };

  // UPDATE PASSWORD (for Password Recovery Flow)
  const updatePassword = async (newPassword: string): Promise<{ success: boolean; error?: string }> => {
    if (!newPassword || newPassword.length < 6) {
      return { success: false, error: 'Le mot de passe doit comporter au moins 6 caractères.' };
    }

    if (!isSupabaseConfigured || !supabase) {
      return { success: false, error: 'Service d’authentification indisponible.' };
    }

    try {
      const { data, error } = await supabase.auth.updateUser({
        password: newPassword,
      });

      if (error) {
        return { success: false, error: error.message };
      }

      if (data.user) {
        await syncSupabaseUserProfile(data.user);
      }

      setIsRecoveryMode(false);

      if (typeof window !== 'undefined') {
        window.history.replaceState(null, '', window.location.pathname);
      }

      return { success: true };
    } catch (err: any) {
      return { success: false, error: err.message || 'Erreur lors de la mise à jour du mot de passe.' };
    }
  };

  // RESEND EMAIL VERIFICATION
  const resendVerificationEmail = async (email: string): Promise<{ success: boolean; error?: string }> => {
    const cleanEmail = email.trim().toLowerCase();
    if (!cleanEmail) {
      return { success: false, error: 'Veuillez saisir votre adresse email.' };
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(cleanEmail)) {
      return { success: false, error: "Format d'adresse email invalide." };
    }

    if (!isSupabaseConfigured || !supabase) {
      return { success: false, error: 'Service d’authentification indisponible.' };
    }

    try {
      const { error } = await supabase.auth.resend({
        type: 'signup',
        email: cleanEmail,
        options: {
          emailRedirectTo: getAuthRedirectUrl(),
        },
      });

      if (error) {
        if (error.status === 429 || error.message.toLowerCase().includes('rate limit')) {
          return { success: false, error: 'Trop de tentatives. Veuillez patienter avant de réessayer.' };
        }
        return { success: false, error: error.message };
      }

      return { success: true };
    } catch (err: any) {
      return { success: false, error: err.message || 'Erreur lors de l’envoi de l’email.' };
    }
  };

  // LOGOUT - Complete Session Destruction
  const logout = async (): Promise<void> => {
    try {
      if (isSupabaseConfigured && supabase) {
        await supabase.auth.signOut();
      }
    } catch (err) {
      console.warn('Supabase signOut error:', err);
    } finally {
      // Clear React auth state
      setCurrentUser(null);
      setShowStudentOnboarding(false);
      setIsRecoveryMode(false);

      // Wipe local storage keys
      try {
        localStorage.removeItem('eosbac_current_user');
        localStorage.removeItem('bacnext_current_user');
        localStorage.setItem('eosbac_logged_out', 'true');
        localStorage.setItem('bacnext_logged_out', 'true');
        localStorage.removeItem('eosbac_pending_student_onboarding');
        localStorage.removeItem('bacnext_pending_student_onboarding');
        localStorage.removeItem('eosbac_pending_stream_onboarding');
        localStorage.removeItem('bacnext_pending_stream_onboarding');
        localStorage.removeItem('eosbac_role');
        localStorage.removeItem('bacnext_role');
        // Clean any cached tokens
        Object.keys(localStorage).forEach((key) => {
          if (key.startsWith('sb-') || key.includes('supabase.auth.token')) {
            localStorage.removeItem(key);
          }
        });
        sessionStorage.clear();
      } catch {}
    }
  };

  // PROMOTE USER TO ADMIN
  // Guarded: Only existing admins can call this!
  const promoteUserToAdmin = async (targetUserId: string): Promise<{ success: boolean; error?: string }> => {
    if (!isAdmin) {
      return { success: false, error: 'Accès refusé. Seul un administrateur peut promouvoir des utilisateurs.' };
    }

    // If Supabase is active, execute RPC or update profile first
    if (isSupabaseConfigured && supabase) {
      try {
        const { error: rpcErr } = await supabase.rpc('promote_user_to_admin', { target_user_id: targetUserId });
        if (rpcErr) {
          // Fallback direct update on profiles
          const { error: updErr } = await supabase.from('profiles').update({ role: 'admin' }).eq('id', targetUserId);
          if (updErr) {
            console.error('Failed to promote user in Supabase:', updErr);
            return { success: false, error: updErr.message };
          }
        }
      } catch (err: any) {
        const { error: updErr } = await supabase.from('profiles').update({ role: 'admin' }).eq('id', targetUserId);
        if (updErr) {
          return { success: false, error: updErr.message || 'Erreur lors de la promotion.' };
        }
      }
    }

    // Only update state after successful database persistence
    setUsers((prev) =>
      prev.map((u) => (u.id === targetUserId ? { ...u, role: 'admin' } : u))
    );

    if (currentUser && currentUser.id === targetUserId) {
      setCurrentUser((prev) => (prev ? { ...prev, role: 'admin' } : null));
    }

    await refreshUsers();
    return { success: true };
  };

  // DEMOTE ADMIN TO STUDENT
  // Guarded: Only admins can call this, and an admin CANNOT demote themselves or the last admin!
  const demoteAdminToStudent = async (targetUserId: string): Promise<{ success: boolean; error?: string }> => {
    if (!isAdmin) {
      return { success: false, error: 'Accès refusé. Seul un administrateur peut modifier les rôles.' };
    }

    if (currentUser && currentUser.id === targetUserId) {
      return {
        success: false,
        error: 'Action interdite : vous ne pouvez pas rétrograder votre propre compte administrateur.',
      };
    }

    const currentAdminsCount = users.filter((u) => u.role === 'admin').length;
    if (currentAdminsCount <= 1) {
      return {
        success: false,
        error: 'Action interdite : impossible de rétrograder le dernier administrateur de la plateforme.',
      };
    }

    // If Supabase is active, execute RPC or update profile first
    if (isSupabaseConfigured && supabase) {
      try {
        const { error: rpcErr } = await supabase.rpc('demote_admin_to_student', { target_user_id: targetUserId });
        if (rpcErr) {
          const { error: updErr } = await supabase.from('profiles').update({ role: 'student' }).eq('id', targetUserId);
          if (updErr) {
            console.error('Failed to demote user in Supabase:', updErr);
            return { success: false, error: updErr.message };
          }
        }
      } catch (err: any) {
        const { error: updErr } = await supabase.from('profiles').update({ role: 'student' }).eq('id', targetUserId);
        if (updErr) {
          return { success: false, error: updErr.message || 'Erreur lors de la modification du rôle.' };
        }
      }
    }

    // Only update state after successful database persistence
    setUsers((prev) =>
      prev.map((u) => (u.id === targetUserId ? { ...u, role: 'student' } : u))
    );

    await refreshUsers();
    return { success: true };
  };

  // Update current user's personal profile (student cannot change their own role)
  const updateCurrentUserProfile = async (data: {
    fullName?: string;
    stream?: StreamType;
    language?: Language;
    avatarUrl?: string;
    dream?: string;
    goal?: string;
    targetScore?: string;
    studyFocus?: string;
  }): Promise<{ success: boolean; error?: string }> => {
    if (!currentUser) {
      return { success: false, error: 'Utilisateur non authentifié' };
    }

    const updatedUser: UserAccount = {
      ...currentUser,
      ...(data.fullName !== undefined ? { full_name: data.fullName.trim() } : {}),
      ...(data.stream !== undefined ? { stream: data.stream } : {}),
      ...(data.language !== undefined ? { language: data.language } : {}),
      ...(data.avatarUrl !== undefined ? { avatar_url: data.avatarUrl.trim() } : {}),
      ...(data.dream !== undefined ? { dream: data.dream.trim() } : {}),
      ...(data.goal !== undefined ? { goal: data.goal.trim() } : {}),
      ...(data.targetScore !== undefined ? { target_score: data.targetScore.trim() } : {}),
      ...(data.studyFocus !== undefined ? { study_focus: data.studyFocus.trim() } : {}),
      // role and id are strictly immutable for students!
    };

    if (isSupabaseConfigured && supabase) {
      try {
        const payload: Record<string, any> = {};
        if (data.fullName !== undefined) payload.full_name = data.fullName.trim();
        if (data.stream !== undefined) payload.stream = data.stream;
        if (data.language !== undefined) payload.language = data.language;
        if (data.avatarUrl !== undefined) payload.avatar_url = data.avatarUrl.trim();
        if (data.dream !== undefined) payload.dream = data.dream.trim();
        if (data.goal !== undefined) payload.goal = data.goal.trim();
        if (data.targetScore !== undefined) payload.target_score = data.targetScore.trim();
        if (data.studyFocus !== undefined) payload.study_focus = data.studyFocus.trim();

        const { error } = await supabase
          .from('profiles')
          .update(payload)
          .eq('id', currentUser.id);

        if (error) {
          console.error('Supabase profile update error:', error);
          return { success: false, error: error.message };
        }
      } catch (err: any) {
        console.error('Supabase profile update failed:', err);
        return { success: false, error: err.message || 'Erreur de mise à jour' };
      }
    }

    setCurrentUser(updatedUser);
    setUsers((prev) => prev.map((u) => (u.id === currentUser.id ? updatedUser : u)));
    try {
      localStorage.setItem('bacnext_current_user', JSON.stringify(updatedUser));
      localStorage.setItem('eosbac_current_user', JSON.stringify(updatedUser));
    } catch {}

    return { success: true };
  };

  // GOOGLE AUTHENTICATION
  const loginWithGoogle = async (): Promise<{ success: boolean; error?: string }> => {
    if (!isSupabaseConfigured || !supabase) {
      return {
        success: false,
        error:
          "Supabase n'est pas encore configuré. Renseignez VITE_SUPABASE_URL et VITE_SUPABASE_ANON_KEY dans vos variables d'environnement pour activer l'authentification Google.",
      };
    }

    try {
      const redirectUrl = getAuthRedirectUrl();
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: redirectUrl,
        },
      });

      if (error) {
        return {
          success: false,
          error: `Erreur Supabase OAuth : ${error.message}`,
        };
      }

      return { success: true };
    } catch (err: any) {
      return {
        success: false,
        error: err?.message || 'Erreur inattendue lors de la connexion Google.',
      };
    }
  };

  // COMPLETE STUDENT ONBOARDING (Stream, Dream, Goal, Target Score)
  const completeStudentOnboarding = async (data: {
    stream: StreamType;
    dream: string;
    goal: string;
    targetScore?: string;
    studyFocus?: string;
  }) => {
    if (!currentUser) return;

    const updated: UserAccount = {
      ...currentUser,
      stream: data.stream,
      dream: data.dream.trim(),
      goal: data.goal.trim(),
      target_score: data.targetScore ? data.targetScore.trim() : currentUser.target_score,
      study_focus: data.studyFocus ? data.studyFocus.trim() : currentUser.study_focus,
      onboarding_completed: true,
    };

    setCurrentUser(updated);
    setUsers((prev) => prev.map((u) => (u.id === currentUser.id ? updated : u)));
    setShowStudentOnboarding(false);

    try {
      localStorage.setItem('eosbac_pending_student_onboarding', 'false');
      localStorage.setItem('bacnext_pending_student_onboarding', 'false');
      localStorage.setItem('eosbac_current_user', JSON.stringify(updated));
      localStorage.setItem('bacnext_current_user', JSON.stringify(updated));
    } catch {}

    // Persist to Supabase Database
    if (isSupabaseConfigured && supabase) {
      try {
        const { error } = await supabase
          .from('profiles')
          .update({
            stream: data.stream,
            dream: data.dream.trim(),
            goal: data.goal.trim(),
            target_score: data.targetScore ? data.targetScore.trim() : null,
            study_focus: data.studyFocus ? data.studyFocus.trim() : null,
            onboarding_completed: true,
          })
          .eq('id', currentUser.id);

        if (error) {
          console.error('Error saving onboarding data to Supabase:', error);
        }
      } catch (err) {
        console.error('Failed to update onboarding in Supabase:', err);
      }
    }
  };

  // COMPLETE STREAM ONBOARDING (Backwards compatibility)
  const completeStreamOnboarding = async (stream: StreamType) => {
    await completeStudentOnboarding({
      stream,
      dream: currentUser?.dream || '',
      goal: currentUser?.goal || '',
      targetScore: currentUser?.target_score,
      studyFocus: currentUser?.study_focus,
    });
  };

  // Quick switch between accounts (helpful for testing admin vs student in the preview)
  const switchAccountForTesting = (userId: string) => {
    const target = users.find((u) => u.id === userId);
    if (target) {
      setCurrentUser(target);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        currentUser,
        role,
        isAdmin,
        isStudent,
        users,
        isLoadingUsers,
        refreshUsers,
        showStudentOnboarding,
        setShowStudentOnboarding,
        completeStudentOnboarding,
        showStreamOnboarding,
        setShowStreamOnboarding,
        completeStreamOnboarding,
        login,
        signup,
        resetPassword,
        updatePassword,
        resendVerificationEmail,
        isRecoveryMode,
        setIsRecoveryMode,
        loginWithGoogle,
        logout,
        promoteUserToAdmin,
        demoteAdminToStudent,
        updateCurrentUserProfile,
        switchAccountForTesting,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
