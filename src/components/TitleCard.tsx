import React, { useState } from 'react';
import type { WatchBoxItem } from '../types';
import { getPosterUrl, getServiceIcon } from '../services/api';

interface TitleCardProps {
  item: WatchBoxItem;
  onDelete: (id: string) => void;
  onMove: (id: string, newListType: 'top' | 'watch') => void;
}

export function TitleCard({ item, onDelete, onMove }: TitleCardProps) {
  const [menuOpen, setMenuOpen] = useState(false);

  const handleMenuToggle = (e: React.MouseEvent) => {
    e.stopPropagation();
    setMenuOpen(!menuOpen);
  };

  const handleDelete = () => {
    onDelete(item.id);
    setMenuOpen(false);
  };

  const handleMove = () => {
    const newType = item.listType === 'top' ? 'watch' : 'top';
    onMove(item.id, newType);
    setMenuOpen(false);
  };

  return (
    <div className="title-card">
      <div className="poster-container">
        <img
          src={getPosterUrl(item.poster_filename || item.poster_id || '1.svg')}
          alt={item.title}
          className="poster-image"
          loading="lazy"
        />
      </div>
      <div className="title-info">
        <span className="title-text">{item.title}</span>
        <div className="title-actions">
          {item.services.length > 0 && (
            <img
              src={getServiceIcon(item.services[0])}
              alt={item.services[0]}
              className="service-icon"
            />
          )}
          <button 
            className="menu-button"
            onClick={handleMenuToggle}
            aria-label="Options"
          >
            ⋮
          </button>
        </div>
      </div>
      {menuOpen && (
        <>
          <div className="menu-overlay" onClick={() => setMenuOpen(false)} />
          <div className="dropdown-menu">
            <button onClick={handleMove} className="menu-item">
              Move to {item.listType === 'top' ? 'Watchlist' : 'Top List'}
            </button>
            <button onClick={handleDelete} className="menu-item delete">
              Delete
            </button>
          </div>
        </>
      )}
    </div>
  );
}

