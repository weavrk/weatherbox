import React, { useState, useEffect, useRef } from 'react';
import { getAvatarUrl, getAvailableAvatars } from '../services/api';
import { extractDominantColor } from '../utils/colorExtraction';

export function CreateProfileModal({ onClose, onCreate }: CreateProfileModalProps) {
  const [name, setName] = useState('');
  const [selectedAvatar, setSelectedAvatar] = useState<string | null>(null);
  const [availableAvatars] = useState<string[]>(getAvailableAvatars());
  const [avatarColors, setAvatarColors] = useState<Record<string, string>>({});
  const imageRefs = useRef<Record<string, HTMLImageElement>>({});

  useEffect(() => {
    // Set first avatar as default
    if (availableAvatars.length > 0 && !selectedAvatar) {
      setSelectedAvatar(availableAvatars[0]);
    }
  }, [availableAvatars, selectedAvatar]);

  const handleImageLoad = (avatarFilename: string, img: HTMLImageElement) => {
    if (!avatarColors[avatarFilename]) {
      const color = extractDominantColor(img);
      setAvatarColors(prev => ({ ...prev, [avatarFilename]: color }));
    }
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

