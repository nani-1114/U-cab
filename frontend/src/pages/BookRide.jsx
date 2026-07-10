import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import BookingForm from '../components/BookingForm';
import RideMap from '../components/Map/RideMap';
import LocationSearch from '../components/Map/LocationSearch';
import SearchingAnimation from '../components/SearchingAnimation';
import { bookRide, estimateFare } from '../services/userService';
import { getErrorMessage } from '../services/api';
import { generateMockDriver } from '../utils/mockSimulator';

const BookRide = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const [pickup, setPickup] = useState(null);
  const [drop, setDrop] = useState(null);
  const [distance, setDistance] = useState(null);
  const [duration, setDuration] = useState(null);
  const [activeInput, setActiveInput] = useState('drop'); // 'pickup' or 'drop'
  const [isSearching, setIsSearching] = useState(false);

  useEffect(() => {
    // Try to get user location
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setPickup({
            address: 'My Current Location',
            lat: position.coords.latitude,
            lng: position.coords.longitude,
          });
        },
        (error) => {
          console.error("Geolocation error:", error);
          // Default to Bangalore if permission denied
          setPickup({
            address: 'Bangalore, India',
            lat: 12.9716,
            lng: 77.5946,
          });
        }
      );
    } else {
      setPickup({
        address: 'Bangalore, India',
        lat: 12.9716,
        lng: 77.5946,
      });
    }
  }, []);

  const handleEstimate = async (data) => {
    const res = await estimateFare(data);
    return res.data?.estimatedFare;
  };

  const handleBook = async (data) => {
    setIsSearching(true);
    setError('');
    
    // Simulate searching delay (4 seconds)
    setTimeout(async () => {
      try {
        const res = await bookRide(data);
        const rideId = res.data._id;
        
        // Generate mock driver for the simulation
        const driver = generateMockDriver(data.pickupLocation);
        localStorage.setItem(`mockRide_${rideId}`, JSON.stringify({
          driver,
          status: 'driver_assigned',
          lastUpdated: Date.now()
        }));

        navigate(`/rides/${rideId}/track`);
      } catch (err) {
        setError(getErrorMessage(err));
        setIsSearching(false);
      }
    }, 4000);
  };

  const handleRouteFound = ({ distanceInKm, estimatedDurationInMin }) => {
    setDistance(distanceInKm);
    setDuration(estimatedDurationInMin);
  };

  const handleMapClick = async (latlng) => {
    // Optional: fetch address via reverse geocoding
    // For now, use coordinates as address to save API calls, but Nominatim reverse can be added
    const newLoc = {
      address: `Selected on Map (${latlng.lat.toFixed(4)}, ${latlng.lng.toFixed(4)})`,
      lat: latlng.lat,
      lng: latlng.lng,
    };
    if (activeInput === 'pickup') {
      setPickup(newLoc);
      setActiveInput('drop');
    } else {
      setDrop(newLoc);
    }
  };

  return (
    <>
      {isSearching && <SearchingAnimation pickupAddress={pickup?.address || 'your location'} />}
      <div className="container-fluid py-4 h-100" style={{ minHeight: 'calc(100vh - 80px)', display: isSearching ? 'none' : 'block' }}>
        {error && <div className="alert alert-danger shadow-sm border-0">{error}</div>}
      
      <div className="row h-100 g-4">
        {/* Left Column: Search & Booking Form */}
        <div className="col-lg-4 col-md-5 d-flex flex-column gap-3">
          <div className="card border-0 shadow-lg rounded-4 overflow-hidden h-100">
            <div className="bg-dark text-white p-4">
              <h3 className="fw-bold mb-0">Get a ride</h3>
            </div>
            <div className="card-body p-4 d-flex flex-column">
              
              <div className="mb-4">
                 <div onClick={() => setActiveInput('pickup')} className={activeInput === 'pickup' ? '' : 'opacity-75'}>
                   <LocationSearch 
                     placeholder="Pickup location" 
                     value={pickup?.address || ''} 
                     onSelect={(loc) => { setPickup(loc); setActiveInput('drop'); }} 
                   />
                 </div>
                 <div onClick={() => setActiveInput('drop')} className={activeInput === 'drop' ? '' : 'opacity-75'}>
                   <LocationSearch 
                     placeholder="Where to?" 
                     value={drop?.address || ''} 
                     onSelect={(loc) => setDrop(loc)} 
                   />
                 </div>
              </div>

              {distance && duration && (
                <div className="d-flex justify-content-between align-items-center text-muted small fw-semibold mb-4 bg-light p-3 rounded-3 shadow-sm border">
                  <div className="d-flex align-items-center gap-2">
                    <i className="bi bi-signpost-2-fill text-primary fs-5"></i>
                    <span className="fs-6">{distance} km</span>
                  </div>
                  <div className="d-flex align-items-center gap-2">
                    <i className="bi bi-clock-history text-success fs-5"></i>
                    <span className="fs-6">{duration} min</span>
                  </div>
                </div>
              )}
              
              <BookingForm 
                pickup={pickup} 
                drop={drop} 
                distance={distance} 
                duration={duration} 
                onEstimate={handleEstimate} 
                onBook={handleBook} 
                loading={loading} 
              />
            </div>
          </div>
        </div>
        
        {/* Right Column: Map */}
        <div className="col-lg-8 col-md-7">
          <div className="h-100 min-vh-50">
            <RideMap 
              pickup={pickup} 
              drop={drop} 
              onRouteFound={handleRouteFound} 
              onMapClick={handleMapClick}
            />
          </div>
        </div>
      </div>
    </div>
  </>
  );
};

export default BookRide;
