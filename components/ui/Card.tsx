
import React from 'react';

interface CardProps {
  children: React.ReactNode;
  className?: string;
}

const Card: React.FC<CardProps> = ({ children, className = '' }) => {
  return (
    <div className={`bg-slate-800 rounded-xl shadow-lg overflow-hidden ${className}`}>
      {children}
    </div>
  );
};

export default Card;
