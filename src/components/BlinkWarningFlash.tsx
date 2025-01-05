import React, { useEffect, useState } from 'react';

interface BlinkWarningFlashProps {
  isVisible: boolean;
}

export const BlinkWarningFlash: React.FC<BlinkWarningFlashProps> = ({ isVisible }) => {
  const [randomBlur, setRandomBlur] = useState(0);

  useEffect(() => {
    if (isVisible) {
      // Send message to the Chrome extension
      window.postMessage({ type: 'BLINX_FLASH' }, '*');

      // Start random blur animation
      const blurInterval = setInterval(() => {
        setRandomBlur(Math.random() * 10); // Random blur between 0 and 10px
      }, 200);

      return () => clearInterval(blurInterval);
    }
  }, [isVisible]);

  if (!isVisible) return null;
  
  return (
    <div 
      className="fixed inset-0 bg-white pointer-events-none z-[99999] w-screen h-screen animate-[random-flash_1s_ease-in-out_infinite]"
      style={{ 
        filter: `blur(${randomBlur}px)`,
        transition: 'filter 0.5s ease-in-out'
      }} 
    />
  );
};