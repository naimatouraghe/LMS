import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Button } from '../../components/common/Button';
import { Input } from '../../components/features/Input';
import { Label } from '../../components/features/Label';
import { Checkbox } from '../../components/features/Checkbox';
import { PencilIcon, LayoutGrid, Video, Eye } from 'lucide-react';
import { courseApi } from '../../services/api/courseApi';

export default function ChapterForm() {
  const navigate = useNavigate();
  const { courseId } = useParams();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [course, setCourse] = useState(null);
  const [isLoadingCourse, setIsLoadingCourse] = useState(true);

  console.log('CourseId from params:', courseId); // Debug

  const [chapter, setChapter] = useState({
    title: '',
    description: '',
    videoUrl: '',
    position: 0,
    isPublished: false,
    isFree: false,
  });

  // Charger les informations du cours au montage du composant
  useEffect(() => {
    const fetchCourse = async () => {
      try {
        setIsLoadingCourse(true);
        setError(null);
        console.log('Fetching course with ID:', courseId);

        const response = await courseApi.getCourse(courseId);
        console.log('Raw course response:', response);

        // Vérifier si la réponse est valide
        if (!response || typeof response !== 'object') {
          throw new Error('Réponse invalide du serveur');
        }

        // La réponse semble être directement l'objet du cours
        const courseData = {
          id: response.id,
          title: response.title,
          description: response.description || '',
          categoryId: response.categoryId,
          imageUrl: response.imageUrl || '',
          price: response.price || 0,
          isPublished: response.isPublished || false,
          level: response.level || 1,
        };

        console.log('Parsed course data:', courseData);
        setCourse(courseData);
      } catch (err) {
        console.error('Error fetching course:', err);
        setError('Impossible de charger les informations du cours');
      } finally {
        setIsLoadingCourse(false);
      }
    };

    if (courseId) {
      fetchCourse();
    }
  }, [courseId]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setIsLoading(true);
      setError(null);

      if (!chapter.title?.trim()) {
        setError('Le titre du chapitre est requis');
        return;
      }

      // Structure simplifiée pour la création
      const createChapterDto = {
        title: chapter.title.trim(),
        description: chapter.description?.trim() || '',
        videoUrl: chapter.videoUrl?.trim() || '',
        isFree: chapter.isFree || false,
        courseId: courseId,
      };

      console.log('Sending chapter data:', createChapterDto);

      const response = await courseApi.addChapter(courseId, createChapterDto);
      console.log('Response from server:', response);

      if (response) {
        navigate(`/teacher/courses/${courseId}`);
      }
    } catch (err) {
      console.error('Full error:', err);
      setError(
        err.response?.data?.message || 'Erreur lors de la création du chapitre'
      );
    } finally {
      setIsLoading(false);
    }
  };

  const togglePublish = () => {
    setChapter((prev) => ({
      ...prev,
      isPublished: !prev.isPublished,
    }));
  };

  return (
    <div className="p-6">
      {isLoadingCourse ? (
        <div className="text-center">
          <p>Chargement des informations du cours...</p>
        </div>
      ) : error ? (
        <div className="mb-4 p-4 bg-red-100 text-red-700 rounded-md">
          {error}
        </div>
      ) : (
        <>
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-2xl font-bold">Chapter creation</h1>
              <p className="text-sm text-gray-500">Complete all fields (3/3)</p>
            </div>
            <Button
              variant="outline"
              onClick={togglePublish}
              disabled={isLoading}
            >
              {chapter.isPublished ? 'Unpublish' : 'Publish'}
            </Button>
          </div>

          <form onSubmit={handleSubmit}>
            {/* Contenu principal en deux colonnes */}
            <div className="grid grid-cols-2 gap-8">
              {/* Colonne gauche - Personnalisation */}
              <div className="space-y-6">
                <div>
                  <div className="flex items-center gap-2 mb-6">
                    <span className="p-2 bg-sky-100 rounded-md">
                      <LayoutGrid className="w-4 h-4 text-sky-700" />
                    </span>
                    <h2 className="text-xl font-semibold">
                      Customize your chapter
                    </h2>
                  </div>

                  {/* Titre */}
                  <div className="bg-gray-50 p-4 rounded-lg space-y-4">
                    <div className="flex items-center justify-between">
                      <h3 className="font-medium">Chapter title</h3>
                      <Button variant="ghost" size="sm">
                        <PencilIcon className="w-4 h-4 mr-2" />
                        Edit title
                      </Button>
                    </div>
                    <Input
                      value={chapter.title}
                      onChange={(e) =>
                        setChapter((prev) => ({
                          ...prev,
                          title: e.target.value,
                        }))
                      }
                      placeholder="Introduction"
                    />
                  </div>

                  {/* Description */}
                  <div className="bg-gray-50 p-4 rounded-lg space-y-4 mt-4">
                    <div className="flex items-center justify-between">
                      <h3 className="font-medium">Chapter description</h3>
                      <Button variant="ghost" size="sm">
                        <PencilIcon className="w-4 h-4 mr-2" />
                        Edit description
                      </Button>
                    </div>
                    <textarea
                      value={chapter.description}
                      onChange={(e) =>
                        setChapter((prev) => ({
                          ...prev,
                          description: e.target.value,
                        }))
                      }
                      placeholder="Objectives:&#10;In this chapter, we will cover various aspects related to Introduction..."
                      className="w-full min-h-[120px] px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>

                  {/* Access Settings */}
                  <div className="bg-gray-50 p-4 rounded-lg space-y-4 mt-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Eye className="w-5 h-5 text-gray-700" />
                        <h3 className="font-medium">Access Settings</h3>
                      </div>
                      <Button variant="ghost" size="sm">
                        <PencilIcon className="w-4 h-4 mr-2" />
                        Edit access settings
                      </Button>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="isFree"
                        checked={chapter.isFree}
                        onChange={(e) =>
                          setChapter((prev) => ({
                            ...prev,
                            isFree: e.target.checked,
                          }))
                        }
                      />
                      <Label htmlFor="isFree">
                        This chapter is free for preview
                      </Label>
                    </div>
                  </div>
                </div>
              </div>

              {/* Colonne droite - Vidéo */}
              <div className="space-y-6">
                <div>
                  <div className="flex items-center gap-2 mb-6">
                    <span className="p-2 bg-sky-100 rounded-md">
                      <Video className="w-4 h-4 text-sky-700" />
                    </span>
                    <h2 className="text-xl font-semibold">Add a video</h2>
                  </div>

                  <div className="bg-gray-50 p-4 rounded-lg space-y-4">
                    <div className="flex items-center justify-between">
                      <h3 className="font-medium">Chapter video</h3>
                      <Button variant="ghost" size="sm">
                        <PencilIcon className="w-4 h-4 mr-2" />
                        Edit video
                      </Button>
                    </div>

                    <div className="aspect-video bg-black rounded-lg flex items-center justify-center">
                      {chapter.videoUrl ? (
                        <video
                          src={chapter.videoUrl}
                          controls
                          className="w-full h-full rounded-lg"
                        />
                      ) : (
                        <div className="text-gray-400">Video preview</div>
                      )}
                    </div>

                    <Input
                      type="url"
                      value={chapter.videoUrl}
                      onChange={(e) =>
                        setChapter((prev) => ({
                          ...prev,
                          videoUrl: e.target.value,
                        }))
                      }
                      placeholder="Enter video URL"
                    />
                    <p className="text-sm text-gray-500">
                      Videos can take a few minutes to process. Refresh the page
                      if the video doesn't appear.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Ajout d'un bouton de soumission */}
            <div className="mt-6 flex justify-end gap-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => navigate(-1)}
                disabled={isLoading}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={isLoading}>
                {isLoading ? 'Creating...' : 'Create Chapter'}
              </Button>
            </div>
          </form>
        </>
      )}
    </div>
  );
}
