import { motion } from 'framer-motion';
import { BadgeCheck, CarFront, Phone, MessageCircle, Star, UserRound, Route } from 'lucide-react';

const DriverProfileCard = ({ driver, statusLabel, onCall, onMessage }) => {
  if (!driver) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      className="rounded-4 p-3 border border-light shadow-sm"
      style={{ background: 'linear-gradient(135deg, rgba(255,255,255,0.96), rgba(248,250,252,0.95))' }}
    >
      <div className="d-flex align-items-center justify-content-between gap-3">
        <div className="d-flex align-items-center gap-3">
          <div className="rounded-circle d-flex align-items-center justify-content-center text-white fw-bold" style={{ width: 56, height: 56, background: 'linear-gradient(135deg, #111827, #4f46e5)' }}>
            {driver.name?.charAt(0) || <UserRound size={22} />}
          </div>
          <div>
            <div className="d-flex align-items-center gap-2">
              <h6 className="mb-0 fw-bold text-dark">{driver.name}</h6>
              <BadgeCheck size={16} className="text-primary" />
            </div>
            <div className="d-flex align-items-center gap-2 text-muted small mt-1">
              <span className="d-inline-flex align-items-center gap-1 rounded-pill px-2 py-1 bg-warning-subtle text-warning-emphasis">
                <Star size={12} fill="currentColor" /> {driver.rating || '4.9'}
              </span>
              <span>{driver.tripsCompleted || 148} trips</span>
            </div>
            <div className="small text-muted mt-1">{statusLabel}</div>
          </div>
        </div>
        <div className="text-end">
          <div className="fw-semibold text-dark">{driver.vehicle?.make || 'Toyota'} {driver.vehicle?.model || 'Camry'}</div>
          <div className="small text-muted">{driver.vehicle?.plateNumber || 'KA 01 AB 1234'}</div>
        </div>
      </div>

      <div className="d-flex flex-wrap gap-2 mt-3">
        <div className="d-flex align-items-center gap-2 rounded-pill px-3 py-2 bg-light text-dark small">
          <CarFront size={15} /> {driver.vehicle?.make || 'Toyota'} • {driver.vehicle?.model || 'Camry'}
        </div>
        <div className="d-flex align-items-center gap-2 rounded-pill px-3 py-2 bg-light text-dark small">
          <Route size={15} /> {driver.travelStyle || 'Fastest route'}
        </div>
      </div>

      <div className="d-flex gap-2 mt-3">
        <button onClick={onCall} className="btn btn-dark flex-grow-1 rounded-3 py-2 fw-semibold">
          <Phone size={16} className="me-2" /> Call
        </button>
        <button onClick={onMessage} className="btn btn-outline-dark flex-grow-1 rounded-3 py-2 fw-semibold">
          <MessageCircle size={16} className="me-2" /> Message
        </button>
      </div>
    </motion.div>
  );
};

export default DriverProfileCard;
