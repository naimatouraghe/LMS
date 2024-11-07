import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';

const StudentDashboard = () => {
  const { user } = useAuth();
  const [courses, setCourses] = useState([]);
  const [progress, setProgress] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        // Récupérer les cours achetés
        const coursesResponse = await fetch('/api/courses/purchased', {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`,
          },
        });

        if (!coursesResponse.ok) throw new Error('Failed to fetch courses');
        const coursesData = await coursesResponse.json();
        setCourses(coursesData);

        // Récupérer la progression pour chaque cours
        const progressPromises = coursesData.map((course) =>
          fetch(`/api/progress/courses/${course.id}/percentage`, {
            headers: {
              Authorization: `Bearer ${localStorage.getItem('token')}`,
            },
          }).then((res) => res.json())
        );

        const progressData = await Promise.all(progressPromises);
        const progressMap = {};
        coursesData.forEach((course, index) => {
          progressMap[course.id] = progressData[index].completionPercentage;
        });
        setProgress(progressMap);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-full">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center text-red-600 p-4">
        <p>Error: {error}</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* En-tête du dashboard */}
      <div className="bg-white p-6 rounded-lg shadow">
        <h1 className="text-2xl font-bold mb-2">Bienvenue, {user.fullName}</h1>
        <p className="text-gray-600">
          Vous avez {courses.length} cours en cours
        </p>
      </div>

      {/* Statistiques rapides */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-blue-50 p-6 rounded-lg shadow">
          <h3 className="text-lg font-semibold mb-2">Cours en cours</h3>
          <p className="text-3xl font-bold text-blue-600">
            {courses.filter((course) => progress[course.id] < 100).length}
          </p>
        </div>
        <div className="bg-green-50 p-6 rounded-lg shadow">
          <h3 className="text-lg font-semibold mb-2">Cours terminés</h3>
          <p className="text-3xl font-bold text-green-600">
            {courses.filter((course) => progress[course.id] === 100).length}
          </p>
        </div>
        <div className="bg-purple-50 p-6 rounded-lg shadow">
          <h3 className="text-lg font-semibold mb-2">Total des cours</h3>
          <p className="text-3xl font-bold text-purple-600">{courses.length}</p>
        </div>
      </div>

      {/* Liste des cours */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {courses.map((course) => (
          <div key={course.id} className="bg-white p-6 rounded-lg shadow">
            <h3 className="text-lg font-semibold mb-2">{course.title}</h3>
            <p className="text-gray-600">Progression: {progress[course.id]}%</p>
            <Link to={`/courses/${course.id}`} className="text-blue-500">
              Voir le cours
            </Link>
          </div>
        ))}
      </div>
    </div>
  );
};

export default StudentDashboard;
