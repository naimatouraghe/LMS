import { Lock, PlayCircle } from 'lucide-react';
import { cn } from '@/lib/utils';

const ChapterItem = ({
  title,
  position,
  isPublished,
  isFree,
  isLocked,
  isCurrent,
  hasPurchased,
  onClick,
}) => {
  return (
    <button
      onClick={onClick}
      className={cn(
        'flex w-full items-center gap-x-3 text-slate-700 text-sm p-3 hover:bg-slate-100/80 transition-all',
        isCurrent && 'bg-slate-100/80',
        !isPublished && 'opacity-50 cursor-not-allowed'
      )}
      disabled={!isPublished}
    >
      <div className="flex items-center gap-x-2 flex-1">
        {hasPurchased ? (
          // Si le cours est acheté, on montre toujours PlayCircle
          <>
            <PlayCircle className="h-4 w-4 text-slate-500" />
            <span className="text-slate-700">
              {position}.{title}
            </span>
          </>
        ) : (
          // Si le cours n'est pas acheté
          <>
            {isLocked ? (
              <Lock className="h-4 w-4 text-slate-500" />
            ) : (
              <PlayCircle className="h-4 w-4 text-slate-500" />
            )}
            <span className="text-slate-700">{title}</span>
          </>
        )}
      </div>
    </button>
  );
};

export default ChapterItem;
