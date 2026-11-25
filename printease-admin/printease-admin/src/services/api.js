import axios from 'axios';

const api = axios.create({
  baseURL: 'https://nastiness-pending-undertone.ngrok-free.dev',
  headers: {
    'ngrok-skip-browser-warning': 'true',
    'Content-Type': 'application/json',
  },
});

export default api;