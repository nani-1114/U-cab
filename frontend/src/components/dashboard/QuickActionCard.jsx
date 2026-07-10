import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';

const QuickActionCard = ({ to, icon: Icon, title, subtitle, gradient, accent }) => (
  <motion.div whileHover={{ y: -6, scale: 1.02 }} transition={{ type: 'spring', stiffness: 220, damping: 18 }}>
    <Link to={to} className="text-decoration-none d-block h-100">
      <div className="rounded-4 p-4 h-100 text-white shadow-lg position-relative overflow-hidden" style={{ background: gradient }}>
        <div className="position-absolute top-0 end-0 opacity-25" style={{ fontSize: '84px', transform: 'translate(10px, -10px)' }}>{accent}</div>
        <div className="position-relative">
          <div className="rounded-circle d-inline-flex align-items-center justify-content-center p-2 mb-3" style={{ background: 'rgba(255,255,255,0.18)', backdropFilter: 'blur(8px)' }}>
            <Icon size={20} />
          </div>
          <h6 className="fw-semibold mb-1">{title}</h6>
          <p className="small mb-0 opacity-85">{subtitle}</p>
        </div>
      </div>
    </Link>
  </motion.div>
);

export default QuickActionCard;
