import { put, stores } from '../db.js';

export const setupView = {
  render: () => `
    <div class="w-full h-full flex flex-col items-center bg-surface-bright relative overflow-hidden">
      <!-- Animated Backgrounds -->
      <div class="absolute top-0 right-0 w-64 h-64 bg-primary/8 rounded-full blur-3xl animate-pulse-slow -z-10"></div>
      <div class="absolute bottom-0 left-0 w-64 h-64 bg-secondary/8 rounded-full blur-3xl -z-10" style="animation-delay:2s;"></div>

      <!-- Step 1: Name -->
      <div id="setup-step-1" class="w-full max-w-md mx-auto h-full flex flex-col px-6 transition-all duration-500 transform translate-x-0 opacity-100">
        <!-- Center content -->
        <div class="flex-1 flex flex-col justify-center">
          <div class="bg-white/90 backdrop-blur-xl p-8 rounded-[28px] shadow-[0_10px_30px_rgba(0,0,0,0.06)] border border-white/80 animate-slide-up" style="animation-delay:0.1s;opacity:0;animation-fill-mode:forwards;">
            <h1 class="text-2xl font-bold text-on-surface mb-2 leading-tight">Halo! 👋<br/><span class="text-primary">Siapa nama kamu?</span></h1>
            <p class="text-sm text-on-surface-variant mb-6">Biar kita bisa lebih akrab.</p>

            <div class="relative group">
              <input type="text" id="setup-name" placeholder="Ketik namamu di sini..." class="w-full clay-inset p-5 font-title-lg text-on-surface placeholder:text-outline outline-none border-2 border-transparent focus:border-primary/50 transition-all text-center rounded-[20px]" />
              <div class="absolute inset-0 border-2 border-primary/20 rounded-[20px] opacity-0 group-focus-within:opacity-100 transition-opacity pointer-events-none shadow-[0_0_15px_rgba(108,92,231,0.15)]"></div>
            </div>
          </div>
        </div>
        <!-- Button at bottom -->
        <div class="pb-8 pt-4 shrink-0 animate-slide-up" style="animation-delay:0.2s;opacity:0;animation-fill-mode:forwards;">
          <button id="setup-next-1" class="clay-button bg-surface-dim text-on-surface-variant w-full py-4 rounded-[20px] font-title-lg flex justify-center items-center gap-3 transition-all duration-300 pointer-events-none">
            <span>Lanjut</span>
            <span class="material-symbols-outlined">arrow_forward</span>
          </button>
        </div>
      </div>

      <!-- Step 2: Goals -->
      <div id="setup-step-2" class="hidden w-full h-full flex-col px-6 transition-all duration-500 transform translate-x-10 opacity-0">
        <!-- Header -->
        <div class="pt-10 pb-4 shrink-0">
          <h1 class="text-2xl font-bold text-on-surface leading-tight">Apa <span class="text-secondary">tujuan utamamu?</span></h1>
          <p class="text-sm text-on-surface-variant mt-2">Pilih satu yang paling penting saat ini.</p>
        </div>
        <!-- Scrollable grid, full width -->
        <div class="flex-1 overflow-y-auto no-scrollbar pb-8 min-h-0">
          <div class="grid grid-cols-2 gap-3 w-full" id="setup-goals">
            ${[
              {id: 'Menabung', icon: 'savings', color: 'text-primary'},
              {id: 'Mengontrol pengeluaran', icon: 'monitoring', color: 'text-secondary'},
              {id: 'Mencari uang misterius', icon: 'search', color: 'text-tertiary'},
              {id: 'Dana darurat', icon: 'health_and_safety', color: 'text-error'},
              {id: 'Beli kendaraan', icon: 'directions_car', color: 'text-primary'},
              {id: 'Beli rumah', icon: 'home', color: 'text-secondary'},
              {id: 'Liburan', icon: 'flight_takeoff', color: 'text-tertiary'},
              {id: 'Lainnya', icon: 'more_horiz', color: 'text-on-surface-variant'}
            ].map((g, i) => `
              <button class="goal-btn bg-white/90 backdrop-blur-sm rounded-[20px] p-4 flex flex-col items-center justify-center gap-2.5 border-2 border-white/80 shadow-[0_4px_15px_rgba(0,0,0,0.04)] transition-all duration-300 hover:-translate-y-0.5 hover:shadow-[0_8px_25px_rgba(0,0,0,0.08)] hover:border-primary/30 active:scale-95 animate-slide-up h-28" data-goal="${g.id}" style="animation-delay:${i * 0.06}s;opacity:0;animation-fill-mode:forwards;">
                <div class="w-11 h-11 rounded-full clay-inset flex items-center justify-center shrink-0">
                  <span class="material-symbols-outlined ${g.color} text-[24px]">${g.icon}</span>
                </div>
                <span class="text-xs font-semibold text-on-surface text-center leading-tight">${g.id}</span>
              </button>
            `).join('')}
          </div>
        </div>
      </div>

      <!-- Step 3: Balance -->
      <div id="setup-step-3" class="hidden w-full max-w-md mx-auto h-full flex-col px-6 transition-all duration-500 transform translate-x-10 opacity-0">
        <!-- Center content -->
        <div class="flex-1 flex flex-col justify-center">
          <div class="bg-white/90 backdrop-blur-xl p-8 rounded-[28px] shadow-[0_10px_30px_rgba(0,0,0,0.06)] border border-white/80">
            <h1 class="text-2xl font-bold text-on-surface mb-2 leading-tight text-center">Berapa <span class="text-tertiary">uangmu</span><br/>saat ini?</h1>
            <p class="text-sm text-on-surface-variant mb-6 text-center">Tenang, data ini hanya disimpan di HP kamu.</p>

            <div class="relative group">
              <div class="clay-inset p-5 flex items-center rounded-[20px] border-2 border-transparent group-focus-within:border-tertiary/50 transition-all group-focus-within:shadow-[0_0_15px_rgba(253,203,110,0.15)]">
                <span class="text-2xl text-tertiary font-bold mr-3">Rp</span>
                <input type="number" id="setup-balance" placeholder="0" class="w-full text-2xl font-bold text-on-surface placeholder:text-outline outline-none bg-transparent" />
              </div>
            </div>
          </div>
        </div>
        <!-- Button at bottom, same position as step 1 -->
        <div class="pb-8 pt-4 shrink-0">
          <button id="setup-finish" class="clay-button bg-surface-dim text-on-surface-variant w-full py-4 rounded-[20px] font-title-lg flex justify-center items-center gap-3 transition-all duration-300 pointer-events-none">
            <span>Mulai Sekarang</span>
            <span class="material-symbols-outlined">rocket_launch</span>
          </button>
        </div>
      </div>
    </div>
  `,
  init: () => {
    const step1 = document.getElementById('setup-step-1');
    const step2 = document.getElementById('setup-step-2');
    const step3 = document.getElementById('setup-step-3');

    const inputName = document.getElementById('setup-name');
    const btnNext1 = document.getElementById('setup-next-1');
    const goalBtns = document.querySelectorAll('.goal-btn');
    const inputBalance = document.getElementById('setup-balance');
    const btnFinish = document.getElementById('setup-finish');

    let userData = {
      id: 'me',
      name: '',
      main_goal: '',
      initial_balance: 0,
      current_balance: 0,
      createdAt: new Date().getTime()
    };

    // Step 1 - Name
    inputName.addEventListener('input', (e) => {
      if (e.target.value.trim().length > 0) {
        btnNext1.className = 'clay-button bg-primary text-white w-full py-4 rounded-[20px] font-title-lg flex justify-center items-center gap-3 transition-all duration-300 active:scale-95 shadow-[0_10px_20px_rgba(108,92,231,0.3)] cursor-pointer';
      } else {
        btnNext1.className = 'clay-button bg-surface-dim text-on-surface-variant w-full py-4 rounded-[20px] font-title-lg flex justify-center items-center gap-3 transition-all duration-300 pointer-events-none';
      }
    });

    btnNext1.addEventListener('click', () => {
      userData.name = inputName.value.trim();
      step1.classList.replace('translate-x-0', '-translate-x-10');
      step1.classList.replace('opacity-100', 'opacity-0');

      setTimeout(() => {
        step1.classList.add('hidden');
        step1.classList.remove('flex');
        step2.classList.remove('hidden');
        step2.classList.add('flex');
        void step2.offsetWidth;
        step2.classList.replace('translate-x-10', 'translate-x-0');
        step2.classList.replace('opacity-0', 'opacity-100');
      }, 500);
    });

    // Step 2 - Goals
    goalBtns.forEach(btn => {
      btn.addEventListener('click', () => {
        btn.classList.add('scale-95', 'ring-4', 'ring-secondary/30');

        setTimeout(() => {
          userData.main_goal = btn.dataset.goal;
          step2.classList.replace('translate-x-0', '-translate-x-10');
          step2.classList.replace('opacity-100', 'opacity-0');

          setTimeout(() => {
            step2.classList.add('hidden');
            step2.classList.remove('flex');
            step3.classList.remove('hidden');
            step3.classList.add('flex');
            void step3.offsetWidth;
            step3.classList.replace('translate-x-10', 'translate-x-0');
            step3.classList.replace('opacity-0', 'opacity-100');
          }, 500);
        }, 300);
      });
    });

    // Step 3 - Balance
    inputBalance.addEventListener('input', (e) => {
      if (e.target.value.length > 0 && !isNaN(e.target.value)) {
        btnFinish.className = 'clay-button bg-tertiary text-on-surface w-full py-4 rounded-[20px] font-title-lg flex justify-center items-center gap-3 transition-all duration-300 active:scale-95 shadow-[0_10px_20px_rgba(253,203,110,0.3)] cursor-pointer';
      } else {
        btnFinish.className = 'clay-button bg-surface-dim text-on-surface-variant w-full py-4 rounded-[20px] font-title-lg flex justify-center items-center gap-3 transition-all duration-300 pointer-events-none';
      }
    });

    btnFinish.addEventListener('click', async () => {
      const { createConfetti, playSound, showLoading, hideLoading } = await import('../utils.js');
      showLoading();

      userData.initial_balance = Number(inputBalance.value) || 0;
      userData.current_balance = userData.initial_balance;

      await put(stores.USERS, userData);

      playSound('achievement');
      createConfetti();

      setTimeout(async () => {
        const { navigate } = await import('../main.js');
        hideLoading();
        navigate('home');
      }, 1500);
    });
  }
};
