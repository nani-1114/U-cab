import React from 'react';

const SkeletonLoader = ({ type = 'text', count = 1, width, height, className = '' }) => {
  const elements = [];
  for (let i = 0; i < count; i++) {
    let style = { width: width || '100%', height: height || '1em', marginBottom: '0.5rem' };
    let shapeClass = 'skeleton-box';

    if (type === 'avatar') {
      shapeClass += ' rounded-circle';
      style = { width: width || '48px', height: height || '48px', ...style };
    } else if (type === 'card') {
      style = { height: height || '150px', ...style };
      shapeClass += ' rounded-3';
    }

    elements.push(
      <div key={i} className={`${shapeClass} ${className}`} style={style}></div>
    );
  }
  return <>{elements}</>;
};

export default SkeletonLoader;
