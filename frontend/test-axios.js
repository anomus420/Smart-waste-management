import axios from 'axios';
const api = axios.create({
  baseURL: 'https://smart-waste-management-ugat.onrender.com/api',
});
console.log(api.getUri({ url: '/auth/login' }));
