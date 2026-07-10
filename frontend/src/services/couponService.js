import api from './api';

export const getActiveCoupons = () =>
  api.get('/coupons/active').then((r) => r.data);

export const getAllCoupons = () =>
  api.get('/coupons').then((r) => r.data);

export const createCoupon = (data) =>
  api.post('/coupons', data).then((r) => r.data);

export const updateCoupon = (couponId, data) =>
  api.put(`/coupons/${couponId}`, data).then((r) => r.data);

export const deleteCoupon = (couponId) =>
  api.delete(`/coupons/${couponId}`).then((r) => r.data);
