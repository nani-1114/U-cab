import api from './api';

export const getProfile = () =>
  api.get('/users/profile').then((r) => r.data);

export const updateProfile = (data) =>
  api.put('/users/profile', data).then((r) => r.data);

export const estimateFare = (data) =>
  api.post('/users/fare-estimate', data).then((r) => r.data);

export const bookRide = (data) =>
  api.post('/users/rides/book', data).then((r) => r.data);

export const cancelRide = (rideId, reason = '') =>
  api.put(`/users/rides/${rideId}/cancel`, { reason }).then((r) => r.data);

export const getRideHistory = (params = {}) =>
  api.get('/users/rides/history', { params }).then((r) => r.data);

export const getLiveRide = () =>
  api.get('/users/rides/live').then((r) => r.data);
