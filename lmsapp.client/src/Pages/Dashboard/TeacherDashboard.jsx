import { useEffect, useState } from 'react';
import { courseApi } from '../../services/api/courseApi';
import { DataTable } from '../../components/features/DataTable';
import { Button } from '../../components/common/Button';
import { Plus } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function TeacherDashboard() {
  const [courses, setCourses] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    loadTeacherCourses();
  }, []);

  const loadTeacherCourses = async () => {
    try {
      const response = await courseApi.getTeacherAnalytics();
      if (response && response.value) {
        setCourses(response.value.courses || []);
      } else {
        setCourses([]);
      }
    } catch (error) {
      console.error('Erreur lors du chargement des cours:', error);
      setCourses([]);
    } finally {
      setIsLoading(false);
    }
  };

  const columns = [
    {
      header: 'Title',
      accessorKey: 'title',
      cell: ({ row }) => (
        <div className="flex items-center gap-2">
          <img
            src={row.original.imageUrl}
            alt={row.original.title}
            className="w-10 h-10 rounded-md object-cover"
          />
          <span>{row.original.title}</span>
        </div>
      ),
    },
    {
      header: 'Price',
      accessorKey: 'price',
      cell: ({ row }) => `${row.original.price} €`,
    },
    {
      header: 'Published',
      accessorKey: 'isPublished',
      cell: ({ row }) => (
        <span
          className={`px-2 py-1 rounded-full text-xs ${
            row.original.isPublished
              ? 'bg-green-100 text-green-800'
              : 'bg-yellow-100 text-yellow-800'
          }`}
        >
          {row.original.isPublished ? 'Published' : 'Draft'}
        </span>
      ),
    },
    {
      header: 'Actions',
      cell: ({ row }) => (
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => navigate(`/teacher/courses/${row.original.id}`)}
          >
            Edit
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => navigate(`/courses/${row.original.id}`)}
          >
            Preview
          </Button>
        </div>
      ),
    },
  ];

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">My courses</h1>
        <Button onClick={() => navigate('/teacher/courses/new')}>
          <Plus className="w-4 h-4 mr-2" />
          Create a course
        </Button>
      </div>

      <div className="bg-white rounded-lg shadow">
        <DataTable
          columns={columns}
          data={courses}
          isLoading={isLoading}
          noResultsMessage="Aucun cours trouvé"
        />
      </div>
    </div>
  );
}
