import React, { useState, useEffect, useRef } from 'react';
import { getAvatarUrl, getAvailableAvatars } from '../services/api';
import type { UserSummary } from '../types';
import { extractDominantColor } from '../utils/colorExtraction';

export function EditProfileModal({ user, onClose, onSave, onDelete }: EditProfileModalProps) {
  const [name, setName] = useState(user.name);
  const [selectedAvatar, setSelectedAvatar] = useState<string>(user.avatar_filename);
  const [availableAvatars] = useState<string[]>(getAvailableAvatars());
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [avatarColors, setAvatarColors] = useState<Record<string, string>>({});
  const imageRefs = useRef<Record<string, HTMLImageElement>>({});

  useEffect(() => {
    setName(user.name);
    setSelectedAvatar(user.avatar_filename);
  }, [user]);

  const handleImageLoad = (avatarFilename: string, img: HTMLImageElement) => {
    if (!avatarColors[avatarFilename]) {
      const color = extractDominantColor(img);
      setAvatarColors(prev => ({ ...prev, [avatarFilename]: color }));
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (name.trim() && selectedAvatar) {
      onSave(user.user_id, name.trim(), selectedAvatar);
    }
  };

  const handleDelete = () => {
    if (showDeleteConfirm) {
      onDelete(user.user_id);
    } else {
      setShowDeleteConfirm(true);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>Edit Profile</h2>
          <button className="close-button" onClick={onClose} aria-label="Close">
            ×
          </button>
        </div>
        <form onSubmit={handleSubmit} className="create-profile-form">
          <div className="form-group">
            <label htmlFor="profile-name">Name</label>
            <input
              id="profile-name"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Enter profile name"
              autoFocus
              required
            />
          </div>
          <div className="form-group">
            <label>Choose Avatar</label>
            <div className="avatar-grid">
              {availableAvatars.map((avatarFilename) => (
                <button
                  key={avatarFilename}
                  type="button"
                  className={`avatar-option ${selectedAvatar === avatarFilename ? 'selected' : ''}`}
                  onClick={() => setSelectedAvatar(avatarFilename)}
                  style={{
                    backgroundColor: avatarColors[avatarFilename] || '#cccccc'
                  }}
                >
                  <img
                    ref={(img) => {
                      if (img) {
                        imageRefs.current[avatarFilename] = img;
                      }
                    }}
                    src={getAvatarUrl(avatarFilename)}
                    alt={`Avatar ${avatarFilename}`}
                    className="avatar-thumbnail"
                    onLoad={(e) => {
                      const img = e.target as HTMLImageElement;
                      handleImageLoad(avatarFilename, img);
                    }}
                    onError={(e) => {
                      const target = e.target as HTMLImageElement;
                      console.error(`Failed to load avatar ${avatarFilename} from:`, target.src);
                    }}
                  />
                </button>
              ))}
            </div>
          </div>
          <div className="modal-actions">
            <button 
              type="button" 
              onClick={handleDelete} 
              className="btn-danger"
            >
              {showDeleteConfirm ? 'Confirm Delete' : 'Delete Profile'}
            </button>
            <div style={{ flex: 1 }} />
            <button type="button" onClick={onClose} className="btn-secondary">
              Cancel
            </button>
            <button 
              type="submit" 
              className="btn-primary"
              disabled={!name.trim() || !selectedAvatar}
            >
              Save
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

