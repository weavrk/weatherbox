import React, { useState, useEffect, useRef } from 'react';
import { Check } from 'lucide-react';
import { getAvatarUrl, getAvailableAvatars, getAvailableStreamingServices, getServiceIcon, getServiceLabel, getServiceKey, clearAvatarCache } from '../services/api';
import { extractDominantColor } from '../utils/colorExtraction';

interface CreateProfileModalProps {
  onClose: () => void;
  onCreate: (name: string, avatarFilename: string, streamingServices: string[], birthday: string) => void;
}

export function CreateProfileModal({ onClose, onCreate }: CreateProfileModalProps) {
  const [name, setName] = useState('');
  const [selectedAvatar, setSelectedAvatar] = useState<string | null>(null);
  const [selectedServices, setSelectedServices] = useState<string[]>([]);
  const [availableAvatars, setAvailableAvatars] = useState<string[]>([]);
  const [availableServices, setAvailableServices] = useState<string[]>([]);
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
      // Set first avatar as default
      if (avatars.length > 0 && !selectedAvatar) {
        setSelectedAvatar(avatars[0]);
      }
    });
    
    // Load streaming services on mount
    getAvailableStreamingServices().then(services => {
      setAvailableServices(services);
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

  const handleServiceToggle = (service: string) => {
    setSelectedServices(prev => 
      prev.includes(service) 
        ? prev.filter(s => s !== service)
        : [...prev, service]
    );
  };

  const formatBirthday = (): string => {
    if (!month && !day && !year) return '';
    
    // Pad month and day with leading zeros if needed
    const paddedMonth = month.padStart(2, '0');
    const paddedDay = day.padStart(2, '0');
    
    return `${paddedMonth}/${paddedDay}/${year}`;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (name.trim() && selectedAvatar) {
      const birthday = formatBirthday();
      onCreate(name.trim(), selectedAvatar, selectedServices, birthday);
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
          <div className="form-group">
            <label>Streaming Service Subscriptions</label>
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
                    <span className="service-label">{serviceLabel}</span>
                  </button>
                );
              })}
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

