import api from './api';

export const payRide = (rideId, method) =>
  api.post('/payments/pay', { rideId, method }).then((r) => r.data);

export const getPaymentHistory = (params = {}) =>
  api.get('/payments/history', { params }).then((r) => r.data);

export const getReceipt = (paymentId) =>
  api.get(`/payments/${paymentId}/receipt`).then((r) => r.data);
