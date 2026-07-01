import { getAll, put, stores } from '../db.js';
import { formatRupiah, showToast } from '../utils.js';

export const goalsView = {
  render: () => `
    <div class="w-full min-h-full flex flex-col bg-surface-bright pb-32">
      <div class="px-6 pt-6 pb-3 sticky top-0 z-50">
        <div class="clay-surface bg-surface-bright/90 backdrop-blur-md rounded-[32px] px-6 py-4 flex justify-between items-center h-20">
          <div class="overflow-hidden">
            <h1 class="font-headline-lg text-on-surface truncate">Target Tabungan</h1>
            <p class="font-body-sm text-on-surface-variant truncate">Mewujudkan impianmu.</p>
          </div>
          <button id="add-goal-btn" class="w-10 h-10 shrink-0 rounded-full bg-surface-variant text-on-surface flex items-center justify-center clay-button active:scale-95 transition-transform">
            <span class="material-symbols-outlined text-[24px]">add</span>
          </button>
        </div>
      </div>

      <div class="px-6 flex flex-col gap-6 pt-0" id="goals-list">
        <!-- List goes here -->
      </div>

      <!-- Add Goal Modal -->
      <div id="goal-modal" class="fixed inset-0 bg-inverse-surface/40 backdrop-blur-sm z-[60] flex items-end sm:items-center justify-center opacity-0 pointer-events-none transition-opacity">
        <div class="bg-surface-bright w-full sm:w-[400px] rounded-t-[2rem] sm:rounded-[2rem] p-6 pb-28 sm:pb-6 flex flex-col gap-4 transform translate-y-full sm:translate-y-10 transition-transform" id="goal-modal-content">
          <div class="flex justify-between items-center mb-2">
            <h2 class="font-headline-lg-mobile text-on-surface">Nabung Buat Apa?</h2>
            <button id="close-goal-modal" class="text-outline"><span class="material-symbols-outlined">close</span></button>
          </div>
          
          <input type="text" id="goal-name" placeholder="Nama target (misal: Laptop Baru)" class="w-full clay-surface-sm p-4 font-body-lg text-on-surface bg-transparent outline-none" />
          
          <div class="clay-surface-sm p-4 flex items-center bg-transparent">
            <span class="font-title-md text-on-surface-variant mr-2">Rp</span>
            <input type="number" id="goal-target" placeholder="Target nominal" class="w-full font-title-md text-on-surface outline-none bg-transparent" />
          </div>

          <div class="clay-surface-sm p-4 flex items-center bg-transparent">
            <span class="font-title-md text-on-surface-variant mr-2">Rp</span>
            <input type="number" id="goal-current" placeholder="Sudah terkumpul (opsional)" class="w-full font-title-md text-on-surface outline-none bg-transparent" />
          </div>
          
          <button id="save-goal" class="clay-button text-on-surface w-full py-4 rounded-full font-title-md mt-4 opacity-50 pointer-events-none">
            Simpan Target
          </button>
        </div>
      </div>
    </div>
  `,
  init: async () => {
    const list = document.getElementById('goals-list');
    const modal = document.getElementById('goal-modal');
    const modalContent = document.getElementById('goal-modal-content');
    const btnAdd = document.getElementById('add-goal-btn');
    const btnClose = document.getElementById('close-goal-modal');
    const btnSave = document.getElementById('save-goal');

    const inputName = document.getElementById('goal-name');
    const inputTarget = document.getElementById('goal-target');
    const inputCurrent = document.getElementById('goal-current');

    const loadGoals = async () => {
      let goals = await getAll(stores.SAVING_GOALS);
      if (!goals || goals.length === 0) {
        list.innerHTML = `
          <div class="flex flex-col items-center justify-center py-20 text-center opacity-50">
            <img src="/assets/images/saving-goal.png" class="w-32 mb-4 opacity-50" onerror="this.style.display='none'"/>
            <span class="material-symbols-outlined text-[64px] mb-4 text-outline" style="${goals ? '' : 'display:none;'}">savings</span>
            <p class="font-title-md text-on-surface">Belum ada target</p>
            <p class="font-body-sm text-on-surface-variant">Tambahkan target pertamamu!</p>
          </div>
        `;
        return;
      }

      list.innerHTML = goals.map(g => {
        const progress = Math.min((g.current_progress / g.target_amount) * 100, 100);
        return `
          <div class="clay-surface p-5 relative overflow-hidden group cursor-pointer transition-transform active:scale-95 goal-item" data-id="${g.id}">
            ${g.image ? `<img src="${g.image}" class="absolute inset-0 w-full h-full object-cover opacity-20 z-0" />` : ''}
            <div class="flex justify-between items-end mb-2 relative z-10">
              <h3 class="font-title-md text-on-surface">${g.name}</h3>
              <span class="font-label-md text-primary">${Math.round(progress)}%</span>
            </div>
            
            <!-- Progress Bar -->
            <div class="w-full h-4 bg-surface-variant/50 rounded-full mb-3 relative z-10 overflow-hidden backdrop-blur-sm">
              <div class="h-full bg-primary rounded-full transition-all duration-1000" style="width: ${progress}%"></div>
            </div>
            
            <div class="flex justify-between items-center relative z-10">
              <span class="font-body-sm text-on-surface-variant">${formatRupiah(g.current_progress)}</span>
              <span class="font-label-md text-outline">Target: ${formatRupiah(g.target_amount)}</span>
            </div>
            
            <!-- Deco -->
            ${!g.image ? `<div class="absolute -bottom-6 -right-6 w-24 h-24 bg-primary-container/20 rounded-full blur-xl z-0 pointer-events-none"></div>` : ''}
          </div>
        `;
      }).join('');

      document.querySelectorAll('.goal-item').forEach(el => {
        el.addEventListener('click', async () => {
          const { navigate } = await import('../main.js');
          navigate('goalDetail', { id: el.dataset.id });
        });
      });
    };

    const validate = () => {
      if (inputName.value.trim() !== '' && Number(inputTarget.value) > 0) {
        btnSave.classList.remove('opacity-50', 'pointer-events-none');
      } else {
        btnSave.classList.add('opacity-50', 'pointer-events-none');
      }
    };

    inputName.addEventListener('input', validate);
    inputTarget.addEventListener('input', validate);

    btnAdd.addEventListener('click', () => {
      modal.classList.remove('opacity-0', 'pointer-events-none');
      setTimeout(() => {
        modalContent.classList.remove('translate-y-full', 'sm:translate-y-10');
        modalContent.classList.add('translate-y-0');
      }, 50);
    });

    const closeModal = () => {
      modalContent.classList.add('translate-y-full', 'sm:translate-y-10');
      modalContent.classList.remove('translate-y-0');
      setTimeout(() => {
        modal.classList.add('opacity-0', 'pointer-events-none');
        inputName.value = '';
        inputTarget.value = '';
        inputCurrent.value = '';
        validate();
      }, 300);
    };

    btnClose.addEventListener('click', closeModal);
    modal.addEventListener('click', (e) => {
      if (e.target === modal) closeModal();
    });

    btnSave.addEventListener('click', async () => {
      const g = {
        id: new Date().getTime().toString(),
        name: inputName.value.trim(),
        target_amount: Number(inputTarget.value),
        current_progress: Number(inputCurrent.value) || 0,
        createdAt: new Date().getTime(),
        history: []
      };
      await put(stores.SAVING_GOALS, g);
      showToast('Target berhasil ditambahkan');
      closeModal();
      loadGoals();
    });

    loadGoals();
  }
};