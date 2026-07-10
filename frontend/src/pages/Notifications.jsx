import { useEffect, useState } from 'react';
import { getNotifications, markAllRead, markAsRead } from '../services/notificationService';
import { getErrorMessage } from '../services/api';
import { formatDate } from '../utils/formatters';
import Loader from '../components/Loader';

const typeIcons = { ride: 'bi-car-front', payment: 'bi-credit-card', promo: 'bi-tag', system: 'bi-info-circle' };

const Notifications = () => {
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchNotifications = async () => {
    try {
      const res = await getNotifications();
      setNotifications(res.data?.notifications || []);
      setUnreadCount(res.data?.unreadCount || 0);
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchNotifications(); }, []);

  if (loading) return <Loader />;

  return (
    <div>
      <div className="d-flex justify-content-between align-items-center mb-4 flex-wrap gap-2">
        <h2 className="fw-bold mb-0">
          Notifications
          {unreadCount > 0 && <span className="badge bg-warning text-dark ms-2">{unreadCount}</span>}
        </h2>
        {unreadCount > 0 && (
          <button className="btn btn-outline-warning btn-sm" onClick={async () => {
            await markAllRead();
            fetchNotifications();
          }}>Mark all read</button>
        )}
      </div>

      {error && <div className="alert alert-danger">{error}</div>}

      {notifications.length === 0 ? (
        <p className="text-muted text-center py-5">No notifications yet.</p>
      ) : (
        <div className="list-group">
          {notifications.map((n) => (
            <div
              key={n._id}
              className={`list-group-item list-group-item-action ${!n.isRead ? 'border-start border-warning border-3' : ''}`}
              onClick={async () => {
                if (!n.isRead) {
                  await markAsRead(n._id);
                  fetchNotifications();
                }
              }}
              role="button"
            >
              <div className="d-flex align-items-start">
                <i className={`bi ${typeIcons[n.type] || 'bi-bell'} text-warning fs-5 me-3 mt-1`} />
                <div className="flex-grow-1">
                  <div className="d-flex justify-content-between flex-wrap gap-1">
                    <h6 className="mb-1">{n.title}</h6>
                    <small className="text-muted">{formatDate(n.createdAt)}</small>
                  </div>
                  <p className="mb-0 small text-muted">{n.message}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Notifications;
