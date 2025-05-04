import axios from 'axios';
const Api = axios.create({
baseURL: 'http://10.214.6.5:8080/api',
headers: {
'Content-Type': 'application/json',
},
});
export default Api;