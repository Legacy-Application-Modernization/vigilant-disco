import { createContext, useContext, useEffect, useState, type ReactNode } from 'react';
import {
  type User,
  onAuthStateChanged,
  signOut
} from 'firebase/auth';
import { auth } from '../firebase/config';
import apiService from '../services/api';

interface AuthContextType {
  currentUser: User | null;
  userProfile: any;
  loading: boolean;
  logout: () => Promise<void>;
  updateUserProfile: (data: any) => Promise<void>;
  refreshUserProfile: () => Promise<void>;
}

export const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider = ({ children }: AuthProviderProps) => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [userProfile, setUserProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const logout = async () => {
    if (!auth) {
      console.warn('Auth not configured; cannot sign out');
      return;
    }

    await signOut(auth);
    setUserProfile(null);
  };

  const updateUserProfile = async (data: any) => {
    const response = await apiService.updateUserProfile(data);
    if (response.success) {
      setUserProfile(response.data);
    }
    return response;
  };

  const refreshUserProfile = async () => {
    if (currentUser) {
      try {
        const response = await apiService.getUserProfile();
        if (response.success) {
          setUserProfile(response.data);
        }
      } catch (error) {
        console.error('Error fetching user profile:', error);
        // Try to initialize user if profile doesn't exist
        try {
          await apiService.initializeUser();
          const response = await apiService.getUserProfile();
          if (response.success) {
            setUserProfile(response.data);
          }
        } catch (initError) {
          console.error('Error initializing user:', initError);
        }
      }
    }
  };

  useEffect(() => {
    if (!auth) {
      // Firebase not configured; mark loading false so UI can render and guard usages will handle missing auth
      setLoading(false);
      return;
    }

    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setCurrentUser(user);

      if (user) {
        await refreshUserProfile();
      } else {
        setUserProfile(null);
      }

      setLoading(false);
    });

    return unsubscribe;
  }, []);

  const value: AuthContextType = {
    currentUser,
    userProfile,
    loading,
    logout,
    updateUserProfile,
    refreshUserProfile
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};