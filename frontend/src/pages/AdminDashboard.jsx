import { useEffect, useState } from 'react';
import {
  getDashboard, getUsers, getDrivers, approveDriver,
  toggleUserBlock, toggleDriverBlock, getRides, cancelRide, getPayments,
} from '../services/adminService';
import { getErrorMessage } from '../services/api';
import { formatCurrency } from '../utils/formatters';
import Loader from '../components/Loader';

const AdminDashboard = () => {
  const [stats, setStats] = useState(null);
  const [activeTab, setActiveTab] = useState('overview');
  const [users, setUsers] = useState([]);
  const [drivers, setDrivers] = useState([]);
  const [rides, setRides] = useState([]);
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    getDashboard()
      .then((res) => setStats(res.data))
      .catch((err) => setError(getErrorMessage(err)))
      .finally(() => setLoading(false));
  }, []);

  const loadTab = async (tab) => {
    setActiveTab(tab);
    setError('');
    try {
      if (tab === 'users') {
        const res = await getUsers({ limit: 20 });
        setUsers(res.data?.users || []);
      } else if (tab === 'drivers') {
        const res = await getDrivers({ limit: 20 });
        setDrivers(res.data?.drivers || []);
      } else if (tab === 'rides') {
        const res = await getRides({ limit: 20 });
        setRides(res.data?.rides || []);
      } else if (tab === 'payments') {
        const res = await getPayments({ limit: 20 });
        setPayments(res.data?.payments || []);
      }
    } catch (err) {
      setError(getErrorMessage(err));
    }
  };

  if (loading) return <Loader />;

  return (
    <div>
      <h2 className="fw-bold mb-4">Admin Dashboard</h2>
      {error && <div className="alert alert-danger">{error}</div>}
      {success && <div className="alert alert-success">{success}</div>}

      {stats && (
        <div className="row g-3 mb-4">
          {[
            { label: 'Users', value: stats.totalUsers },
            { label: 'Drivers', value: stats.totalDrivers },
            { label: 'Total Rides', value: stats.totalRides },
            { label: 'Completed', value: stats.completedRides },
            { label: 'Cancelled', value: stats.cancelledRides },
            { label: 'Pending Approvals', value: stats.pendingDriverApprovals },
            { label: 'Revenue', value: formatCurrency(stats.totalRevenue) },
          ].map((s) => (
            <div key={s.label} className="col-6 col-md-4 col-lg-3">
              <div className="card border-0 shadow-sm">
                <div className="card-body text-center">
                  <h4 className="text-warning mb-0">{s.value}</h4>
                  <small className="text-muted">{s.label}</small>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      <ul className="nav nav-tabs mb-4 flex-nowrap overflow-auto">
        {['overview', 'users', 'drivers', 'rides', 'payments'].map((tab) => (
          <li className="nav-item" key={tab}>
            <button className={`nav-link text-capitalize ${activeTab === tab ? 'active' : ''}`}
              onClick={() => loadTab(tab)}>{tab}</button>
          </li>
        ))}
      </ul>

      {activeTab === 'users' && (
        <div className="table-responsive">
          <table className="table table-hover">
            <thead><tr><th>Name</th><th>Email</th><th>Phone</th><th>Status</th><th>Action</th></tr></thead>
            <tbody>
              {users.map((u) => (
                <tr key={u._id}>
                  <td>{u.name}</td><td>{u.email}</td><td>{u.phone}</td>
                  <td><span className={`badge bg-${u.isBlocked ? 'danger' : 'success'}`}>{u.isBlocked ? 'Blocked' : 'Active'}</span></td>
                  <td>
                    <button className="btn btn-sm btn-outline-warning" onClick={async () => {
                      await toggleUserBlock(u._id);
                      setSuccess('User block status updated');
                      loadTab('users');
                    }}>{u.isBlocked ? 'Unblock' : 'Block'}</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {activeTab === 'drivers' && (
        <div className="table-responsive">
          <table className="table table-hover">
            <thead><tr><th>Name</th><th>Email</th><th>Status</th><th>Approval</th><th>Actions</th></tr></thead>
            <tbody>
              {drivers.map((d) => (
                <tr key={d._id}>
                  <td>{d.name}</td><td>{d.email}</td>
                  <td><span className={`badge bg-${d.isBlocked ? 'danger' : 'success'}`}>{d.isBlocked ? 'Blocked' : 'Active'}</span></td>
                  <td><span className="badge bg-secondary text-capitalize">{d.approvalStatus}</span></td>
                  <td className="d-flex gap-1 flex-wrap">
                    {d.approvalStatus === 'pending' && (
                      <>
                        <button className="btn btn-sm btn-success" onClick={async () => {
                          await approveDriver(d._id, 'approved');
                          setSuccess('Driver approved');
                          loadTab('drivers');
                        }}>Approve</button>
                        <button className="btn btn-sm btn-danger" onClick={async () => {
                          await approveDriver(d._id, 'rejected');
                          setSuccess('Driver rejected');
                          loadTab('drivers');
                        }}>Reject</button>
                      </>
                    )}
                    <button className="btn btn-sm btn-outline-warning" onClick={async () => {
                      await toggleDriverBlock(d._id);
                      setSuccess('Driver block status updated');
                      loadTab('drivers');
                    }}>{d.isBlocked ? 'Unblock' : 'Block'}</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {activeTab === 'rides' && (
        <div className="table-responsive">
          <table className="table table-hover">
            <thead><tr><th>User</th><th>Driver</th><th>Status</th><th>Fare</th><th>Action</th></tr></thead>
            <tbody>
              {rides.map((r) => (
                <tr key={r._id}>
                  <td>{r.user?.name}</td>
                  <td>{r.driver?.name || '—'}</td>
                  <td><span className="badge bg-secondary text-capitalize">{r.status}</span></td>
                  <td>{formatCurrency(r.fare?.final || r.fare?.estimated)}</td>
                  <td>
                    {!['completed', 'cancelled'].includes(r.status) && (
                      <button className="btn btn-sm btn-outline-danger" onClick={async () => {
                        await cancelRide(r._id, 'Cancelled by admin');
                        setSuccess('Ride cancelled');
                        loadTab('rides');
                      }}>Cancel</button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {activeTab === 'payments' && (
        <div className="table-responsive">
          <table className="table table-hover">
            <thead><tr><th>Transaction</th><th>Amount</th><th>Method</th><th>Status</th></tr></thead>
            <tbody>
              {payments.map((p) => (
                <tr key={p._id}>
                  <td className="small">{p.transactionId}</td>
                  <td>{formatCurrency(p.amount)}</td>
                  <td className="text-capitalize">{p.method}</td>
                  <td><span className="badge bg-secondary text-capitalize">{p.status}</span></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default AdminDashboard;
