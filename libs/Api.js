import axios from 'axios';
const Api = axios.create({
baseURL: 'http://192.168.153.115:8080/api',
headers: {
'Content-Type': 'application/json',
},
});
export default Api;