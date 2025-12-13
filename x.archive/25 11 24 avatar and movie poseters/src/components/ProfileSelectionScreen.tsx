import React, { useState, useEffect, useRef } from 'react';
import type { UserSummary } from '../types';
import { listUsers, createUser, saveUser, deleteUser, getAvatarUrl, getUser } from '../services/api';
import { useUser } from '../contexts/UserContext';
import { CreateProfileModal } from './CreateProfileModal';
import { EditProfileModal } from './EditProfileModal';
import { extractDominantColor } from '../utils/colorExtraction';

export function ProfileSelectionScreen() {
  const [users, setUsers] = useState<UserSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [editingUser, setEditingUser] = useState<UserSummary | null>(null);
  const [editMode, setEditMode] = useState(false);
  const [avatarColors, setAvatarColors] = useState<Record<string, string>>({});
  const imageRefs = useRef<Record<string, HTMLImageElement>>({});
  const { loadUser } = useUser();

  useEffect(() => {
    loadUsers();
  }, []);

  const loadUsers = async () => {
    try {
      const userList = await listUsers();
      setUsers(userList);
    } catch (error) {
      console.error('Failed to load users:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSelectUser = async (userId: string) => {
    try {
      await loadUser(userId);
    } catch (error) {
      console.error('Failed to load user:', error);
      alert('Failed to load profile. Please try again.');
    }
  };

  const handleCreateProfile = async (name: string, avatarFilename: string) => {
    try {
      const newUser = await createUser({ name, avatar_filename: avatarFilename });
      setShowCreateModal(false);
      await loadUsers(); // Refresh list
    } catch (error) {
      console.error('Failed to create user:', error);
      alert('Failed to create profile. Please try again.');
    }
  };

  const handleEditProfile = async (userId: string, name: string, avatarFilename: string) => {
    try {
      // Get current user data to preserve items
      const currentUser = await getUser(userId);
      await saveUser({
        user_id: userId,
        name,
        avatar_filename: avatarFilename,
        items: currentUser.items
      });
      setEditingUser(null);
      setEditMode(false); // Exit edit mode
      await loadUsers(); // Refresh list
    } catch (error) {
      console.error('Failed to update user:', error);
      alert('Failed to update profile. Please try again.');
    }
  };

  const handleDeleteProfile = async (userId: string) => {
    try {
      await deleteUser(userId);
      setEditingUser(null);
      setEditMode(false); // Exit edit mode
      await loadUsers(); // Refresh list
    } catch (error) {
      console.error('Failed to delete user:', error);
      alert('Failed to delete profile. Please try again.');
    }
  };

  const handleProfileClick = (user: UserSummary, e: React.MouseEvent) => {
    if (editMode) {
      e.stopPropagation();
      setEditingUser(user);
    } else {
      handleSelectUser(user.user_id);
    }
  };

  const handleImageLoad = (userId: string, img: HTMLImageElement) => {
    if (!avatarColors[userId]) {
      const color = extractDominantColor(img);
      setAvatarColors(prev => ({ ...prev, [userId]: color }));
    }
  };

  if (loading) {
    return (
      <div className="profile-selection-screen">
        <div className="loading">Loading profiles...</div>
      </div>
    );
  }

  return (
    <div className="profile-selection-screen">
      <div className="profile-container">
        <h1 className="app-title-large">WatchBox</h1>
        <h2 className="subtitle">Who's watching?</h2>
        <div className="profiles-grid">
          {users.map((user) => (
            <button
              key={user.user_id}
              className="profile-card"
              onClick={(e) => handleProfileClick(user, e)}
            >
              <div 
                className="profile-avatar"
                style={{
                  backgroundColor: avatarColors[user.user_id] || '#4A90E2'
                }}
              >
                <img
                  ref={(img) => {
                    if (img) {
                      imageRefs.current[user.user_id] = img;
                    }
                  }}
                  src={getAvatarUrl(user.avatar_filename)}
                  alt={user.name}
                  className="profile-image"
                  onLoad={(e) => {
                    const img = e.target as HTMLImageElement;
                    handleImageLoad(user.user_id, img);
                  }}
                  onError={(e) => {
                    const target = e.target as HTMLImageElement;
                    console.error(`Failed to load avatar ${user.avatar_filename} from:`, target.src);
                  }}
                />
                {editMode && (
                  <div className="edit-overlay">
                    <span className="edit-icon">✎</span>
                  </div>
                )}
              </div>
              <span className="profile-name">{user.name}</span>
            </button>
          ))}
          {!editMode && (
            <>
              <button
                className="profile-card create-profile"
                onClick={() => setShowCreateModal(true)}
              >
                <div className="profile-avatar add-avatar">
                  <span className="plus-icon">+</span>
                </div>
                <span className="profile-name">Add Profile</span>
              </button>
              <button
                className="profile-card edit-profiles"
                onClick={() => setEditMode(true)}
              >
                <div className="profile-avatar add-avatar">
                  <span className="edit-icon-large">✎</span>
                </div>
                <span className="profile-name">Edit Profiles</span>
              </button>
            </>
          )}
        </div>
      </div>
      {showCreateModal && (
        <CreateProfileModal
          onClose={() => setShowCreateModal(false)}
          onCreate={handleCreateProfile}
        />
      )}
      {editingUser && (
        <EditProfileModal
          user={editingUser}
          onClose={() => {
            setEditingUser(null);
            setEditMode(false);
          }}
          onSave={handleEditProfile}
          onDelete={handleDeleteProfile}
        />
      )}
    </div>
  );
}

