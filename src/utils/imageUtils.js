// Utility functions for handling image URLs

/**
 * Get the full URL for an image path
 * @param {string} imagePath - The image path from the database
 * @returns {string} - The full URL to access the image
 */
export const getImageUrl = (imagePath) => {
  if (!imagePath) return '';
  
  // If it's already a full URL, return as is
  if (imagePath.startsWith('http://') || imagePath.startsWith('https://')) {
    return imagePath;
  }
    // Get base URL from environment variables or use default
  const baseUrl = import.meta.env.VITE_SERVER_BASE_URL || 'http://localhost:5000';
  
  // If path starts with /uploads/, it's a server upload
  if (imagePath.startsWith('/uploads/')) {
    return `${baseUrl}${imagePath}`;
  }
  
  // If path starts with /src/assets/, it's a local asset (for backward compatibility)
  if (imagePath.startsWith('/src/assets/')) {
    // For local assets, we need to handle them differently in Vite
    const assetPath = imagePath.replace('/src/assets/', '/src/assets/');
    try {
      // Try to import the asset
      return new URL(assetPath, import.meta.url).href;    } catch {
      console.warn('Could not load local asset:', imagePath);
      return '';
    }
  }
  
  // Default case: assume it's a server path
  return `${baseUrl}${imagePath}`;
};

/**
 * Get the API base URL
 * @returns {string} - The base URL for API calls
 */
export const getApiBaseUrl = () => {
  return import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000';
};
