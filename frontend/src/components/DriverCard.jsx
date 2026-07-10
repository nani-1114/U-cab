const DriverCard = ({ driver, onAction, actionLabel, actionVariant = 'warning', showRating = true }) => {
  if (!driver) return null;
  return (
    <div className="card driver-card h-100 shadow-sm border-0">
      <div className="card-body">
        <div className="d-flex align-items-center mb-3">
          <div className="driver-avatar bg-warning text-dark rounded-circle d-flex align-items-center justify-content-center me-3">
            {driver.name?.charAt(0)?.toUpperCase() || 'D'}
          </div>
          <div>
            <h6 className="mb-0 fw-bold">{driver.name}</h6>
            {showRating && (
              <small className="text-warning">
                <i className="bi bi-star-fill" /> {driver.rating?.toFixed(1) || '5.0'}
              </small>
            )}
          </div>
        </div>
        {driver.vehicle && (
          <p className="small text-muted mb-1">
            <i className="bi bi-car-front me-1" />
            {driver.vehicle.make} {driver.vehicle.model}
          </p>
        )}
        {driver.vehicle?.plateNumber && (
          <p className="small text-muted mb-1">
            <i className="bi bi-card-text me-1" />
            {driver.vehicle.plateNumber}
          </p>
        )}
        {driver.phone && (
          <p className="small text-muted mb-0">
            <i className="bi bi-telephone me-1" />
            {driver.phone}
          </p>
        )}
        {onAction && (
          <button
            className={`btn btn-${actionVariant} btn-sm w-100 mt-3`}
            onClick={() => onAction(driver)}
          >
            {actionLabel}
          </button>
        )}
      </div>
    </div>
  );
};

export default DriverCard;
