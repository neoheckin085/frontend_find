import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import API_CONFIG from '../src/config/apiConfig';

export const baseURL = API_CONFIG.API_URL;

const Api = axios.create({
    baseURL: API_CONFIG.API_URL,
    headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
        'Connection': 'close',
    },
    timeout: 10000
});

// Add request interceptor
Api.interceptors.request.use(
    async (config) => {
        const token = await AsyncStorage.getItem('token');
        console.log('API Request:', {
            url: config.url,
            method: config.method,
            hasToken: !!token,
            token: token,
            headers: config.headers,
            baseURL: config.baseURL
        });
        
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
            console.log('Token added to request:', {
                url: config.url,
                tokenLength: token.length
            });
        } else {
            console.warn('No token found for request:', config.url);
        }
        return config;
    },
    (error) => {
        console.error('Request interceptor error:', error);
        return Promise.reject(error);
    }
);

// Add response interceptor
Api.interceptors.response.use(
    (response) => {
        console.log('API Response:', {
            url: response.config.url,
            status: response.status,
            statusText: response.statusText,
            data: response.data
        });
        return response;
    },
    async (error) => {
        console.error('API Error:', {
            url: error.config?.url,
            status: error.response?.status,
            statusText: error.response?.statusText,
            data: error.response?.data,
            headers: error.response?.headers,
            message: error.message,
            code: error.code
        });
        
        if (error.response?.status === 401) {
            console.warn('Unauthorized request, removing token');
            await AsyncStorage.removeItem('token');
            await AsyncStorage.removeItem('userId');
            await AsyncStorage.removeItem('is_admin');
        }
        return Promise.reject(error);
    }
);

export default Api;