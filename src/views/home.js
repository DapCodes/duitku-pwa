import { get, getAll, stores } from '../db.js';
import { formatRupiah } from '../utils.js';

// Flag ini hidup selama app belum di-reload penuh (SPA navigation di main.js
// tidak mereset variabel module ini). Karena transisi ke Beranda dibuat instan
// di main.js, animasi masuk (stagger + count-up saldo) dibangun sendiri di sini
// pakai requestAnimationFrame/CSS — bukan setTimeout — dan hanya diputar sekali
// saat pertama kali user masuk ke Beranda.
let hasEnteredHomeBefore = false;

// Helper: kembalikan class stagger hanya kalau ini kunjungan pertama ke Beranda
const staggerClass = (n) => hasEnteredHomeBefore ? '' : `stagger-${n}`;

export const homeView = {
  render: () => `
    <div class="w-full min-h-full flex flex-col bg-surface-bright pb-32">
      <!-- Header Area -->
      <div class="px-6 pt-12 pb-8 bg-surface-bright relative overflow-hidden mb-2">
        
        <div class="relative z-10 flex justify-between items-center mb-8 ${staggerClass(1)}">
          <div class="flex items-center gap-4">
            <button id="btn-settings" class="w-14 h-14 shrink-0 clay-surface rounded-full flex items-center justify-center cursor-pointer transition-transform active:scale-95 hover-wiggle p-1">
              <img id="home-avatar" src="/assets/images/profile-avatar.png" alt="Profile" class="w-full h-full rounded-full object-cover bg-surface-dim" onerror="this.src='data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIxMDAiIGhlaWdodD0iMTAwIj48Y2lyY2xlIGN4PSI1MCIgY3k9IjUwIiByPSI0MCIgZmlsbD0iI2QxZDllNiIvPjwvc3ZnPg=='">
            </button>
            <div>
              <h1 class="text-2xl font-bold text-on-surface" id="home-name">Pemuat...</h1>
              <p class="text-sm text-outline font-medium italic">"Kelola uangmu dengan cinta."</p>
            </div>
          </div>
          <div class="relative flex flex-col items-center justify-center w-14 h-14 shrink-0">
             <span class="text-[32px] font-black text-gray-900/10 leading-none absolute top-1 -right-1 tracking-tighter" id="cal-month">JAN</span>
             <span class="text-[24px] font-bold text-on-surface leading-none relative z-10" id="cal-date">24</span>
          </div>
        </div>

        <div class="glow-primary p-6 flex flex-col items-center justify-center relative overflow-hidden rounded-[30px] border border-white/40 ${staggerClass(2)}" style="background: linear-gradient(135deg, #6c5ce7 0%, #a29bfe 40%, #00b894 100%);">
          <div class="absolute inset-0 overflow-hidden rounded-[30px] pointer-events-none">
            <div class="absolute inset-0 w-[200%] h-full bg-gradient-to-r from-transparent via-white/25 to-transparent animate-shine"></div>
          </div>
          <div class="absolute -top-10 -right-10 w-32 h-32 bg-white opacity-10 rounded-full blur-xl"></div>
          <div class="absolute -bottom-8 -left-8 w-24 h-24 bg-white opacity-10 rounded-full blur-xl"></div>
          <p class="text-xs font-bold uppercase tracking-widest text-white/70 mb-2 relative z-10">Saldo Saat Ini</p>
          <h2 class="text-4xl font-black text-white tracking-tight relative z-10 drop-shadow-lg" id="home-balance">Rp 0</h2>
        </div>
      </div>

      <!-- Main Content -->
      <div class="px-6 relative z-20 space-y-6 pt-2 ${hasEnteredHomeBefore ? '' : 'stagger-container'}">
        
        <!-- Mystery Money Card -->
        <div class="clay-surface p-5 flex items-center justify-between border-l-4 border-secondary hidden">
          <div>
            <h3 class="font-title-md text-on-surface flex items-center gap-2">
              <span class="material-symbols-outlined text-secondary">help_center</span>
              Uang Misterius
            </h3>
            <p class="font-body-sm text-on-surface-variant mt-1">Belum tercatat bulan ini</p>
          </div>
          <div class="text-right">
            <p class="font-title-md text-secondary" id="home-mystery">Rp 0</p>
          </div>
        </div>

        <!-- Financial Mood -->
        <div class="clay-surface p-5 flex flex-col gap-3 relative overflow-hidden ${staggerClass(3)}">
          <h3 class="font-title-md text-on-surface">Kondisi Keuangan</h3>
          <div class="flex flex-col gap-1 z-10">
            <p id="mood-text" class="text-3xl font-black text-primary">Sangat Stabil</p>
            <p id="mood-desc" class="font-body-sm text-on-surface-variant">Pengeluaranmu terkendali dengan baik.</p>
          </div>
          <div id="mood-bg" class="absolute -bottom-10 -right-10 w-32 h-32 rounded-full opacity-20 bg-primary-container"></div>
        </div>

        <!-- Prediction -->
        <div class="clay-surface-sm p-5 bg-gradient-to-br from-surface to-surface-container flex flex-col gap-1 relative overflow-hidden ${staggerClass(4)}">
          <p class="font-label-md text-outline font-bold uppercase tracking-widest">Perkiraan saldo habis</p>
          <p class="text-3xl font-black text-on-surface" id="home-prediction">Menghitung...</p>
          <p class="text-xs text-outline font-medium" id="home-prediction-desc">Menunggu data pengeluaran</p>
          <div class="absolute -bottom-8 -right-8 w-24 h-24 bg-error opacity-10 rounded-full blur-xl"></div>
        </div>

        <!-- Heatmap -->
        <div class="clay-surface p-5 ${staggerClass(5)}">
          <h3 class="font-title-md text-on-surface mb-3 flex items-center gap-2">
            <span class="material-symbols-outlined text-secondary">eco</span>
            Intensitas Catat Keuangan
          </h3>
          <div class="w-full overflow-x-auto pb-2 hide-scrollbar" id="heatmap-scroll">
            <div class="grid grid-rows-5 grid-flow-col gap-1.5 w-max" id="heatmap-grid">
              <!-- Populated by JS -->
            </div>
          </div>
          <div id="heatmap-detail" class="mt-4 p-3 bg-surface-variant/20 rounded-xl text-sm hidden border border-outline-variant/30">
             <!-- Populated by click -->
          </div>
        </div>

        <!-- Daily Insight -->
        <div class="clay-surface p-5 border border-primary/20 bg-primary/5 ${staggerClass(6)}">
          <div class="flex gap-3">
            <span class="material-symbols-outlined text-primary mt-1">lightbulb</span>
            <div>
              <h3 class="font-title-md text-on-surface mb-1">Insight Hari Ini</h3>
              <p class="font-body-sm text-on-surface-variant" id="home-insight">Terus pantau pengeluaranmu untuk mencapai tujuan finansial!</p>
            </div>
          </div>
        </div>

        <!-- Tabungan Saya -->
        <div class="${staggerClass(7)}">
          <div class="flex justify-between items-center mb-4 px-1">
            <h3 class="font-title-md text-on-surface flex items-center gap-2">
              <span class="material-symbols-outlined text-tertiary">savings</span>
              Tabungan Saya
            </h3>
            <button data-nav="goals" class="nav-btn text-primary font-label-md hover:underline">Lihat Semua</button>
          </div>
          <div class="flex gap-4 overflow-x-auto pb-4 hide-scrollbar snap-x" id="home-goals-list">
             <!-- Populated by JS -->
          </div>
        </div>
      </div>
    </div>
  `,
  init: async () => {
    // Count-up saldo pakai requestAnimationFrame murni — tidak ada setTimeout
    // di alur ini, jadi tidak bergantung pada timer manapun selain rAF browser.
    const animateCountUp = (el, target, duration = 1200) => {
      const startTime = performance.now();
      const ease = t => t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
      const step = (now) => {
        const elapsed = now - startTime;
        const progress = Math.min(elapsed / duration, 1);
        const value = Math.round(target * ease(progress));
        el.textContent = formatRupiah(value);
        if (progress < 1) requestAnimationFrame(step);
      };
      requestAnimationFrame(step);
    };

    const user = await get(stores.USERS, 'me');
    const txs = await getAll(stores.TRANSACTIONS) || [];
    let currentBalance = 0;

    if (user) {
      document.getElementById('home-name').textContent = user.name;
      currentBalance = user.current_balance;

      const balanceEl = document.getElementById('home-balance');
      if (!hasEnteredHomeBefore) {
        // Kunjungan pertama: animasikan angka saldo naik dari 0.
        animateCountUp(balanceEl, currentBalance);
      } else {
        // Kunjungan berikutnya: langsung tampil final, tanpa animasi.
        balanceEl.textContent = formatRupiah(currentBalance);
      }

      if (user.photo) {
        document.getElementById('home-avatar').src = user.photo;
      }
    }

    document.getElementById('btn-settings').addEventListener('click', async () => {
      const { navigate } = await import('../main.js');
      navigate('settings');
    });

    const now = new Date();
    const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

    let totalExpense30d = 0;
    let totalIncome30d = 0;

    txs.forEach(tx => {
      const txDate = new Date(tx.date);
      if (txDate >= thirtyDaysAgo) {
        if (tx.type === 'expense') totalExpense30d += tx.amount;
        else if (tx.type === 'income') totalIncome30d += tx.amount;
      }
    });

    // 1. Prediction calculation
    const avgDailyExpense = totalExpense30d / 30;
    let predText = "Aman";
    let predDate = "-";
    let daysLeft = -1;

    if (currentBalance <= 0) {
      predText = "Saldo kosong atau minus";
      predDate = "Hari Ini";
    } else if (avgDailyExpense > 0) {
      daysLeft = Math.floor(currentBalance / avgDailyExpense);
      if (daysLeft > 365) {
        predText = "Aman untuk lebih dari 1 tahun";
        predDate = "> 1 Tahun";
      } else {
        const pDate = new Date(now.getTime() + daysLeft * 24 * 60 * 60 * 1000);
        predText = `${daysLeft} Hari Lagi`;
        predDate = pDate.toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' });
      }
    } else {
      predText = "Belum ada pengeluaran rutin";
      predDate = "Aman Panjang";
    }

    document.getElementById('home-prediction').textContent = predDate;
    document.getElementById('home-prediction-desc').textContent = predText;

    // 2. Financial Mood Logic
    let ratio = 0;
    let baseAmount = totalIncome30d > 0 ? totalIncome30d : (user ? user.initial_balance : 0);
    if (baseAmount > 0) {
      ratio = totalExpense30d / baseAmount;
    }

    let moodText = "Sangat Stabil";
    let moodDesc = "Kondisi keuanganmu sehat.";
    let moodIcon = "😎";
    let moodColorClass = "text-primary";
    let moodBgClass = "bg-primary-container";

    if (ratio >= 0.9 || (currentBalance <= 0 && totalExpense30d > 0)) {
      moodText = "Bahaya";
      moodDesc = "Pengeluaran sangat tinggi. Hati-hati!";
      moodIcon = "😱";
      moodColorClass = "text-error";
      moodBgClass = "bg-error-container";
    } else if (ratio >= 0.7) {
      moodText = "Waspada";
      moodDesc = "Mulai kurangi pengeluaran yang tidak perlu.";
      moodIcon = "🤔";
      moodColorClass = "text-tertiary";
      moodBgClass = "bg-tertiary-container";
    } else if (ratio >= 0.5) {
      moodText = "Cukup Aman";
      moodDesc = "Pengeluaran masih terkendali.";
      moodIcon = "🙂";
      moodColorClass = "text-secondary";
      moodBgClass = "bg-secondary-container";
    } else if (ratio < 0.3 && totalExpense30d > 0) {
      moodText = "Sangat Hemat";
      moodDesc = "Wow, kamu sangat pandai menabung!";
      moodIcon = "🤩";
      moodColorClass = "text-primary";
      moodBgClass = "bg-primary-container";
    }

    const moodBgEl = document.getElementById('mood-bg');
    if (moodBgEl) {
      moodBgEl.className = `absolute -bottom-10 -right-10 w-32 h-32 rounded-full opacity-20 ${moodBgClass}`;
    }

    const moodTextEl = document.getElementById('mood-text');
    if (moodTextEl) {
      moodTextEl.textContent = moodText;
      moodTextEl.className = `text-3xl font-black ${moodColorClass}`;
    }
    const moodDescEl = document.getElementById('mood-desc');
    if (moodDescEl) {
      moodDescEl.textContent = moodDesc;
    }

    // 3. Heatmap Generation
    const heatmapGrid = document.getElementById('heatmap-grid');
    const heatmapDetail = document.getElementById('heatmap-detail');
    let heatmapHTML = '';

    // Generating for last 70 days (14 cols x 5 rows)
    for (let i = 69; i >= 0; i--) {
      const d = new Date(now.getTime() - i * 24 * 60 * 60 * 1000);
      const localDateStr = new Date(d.getTime() - d.getTimezoneOffset() * 60000).toISOString().split('T')[0];
      const displayDateStr = d.toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' });

      let count = 0;
      txs.forEach(tx => {
        if (tx.date === localDateStr) count++;
      });

      let colorClass = 'bg-surface-variant/40';
      if (count >= 4) colorClass = 'bg-[#00a382] shadow-[0_0_8px_rgba(0,184,148,0.4)]';
      else if (count >= 3) colorClass = 'bg-secondary';
      else if (count >= 2) colorClass = 'bg-[#55efc4]'; // secondary-container
      else if (count >= 1) colorClass = 'bg-[#55efc4]/50';

      heatmapHTML += `<div class="w-4 h-4 rounded-[3px] ${colorClass} transition-colors cursor-pointer hover:ring-2 ring-primary/50" data-date="${displayDateStr}" data-count="${count}"></div>`;
    }
    heatmapGrid.innerHTML = heatmapHTML;

    heatmapGrid.onclick = (e) => {
      if (e.target.dataset.date) {
        const date = e.target.dataset.date;
        const count = e.target.dataset.count;
        heatmapDetail.classList.remove('hidden');
        heatmapDetail.innerHTML = `<span class="font-bold text-on-surface">${count} transaksi</span> tercatat pada ${date}`;
      }
    };

    const heatmapScroll = document.getElementById('heatmap-scroll');
    if (heatmapScroll) {
      heatmapScroll.scrollLeft = heatmapScroll.scrollWidth;
    }

    const monthNames = ["JAN", "FEB", "MAR", "APR", "MEI", "JUN", "JUL", "AGU", "SEP", "OKT", "NOV", "DES"];
    document.getElementById('cal-month').textContent = monthNames[now.getMonth()];
    document.getElementById('cal-date').textContent = now.getDate();

    // 4. Render Goals (Tabungan Saya)
    const goals = await getAll(stores.SAVING_GOALS) || [];
    const goalsListEl = document.getElementById('home-goals-list');

    if (goals.length === 0) {
      goalsListEl.innerHTML = `
          <div class="w-full py-8 flex flex-col items-center justify-center text-center opacity-50 border-2 border-dashed border-outline-variant rounded-[24px]">
             <span class="material-symbols-outlined text-[32px] mb-2 text-outline">savings</span>
             <p class="font-body-sm text-on-surface-variant">Belum ada target tabungan</p>
          </div>
       `;
    } else {
      let goalsHTML = '';
      goals.forEach(goal => {
        let percentage = 0;
        if (goal.target_amount > 0) {
          percentage = Math.min(100, Math.round(((goal.current_progress || 0) / goal.target_amount) * 100));
        }

        // Generate an elegant gradient based on goal ID for the "photo"
        const gradients = [
          'from-primary-container to-secondary-container',
          'from-secondary-container to-tertiary-container',
          'from-tertiary-container to-primary-container',
          'from-surface-dim to-outline-variant'
        ];
        const bgGradient = gradients[(goal.id || 0) % gradients.length];
        goalsHTML += `
            <div class="min-w-[240px] w-[240px] clay-surface rounded-[24px] p-4 flex flex-col gap-3 snap-center shrink-0 cursor-pointer active:scale-95 transition-transform nav-btn" data-nav="goalDetail" data-id="${goal.id}">
               <div class="h-28 rounded-[16px] bg-gradient-to-br ${bgGradient} mb-2 overflow-hidden relative flex items-center justify-center shadow-inner">
                  <span class="material-symbols-outlined text-[48px] text-white/50 mix-blend-overlay">photo_library</span>
               </div>
               <div>
                 <h3 class="font-title-md text-on-surface truncate">${goal.name}</h3>
                 <p class="font-label-sm text-on-surface-variant">${formatRupiah(goal.target_amount)}</p>
               </div>
               <div class="w-full bg-surface-variant rounded-full h-2.5 mt-auto overflow-hidden">
                 <div class="bg-primary h-full rounded-full transition-all duration-1000" style="width: ${percentage}%"></div>
               </div>
               <div class="flex justify-between items-center">
                 <p class="font-label-sm text-on-surface-variant text-[10px]">Terkumpul ${formatRupiah(goal.current_progress || 0)}</p>
                 <p class="font-label-sm text-primary font-bold">${percentage}%</p>
               </div>
            </div>
          `;
      });
      goalsListEl.innerHTML = goalsHTML;
    }

    // Navigasi ke goalDetail saat card tabungan diklik.
    // Pakai event delegation karena card dibuat dinamis (innerHTML),
    // jadi listener global di main.js (dipasang sekali saat init app)
    // tidak otomatis nempel ke elemen yang baru dibuat ini.
    goalsListEl.addEventListener('click', async (e) => {
      const card = e.target.closest('[data-nav="goalDetail"]');
      if (!card) return;
      const { navigate } = await import('../main.js');
      navigate('goalDetail', { id: card.dataset.id });
    });

    // Tandai Beranda sudah pernah dimasuki, supaya animasi stagger
    // & count-up saldo tidak diputar ulang di kunjungan berikutnya.
    hasEnteredHomeBefore = true;
  }
};