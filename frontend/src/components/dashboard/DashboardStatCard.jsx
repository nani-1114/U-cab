import { motion } from 'framer-motion';

const DashboardStatCard = ({ icon: Icon, title, value, subtitle, accent }) => (
  <motion.div
    initial={{ opacity: 0, y: 18 }}
    animate={{ opacity: 1, y: 0 }}
    whileHover={{ y: -4, scale: 1.01 }}
    className="glass-card p-4 rounded-4 h-100"
  >
    <div className="d-flex align-items-start justify-content-between gap-3">
      <div>
        <p className="text-muted small fw-semibold mb-2">{title}</p>
        <h3 className="fw-bold mb-1 text-dark">{value}</h3>
        <p className="small text-muted mb-0">{subtitle}</p>
      </div>
      <div className="rounded-3 p-2" style={{ background: accent, color: '#fff' }}>
        {Icon && <Icon size={18} />}
      </div>
    </div>
  </motion.div>
);

export default DashboardStatCard;
