import api from './api';

export const getDriverProfile = () =>
  api.get('/drivers/profile').then((r) => r.data);

export const updateDriverProfile = (data) =>
  api.put('/drivers/profile', data).then((r) => r.data);

export const toggleAvailability = (isAvailable) =>
  api.put('/drivers/availability', { isAvailable }).then((r) => r.data);

export const getRideRequests = () =>
  api.get('/drivers/rides/requests').then((r) => r.data);

export const acceptRide = (rideId) =>
  api.put(`/drivers/rides/${rideId}/accept`).then((r) => r.data);

export const rejectRide = (rideId) =>
  api.put(`/drivers/rides/${rideId}/reject`).then((r) => r.data);

export const startRide = (rideId) =>
  api.put(`/drivers/rides/${rideId}/start`).then((r) => r.data);

export const completeRide = (rideId) =>
  api.put(`/drivers/rides/${rideId}/complete`).then((r) => r.data);

export const getEarnings = (params = {}) =>
  api.get('/drivers/earnings', { params }).then((r) => r.data);
