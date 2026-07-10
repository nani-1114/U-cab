import { Navigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import Loader from './Loader';
import { DASHBOARD_PATHS } from '../utils/constants';

const RoleBasedRoute = ({ children, allowedRoles = [] }) => {
  const { user, loading } = useAuth();
  if (loading) return <Loader fullScreen />;
  if (!user) return <Navigate to="/login" replace />;
  if (!allowedRoles.includes(user.role)) {
    return <Navigate to={DASHBOARD_PATHS[user.role] || '/'} replace />;
  }
  return children;
};

export default RoleBasedRoute;
