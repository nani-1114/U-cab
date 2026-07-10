import api from './api';

export const getRideById = (rideId) =>
  api.get(`/rides/${rideId}`).then((r) => r.data);

export const getLiveRideStatus = (rideId) =>
  api.get(`/rides/${rideId}/live`).then((r) => r.data);

export const updateRideStatus = (rideId, status) =>
  api.put(`/rides/${rideId}/status`, { status }).then((r) => r.data);
