import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { Chart as ChartJS } from 'chart.js/auto';
import { Line } from 'react-chartjs-2';

const TeacherDashboard = () => {
  const { user } = useAuth();
  const [courses, setCourses] = useState([]);
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        // Récupérer les cours de l'enseignant
        const coursesResponse = await fetch(`/api/courses/user/${user.id}`, {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`,
          },
        });

        if (!coursesResponse.ok) throw new Error('Failed to fetch courses');
        const coursesData = await coursesResponse.json();
        setCourses(coursesData);

        // Récupérer les analytics
        const analyticsResponse = await fetch(
          '/api/courses/analytics/teacher',
          {
            headers: {
              Authorization: `Bearer ${localStorage.getItem('token')}`,
            },
          }
        );

        if (!analyticsResponse.ok) throw new Error('Failed to fetch analytics');
        const analyticsData = await analyticsResponse.json();
        setAnalytics(analyticsData);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, [user.id]);

  const revenueChartData = {
    labels: analytics?.revenueData?.map((d) => d.date) || [],
    datasets: [
      {
        label: 'Revenus',
        data: analytics?.revenueData?.map((d) => d.amount) || [],
        borderColor: 'rgb(75, 192, 192)',
        tension: 0.1,
      },
    ],
  };

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
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold mb-2">
              Tableau de bord Enseignant
            </h1>
            <p className="text-gray-600">Bienvenue, {user.fullName}</p>
          </div>
          <Link
            to="/teacher/courses/new"
            className="bg-blue-600 text-white px-6 py-2 rounded-md hover:bg-blue-700 transition"
          >
            Créer un cours
          </Link>
        </div>
      </div>

      {/* Statistiques rapides */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-blue-50 p-6 rounded-lg shadow">
          <h3 className="text-lg font-semibold mb-2">Total Cours</h3>
          <p className="text-3xl font-bold text-blue-600">{courses.length}</p>
        </div>
        <div className="bg-green-50 p-6 rounded-lg shadow">
          <h3 className="text-lg font-semibold mb-2">Étudiants</h3>
          <p className="text-3xl font-bold text-green-600">
            {analytics?.totalStudents || 0}
          </p>
        </div>
      </div>
    </div>
  );
};

export default TeacherDashboard;
