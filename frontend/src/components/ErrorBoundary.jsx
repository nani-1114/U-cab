import React from 'react';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error("ErrorBoundary caught an error", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="vh-100 d-flex flex-column justify-content-center align-items-center bg-light text-center p-4">
          <i className="bi bi-exclamation-triangle text-danger" style={{ fontSize: '4rem' }}></i>
          <h2 className="fw-bold mt-3">Oops, something went wrong</h2>
          <p className="text-muted">We encountered an unexpected error. Please try refreshing the page.</p>
          <button className="btn btn-dark mt-3 px-4 py-2 shadow-sm rounded-pill" onClick={() => window.location.reload()}>
            Refresh Page
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}

export default ErrorBoundary;
