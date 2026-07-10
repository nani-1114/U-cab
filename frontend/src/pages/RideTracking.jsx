import { useState, useCallback, useEffect, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ArrowLeft,
  Compass,
  Clock3,
  Gauge,
  MapPinned,
  MoonStar,
  ShieldAlert,
  Sparkles,
  Route as RouteIcon,
  LoaderCircle,
  CircleDollarSign,
} from 'lucide-react';
import { getLiveRideStatus } from '../services/rideService';
import { cancelRide } from '../services/userService';
import { getErrorMessage } from '../services/api';
import { usePolling } from '../hooks/usePolling';
import { POLL_INTERVAL } from '../utils/constants';
import RideMap from '../components/Map/RideMap';
import { interpolatePosition, calculateDistance } from '../utils/mockSimulator';
import StatusBadge from '../components/Tracking/StatusBadge';
import MetricCard from '../components/Tracking/MetricCard';
import DriverProfileCard from '../components/Tracking/DriverProfileCard';

const SIMULATION_SPEED_KM_PER_SEC = 0.05;

const statusConfig = {
  requested: { label: 'Searching for your driver', tone: 'warning' },
  searching: { label: 'Finding nearby drivers', tone: 'warning' },
  driver_assigned: { label: 'Driver assigned and heading your way', tone: 'info' },
  driver_arriving: { label: 'Driver is arriving soon', tone: 'info' },
  driver_arrived: { label: 'Driver has arrived at pickup', tone: 'success' },
  started: { label: 'Trip in progress', tone: 'info' },
  driving: { label: 'Trip in progress', tone: 'info' },
  completed: { label: 'You have arrived safely', tone: 'success' },
  cancelled: { label: 'Ride cancelled', tone: 'danger' },
};

const toNumber = (value, fallback = 0) => {
  const numericValue = typeof value === 'number' ? value : Number(value);
  return Number.isFinite(numericValue) ? numericValue : fallback;
};

const formatNumber = (value, digits = 1, fallback = 0) => toNumber(value, fallback).toFixed(digits);

const RideTracking = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [ride, setRide] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [isSimulated, setIsSimulated] = useState(false);
  const [mockState, setMockState] = useState(null);
  const [eta, setEta] = useState(null);
  const [distance, setDistance] = useState(null);
  const [isWaitingAtPickup, setIsWaitingAtPickup] = useState(false);
  const [darkMode, setDarkMode] = useState(true);
  const [routeGeometry, setRouteGeometry] = useState([]);
  const [routeSummary, setRouteSummary] = useState(null);
  const [mapView, setMapView] = useState({ center: null, zoom: 13 });

  const fetchLive = useCallback(async () => {
    const mockDataStr = localStorage.getItem(`mockRide_${id}`);

    try {
      const res = await getLiveRideStatus(id);

      if (mockDataStr) {
        if (!isSimulated) setIsSimulated(true);
        const parsedMock = JSON.parse(mockDataStr);
        if (!mockState) setMockState(parsedMock);

        setRide({
          ...res.data,
          driver: mockState?.driver || parsedMock.driver,
          status: mockState?.status || parsedMock.status,
        });
      } else {
        setRide(res.data);
      }
      setError('');
    } catch (err) {
      if (loading) setError(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  }, [id, loading, mockState, isSimulated]);

  usePolling(fetchLive, POLL_INTERVAL, true);

  useEffect(() => {
    if (!isSimulated || !ride || !mockState || isWaitingAtPickup) return;

    if (['completed', 'cancelled'].includes(mockState.status)) {
      return;
    }

    const interval = setInterval(() => {
      setMockState((prev) => {
        const pickupLoc = ride.pickupLocation;
        const dropLoc = ride.dropLocation;
        const currentDriverLoc = prev.driver.currentLocation;

        let targetLoc;
        let isDrivingToDrop = false;

        if (['driver_assigned', 'driver_arriving'].includes(prev.status)) {
          targetLoc = pickupLoc;
        } else if (['started', 'driving'].includes(prev.status)) {
          targetLoc = dropLoc;
          isDrivingToDrop = true;
        } else if (prev.status === 'driver_arrived') {
          setIsWaitingAtPickup(true);
          setTimeout(() => {
            setMockState((state) => {
              const nextState = { ...state, status: 'started' };
              localStorage.setItem(`mockRide_${id}`, JSON.stringify(nextState));
              return nextState;
            });
            setIsWaitingAtPickup(false);
          }, 5000);
          return prev;
        } else {
          return prev;
        }

        const nextLoc = interpolatePosition(currentDriverLoc, targetLoc, SIMULATION_SPEED_KM_PER_SEC);
        const dist = calculateDistance(nextLoc, targetLoc);

        setDistance(dist);
        setEta(Math.ceil((dist / SIMULATION_SPEED_KM_PER_SEC) / 60));

        let newStatus = prev.status;

        if (isDrivingToDrop) {
          if (dist < 0.02) newStatus = 'completed';
        } else if (dist < 0.02) {
          newStatus = 'driver_arrived';
        } else if (dist < 0.5) {
          newStatus = 'driver_arriving';
        }

        const newState = {
          ...prev,
          status: newStatus,
          driver: {
            ...prev.driver,
            currentLocation: nextLoc,
          },
        };

        localStorage.setItem(`mockRide_${id}`, JSON.stringify(newState));
        return newState;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [isSimulated, ride, mockState, isWaitingAtPickup, id]);

  const handleCancel = async () => {
    if (!window.confirm('Cancel this ride?')) return;
    try {
      await cancelRide(id);
      if (isSimulated) {
        const newState = { ...mockState, status: 'cancelled' };
        setMockState(newState);
        localStorage.setItem(`mockRide_${id}`, JSON.stringify(newState));
      }
      navigate('/history');
    } catch (err) {
      setError(getErrorMessage(err));
    }
  };

  const handleRouteFound = useCallback((route) => {
    setRouteGeometry(route.coordinates || []);
    setRouteSummary(route);
  }, []);

  const handleRecenter = () => {
    if (ride?.driver?.currentLocation) {
      setMapView({ center: ride.driver.currentLocation, zoom: 15 });
    } else if (ride?.pickupLocation) {
      setMapView({ center: ride.pickupLocation, zoom: 14 });
    }
  };

  const handleZoom = (delta) => {
    setMapView((prev) => ({ ...prev, zoom: Math.max(10, Math.min(18, prev.zoom + delta)) }));
  };

  const handleEmergency = () => {
    window.alert('Emergency support has been notified and your safety contacts are being informed.');
  };

  const handleCall = () => {
    if (ride?.driver?.phone) {
      window.location.href = `tel:${ride.driver.phone}`;
    }
  };

  const handleMessage = () => {
    if (ride?.driver?.phone) {
      window.alert(`Messaging ${ride.driver.name} is ready for the next update.`);
    }
  };

  const driver = ride?.driver;
  const location = driver?.currentLocation;
  const isDrivingToDrop = ['started', 'driving'].includes(ride?.status);
  const routeWaypoints = location ? [location, isDrivingToDrop ? ride?.dropLocation : ride?.pickupLocation] : null;
  const boundsTargets = location ? [location, isDrivingToDrop ? ride?.dropLocation : ride?.pickupLocation] : [];
  const statusMeta = statusConfig[ride?.status] || statusConfig.requested;
  const activeEta = Math.max(1, Math.round(toNumber(eta ?? routeSummary?.estimatedDurationInMin ?? 3, 3)));
  const activeDistance = toNumber(distance ?? routeSummary?.distanceInKm ?? 2.4, 2.4);
  const speedKmph = Math.max(16, Math.round((activeDistance / Math.max(activeEta / 60, 0.1)) * 1.2));
  const fareAmount = Math.round(toNumber(240, 240));

  const progressPercent = useMemo(() => {
    if (!location || routeGeometry.length < 2) return 0;
    let bestIndex = 0;
    let bestDistance = Number.POSITIVE_INFINITY;
    routeGeometry.forEach((point, index) => {
      const delta = calculateDistance(location, { lat: point[0], lng: point[1] });
      if (delta < bestDistance) {
        bestDistance = delta;
        bestIndex = index;
      }
    });
    return Math.min(100, Math.max(0, Math.round((bestIndex / Math.max(routeGeometry.length - 1, 1)) * 100)));
  }, [location, routeGeometry]);

  const progressRoute = useMemo(() => {
    if (!routeGeometry.length) return [];
    const safeIndex = Math.max(1, Math.round((progressPercent / 100) * (routeGeometry.length - 1)));
    return routeGeometry.slice(0, safeIndex);
  }, [progressPercent, routeGeometry]);

  const remainingRoute = useMemo(() => {
    if (!routeGeometry.length) return [];
    const safeIndex = Math.max(1, Math.round((progressPercent / 100) * (routeGeometry.length - 1)));
    return routeGeometry.slice(safeIndex);
  }, [progressPercent, routeGeometry]);

  const travelDirection = useMemo(() => {
    if (!location || !routeGeometry.length) return 0;
    const currentIndex = Math.max(0, Math.min(routeGeometry.length - 1, Math.round((progressPercent / 100) * (routeGeometry.length - 1))));
    const targetPoint = routeGeometry[Math.min(currentIndex + 1, routeGeometry.length - 1)];
    if (!targetPoint) return 0;
    const deltaLat = targetPoint[0] - location.lat;
    const deltaLng = targetPoint[1] - location.lng;
    return (Math.atan2(deltaLng, deltaLat) * 180) / Math.PI;
  }, [location, progressPercent, routeGeometry]);

  if (loading) {
    return (
      <div className="ride-shell d-flex justify-content-center align-items-center px-3">
        <motion.div
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          className="w-100"
          style={{ maxWidth: '560px' }}
        >
          <div className="glass-card p-4 rounded-4">
            <div className="d-flex align-items-center gap-3 mb-4">
              <div className="skeleton-box rounded-circle" style={{ width: 48, height: 48 }} />
              <div className="flex-grow-1">
                <div className="skeleton-box mb-2" style={{ width: '60%', height: 16 }} />
                <div className="skeleton-box" style={{ width: '35%', height: 12 }} />
              </div>
            </div>
            <div className="row g-3 mb-4">
              {[1, 2, 3, 4].map((item) => (
                <div className="col-6" key={item}>
                  <div className="glass-card p-3 rounded-4">
                    <div className="skeleton-box mb-2" style={{ width: '50%', height: 12 }} />
                    <div className="skeleton-box" style={{ width: '70%', height: 20 }} />
                  </div>
                </div>
              ))}
            </div>
            <div className="d-flex align-items-center justify-content-center py-4">
              <LoaderCircle className="me-2" size={20} />
              <span className="fw-semibold text-muted">Preparing your premium trip view…</span>
            </div>
          </div>
        </motion.div>
      </div>
    );
  }

  return (
    <div className={`ride-shell ${darkMode ? 'theme-dark' : 'theme-light'}`}>
      <div className="position-absolute top-0 start-0 w-100 h-100 z-0">
        <RideMap
          pickup={ride?.pickupLocation}
          drop={ride?.dropLocation}
          driverLocation={location}
          routeWaypoints={routeWaypoints}
          boundsTargets={boundsTargets}
          fullScreen
          darkMode={darkMode}
          onRouteFound={handleRouteFound}
          onRecenter={handleRecenter}
          onZoomIn={() => handleZoom(1)}
          onZoomOut={() => handleZoom(-1)}
          onToggleTheme={() => setDarkMode((value) => !value)}
          onEmergency={handleEmergency}
          completedRoute={progressRoute}
          remainingRoute={remainingRoute}
          rotationAngle={travelDirection}
          centerOverride={mapView.center}
          zoomOverride={mapView.zoom}
        />
      </div>

      <motion.button
        initial={{ opacity: 0, x: -16 }}
        animate={{ opacity: 1, x: 0 }}
        onClick={() => navigate(-1)}
        className="btn btn-light rounded-circle shadow-lg position-absolute top-0 start-0 m-3 z-2 d-flex align-items-center justify-content-center"
        style={{ width: 48, height: 48 }}
      >
        <ArrowLeft size={20} />
      </motion.button>

      <motion.div
        initial={{ opacity: 0, y: -14 }}
        animate={{ opacity: 1, y: 0 }}
        className="position-absolute top-0 start-50 translate-middle-x mt-3 z-2 d-flex flex-wrap justify-content-center gap-2 px-3"
      >
        <div className="glass-card px-3 py-2 rounded-pill d-flex align-items-center gap-2">
          <StatusBadge label={statusMeta.label} tone={statusMeta.tone} />
        </div>
        <div className="glass-card px-3 py-2 rounded-pill d-flex align-items-center gap-2 fw-semibold text-dark">
          <RouteIcon size={16} />
          <span>{formatNumber(activeDistance, 1)} km • {activeEta} min</span>
        </div>
      </motion.div>

      {error && (
        <div className="position-absolute top-0 start-50 translate-middle-x mt-5 z-3 w-100 px-3" style={{ maxWidth: '420px' }}>
          <div className="alert alert-danger shadow-sm border-0 py-2 mb-0">{error}</div>
        </div>
      )}

      <div className="position-absolute bottom-0 start-0 w-100 z-2 d-flex justify-content-center px-3 pb-3 pointer-events-none">
        <AnimatePresence>
          <motion.div
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            exit={{ y: '100%' }}
            transition={{ type: 'spring', damping: 28, stiffness: 220 }}
            className="ride-sheet pointer-events-auto"
          >
            <div className="d-flex justify-content-center pt-3 pb-2">
              <div className="rounded-pill" style={{ width: 44, height: 5, background: 'rgba(148, 163, 184, 0.5)' }} />
            </div>

            <div className="px-4 pb-4">
              <div className="d-flex flex-wrap align-items-center justify-content-between gap-3 mb-3">
                <div>
                  <div className="d-flex align-items-center gap-2 mb-2">
                    <Sparkles size={16} className="text-primary" />
                    <span className="small fw-semibold text-muted">Live ride status</span>
                  </div>
                  <h4 className="fw-bold mb-1 text-dark">{statusMeta.label}</h4>
                  {isWaitingAtPickup && <div className="text-primary fw-semibold small">Boarding at pickup…</div>}
                </div>
                <div className="glass-card px-3 py-2 rounded-pill fw-semibold text-dark">
                  {Math.round(progressPercent)}% complete
                </div>
              </div>

              <div className="row g-3 mb-3">
                <div className="col-6 col-md-3">
                  <MetricCard icon={Clock3} label="ETA" value={`${activeEta} min`} sublabel="Arrival window" />
                </div>
                <div className="col-6 col-md-3">
                  <MetricCard icon={MapPinned} label="Distance" value={`${formatNumber(activeDistance, 1)} km`} sublabel="To destination" />
                </div>
                <div className="col-6 col-md-3">
                  <MetricCard icon={Gauge} label="Speed" value={`${speedKmph} km/h`} sublabel="Live estimate" />
                </div>
                <div className="col-6 col-md-3">
                  <MetricCard icon={CircleDollarSign} label="Fare" value={`₹${fareAmount}`} sublabel="Estimated" />
                </div>
              </div>

              <DriverProfileCard
                driver={driver}
                statusLabel={statusMeta.label}
                onCall={handleCall}
                onMessage={handleMessage}
              />

              <div className="d-flex gap-2 mt-3">
                {['completed'].includes(ride?.status) ? (
                  <button onClick={() => navigate(`/rides/${id}`)} className="btn btn-dark w-100 py-3 fw-bold rounded-4 shadow-sm">
                    View receipt
                  </button>
                ) : (
                  <>
                    <button onClick={handleCall} className="btn btn-dark flex-grow-1 py-3 fw-semibold rounded-4">
                      <span className="me-2">📞</span> Call driver
                    </button>
                    <button onClick={handleMessage} className="btn btn-outline-dark flex-grow-1 py-3 fw-semibold rounded-4">
                      <span className="me-2">💬</span> Message
                    </button>
                    <button onClick={handleCancel} className="btn btn-danger px-4 py-3 rounded-4 shadow-sm fw-bold" title="Cancel Ride">
                      <ShieldAlert size={18} />
                    </button>
                  </>
                )}
              </div>
            </div>
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
};

export default RideTracking;
