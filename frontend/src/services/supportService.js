import api from './api';

export const createTicket = (data) =>
  api.post('/support', data).then((r) => r.data);

export const getMyTickets = () =>
  api.get('/support/my-tickets').then((r) => r.data);

export const getAllTickets = (params = {}) =>
  api.get('/support', { params }).then((r) => r.data);

export const updateTicket = (ticketId, data) =>
  api.put(`/support/${ticketId}`, data).then((r) => r.data);
