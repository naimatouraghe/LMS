import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { Chart as ChartJS } from 'chart.js/auto';
import { Line, Doughnut } from 'react-chartjs-2';

const AdminDashboard = () => {
  // need a fix
  const { user } = useAuth();
  const [statistics, setStatistics] = useState(null);
  const [users, setUsers] = useState([]);
  const [recentActivities, setRecentActivities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        // Récupérer les statistiques globales
        const statsResponse = await fetch('/api/auth/statistics', {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`,
          },
        });

        if (!statsResponse.ok) throw new Error('Failed to fetch statistics');
        const statsData = await statsResponse.ok.json();
        setStatistics(statsData);

        // Récupérer les utilisateurs récents
        const usersResponse = await fetch('/api/auth/users?limit=5', {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`,
          },
        });

        if (!usersResponse.ok) throw new Error('Failed to fetch users');
        const usersData = await usersResponse.json();
        setUsers(usersData);

        // Récupérer les activités récentes
        const activitiesResponse = await fetch('/api/admin/activities', {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`,
          },
        });

        if (!activitiesResponse.ok)
          throw new Error('Failed to fetch activities');
        const activitiesData = await activitiesResponse.json();
        setRecentActivities(activitiesData);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  const userChartData = {
    labels: statistics?.userGrowth?.map((d) => d.date) || [],
    datasets: [
      {
        label: 'Nouveaux utilisateurs',
        data: statistics?.userGrowth?.map((d) => d.count) || [],
        borderColor: 'rgb(75, 192, 192)',
        tension: 0.1,
      },
    ],
  };

  const userTypeDistribution = {
    labels: ['Étudiants', 'Enseignants', 'Administrateurs'],
    datasets: [
      {
        data: [
          statistics?.userTypes?.students || 0,
          statistics?.userTypes?.teachers || 0,
          statistics?.userTypes?.admins || 0,
        ],
        backgroundColor: [
          'rgb(54, 162, 235)',
          'rgb(255, 99, 132)',
          'rgb(255, 205, 86)',
        ],
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
            <h1 className="text-2xl font-bold mb-2">Administration</h1>
            <p className="text-gray-600">Vue d'ensemble de la plateforme</p>
          </div>
          <div className="space-x-4">
            <Link
              to="/admin/users"
              className="bg-blue-600 text-white px-6 py-2 rounded-md hover:bg-blue-700 transition"
            >
              Gérer les utilisateurs
            </Link>
            <Link
              to="/admin/settings"
              className="bg-gray-600 text-white px-6 py-2 rounded-md hover:bg-gray-700 transition"
            >
              Paramètres
            </Link>
          </div>
        </div>
      </div>

      {/* Statistiques rapides */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-blue-50 p-6 rounded-lg shadow">
          <h3 className="text-lg font-semibold mb-2">Utilisateurs</h3>
          <p className="text-3xl font-bold text-blue-600">
            {statistics?.totalUsers || 0}
          </p>
        </div>
        <div className="bg-green-50 p-6 rounded-lg shadow">
          <h3 className="text-lg font-semibold mb-2">Cours</h3>
          <p className="text-3xl font-bold text-green-600">
            {statistics?.totalCourses || 0}
          </p>
        </div>
        <div className="bg-purple-50 p-6 rounded-lg shadow">
          <h3 className="text-lg font-semibold mb-2">Revenus</h3>
          <p className="text-3xl font-bold text-purple-600">
            {statistics?.totalRevenue?.toFixed(2) || 0}€
          </p>
        </div>
        <div className="bg-orange-50 p-6 rounded-lg shadow">
          <h3 className="text-lg font-semibold mb-2">Inscriptions</h3>
          <p className="text-3xl font-bold text-orange-600">
            {statistics?.totalEnrollments || 0}
          </p>
        </div>
      </div>

      {/* Graphiques */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-xl font-semibold mb-4">
            Croissance des utilisateurs
          </h2>
          <div className="h-64">
            <Line
              data={userChartData}
              options={{ maintainAspectRatio: false }}
            />
          </div>
        </div>
        <div className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-xl font-semibold mb-4">
            Distribution des utilisateurs
          </h2>
          <div className="h-64">
            <Doughnut
              data={userTypeDistribution}
              options={{ maintainAspectRatio: false }}
            />
          </div>
        </div>
      </div>

      {/* Utilisateurs récents */}
      <div className="bg-white p-6 rounded-lg shadow">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold">Utilisateurs récents</h2>
          <Link to="/admin/users" className="text-blue-600 hover:text-blue-800">
            Voir tous →
          </Link>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full">
            <thead>
              <tr className="bg-gray-50">
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Utilisateur
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Rôle
                </th>
              </tr>
            </thead>
            <tbody>
              {/* Ajoutez ici le contenu des utilisateurs récents */}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
