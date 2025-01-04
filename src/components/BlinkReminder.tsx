export const triggerBlinkReminder = () => {
  // Remove any existing overlay or text
  const existing = document.querySelector('.blink-reminder');
  if (existing) {
    return;
  }

  const overlay = document.createElement('div');
  overlay.className = 'blink-reminder fixed inset-0 flex items-center justify-center z-[99999] bg-black/10';
  
  const text = document.createElement('div');
  text.className = 'text-[15rem] font-black text-neutral-900/70 animate-in fade-in-0 duration-75 fade-out-0';
  text.textContent = 'BLINK';
  
  overlay.appendChild(text);
  document.body.appendChild(overlay);
  
  // Remove the text after animation
  setTimeout(() => {
    if (overlay.parentNode) {
      document.body.removeChild(overlay);
    }
  }, 1000);
};