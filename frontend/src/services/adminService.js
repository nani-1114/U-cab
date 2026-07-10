import api from './api';

export const getDashboard = () =>
  api.get('/admin/dashboard').then((r) => r.data);

export const getUsers = (params = {}) =>
  api.get('/admin/users', { params }).then((r) => r.data);

export const toggleUserBlock = (userId) =>
  api.put(`/admin/users/${userId}/block`).then((r) => r.data);

export const getDrivers = (params = {}) =>
  api.get('/admin/drivers', { params }).then((r) => r.data);

export const approveDriver = (driverId, decision) =>
  api.put(`/admin/drivers/${driverId}/approve`, { decision }).then((r) => r.data);

export const toggleDriverBlock = (driverId) =>
  api.put(`/admin/drivers/${driverId}/block`).then((r) => r.data);

export const getRides = (params = {}) =>
  api.get('/admin/rides', { params }).then((r) => r.data);

export const cancelRide = (rideId, reason = '') =>
  api.put(`/admin/rides/${rideId}/cancel`, { reason }).then((r) => r.data);

export const getPayments = (params = {}) =>
  api.get('/admin/payments', { params }).then((r) => r.data);
