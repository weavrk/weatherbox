import { createContext, useContext, useState, ReactNode } from 'react';
import type { User, WatchBoxItem } from '../types';
import { getUser } from '../services/api';

/**
 * Normalize WatchBoxItem to ensure isMovie field is present
 * Handles backward compatibility for items that might not have isMovie
 */
function normalizeWatchBoxItem(item: any): WatchBoxItem {
  // If isMovie is already present, use it
  if (typeof item.isMovie === 'boolean') {
    return item as WatchBoxItem;
  }
  
  // Otherwise, infer from other fields
  // TV shows have number_of_seasons or number_of_episodes
  const isMovie = !item.number_of_seasons && !item.number_of_episodes;
  
  return {
    ...item,
    isMovie,
  } as WatchBoxItem;
}

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

  // Removed auto-load from localStorage - users should always land on ProfileSelectionScreen first

  const loadUser = async (userId: string) => {
    const user = await getUser(userId);
    // Normalize items to ensure isMovie field is present (backward compatibility)
    const normalizedUser: User = {
      ...user,
      items: user.items.map(normalizeWatchBoxItem),
    };
    setCurrentUser(normalizedUser);
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

