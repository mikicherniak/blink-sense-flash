import React, { useEffect } from 'react';

interface BlinkWarningFlashProps {
  isVisible: boolean;
}

export const BlinkWarningFlash: React.FC<BlinkWarningFlashProps> = ({ isVisible }) => {
  useEffect(() => {
    if (isVisible) {
      // Send message to the Chrome extension
      window.postMessage({ type: 'BLINX_FLASH' }, '*');
    }
  }, [isVisible]);

  // Keep the original flash as fallback for when extension is not installed
  if (!isVisible) return null;
  
  return (
    <div className="fixed inset-0 bg-white/50 animate-[flash_200ms_ease-out] pointer-events-none z-[99999] w-screen h-screen" />
  );
};
