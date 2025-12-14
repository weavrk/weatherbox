import { useState, useEffect, useRef } from 'react';
import type { User, WatchBoxItem } from '../types';
import type { ExploreItem } from '../services/api';
import { getExploreContent } from '../services/api';
import { TitleCard } from './TitleCard';

interface ExploreTabProps {
  currentUser: User;
  onAddItem: () => void;
  onAddToWatchlist: (item: WatchBoxItem) => Promise<void>;
}

const ITEMS_PER_LOAD = 20;

export function ExploreTab({ onAddToWatchlist }: ExploreTabProps) {
  const [allContent, setAllContent] = useState<ExploreItem[]>([]);
  const [displayedContent, setDisplayedContent] = useState<ExploreItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [loadedCount, setLoadedCount] = useState(ITEMS_PER_LOAD);
  const [hasMore, setHasMore] = useState(true);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
  const observerTarget = useRef<HTMLDivElement>(null);

  const loadInitialContent = async () => {
    setLoading(true);
    try {
      const { content, lastUpdated } = await getExploreContent();
      setAllContent(content);
      setHasMore(content.length > ITEMS_PER_LOAD);
      setDisplayedContent(content.slice(0, ITEMS_PER_LOAD));
      setLastUpdated(lastUpdated);
    } catch (error) {
      console.error('Failed to load explore content:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadMore = () => {
    if (loadingMore || !hasMore) return;
    
    setLoadingMore(true);
    // Simulate a small delay for better UX
    setTimeout(() => {
      const nextCount = loadedCount + ITEMS_PER_LOAD;
      const newItems = allContent.slice(loadedCount, nextCount);
      
      if (newItems.length > 0) {
        setDisplayedContent(prev => [...prev, ...newItems]);
        setLoadedCount(nextCount);
        setHasMore(nextCount < allContent.length);
      } else {
        setHasMore(false);
      }
      setLoadingMore(false);
    }, 100);
  };

  useEffect(() => {
    loadInitialContent();
  }, []);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasMore && !loadingMore) {
          loadMore();
        }
      },
      { threshold: 0.1 }
    );

    const currentTarget = observerTarget.current;
    if (currentTarget && hasMore) {
      observer.observe(currentTarget);
    }

    return () => {
      if (currentTarget) {
        observer.unobserve(currentTarget);
      }
    };
  }, [hasMore, loadingMore, loadedCount, allContent.length]);

  const convertToWatchBoxItem = (item: ExploreItem): WatchBoxItem => {
    return {
      id: item.id,
      title: item.title,
      tmdb_id: item.tmdb_id,
      poster_filename: item.poster_filename,
      listType: 'watch',
      services: item.services,
      isMovie: item.isMovie, // Include isMovie field
      // Include extended TMDB data
      genres: item.genres,
      overview: item.overview,
      vote_average: item.vote_average,
      vote_count: item.vote_count,
      runtime: item.runtime,
      cast: item.cast,
      crew: item.crew,
      keywords: item.keywords,
      videos: item.videos,
      // Additional TMDB data
      recommendations: item.recommendations,
      similar: item.similar,
      translations: item.translations,
      networks: item.networks,
      number_of_seasons: item.number_of_seasons,
      number_of_episodes: item.number_of_episodes
    };
  };

  if (loading) {
    return <div className="loading">Loading explore content...</div>;
  }

  const formatLastUpdated = (date: Date | null): string => {
    if (!date) return '';
    
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);
    
    // Format relative time
    let relativeTime = '';
    if (diffMins < 1) {
      relativeTime = 'Just now';
    } else if (diffMins < 60) {
      relativeTime = `${diffMins} minute${diffMins !== 1 ? 's' : ''} ago`;
    } else if (diffHours < 24) {
      relativeTime = `${diffHours} hour${diffHours !== 1 ? 's' : ''} ago`;
    } else if (diffDays < 7) {
      relativeTime = `${diffDays} day${diffDays !== 1 ? 's' : ''} ago`;
    } else {
      relativeTime = `${diffDays} day${diffDays !== 1 ? 's' : ''} ago`;
    }
    
    // Format date/time: 12/13/25 @ 11:04pm
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const day = date.getDate().toString().padStart(2, '0');
    const year = date.getFullYear().toString().slice(-2);
    const hours = date.getHours();
    const minutes = date.getMinutes().toString().padStart(2, '0');
    const ampm = hours >= 12 ? 'pm' : 'am';
    const displayHours = hours % 12 || 12;
    
    const dateTime = `${month}/${day}/${year} @ ${displayHours}:${minutes}${ampm}`;
    
    return `${relativeTime}, ${dateTime}`;
  };

  return (
    <div className="explore-tab">
      {lastUpdated && (
        <div className="explore-last-updated">
          Updated {formatLastUpdated(lastUpdated)}
        </div>
      )}
      <div className="explore-grid">
        {displayedContent.map((item, index) => {
          const watchBoxItem = convertToWatchBoxItem(item);
          // Create unique key using tmdb_id, isMovie, and index to avoid duplicates
          const uniqueKey = `explore-${item.tmdb_id}-${item.isMovie ? 'movie' : 'show'}-${index}`;
          return (
            <TitleCard
              key={uniqueKey}
              item={watchBoxItem}
              onDelete={() => {}}
              onMove={() => {}}
              onAddToWatchlist={onAddToWatchlist}
            />
          );
        })}
      </div>
      
      {hasMore && (
        <div ref={observerTarget} style={{ height: '20px', marginTop: '20px' }}>
          {loadingMore && <div className="loading-more">Loading more...</div>}
        </div>
      )}
    </div>
  );
}

