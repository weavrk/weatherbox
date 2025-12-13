import React, { useState, useRef, useEffect } from 'react';
import { getAvatarUrl } from '../services/api';
import { extractDominantColor } from '../utils/colorExtraction';

interface HeaderProps {
  avatarFilename: string;
  userName: string;
  onAddClick: () => void;
  onSwitchAccount: () => void;
}

export function Header({ avatarFilename, userName, onAddClick, onSwitchAccount }: HeaderProps) {
  const [menuOpen, setMenuOpen] = useState(false);
  const [avatarColor, setAvatarColor] = useState<string>('#4A90E2');
  const imageRef = useRef<HTMLImageElement | null>(null);

  const handleImageLoad = (img: HTMLImageElement) => {
    const color = extractDominantColor(img);
    setAvatarColor(color);
  };

  return (
    <header className="app-header">
      <div className="header-left">
        <h1 className="app-title">WatchBox</h1>
        <button className="add-button" onClick={onAddClick} aria-label="Add item">
          <span className="add-icon">+</span>
        </button>
      </div>
      <div className="header-right">
        <span className="header-user-name">{userName}</span>
        <button
          className="avatar-button"
          onClick={() => setMenuOpen(!menuOpen)}
          aria-label="User menu"
          style={{
            backgroundColor: avatarColor
          }}
        >
          <img
            ref={(img) => {
              if (img) {
                imageRef.current = img;
              }
            }}
            src={getAvatarUrl(avatarFilename)}
            alt="User avatar"
            className="avatar-image"
            onLoad={(e) => {
              const img = e.target as HTMLImageElement;
              handleImageLoad(img);
            }}
          />
        </button>
        {menuOpen && (
          <>
            <div className="menu-overlay" onClick={() => setMenuOpen(false)} />
            <div className="user-dropdown-menu">
              <button onClick={onSwitchAccount} className="menu-item">
                Switch account
              </button>
            </div>
          </>
        )}
      </div>
    </header>
  );
}

