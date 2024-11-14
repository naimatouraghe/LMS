import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '../../components/common/Button';
import { Input } from '../../components/features/Input';
import { Label } from '../../components/features/Label';
import { Checkbox } from '../../components/features/Checkbox';
import { PencilIcon, LayoutGrid, Video, Eye } from 'lucide-react';

export default function ChapterForm() {
  const navigate = useNavigate();

  const [chapter, setChapter] = useState({
    title: '',
    description: '',
    isFree: false,
    videoUrl: '',
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log(chapter);
    navigate(-1);
  };

  return (
    <div className="p-6">
      {/* En-tête */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold">Chapter creation</h1>
          <p className="text-sm text-gray-500">Complete all fields (3/3)</p>
        </div>
        <Button variant="outline">Unpublish</Button>
      </div>

      {/* Contenu principal en deux colonnes */}
      <div className="grid grid-cols-2 gap-8">
        {/* Colonne gauche - Personnalisation */}
        <div className="space-y-6">
          <div>
            <div className="flex items-center gap-2 mb-6">
              <span className="p-2 bg-sky-100 rounded-md">
                <LayoutGrid className="w-4 h-4 text-sky-700" />
              </span>
              <h2 className="text-xl font-semibold">Customize your chapter</h2>
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
                  setChapter((prev) => ({ ...prev, title: e.target.value }))
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
                <Label htmlFor="isFree">This chapter is free for preview</Label>
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
                  setChapter((prev) => ({ ...prev, videoUrl: e.target.value }))
                }
                placeholder="Enter video URL"
              />
              <p className="text-sm text-gray-500">
                Videos can take a few minutes to process. Refresh the page if
                the video doesn't appear.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
