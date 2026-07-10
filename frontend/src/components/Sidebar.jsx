import { NavLink } from 'react-router-dom';
import { Bell, CreditCard, Headphones, LayoutGrid, MapPin, MessageCircle, ShieldCheck, Sparkles, Star, UserRound, Wallet } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import { ROLES } from '../utils/constants';

const userLinks = [
  { to: '/dashboard', icon: LayoutGrid, label: 'Dashboard' },
  { to: '/book-ride', icon: MapPin, label: 'Book Ride' },
  { to: '/booking-history', icon: Sparkles, label: 'History' },
  { to: '/payment', icon: Wallet, label: 'Payments' },
  { to: '/coupons', icon: ShieldCheck, label: 'Coupons' },
  { to: '/reviews', icon: Star, label: 'Reviews' },
  { to: '/notifications', icon: Bell, label: 'Notifications' },
  { to: '/profile', icon: UserRound, label: 'Profile' },
  { to: '/support', icon: Headphones, label: 'Support' },
];

const driverLinks = [
  { to: '/driver-dashboard', icon: LayoutGrid, label: 'Dashboard' },
  { to: '/notifications', icon: Bell, label: 'Notifications' },
  { to: '/profile', icon: UserRound, label: 'Profile' },
  { to: '/support', icon: Headphones, label: 'Support' },
];

const adminLinks = [
  { to: '/admin-dashboard', icon: LayoutGrid, label: 'Dashboard' },
  { to: '/coupons', icon: ShieldCheck, label: 'Coupons' },
  { to: '/support', icon: Headphones, label: 'Support' },
  { to: '/notifications', icon: Bell, label: 'Notifications' },
  { to: '/profile', icon: UserRound, label: 'Profile' },
];

const Sidebar = () => {
  const { user } = useAuth();
  const links = user?.role === ROLES.ADMIN ? adminLinks : user?.role === ROLES.DRIVER ? driverLinks : userLinks;

  return (
    <aside className="sidebar glass-card rounded-4 m-3 p-2">
      <div className="px-3 py-3">
        <div className="small text-uppercase fw-semibold text-muted">Workspace</div>
        <div className="fw-bold text-dark">UCab Platform</div>
      </div>
      <nav className="nav flex-column gap-1 px-2 pb-2">
        {links.map((link) => (
          <NavLink
            key={link.to}
            to={link.to}
            className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}
          >
            <link.icon size={18} />
            <span>{link.label}</span>
          </NavLink>
        ))}
      </nav>
    </aside>
  );
};

export default Sidebar;
