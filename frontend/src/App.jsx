import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import MainLayout from './layouts/MainLayout';
import DashboardLayout from './layouts/DashboardLayout';
import ProtectedRoute from './components/ProtectedRoute';
import RoleBasedRoute from './components/RoleBasedRoute';
import { ROLES } from './utils/constants';

import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import UserDashboard from './pages/UserDashboard';
import DriverDashboard from './pages/DriverDashboard';
import AdminDashboard from './pages/AdminDashboard';
import BookRide from './pages/BookRide';
import RideDetails from './pages/RideDetails';
import RideTracking from './pages/RideTracking';
import BookingHistory from './pages/BookingHistory';
import Payment from './pages/Payment';
import Profile from './pages/Profile';
import Notifications from './pages/Notifications';
import Support from './pages/Support';
import Reviews from './pages/Reviews';
import Coupons from './pages/Coupons';
import NotFound from './pages/NotFound';

const App = () => (
  <AuthProvider>
    <BrowserRouter>
      <Routes>
        <Route element={<MainLayout />}>
          <Route index element={<Home />} />
          <Route path="login" element={<Login />} />
          <Route path="register" element={<Register />} />
        </Route>

        <Route element={<ProtectedRoute><DashboardLayout /></ProtectedRoute>}>
          <Route path="dashboard" element={<RoleBasedRoute allowedRoles={[ROLES.USER]}><UserDashboard /></RoleBasedRoute>} />
          <Route path="driver-dashboard" element={<RoleBasedRoute allowedRoles={[ROLES.DRIVER]}><DriverDashboard /></RoleBasedRoute>} />
          <Route path="admin-dashboard" element={<RoleBasedRoute allowedRoles={[ROLES.ADMIN]}><AdminDashboard /></RoleBasedRoute>} />
          <Route path="book-ride" element={<RoleBasedRoute allowedRoles={[ROLES.USER]}><BookRide /></RoleBasedRoute>} />
          <Route path="rides/:id" element={<RoleBasedRoute allowedRoles={[ROLES.USER, ROLES.DRIVER, ROLES.ADMIN]}><RideDetails /></RoleBasedRoute>} />
          <Route path="rides/:id/track" element={<RoleBasedRoute allowedRoles={[ROLES.USER, ROLES.DRIVER, ROLES.ADMIN]}><RideTracking /></RoleBasedRoute>} />
          <Route path="booking-history" element={<RoleBasedRoute allowedRoles={[ROLES.USER]}><BookingHistory /></RoleBasedRoute>} />
          <Route path="payment" element={<RoleBasedRoute allowedRoles={[ROLES.USER, ROLES.DRIVER]}><Payment /></RoleBasedRoute>} />
          <Route path="profile" element={<Profile />} />
          <Route path="notifications" element={<Notifications />} />
          <Route path="support" element={<RoleBasedRoute allowedRoles={[ROLES.USER, ROLES.DRIVER, ROLES.ADMIN]}><Support /></RoleBasedRoute>} />
          <Route path="reviews" element={<RoleBasedRoute allowedRoles={[ROLES.USER]}><Reviews /></RoleBasedRoute>} />
          <Route path="coupons" element={<RoleBasedRoute allowedRoles={[ROLES.USER, ROLES.ADMIN]}><Coupons /></RoleBasedRoute>} />
        </Route>

        <Route path="*" element={<NotFound />} />
      </Routes>
    </BrowserRouter>
  </AuthProvider>
);

export default App;
