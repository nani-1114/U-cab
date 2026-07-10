import React from 'react';

const SearchingAnimation = ({ pickupAddress }) => {
  return (
    <div className="position-fixed top-0 start-0 w-100 h-100 d-flex flex-column align-items-center justify-content-center bg-white" style={{ zIndex: 1050 }}>
      <div className="position-relative d-flex justify-content-center align-items-center mb-5" style={{ width: '250px', height: '250px' }}>
        {/* Radar pulses */}
        <div className="position-absolute w-100 h-100 rounded-circle border border-primary border-2 opacity-25" style={{ animation: 'radar 2s linear infinite' }}></div>
        <div className="position-absolute w-75 h-75 rounded-circle border border-primary border-2 opacity-50" style={{ animation: 'radar 2s linear infinite 0.6s' }}></div>
        <div className="position-absolute w-50 h-50 rounded-circle border border-primary border-2 opacity-75" style={{ animation: 'radar 2s linear infinite 1.2s' }}></div>
        {/* Center car icon */}
        <div className="bg-dark text-white rounded-circle d-flex justify-content-center align-items-center shadow-lg z-1" style={{ width: '80px', height: '80px' }}>
            <i className="bi bi-car-front-fill fs-1"></i>
        </div>
      </div>
      
      <h2 className="fw-bold mb-3 text-dark">Searching for Nearby Drivers...</h2>
      <p className="text-muted text-center px-4 fs-5" style={{ maxWidth: '500px' }}>
        We are scanning the area around<br />
        <strong className="text-dark">{pickupAddress}</strong>
      </p>

      <style>{`
        @keyframes radar {
          0% { transform: scale(0.1); opacity: 1; }
          100% { transform: scale(1.5); opacity: 0; }
        }
      `}</style>
    </div>
  );
};

export default SearchingAnimation;
