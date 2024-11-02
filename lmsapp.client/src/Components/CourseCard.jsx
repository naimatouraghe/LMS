import { BookOpen } from "lucide-react";
import { Link } from "react-router-dom";

export const CourseCard = ({ course }) => {

    if (!course) {
        return null;
    }
    const formatPrice = (price) => {
        return new Intl.NumberFormat('fr-FR', {
            style: 'currency',
            currency: 'EUR'
        }).format(price);
    };

    return (
        <Link 
            to={`/courses`}
            className="group relative flex flex-col overflow-hidden rounded-lg border hover:shadow-sm transition"
        >
            {/* Image */}
            <div className="relative aspect-video w-full overflow-hidden">
                <img
                    className="object-cover w-full h-full"
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

                {/* Price */}
                <div className="mt-auto pt-4">
                    <p className="text-lg font-medium text-slate-700">
                        {formatPrice(course.price)}
                    </p>
                </div>
            </div>
        </Link>
    );
};
