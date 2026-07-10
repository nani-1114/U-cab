import { Link } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { ROLES } from '../utils/constants';

const Home = () => {
  const { isAuthenticated, user } = useAuth();

  return (
    <>
      <section className="hero-section text-white text-center py-5">
        <div className="container py-5">
          <h1 className="display-4 fw-bold mb-3">Ride Anywhere, Anytime</h1>
          <p className="lead mb-4 opacity-75">
            Book safe, affordable rides with Ucab. Track your driver in real-time and pay seamlessly.
          </p>
          {isAuthenticated && user?.role === ROLES.USER ? (
            <Link to="/book-ride" className="btn btn-warning btn-lg px-5">Book a Ride Now</Link>
          ) : (
            <div className="d-flex gap-3 justify-content-center flex-wrap">
              <Link to="/register" className="btn btn-warning btn-lg px-4">Get Started</Link>
              <Link to="/login" className="btn btn-outline-light btn-lg px-4">Login</Link>
            </div>
          )}
        </div>
      </section>

      <section className="py-5 bg-light">
        <div className="container">
          <h2 className="text-center fw-bold mb-5">Why Choose Ucab?</h2>
          <div className="row g-4">
            {[
              { icon: 'bi-shield-check', title: 'Safe Rides', desc: 'Verified drivers and real-time tracking for your safety.' },
              { icon: 'bi-lightning-charge', title: 'Quick Booking', desc: 'Book a ride in seconds with instant fare estimates.' },
              { icon: 'bi-wallet2', title: 'Flexible Payment', desc: 'Pay with cash, card, or wallet — your choice.' },
              { icon: 'bi-tag', title: 'Great Deals', desc: 'Exclusive coupons and discounts on every ride.' },
            ].map((f) => (
              <div key={f.title} className="col-md-6 col-lg-3">
                <div className="card h-100 border-0 shadow-sm text-center p-4">
                  <i className={`bi ${f.icon} fs-1 text-warning mb-3`} />
                  <h5 className="fw-bold">{f.title}</h5>
                  <p className="text-muted small mb-0">{f.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-5">
        <div className="container text-center">
          <h2 className="fw-bold mb-4">Ready to Ride?</h2>
          <p className="text-muted mb-4">Join thousands of happy riders and drivers on Ucab.</p>
          <Link to="/register" className="btn btn-dark btn-lg">Create Account</Link>
        </div>
      </section>
    </>
  );
};

export default Home;
