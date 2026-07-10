import { useEffect, useState } from 'react';
import { useAuth } from '../hooks/useAuth';
import { getActiveCoupons, getAllCoupons, createCoupon, updateCoupon, deleteCoupon } from '../services/couponService';
import { getErrorMessage } from '../services/api';
import { ROLES } from '../utils/constants';
import { formatDate } from '../utils/formatters';
import Loader from '../components/Loader';

const Coupons = () => {
  const { user } = useAuth();
  const isAdmin = user?.role === ROLES.ADMIN;
  const [coupons, setCoupons] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({
    code: '', description: '', discountType: 'flat', discountValue: '',
    maxDiscountAmount: '', minFareRequired: 0, expiryDate: '', usageLimit: 1,
  });

  const fetchCoupons = async () => {
    setLoading(true);
    try {
      const res = isAdmin ? await getAllCoupons() : await getActiveCoupons();
      setCoupons(res.data || []);
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchCoupons(); }, [isAdmin]);

  const handleCreate = async (e) => {
    e.preventDefault();
    try {
      await createCoupon({
        ...form,
        discountValue: Number(form.discountValue),
        maxDiscountAmount: form.maxDiscountAmount ? Number(form.maxDiscountAmount) : undefined,
        minFareRequired: Number(form.minFareRequired),
        usageLimit: Number(form.usageLimit),
      });
      setSuccess('Coupon created');
      setShowForm(false);
      fetchCoupons();
    } catch (err) {
      setError(getErrorMessage(err));
    }
  };

  if (loading) return <Loader />;

  return (
    <div>
      <div className="d-flex justify-content-between align-items-center mb-4 flex-wrap gap-2">
        <h2 className="fw-bold mb-0">{isAdmin ? 'Manage Coupons' : 'Available Coupons'}</h2>
        {isAdmin && (
          <button className="btn btn-warning btn-sm" onClick={() => setShowForm(!showForm)}>
            {showForm ? 'Cancel' : 'Create Coupon'}
          </button>
        )}
      </div>

      {error && <div className="alert alert-danger">{error}</div>}
      {success && <div className="alert alert-success">{success}</div>}

      {showForm && isAdmin && (
        <div className="card border-0 shadow-sm mb-4">
          <div className="card-body p-4">
            <form onSubmit={handleCreate}>
              <div className="row g-3">
                <div className="col-md-4">
                  <label className="form-label">Code</label>
                  <input type="text" className="form-control" value={form.code} required
                    onChange={(e) => setForm({ ...form, code: e.target.value.toUpperCase() })} />
                </div>
                <div className="col-md-4">
                  <label className="form-label">Discount Type</label>
                  <select className="form-select" value={form.discountType}
                    onChange={(e) => setForm({ ...form, discountType: e.target.value })}>
                    <option value="flat">Flat (₹)</option>
                    <option value="percentage">Percentage (%)</option>
                  </select>
                </div>
                <div className="col-md-4">
                  <label className="form-label">Discount Value</label>
                  <input type="number" className="form-control" value={form.discountValue} required
                    onChange={(e) => setForm({ ...form, discountValue: e.target.value })} />
                </div>
                <div className="col-md-6">
                  <label className="form-label">Description</label>
                  <input type="text" className="form-control" value={form.description}
                    onChange={(e) => setForm({ ...form, description: e.target.value })} />
                </div>
                <div className="col-md-3">
                  <label className="form-label">Min Fare (₹)</label>
                  <input type="number" className="form-control" value={form.minFareRequired}
                    onChange={(e) => setForm({ ...form, minFareRequired: e.target.value })} />
                </div>
                <div className="col-md-3">
                  <label className="form-label">Expiry Date</label>
                  <input type="date" className="form-control" value={form.expiryDate} required
                    onChange={(e) => setForm({ ...form, expiryDate: e.target.value })} />
                </div>
              </div>
              <button type="submit" className="btn btn-warning mt-3">Create Coupon</button>
            </form>
          </div>
        </div>
      )}

      {coupons.length === 0 ? (
        <p className="text-muted text-center py-5">No coupons available.</p>
      ) : (
        <div className="row g-3">
          {coupons.map((c) => (
            <div key={c._id} className="col-md-6 col-lg-4">
              <div className="card coupon-card border-0 shadow-sm h-100">
                <div className="card-body">
                  <div className="d-flex justify-content-between align-items-start mb-2">
                    <span className="badge bg-warning text-dark fs-6">{c.code}</span>
                    {isAdmin && (
                      <span className={`badge bg-${c.isActive ? 'success' : 'secondary'}`}>
                        {c.isActive ? 'Active' : 'Inactive'}
                      </span>
                    )}
                  </div>
                  <p className="small text-muted mb-2">{c.description}</p>
                  <h5 className="text-warning mb-1">
                    {c.discountType === 'flat' ? `₹${c.discountValue} OFF` : `${c.discountValue}% OFF`}
                  </h5>
                  <small className="text-muted d-block">Min fare: ₹{c.minFareRequired}</small>
                  <small className="text-muted">Expires: {formatDate(c.expiryDate)}</small>
                  {isAdmin && (
                    <div className="d-flex gap-2 mt-3">
                      <button className="btn btn-sm btn-outline-warning" onClick={async () => {
                        await updateCoupon(c._id, { isActive: !c.isActive });
                        fetchCoupons();
                      }}>{c.isActive ? 'Deactivate' : 'Activate'}</button>
                      <button className="btn btn-sm btn-outline-danger" onClick={async () => {
                        if (window.confirm('Delete this coupon?')) {
                          await deleteCoupon(c._id);
                          setSuccess('Coupon deleted');
                          fetchCoupons();
                        }
                      }}>Delete</button>
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Coupons;
