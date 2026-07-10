import { Link } from 'react-router-dom';

const Footer = () => (
  <footer className="bg-dark text-light mt-auto py-4">
    <div className="container">
      <div className="row g-4">
        <div className="col-md-4">
          <h5 className="text-warning fw-bold">🚕 Ucab</h5>
          <p className="text-muted small mb-0">
            Your trusted ride-hailing partner. Book rides, track in real-time, and travel safely.
          </p>
        </div>
        <div className="col-md-4">
          <h6 className="text-warning">Quick Links</h6>
          <ul className="list-unstyled small">
            <li><Link className="text-muted text-decoration-none" to="/book-ride">Book a Ride</Link></li>
            <li><Link className="text-muted text-decoration-none" to="/support">Support</Link></li>
            <li><Link className="text-muted text-decoration-none" to="/coupons">Coupons</Link></li>
          </ul>
        </div>
        <div className="col-md-4">
          <h6 className="text-warning">Contact</h6>
          <p className="text-muted small mb-0">support@ucab.com</p>
          <p className="text-muted small">+91 1800-UCAB-RIDE</p>
        </div>
      </div>
      <hr className="border-secondary my-3" />
      <p className="text-center text-muted small mb-0">
        &copy; {new Date().getFullYear()} Ucab. All rights reserved.
      </p>
    </div>
  </footer>
);

export default Footer;
