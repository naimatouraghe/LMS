import { Lock, PlayCircle, CheckCircle } from 'lucide-react';
import { cn } from '@/lib/utils';

const ChapterItem = ({
  title,
  position,
  isPublished,
  isFree,
  hasPurchased,
  onClick,
  isCompleted,
  isCurrent,
}) => {
  const isLocked = !isFree && !hasPurchased;

  return (
    <button
      onClick={onClick}
      className={cn(
        'flex w-full items-center p-4 hover:bg-slate-100/80 transition-all border-b',
        {
          'text-emerald-700 bg-emerald-50': isCompleted === true,
          'bg-slate-100/80': isCurrent && !isCompleted,
          'opacity-75': isLocked,
        }
      )}
    >
      <div className="flex items-center gap-x-3 flex-1 min-w-0">
        <div className="flex-shrink-0">
          {isCompleted ? (
            <CheckCircle className="h-5 w-5 text-emerald-700" />
          ) : (
            <>
              {isLocked ? (
                <Lock className="h-5 w-5 text-slate-500" />
              ) : (
                <PlayCircle
                  className={cn(
                    'h-5 w-5',
                    isCurrent ? 'text-slate-700' : 'text-slate-500'
                  )}
                />
              )}
            </>
          )}
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-x-2">
            <span className="text-sm font-medium truncate">
              {position}. {title}
            </span>
            {isFree && (
              <span className="text-xs bg-green-100 text-green-800 px-2 py-0.5 rounded">
                Gratuit
              </span>
            )}
          </div>
        </div>
      </div>
    </button>
  );
};

export default ChapterItem;
