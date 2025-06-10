import axios from 'axios';

const apiConfig = axios.create({
baseURL: 'http://192.168.100.60:8000/api',
headers: {
'Content-Type': 'application/json',
},
});
export default apiConfig;