export const triggerBlinkReminder = () => {
  // Remove any existing overlay
  const existingOverlay = document.querySelector('.flash-overlay');
  if (existingOverlay) {
    return; // Don't create multiple overlays
  }

  const overlay = document.createElement('div');
  overlay.className = 'flash-overlay';
  document.body.appendChild(overlay);
  
  // Remove the overlay after animation completes
  setTimeout(() => {
    if (overlay.parentNode) {
      document.body.removeChild(overlay);
    }
  }, 200);
};