import { useState, useEffect } from 'react';
import { CourseCard } from '@/components/CourseCard';
import { Clock, CheckCircle } from 'lucide-react';
import NavbarDesktop from '@/Components/NavbarDesktop';
import Login from '@/Pages/Login';
import axios from 'axios';
import { useAuth } from '@/contexts/AuthContext';

const Dashboard = () => {
  const [userCourses, setUserCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const { user, isAuthenticated } = useAuth();

  useEffect(() => {
    const fetchUserCourses = async () => {
      try {
        const token = localStorage.getItem('token');
        const response = await axios.get(
          `https://localhost:7001/api/Course/Users/${user.id}/purchased`,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );

        setUserCourses(response.data);
      } catch (error) {
        console.error('Erreur lors du chargement des cours:', error);
      } finally {
        setLoading(false);
      }
    };

    if (user) {
      fetchUserCourses();
    } else {
      setLoading(false);
    }
  }, [user]);

  if (!isAuthenticated) {
    return <Login />;
  }

  // Calculer les statistiques
  const completedCourses = userCourses.filter(
    (course) => course.isCompleted || course.progress === 100
  );

  const inProgressCourses = userCourses.filter(
    (course) =>
      !course.isCompleted && course.progress > 0 && course.progress < 100
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-sky-700"></div>
      </div>
    );
  }

  return (
    <>
      <div className="hidden md:block space-y-4">
        <NavbarDesktop />
      </div>
      <div className="p-1 m-5">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
          <div className="bg-slate-100 rounded-lg p-4 flex items-center gap-4">
            <div className="bg-sky-100 p-2 rounded-full">
              <Clock className="w-6 h-6 text-sky-700" />
            </div>
            <div>
              <p className="font-medium">En cours</p>
              <p className="text-slate-500 text-sm">
                {inProgressCourses.length} cours
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
                {completedCourses.length} cours
              </p>
            </div>
          </div>
        </div>

        {/* All Courses Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {inProgressCourses.map((course) => (
            <CourseCard
              key={course.id}
              course={course}
              progress={course.progress}
              currentUserId={user?.id}
            />
          ))}
          {completedCourses.map((course) => (
            <CourseCard
              key={course.id}
              course={course}
              progress={100}
              currentUserId={user?.id}
            />
          ))}
          {userCourses
            .filter((course) => !course.isCompleted && course.progress === 0)
            .map((course) => (
              <CourseCard
                key={course.id}
                course={course}
                progress={0}
                currentUserId={user?.id}
              />
            ))}
        </div>
      </div>
    </>
  );
};

export default Dashboard;
