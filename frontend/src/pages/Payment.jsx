import { useEffect, useState } from 'react';
import { getPaymentHistory, getReceipt } from '../services/paymentService';
import { getErrorMessage } from '../services/api';
import { formatCurrency, formatDate } from '../utils/formatters';
import Loader from '../components/Loader';

const Payment = () => {
  const [payments, setPayments] = useState([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [receipt, setReceipt] = useState(null);

  useEffect(() => {
    const fetchPayments = async () => {
      setLoading(true);
      try {
        const res = await getPaymentHistory({ page, limit: 10 });
        setPayments(res.data?.payments || []);
        setTotalPages(res.data?.totalPages || 1);
      } catch (err) {
        setError(getErrorMessage(err));
      } finally {
        setLoading(false);
      }
    };
    fetchPayments();
  }, [page]);

  return (
    <div>
      <h2 className="fw-bold mb-4">Payment History</h2>
      {error && <div className="alert alert-danger">{error}</div>}

      {loading ? <Loader /> : payments.length === 0 ? (
        <p className="text-muted text-center py-5">No payments yet.</p>
      ) : (
        <div className="table-responsive">
          <table className="table table-hover">
            <thead>
              <tr><th>Transaction ID</th><th>Amount</th><th>Method</th><th>Status</th><th>Date</th><th></th></tr>
            </thead>
            <tbody>
              {payments.map((p) => (
                <tr key={p._id}>
                  <td className="small">{p.transactionId}</td>
                  <td>{formatCurrency(p.amount)}</td>
                  <td className="text-capitalize">{p.method}</td>
                  <td><span className="badge bg-secondary text-capitalize">{p.status}</span></td>
                  <td className="small">{formatDate(p.createdAt)}</td>
                  <td>
                    <button className="btn btn-sm btn-outline-warning" onClick={async () => {
                      try {
                        const res = await getReceipt(p._id);
                        setReceipt(res.data);
                      } catch (err) {
                        setError(getErrorMessage(err));
                      }
                    }}>Receipt</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {totalPages > 1 && (
        <nav className="mt-3">
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

      {receipt && (
        <div className="modal show d-block" tabIndex="-1" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">Payment Receipt</h5>
                <button type="button" className="btn-close" onClick={() => setReceipt(null)} />
              </div>
              <div className="modal-body">
                <p><strong>Transaction:</strong> {receipt.transactionId}</p>
                <p><strong>Amount:</strong> {formatCurrency(receipt.amount)}</p>
                <p><strong>Method:</strong> {receipt.method}</p>
                <p><strong>Status:</strong> {receipt.status}</p>
                <p><strong>Rider:</strong> {receipt.rider}</p>
                <p><strong>Driver:</strong> {receipt.driver}</p>
                <p><strong>Vehicle:</strong> {receipt.vehicle}</p>
                <p><strong>Pickup:</strong> {receipt.pickup}</p>
                <p><strong>Drop:</strong> {receipt.drop}</p>
                <p className="mb-0"><strong>Distance:</strong> {receipt.distanceInKm} km</p>
              </div>
              <div className="modal-footer">
                <button className="btn btn-secondary" onClick={() => setReceipt(null)}>Close</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Payment;
