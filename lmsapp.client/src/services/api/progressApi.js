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

  // Gestion des chapitres
  markChapterAsCompleted: async (chapterId) => {
    const response = await axios.post(
      `/Progress/chapters/${chapterId}/complete`
    );
    return response.data;
  },

  unmarkChapterAsCompleted: async (chapterId) => {
    const response = await axios.post(
      `/Progress/chapters/${chapterId}/uncomplete`
    );
    return response.data;
  },

  // Progression des cours
  getCourseProgress: async (courseId) => {
    const response = await axios.get(`/Progress/courses/${courseId}`);
    return response.data;
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
