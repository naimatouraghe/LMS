import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, CheckCircle } from 'lucide-react';
import axios from 'axios';
import ChapterItem from '@/components/ChapterItem';

const Course = () => {
  const { courseId } = useParams();
  const navigate = useNavigate();
  const [course, setCourse] = useState(null);
  const [chapters, setChapters] = useState([]);
  const [currentChapter, setCurrentChapter] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchCourseData = async () => {
      try {
        setIsLoading(true);
        const [courseRes, chaptersRes] = await Promise.all([
          axios.get(`https://localhost:7001/api/Course/${courseId}`),
          axios.get(`https://localhost:7001/api/Course/${courseId}/chapters`),
        ]);

        setCourse(courseRes.data);

        // Trier les chapitres par position
        const sortedChapters = chaptersRes.data.sort(
          (a, b) => a.position - b.position
        );
        setChapters(sortedChapters);

        // Définir le premier chapitre publié comme chapitre actuel
        if (!currentChapter) {
          const firstPublishedChapter = sortedChapters.find(
            (ch) => ch.isPublished
          );
          if (firstPublishedChapter) {
            setCurrentChapter(firstPublishedChapter);
          }
        }
      } catch (error) {
        console.error('Error fetching course data:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchCourseData();
  }, [courseId]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-full">Loading...</div>
    );
  }

  return (
    <div className="h-full">
      {/* Header */}
      <div className="p-4 border-b flex items-center justify-between bg-white">
        <div className="flex items-center gap-x-2">
          <ArrowLeft
            className="h-5 w-5 cursor-pointer"
            onClick={() => navigate('/browse')}
          />
          <h1 className="text-xl font-medium">{course?.title}</h1>
        </div>
        <div className="flex items-center gap-x-2">
          <button
            onClick={() => navigate('/browse')}
            className="text-sm bg-slate-200 px-2 py-1 rounded-md hover:bg-slate-300"
          >
            Exit
          </button>
        </div>
      </div>

      {/* Grid Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-[300px_1fr] h-[calc(100%-73px)]">
        {/* Sidebar */}
        <div className="hidden lg:flex h-full flex-col border-r border-slate-200 bg-white">
          <div className="p-4 border-b">
            <h2 className="text-xl font-semibold">{course?.title}</h2>
            <p className="text-sm text-slate-500 mt-2">
              {chapters.length} chapters
            </p>
          </div>

          {/* Chapters List */}
          <div className="flex-1 overflow-y-auto">
            <div className="flex flex-col">
              {chapters.map((chapter) => (
                <ChapterItem
                  key={chapter.id}
                  title={chapter.title}
                  position={chapter.position}
                  isPublished={chapter.isPublished}
                  isFree={chapter.isFree}
                  videoUrl={chapter.videoUrl}
                  isCurrent={currentChapter?.id === chapter.id}
                  onClick={() => {
                    if (chapter.isPublished) {
                      setCurrentChapter(chapter);
                    }
                  }}
                />
              ))}
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="flex flex-col h-full bg-white">
          {currentChapter && (
            <>
              {/* Video Player */}
              <div className="relative aspect-video bg-slate-900">
                <video
                  className="h-full w-full"
                  src={currentChapter.videoUrl}
                  controls
                />
              </div>

              {/* Content */}
              <div className="p-6 flex flex-col gap-6">
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-2xl font-bold">
                      {currentChapter.title}
                    </h2>
                    <p className="text-sm text-slate-500">
                      Chapter {currentChapter.position}
                    </p>
                  </div>
                </div>

                <div>
                  <h3 className="text-lg font-semibold mb-2">Description:</h3>
                  <p className="text-slate-600">{currentChapter.description}</p>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default Course;
