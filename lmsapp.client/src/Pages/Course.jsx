import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, CheckCircle, Lock, AlertCircle } from 'lucide-react';
import { courseApi } from '@/services/api/courseApi';
import { progressApi } from '@/services/api/progressApi';
import { toast } from 'react-hot-toast';

import ChapterItem from '@/components/ChapterItem';
import { useAuth } from '@/contexts/AuthContext';

const Course = () => {
  const { courseId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [course, setCourse] = useState(null);
  const [chapters, setChapters] = useState([]);
  const [currentChapter, setCurrentChapter] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [userProgress, setUserProgress] = useState([]);
  const [error, setError] = useState(null);
  const [completionPercentage, setCompletionPercentage] = useState(0);
  const [hasPurchased, setHasPurchased] = useState(false);

  useEffect(() => {
    const fetchCourseData = async () => {
      try {
        setIsLoading(true);
        setError(null);

        // 1. Charger les données du cours (accessible à tous)
        const [courseRes, chaptersRes] = await Promise.all([
          courseApi.getCourse(courseId),
          courseApi.getCourseChapters(courseId),
        ]);

        setCourse(courseRes);

        // 2. Si l'utilisateur est connecté, charger sa progression et vérifier l'achat
        if (user?.id) {
          console.log("Vérification de l'achat pour l'utilisateur:", user.id);

          const purchaseCheck = await courseApi.hasUserPurchasedCourse(
            courseId
          );
          console.log("Résultat de la vérification d'achat:", purchaseCheck);

          setHasPurchased(purchaseCheck === true);

          const [progressRes, percentageRes] = await Promise.all([
            progressApi.getCourseProgress(courseId),
            progressApi.getCourseCompletionPercentage(courseId),
          ]);

          setUserProgress(progressRes?.value || []);
          setCompletionPercentage(percentageRes?.value || 0);
        }

        // 3. Organiser les chapitres
        const chaptersData = chaptersRes?.value || [];
        if (Array.isArray(chaptersData)) {
          const sortedChapters = chaptersData.sort(
            (a, b) => a.position - b.position
          );
          setChapters(sortedChapters);

          // Sélectionner le premier chapitre accessible
          if (!currentChapter) {
            const nextChapter = sortedChapters.find(
              (ch) => ch.isPublished && (ch.isFree || hasPurchased)
            );

            if (nextChapter) {
              setCurrentChapter(nextChapter);
            }
          }
        }
      } catch (error) {
        console.error('Error in fetchCourseData:', error);
        setError('Une erreur est survenue lors du chargement du cours');
        toast.error('Erreur de chargement du cours');
      } finally {
        setIsLoading(false);
      }
    };

    fetchCourseData();
  }, [courseId, user?.id]);

  const handleChapterComplete = async () => {
    if (!user?.id) {
      toast.error('Vous devez être connecté pour suivre votre progression');
      return;
    }

    try {
      await progressApi.markChapterAsCompleted(currentChapter.id);

      setUserProgress((prev) => [
        ...prev.filter((p) => p.chapterId !== currentChapter.id),
        { chapterId: currentChapter.id, isCompleted: true },
      ]);

      // Mettre à jour le pourcentage de complétion
      const newPercentage = await progressApi.getCourseCompletionPercentage(
        courseId
      );
      setCompletionPercentage(newPercentage.value);

      toast.success('Chapitre terminé !');

      // Passer au chapitre suivant
      const currentIndex = chapters.findIndex(
        (ch) => ch.id === currentChapter.id
      );
      const nextChapter = chapters[currentIndex + 1];
      if (
        nextChapter &&
        nextChapter.isPublished &&
        (nextChapter.isFree || hasPurchased)
      ) {
        setCurrentChapter(nextChapter);
        toast.success('Passage au chapitre suivant');
      }
    } catch (error) {
      console.error('Error completing chapter:', error);
      toast.error('Erreur lors de la validation du chapitre');
    }
  };

  const canAccessChapter = (chapter) => {
    return chapter.isFree || hasPurchased;
  };

  const isChapterCompleted = (chapterId) => {
    return userProgress.some((p) => p.chapterId === chapterId && p.isCompleted);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-sky-700"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center h-full">
        <AlertCircle className="h-12 w-12 text-red-500 mb-4" />
        <h2 className="text-xl font-semibold mb-2">Erreur</h2>
        <p className="text-slate-600">{error}</p>
        <button
          onClick={() => navigate('/browse')}
          className="mt-4 px-4 py-2 bg-sky-700 text-white rounded-md hover:bg-sky-800"
        >
          Retour aux cours
        </button>
      </div>
    );
  }

  return (
    <div className="h-full">
      {/* Header */}
      <div className="p-4 border-b flex items-center justify-between bg-white">
        <div className="flex items-center gap-x-2">
          <ArrowLeft
            className="h-5 w-5 cursor-pointer hover:text-sky-700"
            onClick={() => navigate('/browse')}
          />
          <h1 className="text-xl font-medium">{course?.title}</h1>
        </div>
        <div className="flex items-center gap-x-4">
          {user?.id && (
            <div className="text-sm text-slate-600">
              Progression : {completionPercentage}%
            </div>
          )}
          <button
            onClick={() => navigate('/browse')}
            className="text-sm bg-slate-200 px-2 py-1 rounded-md hover:bg-slate-300"
          >
            Quitter
          </button>
        </div>
      </div>

      {/* Grid Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-[300px_1fr] h-[calc(100%-73px)]">
        {/* Sidebar */}
        <div className="hidden lg:flex h-full flex-col border-r border-slate-200 bg-white">
          <div className="p-4 border-b">
            <h2 className="text-xl font-semibold">{course?.title}</h2>
            <p className="text-sm text-slate-500 mt-2">
              {chapters.length} chapitres
              {user?.id && ` • ${completionPercentage}% terminé`}
            </p>
          </div>

          {/* Chapters List */}
          <div className="flex-1 overflow-y-auto">
            <div className="flex flex-col">
              {chapters.map((chapter) => (
                <ChapterItem
                  key={chapter.id}
                  title={chapter.title}
                  position={chapter.position}
                  isPublished={chapter.isPublished}
                  isFree={chapter.isFree}
                  isLocked={!chapter.isFree && !hasPurchased}
                  isCurrent={currentChapter?.id === chapter.id}
                  hasPurchased={hasPurchased}
                  onClick={() => {
                    console.log('Chapter clicked:', {
                      hasPurchased,
                      isFree: chapter.isFree,
                      isPublished: chapter.isPublished,
                    });
                    if (
                      chapter.isPublished &&
                      (chapter.isFree || hasPurchased)
                    ) {
                      setCurrentChapter(chapter);
                    } else if (!hasPurchased && !chapter.isFree) {
                      toast.error(
                        'Ce chapitre est réservé aux étudiants inscrits'
                      );
                    }
                  }}
                />
              ))}
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="flex flex-col h-full bg-white">
          {currentChapter ? (
            <>
              {canAccessChapter(currentChapter) ? (
                <>
                  <div className="relative aspect-video bg-slate-900">
                    <video
                      className="h-full w-full"
                      src={currentChapter.videoUrl}
                      controls
                      onEnded={handleChapterComplete}
                    />
                  </div>

                  <div className="p-6 flex flex-col gap-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <h2 className="text-2xl font-bold">
                          {currentChapter.title}
                        </h2>
                        <p className="text-sm text-slate-500">
                          Chapitre {currentChapter.position}
                          {currentChapter.isFree && ' (Gratuit)'}
                        </p>
                      </div>
                      {isChapterCompleted(currentChapter.id) && (
                        <CheckCircle className="h-6 w-6 text-emerald-600" />
                      )}
                    </div>

                    <div>
                      <h3 className="text-lg font-semibold mb-2">
                        Description :
                      </h3>
                      <p className="text-slate-600">
                        {currentChapter.description}
                      </p>
                    </div>
                  </div>
                </>
              ) : (
                <div className="flex flex-col items-center justify-center h-full">
                  <Lock className="h-16 w-16 text-slate-400 mb-4" />
                  <h2 className="text-xl font-semibold mb-2">
                    Chapitre Verrouillé
                  </h2>
                  <p className="text-slate-600 mb-4">
                    Ce chapitre est réservé aux étudiants inscrits
                  </p>
                  <button
                    onClick={() => navigate(`/courses/${courseId}`)}
                    className="px-4 py-2 bg-sky-700 text-white rounded-md hover:bg-sky-800"
                  >
                    S'inscrire au cours
                  </button>
                </div>
              )}
            </>
          ) : (
            <div className="flex flex-col items-center justify-center h-full">
              <AlertCircle className="h-16 w-16 text-slate-400 mb-4" />
              <h2 className="text-xl font-semibold">
                Aucun chapitre sélectionné
              </h2>
              <p className="text-slate-600">
                Sélectionnez un chapitre pour commencer
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Course;
