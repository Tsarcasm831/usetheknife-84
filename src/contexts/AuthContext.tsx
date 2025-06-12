
import { createContext, useContext, useEffect, useState } from "react";
import { Session, User } from "@supabase/supabase-js";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "react-router-dom";
import { toast } from "@/components/ui/sonner";
import type { UserProfile, ProfileFormData } from "@/types";
import { 
  sanitizeInput, 
  validateEmail, 
  validateUsername, 
  validatePassword,
  ClientRateLimiter 
} from "@/lib/security";

type AuthContextType = {
  session: Session | null;
  user: User | null;
  profile: UserProfile | null;
  isLoading: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string, username: string) => Promise<void>;
  signOut: () => Promise<void>;
  updateProfile: (updates: ProfileFormData) => Promise<void>;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Rate limiter instance
const rateLimiter = new ClientRateLimiter();

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const navigate = useNavigate();

  useEffect(() => {
    // Set up auth state listener FIRST
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        setSession(session);
        setUser(session?.user ?? null);
        
        // Fetch user profile data with setTimeout to avoid deadlocks
        if (session?.user) {
          setTimeout(() => {
            fetchProfile(session.user.id);
          }, 0);
        } else {
          setProfile(null);
        }
        
        if (event === 'SIGNED_OUT') {
          setProfile(null);
        }
      }
    );

    // THEN check for existing session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      
      if (session?.user) {
        fetchProfile(session.user.id);
      }
      setIsLoading(false);
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const fetchProfile = async (userId: string): Promise<void> => {
    try {
      const { data, error } = await supabase
        .from("app_users")
        .select("*")
        .eq("auth_user_id", userId)
        .maybeSingle();

      if (error) {
        console.error("Error fetching profile:", error);
        return;
      }

      setProfile(data as UserProfile);
    } catch (error) {
      console.error("Error fetching profile:", error);
    }
  };

  const signIn = async (email: string, password: string) => {
    // Rate limiting check
    if (!rateLimiter.canAttempt('signin', 5, 300000)) { // 5 attempts per 5 minutes
      toast.error(`Too many sign-in attempts. Please wait before trying again.`);
      throw new Error('Rate limit exceeded');
    }

    // Input validation
    const cleanEmail = sanitizeInput(email.toLowerCase().trim());
    if (!validateEmail(cleanEmail)) {
      toast.error("Please enter a valid email address");
      throw new Error('Invalid email format');
    }

    if (!password || password.length < 6) {
      toast.error("Password must be at least 6 characters long");
      throw new Error('Invalid password format');
    }

    try {
      const { error } = await supabase.auth.signInWithPassword({
        email: cleanEmail,
        password,
      });

      if (error) {
        throw error;
      }
      
      toast.success("Signed in successfully!");
      navigate("/");
    } catch (error: unknown) {
      const err = error as Error;
      toast.error(err.message || "Failed to sign in");
      throw error;
    }
  };

  const signUp = async (email: string, password: string, username: string) => {
    // Rate limiting check
    if (!rateLimiter.canAttempt('signup', 3, 3600000)) { // 3 attempts per hour
      toast.error("Too many sign-up attempts. Please wait before trying again.");
      throw new Error('Rate limit exceeded');
    }

    // Input validation
    const cleanEmail = sanitizeInput(email.toLowerCase().trim());
    const cleanUsername = sanitizeInput(username.trim());

    if (!validateEmail(cleanEmail)) {
      toast.error("Please enter a valid email address");
      throw new Error('Invalid email format');
    }

    if (!validateUsername(cleanUsername)) {
      toast.error("Username must be 3-50 characters long and contain only letters, numbers, underscores, and dashes");
      throw new Error('Invalid username format');
    }

    const passwordValidation = validatePassword(password);
    if (!passwordValidation.isValid) {
      toast.error(passwordValidation.errors[0]);
      throw new Error('Password does not meet requirements');
    }

    try {
      const { error } = await supabase.auth.signUp({
        email: cleanEmail,
        password,
        options: {
          data: {
            username: cleanUsername,
          },
        },
      });

      if (error) {
        throw error;
      }
      
      toast.success("Signed up successfully! Check your email for confirmation.");
      navigate("/auth");
    } catch (error: unknown) {
      const err = error as Error;
      toast.error(err.message || "Failed to sign up");
      throw error;
    }
  };

  const signOut = async () => {
    try {
      await supabase.auth.signOut();
      navigate("/auth");
      toast.success("Signed out successfully");
    } catch (error: unknown) {
      const err = error as Error;
      toast.error(err.message || "Failed to sign out");
    }
  };

  const updateProfile = async (updates: ProfileFormData): Promise<void> => {
    // Rate limiting check
    if (!rateLimiter.canAttempt('profile_update', 10, 3600000)) { // 10 updates per hour
      toast.error("Too many profile updates. Please wait before trying again.");
      throw new Error('Rate limit exceeded');
    }

    // Input validation
    const cleanUpdates = {
      username: sanitizeInput(updates.username.trim()),
      avatar_url: sanitizeInput(updates.avatar_url.trim())
    };

    if (cleanUpdates.username && !validateUsername(cleanUpdates.username)) {
      toast.error("Username must be 3-50 characters long and contain only letters, numbers, underscores, and dashes");
      throw new Error('Invalid username format');
    }

    try {
      if (!user) throw new Error("No user logged in");

      const { error } = await supabase
        .from("app_users")
        .update(cleanUpdates)
        .eq("auth_user_id", user.id);

      if (error) {
        throw error;
      }
      
      setProfile({ ...(profile as UserProfile), ...cleanUpdates });
      toast.success("Profile updated successfully");
    } catch (error: unknown) {
      const err = error as Error;
      toast.error(err.message || "Failed to update profile");
      throw error;
    }
  };

  return (
    <AuthContext.Provider
      value={{
        session,
        user,
        profile,
        isLoading,
        signIn,
        signUp,
        signOut,
        updateProfile,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
