import { BookOpen, CheckCircle, Lock, PlayCircle } from "lucide-react";
import { Link } from "react-router-dom";
import { Progress } from "./ui/progress";

export const CourseCard = ({ course, progress }) => {
    if (!course) {
        return null;
    }

    const formatPrice = (price) => {
        return new Intl.NumberFormat('fr-FR', {
            style: 'currency',
            currency: 'EUR'
        }).format(price);
    };

    // Détermine le statut du cours
    const isPurchased = progress !== undefined;
    const isCompleted = progress === 100;
    const isInProgress = progress > 0 && progress < 100;

    return (
        <Link 
            to={isPurchased ? `/courses/${course.id}` : `/courses`}
            className={`group relative flex flex-col overflow-hidden rounded-lg border 
                hover:shadow-sm transition ${isCompleted ? 'border-green-200 bg-green-50' : ''}`}
        >
            {/* Badge de statut */}
            {isPurchased && (
                <div className="absolute top-2 right-2 z-10 bg-white p-2 rounded-full shadow">
                    {isCompleted && <CheckCircle className="h-4 w-4 text-green-600" />}
                    {isInProgress && <PlayCircle className="h-4 w-4 text-blue-600" />}
                </div>
            )}

            {/* Overlay pour cours non achetés */}
            {!isPurchased && (
                <div className="absolute inset-0 bg-slate-800/60 z-10 flex items-center justify-center opacity-0 group-hover:opacity-100 transition">
                    <Lock className="h-8 w-8 text-white" />
                </div>
            )}

            {/* Image */}
            <div className="relative aspect-video w-full overflow-hidden">
                <img
                    className={`object-cover w-full h-full ${!isPurchased ? 'group-hover:scale-105 transition' : ''}`}
                    alt={course.title}
                    src={course.imageUrl || "/placeholder-course.jpg"}
                    onError={(e) => {
                        e.target.src = "/placeholder-course.jpg";
                    }}
                />
            </div>
            
            {/* Content */}
            <div className="flex flex-col flex-grow p-4">
                {/* Title */}
                <h3 className="text-lg font-medium text-slate-700 line-clamp-2">
                    {course.title}
                </h3>
                
                {/* Description */}
                <p className="text-sm text-slate-500 mt-1 line-clamp-2">
                    {course.description}
                </p>
                
                {/* Category */}
                <p className="text-xs text-slate-400 mt-2">
                    {course.category?.name}
                </p>
                
                {/* Chapters count */}
                <div className="flex items-center gap-x-2 text-sm text-slate-500 mt-4">
                    <BookOpen className="h-4 w-4" />
                    <span>
                        {course.chapters?.length || 0} 
                        {course.chapters?.length === 1 ? ' Chapitre' : ' Chapitres'}
                    </span>
                </div>

                {/* Progress bar pour les cours achetés */}
                {isPurchased && (
                    <div className="mt-4">
                        <Progress 
                            value={progress} 
                            className={`h-2 ${
                                isCompleted ? 'bg-green-200' : 'bg-blue-200'
                            }`}
                        />
                        <p className="text-sm text-slate-500 mt-2">
                            {isCompleted ? 'Cours terminé' : `${Math.round(progress)}% complété`}
                        </p>
                    </div>
                )}

                {/* Prix (uniquement pour les cours non achetés) */}
                {!isPurchased && (
                    <div className="mt-auto pt-4">
                        <p className="text-lg font-medium text-slate-700">
                            {formatPrice(course.price)}
                        </p>
                    </div>
                )}
            </div>
        </Link>
    );
};