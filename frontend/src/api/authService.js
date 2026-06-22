import api from './axiosInstance';

export const login = (credentials) =>
  api.post('/auth/login', credentials);           // POST /api/auth/login

export const register = (data) =>
  api.post('/auth/register', data);               // POST /api/auth/register

export const logout = () =>
  api.post('/auth/logout');                       // POST /api/auth/logout

export const getMe = () =>
  api.get('/auth/me');                            // GET  /api/auth/me
