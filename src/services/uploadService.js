import api from './api';

/**
 * Upload Service — sends a file to the backend which stores it in Cloudinary.
 */
const uploadService = {
  /**
   * POST /api/v1/upload/image
   * @param {File} file - image file from an <input type="file">
   * @returns {Promise<string>} the Cloudinary URL of the uploaded image
   */
  async uploadImage(file) {
    const formData = new FormData();
    formData.append('file', file);
    try {
      const response = await api.post('/api/v1/upload/image', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      // Backend may return { url: "..." } or { image_url: "..." } or { secure_url: "..." }
      const data = response.data;
      const url = data?.url ?? data?.image_url ?? data?.secure_url ?? data;
      if (!url || typeof url !== 'string') throw new Error('No URL returned from upload.');
      return url;
    } catch (error) {
      throw new Error(error.response?.data?.detail || error.message || 'Image upload failed.');
    }
  },
};

export default uploadService;
