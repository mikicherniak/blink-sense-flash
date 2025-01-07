import React from 'react';

export const DotsIcon = ({ className = "", size = 24 }: { className?: string; size?: number }) => (
  <svg 
    xmlns="http://www.w3.org/2000/svg" 
    width={size} 
    height={size} 
    viewBox="0 0 100 100"
    className={className}
  >
    <circle cx="50" cy="10" r="5" fill="currentColor" />
    <circle cx="30" cy="30" r="5" fill="currentColor" />
    <circle cx="50" cy="30" r="5" fill="currentColor" />
    <circle cx="70" cy="30" r="5" fill="currentColor" />
    <circle cx="20" cy="50" r="5" fill="currentColor" />
    <circle cx="40" cy="50" r="5" fill="currentColor" />
    <circle cx="60" cy="50" r="5" fill="currentColor" />
    <circle cx="80" cy="50" r="5" fill="currentColor" />
    <circle cx="30" cy="70" r="5" fill="currentColor" />
    <circle cx="50" cy="70" r="5" fill="currentColor" />
    <circle cx="70" cy="70" r="5" fill="currentColor" />
    <circle cx="50" cy="90" r="5" fill="currentColor" />
  </svg>
);