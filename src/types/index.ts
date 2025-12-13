// Type definitions for WatchBox

export interface WatchBoxItem {
  id: string;
  title: string;
  tmdb_id: number;
  poster_id?: number; // Deprecated, kept for backward compatibility
  poster_filename: string;
  listType: 'top' | 'watch';
  services: string[];
}

export interface User {
  user_id: string;
  name: string;
  avatar_filename: string;
  updated_at?: string;
  items: WatchBoxItem[];
  streaming_services?: string[];
}

export interface UserSummary {
  user_id: string;
  name: string;
  avatar_filename: string;
  streaming_services?: string[];
}

export interface CreateUserRequest {
  name: string;
  avatar_filename: string;
  streaming_services?: string[];
}

export interface SaveUserRequest {
  user_id: string;
  name: string;
  avatar_filename: string;
  items: WatchBoxItem[];
  streaming_services?: string[];
}

