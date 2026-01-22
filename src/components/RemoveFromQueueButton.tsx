import { X } from 'lucide-react';

interface RemoveFromQueueButtonProps {
  onRemove: (e: React.MouseEvent) => void;
}

export function RemoveFromQueueButton({ onRemove }: RemoveFromQueueButtonProps) {
  const handleClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();
    onRemove(e);
  };

  return (
    <button
      className="remove-from-queue-button"
      onClick={handleClick}
      aria-label="Remove from queue"
      data-button="remove-from-queue"
    >
      <div className="icon-wrapper">
        <X size={20} />
      </div>
    </button>
  );
}

