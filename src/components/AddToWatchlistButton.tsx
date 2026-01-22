import { useState } from 'react';
import { Plus, Check } from 'lucide-react';
import './AddToWatchlistButton.css';

interface AddToWatchlistButtonProps {
  isAdded: boolean;
  onAdd: (e: React.MouseEvent) => void;
  onRemove?: (e: React.MouseEvent) => void;
}

export function AddToWatchlistButton({ isAdded, onAdd, onRemove }: AddToWatchlistButtonProps) {
  const [isAnimating, setIsAnimating] = useState(false);

  const handleClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();
    
    if (isAdded && onRemove) {
      // Remove from watchlist
      onRemove(e);
    } else if (!isAdded) {
      // Add to watchlist with animation
      setIsAnimating(true);
      onAdd(e);
      // Reset animation after it completes
      setTimeout(() => setIsAnimating(false), 500);
    }
  };

  return (
    <button
      className={`add-to-watchlist-button ${isAdded ? 'is-added' : ''} ${isAnimating ? 'is-animating' : ''}`}
      onClick={handleClick}
      aria-label={isAdded ? 'Remove from watchlist' : 'Add to watchlist'}
      data-button="add-to-watchlist"
    >
      <div className="icon-wrapper">
        {isAdded ? <Check size={20} /> : <Plus size={20} />}
      </div>
    </button>
  );
}
