import React from 'react';

const LoadingSpinner = ({ size = 'default', text = 'Loading...' }) => {
  const sizeClasses = {
    small: 'w-4 h-4',
    default: 'w-8 h-8',
    large: 'w-12 h-12'
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen">
      <div className="relative">
        <div className={`${sizeClasses[size]} animate-spin`}>
          <div className="absolute inset-0 border-4 border-rosegold-200 rounded-full"></div>
          <div className="absolute inset-0 border-4 border-transparent border-t-rosegold-500 rounded-full animate-spin"></div>
        </div>
      </div>
      {text && (
        <p className="mt-4 text-sm text-beige-600 animate-pulse">{text}</p>
      )}
    </div>
  );
};

export default LoadingSpinner;
