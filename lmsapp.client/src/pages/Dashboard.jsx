import { useState, useEffect } from 'react';
import { CourseCard } from '@/components/CourseCard';
import { Clock, CheckCircle } from 'lucide-react';
import NavbarDesktop from '../components/layout/NavbarDesktop';
import Login from '@/pages/Login';
import { useAuth } from '@/contexts/AuthContext';
import { paymentApi } from '@/services/api/paymentApi';
import { LoadingSpinner } from '@/components/common/LoadingSpinner';

const Dashboard = () => {
  const [purchasedCourses, setPurchasedCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { user, isAuthenticated } = useAuth();

  useEffect(() => {
    const fetchPurchasedCourses = async () => {
      if (!user?.id) {
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError(null);

        const response = await paymentApi.getUserPurchases(user.id);

        const courses = response?.value || [];
        const coursesWithChapters = courses.map((course) => ({
          id: course.courseId,
          title: course.courseTitle,
          description: course.courseDescription,
          imageUrl: course.courseImageUrl,
          price: course.coursePrice,
          category: {
            id: course.category?.categoryId,
            name: course.category?.categoryName || 'Non catégorisé',
          },
          chapters: Array.isArray(course.chapters) ? course.chapters : [],
          progress: course.progress || 0,
        }));

        console.log('Processed courses:', coursesWithChapters);
        setPurchasedCourses(coursesWithChapters);
      } catch (error) {
        console.error('Erreur lors de la récupération des cours:', error);
        setError(
          'Impossible de charger vos cours. Veuillez réessayer plus tard.'
        );
      } finally {
        setLoading(false);
      }
    };

    fetchPurchasedCourses();
  }, [user?.id]);

  // Redirection si non authentifié
  if (!isAuthenticated) {
    return <Login />;
  }

  // Affichage du chargement
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <LoadingSpinner size="xl" color="primary" />
      </div>
    );
  }

  // Affichage de l'erreur
  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen">
        <p className="text-red-500 mb-4">{error}</p>
        <button
          onClick={() => window.location.reload()}
          className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
        >
          Réessayer
        </button>
      </div>
    );
  }

  const filterAndMapCourses = () => {
    const coursesMap = new Map();

    // Créer des objets uniques pour chaque cours
    purchasedCourses.forEach((course) => {
      if (!coursesMap.has(course.id)) {
        const status =
          course.progress === 100
            ? 'completed'
            : course.progress > 0
            ? 'inProgress'
            : 'notStarted';

        coursesMap.set(course.id, {
          ...course,
          status,
          uniqueKey: `${status}-${course.id}-${Date.now()}`,
        });
      }
    });

    // Convertir la Map en tableau et trier selon l'ordre souhaité
    return Array.from(coursesMap.values()).sort((a, b) => {
      const orderMap = {
        notStarted: 0,
        inProgress: 1,
        completed: 2,
      };

      return orderMap[a.status] - orderMap[b.status];
    });
  };

  return (
    <>
      <div className="hidden md:block space-y-4">
        <NavbarDesktop />
      </div>
      <div className="p-1 m-5">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
          <div className="bg-slate-100 rounded-lg p-4 flex items-center gap-4">
            <div className="bg-sky-100 p-2 rounded-full">
              <Clock className="w-6 h-6 text-sky-700" />
            </div>
            <div>
              <p className="font-medium">En cours</p>
              <p className="text-slate-500 text-sm">
                {
                  purchasedCourses.filter((course) => course.progress > 0)
                    .length
                }{' '}
                cours
              </p>
            </div>
          </div>

          <div className="bg-slate-100 rounded-lg p-4 flex items-center gap-4">
            <div className="bg-emerald-100 p-2 rounded-full">
              <CheckCircle className="w-6 h-6 text-emerald-700" />
            </div>
            <div>
              <p className="font-medium">Terminés</p>
              <p className="text-slate-500 text-sm">
                {
                  purchasedCourses.filter((course) => course.progress === 100)
                    .length
                }{' '}
                cours
              </p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {filterAndMapCourses().map((course) => (
            <CourseCard
              key={course.uniqueKey}
              course={course}
              progress={course.progress}
            />
          ))}
        </div>

        {purchasedCourses.length === 0 && (
          <div className="text-center py-12">
            <p className="text-slate-600">
              Vous n'avez pas encore acheté de cours
            </p>
          </div>
        )}
      </div>
    </>
  );
};

export default Dashboard;
