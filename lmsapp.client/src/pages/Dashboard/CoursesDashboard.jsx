import { useState } from 'react';
import { Card } from '../../components/features/Card';
import { Button } from '../../components/common/Button';
import { Input } from '../../components/features/Input';
import { Textarea } from '../../components/features/Textarea';
import { ImageUpload } from '../../components/features/ImageUpload';
import { PencilIcon, Plus, DollarSign, FileText, X } from 'lucide-react';
import { Select } from '../../components/features/Select';
import { useNavigate } from 'react-router-dom';
import ChapterForm from '../teacher/ChapterForm';

export default function CreateCourse() {
  const navigate = useNavigate();

  const [course, setCourse] = useState({
    title: '',
    description: '',
    imageUrl: '',
    price: 0,
    category: '',
    chapters: [],
    attachments: [],
  });

  const [isComplete, setIsComplete] = useState(false);
  const [isChapterFormOpen, setIsChapterFormOpen] = useState(false);
  const [editingChapter, setEditingChapter] = useState(null);

  // Catégories disponibles (à adapter selon vos besoins)
  const categories = [
    'Filming',
    'Photography',
    'Design',
    'Development',
    'Business',
    'Music',
  ];

  const updateCourse = (field, value) => {
    setCourse((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleFileUpload = (file) => {
    const newAttachment = {
      id: Date.now(),
      name: file.name,
      url: URL.createObjectURL(file), // Dans un cas réel, ceci serait l'URL du serveur
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

  const handleAddChapter = (chapterData) => {
    setCourse((prev) => ({
      ...prev,
      chapters: [...prev.chapters, { ...chapterData, id: Date.now() }],
    }));
  };

  const handleEditChapter = (chapterData) => {
    setCourse((prev) => ({
      ...prev,
      chapters: prev.chapters.map((chapter) =>
        chapter.id === editingChapter.id
          ? { ...chapter, ...chapterData }
          : chapter
      ),
    }));
    setEditingChapter(null);
  };

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold">Course setup</h1>
          <p className="text-sm text-gray-500">
            Complete all fields ({isComplete ? '6/6' : '0/6'})
          </p>
        </div>
        <Button variant="outline">Unpublish</Button>
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

          {/* Section Catégorie */}
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
                value={course.category}
                onChange={(e) => updateCourse('category', e.target.value)}
                className="max-w-[200px]"
              >
                <option value="">Select a category</option>
                {categories.map((category) => (
                  <option key={category} value={category}>
                    {category}
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
                  onClick={() => navigate('/teacher/chapters/create')}
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Add a chapter
                </Button>
              </div>

              <div className="space-y-4">
                {course.chapters.map((chapter) => (
                  <div
                    key={chapter.id}
                    className="flex items-center justify-between p-4 bg-gray-50 rounded-lg"
                  >
                    <span>{chapter.title}</span>
                    <div className="flex items-center gap-2">
                      <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded-full">
                        Published
                      </span>
                      <Button variant="ghost" size="sm">
                        <PencilIcon className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                ))}

                <p className="text-sm text-gray-500 italic">
                  Drag and drop to reorder chapters
                </p>
              </div>
            </div>
          </Card>

          {/* Section prix */}
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
                onChange={(e) =>
                  updateCourse('price', parseFloat(e.target.value))
                }
                placeholder="Enter price in EUR"
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

                {course.attachments.map((attachment) => (
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
        </div>
      </div>
    </div>
  );
}
