import { Outlet } from 'react-router-dom';
import Navbar from '../components/Navbar';
import Sidebar from '../components/Sidebar';
import Footer from '../components/Footer';

const DashboardLayout = () => (
  <div className="d-flex flex-column min-vh-100 dashboard-shell">
    <Navbar />
    <div className="dashboard-wrapper flex-grow-1">
      <Sidebar />
      <main className="dashboard-content p-3 p-md-4"><Outlet /></main>
    </div>
    <Footer />
  </div>
);

export default DashboardLayout;
