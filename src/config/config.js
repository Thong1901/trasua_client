// Environment configuration
export const config = {
  // API Base URL
  API_BASE_URL: import.meta.env.VITE_API_BASE_URL || 'https://trasua-sever.onrender.com/api',
  
  // Server Base URL (for images and static files)
  SERVER_BASE_URL: import.meta.env.VITE_SERVER_BASE_URL || 'https://trasua-sever.onrender.com',
  
  // Local development URLs
  LOCAL_API_URL: 'http://localhost:5000/api',
  LOCAL_SERVER_URL: 'http://localhost:5000',
  
  // Check if running in development
  isDevelopment: import.meta.env.DEV,
  
  // Get appropriate URLs based on environment
  getApiUrl: () => {
    return config.isDevelopment ? config.LOCAL_API_URL : config.API_BASE_URL;
  },
  
  getServerUrl: () => {
    return config.isDevelopment ? config.LOCAL_SERVER_URL : config.SERVER_BASE_URL;
  },
    // Get full image URL
  getImageUrl: (imagePath) => {
    if (!imagePath) return '';
    
    // If it's base64 data, return as is
    if (imagePath.startsWith('data:image/')) {
      return imagePath;
    }
    
    // If already a full URL, return as is
    if (imagePath.startsWith('http')) {
      return imagePath;
    }
    
    // If starts with /uploads/, prepend server URL
    if (imagePath.startsWith('/uploads/')) {
      return config.getServerUrl() + imagePath;
    }
    
    // If starts with /src/assets/, handle as asset
    if (imagePath.startsWith('/src/assets/')) {
      return imagePath.replace('/src/assets/', '/src/assets/');
    }
    
    // Default case
    return config.getServerUrl() + '/' + imagePath.replace(/^\/+/, '');
  }
};

export default config;
