import { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { validateLogin } from '../utils/validators';
import { getErrorMessage } from '../services/api';
import { ROLES, DASHBOARD_PATHS } from '../utils/constants';

const Login = () => {
  const [form, setForm] = useState({ email: '', password: '' });
  const [role, setRole] = useState(ROLES.USER);
  const [errors, setErrors] = useState({});
  const [apiError, setApiError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    setErrors({ ...errors, [e.target.name]: '' });
    setApiError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const validationErrors = validateLogin(form);
    if (Object.keys(validationErrors).length) {
      setErrors(validationErrors);
      return;
    }
    setLoading(true);
    try {
      await login(form.email, form.password, role);
      navigate(location.state?.from?.pathname || DASHBOARD_PATHS[role]);
    } catch (err) {
      setApiError(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container py-5">
      <div className="row justify-content-center">
        <div className="col-md-5">
          <div className="card shadow border-0">
            <div className="card-body p-4 p-md-5">
              <h2 className="text-center fw-bold mb-1">Welcome Back</h2>
              <p className="text-center text-muted mb-4">Login to your Ucab account</p>

              <ul className="nav nav-pills nav-fill mb-4">
                {[
                  { value: ROLES.USER, label: 'Rider' },
                  { value: ROLES.DRIVER, label: 'Driver' },
                  { value: ROLES.ADMIN, label: 'Admin' },
                ].map((r) => (
                  <li className="nav-item" key={r.value}>
                    <button
                      type="button"
                      className={`nav-link ${role === r.value ? 'active' : ''}`}
                      onClick={() => setRole(r.value)}
                    >
                      {r.label}
                    </button>
                  </li>
                ))}
              </ul>

              {apiError && <div className="alert alert-danger">{apiError}</div>}

              <form onSubmit={handleSubmit}>
                <div className="mb-3">
                  <label className="form-label">Email</label>
                  <input
                    type="email"
                    name="email"
                    className={`form-control ${errors.email ? 'is-invalid' : ''}`}
                    value={form.email}
                    onChange={handleChange}
                    placeholder="you@example.com"
                  />
                  {errors.email && <div className="invalid-feedback">{errors.email}</div>}
                </div>
                <div className="mb-4">
                  <label className="form-label">Password</label>
                  <input
                    type="password"
                    name="password"
                    className={`form-control ${errors.password ? 'is-invalid' : ''}`}
                    value={form.password}
                    onChange={handleChange}
                  />
                  {errors.password && <div className="invalid-feedback">{errors.password}</div>}
                </div>
                <button type="submit" className="btn btn-warning w-100 mb-3" disabled={loading}>
                  {loading ? 'Logging in...' : 'Login'}
                </button>
              </form>

              {role !== ROLES.ADMIN && (
                <p className="text-center text-muted small mb-0">
                  Don&apos;t have an account? <Link to="/register" className="text-warning">Register</Link>
                </p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
