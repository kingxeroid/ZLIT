import {
  createContext,
  useContext,
  useEffect,
  useState,
} from "react";

import { supabase } from "../services/supabase";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  const loadProfile = async (userId) => {
    const { data, error } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", userId)
      .maybeSingle();

    if (error) throw error;

    setProfile(data);
    return data;
  };

  useEffect(() => {
    let mounted = true;

    const initialize = async () => {
      const { data, error } = await supabase.auth.getSession();

      if (error) console.error(error);

      const sessionUser = data?.session?.user ?? null;

      if (mounted) setUser(sessionUser);

      if (sessionUser) {
        try {
          await loadProfile(sessionUser.id);
        } catch (error) {
          console.error("Profile loading failed:", error);
        }
      }

      if (mounted) setLoading(false);
    };

    initialize();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      const sessionUser = session?.user ?? null;

      if (!mounted) return;

      setUser(sessionUser);

      if (!sessionUser) {
        setProfile(null);
        setLoading(false);
        return;
      }

      setLoading(true);

      setTimeout(async () => {
        if (!mounted) return;

        try {
          await loadProfile(sessionUser.id);
        } catch (error) {
          console.error("Profile loading failed:", error);
          if (mounted) setProfile(null);
        } finally {
          if (mounted) setLoading(false);
        }
      }, 0);
    });

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, []);

  const register = async ({ fullName, email, password }) => {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          full_name: fullName,
        },
      },
    });

    if (error) throw error;

    if (data.user && data.session) {
      await loadProfile(data.user.id);
    }

    return data;
  };

  const login = async ({ email, password }) => {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) throw error;

    const currentProfile = await loadProfile(data.user.id);

    if (!currentProfile || !currentProfile.is_active) {
      await supabase.auth.signOut();
      throw new Error("Your account is unavailable.");
    }

    return {
      user: data.user,
      profile: currentProfile,
    };
  };

  const logout = async () => {
    const { error } = await supabase.auth.signOut();

    if (error) throw error;

    setUser(null);
    setProfile(null);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        profile,
        loading,
        register,
        login,
        logout,
        loadProfile,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error("useAuth must be used inside AuthProvider");
  }

  return context;
}