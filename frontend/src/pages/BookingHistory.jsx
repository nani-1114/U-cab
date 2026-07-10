import { useEffect, useState } from 'react';
import { getRideHistory, cancelRide } from '../services/userService';
import { getErrorMessage } from '../services/api';
import RideCard from '../components/RideCard';
import Loader from '../components/Loader';

const BookingHistory = () => {
  const [rides, setRides] = useState([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [status, setStatus] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchHistory = async () => {
    setLoading(true);
    try {
      const params = { page, limit: 10 };
      if (status) params.status = status;
      const res = await getRideHistory(params);
      setRides(res.data?.rides || []);
      setTotalPages(res.data?.totalPages || 1);
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchHistory(); }, [page, status]);

  const handleCancel = async (rideId) => {
    if (!window.confirm('Cancel this ride?')) return;
    try {
      await cancelRide(rideId);
      fetchHistory();
    } catch (err) {
      setError(getErrorMessage(err));
    }
  };

  return (
    <div>
      <h2 className="fw-bold mb-4">Booking History</h2>

      <select className="form-select w-auto mb-4" value={status}
        onChange={(e) => { setStatus(e.target.value); setPage(1); }}>
        <option value="">All Rides</option>
        <option value="requested">Requested</option>
        <option value="accepted">Accepted</option>
        <option value="ongoing">Ongoing</option>
        <option value="completed">Completed</option>
        <option value="cancelled">Cancelled</option>
      </select>

      {error && <div className="alert alert-danger">{error}</div>}

      {loading ? <Loader /> : rides.length === 0 ? (
        <p className="text-muted text-center py-5">No rides found.</p>
      ) : (
        rides.map((ride) => <RideCard key={ride._id} ride={ride} onCancel={handleCancel} />)
      )}

      {totalPages > 1 && (
        <nav className="mt-4">
          <ul className="pagination justify-content-center">
            <li className={`page-item ${page === 1 ? 'disabled' : ''}`}>
              <button className="page-link" onClick={() => setPage(page - 1)}>Previous</button>
            </li>
            <li className="page-item disabled"><span className="page-link">{page} / {totalPages}</span></li>
            <li className={`page-item ${page === totalPages ? 'disabled' : ''}`}>
              <button className="page-link" onClick={() => setPage(page + 1)}>Next</button>
            </li>
          </ul>
        </nav>
      )}
    </div>
  );
};

export default BookingHistory;
