import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import type { User } from '../types';
import { getUser } from '../services/api';

interface UserContextType {
  currentUser: User | null;
  setCurrentUser: (user: User | null) => void;
  loadUser: (userId: string) => Promise<void>;
  logout: () => void;
}

const UserContext = createContext<UserContextType | undefined>(undefined);

const STORAGE_KEY = 'watchbox_current_user_id';

export function UserProvider({ children }: { children: ReactNode }) {
  const [currentUser, setCurrentUser] = useState<User | null>(null);

  // Load user from localStorage on mount
  useEffect(() => {
    const savedUserId = localStorage.getItem(STORAGE_KEY);
    if (savedUserId) {
      loadUser(savedUserId).catch(() => {
        // If loading fails, clear the saved user
        localStorage.removeItem(STORAGE_KEY);
      });
    }
  }, []);

  const loadUser = async (userId: string) => {
    const user = await getUser(userId);
    setCurrentUser(user);
    localStorage.setItem(STORAGE_KEY, userId);
  };

  const logout = () => {
    setCurrentUser(null);
    localStorage.removeItem(STORAGE_KEY);
  };

  return (
    <UserContext.Provider value={{ currentUser, setCurrentUser, loadUser, logout }}>
      {children}
    </UserContext.Provider>
  );
}

export function useUser() {
  const context = useContext(UserContext);
  if (context === undefined) {
    throw new Error('useUser must be used within a UserProvider');
  }
  return context;
}

