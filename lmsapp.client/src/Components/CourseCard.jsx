import { BookOpen } from "lucide-react";
import { Link } from "react-router-dom";

export const CourseCard = ({
    id,
    title,
    imageUrl,
    category,
    chapters,
    price,
    progress,
    purchases = [],
    currentUserId
}) => {
    const isPurchased = purchases.some(purchase => purchase.userId === currentUserId);
    const totalChapters = chapters.length;
    
    // Calculer le pourcentage de progression
    const completedChapters = chapters.filter(chapter => 
        chapter.userProgress?.some(
            progress => progress.userId === currentUserId && progress.isCompleted
        )
    ).length;
    
    const progressPercentage = Math.round((completedChapters / totalChapters) * 100);
    const isCompleted = progressPercentage === 100;

    return (
        <Link 
            to={`/courses/${id}`}
            className="group relative flex flex-col overflow-hidden rounded-lg border hover:shadow-sm transition"
        >
            {/* Image */}
            <div className="relative aspect-video w-full overflow-hidden">
                <img
                    className="object-cover w-full h-full"
                    alt={title}
                    src={imageUrl || "/default-course-image.jpg"}
                />
            </div>
            
            {/* Content */}
            <div className="flex flex-col flex-grow p-4">
                {/* Title */}
                <h3 className="text-lg font-medium text-slate-700 line-clamp-2">
                    {title}
                </h3>
                
                {/* Category */}
                <p className="text-sm text-slate-500 mt-1">
                    {category?.name}
                </p>
                
                {/* Chapters count */}
                <div className="flex items-center gap-x-2 text-sm text-slate-500 mt-4">
                    <BookOpen className="h-4 w-4" />
                    <span>{totalChapters} Chapters</span>
                </div>

                {/* Progress or Price */}
                <div className="mt-auto pt-4">
                    {isPurchased ? (
                        <>
                            {/* Progress bar */}
                            <div className="h-2 w-full bg-slate-200 rounded-full">
                                <div 
                                    className={`h-full rounded-full transition-all ${
                                        isCompleted ? "bg-emerald-700" : "bg-sky-700"
                                    }`}
                                    style={{ width: `${progressPercentage}%` }}
                                />
                            </div>
                            
                            {/* Progress text */}
                            <div className="flex items-center justify-between mt-2">
                                <p className={`text-sm ${
                                    isCompleted ? "text-emerald-700" : "text-sky-700"
                                }`}>
                                    {progressPercentage}% Complete
                                </p>
                            </div>
                        </>
                    ) : (
                        <div className="text-lg font-medium text-slate-700">
                            {price ? `$${price.toFixed(2)}` : "Free"}
                        </div>
                    )}
                </div>
            </div>
        </Link>
    );
};