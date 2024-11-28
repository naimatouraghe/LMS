import { BookOpen, CheckCircle, Lock, PlayCircle } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Progress } from './common/Progress';
import { LoadingSpinner } from './common/LoadingSpinner';

export const CourseCard = ({ course, progress }) => {
  if (!course || !course.id || !course.title) {
    console.warn('Invalid course data:', course);
    return null;
  }

  const formatPrice = (price) => {
    return new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: 'EUR',
    }).format(price);
  };

  // Détermine le statut du cours
  const isPurchased = progress !== undefined;
  const isCompleted = progress >= 100;
  const isInProgress = progress > 0 && progress < 100;
  const isNotStarted = progress === 0;

  return (
    <Link
      to={`/courses/${course.id}`}
      className={`group relative flex flex-col overflow-hidden rounded-lg border 
                hover:shadow-sm transition ${
                  isCompleted ? 'border-green-200 bg-green-50' : ''
                }`}
    >
      {/* Badge de statut */}
      {isPurchased && (
        <div className="absolute top-2 right-2 z-10 bg-white p-2 rounded-full shadow">
          {isCompleted && <CheckCircle className="h-4 w-4 text-green-600" />}
          {(isInProgress || isNotStarted) && (
            <PlayCircle className="h-4 w-4 text-blue-600" />
          )}
        </div>
      )}

      {/* Image du cours */}
      <div className="relative aspect-video w-full overflow-hidden">
        <img
          className={`object-cover w-full h-full ${
            !isPurchased ? 'group-hover:scale-105 transition' : ''
          }`}
          alt={course.title}
          src={course.imageUrl || '/placeholder-course.jpg'}
          onError={(e) => {
            e.target.onerror = null;
            e.target.src = '/placeholder-course.jpg';
          }}
        />
      </div>

      {/* Contenu */}
      <div className="flex flex-col p-4">
        {/* Titre */}
        <div className="relative group/title">
          <h3 className="text-lg font-medium text-slate-700 mb-2 truncate whitespace-nowrap overflow-hidden">
            {course.title}
          </h3>
          <div className="absolute hidden group-hover/title:block z-50 bg-slate-800 text-white text-sm rounded-md py-1 px-2 -top-8 left-0">
            {course.title}
          </div>
        </div>

        {/* Catégorie */}
        <p className="text-sm text-slate-500 mb-2">{course.category?.name}</p>

        {/* Nombre de chapitres */}
        <div className="flex items-center gap-x-2 text-sm text-slate-500 mb-2">
          <BookOpen className="h-4 w-4" />
          <span>{course.chapters?.length || 0} Chapitres</span>
        </div>

        {/* Barre de progression pour les cours achetés */}
        {isPurchased && (
          <div className="mt-2">
            <Progress
              value={progress || 0}
              className="h-2"
              variant={isCompleted ? 'success' : 'default'}
            />
            <p className="text-sm text-emerald-700 mt-2">
              {progress ? `${Math.round(progress)}% Complete` : '0% Complete'}
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
