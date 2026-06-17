import {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  type ReactNode,
} from 'react';
import { supabase } from '../lib/supabase';

// ── Types ─────────────────────────────────────────────────────────────────────
export interface User {
  id: string;
  email: string;
  name: string;
  credits: number;
  is_pro: boolean;
}

interface AuthContextValue {
  user: User | null;
  token: string | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (name: string, email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  updateCredits: (credits: number) => void;
}

const AuthContext = createContext<AuthContextValue | null>(null);

// ── Helpers ───────────────────────────────────────────────────────────────────

/** Récupère le profil complet (credits, is_pro, name) depuis le backend */
async function fetchProfile(accessToken: string): Promise<User> {
  const res = await fetch('/api/auth/me', {
    headers: { Authorization: `Bearer ${accessToken}` },
  });
  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error(body.error ?? 'Profil introuvable');
  }
  return res.json();
}

/** Retry avec délai pour laisser le trigger Supabase créer le profil */
async function fetchProfileWithRetry(
  accessToken: string,
  attempts = 5,
  delayMs = 600,
): Promise<User> {
  for (let i = 0; i < attempts; i++) {
    try {
      return await fetchProfile(accessToken);
    } catch (err) {
      if (i === attempts - 1) throw err;
      await new Promise((r) => setTimeout(r, delayMs));
    }
  }
  throw new Error('Impossible de charger le profil');
}

// ── Provider ──────────────────────────────────────────────────────────────────
export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  // Restaure la session au montage + écoute les changements d'auth
  useEffect(() => {
    let mounted = true;

    // Session initiale
    supabase.auth.getSession().then(async ({ data: { session } }) => {
      if (!mounted) return;
      if (session) {
        try {
          const profile = await fetchProfileWithRetry(session.access_token);
          if (mounted) {
            setToken(session.access_token);
            setUser(profile);
          }
        } catch {
          // Session expirée ou profil introuvable → déconnexion silencieuse
        }
      }
      if (mounted) setLoading(false);
    });

    // Changements en temps réel (login, logout, refresh token)
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (!mounted) return;

        if ((event === 'SIGNED_IN' || event === 'INITIAL_SESSION') && session) {
          try {
            const profile = await fetchProfileWithRetry(session.access_token);
            setToken(session.access_token);
            setUser(profile);
          } catch {
            setUser(null);
            setToken(null);
          } finally {
            setLoading(false);
          }
        } else if (event === 'TOKEN_REFRESHED' && session) {
          // Met à jour le token silencieusement
          setToken(session.access_token);
        } else if (event === 'SIGNED_OUT') {
          setUser(null);
          setToken(null);
          setLoading(false);
        }
      },
    );

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, []);

  // ── Actions ────────────────────────────────────────────────────────────────

  const login = useCallback(async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) {
      // Traduction des erreurs Supabase en français
      const msg =
        error.message.includes('Invalid login') || error.message.includes('invalid_credentials')
          ? 'Email ou mot de passe incorrect.'
          : error.message;
      throw new Error(msg);
    }
    // Le profil sera chargé automatiquement via onAuthStateChange (SIGNED_IN)
  }, []);

  const register = useCallback(async (name: string, email: string, password: string) => {
    if (!name.trim()) throw new Error('Le prénom est requis.');
    if (password.length < 6) throw new Error('Mot de passe trop court (6 caractères min).');

    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { name: name.trim() },
        emailRedirectTo: window.location.origin,
      },
    });
    if (error) {
      const msg = error.message.includes('already registered')
        ? 'Cet email est déjà utilisé.'
        : error.message;
      throw new Error(msg);
    }
    // Pas de session → Supabase exige une confirmation email → écran dédié.
    // Session présente (auto-confirmation activée) → l'utilisateur est connecté
    // directement, onAuthStateChange (SIGNED_IN) chargera son profil.
    if (!data.session) {
      throw new Error('__EMAIL_CONFIRM__');
    }
  }, []);

  const logout = useCallback(async () => {
    await supabase.auth.signOut();
    // onAuthStateChange (SIGNED_OUT) mettra user + token à null
  }, []);

  const updateCredits = useCallback((credits: number) => {
    setUser((u) => (u ? { ...u, credits } : u));
  }, []);

  return (
    <AuthContext.Provider value={{ user, token, loading, login, register, logout, updateCredits }}>
      {children}
    </AuthContext.Provider>
  );
}

// ── Hook ──────────────────────────────────────────────────────────────────────
export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth doit être utilisé dans un AuthProvider');
  return ctx;
}
