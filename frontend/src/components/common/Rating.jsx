import { Star } from 'lucide-react';
import { cn } from '../../lib/utils.js';

export const Rating = ({ value = 0, count, size = 'sm', interactive = false, onChange }) => {
  const sizeMap = { sm: 'h-4 w-4', md: 'h-5 w-5', lg: 'h-6 w-6' };
  return (
    <div className="inline-flex items-center gap-1">
      {[1, 2, 3, 4, 5].map((star) => (
        <button
          key={star}
          type="button"
          disabled={!interactive}
          onClick={() => interactive && onChange?.(star)}
          className={cn(interactive && 'hover:scale-110 transition-transform cursor-pointer')}
        >
          <Star
            className={cn(
              sizeMap[size],
              star <= Math.round(value)
                ? 'fill-yellow-400 text-yellow-400'
                : 'fill-muted text-muted'
            )}
          />
        </button>
      ))}
      {count !== undefined && (
        <span className="text-xs text-muted-foreground ml-1">({count})</span>
      )}
    </div>
  );
};
