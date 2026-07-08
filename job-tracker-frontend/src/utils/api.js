import axios from 'axios';

// Base URL for all API requests
const API = axios.create({
  baseURL: 'https://job-tracker-application-vgl1.onrender.com/api'
});

// Automatically add token to every request if user is logged in
API.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default API;