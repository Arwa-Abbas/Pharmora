
import React from 'react';

function LoadingSpinner({ size = 'medium', color = 'teal' }) {
  const sizeClasses = {
    small: 'h-4 w-4',
    medium: 'h-8 w-8',
    large: 'h-12 w-12'
  };

  const colorClasses = {
    teal: 'border-teal-600',
    blue: 'border-blue-600',
    cyan: 'border-cyan-600',
    gray: 'border-gray-600'
  };

  return (
    <div className="flex justify-center items-center">
      <div className={`animate-spin rounded-full border-b-2 ${sizeClasses[size]} ${colorClasses[color]}`}></div>
    </div>
  );
}

export default LoadingSpinner;