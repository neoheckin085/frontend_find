import axios from 'axios';
import API_CONFIG from '../src/config/apiConfig';

const Api = axios.create({
  baseURL: API_CONFIG.getApiUrl(),
  headers: {
    'Content-Type': 'application/json',
  },
});

export default Api;