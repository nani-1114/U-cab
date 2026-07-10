import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { formatCurrency, formatDateTime, capitalize } from '../../utils/formatters';

const statusTone = {
  requested: 'warning',
  accepted: 'info',
  ongoing: 'primary',
  completed: 'success',
  cancelled: 'danger',
  rejected: 'secondary',
};

const RecentRideItem = ({ ride }) => {
  const fare = ride.fare?.final || ride.fare?.estimated || 0;
  const tone = statusTone[ride.status] || 'secondary';

  return (
    <motion.div
      initial={{ opacity: 0, x: 12 }}
      animate={{ opacity: 1, x: 0 }}
      whileHover={{ y: -2, scale: 1.005 }}
      className="glass-card rounded-4 p-4"
    >
      <div className="d-flex justify-content-between gap-3 align-items-start flex-wrap">
        <div>
          <div className="d-flex align-items-center gap-2 mb-2">
            <span className={`badge bg-${tone} rounded-pill px-3 py-2`}>{capitalize(ride.status)}</span>
            <span className="text-muted small">{formatDateTime(ride.createdAt || ride.updatedAt)}</span>
          </div>
          <p className="mb-1 fw-semibold text-dark">{ride.pickupLocation?.address || 'Pickup location'}</p>
          <p className="mb-0 small text-muted">{ride.dropLocation?.address || 'Drop location'}</p>
        </div>
        <div className="text-end">
          <div className="fw-bold text-dark">{formatCurrency(fare)}</div>
          <div className="small text-muted">{ride.distanceInKm || 0} km • {ride.vehicleType || 'Ride'}</div>
        </div>
      </div>
      <div className="d-flex justify-content-between align-items-center mt-3">
        <div className="small text-muted">Live updates ready</div>
        <Link to={`/rides/${ride._id}/track`} className="btn btn-dark btn-sm rounded-pill">Track</Link>
      </div>
    </motion.div>
  );
};

export default RecentRideItem;
