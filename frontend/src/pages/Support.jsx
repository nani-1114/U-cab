import { useEffect, useState } from 'react';
import { useAuth } from '../hooks/useAuth';
import { createTicket, getMyTickets, getAllTickets, updateTicket } from '../services/supportService';
import { getErrorMessage } from '../services/api';
import { ROLES } from '../utils/constants';
import Loader from '../components/Loader';

const Support = () => {
  const { user } = useAuth();
  const isAdmin = user?.role === ROLES.ADMIN;
  const [tickets, setTickets] = useState([]);
  const [form, setForm] = useState({ subject: '', message: '', relatedRide: '' });
  const [replyForm, setReplyForm] = useState({ adminReply: '', status: 'resolved' });
  const [selectedTicket, setSelectedTicket] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const fetchTickets = async () => {
    try {
      const res = isAdmin ? await getAllTickets({ limit: 20 }) : await getMyTickets();
      setTickets(isAdmin ? res.data?.tickets || [] : Array.isArray(res.data) ? res.data : []);
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchTickets(); }, [isAdmin]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.subject || !form.message) { setError('Subject and message are required'); return; }
    setSubmitting(true);
    try {
      await createTicket({
        subject: form.subject, message: form.message,
        relatedRide: form.relatedRide || undefined,
      });
      setSuccess('Ticket submitted successfully');
      setForm({ subject: '', message: '', relatedRide: '' });
      fetchTickets();
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <Loader />;

  return (
    <div>
      <h2 className="fw-bold mb-4">Support</h2>
      {error && <div className="alert alert-danger">{error}</div>}
      {success && <div className="alert alert-success">{success}</div>}

      {!isAdmin && (
        <div className="card border-0 shadow-sm mb-4">
          <div className="card-body p-4">
            <h5 className="fw-bold mb-3">Raise a Ticket</h5>
            <form onSubmit={handleSubmit}>
              <div className="mb-3">
                <label className="form-label">Subject</label>
                <input type="text" className="form-control" value={form.subject}
                  onChange={(e) => setForm({ ...form, subject: e.target.value })} />
              </div>
              <div className="mb-3">
                <label className="form-label">Message</label>
                <textarea className="form-control" rows="4" value={form.message}
                  onChange={(e) => setForm({ ...form, message: e.target.value })} />
              </div>
              <div className="mb-3">
                <label className="form-label">Related Ride ID (optional)</label>
                <input type="text" className="form-control" value={form.relatedRide}
                  onChange={(e) => setForm({ ...form, relatedRide: e.target.value })} />
              </div>
              <button type="submit" className="btn btn-warning" disabled={submitting}>
                {submitting ? 'Submitting...' : 'Submit Ticket'}
              </button>
            </form>
          </div>
        </div>
      )}

      <h5 className="fw-bold mb-3">{isAdmin ? 'All Tickets' : 'My Tickets'}</h5>
      {tickets.length === 0 ? (
        <p className="text-muted">No tickets found.</p>
      ) : (
        tickets.map((t) => (
          <div key={t._id} className="card border-0 shadow-sm mb-3">
            <div className="card-body">
              <div className="d-flex justify-content-between align-items-start mb-2">
                <h6 className="mb-0">{t.subject}</h6>
                <span className="badge bg-secondary text-capitalize">{t.status}</span>
              </div>
              <p className="small text-muted mb-2">{t.message}</p>
              {t.adminReply && (
                <div className="bg-light rounded p-2 small"><strong>Admin Reply:</strong> {t.adminReply}</div>
              )}
              {isAdmin && (
                <button className="btn btn-sm btn-outline-warning mt-2" onClick={() => setSelectedTicket(t._id)}>
                  Reply
                </button>
              )}
            </div>
          </div>
        ))
      )}

      {selectedTicket && (
        <div className="modal show d-block" tabIndex="-1" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
          <div className="modal-dialog">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">Reply to Ticket</h5>
                <button type="button" className="btn-close" onClick={() => setSelectedTicket(null)} />
              </div>
              <div className="modal-body">
                <div className="mb-3">
                  <label className="form-label">Reply</label>
                  <textarea className="form-control" rows="3" value={replyForm.adminReply}
                    onChange={(e) => setReplyForm({ ...replyForm, adminReply: e.target.value })} />
                </div>
                <div className="mb-3">
                  <label className="form-label">Status</label>
                  <select className="form-select" value={replyForm.status}
                    onChange={(e) => setReplyForm({ ...replyForm, status: e.target.value })}>
                    <option value="in_progress">In Progress</option>
                    <option value="resolved">Resolved</option>
                    <option value="closed">Closed</option>
                  </select>
                </div>
              </div>
              <div className="modal-footer">
                <button className="btn btn-secondary" onClick={() => setSelectedTicket(null)}>Cancel</button>
                <button className="btn btn-warning" onClick={async () => {
                  await updateTicket(selectedTicket, replyForm);
                  setSuccess('Reply sent');
                  setSelectedTicket(null);
                  fetchTickets();
                }}>Send Reply</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Support;
