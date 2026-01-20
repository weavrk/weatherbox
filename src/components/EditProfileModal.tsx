import React, { useState, useEffect, useRef } from 'react';
import { ArrowLeft } from 'lucide-react';
import { getAvatarUrl, getAvailableAvatars, clearAvatarCache } from '../services/api';
import type { UserSummary, StreamingService } from '../types';
import { extractDominantColor } from '../utils/colorExtraction';

interface EditProfileModalProps {
  user: UserSummary;
  onClose: () => void;
  onSave: (userId: string, name: string, avatarFilename: string, streamingServices: StreamingService[], birthday: string) => void;
  // onDelete is currently unused in this modal but kept for future enhancement (delete profile from here)
  onDelete?: (userId: string) => void;
  onBackToAccount?: () => void;
}

export function EditProfileModal({ user, onClose, onSave, onBackToAccount }: EditProfileModalProps) {
  const [name, setName] = useState(user.name);
  const [selectedAvatar, setSelectedAvatar] = useState<string>(user.avatar_filename);
  const [availableAvatars, setAvailableAvatars] = useState<string[]>([]);
  const [avatarColors, setAvatarColors] = useState<Record<string, string>>({});
  const [month, setMonth] = useState('');
  const [day, setDay] = useState('');
  const [year, setYear] = useState('');
  const imageRefs = useRef<Record<string, HTMLImageElement>>({});

  useEffect(() => {
    // Clear avatar cache and colors to force re-extraction from updated SVGs
    clearAvatarCache();
    setAvatarColors({});
    
    // Load avatars on mount - always fetch fresh
    getAvailableAvatars().then(avatars => {
      setAvailableAvatars(avatars);
    });
  }, []);

  useEffect(() => {
    setName(user.name);
    setSelectedAvatar(user.avatar_filename);
    
    // Parse birthday if it exists - handle both "MM/DD/YYYY" and "M/D/YYYY" formats
    if (user.birthday) {
      const parts = user.birthday.split('/');
      if (parts.length === 3) {
        // Preserve leading zeros if they exist, but don't require them
        setMonth(parts[0].trim());
        setDay(parts[1].trim());
        setYear(parts[2].trim());
      } else {
        // Invalid format, clear fields
        setMonth('');
        setDay('');
        setYear('');
      }
    } else {
      setMonth('');
      setDay('');
      setYear('');
    }
  }, [user]);

  const handleImageLoad = (avatarFilename: string, img: HTMLImageElement) => {
    // Always re-extract color to pick up changes in updated SVGs
    const color = extractDominantColor(img, avatarFilename);
    setAvatarColors(prev => ({ ...prev, [avatarFilename]: color }));
  };

  const formatBirthday = (): string => {
    if (!month && !day && !year) return '';
    
    // Pad month and day with leading zeros if needed
    const paddedMonth = month.padStart(2, '0');
    const paddedDay = day.padStart(2, '0');
    
    return `${paddedMonth}/${paddedDay}/${year}`;
  };

  const handleSubmit = (e?: React.FormEvent) => {
    if (e) {
      e.preventDefault();
    }
    if (name.trim() && selectedAvatar) {
      const birthday = formatBirthday();
      onSave(user.user_id, name.trim(), selectedAvatar, user.streaming_services || [], birthday);
    }
  };

  return (
    <div className="create-profile-page">
      <div className="create-profile-content">
        <div className="create-profile-header">
          <button 
            className="back-button-large" 
            onClick={onBackToAccount || onClose} 
            aria-label="Back"
          >
            <ArrowLeft size={28} />
          </button>
          <h2>Edit Profile</h2>
        </div>
        <div className="create-profile-scrollable">
          <form id="edit-profile-form" onSubmit={handleSubmit} className="create-profile-form-full">
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
            <div className="form-group">
              <label>Birthday</label>
              <div className="birthday-fields">
                <input
                  type="text"
                  value={month}
                  onChange={(e) => {
                    const val = e.target.value.replace(/\D/g, '').slice(0, 2);
                    setMonth(val);
                  }}
                  placeholder="MM"
                  className="birthday-input"
                  maxLength={2}
                />
                <span className="birthday-separator">/</span>
                <input
                  type="text"
                  value={day}
                  onChange={(e) => {
                    const val = e.target.value.replace(/\D/g, '').slice(0, 2);
                    setDay(val);
                  }}
                  placeholder="DD"
                  className="birthday-input"
                  maxLength={2}
                />
                <span className="birthday-separator">/</span>
                <input
                  type="text"
                  value={year}
                  onChange={(e) => {
                    const val = e.target.value.replace(/\D/g, '').slice(0, 4);
                    setYear(val);
                  }}
                  placeholder="YYYY"
                  className="birthday-input birthday-year"
                  maxLength={4}
                />
              </div>
              <p className="help-text">Enter birthday as MM/DD/YYYY</p>
            </div>
          </form>
        </div>
        <div className="profile-actions-bottom-sheet">
          <button 
            type="submit"
            form="edit-profile-form"
            className="ds-button-primary"
            disabled={!name.trim() || !selectedAvatar}
          >
            Save
          </button>
        </div>
      </div>
    </div>
  );
}

