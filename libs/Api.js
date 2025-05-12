import axios from 'axios';
const Api = axios.create({
baseURL: 'http://192.168.1.9:8000/api',  // ini ganti ipnya dengan ip yang sesuai.
headers: {
'Content-Type': 'application/json',

},
});
export default Api; 