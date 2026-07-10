import { useEffect, useState, useCallback } from 'react';
import {
  getDriverProfile, toggleAvailability, getRideRequests,
  acceptRide, rejectRide, startRide, completeRide, getEarnings,
} from '../services/driverService';
import { getErrorMessage } from '../services/api';
import { usePolling } from '../hooks/usePolling';
import { POLL_INTERVAL } from '../utils/constants';
import { formatCurrency } from '../utils/formatters';
import RideCard from '../components/RideCard';
import Loader from '../components/Loader';

const ACTIVE_RIDE_KEY = 'ucab_driver_active_ride';

const DriverDashboard = () => {
  const [profile, setProfile] = useState(null);
  const [requests, setRequests] = useState([]);
  const [activeRide, setActiveRide] = useState(() => {
    try {
      const stored = sessionStorage.getItem(ACTIVE_RIDE_KEY);
      return stored ? JSON.parse(stored) : null;
    } catch { return null; }
  });
  const [earnings, setEarnings] = useState(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const setActiveRidePersist = (ride) => {
    setActiveRide(ride);
    if (ride) sessionStorage.setItem(ACTIVE_RIDE_KEY, JSON.stringify(ride));
    else sessionStorage.removeItem(ACTIVE_RIDE_KEY);
  };

  const fetchProfile = useCallback(async () => {
    const res = await getDriverProfile();
    setProfile(res.data);
  }, []);

  const fetchRequests = useCallback(async () => {
    if (!profile?.isAvailable) return;
    try {
      const res = await getRideRequests();
      setRequests(res.data || []);
    } catch { /* offline */ }
  }, [profile?.isAvailable]);

  useEffect(() => {
    const init = async () => {
      try {
        await fetchProfile();
        const res = await getEarnings({ limit: 5 });
        setEarnings(res.data);
      } catch (err) {
        setError(getErrorMessage(err));
      } finally {
        setLoading(false);
      }
    };
    init();
  }, [fetchProfile]);

  usePolling(fetchRequests, POLL_INTERVAL, profile?.isAvailable && !activeRide);

  const handleToggleAvailability = async () => {
    setActionLoading('availability');
    try {
      const res = await toggleAvailability(!profile?.isAvailable);
      setProfile((prev) => ({ ...prev, isAvailable: res.data.isAvailable }));
      setSuccess(res.data.isAvailable ? 'You are now online' : 'You are now offline');
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setActionLoading('');
    }
  };

  const handleRideAction = async (action, rideId) => {
    setActionLoading(rideId);
    setError('');
    try {
      const actions = { accept: acceptRide, reject: rejectRide, start: startRide, complete: completeRide };
      const res = await actions[action](rideId);
      setSuccess(`Ride ${action}ed successfully`);
      if (action === 'accept' || action === 'start') setActiveRidePersist(res.data);
      else if (action === 'complete') setActiveRidePersist(null);
      await fetchRequests();
      await fetchProfile();
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setActionLoading('');
    }
  };

  if (loading) return <Loader />;

  return (
    <div>
      <div className="d-flex justify-content-between align-items-center mb-4 flex-wrap gap-2">
        <h2 className="fw-bold mb-0">Driver Dashboard</h2>
        <button
          className={`btn ${profile?.isAvailable ? 'btn-success' : 'btn-secondary'}`}
          onClick={handleToggleAvailability}
          disabled={actionLoading === 'availability' || profile?.approvalStatus !== 'approved'}
        >
          {actionLoading === 'availability' ? 'Updating...' : profile?.isAvailable ? '🟢 Online' : '⚫ Offline'}
        </button>
      </div>

      {profile?.approvalStatus !== 'approved' && (
        <div className="alert alert-warning">
          Your account is <strong>{profile?.approvalStatus}</strong>. Please wait for admin approval.
        </div>
      )}

      {error && <div className="alert alert-danger">{error}</div>}
      {success && <div className="alert alert-success">{success}</div>}

      <div className="row g-3 mb-4">
        <div className="col-md-4">
          <div className="card border-0 shadow-sm">
            <div className="card-body text-center">
              <h3 className="text-warning mb-0">{profile?.rating?.toFixed(1) || '5.0'}</h3>
              <small className="text-muted">Rating</small>
            </div>
          </div>
        </div>
        <div className="col-md-4">
          <div className="card border-0 shadow-sm">
            <div className="card-body text-center">
              <h3 className="text-warning mb-0">{profile?.totalRides || 0}</h3>
              <small className="text-muted">Total Rides</small>
            </div>
          </div>
        </div>
        <div className="col-md-4">
          <div className="card border-0 shadow-sm">
            <div className="card-body text-center">
              <h3 className="text-warning mb-0">{formatCurrency(earnings?.totalEarnings || profile?.totalEarnings)}</h3>
              <small className="text-muted">Total Earnings</small>
            </div>
          </div>
        </div>
      </div>

      {activeRide && (
        <div className="mb-4">
          <h5 className="fw-bold mb-3">Active Ride</h5>
          <RideCard ride={activeRide} showActions={false} />
          <div className="d-flex gap-2 mt-2">
            {activeRide.status === 'accepted' && (
              <button className="btn btn-primary btn-sm" onClick={() => handleRideAction('start', activeRide._id)}
                disabled={!!actionLoading}>Start Ride</button>
            )}
            {activeRide.status === 'ongoing' && (
              <button className="btn btn-success btn-sm" onClick={() => handleRideAction('complete', activeRide._id)}
                disabled={!!actionLoading}>Complete Ride</button>
            )}
          </div>
        </div>
      )}

      <h5 className="fw-bold mb-3">Ride Requests</h5>
      {!profile?.isAvailable ? (
        <p className="text-muted">Go online to receive ride requests.</p>
      ) : requests.length === 0 ? (
        <p className="text-muted">No pending requests right now.</p>
      ) : (
        requests.map((ride) => (
          <div key={ride._id} className="card mb-3 border-0 shadow-sm">
            <div className="card-body">
              <RideCard ride={ride} showActions={false} />
              <div className="d-flex gap-2 mt-2">
                <button className="btn btn-success btn-sm" onClick={() => handleRideAction('accept', ride._id)}
                  disabled={!!actionLoading}>Accept</button>
                <button className="btn btn-outline-danger btn-sm" onClick={() => handleRideAction('reject', ride._id)}
                  disabled={!!actionLoading}>Reject</button>
              </div>
            </div>
          </div>
        ))
      )}

      {earnings?.rides?.length > 0 && (
        <>
          <h5 className="fw-bold mb-3 mt-4">Recent Completed Rides</h5>
          {earnings.rides.map((ride) => <RideCard key={ride._id} ride={ride} showActions={false} />)}
        </>
      )}
    </div>
  );
};

export default DriverDashboard;
