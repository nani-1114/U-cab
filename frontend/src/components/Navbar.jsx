import { Link, NavLink, useNavigate } from 'react-router-dom';
import { Bell, MoonStar, Search, UserCircle2 } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import { ROLES, DASHBOARD_PATHS } from '../utils/constants';

const Navbar = () => {
  const { user, isAuthenticated, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <nav className="top-navbar sticky-top shadow-sm">
      <div className="container-fluid px-3 px-md-4 py-3">
        <div className="d-flex align-items-center justify-content-between gap-3">
          <Link className="navbar-brand fw-bold text-white d-flex align-items-center gap-2 text-decoration-none" to="/">
            <div className="rounded-circle d-flex align-items-center justify-content-center" style={{ width: 38, height: 38, background: 'linear-gradient(135deg, #f59e0b, #fb923c)' }}>
              <span style={{ fontSize: 18 }}>🚕</span>
            </div>
            <span>UCab</span>
          </Link>

          <div className="d-flex align-items-center gap-2 flex-grow-1 justify-content-end">
            <div className="d-none d-lg-flex align-items-center rounded-pill px-3 py-2 top-nav-search">
              <Search size={16} className="me-2" />
              <input type="text" className="border-0 bg-transparent outline-none" placeholder="Search rides, support..." />
            </div>

            {isAuthenticated ? (
              <>
                <NavLink to="/notifications" className="top-nav-icon position-relative">
                  <Bell size={18} />
                  <span className="position-absolute top-0 start-100 translate-middle badge rounded-pill bg-danger">3</span>
                </NavLink>
                <button className="top-nav-icon" type="button">
                  <MoonStar size={18} />
                </button>
                <NavLink to="/profile" className="d-flex align-items-center gap-2 text-decoration-none text-white fw-semibold top-nav-profile">
                  <div className="rounded-circle d-flex align-items-center justify-content-center" style={{ width: 38, height: 38, background: 'rgba(255,255,255,0.14)' }}>
                    <UserCircle2 size={20} />
                  </div>
                  <span className="d-none d-md-inline">{user?.name || 'Profile'}</span>
                </NavLink>
                <button className="btn btn-outline-light btn-sm rounded-pill px-3" onClick={handleLogout}>Logout</button>
              </>
            ) : (
              <>
                <NavLink className="nav-link text-white-50 fw-semibold" to="/login">Login</NavLink>
                <Link className="btn btn-warning btn-sm rounded-pill px-3 fw-semibold" to="/register">Register</Link>
              </>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
