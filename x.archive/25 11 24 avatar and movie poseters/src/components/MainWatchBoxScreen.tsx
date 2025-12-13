import React, { useEffect, useState } from 'react';
import { useUser } from '../contexts/UserContext';
import { Header } from './Header';
import { SectionList } from './SectionList';
import { saveUser } from '../services/api';
import type { WatchBoxItem } from '../types';

export function MainWatchBoxScreen() {
  const { currentUser, logout } = useUser();
  const [items, setItems] = useState<WatchBoxItem[]>([]);

  useEffect(() => {
    if (currentUser) {
      setItems(currentUser.items);
    }
  }, [currentUser]);

  const handleDelete = async (id: string) => {
    if (!currentUser) return;
    
    const updatedItems = items.filter(item => item.id !== id);
    setItems(updatedItems);
    
    // Save to backend
    await saveUser({
      user_id: currentUser.user_id,
      name: currentUser.name,
      avatar_filename: currentUser.avatar_filename,
      items: updatedItems,
    });
  };

  const handleMove = async (id: string, newListType: 'top' | 'watch') => {
    if (!currentUser) return;
    
    const updatedItems = items.map(item =>
      item.id === id ? { ...item, listType: newListType } : item
    );
    setItems(updatedItems);
    
    // Save to backend
    await saveUser({
      user_id: currentUser.user_id,
      name: currentUser.name,
      avatar_filename: currentUser.avatar_filename,
      items: updatedItems,
    });
  };

  const handleAddClick = () => {
    alert('Add flow coming soon!');
  };

  if (!currentUser) {
    return <div>Loading...</div>;
  }

  const topListItems = items.filter(item => item.listType === 'top');
  const watchlistItems = items.filter(item => item.listType === 'watch');

  return (
    <div className="main-screen">
      <Header
        avatarFilename={currentUser.avatar_filename}
        userName={currentUser.name}
        onAddClick={handleAddClick}
        onSwitchAccount={logout}
      />
      <main className="content">
        <SectionList
          title="Top List"
          items={topListItems}
          onDelete={handleDelete}
          onMove={handleMove}
        />
        <SectionList
          title="Watchlist"
          items={watchlistItems}
          onDelete={handleDelete}
          onMove={handleMove}
        />
      </main>
    </div>
  );
}

