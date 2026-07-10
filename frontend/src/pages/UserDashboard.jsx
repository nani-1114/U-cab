import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowRight, BadgePercent, CreditCard, History, MapPinned, Navigation, Sparkles, UserRound, Wallet, Compass, Clock3, Route } from 'lucide-react';
import { getRideHistory, getLiveRide } from '../services/userService';
import { getErrorMessage } from '../services/api';
import Loader from '../components/Loader';
import DashboardStatCard from '../components/dashboard/DashboardStatCard';
import QuickActionCard from '../components/dashboard/QuickActionCard';
import RecentRideItem from '../components/dashboard/RecentRideItem';
import { formatCurrency } from '../utils/formatters';

const UserDashboard = () => {
  const [liveRide, setLiveRide] = useState(null);
  const [recentRides, setRecentRides] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [liveRes, historyRes] = await Promise.allSettled([
          getLiveRide(),
          getRideHistory({ limit: 5 }),
        ]);
        if (liveRes.status === 'fulfilled') setLiveRide(liveRes.value.data);
        if (historyRes.status === 'fulfilled') setRecentRides(historyRes.value.data?.rides || []);
      } catch (err) {
        setError(getErrorMessage(err));
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  if (loading) return <Loader fullScreen message="Preparing your premium dashboard…" />;

  const heroName = 'Aarav';
  const totalTrips = recentRides.length + (liveRide ? 1 : 0);
  const totalDistance = recentRides.reduce((sum, ride) => sum + Number(ride.distanceInKm || 0), 0);
  const totalSpending = recentRides.reduce((sum, ride) => sum + Number(ride.fare?.final || ride.fare?.estimated || 0), 0);
  const savedWithCoupons = Math.max(80, Math.round(totalSpending * 0.12));

  const quickActions = [
    { to: '/book-ride', icon: Navigation, title: 'Book Ride', subtitle: 'Request a premium ride in seconds', gradient: 'linear-gradient(135deg, #111827 0%, #3b82f6 100%)', accent: '✦' },
    { to: '/booking-history', icon: History, title: 'Ride History', subtitle: 'Review your recent journeys', gradient: 'linear-gradient(135deg, #1d4ed8 0%, #0f172a 100%)', accent: '↺' },
    { to: '/payment', icon: CreditCard, title: 'Payments', subtitle: 'Track fares and wallet activity', gradient: 'linear-gradient(135deg, #0f766e 0%, #14b8a6 100%)', accent: '$' },
    { to: '/coupons', icon: BadgePercent, title: 'Coupons', subtitle: 'Unlock savings and offers', gradient: 'linear-gradient(135deg, #7c3aed 0%, #ec4899 100%)', accent: '% ' },
    { to: '/profile', icon: UserRound, title: 'Profile', subtitle: 'Manage preferences and safety', gradient: 'linear-gradient(135deg, #b45309 0%, #f59e0b 100%)', accent: '◌' },
  ];

  return (
    <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.35 }}>
      <div className="hero-panel rounded-4 overflow-hidden position-relative p-4 p-md-5 mb-4 shadow-lg">
        <div className="position-absolute top-0 start-0 w-100 h-100" style={{ background: 'linear-gradient(90deg, rgba(2,6,23,0.9), rgba(2,6,23,0.55))' }} />
        <div className="position-relative d-flex flex-column flex-lg-row justify-content-between align-items-lg-end gap-3">
          <div className="max-w-700 text-white">
            <div className="d-flex align-items-center gap-2 mb-3 text-white-50 small fw-semibold">
              <Sparkles size={16} /> Premium mobility experience
            </div>
            <h2 className="display-6 fw-bold mb-2">Good evening, {heroName}</h2>
            <p className="mb-4 text-white-50" style={{ maxWidth: 560 }}>
              Your next ride is just a tap away. Travel smoothly with live updates, trusted drivers, and a polished travel experience.
            </p>
            <div className="d-flex flex-wrap gap-2">
              <Link to="/book-ride" className="btn btn-warning btn-lg rounded-pill px-4 fw-semibold">
                <Navigation size={18} className="me-2" /> Book Ride
              </Link>
              <Link to="/booking-history" className="btn btn-outline-light btn-lg rounded-pill px-4 fw-semibold">
                <History size={18} className="me-2" /> Recent Trips
              </Link>
            </div>
          </div>
          <div className="glass-card-dark p-3 rounded-4 text-white" style={{ minWidth: 250 }}>
            <div className="d-flex align-items-center gap-2 mb-2 text-white-50 small">
              <Compass size={16} /> Live route overview
            </div>
            <div className="fw-bold fs-4">{liveRide ? 'Ride in progress' : 'Ready to travel'}</div>
            <div className="small text-white-50 mt-1">Smart routing and an effortless pickup experience.</div>
          </div>
        </div>
      </div>

      {error && <div className="alert alert-danger rounded-4 border-0 shadow-sm">{error}</div>}

      <div className="row g-3 mb-4">
        <div className="col-12 col-lg-8">
          <div className="row g-3">
            <div className="col-12">
              {liveRide ? (
                <motion.div initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }} className="glass-card rounded-4 p-4">
                  <div className="d-flex justify-content-between align-items-start flex-wrap gap-3 mb-3">
                    <div>
                      <div className="d-flex align-items-center gap-2 text-muted small fw-semibold mb-2">
                        <MapPinned size={16} /> Active ride
                      </div>
                      <h5 className="fw-bold mb-1">{liveRide.pickupLocation?.address || 'Your current trip'}</h5>
                      <p className="text-muted mb-0">{liveRide.dropLocation?.address || 'Destination'}</p>
                    </div>
                    <span className="badge bg-success-subtle text-success rounded-pill px-3 py-2">Live</span>
                  </div>
                  <div className="row g-3 mb-3">
                    <div className="col-6 col-md-3">
                      <div className="small text-muted">ETA</div>
                      <div className="fw-semibold">{liveRide.eta || '5 min'}</div>
                    </div>
                    <div className="col-6 col-md-3">
                      <div className="small text-muted">Distance</div>
                      <div className="fw-semibold">{liveRide.distanceInKm || 0} km</div>
                    </div>
                    <div className="col-6 col-md-3">
                      <div className="small text-muted">Fare</div>
                      <div className="fw-semibold">{formatCurrency(liveRide.fare?.final || liveRide.fare?.estimated || 0)}</div>
                    </div>
                    <div className="col-6 col-md-3">
                      <div className="small text-muted">Driver</div>
                      <div className="fw-semibold">{liveRide.driver?.name || 'Assigned'}</div>
                    </div>
                  </div>
                  <div className="d-flex flex-wrap gap-2">
                    <Link to={`/rides/${liveRide._id}/track`} className="btn btn-dark rounded-pill px-4 py-2 fw-semibold">
                      <Route size={16} className="me-2" /> Track Live
                    </Link>
                    <Link to="/support" className="btn btn-outline-dark rounded-pill px-4 py-2 fw-semibold">
                      <Clock3 size={16} className="me-2" /> Support
                    </Link>
                  </div>
                </motion.div>
              ) : (
                <motion.div initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }} className="glass-card rounded-4 p-4">
                  <div className="d-flex justify-content-between align-items-center">
                    <div>
                      <div className="d-flex align-items-center gap-2 text-muted small fw-semibold mb-2">
                        <MapPinned size={16} /> No active ride
                      </div>
                      <h5 className="fw-bold mb-1">Start a new journey</h5>
                      <p className="text-muted mb-0">Book a premium ride and see live updates here.</p>
                    </div>
                    <Link to="/book-ride" className="btn btn-warning rounded-pill px-4 fw-semibold">
                      <ArrowRight size={16} className="me-2" /> Book now
                    </Link>
                  </div>
                </motion.div>
              )}
            </div>
            <div className="col-12">
              <div className="row g-3">
                <div className="col-6 col-md-3">
                  <DashboardStatCard icon={Route} title="Total Trips" value={totalTrips} subtitle="Completed + active" accent="linear-gradient(135deg, #2563eb, #38bdf8)" />
                </div>
                <div className="col-6 col-md-3">
                  <DashboardStatCard icon={Compass} title="Total Distance" value={`${totalDistance.toFixed(1)} km`} subtitle="Miles of comfort" accent="linear-gradient(135deg, #0f766e, #2dd4bf)" />
                </div>
                <div className="col-6 col-md-3">
                  <DashboardStatCard icon={Wallet} title="Total Spending" value={formatCurrency(totalSpending)} subtitle="Across all rides" accent="linear-gradient(135deg, #7c3aed, #a78bfa)" />
                </div>
                <div className="col-6 col-md-3">
                  <DashboardStatCard icon={BadgePercent} title="Saved with Coupons" value={`₹${savedWithCoupons}`} subtitle="Smart savings" accent="linear-gradient(135deg, #f59e0b, #fb923c)" />
                </div>
              </div>
            </div>
          </div>
        </div>
        <div className="col-12 col-lg-4">
          <div className="glass-card rounded-4 p-4 h-100">
            <div className="d-flex align-items-center justify-content-between mb-3">
              <h5 className="fw-bold mb-0">Quick actions</h5>
              <span className="text-muted small">Fast access</span>
            </div>
            <div className="d-grid gap-3">
              {quickActions.map((action) => (
                <QuickActionCard key={action.to} {...action} />
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className="glass-card rounded-4 p-4">
        <div className="d-flex justify-content-between align-items-center flex-wrap gap-3 mb-4">
          <div>
            <h5 className="fw-bold mb-1">Recent rides</h5>
            <p className="text-muted mb-0">A polished timeline of your latest bookings.</p>
          </div>
          <Link to="/booking-history" className="btn btn-outline-dark rounded-pill px-3">View all</Link>
        </div>
        {recentRides.length === 0 ? (
          <div className="text-center py-5 rounded-4 border border-dashed border-secondary-subtle">
            <div className="mb-3 text-muted">No rides yet</div>
            <Link to="/book-ride" className="btn btn-warning rounded-pill px-4">Book your first ride</Link>
          </div>
        ) : (
          <div className="d-grid gap-3">
            {recentRides.map((ride) => (
              <RecentRideItem key={ride._id} ride={ride} />
            ))}
          </div>
        )}
      </div>
    </motion.div>
  );
};

export default UserDashboard;
