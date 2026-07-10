import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { registerUser, registerDriver } from '../services/authService';
import { validateRegister, validateDriverRegister } from '../utils/validators';
import { getErrorMessage } from '../services/api';
import { VEHICLE_TYPES } from '../utils/constants';

const Register = () => {
  const [accountType, setAccountType] = useState('user');
  const [form, setForm] = useState({
    name: '', email: '', phone: '', password: '',
    licenseNumber: '', vehicleMake: '', vehicleModel: '', plateNumber: '', vehicleType: 'mini',
  });
  const [errors, setErrors] = useState({});
  const [apiError, setApiError] = useState('');
  const [loading, setLoading] = useState(false);
  const { register } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    setErrors({ ...errors, [e.target.name]: '' });
    setApiError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const validationErrors = accountType === 'driver'
      ? validateDriverRegister(form)
      : validateRegister(form);
    if (Object.keys(validationErrors).length) {
      setErrors(validationErrors);
      return;
    }
    setLoading(true);
    try {
      if (accountType === 'driver') {
        const formData = new FormData();
        formData.append('name', form.name);
        formData.append('email', form.email);
        formData.append('phone', form.phone);
        formData.append('password', form.password);
        formData.append('licenseNumber', form.licenseNumber);
        formData.append('vehicle', JSON.stringify({
          make: form.vehicleMake,
          model: form.vehicleModel,
          plateNumber: form.plateNumber,
          vehicleType: form.vehicleType,
        }));
        const response = await registerDriver(formData);
        register(response.data);
        navigate('/driver-dashboard');
      } else {
        const response = await registerUser({
          name: form.name, email: form.email, phone: form.phone, password: form.password,
        });
        register(response.data);
        navigate('/dashboard');
      }
    } catch (err) {
      setApiError(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container py-5">
      <div className="row justify-content-center">
        <div className="col-lg-7">
          <div className="card shadow border-0">
            <div className="card-body p-4 p-md-5">
              <h2 className="text-center fw-bold mb-1">Create Account</h2>
              <p className="text-center text-muted mb-4">Join Ucab as a rider or driver</p>

              <ul className="nav nav-pills nav-fill mb-4">
                <li className="nav-item">
                  <button type="button" className={`nav-link ${accountType === 'user' ? 'active' : ''}`}
                    onClick={() => setAccountType('user')}>Rider</button>
                </li>
                <li className="nav-item">
                  <button type="button" className={`nav-link ${accountType === 'driver' ? 'active' : ''}`}
                    onClick={() => setAccountType('driver')}>Driver</button>
                </li>
              </ul>

              {apiError && <div className="alert alert-danger">{apiError}</div>}

              <form onSubmit={handleSubmit}>
                <div className="row g-3">
                  <div className="col-md-6">
                    <label className="form-label">Full Name</label>
                    <input type="text" name="name" className={`form-control ${errors.name ? 'is-invalid' : ''}`}
                      value={form.name} onChange={handleChange} />
                    {errors.name && <div className="invalid-feedback">{errors.name}</div>}
                  </div>
                  <div className="col-md-6">
                    <label className="form-label">Phone</label>
                    <input type="tel" name="phone" className={`form-control ${errors.phone ? 'is-invalid' : ''}`}
                      value={form.phone} onChange={handleChange} placeholder="10 digit number" />
                    {errors.phone && <div className="invalid-feedback">{errors.phone}</div>}
                  </div>
                  <div className="col-md-6">
                    <label className="form-label">Email</label>
                    <input type="email" name="email" className={`form-control ${errors.email ? 'is-invalid' : ''}`}
                      value={form.email} onChange={handleChange} />
                    {errors.email && <div className="invalid-feedback">{errors.email}</div>}
                  </div>
                  <div className="col-md-6">
                    <label className="form-label">Password</label>
                    <input type="password" name="password" className={`form-control ${errors.password ? 'is-invalid' : ''}`}
                      value={form.password} onChange={handleChange} />
                    {errors.password && <div className="invalid-feedback">{errors.password}</div>}
                  </div>

                  {accountType === 'driver' && (
                    <>
                      <div className="col-12"><hr /><h6 className="text-muted">Driver Details</h6></div>
                      <div className="col-md-6">
                        <label className="form-label">License Number</label>
                        <input type="text" name="licenseNumber" className={`form-control ${errors.licenseNumber ? 'is-invalid' : ''}`}
                          value={form.licenseNumber} onChange={handleChange} />
                        {errors.licenseNumber && <div className="invalid-feedback">{errors.licenseNumber}</div>}
                      </div>
                      <div className="col-md-6">
                        <label className="form-label">Vehicle Type</label>
                        <select name="vehicleType" className="form-select" value={form.vehicleType} onChange={handleChange}>
                          {VEHICLE_TYPES.map((v) => <option key={v.value} value={v.value}>{v.label}</option>)}
                        </select>
                      </div>
                      <div className="col-md-4">
                        <label className="form-label">Make</label>
                        <input type="text" name="vehicleMake" className={`form-control ${errors.vehicleMake ? 'is-invalid' : ''}`}
                          value={form.vehicleMake} onChange={handleChange} />
                        {errors.vehicleMake && <div className="invalid-feedback">{errors.vehicleMake}</div>}
                      </div>
                      <div className="col-md-4">
                        <label className="form-label">Model</label>
                        <input type="text" name="vehicleModel" className={`form-control ${errors.vehicleModel ? 'is-invalid' : ''}`}
                          value={form.vehicleModel} onChange={handleChange} />
                        {errors.vehicleModel && <div className="invalid-feedback">{errors.vehicleModel}</div>}
                      </div>
                      <div className="col-md-4">
                        <label className="form-label">Plate Number</label>
                        <input type="text" name="plateNumber" className={`form-control ${errors.plateNumber ? 'is-invalid' : ''}`}
                          value={form.plateNumber} onChange={handleChange} />
                        {errors.plateNumber && <div className="invalid-feedback">{errors.plateNumber}</div>}
                      </div>
                    </>
                  )}
                </div>
                <button type="submit" className="btn btn-warning w-100 mt-4" disabled={loading}>
                  {loading ? 'Creating account...' : 'Register'}
                </button>
              </form>

              <p className="text-center text-muted small mt-3 mb-0">
                Already have an account? <Link to="/login" className="text-warning">Login</Link>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Register;
