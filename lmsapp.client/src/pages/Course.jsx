import { useState, useEffect } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import {
  ArrowLeft,
  CheckCircle,
  Lock,
  AlertCircle,
  Menu,
  X,
  AlertTriangle,
  PlayCircle,
} from 'lucide-react';
import { courseApi } from '@/services/api/courseApi';
import { progressApi } from '@/services/api/progressApi';
import { toast } from 'react-hot-toast';
import { paymentApi } from '@/services/api/paymentApi';
import { cn } from '@/lib/utils';
import axios from 'axios';

import ChapterItem from '@/components/ChapterItem';
import { useAuth } from '@/contexts/AuthContext';

const formatPrice = (price) => {
  return new Intl.NumberFormat('fr-FR', {
    style: 'currency',
    currency: 'EUR',
  }).format(price || 0);
};

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

  console.log('Course ID:', courseId);
  console.log('Course data:', course);
  if (!courseId) {
    return <div>Course ID is missing.</div>;
  }

  useEffect(() => {
    const fetchCourseData = async () => {
      if (!courseId) {
        console.error('Course ID is undefined');
        return;
      }
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
        <div className="aspect-video relative">
          {isLocked ? (
            <div className="absolute inset-0 flex flex-col items-center justify-center bg-slate-800 text-white">
              <Lock className="h-16 w-16 mb-4" />
              <p className="text-xl mb-4">
                Vous devez acheter ce cours pour accéder à ce chapitre
              </p>
              <button
                onClick={() => handlePurchase(course.id)}
                className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors"
              >
                Acheter pour{' '}
                {formatPrice(
                  parseFloat(course?.value?.price || course?.price || 0)
                )}
              </button>
            </div>
          ) : (
            <video
              className="h-full w-full object-contain bg-black"
              src={currentChapter.videoUrl}
              controls
              onEnded={() => handleChapterComplete(currentChapter.id)}
            />
          )}
        </div>
      </>
    );
  };

  useEffect(() => {
    const handlePaymentSuccess = async () => {
      const queryParams = new URLSearchParams(window.location.search);
      const sessionId = queryParams.get('session_id');

      if (sessionId) {
        try {
          // Attendre un court instant pour laisser le temps au webhook de traiter le paiement
          await new Promise((resolve) => setTimeout(resolve, 2000));

          const success = await paymentApi.handlePaymentSuccess(sessionId);

          if (success) {
            toast.success('Paiement réussi ! Accès au cours accordé.');
            // Recharger les données du cours
            await fetchCourseData();
          } else {
            toast.error('Échec du traitement du paiement.');
            navigate('/browse');
          }
        } catch (error) {
          console.error('Erreur lors du traitement du paiement:', error);
          toast.error(
            'Une erreur est survenue lors du traitement du paiement.'
          );
          navigate('/browse');
        }
      }
    };

    handlePaymentSuccess();
  }, []);

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
      {/* Header */}
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

      {/* Contenu principal - Nouveau design tablette */}
      <div className="flex-1 grid md:grid-cols-[280px_1fr]">
        {/* Sidebar tablette - Style épuré */}
        <div className="hidden md:block bg-slate-50 border-r overflow-y-auto">
          <div className="p-4 border-b bg-white">
            <h2 className="font-medium text-slate-800">Contenu du cours</h2>
          </div>
          <div className="py-2">
            {chapters.map((chapter) => (
              <div
                key={chapter.id}
                onClick={() => setCurrentChapter(chapter)}
                className={cn(
                  'px-4 py-3 flex items-center gap-3 cursor-pointer transition-colors',
                  currentChapter?.id === chapter.id
                    ? 'bg-white border-l-2 border-sky-700'
                    : 'hover:bg-white border-l-2 border-transparent'
                )}
              >
                <div className="flex-shrink-0">
                  {chapter.isFree ? (
                    <PlayCircle
                      className={cn(
                        'h-5 w-5',
                        currentChapter?.id === chapter.id
                          ? 'text-sky-700'
                          : 'text-slate-400'
                      )}
                    />
                  ) : (
                    <Lock className="h-5 w-5 text-slate-400" />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span
                      className={cn(
                        'text-sm truncate',
                        currentChapter?.id === chapter.id
                          ? 'font-medium text-sky-700'
                          : 'text-slate-600'
                      )}
                    >
                      {chapter.position}. {chapter.title}
                    </span>
                    {chapter.isFree && (
                      <span className="flex-shrink-0 px-2 py-0.5 bg-emerald-500 text-white text-xs rounded-full">
                        Gratuit
                      </span>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Zone de contenu */}
        <div className="flex flex-col">
          {currentChapter ? (
            renderChapterContent()
          ) : (
            <div className="flex flex-col items-center justify-center h-full p-4">
              <AlertCircle className="h-16 w-16 text-slate-400 mb-4" />
              <h2 className="text-xl font-semibold text-center">
                Sélectionnez un chapitre pour commencer
              </h2>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Course;
