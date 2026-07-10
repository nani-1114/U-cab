import { useEffect, useState } from 'react';
import { useAuth } from '../hooks/useAuth';
import { getProfile, updateProfile } from '../services/userService';
import { getDriverProfile, updateDriverProfile } from '../services/driverService';
import { getErrorMessage } from '../services/api';
import { ROLES } from '../utils/constants';
import Loader from '../components/Loader';

const Profile = () => {
  const { user, refreshProfile } = useAuth();
  const [form, setForm] = useState({ name: '', address: '', profilePicture: '' });
  const [driverForm, setDriverForm] = useState({
    name: '', vehicleMake: '', vehicleModel: '', plateNumber: '', vehicleType: 'mini',
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        if (user?.role === ROLES.DRIVER) {
          const res = await getDriverProfile();
          const d = res.data;
          setDriverForm({
            name: d.name || '', vehicleMake: d.vehicle?.make || '',
            vehicleModel: d.vehicle?.model || '', plateNumber: d.vehicle?.plateNumber || '',
            vehicleType: d.vehicle?.vehicleType || 'mini',
          });
        } else if (user?.role === ROLES.USER) {
          const res = await getProfile();
          const u = res.data;
          setForm({ name: u.name || '', address: u.address || '', profilePicture: u.profilePicture || '' });
        }
      } catch (err) {
        setError(getErrorMessage(err));
      } finally {
        setLoading(false);
      }
    };
    fetchProfile();
  }, [user?.role]);

  const handleUserSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError('');
    try {
      await updateProfile(form);
      await refreshProfile();
      setSuccess('Profile updated successfully');
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setSaving(false);
    }
  };

  const handleDriverSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError('');
    try {
      await updateDriverProfile({
        name: driverForm.name,
        vehicle: {
          make: driverForm.vehicleMake, model: driverForm.vehicleModel,
          plateNumber: driverForm.plateNumber, vehicleType: driverForm.vehicleType,
        },
      });
      await refreshProfile();
      setSuccess('Profile updated successfully');
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <Loader />;

  return (
    <div>
      <h2 className="fw-bold mb-4">My Profile</h2>
      {error && <div className="alert alert-danger">{error}</div>}
      {success && <div className="alert alert-success">{success}</div>}

      <div className="card border-0 shadow-sm">
        <div className="card-body p-4">
          <div className="d-flex align-items-center mb-4">
            <div className="profile-avatar bg-warning text-dark rounded-circle d-flex align-items-center justify-content-center me-3">
              {user?.name?.charAt(0)?.toUpperCase()}
            </div>
            <div>
              <h5 className="mb-0">{user?.name}</h5>
              <small className="text-muted text-capitalize">{user?.role} · {user?.email}</small>
            </div>
          </div>

          {user?.role === ROLES.ADMIN ? (
            <p className="text-muted mb-0">Admin profile is view-only.</p>
          ) : user?.role === ROLES.DRIVER ? (
            <form onSubmit={handleDriverSubmit}>
              <div className="row g-3">
                <div className="col-md-6">
                  <label className="form-label">Name</label>
                  <input type="text" className="form-control" value={driverForm.name}
                    onChange={(e) => setDriverForm({ ...driverForm, name: e.target.value })} />
                </div>
                <div className="col-md-6">
                  <label className="form-label">Vehicle Make</label>
                  <input type="text" className="form-control" value={driverForm.vehicleMake}
                    onChange={(e) => setDriverForm({ ...driverForm, vehicleMake: e.target.value })} />
                </div>
                <div className="col-md-6">
                  <label className="form-label">Vehicle Model</label>
                  <input type="text" className="form-control" value={driverForm.vehicleModel}
                    onChange={(e) => setDriverForm({ ...driverForm, vehicleModel: e.target.value })} />
                </div>
                <div className="col-md-6">
                  <label className="form-label">Plate Number</label>
                  <input type="text" className="form-control" value={driverForm.plateNumber}
                    onChange={(e) => setDriverForm({ ...driverForm, plateNumber: e.target.value })} />
                </div>
              </div>
              <button type="submit" className="btn btn-warning mt-4" disabled={saving}>
                {saving ? 'Saving...' : 'Save Changes'}
              </button>
            </form>
          ) : (
            <form onSubmit={handleUserSubmit}>
              <div className="row g-3">
                <div className="col-md-6">
                  <label className="form-label">Name</label>
                  <input type="text" className="form-control" value={form.name}
                    onChange={(e) => setForm({ ...form, name: e.target.value })} />
                </div>
                <div className="col-md-6">
                  <label className="form-label">Address</label>
                  <input type="text" className="form-control" value={form.address}
                    onChange={(e) => setForm({ ...form, address: e.target.value })} />
                </div>
                <div className="col-12">
                  <label className="form-label">Profile Picture URL</label>
                  <input type="text" className="form-control" value={form.profilePicture}
                    onChange={(e) => setForm({ ...form, profilePicture: e.target.value })} />
                </div>
              </div>
              <button type="submit" className="btn btn-warning mt-4" disabled={saving}>
                {saving ? 'Saving...' : 'Save Changes'}
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};

export default Profile;
