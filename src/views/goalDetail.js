import { get, put, stores } from '../db.js';
import { formatRupiah, showToast } from '../utils.js';

export const goalDetailView = {
  render: () => `
    <div class="w-full min-h-full flex flex-col bg-surface-bright pb-32">
      <div class="px-6 pt-6 pb-3 sticky top-0 z-30">
        <div class="clay-surface bg-surface-bright/90 backdrop-blur-md rounded-[32px] px-4 py-4 flex items-center gap-4 h-20">
          <button id="btn-back-goal" class="w-10 h-10 shrink-0 rounded-full bg-surface-variant flex items-center justify-center text-on-surface-variant transition-transform active:scale-95">
            <span class="material-symbols-outlined">arrow_back</span>
          </button>
          <h1 class="font-headline-lg text-on-surface flex-1 truncate" id="gd-title">Detail Target</h1>
        </div>
      </div>

      <div class="px-6 flex flex-col gap-6 pt-0">
        
        <!-- Goal Info Card -->
        <div class="clay-surface p-6 flex flex-col gap-4 relative overflow-hidden" id="gd-card">
          <div class="flex justify-between items-end relative z-10">
             <div>
               <p class="text-xs font-bold uppercase tracking-widest text-outline mb-1">Terkumpul</p>
               <h2 class="text-3xl font-black text-primary" id="gd-current">Rp0</h2>
             </div>
             <div class="text-right">
               <p class="text-[10px] font-bold uppercase tracking-widest text-outline mb-1">Target</p>
               <p class="font-bold text-on-surface-variant" id="gd-target">Rp0</p>
             </div>
          </div>

          <!-- Progress -->
          <div class="relative z-10 mt-2">
            <div class="flex justify-between mb-1">
              <span class="text-xs font-bold text-outline">Progres</span>
              <span class="text-xs font-bold text-primary" id="gd-progress-text">0%</span>
            </div>
            <div class="w-full h-4 bg-surface-variant/50 rounded-full overflow-hidden backdrop-blur-sm">
              <div class="h-full bg-primary rounded-full transition-all duration-1000" id="gd-progress-bar" style="width: 0%"></div>
            </div>
          </div>
          
          <div id="gd-deco" class="absolute -bottom-10 -right-10 w-32 h-32 bg-primary-container/20 rounded-full blur-xl z-0 pointer-events-none"></div>
          <img id="gd-image" class="absolute inset-0 w-full h-full object-cover opacity-20 z-0 hidden pointer-events-none" />
        </div>

        <!-- Add Photo -->
        <div class="clay-surface-sm p-4 relative overflow-hidden group cursor-pointer transition-colors hover:bg-surface-variant/50">
           <input type="file" id="gd-photo-input" accept="image/*" class="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-20" />
           <div class="flex items-center gap-3 relative z-10">
             <div class="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary group-hover:scale-110 transition-transform">
               <span class="material-symbols-outlined">add_a_photo</span>
             </div>
             <div>
               <p class="font-bold text-on-surface">Ubah Foto Target</p>
               <p class="text-xs text-on-surface-variant">Biar makin semangat nabung</p>
             </div>
           </div>
        </div>

        <!-- Update Progress -->
        <div class="clay-surface p-5">
           <h3 class="font-bold text-on-surface mb-4">Catat Tabungan</h3>
           
           <div class="flex bg-surface-container-highest rounded-xl p-1.5 mb-4 relative">
             <div id="gd-type-indicator" class="absolute top-1.5 bottom-1.5 left-1.5 w-[calc(50%-6px)] bg-secondary rounded-xl transition-all duration-300 shadow-md"></div>
             <button id="gd-type-in" class="flex-1 py-2.5 rounded-xl font-bold text-sm text-white z-10 transition-colors">Nabung</button>
             <button id="gd-type-out" class="flex-1 py-2.5 rounded-xl font-bold text-sm text-on-surface-variant z-10 transition-colors">Ambil</button>
           </div>
           
           <div class="flex items-center bg-surface-bright rounded-xl p-3 border border-outline-variant/50 focus-within:border-primary/50 mb-4 transition-colors">
             <span class="font-bold text-on-surface mr-2">Rp</span>
             <input type="number" id="gd-amount" placeholder="0" class="w-full font-bold text-on-surface outline-none bg-transparent" />
           </div>
           
           <button id="gd-save" class="w-full py-3.5 rounded-xl font-bold text-on-surface clay-button opacity-50 pointer-events-none transition-all active:scale-95 shadow-md shadow-secondary/20">
             Simpan
           </button>
        </div>
        
        <!-- History -->
        <div class="clay-surface-sm p-5 mt-2">
           <h3 class="font-bold text-on-surface mb-4">Riwayat Tabungan</h3>
           <div id="gd-history" class="flex flex-col gap-4">
             <!-- Populated dynamically -->
           </div>
        </div>

      </div>
    </div>
  `,
  init: async (params) => {
    if (!params || !params.id) {
       const { navigate } = await import('../main.js');
       navigate('goals');
       return;
    }

    const btnBack = document.getElementById('btn-back-goal');
    btnBack.addEventListener('click', async () => {
       const { navigate } = await import('../main.js');
       navigate('goals');
    });

    let goal = await get(stores.SAVING_GOALS, params.id);
    if (!goal) return;
    
    // Elements
    const elTitle = document.getElementById('gd-title');
    const elCurrent = document.getElementById('gd-current');
    const elTarget = document.getElementById('gd-target');
    const elProgText = document.getElementById('gd-progress-text');
    const elProgBar = document.getElementById('gd-progress-bar');
    const elImage = document.getElementById('gd-image');
    
    const photoInput = document.getElementById('gd-photo-input');
    const btnTypeIn = document.getElementById('gd-type-in');
    const btnTypeOut = document.getElementById('gd-type-out');
    const typeIndicator = document.getElementById('gd-type-indicator');
    const inputAmount = document.getElementById('gd-amount');
    const btnSave = document.getElementById('gd-save');
    const elHistory = document.getElementById('gd-history');
    
    let currentType = 'in';

    const renderGoal = () => {
      elTitle.textContent = goal.name;
      elCurrent.textContent = formatRupiah(goal.current_progress);
      elTarget.textContent = formatRupiah(goal.target_amount);
      
      const progress = Math.min((goal.current_progress / goal.target_amount) * 100, 100);
      elProgText.textContent = `${Math.round(progress)}%`;
      setTimeout(() => {
        elProgBar.style.width = `${progress}%`;
      }, 100);
      
      if (goal.image) {
        elImage.src = goal.image;
        elImage.classList.remove('hidden');
      } else {
        elImage.classList.add('hidden');
      }
      
      if (goal.history && goal.history.length > 0) {
        // sort desc
        const sorted = [...goal.history].sort((a, b) => b.timestamp - a.timestamp);
        elHistory.innerHTML = sorted.map(h => {
          const isOut = h.type === 'out';
          const color = isOut ? 'error' : 'secondary';
          const icon = isOut ? 'arrow_downward' : 'arrow_upward';
          const dateStr = new Date(h.timestamp).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' });
          return `
            <div class="flex items-center justify-between border-b border-outline-variant/30 pb-3 last:border-0 last:pb-0">
              <div class="flex items-center gap-3">
                <div class="w-8 h-8 rounded-full bg-${color}/10 flex items-center justify-center text-${color}">
                  <span class="material-symbols-outlined text-[18px]">${icon}</span>
                </div>
                <div>
                  <p class="font-bold text-sm text-on-surface">${isOut ? 'Ambil' : 'Nabung'}</p>
                  <p class="text-[10px] text-outline">${dateStr}</p>
                </div>
              </div>
              <p class="font-bold text-sm text-${color}">${isOut ? '-' : '+'}${formatRupiah(h.amount)}</p>
            </div>
          `;
        }).join('');
      } else {
        elHistory.innerHTML = `<p class="text-sm text-outline text-center py-4">Belum ada riwayat</p>`;
      }
    };
    
    renderGoal();
    
    photoInput.addEventListener('change', (e) => {
      const file = e.target.files[0];
      if (file) {
        const reader = new FileReader();
        reader.onload = async (ev) => {
          goal.image = ev.target.result;
          await put(stores.SAVING_GOALS, goal);
          renderGoal();
          showToast('Foto target berhasil diperbarui');
        };
        reader.readAsDataURL(file);
      }
    });

    btnTypeIn.addEventListener('click', () => {
      currentType = 'in';
      btnTypeIn.classList.add('text-white');
      btnTypeIn.classList.remove('text-on-surface-variant');
      btnTypeOut.classList.add('text-on-surface-variant');
      btnTypeOut.classList.remove('text-white');
      typeIndicator.style.transform = 'translateX(0)';
      typeIndicator.className = 'absolute top-1.5 bottom-1.5 left-1.5 w-[calc(50%-6px)] bg-secondary rounded-xl transition-all duration-300 shadow-md';
      
      btnSave.className = 'w-full py-3.5 rounded-xl font-bold text-on-surface clay-button transition-all active:scale-95 shadow-md shadow-secondary/20';
      if (!inputAmount.value) btnSave.classList.add('opacity-50', 'pointer-events-none');
    });

    btnTypeOut.addEventListener('click', () => {
      currentType = 'out';
      btnTypeOut.classList.add('text-white');
      btnTypeOut.classList.remove('text-on-surface-variant');
      btnTypeIn.classList.add('text-on-surface-variant');
      btnTypeIn.classList.remove('text-white');
      typeIndicator.style.transform = 'translateX(100%)';
      typeIndicator.className = 'absolute top-1.5 bottom-1.5 left-1.5 w-[calc(50%-6px)] bg-error rounded-xl transition-all duration-300 shadow-md';
      
      btnSave.className = 'w-full py-3.5 rounded-xl font-bold text-on-surface clay-button transition-all active:scale-95 shadow-md shadow-error/20';
      if (!inputAmount.value) btnSave.classList.add('opacity-50', 'pointer-events-none');
    });
    
    inputAmount.addEventListener('input', () => {
       if (Number(inputAmount.value) > 0) {
         btnSave.classList.remove('opacity-50', 'pointer-events-none');
       } else {
         btnSave.classList.add('opacity-50', 'pointer-events-none');
       }
    });
    
    btnSave.addEventListener('click', async () => {
       const amount = Number(inputAmount.value);
       if (amount <= 0) return;
       
       if (currentType === 'out' && amount > goal.current_progress) {
         showToast('Uang yang diambil melebihi saldo tabungan', 'error');
         return;
       }
       
       if (currentType === 'in') {
         goal.current_progress += amount;
       } else {
         goal.current_progress -= amount;
       }
       
       if (!goal.history) goal.history = [];
       goal.history.push({
         id: Date.now().toString(),
         type: currentType,
         amount: amount,
         timestamp: Date.now()
       });
       
       await put(stores.SAVING_GOALS, goal);
       inputAmount.value = '';
       btnSave.classList.add('opacity-50', 'pointer-events-none');
       showToast(currentType === 'in' ? 'Berhasil mencatat tabungan' : 'Berhasil mengambil tabungan');
       renderGoal();
    });
  }
};
