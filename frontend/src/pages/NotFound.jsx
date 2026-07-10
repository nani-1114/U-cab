import { Link } from 'react-router-dom';

const NotFound = () => (
  <div className="container text-center py-5">
    <div className="py-5">
      <h1 className="display-1 fw-bold text-warning">404</h1>
      <h2 className="fw-bold mb-3">Page Not Found</h2>
      <p className="text-muted mb-4">The page you&apos;re looking for doesn&apos;t exist or has been moved.</p>
      <Link to="/" className="btn btn-warning btn-lg">Go Home</Link>
    </div>
  </div>
);

export default NotFound;
