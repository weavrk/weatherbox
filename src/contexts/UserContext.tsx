import { createContext, useContext, useState, ReactNode } from 'react';
import type { User, WatchBoxItem } from '../types';
import { getUser } from '../services/api';

/**
 * Normalize WatchBoxItem to ensure isMovie field is present
 * Handles backward compatibility for items that might not have isMovie
 * Also migrates old poster_filename to poster_path
 * Note: If poster_path is missing but we have tmdb_id, it will be fetched on-demand in TitleCard
 */
function normalizeWatchBoxItem(item: any): WatchBoxItem {
  // Migrate poster_filename to poster_path if needed (backward compatibility)
  let poster_path = item.poster_path;
  if (!poster_path && item.poster_filename) {
    // If poster_filename is a full URL, extract the path
    if (item.poster_filename.startsWith('http://') || item.poster_filename.startsWith('https://')) {
      // Extract just the path part (e.g., "/abc123.jpg" from "https://image.tmdb.org/t/p/w500/abc123.jpg")
      const urlMatch = item.poster_filename.match(/\/t\/p\/w\d+\/(.+)$/);
      if (urlMatch) {
        poster_path = '/' + urlMatch[1];
      } else {
        poster_path = null;
      }
    }
    // Otherwise, old local filename - set to null
    // poster_path will be fetched on-demand if we have tmdb_id
    else {
      poster_path = null;
    }
  }
  
  // If isMovie is already present, use it
  if (typeof item.isMovie === 'boolean') {
    return {
      ...item,
      poster_path,
      // Remove old fields
      poster_filename: undefined,
      poster_id: undefined,
    } as WatchBoxItem;
  }
  
  // Otherwise, infer from other fields
  // TV shows have number_of_seasons or number_of_episodes
  const isMovie = !item.number_of_seasons && !item.number_of_episodes;
  
  return {
    ...item,
    isMovie,
    poster_path,
    // Remove old fields
    poster_filename: undefined,
    poster_id: undefined,
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

