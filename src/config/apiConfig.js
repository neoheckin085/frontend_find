import { Platform } from 'react-native';

// Konfigurasi API URL
const API_CONFIG = {
  // Base URL for development
  BASE_URL: Platform.OS === 'android' 
    ? 'http://192.168.17.61:8000'  // Android Emulator
    : 'http://localhost:8000', // iOS Simulator or web
  API_PATH: '/api',
  
  // Fungsi helper untuk mendapatkan URL lengkap
  getApiUrl: function() {
    return `${this.BASE_URL}${this.API_PATH}`;
  },
  
  // Helper function to get API host without protocol
  getApiHost: function() {
    const url = new URL(this.BASE_URL);
    return url.hostname;
  },
  
  // Fungsi helper untuk mendapatkan URL storage/media
  getStorageUrl: function(path) {
    if (!path) return null;
    
    // Jika path sudah berisi URL lengkap, kembalikan apa adanya
    if (path.startsWith('http')) {
      console.log('getStorageUrl - already complete URL:', path);
      return path;
    }
    
    // Hapus slash di awal path jika ada
    const cleanPath = path.startsWith('/') ? path.substring(1) : path;
    
    // Jika path dimulai dengan 'storage/', maka ini adalah path yang disimpan oleh Laravel
    if (cleanPath.startsWith('storage/')) {
      const fullUrl = `${this.BASE_URL}/${cleanPath}`;
      console.log('getStorageUrl - storage/ path:', { original: path, result: fullUrl });
      return fullUrl;
    }
    
    // Jika path dimulai dengan /storage/ (sesuai dengan format yang disimpan di authController)
    if (path.startsWith('/storage/')) {
      const storageCleanPath = path.substring(1); // Hilangkan slash awal
      const fullUrl = `${this.BASE_URL}/${storageCleanPath}`;
      console.log('getStorageUrl - /storage/ path:', { original: path, result: fullUrl });
      return fullUrl;
    }
    
    const fullUrl = `${this.BASE_URL}/${cleanPath}`;
    console.log('getStorageUrl - other path:', { original: path, result: fullUrl });
    return fullUrl;
  }
};

export default API_CONFIG;