import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { apiConfig } from '../config/apiConfig';

const Api = axios.create(apiConfig);

// Add a request interceptor
Api.interceptors.request.use(
    async (config) => {
        const token = await AsyncStorage.getItem('token');
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

// Add a response interceptor
Api.interceptors.response.use(
    (response) => {
        return response;
    },
    async (error) => {
        if (error.response?.status === 401) {
            // Handle unauthorized error (e.g., clear token and redirect to login)
            await AsyncStorage.removeItem('token');
            // You might want to add navigation logic here
        }
        return Promise.reject(error);
    }
);

export default Api; 