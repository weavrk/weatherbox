import React, { useState, useEffect, useRef } from 'react';
import { ArrowLeft, Check } from 'lucide-react';
import { getAvatarUrl, getAvailableAvatars, getAvailableStreamingServices, getServiceIcon, getServiceLabel, getServiceKey, clearAvatarCache } from '../services/api';
import type { UserSummary } from '../types';
import { extractDominantColor } from '../utils/colorExtraction';

interface EditProfileModalProps {
  user: UserSummary;
  onClose: () => void;
  onSave: (userId: string, name: string, avatarFilename: string, streamingServices: string[]) => void;
  onDelete: (userId: string) => void;
}

export function EditProfileModal({ user, onClose, onSave, onDelete }: EditProfileModalProps) {
  const [name, setName] = useState(user.name);
  const [selectedAvatar, setSelectedAvatar] = useState<string>(user.avatar_filename);
  const [selectedServices, setSelectedServices] = useState<string[]>(user.streaming_services || []);
  const [availableAvatars, setAvailableAvatars] = useState<string[]>([]);
  const [availableServices, setAvailableServices] = useState<string[]>([]);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [avatarColors, setAvatarColors] = useState<Record<string, string>>({});
  const imageRefs = useRef<Record<string, HTMLImageElement>>({});

  useEffect(() => {
    // Clear avatar cache and colors to force re-extraction from updated SVGs
    clearAvatarCache();
    setAvatarColors({});
    
    // Load avatars on mount - always fetch fresh
    getAvailableAvatars().then(avatars => {
      setAvailableAvatars(avatars);
    });
    
    // Load streaming services on mount
    getAvailableStreamingServices().then(services => {
      setAvailableServices(services);
    });
  }, []);

  useEffect(() => {
    setName(user.name);
    setSelectedAvatar(user.avatar_filename);
    setSelectedServices(user.streaming_services || []);
  }, [user]);

  const handleImageLoad = (avatarFilename: string, img: HTMLImageElement) => {
    // Always re-extract color to pick up changes in updated SVGs
    const color = extractDominantColor(img, avatarFilename);
    setAvatarColors(prev => ({ ...prev, [avatarFilename]: color }));
  };

  const handleServiceToggle = (service: string) => {
    setSelectedServices(prev => 
      prev.includes(service) 
        ? prev.filter(s => s !== service)
        : [...prev, service]
    );
  };

  const handleSubmit = (e?: React.FormEvent) => {
    if (e) {
      e.preventDefault();
    }
    if (name.trim() && selectedAvatar) {
      onSave(user.user_id, name.trim(), selectedAvatar, selectedServices);
    }
  };

  const handleDelete = () => {
    if (showDeleteConfirm) {
      onDelete(user.user_id);
    } else {
      setShowDeleteConfirm(true);
    }
  };

  const handleCancelDelete = () => {
    setShowDeleteConfirm(false);
  };

  return (
    <div className="create-profile-page">
      <div className="create-profile-content">
        <div className="create-profile-header">
          <button className="back-button" onClick={onClose} aria-label="Back">
            <ArrowLeft size={24} />
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
              <label>Streaming Services</label>
              <div className="services-grid">
                {availableServices.map((serviceFilename) => {
                  const serviceKey = getServiceKey(serviceFilename);
                  const serviceLabel = getServiceLabel(serviceFilename);
                  return (
                    <button
                      key={serviceKey}
                      type="button"
                      className={`service-option ${selectedServices.includes(serviceKey) ? 'selected' : ''}`}
                      onClick={() => handleServiceToggle(serviceKey)}
                    >
                      <img
                        src={getServiceIcon(serviceFilename)}
                        alt={serviceLabel}
                        className="service-icon-large"
                      />
                      {selectedServices.includes(serviceKey) && (
                        <div className="service-checkmark">
                          <Check size={20} />
                        </div>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>
          </form>
        </div>
        <div className="profile-actions-bottom-sheet">
          <button 
            type="submit"
            form="edit-profile-form"
            className="create-button-full"
            disabled={!name.trim() || !selectedAvatar}
          >
            Save
          </button>
          {!showDeleteConfirm ? (
            <button 
              type="button" 
              onClick={handleDelete} 
              className="btn-delete-profile"
            >
              Delete Profile
            </button>
          ) : (
            <div className="delete-confirm-container">
              <span className="delete-confirm-text">Are you sure?</span>
              <div className="delete-confirm-buttons">
                <button 
                  type="button" 
                  onClick={handleDelete} 
                  className="btn-confirm-delete"
                >
                  Yes
                </button>
                <button 
                  type="button" 
                  onClick={handleCancelDelete} 
                  className="btn-cancel-delete"
                >
                  No
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

