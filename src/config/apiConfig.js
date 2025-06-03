import { Platform } from 'react-native';

const DEV = true; // Set this to false for production

// Konfigurasi IP address sesuai environment
const IP_ADDRESS = '10.0.2.2';

// Function to detect if running on emulator
const isEmulator = () => {
  return Platform.OS === 'android' && Platform.constants.Brand === 'google';
};

const config = {
    development: {
        android: {
            emulator: 'http://192.168.100.60:8000',
            device: `http://${IP_ADDRESS}:8000`
        },
        ios: {
            simulator: 'http://192.168.100.60:8000',
            device: `http://${IP_ADDRESS}:8000`
        }
    },
    production: {
        api: 'https://your-production-api.com'
    }
};

// Choose the appropriate base URL based on platform and environment
const getBaseUrl = () => {
    if (DEV) {
        if (Platform.OS === 'android') {
            // Use emulator URL if running on emulator, otherwise use device URL
            return isEmulator() ? config.development.android.emulator : config.development.android.device;
        } else if (Platform.OS === 'ios') {
            // For iOS, use simulator URL if running on simulator, otherwise use device URL
            return Platform.isPad || Platform.isTV ? config.development.ios.simulator : config.development.ios.device;
        }
    }
    return config.production.api;
};

// Debug info
console.log('Platform:', Platform.OS);
console.log('Base URL:', getBaseUrl());
console.log('API URL:', `${getBaseUrl()}/api`);

const API_CONFIG = {
    // Base URL tanpa /api
    BASE_URL: getBaseUrl(),
    // Full API URL dengan /api
    API_URL: `${getBaseUrl()}/api`,
    
    // Helper function untuk mendapatkan URL storage/media
    getStorageUrl: function(path) {
        if (!path) return null;
        if (path.startsWith('http')) return path;
        
        // Remove any leading slashes
        const cleanPath = path.startsWith('/') ? path.slice(1) : path;
        // Remove /api from baseURL for storage paths
        const storageBaseUrl = cleanPath.replace('/api', '');
        
        // Log the URL generation
        console.log('Generating storage URL:', {
            originalPath: path,
            cleanPath: cleanPath,
            baseUrl: this.storageBaseUrl,
            fullUrl: `${this.storageBaseUrl}/storage/${cleanPath}`
        });
        
        // Always use /storage/ prefix for consistency
        return `${this.storageBaseUrl}/storage/${cleanPath}`;
    }
};

// Export konfigurasi untuk axios
export const apiConfig = {
    baseURL: API_CONFIG.API_URL,
    headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
    },
    timeout: 10000
};

export default API_CONFIG;