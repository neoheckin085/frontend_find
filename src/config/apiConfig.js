import { Platform } from 'react-native';

const DEV = true; // Set this to false for production

// Konfigurasi IP address sesuai environment
const IP_ADDRESS = '192.168.135.61'; // Ganti dengan IP address komputer Anda

const config = {
    development: {
        android: {
            emulator: 'http://10.0.2.2:8000',
            device: `http://${IP_ADDRESS}:8000`
        },
        ios: {
            simulator: 'http://localhost:8000',
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
            // Untuk physical device Android, gunakan IP address
            return config.development.android.device;
            // Untuk emulator Android, gunakan ini:
            // return config.development.android.emulator;
        } else if (Platform.OS === 'ios') {
            // Untuk physical device iOS, gunakan IP address
            return config.development.ios.device;
            // Untuk simulator iOS, gunakan ini:
            // return config.development.ios.simulator;
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
        const cleanPath = path.startsWith('/') ? path.substring(1) : path;
        return `${this.BASE_URL}/${cleanPath}`;
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