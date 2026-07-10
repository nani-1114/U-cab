import api from './api';

export const registerUser = (data) =>
  api.post('/auth/user/register', data).then((r) => r.data);

export const loginUser = (data) =>
  api.post('/auth/user/login', data).then((r) => r.data);

export const registerDriver = (formData) =>
  api.post('/auth/driver/register', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  }).then((r) => r.data);

export const loginDriver = (data) =>
  api.post('/auth/driver/login', data).then((r) => r.data);

export const loginAdmin = (data) =>
  api.post('/auth/admin/login', data).then((r) => r.data);
