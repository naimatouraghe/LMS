import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { courseApi } from '../../services/api/courseApi';
import { useAuth } from '../../contexts/AuthContext';
import { toast } from 'react-hot-toast';
import { PencilIcon, Trash2Icon, Plus } from 'lucide-react';
import { Button } from '../../components/common/Button';

export default function TeacherDashboard() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [courses, setCourses] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const loadTeacherCourses = async () => {
      try {
        setIsLoading(true);
        const response = await courseApi.getUserCourses(user?.id);
        console.log('Teacher courses:', response);
        setCourses(response.value || []);
      } catch (err) {
        console.error('Error loading courses:', err);
        setError('Erreur lors du chargement des cours');
        toast.error('Erreur lors du chargement des cours');
      } finally {
        setIsLoading(false);
      }
    };

    if (user?.id) {
      loadTeacherCourses();
    }
  }, [user?.id]);

  const handleDeleteCourse = async (courseId) => {
    if (window.confirm('Êtes-vous sûr de vouloir supprimer ce cours ?')) {
      try {
        await courseApi.deleteCourse(courseId);
        setCourses(courses.filter((course) => course.id !== courseId));
        toast.success('Cours supprimé avec succès');
      } catch (err) {
        console.error('Error deleting course:', err);
        toast.error('Erreur lors de la suppression du cours');
      }
    }
  };

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">Mes cours</h1>
        <Button onClick={() => navigate('/teacher/courses/new')}>
          <Plus className="w-4 h-4 mr-2" />
          Créer un cours
        </Button>
      </div>

      {isLoading ? (
        <div className="text-center py-4">Chargement...</div>
      ) : error ? (
        <div className="text-red-500 text-center py-4">{error}</div>
      ) : (
        <div className="bg-white rounded-lg shadow">
          <table className="min-w-full">
            <thead>
              <tr className="border-b">
                <th className="text-left p-4">Titre</th>
                <th className="text-left p-4">Prix</th>
                <th className="text-left p-4">Publié</th>
                <th className="text-right p-4">Actions</th>
              </tr>
            </thead>
            <tbody>
              {courses.length === 0 ? (
                <tr>
                  <td colSpan="4" className="text-center py-4 text-gray-500">
                    Aucun cours trouvé
                  </td>
                </tr>
              ) : (
                courses.map((course) => (
                  <tr key={course.id} className="border-b hover:bg-gray-50">
                    <td className="p-4">
                      <div className="flex items-center gap-2">
                        <img
                          src={course.imageUrl}
                          alt={course.title}
                          className="w-10 h-10 rounded-md object-cover"
                        />
                        <span>{course.title}</span>
                      </div>
                    </td>
                    <td className="p-4">{course.price}€</td>
                    <td className="p-4">
                      <span
                        className={`px-2 py-1 rounded-full text-xs ${
                          course.isPublished
                            ? 'bg-green-100 text-green-800'
                            : 'bg-yellow-100 text-yellow-800'
                        }`}
                      >
                        {course.isPublished ? 'Publié' : 'Brouillon'}
                      </span>
                    </td>
                    <td className="p-4 text-right">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() =>
                          navigate(`/teacher/courses/${course.id}`)
                        }
                      >
                        <PencilIcon className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDeleteCourse(course.id)}
                      >
                        <Trash2Icon className="w-4 h-4 text-red-500" />
                      </Button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
