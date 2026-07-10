import { useState } from 'react';
import { PAYMENT_METHODS } from '../utils/constants';
import { formatCurrency } from '../utils/formatters';

const PaymentModal = ({ show, onClose, onPay, ride, loading = false }) => {
  const [method, setMethod] = useState('card');
  if (!show) return null;

  const amount = ride?.fare?.final || ride?.fare?.estimated || 0;

  return (
    <div className="modal show d-block" tabIndex="-1" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
      <div className="modal-dialog modal-dialog-centered">
        <div className="modal-content">
          <div className="modal-header">
            <h5 className="modal-title">Complete Payment</h5>
            <button type="button" className="btn-close" onClick={onClose} disabled={loading} />
          </div>
          <div className="modal-body">
            <div className="text-center mb-4">
              <h3 className="text-warning mb-0">{formatCurrency(amount)}</h3>
              <small className="text-muted">Total fare</small>
            </div>
            <div className="mb-3">
              <label className="form-label">Payment Method</label>
              <select
                className="form-select"
                value={method}
                onChange={(e) => setMethod(e.target.value)}
                disabled={loading}
              >
                {PAYMENT_METHODS.filter((m) => m.value !== 'cash').map((m) => (
                  <option key={m.value} value={m.value}>{m.label}</option>
                ))}
              </select>
            </div>
            <p className="small text-muted mb-0">
              Simulated payment gateway — payment processes instantly.
            </p>
          </div>
          <div className="modal-footer">
            <button type="button" className="btn btn-secondary" onClick={onClose} disabled={loading}>
              Cancel
            </button>
            <button type="button" className="btn btn-warning" onClick={() => onPay(method)} disabled={loading}>
              {loading ? 'Processing...' : 'Pay Now'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PaymentModal;
