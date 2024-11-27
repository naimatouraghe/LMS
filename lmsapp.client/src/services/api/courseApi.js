import axios from '../axios';

export const courseApi = {
  // Gestion des cours
  getCourses: async (params) => {
    const { searchTerm, category } = params || {};
    const response = await axios.get('/Course', {
      params: { searchTerm, category },
    });
    return response.data;
  },

  getCourse: async (courseId) => {
    try {
      console.log('Getting course:', courseId);
      const response = await axios.get(
        `/Course/${courseId}?includeCategory=true`
      );

      const courseData = {
        ...response.data,
        userId: response.data.userId || '',
        category: {
          id: response.data.categoryId,
          name: '',
          courses: [],
        },
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
      console.log('Updating course:', courseId, courseDto);
      const response = await axios.put(`/Course/${courseId}`, courseDto);
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
    const response = await axios.get('/Course/categories');
    return response.data;
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
