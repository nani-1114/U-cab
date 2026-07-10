import { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';
import { submitReview, getDriverReviews } from '../services/reviewService';
import { getRideHistory } from '../services/userService';
import { getErrorMessage } from '../services/api';
import Loader from '../components/Loader';

const Reviews = () => {
  const location = useLocation();
  const [form, setForm] = useState({
    rideId: location.state?.rideId || '',
    rating: 5,
    comment: '',
  });
  const [driverId, setDriverId] = useState(location.state?.driverId || '');
  const [reviews, setReviews] = useState([]);
  const [completedRides, setCompletedRides] = useState([]);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    getRideHistory({ status: 'completed', limit: 10 })
      .then((res) => setCompletedRides(res.data?.rides || []))
      .catch(() => {});
  }, []);

  const fetchReviews = async () => {
    if (!driverId) return;
    setLoading(true);
    try {
      const res = await getDriverReviews(driverId);
      setReviews(res.data || []);
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchReviews(); }, [driverId]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.rideId) { setError('Ride ID is required'); return; }
    setSubmitting(true);
    setError('');
    try {
      await submitReview({ rideId: form.rideId, rating: Number(form.rating), comment: form.comment });
      setSuccess('Review submitted successfully!');
      setForm({ rideId: '', rating: 5, comment: '' });
      if (driverId) fetchReviews();
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div>
      <h2 className="fw-bold mb-4">Reviews</h2>
      {error && <div className="alert alert-danger">{error}</div>}
      {success && <div className="alert alert-success">{success}</div>}

      <div className="card border-0 shadow-sm mb-4">
        <div className="card-body p-4">
          <h5 className="fw-bold mb-3">Submit a Review</h5>
          <form onSubmit={handleSubmit}>
            <div className="row g-3">
              <div className="col-md-6">
                <label className="form-label">Select Completed Ride</label>
                <select className="form-select" value={form.rideId}
                  onChange={(e) => {
                    const ride = completedRides.find((r) => r._id === e.target.value);
                    setForm({ ...form, rideId: e.target.value });
                    if (ride?.driver?._id) setDriverId(ride.driver._id);
                  }}>
                  <option value="">Choose a ride...</option>
                  {completedRides.map((r) => (
                    <option key={r._id} value={r._id}>
                      {r.pickupLocation?.address?.slice(0, 30)} → {r.dropLocation?.address?.slice(0, 30)}
                    </option>
                  ))}
                </select>
              </div>
              <div className="col-md-6">
                <label className="form-label">Rating</label>
                <select className="form-select" value={form.rating}
                  onChange={(e) => setForm({ ...form, rating: e.target.value })}>
                  {[5, 4, 3, 2, 1].map((r) => <option key={r} value={r}>{'⭐'.repeat(r)} ({r})</option>)}
                </select>
              </div>
              <div className="col-12">
                <label className="form-label">Comment</label>
                <textarea className="form-control" rows="3" value={form.comment}
                  onChange={(e) => setForm({ ...form, comment: e.target.value })}
                  placeholder="Share your experience..." />
              </div>
            </div>
            <button type="submit" className="btn btn-warning mt-3" disabled={submitting}>
              {submitting ? 'Submitting...' : 'Submit Review'}
            </button>
          </form>
        </div>
      </div>

      <div className="mb-3">
        <label className="form-label">View Driver Reviews</label>
        <div className="input-group">
          <input type="text" className="form-control" value={driverId}
            onChange={(e) => setDriverId(e.target.value)} placeholder="Driver ID" />
          <button className="btn btn-outline-warning" onClick={fetchReviews}>Load</button>
        </div>
      </div>

      {loading ? <Loader /> : reviews.length > 0 ? (
        reviews.map((r) => (
          <div key={r._id} className="card border-0 shadow-sm mb-2">
            <div className="card-body py-3">
              <div className="d-flex justify-content-between">
                <strong>{r.user?.name || 'User'}</strong>
                <span className="text-warning">{'⭐'.repeat(r.rating)}</span>
              </div>
              {r.comment && <p className="small text-muted mb-0 mt-1">{r.comment}</p>}
            </div>
          </div>
        ))
      ) : driverId ? (
        <p className="text-muted">No reviews found for this driver.</p>
      ) : null}
    </div>
  );
};

export default Reviews;
