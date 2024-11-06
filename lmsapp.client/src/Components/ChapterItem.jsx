import { PlayCircle } from 'lucide-react';

const ChapterItem = ({ 
    title, 
    position,
    isPublished,
    isFree,
    videoUrl,
    isCurrent,
    onClick 
}) => {
    return (
        <button
            onClick={onClick}
            className={`
                flex items-center gap-3 p-4 hover:bg-slate-100 transition border-b
                ${isCurrent ? 'bg-slate-100 relative before:absolute before:left-0 before:top-0 before:h-full before:w-1 before:bg-slate-800' : ''}
                ${!isPublished ? 'opacity-50' : ''}
            `}
            disabled={!isPublished}
        >
            <div className="flex-shrink-0">
                <PlayCircle className="h-5 w-5 text-slate-500" />
            </div>
            <div className="flex-1 text-left">
                <div className="flex items-center gap-x-2">
                    <h3 className="text-sm font-medium">{title}</h3>
                    {isFree && (
                        <span className="text-xs bg-blue-100 text-blue-700 px-2 py-0.5 rounded">
                            Free
                        </span>
                    )}
                </div>
                <p className="text-xs text-slate-500">Chapter {position}</p>
            </div>
        </button>
    );
};

export default ChapterItem;