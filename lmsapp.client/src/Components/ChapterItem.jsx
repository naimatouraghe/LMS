import { Lock, PlayCircle, CheckCircle } from 'lucide-react';
import { cn } from '@/lib/utils';

const ChapterItem = ({
  title,
  isPublished,
  isFree,
  isLocked,
  isCurrent,
  hasPurchased,
  onClick,
  isCompleted,
}) => {
  return (
    <button
      onClick={onClick}
      className={cn(
        'flex w-full items-center gap-x-3 text-sm font-medium p-4 hover:bg-slate-100/80 transition-all border-b',
        {
          'text-emerald-700 bg-emerald-50': isCompleted === true,
          'bg-slate-100/80': isCurrent && !isCompleted,
          'opacity-50 cursor-not-allowed': !isPublished,
        }
      )}
      disabled={!isPublished}
    >
      <div className="flex items-center gap-x-2 flex-1">
        {isCompleted === true ? (
          <CheckCircle className="h-4 w-4 text-emerald-700" />
        ) : (
          <>
            {isLocked ? (
              <Lock className="h-4 w-4 text-slate-500" />
            ) : (
              <PlayCircle
                className={cn(
                  'h-4 w-4',
                  isCurrent ? 'text-slate-700' : 'text-slate-500'
                )}
              />
            )}
          </>
        )}
        <span>{title}</span>
      </div>
    </button>
  );
};

export default ChapterItem;
