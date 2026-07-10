import { Link } from 'react-router-dom';
import { formatCurrency } from '../utils/formatters';
import { capitalize } from '../utils/formatters';

const statusColors = {
  requested: 'warning',
  accepted: 'info',
  ongoing: 'primary',
  completed: 'success',
  cancelled: 'danger',
  rejected: 'secondary',
};

const RideCard = ({ ride, showActions = true, onCancel }) => {
  if (!ride) return null;
  const fare = ride.fare?.final || ride.fare?.estimated || 0;
  const statusColor = statusColors[ride.status] || 'secondary';

  return (
    <div className="card ride-card shadow-sm border-0 mb-3">
      <div className="card-body">
        <div className="d-flex justify-content-between align-items-start mb-2">
          <span className={`badge bg-${statusColor}`}>{capitalize(ride.status)}</span>
          <strong className="text-warning">{formatCurrency(fare)}</strong>
        </div>
        <div className="mb-2">
          <p className="small mb-1">
            <i className="bi bi-geo-alt-fill text-success me-1" />
            {ride.pickupLocation?.address}
          </p>
          <p className="small mb-0">
            <i className="bi bi-geo-alt-fill text-danger me-1" />
            {ride.dropLocation?.address}
          </p>
        </div>
        <div className="d-flex justify-content-between align-items-center flex-wrap gap-2">
          <small className="text-muted">
            {ride.distanceInKm} km · {ride.vehicleType}
          </small>
          {showActions && (
            <div className="d-flex gap-2">
              <Link to={`/rides/${ride._id}`} className="btn btn-outline-dark btn-sm">Details</Link>
              {['requested', 'accepted'].includes(ride.status) && onCancel && (
                <button className="btn btn-outline-danger btn-sm" onClick={() => onCancel(ride._id)}>
                  Cancel
                </button>
              )}
              {['requested', 'accepted', 'ongoing'].includes(ride.status) && (
                <Link to={`/rides/${ride._id}/track`} className="btn btn-warning btn-sm">Track</Link>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default RideCard;
