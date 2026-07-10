import { motion } from 'framer-motion';
import { CheckCircle2, Clock3, Sparkles, AlertTriangle } from 'lucide-react';

const toneConfig = {
  success: {
    bg: 'rgba(34, 197, 94, 0.16)',
    text: '#166534',
    icon: CheckCircle2,
  },
  info: {
    bg: 'rgba(59, 130, 246, 0.16)',
    text: '#1d4ed8',
    icon: Sparkles,
  },
  warning: {
    bg: 'rgba(245, 158, 11, 0.16)',
    text: '#b45309',
    icon: Clock3,
  },
  danger: {
    bg: 'rgba(239, 68, 68, 0.16)',
    text: '#b91c1c',
    icon: AlertTriangle,
  },
};

const StatusBadge = ({ label, tone = 'info' }) => {
  const config = toneConfig[tone] || toneConfig.info;
  const Icon = config.icon;

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      className="d-inline-flex align-items-center gap-2 rounded-pill px-3 py-2 fw-semibold"
      style={{ background: config.bg, color: config.text, boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.3)' }}
    >
      <Icon size={16} />
      <span>{label}</span>
    </motion.div>
  );
};

export default StatusBadge;
