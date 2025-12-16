import { useState, useRef, useEffect } from 'react';
import { getAvatarUrl } from '../services/api';
import { extractDominantColor } from '../utils/colorExtraction';
import { Logo } from './Logo';
import { ArrowLeft, User, LogOut } from 'lucide-react';

interface HeaderProps {
  avatarFilename: string;
  userName: string;
  onSwitchAccount: () => void;
  onEditProfile: () => void;
  onDeleteAccount: () => void;
  onRequestAccountMenu?: (callback: () => void) => void;
}

export function Header({ avatarFilename, userName, onSwitchAccount, onEditProfile, onDeleteAccount, onRequestAccountMenu }: HeaderProps) {
  const [avatarColor, setAvatarColor] = useState<string>('#4A90E2');
  const imageRef = useRef<HTMLImageElement | null>(null);
  const [showMobileAccount, setShowMobileAccount] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  
  // Reset account menu state when user changes (e.g., from landing page)
  // This ensures the menu is closed when a profile is selected from landing page
  useEffect(() => {
    setShowMobileAccount(false);
    setShowDeleteConfirm(false);
  }, [avatarFilename, userName]);
  
  // Ensure menu stays closed on initial mount (when coming from landing page)
  useEffect(() => {
    setShowMobileAccount(false);
  }, []);

  // Expose method to show account menu externally (only when explicitly requested)
  useEffect(() => {
    if (onRequestAccountMenu) {
      onRequestAccountMenu(() => {
        setShowMobileAccount(true);
      });
    }
  }, [onRequestAccountMenu]);

  // Reset color when avatar changes to force re-extraction
  useEffect(() => {
    setAvatarColor('#4A90E2'); // Reset to default
    // If image is already loaded, extract color immediately
    if (imageRef.current && imageRef.current.complete) {
      const color = extractDominantColor(imageRef.current, avatarFilename);
      setAvatarColor(color);
    }
  }, [avatarFilename]);

  const handleImageLoad = (img: HTMLImageElement) => {
    // Ensure image is fully loaded before extracting
    if (img.complete && img.naturalWidth > 0) {
      const color = extractDominantColor(img, avatarFilename);
      setAvatarColor(color);
    }
  };

  // Hide main header when account menu is showing
  if (showMobileAccount) {
    return (
      <>
        <div className="mobile-account-menu">
          <div className="mobile-account-header">
            <button
              className="back-button-large"
              onClick={() => setShowMobileAccount(false)}
              aria-label="Back"
            >
              <ArrowLeft size={28} />
            </button>
            <h2>My Account</h2>
          </div>
          <div className="mobile-account-list">
            <button
              className="mobile-account-item with-icon"
              onClick={() => {
                // Don't close account menu - let edit profile appear on top
                // The edit profile will handle closing account menu when needed
                onEditProfile();
              }}
            >
              <User size={20} />
              <span>Edit Profile</span>
            </button>
            <button
              className="mobile-account-item with-icon"
              onClick={() => {
                setShowMobileAccount(false);
                onSwitchAccount();
              }}
            >
              <LogOut size={20} />
              <span>Switch Account</span>
            </button>
            <div className="mobile-account-delete-wrapper">
              <button
                className="mobile-account-item-delete"
                onClick={() => setShowDeleteConfirm(true)}
              >
                Delete Account
              </button>
            </div>
          </div>
        </div>
        {showDeleteConfirm && (
          <div className="delete-confirm-modal-overlay" onClick={() => setShowDeleteConfirm(false)}>
            <div className="delete-confirm-modal" onClick={(e) => e.stopPropagation()}>
              <h3>Delete Account?</h3>
              <p>This action cannot be undone. All your data will be permanently deleted.</p>
              <div className="delete-confirm-buttons">
                <button
                  className="delete-confirm-cancel"
                  onClick={() => setShowDeleteConfirm(false)}
                >
                  Cancel
                </button>
                <button
                  className="delete-confirm-delete"
                  onClick={() => {
                    setShowDeleteConfirm(false);
                    setShowMobileAccount(false);
                    onDeleteAccount();
                  }}
                >
                  Delete
                </button>
              </div>
            </div>
          </div>
        )}
      </>
    );
  }

  return (
    <header className="app-header">
      <div className="header-left">
        <Logo className="brand-logo-header" />
        <h1 className="app-title">WatchBox</h1>
      </div>
      <div className="header-right">
        <span className="header-user-name">{userName}</span>
        <button
          className="avatar-button"
          onClick={() => setShowMobileAccount(true)}
          aria-label="User menu"
          style={{
            backgroundColor: avatarColor
          }}
        >
          <img
            ref={(img) => {
              if (img) {
                imageRef.current = img;
                // If image is already loaded (cached), extract color immediately
                if (img.complete && img.naturalWidth > 0) {
                  handleImageLoad(img);
                }
              }
            }}
            src={getAvatarUrl(avatarFilename)}
            alt="User avatar"
            className="avatar-image"
            onLoad={(e) => {
              const img = e.target as HTMLImageElement;
              handleImageLoad(img);
            }}
            onError={() => {
              // Keep default color on error
              setAvatarColor('#4A90E2');
            }}
          />
        </button>
      </div>
    </header>
  );
}

