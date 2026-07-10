import { motion } from 'framer-motion';

const MetricCard = ({ icon: Icon, label, value, sublabel }) => (
  <motion.div
    initial={{ opacity: 0, y: 12 }}
    animate={{ opacity: 1, y: 0 }}
    className="glass-card p-3 rounded-4"
    style={{ minWidth: 110, flex: 1 }}
  >
    <div className="d-flex align-items-center gap-2 text-muted mb-2">
      {Icon && <Icon size={16} />}
      <span className="small fw-semibold">{label}</span>
    </div>
    <div className="fw-bold fs-5 text-dark">{value}</div>
    {sublabel && <div className="small text-muted">{sublabel}</div>}
  </motion.div>
);

export default MetricCard;
