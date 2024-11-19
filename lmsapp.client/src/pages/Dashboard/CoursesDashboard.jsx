import { useState, useEffect } from 'react';
import { Card } from '../../components/features/Card';
import { Button } from '../../components/common/Button';
import { Input } from '../../components/features/Input';
import { Textarea } from '../../components/features/Textarea';
import { ImageUpload } from '../../components/features/ImageUpload';
import { PencilIcon, Plus, DollarSign, FileText, X } from 'lucide-react';
import { Select } from '../../components/features/Select';
import { useNavigate, useParams } from 'react-router-dom';
import { courseApi } from '../../services/api/courseApi';
import { useAuth } from '../../contexts/AuthContext';
import { toast } from 'react-hot-toast';

// Définir l'enum des niveaux de langue
const LANGUAGE_LEVELS = {
  A1: 0,
  A2: 1,
  B1: 2,
  B2: 3,
  C1: 4,
  C2: 5,
};

console.log('Component loaded');

export default function CoursesDashboard() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { courseId } = useParams();

  const [categories, setCategories] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  const [course, setCourse] = useState({
    title: '',
    description: '',
    imageUrl: '',
    price: '0',
    categoryId: '',
    userId: user?.id,
    level: LANGUAGE_LEVELS.A1,
    isPublished: false,
    chapters: [],
    attachments: [],
    purchases: [],
  });

  const [isComplete, setIsComplete] = useState(false);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await courseApi.getCategories();
        setCategories(response.value || []);
      } catch (err) {
        setError('Erreur lors de la récupération des catégories');
        console.error('Error fetching categories:', err);
      }
    };

    fetchCategories();
  }, []);

  useEffect(() => {
    if (!courseId) {
      navigate('/teacher/courses/new');
    }
  }, [courseId, navigate]);

  useEffect(() => {
    const loadCourseAndChapters = async () => {
      if (!courseId) return;

      try {
        setIsLoading(true);

        // Charger les données du cours
        const courseResponse = await courseApi.getCourse(courseId);

        // Charger les chapitres
        const chaptersResponse = await courseApi.getCourseChapters(courseId);
        console.log('Chapitres chargés:', chaptersResponse);

        if (courseResponse) {
          setCourse((prev) => ({
            ...prev,
            ...courseResponse,
            chapters: chaptersResponse?.value || [],
          }));
        }
      } catch (err) {
        console.error('Erreur lors du chargement du cours:', err);
        setError('Erreur lors du chargement du cours et des chapitres');
      } finally {
        setIsLoading(false);
      }
    };

    loadCourseAndChapters();
  }, [courseId]);

  const updateCourse = (field, value) => {
    setCourse((prev) => {
      const updates = {
        ...prev,
        [field]: field === 'price' ? value.toString() : value,
      };

      if (field === 'categoryId') {
        const selectedCategory = categories.find((cat) => cat.id === value);
        if (selectedCategory) {
          updates.category = {
            id: selectedCategory.id,
            name: selectedCategory.name,
            courses: [],
          };
        }
      }

      return updates;
    });
  };

  const handleUpdateCourse = async () => {
    try {
      setIsLoading(true);
      setError(null);

      if (!course.title || !user?.id) {
        setError('Veuillez remplir tous les champs obligatoires');
        return;
      }

      // Structurer les données selon le DTO attendu par le backend
      const courseDto = {
        userId: user.id,
        title: course.title,
        description: course.description || '',
        imageUrl: course.imageUrl || '',
        price: parseFloat(course.price) || 0,
        isPublished: course.isPublished || false,
        categoryId: course.categoryId || null,
        level: course.level || 0,
        category: course.category || null,
        chapters: course.chapters || [],
      };

      console.log('Sending course update:', courseDto);

      const response = await courseApi.updateCourse(courseId, courseDto);

      console.log('Course updated:', response);

      if (response) {
        toast.success('Cours mis à jour avec succès');
        navigate('/teacher');
      }
    } catch (err) {
      console.error('Error updating course:', err);
      setError(
        err.response?.data?.message || 'Erreur lors de la mise à jour du cours'
      );
      toast.error('Erreur lors de la mise à jour du cours');
    } finally {
      setIsLoading(false);
    }
  };

  const handleFileUpload = (file) => {
    const newAttachment = {
      id: Date.now(),
      name: file.name,
      url: URL.createObjectURL(file),
    };

    setCourse((prev) => ({
      ...prev,
      attachments: [...prev.attachments, newAttachment],
    }));
  };

  const removeAttachment = (attachmentId) => {
    setCourse((prev) => ({
      ...prev,
      attachments: prev.attachments.filter((att) => att.id !== attachmentId),
    }));
  };

  const handleContinue = () => {
    // Redirige vers l'étape 3 : ChapterForm
    navigate(`/teacher/courses/${course.id}/chapters/new`);
  };

  return (
    <div className="p-6">
      {error && (
        <div className="mb-4 p-4 bg-red-100 text-red-700 rounded-md">
          {error}
        </div>
      )}

      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold">Course setup</h1>
          <p className="text-sm text-gray-500">
            Complete all fields ({isComplete ? '6/6' : '0/6'})
          </p>
        </div>
        <div className="space-x-2">
          <Button
            variant="outline"
            onClick={() => updateCourse('isPublished', !course.isPublished)}
          >
            {course.isPublished ? 'Unpublish' : 'Publish'}
          </Button>
          <Button onClick={handleUpdateCourse} disabled={isLoading}>
            {isLoading ? 'Saving...' : 'Save & Continue'}
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-6">
        <div className="space-y-6">
          <Card>
            <div className="p-6">
              <h2 className="text-xl font-semibold mb-6 flex items-center gap-2">
                <span className="p-2 bg-sky-100 rounded-md">
                  <svg
                    className="w-4 h-4 text-sky-700"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M4 6h16M4 12h16m-7 6h7"
                    />
                  </svg>
                </span>
                Customize your course
              </h2>

              {/* Titre du cours */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="font-medium">Course title</h3>
                  <Button variant="ghost" size="sm">
                    <PencilIcon className="w-4 h-4 mr-2" />
                    Edit title
                  </Button>
                </div>
                <Input
                  value={course.title}
                  onChange={(e) => updateCourse('title', e.target.value)}
                  placeholder="e.g. 'Advanced web development'"
                />

                {/* Description */}
                <div className="flex items-center justify-between">
                  <h3 className="font-medium">Course description</h3>
                  <Button variant="ghost" size="sm">
                    <PencilIcon className="w-4 h-4 mr-2" />
                    Edit description
                  </Button>
                </div>
                <Textarea
                  value={course.description}
                  onChange={(e) => updateCourse('description', e.target.value)}
                  placeholder="Brief description of your course"
                  rows={4}
                />

                {/* Image du cours */}
                <div className="flex items-center justify-between">
                  <h3 className="font-medium">Course image</h3>
                  <Button variant="ghost" size="sm">
                    <PencilIcon className="w-4 h-4 mr-2" />
                    Edit image
                  </Button>
                </div>
                <ImageUpload
                  value={course.imageUrl}
                  onChange={(url) => updateCourse('imageUrl', url)}
                />
              </div>
            </div>
          </Card>

          {/* Section Catégorie modifiée */}
          <Card className="col-span-2">
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-medium">Course category</h3>
                <Button variant="ghost" size="sm">
                  <PencilIcon className="w-4 h-4 mr-2" />
                  Edit category
                </Button>
              </div>
              <Select
                value={course.categoryId}
                onChange={(e) => updateCourse('categoryId', e.target.value)}
                className="max-w-[200px]"
              >
                <option value="">Select a category</option>
                {categories.map((category) => (
                  <option key={category.id} value={category.id}>
                    {category.name}
                  </option>
                ))}
              </Select>
            </div>
          </Card>
        </div>
        <div className="space-y-6">
          {/* Section des chapitres */}
          <Card>
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-semibold flex items-center gap-2">
                  <span className="p-2 bg-sky-100 rounded-md">
                    <svg
                      className="w-4 h-4 text-sky-700"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
                      />
                    </svg>
                  </span>
                  Course chapters
                </h2>
                <Button
                  size="sm"
                  onClick={() => {
                    console.log('Button clicked');
                    navigate('chapters/new');
                  }}
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Add a chapter
                </Button>
              </div>

              <div className="space-y-4">
                {course.chapters && course.chapters.length > 0 ? (
                  course.chapters.map((chapter, index) => (
                    <div
                      key={chapter.id}
                      className="flex items-center justify-between p-4 bg-gray-50 rounded-lg"
                    >
                      <div className="flex items-center gap-3">
                        <span className="w-8 h-8 flex items-center justify-center bg-blue-100 text-blue-700 rounded-full">
                          {index + 1}
                        </span>
                        <div>
                          <h4 className="font-medium">{chapter.title}</h4>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded-full">
                          Published
                        </span>
                        <Button variant="ghost" size="sm">
                          <PencilIcon className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="text-sm text-gray-500 italic">
                    No chapters available
                  </p>
                )}

                <p className="text-sm text-gray-500 italic">
                  Drag and drop to reorder chapters
                </p>
              </div>
            </div>
          </Card>

          {/* Section prix modifiée */}
          <Card className="col-span-2">
            <div className="p-6">
              <h2 className="text-xl font-semibold mb-6 flex items-center gap-2">
                <span className="p-2 bg-sky-100 rounded-md">
                  <DollarSign className="w-4 h-4 text-sky-700" />
                </span>
                Sell your course
              </h2>

              <div className="flex items-center justify-between">
                <h3 className="font-medium">Course price</h3>
                <Button variant="ghost" size="sm">
                  <PencilIcon className="w-4 h-4 mr-2" />
                  Edit price
                </Button>
              </div>
              <Input
                type="number"
                value={course.price}
                onChange={(e) => updateCourse('price', e.target.value)}
                placeholder="Enter price in EUR"
                min="0"
                step="0.01"
                className="max-w-[200px]"
              />
            </div>
          </Card>

          {/* Section Ressources et Pièces jointes */}
          <Card className="col-span-2">
            <div className="p-6">
              <h2 className="text-xl font-semibold mb-6 flex items-center gap-2">
                <span className="p-2 bg-sky-100 rounded-md">
                  <FileText className="w-4 h-4 text-sky-700" />
                </span>
                Resources & Attachments
              </h2>

              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="font-medium">Course attachments</h3>
                  <div className="relative">
                    <input
                      type="file"
                      id="file-upload"
                      className="hidden"
                      onChange={(e) => handleFileUpload(e.target.files[0])}
                    />
                    <label htmlFor="file-upload">
                      <Button size="sm">
                        <Plus className="w-4 h-4 mr-2" />
                        Add a file
                      </Button>
                    </label>
                  </div>
                </div>

                {course.attachments?.map((attachment) => (
                  <div
                    key={attachment.id}
                    className="flex items-center justify-between"
                  >
                    <span>{attachment.name}</span>
                    <div className="flex items-center gap-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => removeAttachment(attachment.id)}
                      >
                        <X className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </Card>

          {/* Ajout du sélecteur de niveau */}
          <Card className="col-span-2">
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-medium">Course level</h3>
                <Button variant="ghost" size="sm">
                  <PencilIcon className="w-4 h-4 mr-2" />
                  Edit level
                </Button>
              </div>
              <Select
                value={course.level}
                onChange={(e) =>
                  updateCourse('level', parseInt(e.target.value))
                }
                className="max-w-[200px]"
              >
                {Object.entries(LANGUAGE_LEVELS).map(([key, value]) => (
                  <option key={key} value={value}>
                    {key}
                  </option>
                ))}
              </Select>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
