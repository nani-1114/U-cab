const resolvedApiUrl = (import.meta.env.VITE_API_URL || '').trim();
// Ensure a sane default in dev builds (proxy in vite will forward '/api')
export const API_BASE_URL = (resolvedApiUrl && resolvedApiUrl !== '/') ? resolvedApiUrl.replace(/\/$/, '') : '/api';

export const ROLES = {
  USER: 'user',
  DRIVER: 'driver',
  ADMIN: 'admin',
};

export const RIDE_STATUS = {
  REQUESTED: 'requested',
  ACCEPTED: 'accepted',
  REJECTED: 'rejected',
  ONGOING: 'ongoing',
  COMPLETED: 'completed',
  CANCELLED: 'cancelled',
};

export const VEHICLE_TYPES = [
  { value: 'mini', label: 'Mini', icon: '🚗' },
  { value: 'sedan', label: 'Sedan', icon: '🚙' },
  { value: 'suv', label: 'SUV', icon: '🚐' },
  { value: 'bike', label: 'Bike', icon: '🏍️' },
];

export const PAYMENT_METHODS = [
  { value: 'cash', label: 'Cash' },
  { value: 'card', label: 'Card' },
  { value: 'wallet', label: 'Wallet' },
];

export const POLL_INTERVAL = 5000;

export const DASHBOARD_PATHS = {
  [ROLES.USER]: '/dashboard',
  [ROLES.DRIVER]: '/driver-dashboard',
  [ROLES.ADMIN]: '/admin-dashboard',
};
