// Create a fullscreen overlay element
const overlay = document.createElement('div');
overlay.id = 'blinx-overlay';
document.body.appendChild(overlay);

// Listen for messages from the main app
window.addEventListener('message', (event) => {
  if (event.data.type === 'BLINX_FLASH') {
    // Update HTML class based on theme
    document.documentElement.classList.toggle('dark', event.data.isDark);
    overlay.classList.add('active');
    setTimeout(() => {
      overlay.classList.remove('active');
    }, 200);
  }
});