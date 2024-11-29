import axios from '../axios';

export const courseApi = {
  // Gestion des cours
  getCourses: async (params) => {
    const { searchTerm, category, level, priceRange, sort } = params || {};
    try {
      // Log des paramètres avant l'envoi
      console.log('API Call Parameters:', {
        searchTerm,
        category,
        level,
        priceRange,
        sort,
      });

      // Construction de l'URL avec les paramètres
      const queryParams = new URLSearchParams();
      if (searchTerm) queryParams.append('searchTerm', searchTerm);
      if (category) queryParams.append('category', category);
      if (level !== undefined && level !== 'all')
        queryParams.append('level', level);
      if (priceRange && priceRange !== 'All prices')
        queryParams.append('priceRange', priceRange);
      if (sort) queryParams.append('sort', sort);

      const url = `/Course?${queryParams.toString()}`;
      console.log('Final API URL:', url);

      const response = await axios.get(url);
      console.log('API Response:', response.data);
      return response.data;
    } catch (error) {
      console.error('API Error:', error.response?.data);
      throw error;
    }
  },

  getCourse: async (courseId) => {
    try {
      console.log('Getting course:', courseId);
      const response = await axios.get(
        `/Course/${courseId}?includeCategory=true`
      );
      console.log('Raw API response:', response.data);

      const courseData = {
        ...response.data,
        title: response.data.title || '',
        description: response.data.description || '',
        imageUrl: response.data.imageUrl || '',
        price: parseFloat(response.data.price) || 0,
        categoryId: response.data.categoryId || '',
        category: response.data.category || {
          id: '',
          name: '',
          courses: [],
        },
        level: response.data.level || 0,
        isPublished: response.data.isPublished || false,
        chapters: response.data.chapters || [],
        attachments: response.data.attachments || [],
        purchases: response.data.purchases || [],
      };

      console.log('Transformed course data:', courseData);
      return courseData;
    } catch (error) {
      console.error('Error getting course:', error);
      throw error;
    }
  },

  createCourse: async (courseData) => {
    try {
      const response = await axios.post('/Course/initial', courseData);
      return response.data;
    } catch (error) {
      console.error('API Error:', error.response?.data);
      throw error;
    }
  },

  updateCourse: async (courseId, courseDto) => {
    try {
      if (!courseDto.userId || !courseDto.title || !courseDto.categoryId) {
        throw new Error('Missing required fields');
      }

      // Créer la structure exacte attendue par le backend
      const requestData = {
        courseDto: {
          userId: courseDto.userId,
          title: courseDto.title.trim(),
          category: {
            id: courseDto.categoryId,
            name: courseDto.category?.name || '',
            courses: [],
          },
          chapters:
            courseDto.chapters?.map((chapter) => ({
              id: chapter.id,
              title: chapter.title,
              description: chapter.description || '',
              videoUrl: chapter.videoUrl || '',
              position: chapter.position,
              isPublished: chapter.isPublished || false,
              isFree: chapter.isFree || false,
              courseId: courseId,
              course: null,
              userProgress: [],
              muxData: null,
            })) || [],
          id: courseId,
          description: courseDto.description || '',
          imageUrl: courseDto.imageUrl || '',
          price: Number(courseDto.price) || 0,
          isPublished: Boolean(courseDto.isPublished),
          categoryId: courseDto.categoryId,
          level: Number(courseDto.level) || 0,
          attachments: courseDto.attachments || [],
          purchases: courseDto.purchases || [],
          createdAt: courseDto.createdAt || new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        },
      };

      console.log('Updating course:', courseId);
      console.log('Sending request data:', requestData);

      const response = await axios.put(`/Course/${courseId}`, requestData);
      console.log('Update response:', response.data);
      return response.data;
    } catch (error) {
      console.error('API Error:', error.response?.data);
      throw error;
    }
  },

  deleteCourse: async (courseId) => {
    const response = await axios.delete(`/Course/${courseId}`);
    return response.data;
  },

  getUserCourses: async (userId) => {
    const response = await axios.get(`/Course/user/${userId}`);
    return response.data;
  },

  // Gestion des chapitres
  addChapter: async (courseId, chapterDto) => {
    try {
      console.log('Adding chapter to course:', courseId, chapterDto);
      const response = await axios.post(
        `/Course/${courseId}/chapters`,
        chapterDto
      );
      console.log('Chapter creation response:', response.data);
      return response.data;
    } catch (error) {
      console.error('API Error:', error.response?.data);
      throw error;
    }
  },

  updateChapter: async (chapterId, chapterDto) => {
    const response = await axios.put(
      `/Course/chapters/${chapterId}`,
      chapterDto
    );
    return response.data;
  },

  deleteChapter: async (chapterId) => {
    const response = await axios.delete(`/Course/chapters/${chapterId}`);
    return response.data;
  },

  reorderChapters: async (courseId, chapterIds) => {
    const response = await axios.put(
      `/Course/${courseId}/chapters/reorder`,
      chapterIds
    );
    return response.data;
  },

  getCourseChapters: async (courseId) => {
    const response = await axios.get(`/Course/${courseId}/chapters`);
    return response.data;
  },

  // Gestion des pièces jointes
  addAttachment: async (courseId, file) => {
    const formData = new FormData();
    formData.append('file', file);
    const response = await axios.post(
      `/Course/${courseId}/attachments`,
      formData,
      {
        headers: { 'Content-Type': 'multipart/form-data' },
      }
    );
    return response.data;
  },

  deleteAttachment: async (attachmentId) => {
    const response = await axios.delete(`/Course/attachments/${attachmentId}`);
    return response.data;
  },

  getCourseAttachments: async (courseId) => {
    const response = await axios.get(`/Course/${courseId}/attachments`);
    return response.data;
  },

  // Gestion des catégories
  getCategories: async () => {
    try {
      const response = await axios.get('/Course/categories');
      console.log('Categories response:', response.data); // Pour le débogage
      return response.data; // Devrait contenir { value: [...categories] }
    } catch (error) {
      console.error('Error fetching categories:', error);
      return { value: [] };
    }
  },

  createCategory: async (categoryDto) => {
    const response = await axios.post('/Course/categories', categoryDto);
    return response.data;
  },

  updateCategory: async (categoryId, categoryDto) => {
    const response = await axios.put(
      `/Course/categories/${categoryId}`,
      categoryDto
    );
    return response.data;
  },

  deleteCategory: async (categoryId) => {
    const response = await axios.delete(`/Course/categories/${categoryId}`);
    return response.data;
  },

  // Analytics et progression
  getTeacherAnalytics: async () => {
    const response = await axios.get('/Course/analytics/teacher');
    return response.data;
  },

  getPurchasedCourses: async () => {
    try {
      const response = await axios.get('/Course/purchased');
      console.log('Response from /Course/purchased:', response.data);

      // Extraire les cours de la propriété 'value'
      const purchasedCourses = response.data?.value || [];

      console.log('Parsed purchased courses:', purchasedCourses);
      return purchasedCourses;
    } catch (error) {
      console.error('Error fetching purchased courses:', error);
      return [];
    }
  },

  getCourseProgress: async (courseId) => {
    const response = await axios.get(`/Course/${courseId}/progress`);
    return response.data;
  },

  hasUserPurchasedCourse: async (courseId) => {
    try {
      const response = await axios.get(`/Course/${courseId}/purchased`);
      console.log('Raw response from purchased check:', response.data);
      // Retourner directement la valeur booléenne
      return response.data === true;
    } catch (error) {
      console.error('Error checking course purchase:', error);
      return false;
    }
  },

  createInitialCourse: async (initialCourseDto) => {
    try {
      console.log('Creating initial course:', initialCourseDto);
      const response = await axios.post('/Course/initial', initialCourseDto);
      console.log('Initial course response:', response.data);
      return response.data;
    } catch (error) {
      console.error('API Error:', error.response?.data);
      throw error;
    }
  },
};
