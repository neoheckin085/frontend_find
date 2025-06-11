import axios from 'axios';

const apiConfig = axios.create({
baseURL: 'http://192.168.36.61:8000/api',
headers: {
'Content-Type': 'application/json',
},
});
export default apiConfig;