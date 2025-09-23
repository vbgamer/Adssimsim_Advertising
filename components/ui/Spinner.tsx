
import React from 'react';

interface SpinnerProps {
  className?: string;
}

const Spinner: React.FC<SpinnerProps> = ({ className = 'h-8 w-8' }) => {
  return (
    <div className={`animate-spin rounded-full border-4 border-slate-500 border-t-primary-400 ${className}`} role="status">
      <span className="sr-only">Loading...</span>
    </div>
  );
};

export default Spinner;
