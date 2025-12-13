import React, { useState, useEffect, useRef } from 'react';
import { getAvatarUrl, getAvailableAvatars, clearAvatarCache } from '../services/api';
import { extractDominantColor } from '../utils/colorExtraction';

interface CreateProfileModalProps {
  onClose: () => void;
  onCreate: (name: string, avatarFilename: string) => void;
}

export function CreateProfileModal({ onClose, onCreate }: CreateProfileModalProps) {
  const [name, setName] = useState('');
  const [selectedAvatar, setSelectedAvatar] = useState<string | null>(null);
  const [availableAvatars, setAvailableAvatars] = useState<string[]>([]);
  const [avatarColors, setAvatarColors] = useState<Record<string, string>>({});
  const imageRefs = useRef<Record<string, HTMLImageElement>>({});

  useEffect(() => {
    // Clear avatar cache and colors to force re-extraction from updated SVGs
    clearAvatarCache();
    setAvatarColors({});
    
    // Load avatars on mount - always fetch fresh
    getAvailableAvatars().then(avatars => {
      setAvailableAvatars(avatars);
      // Set first avatar as default
      if (avatars.length > 0 && !selectedAvatar) {
        setSelectedAvatar(avatars[0]);
      }
    });
  }, []);

  useEffect(() => {
    // Set first avatar as default when avatars load
    if (availableAvatars.length > 0 && !selectedAvatar) {
      setSelectedAvatar(availableAvatars[0]);
    }
  }, [availableAvatars, selectedAvatar]);

  const handleImageLoad = (avatarFilename: string, img: HTMLImageElement) => {
    // Always re-extract color to pick up changes in updated SVGs
    const color = extractDominantColor(img, avatarFilename);
    setAvatarColors(prev => ({ ...prev, [avatarFilename]: color }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (name.trim() && selectedAvatar) {
      onCreate(name.trim(), selectedAvatar);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>Create Profile</h2>
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
            <button type="button" onClick={onClose} className="btn-secondary">
              Cancel
            </button>
            <button 
              type="submit" 
              className="btn-primary"
              disabled={!name.trim() || !selectedAvatar}
            >
              Create
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

