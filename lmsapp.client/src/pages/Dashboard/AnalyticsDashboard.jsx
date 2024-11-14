import { useEffect, useState } from 'react';
import { courseApi } from '../../services/api/courseApi';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip } from 'recharts';
import { Card } from '../../components/features/Card';
import { Loader2 } from 'lucide-react';

export default function AnalyticsDashboard() {
  const [analytics, setAnalytics] = useState({
    totalRevenue: 0,
    totalSales: 0,
    courseAnalytics: [],
  });
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    loadAnalytics();
  }, []);

  const loadAnalytics = async () => {
    try {
      setIsLoading(true);
      setError(null);

      const response = await courseApi.getTeacherAnalytics();
      console.log('Analytics response:', response);

      setAnalytics({
        totalRevenue: response?.totalRevenue || 0,
        totalSales: response?.totalSales || 0,
        courseAnalytics: response?.courseAnalytics || [],
      });
    } catch (error) {
      console.error('Erreur lors du chargement des analytics:', error);
      setError('Impossible de charger les analytics');
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-full">
        <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6">
        <div className="bg-red-50 text-red-600 p-4 rounded-lg">{error}</div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      <h1 className="text-2xl font-bold">Analytics du cours</h1>

      {/* Cards en haut */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card className="p-6">
          <h2 className="text-gray-500 text-sm font-medium">Revenu Total</h2>
          <p className="text-3xl font-bold mt-2">{analytics.totalRevenue}€</p>
        </Card>

        <Card className="p-6">
          <h2 className="text-gray-500 text-sm font-medium">Ventes Totales</h2>
          <p className="text-3xl font-bold mt-2">{analytics.totalSales}</p>
        </Card>
      </div>

      {/* Graphique */}
      {analytics.courseAnalytics.length > 0 && (
        <Card>
          <div className="p-4">
            <h2 className="text-xl font-semibold mb-4">Revenus par cours</h2>
            <div className="w-full overflow-x-auto">
              <BarChart
                width={800}
                height={400}
                data={analytics.courseAnalytics}
                margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis
                  dataKey="title"
                  angle={-45}
                  textAnchor="end"
                  height={80}
                />
                <YAxis
                  label={{
                    value: 'Revenus (€)',
                    angle: -90,
                    position: 'insideLeft',
                  }}
                />
                <Tooltip />
                <Bar dataKey="revenue" fill="#0369a1" />
              </BarChart>
            </div>
          </div>
        </Card>
      )}
    </div>
  );
}
