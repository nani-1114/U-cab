import api from './api';

export const getDriverReviews = (driverId) =>
  api.get(`/reviews/driver/${driverId}`).then((r) => r.data);

export const submitReview = (data) =>
  api.post('/reviews', data).then((r) => r.data);
