import axios from '../axios';

export const progressApi = {
  // Gestion de base de la progression
  createProgress: async (progressDto) => {
    const response = await axios.post('/Progress', progressDto);
    return response.data;
  },

  getProgress: async (progressId) => {
    const response = await axios.get(`/Progress/${progressId}`);
    return response.data;
  },

  updateProgress: async (progressId, progressDto) => {
    const response = await axios.put(`/Progress/${progressId}`, progressDto);
    return response.data;
  },

  deleteProgress: async (progressId) => {
    const response = await axios.delete(`/Progress/${progressId}`);
    return response.data;
  },

  markChapterAsCompleted: async (chapterId) => {
    try {
      const response = await axios.post(
        `/Progress/chapters/${chapterId}/complete`
      );
      console.log('Response from marking chapter complete:', response.data);
      return response.data;
    } catch (error) {
      console.error('Error details:', error.response?.data);
      throw error;
    }
  },

  unmarkChapterAsCompleted: async (chapterId) => {
    const response = await axios.post(
      `/Progress/chapters/${chapterId}/uncomplete`
    );
    return response.data;
  },

  // Progression des cours
  getCourseProgress: async (courseId) => {
    try {
      const response = await axios.get(`/Progress/courses/${courseId}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching course progress:', error);
      throw error;
    }
  },

  getAllProgress: async () => {
    const response = await axios.get('/Progress');
    return response.data;
  },

  getCourseCompletionPercentage: async (courseId) => {
    const response = await axios.get(
      `/Progress/courses/${courseId}/percentage`
    );
    return response.data;
  },
};
