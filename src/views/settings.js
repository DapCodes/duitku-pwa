import { get, getAll, put, clear, stores, clearBackup, forceBackup } from '../db.js';
import { showToast, compressImage } from '../utils.js';

export const settingsView = {
  render: () => `
    <div class="w-full min-h-full flex flex-col bg-surface-bright pb-32">
      <div class="px-6 pt-6 pb-3 sticky top-0 z-50">
        <div class="clay-surface bg-surface-bright/90 backdrop-blur-md rounded-[32px] px-4 py-4 flex items-center gap-4 h-20">
          <button id="btn-back" class="w-10 h-10 shrink-0 rounded-full bg-surface-variant flex items-center justify-center text-on-surface-variant transition-transform active:scale-95">
            <span class="material-symbols-outlined">arrow_back</span>
          </button>
          <h1 class="font-headline-lg text-on-surface truncate">Profil & Pengaturan</h1>
        </div>
      </div>

      <div class="px-6 flex flex-col gap-6 pt-0">
        
        <!-- Profile Edit -->
        <div class="clay-surface p-6 flex flex-col items-center gap-4 relative overflow-hidden group">
           <input type="file" id="set-photo-input" accept="image/*" class="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-20" />
           <div class="w-24 h-24 bg-primary-container rounded-full flex items-center justify-center relative overflow-hidden clay-inset border-4 border-surface-bright transition-transform group-hover:scale-105">
             <img id="set-photo-preview" class="absolute inset-0 w-full h-full object-cover hidden z-10" />
             <span class="material-symbols-outlined text-primary text-[40px] z-0" id="set-photo-icon">person</span>
             <div class="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity z-10">
               <span class="material-symbols-outlined text-white">edit</span>
             </div>
           </div>
           
           <div class="w-full relative z-30">
             <label class="text-xs font-bold uppercase tracking-widest text-outline mb-1 block">Nama Panggilan</label>
             <input type="text" id="set-input-name" class="w-full bg-surface-variant/30 rounded-xl px-4 py-3 text-on-surface outline-none focus:ring-2 ring-primary/50 transition-all font-bold" />
           </div>
           
           <div class="w-full relative z-30">
             <label class="text-xs font-bold uppercase tracking-widest text-outline mb-1 block">Username</label>
             <div class="relative">
               <span class="absolute left-4 top-1/2 -translate-y-1/2 text-outline font-bold">@</span>
               <input type="text" id="set-input-username" placeholder="username_kamu" class="w-full bg-surface-variant/30 rounded-xl pl-9 pr-4 py-3 text-on-surface outline-none focus:ring-2 ring-primary/50 transition-all font-bold lowercase" />
             </div>
             <p class="text-[10px] text-error mt-1 hidden" id="set-username-error">Username hanya boleh huruf, angka, garis bawah (_), dan titik (.).</p>
           </div>
           
           <button id="btn-save-profile" class="w-full py-3.5 rounded-xl font-bold text-on-surface clay-button transition-all active:scale-95 shadow-md shadow-primary/20 opacity-50 pointer-events-none mt-2 relative z-30">
             Simpan Profil
           </button>
           
           <div class="absolute -bottom-12 -right-12 w-40 h-40 bg-primary-container/20 rounded-full blur-2xl z-0 pointer-events-none"></div>
        </div>

        <h3 class="font-label-md text-outline mt-2 ml-2 uppercase tracking-wider font-bold">Pencadangan Data</h3>
        
        <button id="btn-export" class="clay-surface-sm p-4 flex justify-between items-center w-full text-left transition-transform active:scale-[0.98]">
          <div class="flex items-center gap-3">
            <div class="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary">
              <span class="material-symbols-outlined">download</span>
            </div>
            <div>
              <span class="font-bold text-on-surface block">Ekspor Data (Backup)</span>
              <span class="text-xs font-medium text-on-surface-variant block mt-0.5">Simpan ke file JSON</span>
            </div>
          </div>
          <span class="material-symbols-outlined text-outline">chevron_right</span>
        </button>

        <label for="btn-import" class="clay-surface-sm p-4 flex justify-between items-center w-full text-left cursor-pointer transition-transform active:scale-[0.98]">
          <div class="flex items-center gap-3">
            <div class="w-10 h-10 rounded-full bg-tertiary/10 flex items-center justify-center text-tertiary">
              <span class="material-symbols-outlined">upload</span>
            </div>
            <div>
              <span class="font-bold text-on-surface block">Impor Data (Restore)</span>
              <span class="text-xs font-medium text-on-surface-variant block mt-0.5">Pulihkan dari file JSON</span>
            </div>
          </div>
          <span class="material-symbols-outlined text-outline">chevron_right</span>
        </label>
        <input type="file" id="btn-import" accept=".json" class="hidden" />
        
        <button id="btn-reset" class="clay-surface-sm p-4 flex justify-between items-center w-full text-left mt-4 border-2 border-error/20 bg-error/5 hover:bg-error/10 transition-all active:scale-[0.98]">
          <div class="flex items-center gap-3">
            <div class="w-10 h-10 rounded-full bg-error/10 flex items-center justify-center text-error">
              <span class="material-symbols-outlined">delete_forever</span>
            </div>
            <span class="font-bold text-error block">Hapus Semua Data</span>
          </div>
        </button>

        <!-- Copyright Footer -->
        <div class="w-full text-center mt-12 mb-6">
          <p class="text-[11px] font-bold text-outline uppercase tracking-widest">
            dibuat oleh 
            <a href="https://github.com/DapCodes" target="_blank" rel="noopener noreferrer" class="text-primary hover:underline transition-all">
              DapCodes
            </a>
          </p>
        </div>

      </div>

      <!-- Reset Data Modal -->
      <div id="reset-modal" class="fixed inset-0 z-[100] hidden bg-black/50 backdrop-blur-sm items-center justify-center px-6 transition-opacity duration-300">
        <div class="bg-surface-bright rounded-3xl p-6 w-full max-w-sm shadow-xl flex flex-col gap-4">
          <div class="w-12 h-12 rounded-full bg-error/10 flex items-center justify-center text-error mx-auto mb-2">
            <span class="material-symbols-outlined text-[28px]">warning</span>
          </div>
          <h3 class="font-headline-sm text-center text-on-surface">Reset Semua Data?</h3>
          <p class="font-body-md text-center text-on-surface-variant">
            Aksi ini akan menghapus semua riwayat transaksi, target tabungan, dan profil kamu secara permanen.
          </p>
          
          <label class="flex items-center gap-3 p-3 bg-surface-container rounded-xl cursor-pointer mt-2 border border-outline-variant">
            <input type="checkbox" id="reset-checkbox" class="w-5 h-5 rounded border-outline text-error accent-error cursor-pointer">
            <span class="font-label-md text-on-surface">Hapus semua data dengan data user?</span>
          </label>
          
          <div class="flex gap-3 mt-4">
            <button id="reset-cancel" class="flex-1 py-3 rounded-full font-label-lg text-on-surface bg-surface-variant transition-colors active:bg-surface-variant/80">
              Batal
            </button>
            <button id="reset-confirm" class="flex-1 py-3 rounded-full font-label-lg text-white bg-error opacity-50 pointer-events-none transition-all active:scale-95 shadow-md shadow-error/20">
              Ya, Hapus
            </button>
          </div>
        </div>
      </div>

    </div>
  `,
  init: async () => {
    // Basic init
    const user = await get(stores.USERS, 'me');
    
    const inputName = document.getElementById('set-input-name');
    const inputUsername = document.getElementById('set-input-username');
    const usernameError = document.getElementById('set-username-error');
    const btnSaveProfile = document.getElementById('btn-save-profile');
    const photoInput = document.getElementById('set-photo-input');
    const photoPreview = document.getElementById('set-photo-preview');
    const photoIcon = document.getElementById('set-photo-icon');
    
    let currentPhoto = user?.photo || null;

    if (user) {
      inputName.value = user.name || '';
      inputUsername.value = user.username || '';
      if (user.photo) {
        photoPreview.src = user.photo;
        photoPreview.classList.remove('hidden');
        photoIcon.classList.add('hidden');
      }
    }
    
    const validateProfile = () => {
      let isValid = true;
      const name = inputName.value.trim();
      const username = inputUsername.value.trim();
      
      // regex for username: letters, numbers, dot, underscore
      const usernameRegex = /^[a-zA-Z0-9_.]+$/;
      
      if (!usernameRegex.test(username) && username !== '') {
         usernameError.classList.remove('hidden');
         isValid = false;
      } else {
         usernameError.classList.add('hidden');
      }
      
      if (name === '' || username === '') isValid = false;
      
      const hasChanges = name !== (user?.name || '') || username !== (user?.username || '') || currentPhoto !== (user?.photo || null);
      
      if (isValid && hasChanges) {
        btnSaveProfile.classList.remove('opacity-50', 'pointer-events-none');
      } else {
        btnSaveProfile.classList.add('opacity-50', 'pointer-events-none');
      }
    };
    
    inputName.addEventListener('input', validateProfile);
    inputUsername.addEventListener('input', (e) => {
      e.target.value = e.target.value.toLowerCase();
      validateProfile();
    });
    
    photoInput.addEventListener('change', async (e) => {
      const file = e.target.files[0];
      if (file) {
        try {
          const compressed = await compressImage(file, 256, 256, 0.7);
          currentPhoto = compressed;
          photoPreview.src = currentPhoto;
          photoPreview.classList.remove('hidden');
          photoIcon.classList.add('hidden');
          validateProfile();
        } catch (err) {
          console.error('[Settings] Image compression failed:', err);
          showToast('Gagal memproses foto', 'error');
        }
      }
    });
    
    btnSaveProfile.addEventListener('click', async () => {
       const updatedUser = {
         ...(user || { id: 'me' }),
         name: inputName.value.trim(),
         username: inputUsername.value.trim(),
         photo: currentPhoto
       };
       await put(stores.USERS, updatedUser);
       showToast('Profil berhasil disimpan');
       btnSaveProfile.classList.add('opacity-50', 'pointer-events-none');
       
       // Update user object reference
       Object.assign(user, updatedUser);
       validateProfile();
    });

    document.getElementById('btn-back').addEventListener('click', async () => {
      const { navigate } = await import('../main.js');
      navigate('home');
    });

    // Export
    document.getElementById('btn-export').addEventListener('click', async () => {
      const data = {
        users: await getAll(stores.USERS),
        transactions: await getAll(stores.TRANSACTIONS),
        goals: await getAll(stores.SAVING_GOALS)
      };
      
      const blob = new Blob([JSON.stringify(data)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `uang-kemana-backup-${new Date().toISOString().split('T')[0]}.json`;
      a.click();
      URL.revokeObjectURL(url);
      showToast('Data berhasil diekspor');
    });

    // Import
    document.getElementById('btn-import').addEventListener('change', (e) => {
      const file = e.target.files[0];
      if (!file) return;
      const reader = new FileReader();
      reader.onload = async (ev) => {
        try {
          const data = JSON.parse(ev.target.result);
          if (data.users && data.transactions && data.goals) {
            
            await clear(stores.USERS);
            await clear(stores.TRANSACTIONS);
            await clear(stores.SAVING_GOALS);
            
            for (const u of data.users) await put(stores.USERS, u);
            for (const t of data.transactions) await put(stores.TRANSACTIONS, t);
            for (const g of data.goals) await put(stores.SAVING_GOALS, g);
            
            // Immediately backup imported data to localStorage
            await forceBackup();
            
            showToast('Data berhasil dipulihkan');
            setTimeout(async () => {
              const { navigate } = await import('../main.js');
              navigate('home');
            }, 1000);
          } else {
            showToast('Format file tidak valid', 'error');
          }
        } catch (err) {
          showToast('Gagal membaca file', 'error');
        }
      };
      reader.readAsText(file);
    });

    // Reset
    document.getElementById('btn-reset').addEventListener('click', () => {
      const modal = document.getElementById('reset-modal');
      modal.classList.remove('hidden');
      modal.classList.add('flex');
      document.body.style.overflow = 'hidden';
      const appContainer = document.getElementById('app-container');
      if (appContainer) appContainer.style.overflow = 'hidden';
    });

    const closeModal = () => {
      const modal = document.getElementById('reset-modal');
      modal.classList.add('hidden');
      modal.classList.remove('flex');
      document.getElementById('reset-checkbox').checked = false;
      document.getElementById('reset-confirm').classList.add('opacity-50', 'pointer-events-none');
      document.body.style.overflow = '';
      const appContainer = document.getElementById('app-container');
      if (appContainer) appContainer.style.overflow = '';
    };

    document.getElementById('reset-cancel').addEventListener('click', closeModal);

    document.getElementById('reset-checkbox').addEventListener('change', (e) => {
      const btn = document.getElementById('reset-confirm');
      if (e.target.checked) {
        btn.classList.remove('opacity-50', 'pointer-events-none');
      } else {
        btn.classList.add('opacity-50', 'pointer-events-none');
      }
    });

    document.getElementById('reset-confirm').addEventListener('click', async () => {
      const { showLoading, hideLoading } = await import('../utils.js');
      showLoading();
      
      setTimeout(async () => {
        await clear(stores.USERS);
        await clear(stores.TRANSACTIONS);
        await clear(stores.SAVING_GOALS);
        
        // Also clear the localStorage backup so data doesn't auto-restore
        clearBackup();
        
        document.body.style.overflow = '';
        const appContainer = document.getElementById('app-container');
        if (appContainer) appContainer.style.overflow = '';
        
        hideLoading();
        showToast('Semua data berhasil dihapus');
        
        const { navigate } = await import('../main.js');
        navigate('onboarding');
      }, 1200);
    });
  }
};
