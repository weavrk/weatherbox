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
          <p className="empty-message">No items yet</p>
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

