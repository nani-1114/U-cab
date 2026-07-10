import api from './api';

export const getNotifications = () =>
  api.get('/notifications').then((r) => r.data);

export const markAllRead = () =>
  api.put('/notifications/read-all').then((r) => r.data);

export const markAsRead = (notificationId) =>
  api.put(`/notifications/${notificationId}/read`).then((r) => r.data);
