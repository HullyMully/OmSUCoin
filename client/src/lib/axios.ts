import axios from 'axios';

const baseURL = process.env.NODE_ENV === 'production' 
  ? 'https://omsu-coin-zsmoc32hm-hullymullys-projects.vercel.app'
  : 'http://localhost:5000';

const api = axios.create({
  baseURL,
  withCredentials: true,
});

export default api; 