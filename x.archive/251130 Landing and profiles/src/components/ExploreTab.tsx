import React, { useState, useEffect, useRef } from 'react';
import type { User, WatchBoxItem } from '../types';
import type { ExploreItem } from '../services/api';
import { getExploreContent } from '../services/api';
import { TitleCard } from './TitleCard';

interface ExploreTabProps {
  currentUser: User;
  onAddItem: () => void;
}

export function ExploreTab({ currentUser }: ExploreTabProps) {
  const [allContent, setAllContent] = useState<ExploreItem[]>([]);
  const [filteredContent, setFilteredContent] = useState<ExploreItem[]>([]);
  const [displayedContent, setDisplayedContent] = useState<ExploreItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    type: 'all', // 'all', 'movie', 'show'
    year: 'all',
    service: 'all'
  });
  const [loadedCount, setLoadedCount] = useState(20);
  const observerTarget = useRef<HTMLDivElement>(null);

  const loadContent = async () => {
    setLoading(true);
    try {
      const content = await getExploreContent();
      setAllContent(content);
    } catch (error) {
      console.error('Failed to load explore content:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadContent();
  }, []);

  useEffect(() => {
    let filtered = [...allContent];

    // Filter by type
    if (filters.type === 'movie') {
      filtered = filtered.filter(item => item.isMovie);
    } else if (filters.type === 'show') {
      filtered = filtered.filter(item => !item.isMovie);
    }

    // Filter by service
    if (filters.service !== 'all') {
      filtered = filtered.filter(item => 
        item.services.some(s => s.toLowerCase() === filters.service.toLowerCase())
      );
    }

    // Filter by year
    if (filters.year !== 'all') {
      const year = parseInt(filters.year);
      filtered = filtered.filter(item => {
        const date = item.isMovie ? item.release_date : item.first_air_date;
        if (!date) return false;
        const itemYear = new Date(date).getFullYear();
        return itemYear === year;
      });
    }

    setFilteredContent(filtered);
    setLoadedCount(20); // Reset loaded count when filters change
  }, [filters, allContent]);

  useEffect(() => {
    setDisplayedContent(filteredContent.slice(0, loadedCount));
  }, [filteredContent, loadedCount]);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && loadedCount < filteredContent.length) {
          setLoadedCount(prev => Math.min(prev + 20, filteredContent.length));
        }
      },
      { threshold: 0.1 }
    );

    const currentTarget = observerTarget.current;
    if (currentTarget && loadedCount < filteredContent.length) {
      observer.observe(currentTarget);
    }

    return () => {
      if (currentTarget) {
        observer.unobserve(currentTarget);
      }
    };
  }, [loadedCount, filteredContent.length]);

  const getAvailableYears = (): number[] => {
    const years = new Set<number>();
    allContent.forEach(item => {
      const date = item.isMovie ? item.release_date : item.first_air_date;
      if (date) {
        years.add(new Date(date).getFullYear());
      }
    });
    return Array.from(years).sort((a, b) => b - a).slice(0, 20); // Last 20 years
  };

  const getAvailableServices = (): string[] => {
    const services = new Set<string>();
    allContent.forEach(item => {
      item.services.forEach(s => services.add(s));
    });
    return Array.from(services).sort();
  };

  const convertToWatchBoxItem = (item: ExploreItem): WatchBoxItem => {
    return {
      id: item.id,
      title: item.title,
      tmdb_id: item.tmdb_id,
      poster_filename: item.poster_filename,
      listType: 'watch',
      services: item.services
    };
  };

  if (loading) {
    return <div className="loading">Loading explore content...</div>;
  }

  const availableYears = getAvailableYears();
  const availableServices = getAvailableServices();

  return (
    <div className="explore-tab">
      <div className="explore-filters">
        <select
          className="filter-select"
          value={filters.type}
          onChange={(e) => setFilters({ ...filters, type: e.target.value })}
        >
          <option value="all">All</option>
          <option value="movie">Movies</option>
          <option value="show">Shows</option>
        </select>
        
        <select
          className="filter-select"
          value={filters.service}
          onChange={(e) => setFilters({ ...filters, service: e.target.value })}
        >
          <option value="all">All Services</option>
          {availableServices.map(service => (
            <option key={service} value={service}>
              {service.charAt(0).toUpperCase() + service.slice(1)}
            </option>
          ))}
        </select>
        
        <select
          className="filter-select"
          value={filters.year}
          onChange={(e) => setFilters({ ...filters, year: e.target.value })}
        >
          <option value="all">All Years</option>
          {availableYears.map(year => (
            <option key={year} value={year.toString()}>
              {year}
            </option>
          ))}
        </select>
      </div>

      <div className="explore-grid">
        {displayedContent.map((item) => {
          const watchBoxItem = convertToWatchBoxItem(item);
          return (
            <TitleCard
              key={item.id}
              item={watchBoxItem}
              onDelete={() => {}}
              onMove={() => {}}
            />
          );
        })}
      </div>
      
      {loadedCount < displayedContent.length && (
        <div ref={observerTarget} style={{ height: '20px', marginTop: '20px' }} />
      )}
    </div>
  );
}

