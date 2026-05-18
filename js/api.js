// Base URL da API
export const API_URL = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1' 
  ? 'http://localhost:3000/api'
  : 'https://rio-groove-backend.onrender.com/api'; // Em produção, aponte para sua URL real do backend
