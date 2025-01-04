import React from 'react';

export const triggerBlinkReminder = () => {
  const overlay = document.createElement('div');
  overlay.style.position = 'fixed';
  overlay.style.inset = '0';
  overlay.style.backgroundColor = 'white';
  overlay.style.zIndex = '9999';
  overlay.style.animation = 'flash 0.2s ease-out forwards';
  
  const keyframes = `
    @keyframes flash {
      0% { opacity: 1; }
      100% { opacity: 0; }
    }
  `;
  
  const style = document.createElement('style');
  style.textContent = keyframes;
  document.head.appendChild(style);
  
  document.body.appendChild(overlay);
  
  setTimeout(() => {
    document.body.removeChild(overlay);
    document.head.removeChild(style);
  }, 200);
};