import { useState, useEffect } from 'react';
import { VEHICLE_TYPES, PAYMENT_METHODS } from '../utils/constants';
import { formatCurrency } from '../utils/formatters';

const BookingForm = ({ pickup, drop, distance, duration, onEstimate, onBook, loading = false }) => {
  const [form, setForm] = useState({
    vehicleType: 'mini',
    paymentMethod: 'cash',
    couponCode: '',
    donationAmount: 0,
  });
  const [error, setError] = useState('');
  const [estimatedFare, setEstimatedFare] = useState(null);
  const [estimating, setEstimating] = useState(false);

  // Auto estimate fare when distance or vehicle type changes
  useEffect(() => {
    if (pickup && drop && distance) {
      handleEstimate();
    }
  }, [distance, form.vehicleType]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    setError('');
  };

  const handleEstimate = async () => {
    if (!pickup || !drop) {
      setError('Please select both pickup and drop locations on the map.');
      return;
    }
    if (!distance) {
      return; // Wait for distance calculation
    }
    setEstimating(true);
    setError('');
    try {
      const fare = await onEstimate({
        distanceInKm: Number(distance),
        estimatedDurationInMin: Number(duration),
        vehicleType: form.vehicleType,
      });
      setEstimatedFare(fare);
    } catch (err) {
      console.error(err);
      setError('Failed to estimate fare');
    } finally {
      setEstimating(false);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!pickup || !drop) {
      setError('Please select both pickup and drop locations.');
      return;
    }
    if (!distance) {
      setError('Route calculation pending.');
      return;
    }

    onBook({
      pickupLocation: pickup,
      dropLocation: drop,
      distanceInKm: Number(distance),
      estimatedDurationInMin: Number(duration),
      vehicleType: form.vehicleType,
      paymentMethod: form.paymentMethod,
      couponCode: form.couponCode || undefined,
      donationAmount: Number(form.donationAmount) || 0,
    });
  };

  return (
    <form onSubmit={handleSubmit} className="booking-form d-flex flex-column h-100">
      {error && <div className="alert alert-danger p-2 fs-7 mb-3 border-0 shadow-sm">{error}</div>}

      <div className="mb-3">
        <label className="form-label text-muted small fw-bold text-uppercase mb-1">Vehicle Type</label>
        <select name="vehicleType" className="form-select form-select-lg shadow-sm border-0 bg-light" value={form.vehicleType} onChange={handleChange}>
          {VEHICLE_TYPES.map((v) => (
            <option key={v.value} value={v.value}>{v.icon} {v.label}</option>
          ))}
        </select>
      </div>

      <div className="mb-3">
        <label className="form-label text-muted small fw-bold text-uppercase mb-1">Payment Method</label>
        <select name="paymentMethod" className="form-select shadow-sm border-0 bg-light" value={form.paymentMethod} onChange={handleChange}>
          {PAYMENT_METHODS.map((m) => (
            <option key={m.value} value={m.value}>{m.label}</option>
          ))}
        </select>
      </div>

      <div className="row g-2 mb-4">
        <div className="col-6">
          <label className="form-label text-muted small fw-bold text-uppercase mb-1">Coupon Code</label>
          <input
            type="text"
            name="couponCode"
            className="form-control shadow-sm border-0 bg-light"
            value={form.couponCode}
            onChange={handleChange}
            placeholder="Optional"
          />
        </div>
        <div className="col-6">
          <label className="form-label text-muted small fw-bold text-uppercase mb-1">Donation (₹)</label>
          <input
            type="number"
            name="donationAmount"
            min="0"
            className="form-control shadow-sm border-0 bg-light"
            value={form.donationAmount}
            onChange={handleChange}
          />
        </div>
      </div>

      <div className="mt-auto">
        {estimatedFare !== null && (
          <div className="alert alert-success d-flex justify-content-between align-items-center mb-3 shadow-sm border-0 rounded-3">
            <span className="fw-semibold">Estimated Fare</span>
            <strong className="fs-4">{formatCurrency(estimatedFare)}</strong>
          </div>
        )}

        <button type="submit" className="btn btn-dark w-100 shadow-sm py-3 fw-bold text-white fs-5 rounded-3" disabled={loading || estimating}>
          {loading ? 'Confirming Booking...' : estimating ? 'Calculating Fare...' : 'Confirm Ride'}
        </button>
      </div>
    </form>
  );
};

export default BookingForm;
