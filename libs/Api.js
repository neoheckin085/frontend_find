import axios from 'axios';
import API_CONFIG from '../src/config/apiConfig';
import AsyncStorage from '@react-native-async-storage/async-storage';

const Api = axios.create({
  baseURL: API_CONFIG.getApiUrl(),
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true,
});

// Add a request interceptor
Api.interceptors.request.use(
  async (config) => {
    try {
      const token = await AsyncStorage.getItem('token');
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
      return config;
    } catch (error) {
      return Promise.reject(error);
    }
  },
  (error) => {
    return Promise.reject(error);
  }
);

export default Api;