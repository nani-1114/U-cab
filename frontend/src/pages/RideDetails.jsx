import { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { getRideById } from '../services/rideService';
import { cancelRide } from '../services/userService';
import { payRide } from '../services/paymentService';
import { getErrorMessage } from '../services/api';
import { formatCurrency, capitalize } from '../utils/formatters';
import DriverCard from '../components/DriverCard';
import PaymentModal from '../components/PaymentModal';
import Loader from '../components/Loader';

const statusSteps = ['requested', 'accepted', 'ongoing', 'completed'];

const SuccessCheckmark = () => (
  <motion.div
    initial={{ scale: 0 }}
    animate={{ scale: 1 }}
    transition={{ type: "spring", stiffness: 200, damping: 20 }}
    className="bg-success rounded-circle d-flex justify-content-center align-items-center mx-auto mb-4 text-white shadow-sm"
    style={{ width: '90px', height: '90px' }}
  >
    <motion.svg
      xmlns="http://www.w3.org/2000/svg"
      width="48"
      height="48"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="3"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <motion.polyline
        initial={{ pathLength: 0 }}
        animate={{ pathLength: 1 }}
        transition={{ delay: 0.3, duration: 0.5, ease: "easeOut" }}
        points="20 6 9 17 4 12"
      />
    </motion.svg>
  </motion.div>
);

const RideDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [ride, setRide] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showPayment, setShowPayment] = useState(false);
  const [payLoading, setPayLoading] = useState(false);
  const [success, setSuccess] = useState('');
  
  // Mock Timestamps
  const [rideTimes, setRideTimes] = useState(null);

  const fetchRide = async () => {
    try {
      const res = await getRideById(id);
      let activeRide = res.data;

      // Integrate mock simulation data if it exists
      const mockDataStr = localStorage.getItem(`mockRide_${id}`);
      if (mockDataStr) {
        const parsedMock = JSON.parse(mockDataStr);
        activeRide = {
          ...activeRide,
          status: parsedMock.status,
          driver: parsedMock.driver || activeRide.driver
        };
      }

      setRide(activeRide);
      
      // Generate mock timestamps for completed rides
      if (activeRide.status === 'completed') {
        const durationMins = activeRide.estimatedDurationInMin || 15;
        const endTime = new Date();
        const startTime = new Date(endTime.getTime() - durationMins * 60000);
        setRideTimes({
          start: startTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          end: endTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          date: endTime.toLocaleDateString()
        });
      }

    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchRide(); }, [id]);

  const handleCancel = async () => {
    if (!window.confirm('Cancel this ride?')) return;
    try {
      await cancelRide(id, 'Cancelled by user');
      setSuccess('Ride cancelled');
      fetchRide();
    } catch (err) {
      setError(getErrorMessage(err));
    }
  };

  const handlePay = async (method) => {
    setPayLoading(true);
    try {
      await payRide(id, method);
      setSuccess('Payment successful!');
      setShowPayment(false);
      fetchRide();
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setPayLoading(false);
    }
  };

  const handleDownloadInvoice = () => {
    window.print();
  };

  if (loading) return <Loader />;
  if (!ride) return <div className="alert alert-danger">{error || 'Ride not found'}</div>;

  const fare = ride.fare?.final || ride.fare?.estimated || 0;

  // --- COMPLETED RIDE VIEW (TRIP SUMMARY) ---
  if (ride.status === 'completed') {
    return (
      <div className="container py-5" style={{ maxWidth: '600px' }}>
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <SuccessCheckmark />
          <h2 className="text-center fw-bold mb-4">Trip Completed</h2>

          <div className="card border-0 shadow-lg rounded-4 overflow-hidden mb-4">
            <div className="bg-dark text-white text-center py-4">
              <p className="text-uppercase small fw-bold mb-1 opacity-75">Total Fare</p>
              <h1 className="fw-bold mb-0 display-4">{formatCurrency(fare)}</h1>
              <div className="mt-2 opacity-75 small">
                {ride.paymentMethod === 'cash' ? 'To be paid in cash' : 'Paid via ' + capitalize(ride.paymentMethod)}
              </div>
            </div>

            <div className="card-body p-4">
              <div className="d-flex justify-content-between text-muted small fw-bold text-uppercase border-bottom pb-3 mb-3">
                <span>{rideTimes?.date}</span>
                <span>{rideTimes?.start} - {rideTimes?.end}</span>
              </div>

              <div className="mb-4">
                <div className="d-flex mb-3">
                  <i className="bi bi-geo-alt-fill text-primary fs-5 me-3"></i>
                  <div>
                    <div className="fw-medium text-dark">{ride.pickupLocation?.address}</div>
                    <div className="small text-muted">{rideTimes?.start}</div>
                  </div>
                </div>
                <div className="d-flex">
                  <i className="bi bi-geo-alt-fill text-danger fs-5 me-3"></i>
                  <div>
                    <div className="fw-medium text-dark">{ride.dropLocation?.address}</div>
                    <div className="small text-muted">{rideTimes?.end}</div>
                  </div>
                </div>
              </div>

              <div className="row g-3 bg-light p-3 rounded-3 mb-4 text-center">
                <div className="col-6 border-end">
                  <div className="small text-muted fw-bold text-uppercase mb-1">Distance</div>
                  <div className="fs-5 fw-bold text-dark">{ride.distanceInKm} km</div>
                </div>
                <div className="col-6">
                  <div className="small text-muted fw-bold text-uppercase mb-1">Duration</div>
                  <div className="fs-5 fw-bold text-dark">{ride.estimatedDurationInMin} min</div>
                </div>
              </div>

              {ride.driver && (
                <div>
                  <h6 className="fw-bold text-uppercase text-muted small mb-3">Driven By</h6>
                  <DriverCard driver={ride.driver} showRating={true} />
                </div>
              )}
            </div>
          </div>

          <div className="d-flex flex-column gap-3">
            <div className="d-flex gap-3">
              <Link to="/reviews" state={{ rideId: ride._id, driverId: ride.driver?._id }} className="btn btn-warning flex-grow-1 py-3 fw-bold rounded-3 shadow-sm">
                <i className="bi bi-star-fill me-2"></i> Rate Driver
              </Link>
              <button onClick={() => navigate('/book-ride')} className="btn btn-dark flex-grow-1 py-3 fw-bold rounded-3 shadow-sm">
                <i className="bi bi-arrow-repeat me-2"></i> Book Again
              </button>
            </div>
            <button onClick={handleDownloadInvoice} className="btn btn-outline-secondary py-3 fw-bold rounded-3 d-print-none">
              <i className="bi bi-download me-2"></i> Download Invoice
            </button>
          </div>
        </motion.div>
      </div>
    );
  }

  // --- IN PROGRESS OR CANCELLED RIDE VIEW ---
  const currentStep = statusSteps.indexOf(ride.status);
  
  return (
    <div>
      <div className="d-flex justify-content-between align-items-center mb-4 flex-wrap gap-2">
        <h2 className="fw-bold mb-0">Ride Details</h2>
        {['requested', 'accepted', 'ongoing'].includes(ride.status) && (
          <Link to={`/rides/${id}/track`} className="btn btn-warning btn-sm">Track Ride</Link>
        )}
      </div>

      {error && <div className="alert alert-danger">{error}</div>}
      {success && <div className="alert alert-success">{success}</div>}

      <div className="card border-0 shadow-sm mb-4">
        <div className="card-body p-4">
          <div className="d-flex justify-content-between mb-4">
            <span className={`badge bg-${ride.status === 'cancelled' ? 'danger' : 'warning'} fs-6`}>
              {capitalize(ride.status).replace('_', ' ')}
            </span>
            <h4 className="text-warning mb-0">{formatCurrency(fare)}</h4>
          </div>

          <div className="d-flex justify-content-between mb-4">
            {statusSteps.map((step, i) => (
              <div key={step} className={`text-center flex-fill ${i <= currentStep ? 'text-warning' : 'text-muted'}`}>
                <div className={`rounded-circle mx-auto mb-1 step-dot ${i <= currentStep ? 'bg-warning' : 'bg-light border'}`} />
                <small className="text-capitalize d-none d-md-block">{step}</small>
              </div>
            ))}
          </div>

          <p className="mb-1"><i className="bi bi-geo-alt-fill text-success me-2" /><strong>Pickup:</strong> {ride.pickupLocation?.address}</p>
          <p className="mb-3"><i className="bi bi-geo-alt-fill text-danger me-2" /><strong>Drop:</strong> {ride.dropLocation?.address}</p>

          <div className="row g-2 text-muted small">
            <div className="col-6">Distance: {ride.distanceInKm} km</div>
            <div className="col-6">Vehicle: {capitalize(ride.vehicleType || '')}</div>
            <div className="col-6">Payment: {capitalize(ride.paymentMethod || '')}</div>
            <div className="col-6">Payment Status: {capitalize(ride.paymentStatus || '')}</div>
          </div>
        </div>
      </div>

      {ride.driver && (
        <div className="mb-4">
          <h5 className="fw-bold mb-3">Your Driver</h5>
          <div className="col-md-6"><DriverCard driver={ride.driver} /></div>
        </div>
      )}

      <div className="d-flex gap-2 flex-wrap">
        {['requested', 'accepted', 'driver_assigned', 'driver_arriving'].includes(ride.status) && (
          <button className="btn btn-outline-danger" onClick={handleCancel}>Cancel Ride</button>
        )}
      </div>

      <PaymentModal show={showPayment} onClose={() => setShowPayment(false)} onPay={handlePay} ride={ride} loading={payLoading} />
    </div>
  );
};

export default RideDetails;
