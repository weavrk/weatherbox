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
export function getAvatarUrl(filename: string): string {
  return `/data/avatars/${filename}`;
}

/**
 * List available avatar filenames
 * In production, this would fetch from an API endpoint
 */
export function getAvailableAvatars(): string[] {
  // Return list of available avatar filenames
  // We have 24 avatars total
  const avatars: string[] = [];
  for (let i = 1; i <= 24; i++) {
    avatars.push(`avatar-${i}.png`);
  }
  return avatars;
}

/**
 * Streaming service icon mapping
 */
export const SERVICE_ICONS: Record<string, string> = {
  netflix: '/hrefs/watchbox/assets/services/netflix.svg',
  hulu: '/hrefs/watchbox/assets/services/hulu.svg',
  appletv: '/hrefs/watchbox/assets/services/appletv.svg',
  max: '/hrefs/watchbox/assets/services/max.svg',
  disneyplus: '/hrefs/watchbox/assets/services/disneyplus.svg',
  amazon: '/hrefs/watchbox/assets/services/amazon.svg',
  peacock: '/hrefs/watchbox/assets/services/peacock.svg',
};

/**
 * Get service icon URL
 */
export function getServiceIcon(serviceName: string): string {
  return SERVICE_ICONS[serviceName.toLowerCase()] || '/hrefs/watchbox/assets/services/default.svg';
}

