import React from 'react';
import type { WatchBoxItem } from '../types';
import { TitleCard } from './TitleCard';

interface SectionListProps {
  title: string;
  items: WatchBoxItem[];
  onDelete: (id: string) => void;
  onMove: (id: string, newListType: 'top' | 'watch') => void;
}

export function SectionList({ title, items, onDelete, onMove }: SectionListProps) {
  return (
    <div className="section-list">
      <h2 className="section-title">{title}</h2>
      <div className="cards-grid">
        {items.length === 0 ? (
          <div className="empty-state">
            <div className="empty-state-illustration">📺</div>
            <h3 className="empty-state-title">Your {title} is empty</h3>
            <p className="empty-state-message">Start adding titles to build your collection</p>
          </div>
        ) : (
          items.map((item) => (
            <TitleCard
              key={item.id}
              item={item}
              onDelete={onDelete}
              onMove={onMove}
            />
          ))
        )}
      </div>
    </div>
  );
}

