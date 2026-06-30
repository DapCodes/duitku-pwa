export const showToast = (message, type = 'success') => {
  const toast = document.getElementById('toast');
  const msgEl = document.getElementById('toast-msg');
  const iconEl = document.getElementById('toast-icon');
  
  msgEl.textContent = message;
  
  if (type === 'success') {
    iconEl.textContent = 'check_circle';
    iconEl.className = 'material-symbols-outlined text-primary';
  } else if (type === 'error') {
    iconEl.textContent = 'error';
    iconEl.className = 'material-symbols-outlined text-error';
  }

  toast.classList.remove('opacity-0', 'pointer-events-none', '-translate-y-4');
  toast.classList.add('opacity-100', 'translate-y-0');

  setTimeout(() => {
    toast.classList.remove('opacity-100', 'translate-y-0');
    toast.classList.add('opacity-0', 'pointer-events-none', '-translate-y-4');
  }, 3000);
};

export const formatRupiah = (number) => {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0
  }).format(number);
};

export const playSound = (soundName) => {
  // Try to play sound placeholder
  // Since we don't have real files, we'll just log or use a quiet beep if we wanted, 
  // but we'll mock the implementation.
  console.log(`[SOUND] Playing: /assets/sounds/${soundName}.mp3`);
  try {
    const audio = new Audio(`/assets/sounds/${soundName}.mp3`);
    audio.play().catch(e => console.warn('Sound play skipped (no file or interaction block)'));
  } catch (e) {}
};

export const createConfetti = () => {
  // Confetti effect removed for a cleaner look
};

export const showLoading = () => {
  let loadingEl = document.getElementById('global-loading');
  if (!loadingEl) {
    loadingEl = document.createElement('div');
    loadingEl.id = 'global-loading';
    loadingEl.className = 'fixed inset-0 z-[100] flex flex-col items-center justify-center bg-[#f0f4f8]/80 backdrop-blur-md transition-opacity duration-300 opacity-0 pointer-events-none';
    loadingEl.innerHTML = `
      <div class="clay-surface bg-white p-6 flex flex-col items-center justify-center w-28 h-28 shadow-xl" style="box-shadow: 12px 12px 24px #d1d9e6, -12px -12px 24px #ffffff; border-radius: 28px;">
        <div class="relative w-12 h-12">
          <div class="absolute inset-0 rounded-full border-4 border-outline-variant opacity-30"></div>
          <div class="absolute inset-0 rounded-full border-4 border-primary border-t-transparent animate-spin"></div>
        </div>
      </div>
    `;
    document.body.appendChild(loadingEl);
  }
  
  // Force a reflow
  void loadingEl.offsetWidth;
  loadingEl.classList.remove('opacity-0', 'pointer-events-none');
};

export const hideLoading = () => {
  const loadingEl = document.getElementById('global-loading');
  if (loadingEl) {
    loadingEl.classList.add('opacity-0', 'pointer-events-none');
  }
};
