// API service layer for WatchBox

import type { User, UserSummary, CreateUserRequest, SaveUserRequest } from '../types';

const API_BASE = '/api';

/**
 * Fetch list of all users
 */
export async function listUsers(): Promise<UserSummary[]> {
  const response = await fetch(`${API_BASE}/list_users.php`);
  if (!response.ok) {
    throw new Error('Failed to fetch users');
  }
  return response.json();
}

/**
 * Get a specific user by ID
 */
export async function getUser(userId: string): Promise<User> {
  const response = await fetch(`${API_BASE}/get_user.php?user_id=${encodeURIComponent(userId)}`);
  if (!response.ok) {
    throw new Error('Failed to fetch user');
  }
  return response.json();
}

/**
 * Create a new user profile
 */
export async function createUser(data: CreateUserRequest): Promise<User> {
  const response = await fetch(`${API_BASE}/create_user.php`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(data),
  });
  if (!response.ok) {
    throw new Error('Failed to create user');
  }
  return response.json();
}

/**
 * Save user data (update items, etc.)
 */
export async function saveUser(data: SaveUserRequest): Promise<{ success: boolean }> {
  const response = await fetch(`${API_BASE}/save_user.php`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(data),
  });
  if (!response.ok) {
    throw new Error('Failed to save user');
  }
  return response.json();
}

/**
 * Delete a user profile
 */
export async function deleteUser(userId: string): Promise<{ success: boolean }> {
  const response = await fetch(`${API_BASE}/delete_user.php`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ user_id: userId }),
  });
  if (!response.ok) {
    throw new Error('Failed to delete user');
  }
  return response.json();
}

/**
 * Get poster URL by poster filename
 * Supports both new format (filename) and old format (poster_id) for backward compatibility
 */
export function getPosterUrl(posterFilename: string | number): string {
  // Handle backward compatibility: if number is passed, treat as old poster_id
  if (typeof posterFilename === 'number') {
    const posterId = posterFilename;
    if (posterId <= 12) {
      return `/data/posters/${posterId}.svg`;
    }
    return `/data/posters/${posterId}.jpg`;
  }
  // New format: use filename directly
  return `/data/posters/${posterFilename}`;
}

/**
 * Get avatar URL by filename
 */
// Cache-busting version that's set once per page load
let avatarCacheVersion = Date.now();

export function getAvatarUrl(filename: string): string {
  // Add cache-busting version to force reload when SVGs are updated
  // Version is set once per page load, so images reload on refresh
  return `/data/avatars/${filename}?v=${avatarCacheVersion}`;
}

export function clearAvatarCache(): void {
  // Increment version to force all avatar images to reload
  avatarCacheVersion = Date.now();
}

/**
 * List available avatar filenames
 * Fetches dynamically from the server to pick up all SVG files
 * Always fetches fresh data on each call to detect new/updated files
 */
export async function getAvailableAvatars(): Promise<string[]> {
  try {
    // Add cache-busting parameter to ensure fresh data
    const response = await fetch(`/api/list_avatars.php?t=${Date.now()}`);
    if (!response.ok) {
      throw new Error('Failed to fetch avatars');
    }
    const avatars = await response.json();
    return avatars;
  } catch (error) {
    console.error('Failed to load avatars:', error);
    // Fallback to empty array
    return [];
  }
}

/**
 * List available streaming service filenames
 * Fetches dynamically from the server to pick up all SVG files
 * Always fetches fresh data on each call to detect new/updated files
 */
export async function getAvailableStreamingServices(): Promise<string[]> {
  try {
    // Add cache-busting parameter to ensure fresh data
    const response = await fetch(`/api/list_streaming_services.php?t=${Date.now()}`);
    if (!response.ok) {
      throw new Error('Failed to fetch streaming services');
    }
    const services = await response.json();
    return services;
  } catch (error) {
    console.error('Failed to load streaming services:', error);
    // Fallback to empty array
    return [];
  }
}

/**
 * Get service label from filename (replace "-" with spaces, remove extension)
 */
export function getServiceLabel(filename: string): string {
  return filename
    .replace(/\.svg$/i, '')
    .replace(/-/g, ' ');
}

/**
 * Get service icon URL from filename or service key
 * Handles both old service keys (like "netflix") and new filenames (like "netflix.svg")
 */
export function getServiceIcon(serviceNameOrFilename: string): string {
  // If it already has .svg extension, use it directly
  if (serviceNameOrFilename.toLowerCase().endsWith('.svg')) {
    return `/data/streaming/${serviceNameOrFilename}`;
  }
  // Otherwise, treat it as a service key and try to find matching file
  // For backward compatibility, try the old path first
  const oldPath = `/hrefs/watchbox/assets/services/${serviceNameOrFilename.toLowerCase()}.svg`;
  // For new system, try to find the file (this will work once files are added)
  const newPath = `/data/streaming/${serviceNameOrFilename.toLowerCase()}.svg`;
  // Return new path (the old path will be handled by the server if file doesn't exist)
  return newPath;
}

/**
 * Get service key from filename (for matching/identification)
 */
export function getServiceKey(filename: string): string {
  return filename.replace(/\.svg$/i, '').toLowerCase();
}

/**
 * Explore content types
 */
export interface ExploreItem {
  id: string;
  title: string;
  tmdb_id: number;
  poster_filename: string;
  services: string[];
  first_air_date?: string;
  release_date?: string;
  isMovie: boolean;
}

/**
 * Fetch top movies and shows for explore tab
 */
export async function getExploreContent(): Promise<ExploreItem[]> {
  try {
    // Fetch both movies and shows
    const [moviesResponse, showsResponse] = await Promise.all([
      fetch('/top-movies-by-year-results.json'),
      fetch('/streaming-shows-results.json')
    ]);

    const [movies, shows] = await Promise.all([
      moviesResponse.json(),
      showsResponse.json()
    ]);

    // Combine and limit to top 200
    const allContent = [...movies, ...shows].slice(0, 200);
    return allContent;
  } catch (error) {
    console.error('Failed to fetch explore content:', error);
    return [];
  }
}

