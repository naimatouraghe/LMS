import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { courseApi } from '../../services/api/courseApi';
import { toast } from 'react-hot-toast';

export default function InitialCourseForm() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [title, setTitle] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState(null);

  // Charger les catégories au montage du composant
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await courseApi.getCategories();
        setCategories(response || []);
        // Sélectionner la première catégorie par défaut
        if (response && response.length > 0) {
          setSelectedCategory(response[0]);
        }
      } catch (err) {
        console.error('Error fetching categories:', err);
        setError('Erreur lors du chargement des catégories');
      }
    };

    fetchCategories();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setIsLoading(true);
      setError(null);

      if (!title.trim()) {
        setError('Le titre est requis');
        return;
      }

      console.log('Submitting title:', title.trim());

      const initialCourseDto = {
        title: title.trim(),
      };

      const response = await courseApi.createInitialCourse(initialCourseDto);
      console.log('Initial course created:', response);

      if (response?.id) {
        // Stockons le titre dans le localStorage pour le récupérer dans le dashboard
        localStorage.setItem('initialCourseTitle', title.trim());

        toast.success('Cours créé avec succès');
        navigate(`/teacher/courses/${response.id}`);
      }
    } catch (err) {
      console.error('Error creating course:', err);
      setError(
        err.response?.data?.message || 'Erreur lors de la création du cours'
      );
      toast.error('Erreur lors de la création du cours');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto p-6">
      <div className="space-y-4">
        <div>
          <h1 className="text-2xl font-bold">Name your course</h1>
          <p className="text-gray-600">
            What would you like to name your course? Don't worry, you can always
            change this later.
          </p>
        </div>

        {error && (
          <div className="p-4 bg-red-100 text-red-700 rounded-md">{error}</div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-medium mb-2">
              Course title
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. 'Advanced Web Development'"
              className="w-full p-3 border rounded-md"
              required
            />
            <p className="mt-1 text-sm text-gray-500">
              What will you teach in this course?
            </p>
          </div>

          <div className="flex justify-end gap-4">
            <button
              type="button"
              onClick={() => navigate(-1)}
              className="px-4 py-2 text-gray-700 border rounded-md hover:bg-gray-50"
              disabled={isLoading}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
              disabled={isLoading}
            >
              {isLoading ? 'Creating...' : 'Continue'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
