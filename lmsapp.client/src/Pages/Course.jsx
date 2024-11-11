import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  CheckCircle,
  Lock,
  AlertCircle,
  Menu,
  X,
  AlertTriangle,
} from 'lucide-react';
import { courseApi } from '@/services/api/courseApi';
import { progressApi } from '@/services/api/progressApi';
import { toast } from 'react-hot-toast';
import { paymentApi } from '@/services/api/paymentApi';
import { cn } from '@/lib/utils';
import axios from 'axios';

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
  const [completedChapters, setCompletedChapters] = useState([]);
  const [courseProgress, setCourseProgress] = useState(null);
  const [showChapters, setShowChapters] = useState(false);

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

  useEffect(() => {
    const loadProgress = async () => {
      if (!user || !courseId) return;

      try {
        const result = await progressApi.getCourseProgress(courseId);
        console.log('Progression initiale chargée:', result);

        if (result?.progress) {
          // Vérifier si nous avons des chapitres avec une progression
          const completedIds = result.progress
            .filter((p) => p.isCompleted === true)
            .map((p) => p.chapterId);

          console.log('Chapitres réellement complétés:', completedIds);
          setCompletedChapters(completedIds);
          setCompletionPercentage(result.completionPercentage || 0);
          setCourseProgress(result);
        }
      } catch (error) {
        console.error('Erreur lors du chargement de la progression:', error);
      }
    };

    loadProgress();
  }, [courseId, user]);

  const handleChapterComplete = async (chapterId) => {
    if (!user || !courseId) return;

    try {
      const result = await progressApi.markChapterAsCompleted(chapterId);
      console.log('Résultat du marquage:', result);

      if (result) {
        // Charger la progression mise à jour
        const updatedProgress = await progressApi.getCourseProgress(courseId);

        if (updatedProgress?.progress) {
          // Mettre à jour avec les nouveaux chapitres complétés
          const completedIds = updatedProgress.progress
            .filter((p) => p.isCompleted === true)
            .map((p) => p.chapterId);

          setCompletedChapters(completedIds);
          setCompletionPercentage(updatedProgress.completionPercentage);
          setCourseProgress(updatedProgress);
        }
      }

      toast.success('Progression sauvegardée');
    } catch (error) {
      console.error('Erreur lors de la sauvegarde:', error);
      toast.error('Erreur lors de la sauvegarde');
    }
  };

  const isChapterCompleted = (chapterId) => {
    // Vérifier dans courseProgress si le chapitre est marqué comme complété
    const chapterProgress = courseProgress?.progress?.find(
      (p) => p.chapterId === chapterId
    );
    return chapterProgress?.isCompleted === true;
  };

  const canAccessChapter = (chapter) => {
    return chapter.isFree || hasPurchased;
  };

  const renderChapterContent = () => {
    if (!currentChapter) return null;

    const isLocked = !currentChapter.isFree && !hasPurchased;

    return (
      <>
        {isLocked && (
          <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <AlertTriangle className="h-5 w-5 text-yellow-400" />
              </div>
              <div className="ml-3">
                <p className="text-sm text-yellow-700">
                  Vous devez acheter ce cours pour regarder ce chapitre.
                </p>
              </div>
            </div>
          </div>
        )}

        <div className="relative aspect-video">
          {isLocked ? (
            <div className="absolute inset-0 flex flex-col items-center justify-center bg-slate-900/90 text-white">
              <Lock className="h-12 w-12 mb-2" />
              <p className="text-center px-4">
                Vous devez acheter ce cours pour accéder à ce chapitre
              </p>
              <button
                onClick={() => {
                  paymentApi
                    .createCheckoutSession(courseId)
                    .then((response) => {
                      window.location.href = response.url;
                    })
                    .catch((error) => {
                      toast.error(
                        'Erreur lors de la redirection vers le paiement'
                      );
                    });
                }}
                className="mt-4 px-4 py-2 bg-sky-700 hover:bg-sky-800 rounded-md"
              >
                Acheter pour {course?.price}€
              </button>
            </div>
          ) : null}
          <video
            className="h-full w-full"
            src={currentChapter.videoUrl}
            controls
            onEnded={handleChapterComplete}
          />
        </div>

        {isLocked && (
          <div className="fixed top-0 left-0 right-0 bg-yellow-100 p-4 text-yellow-800 flex items-center justify-center">
            <p className="text-sm">
              Vous devez acheter ce cours pour accéder à ce chapitre.
              <button
                onClick={() => {
                  paymentApi
                    .createCheckoutSession(courseId)
                    .then((response) => {
                      window.location.href = response.url;
                    })
                    .catch((error) => {
                      toast.error(
                        'Erreur lors de la redirection vers le paiement'
                      );
                    });
                }}
                className="ml-2 underline hover:text-yellow-900"
              >
                Acheter maintenant
              </button>
            </p>
          </div>
        )}

        <div className="p-6 flex flex-col gap-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold">{currentChapter.title}</h2>
              <p className="text-sm text-slate-500">
                Chapitre {currentChapter.position}
                {currentChapter.isFree && ' (Gratuit)'}
              </p>
            </div>
            <div className="flex items-center gap-x-4">
              {!hasPurchased ? (
                <button
                  onClick={() => {
                    paymentApi
                      .createCheckoutSession(courseId)
                      .then((response) => {
                        window.location.href = response.url;
                      })
                      .catch((error) => {
                        console.error(
                          'Error creating checkout session:',
                          error
                        );
                        toast.error(
                          'Erreur lors de la redirection vers le paiement'
                        );
                      });
                  }}
                  className="px-4 py-2 bg-sky-700 text-white rounded-md hover:bg-sky-800 flex items-center gap-x-2"
                >
                  Acheter pour {course?.price}€
                </button>
              ) : (
                <button
                  onClick={() => handleChapterComplete(currentChapter.id)}
                  disabled={isChapterCompleted(currentChapter.id)}
                  className={cn(
                    'px-4 py-2 rounded-md flex items-center gap-x-2',
                    isChapterCompleted(currentChapter.id)
                      ? 'bg-emerald-700 text-white cursor-not-allowed'
                      : 'bg-emerald-600 text-white hover:bg-emerald-700'
                  )}
                >
                  {isChapterCompleted(currentChapter.id) ? (
                    <>
                      <CheckCircle className="h-4 w-4" />
                      Terminé
                    </>
                  ) : (
                    'Marquer comme terminé'
                  )}
                </button>
              )}
            </div>
          </div>

          {!hasPurchased && !currentChapter.isFree && (
            <div className="fixed top-0 left-0 right-0 bg-yellow-100 p-4 text-yellow-800 flex items-center justify-center">
              <p className="text-sm">
                Vous devez acheter ce cours pour accéder à ce chapitre.
                <button
                  onClick={() => {
                    paymentApi
                      .createCheckoutSession(courseId)
                      .then((response) => {
                        window.location.href = response.url;
                      })
                      .catch((error) => {
                        console.error(
                          'Error creating checkout session:',
                          error
                        );
                        toast.error(
                          'Erreur lors de la redirection vers le paiement'
                        );
                      });
                  }}
                  className="ml-2 underline hover:text-yellow-900"
                >
                  Acheter maintenant
                </button>
              </p>
            </div>
          )}

          <div>
            <h3 className="text-lg font-semibold mb-2">Description :</h3>
            <p className="text-slate-600">{currentChapter.description}</p>
          </div>
        </div>
      </>
    );
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
    <div className="h-full flex flex-col">
      {/* Header avec taille normale */}
      <div className="sticky top-0 z-50 px-4 py-3 flex items-center justify-between bg-white border-b">
        <div className="flex items-center gap-x-2">
          <ArrowLeft
            className="h-5 w-5 cursor-pointer hover:text-sky-700"
            onClick={() => navigate('/browse')}
          />
          <div className="flex flex-col">
            <h1 className="text-xl font-medium truncate max-w-[200px] sm:max-w-none">
              {course?.title}
            </h1>
            {user?.id && (
              <span className="text-sm text-slate-600">
                {courseProgress?.completionPercentage || 0}% terminé
              </span>
            )}
          </div>
        </div>
        <button
          onClick={() => navigate('/browse')}
          className="text-sm bg-slate-200 px-2 py-1 rounded-md hover:bg-slate-300"
        >
          Quitter
        </button>
      </div>

      <div className="flex-1 overflow-hidden">
        <div className="h-full flex flex-col lg:grid lg:grid-cols-[300px_1fr]">
          {/* Sidebar collée directement sous le header */}
          <div
            className={cn(
              'fixed inset-y-0 left-0 z-40 bg-white w-[300px] transform transition-transform duration-300 lg:relative lg:transform-none overflow-y-auto border-r',
              showChapters ? 'translate-x-0' : '-translate-x-full'
            )}
          >
            {/* Liste des chapitres sans margin ni padding */}
            <div className="flex flex-col -mt-[1px]">
              {chapters.map((chapter) => (
                <ChapterItem
                  key={chapter.id}
                  title={chapter.title}
                  position={chapter.position}
                  isPublished={chapter.isPublished}
                  isFree={chapter.isFree}
                  hasPurchased={hasPurchased}
                  isCompleted={isChapterCompleted(chapter.id)}
                  isCurrent={currentChapter?.id === chapter.id}
                  onClick={() => {
                    setCurrentChapter(chapter);
                    setShowChapters(false);
                  }}
                />
              ))}
            </div>
          </div>

          {/* Contenu principal */}
          <div className="flex-1 overflow-y-auto">
            {currentChapter ? (
              renderChapterContent()
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
    </div>
  );
};

export default Course;
