const DRIVER_NAMES = ['Rahul Sharma', 'Anjali Gupta', 'Vikram Singh', 'Pooja Patel', 'Amit Kumar', 'Suresh Reddy', 'Kavya Rao'];
const VEHICLE_MODELS = ['Maruti Suzuki Dzire', 'Hyundai Accent', 'Honda Amaze', 'Toyota Etios', 'Tata Tigor'];

// Radius of Earth in km
const R = 6371;

export const generateMockDriver = (pickupLocation) => {
  // Generate random distance between 2km and 4km
  const distanceKm = 2 + Math.random() * 2;
  // Generate random bearing (0 to 360 degrees)
  const bearing = Math.random() * 360;
  
  // Calculate new lat/lng based on distance and bearing
  const lat1 = (pickupLocation.lat * Math.PI) / 180;
  const lon1 = (pickupLocation.lng * Math.PI) / 180;
  const d = distanceKm / R;
  const brng = (bearing * Math.PI) / 180;

  const lat2 = Math.asin(Math.sin(lat1) * Math.cos(d) + Math.cos(lat1) * Math.sin(d) * Math.cos(brng));
  const lon2 = lon1 + Math.atan2(Math.sin(brng) * Math.sin(d) * Math.cos(lat1), Math.cos(d) - Math.sin(lat1) * Math.sin(lat2));

  const driverLat = (lat2 * 180) / Math.PI;
  const driverLng = (lon2 * 180) / Math.PI;

  const name = DRIVER_NAMES[Math.floor(Math.random() * DRIVER_NAMES.length)];
  const vehicleModel = VEHICLE_MODELS[Math.floor(Math.random() * VEHICLE_MODELS.length)];
  const plateNumber = `KA ${Math.floor(Math.random() * 90 + 10)} ${String.fromCharCode(65 + Math.floor(Math.random() * 26))}${String.fromCharCode(65 + Math.floor(Math.random() * 26))} ${Math.floor(Math.random() * 9000 + 1000)}`;

  return {
    _id: `driver_${Date.now()}`,
    name,
    rating: Number((4.0 + Math.random()).toFixed(1)),
    phone: `+91 98765 ${Math.floor(Math.random() * 90000 + 10000)}`,
    vehicle: {
      make: vehicleModel.split(' ')[0],
      model: vehicleModel.split(' ').slice(1).join(' '),
      plateNumber,
    },
    currentLocation: { lat: driverLat, lng: driverLng },
    initialDistance: distanceKm
  };
};

// Calculate distance between two coordinates in km
export const calculateDistance = (loc1, loc2) => {
  const dLat = ((loc2.lat - loc1.lat) * Math.PI) / 180;
  const dLon = ((loc2.lng - loc1.lng) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((loc1.lat * Math.PI) / 180) * Math.cos((loc2.lat * Math.PI) / 180) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
};

// Interpolate position - move loc1 towards loc2 by a specific distance (in km)
export const interpolatePosition = (currentLoc, targetLoc, moveDistanceKm) => {
  const totalDist = calculateDistance(currentLoc, targetLoc);
  if (totalDist <= moveDistanceKm) return targetLoc; // We arrived

  const ratio = moveDistanceKm / totalDist;
  return {
    lat: currentLoc.lat + (targetLoc.lat - currentLoc.lat) * ratio,
    lng: currentLoc.lng + (targetLoc.lng - currentLoc.lng) * ratio,
  };
};
