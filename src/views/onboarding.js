export const onboardingView = {
  render: () => `
    <div class="w-full h-full flex flex-col bg-surface relative overflow-hidden select-none" id="onboarding-root">

      <!-- ===== MAIN ONBOARDING CONTENT ===== -->
      <div id="ob-content" class="flex-1 flex flex-col transition-opacity duration-500">

        <!-- Top Bar -->
        <div class="w-full max-w-md mx-auto px-6 pt-6 pb-2 flex items-center justify-between shrink-0">
          <div class="flex items-center gap-2.5">
            <img src="/assets/logo.png" class="w-6 h-6 object-contain rounded-lg shadow-sm" />
            <span class="text-sm font-bold text-on-surface tracking-tight">Duitku</span>
          </div>
          <button id="ob-skip" class="text-xs font-semibold text-on-surface-variant hover:text-primary transition-colors px-3 py-1.5 rounded-xl"
                  style="background: rgba(0,0,0,0.04);">
            Lewati
          </button>
        </div>

        <!-- Slide Area -->
        <div id="ob-slider" class="flex-1 w-full max-w-md mx-auto relative overflow-hidden min-h-0">

          <!-- Slide 1 -->
          <div class="ob-slide absolute inset-0 flex flex-col px-6 pt-2 pb-0 transition-all duration-700 ease-out opacity-100 translate-x-0 z-10"
               data-accent="primary">
            <div class="flex-1 flex items-end justify-center min-h-0 relative">
              <!-- Glow behind -->
              <div class="absolute bottom-10 left-1/2 -translate-x-1/2 w-48 h-48 rounded-full -z-10"
                   style="background: var(--color-primary); opacity: 0.15; filter: blur(40px);"></div>
              <!-- Mascot image sitting flush on the card below -->
              <img src="/assets/mascout.png" class="w-64 h-64 object-contain drop-shadow-xl relative z-10 -mb-1" alt="Maskot Duitku" loading="eager" />
            </div>
            <!-- Text Card -->
            <div class="shrink-0 clay-surface-sm bg-surface-container-lowest/90 p-6 mb-2 relative z-20">
              <h2 class="text-xl font-bold text-on-surface mb-2 leading-snug">
                Halo! 👋 <span class="text-primary">Selamat Datang</span>
              </h2>
              <p class="text-sm text-on-surface-variant leading-relaxed">
                Ini adalah <b class="text-primary">Duitku</b>. Teman barumu untuk mengelola keuangan dengan mudah dan menyenangkan.
              </p>
            </div>
          </div>

          <!-- Slide 2 -->
          <div class="ob-slide absolute inset-0 flex flex-col px-6 pt-2 pb-0 transition-all duration-700 ease-out opacity-0 translate-x-full z-0 pointer-events-none"
               data-accent="secondary">
            <div class="flex-1 flex items-end justify-center min-h-0 relative">
              <!-- Glow behind -->
              <div class="absolute bottom-10 left-1/2 -translate-x-1/2 w-48 h-48 rounded-full -z-10"
                   style="background: var(--color-secondary); opacity: 0.15; filter: blur(40px);"></div>
              <!-- Mascot image sitting flush on the card below -->
              <img src="/assets/mascout3.png" class="w-64 h-64 object-contain drop-shadow-xl relative z-10 -mb-1" alt="Lacak Keuangan" loading="lazy" />
            </div>
            <div class="shrink-0 clay-surface-sm bg-surface-container-lowest/90 p-6 mb-2 relative z-20">
              <h2 class="text-xl font-bold text-on-surface mb-2 leading-snug">
                Lacak <span class="text-secondary">Arus Uangmu</span>
              </h2>
              <p class="text-sm text-on-surface-variant leading-relaxed">
                Ketahui kemana uangmu pergi. Catat pemasukan & pengeluaran dengan tampilan yang mudah dipahami.
              </p>
            </div>
          </div>

          <!-- Slide 3 -->
          <div class="ob-slide absolute inset-0 flex flex-col px-6 pt-2 pb-0 transition-all duration-700 ease-out opacity-0 translate-x-full z-0 pointer-events-none"
               data-accent="tertiary">
            <div class="flex-1 flex items-end justify-center min-h-0 relative">
              <!-- Glow behind -->
              <div class="absolute bottom-10 left-1/2 -translate-x-1/2 w-48 h-48 rounded-full -z-10"
                   style="background: var(--color-tertiary); opacity: 0.18; filter: blur(40px);"></div>
              <!-- Mascot image sitting flush on the card below -->
              <img src="/assets/mascout2.png" class="w-64 h-64 object-contain drop-shadow-xl relative z-10 -mb-1" alt="Capai Mimpi" loading="lazy" />
            </div>
            <div class="shrink-0 clay-surface-sm bg-surface-container-lowest/90 p-6 mb-2 relative z-20">
              <h2 class="text-xl font-bold text-on-surface mb-2 leading-snug">
                Wujudkan <span style="color: var(--color-tertiary);">Mimpimu</span> 🎯
              </h2>
              <p class="text-sm text-on-surface-variant leading-relaxed">
                Buat target tabungan dan capai impianmu satu per satu. Semuanya jadi lebih terorganisir!
              </p>
            </div>
          </div>
        </div>

        <!-- Bottom Controls -->
        <div class="w-full max-w-md mx-auto px-6 pb-8 pt-4 shrink-0 flex flex-col items-center gap-5">
          <!-- Dot Indicators -->
          <div class="flex items-center gap-2.5" id="ob-dots">
            <div class="ob-dot w-8 h-2 rounded-full bg-primary transition-all duration-500" style="box-shadow: 0 0 8px rgba(108,92,231,0.4);"></div>
            <div class="ob-dot w-2 h-2 rounded-full bg-outline-variant transition-all duration-500"></div>
            <div class="ob-dot w-2 h-2 rounded-full bg-outline-variant transition-all duration-500"></div>
          </div>

          <!-- Action Buttons -->
          <div class="w-full flex flex-col gap-3" id="ob-actions">
            <button id="ob-next"
                    class="clay-button w-full py-4 rounded-[20px] font-semibold text-base flex items-center justify-center gap-2 transition-all duration-300 active:scale-[0.97]"
                    style="background: var(--color-primary); color: white; box-shadow: 0 8px 20px rgba(108,92,231,0.3), 6px 6px 12px #d1d9e6, -6px -6px 12px #ffffff;">
              <span id="ob-btn-text">Lanjut</span>
              <span class="material-symbols-outlined text-xl" id="ob-btn-icon">arrow_forward</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  `,

  init: () => {
    // --- Slide Logic ---
    let currentSlide = 0;
    const slides = document.querySelectorAll('.ob-slide');
    const dots = document.querySelectorAll('.ob-dot');
    const btn = document.getElementById('ob-next');
    const btnText = document.getElementById('ob-btn-text');
    const btnIcon = document.getElementById('ob-btn-icon');
    const skipBtn = document.getElementById('ob-skip');

    const accentColors = {
      primary: { bg: 'var(--color-primary)', shadow: 'rgba(108,92,231,0.3)', dot: 'rgba(108,92,231,0.4)' },
      secondary: { bg: 'var(--color-secondary)', shadow: 'rgba(0,184,148,0.3)', dot: 'rgba(0,184,148,0.4)' },
      tertiary: { bg: 'var(--color-tertiary)', shadow: 'rgba(253,203,110,0.3)', dot: 'rgba(253,203,110,0.4)' },
    };

    const goToSlide = (index) => {
      // Exit current
      slides[currentSlide].classList.replace('opacity-100', 'opacity-0');
      slides[currentSlide].classList.replace('translate-x-0', '-translate-x-full');
      slides[currentSlide].classList.replace('z-10', 'z-0');
      slides[currentSlide].classList.add('pointer-events-none');

      // Reset dots
      dots.forEach((d, i) => {
        if (i === index) {
          const accent = slides[index].dataset.accent;
          const colors = accentColors[accent];
          d.className = 'ob-dot w-8 h-2 rounded-full transition-all duration-500';
          d.style.background = colors.bg;
          d.style.boxShadow = `0 0 8px ${colors.dot}`;
        } else {
          d.className = 'ob-dot w-2 h-2 rounded-full bg-outline-variant transition-all duration-500';
          d.style.background = '';
          d.style.boxShadow = '';
        }
      });

      // Enter new
      slides[index].classList.remove('pointer-events-none');
      slides[index].classList.replace('opacity-0', 'opacity-100');
      slides[index].classList.replace('translate-x-full', 'translate-x-0');
      slides[index].classList.replace('z-0', 'z-10');

      // Update button style
      const accent = slides[index].dataset.accent;
      const colors = accentColors[accent];
      btn.style.background = colors.bg;
      btn.style.boxShadow = `0 8px 20px ${colors.shadow}, 6px 6px 12px #d1d9e6, -6px -6px 12px #ffffff`;

      if (index === 2) {
        btnText.textContent = 'Mulai Sekarang';
        btnIcon.textContent = 'celebration';
        btn.style.color = accent === 'tertiary' ? 'var(--color-on-tertiary)' : 'white';
        skipBtn.style.display = 'none';
      } else {
        btnText.textContent = 'Lanjut';
        btnIcon.textContent = 'arrow_forward';
        btn.style.color = 'white';
        skipBtn.style.display = '';
      }

      currentSlide = index;
    };

    // Touch/Swipe support
    let touchStartX = 0;
    let touchEndX = 0;
    const slider = document.getElementById('ob-slider');

    slider.addEventListener('touchstart', (e) => {
      touchStartX = e.changedTouches[0].screenX;
    }, { passive: true });

    slider.addEventListener('touchend', (e) => {
      touchEndX = e.changedTouches[0].screenX;
      const diff = touchStartX - touchEndX;
      if (Math.abs(diff) > 50) {
        if (diff > 0 && currentSlide < 2) {
          goToSlide(currentSlide + 1);
        } else if (diff < 0 && currentSlide > 0) {
          goToSlide(currentSlide - 1);
        }
      }
    }, { passive: true });

    const finishOnboarding = async () => {
      const { showLoading, hideLoading } = await import('../utils.js');
      showLoading();
      setTimeout(async () => {
        const { navigate } = await import('../main.js');
        await navigate('setup');
        hideLoading();
      }, 1000);
    };

    btn.addEventListener('click', async () => {
      if (currentSlide < 2) {
        goToSlide(currentSlide + 1);
      } else {
        await finishOnboarding();
      }
    });

    skipBtn.addEventListener('click', async () => {
      await finishOnboarding();
    });
  }
};
