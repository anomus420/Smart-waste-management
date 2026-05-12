const axios = require('axios');
const api = axios.create({
  baseURL: 'https://example.com/api',
});
console.log(api.getUri({ url: '/auth/login' }));
