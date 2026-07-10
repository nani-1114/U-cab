export const isValidEmail = (email) =>
  /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

export const isValidPhone = (phone) => /^\d{10}$/.test(phone);

export const isValidPassword = (password) => password.length >= 6;

export const validateRegister = (data) => {
  const errors = {};
  if (!data.name?.trim()) errors.name = 'Name is required';
  if (!data.email?.trim()) errors.email = 'Email is required';
  else if (!isValidEmail(data.email)) errors.email = 'Invalid email format';
  if (!data.phone?.trim()) errors.phone = 'Phone is required';
  else if (!isValidPhone(data.phone)) errors.phone = 'Phone must be 10 digits';
  if (!data.password) errors.password = 'Password is required';
  else if (!isValidPassword(data.password))
    errors.password = 'Password must be at least 6 characters';
  return errors;
};

export const validateLogin = (data) => {
  const errors = {};
  if (!data.email?.trim()) errors.email = 'Email is required';
  if (!data.password) errors.password = 'Password is required';
  return errors;
};

export const validateBooking = (data) => {
  const errors = {};
  if (!data.pickupAddress?.trim()) errors.pickupAddress = 'Pickup address is required';
  if (!data.dropAddress?.trim()) errors.dropAddress = 'Drop address is required';
  if (!data.distanceInKm || Number(data.distanceInKm) <= 0)
    errors.distanceInKm = 'Distance must be greater than 0';
  if (!data.vehicleType) errors.vehicleType = 'Vehicle type is required';
  if (!data.paymentMethod) errors.paymentMethod = 'Payment method is required';
  return errors;
};

export const validateDriverRegister = (data) => {
  const errors = validateRegister(data);
  if (!data.licenseNumber?.trim()) errors.licenseNumber = 'License number is required';
  if (!data.vehicleMake?.trim()) errors.vehicleMake = 'Vehicle make is required';
  if (!data.vehicleModel?.trim()) errors.vehicleModel = 'Vehicle model is required';
  if (!data.plateNumber?.trim()) errors.plateNumber = 'Plate number is required';
  return errors;
};
