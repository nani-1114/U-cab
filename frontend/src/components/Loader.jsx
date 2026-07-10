const Loader = ({ fullScreen = false, message = 'Loading...' }) => (
  <div
    className={`d-flex flex-column align-items-center justify-content-center ${
      fullScreen ? 'min-vh-100' : 'py-5'
    }`}
  >
    <div className="spinner-border text-warning" role="status" style={{ width: '3rem', height: '3rem' }}>
      <span className="visually-hidden">Loading...</span>
    </div>
    {message && <p className="text-muted mt-3 mb-0">{message}</p>}
  </div>
);

export default Loader;
