import { put, get, stores } from '../db.js';
import { showToast, playSound, createConfetti } from '../utils.js';

export const transactionView = {
  render: () => `
    <div class="w-full min-h-full flex flex-col bg-surface-bright pb-32">
      <div class="px-6 pt-6 pb-3 sticky top-0 z-30">
        <div class="clay-surface bg-surface-bright/90 backdrop-blur-md rounded-[32px] px-6 py-4 flex items-center justify-between h-20">
          <h1 class="font-headline-lg text-on-surface truncate">Catat Transaksi</h1>
          <button id="tx-close" class="w-10 h-10 shrink-0 rounded-full bg-surface-variant flex items-center justify-center text-on-surface-variant transition-transform active:scale-90">
            <span class="material-symbols-outlined">close</span>
          </button>
        </div>
      </div>

      <div class="px-6 flex flex-col gap-6 pt-0">
        <!-- Type Toggle -->
        <div class="flex bg-surface-container-highest rounded-full p-1.5 mb-2 relative">
          <div id="tx-type-indicator" class="absolute top-1.5 bottom-1.5 left-1.5 w-[calc(50%-6px)] bg-error rounded-full transition-all duration-300 shadow-md"></div>
          <button id="tx-type-expense" class="flex-1 py-3 rounded-full font-bold text-sm text-white z-10 transition-colors">Pengeluaran</button>
          <button id="tx-type-income" class="flex-1 py-3 rounded-full font-bold text-sm text-on-surface-variant z-10 transition-colors">Pemasukan</button>
        </div>

        <!-- Amount -->
        <div class="clay-surface p-6 flex flex-col items-center justify-center relative overflow-hidden group">
          <div class="absolute -top-10 -right-10 w-32 h-32 bg-outline-variant opacity-10 rounded-full"></div>
          <p class="text-xs font-bold uppercase tracking-widest text-outline mb-2">Nominal</p>
          <div class="flex items-center w-full max-w-[240px]">
            <span class="text-3xl font-bold text-on-surface mr-2">Rp</span>
            <input type="number" id="tx-amount" placeholder="0" class="w-full text-5xl font-black text-on-surface placeholder:text-outline-variant outline-none bg-transparent caret-primary text-center" />
          </div>
        </div>

        <!-- Categories -->
        <div class="mt-2">
          <label class="text-xs font-bold uppercase tracking-widest text-outline mb-4 block">Kategori</label>
          <div class="grid grid-cols-3 sm:grid-cols-4 gap-3" id="tx-categories">
            <!-- Populated dynamically -->
          </div>
        </div>

        <!-- Date & Note -->
        <div class="clay-surface p-2 mt-2">
          <div class="flex items-center gap-3 p-4">
            <div class="w-10 h-10 rounded-full bg-surface-variant flex items-center justify-center shrink-0">
              <span class="material-symbols-outlined text-on-surface-variant">calendar_today</span>
            </div>
            <input type="date" id="tx-date" class="w-full text-base font-semibold text-on-surface outline-none bg-transparent" />
          </div>
          <div class="w-[calc(100%-2rem)] mx-auto h-[1px] bg-outline-variant/30"></div>
          <div class="flex items-center gap-3 p-4">
            <div class="w-10 h-10 rounded-full bg-surface-variant flex items-center justify-center shrink-0">
              <span class="material-symbols-outlined text-on-surface-variant">edit_note</span>
            </div>
            <input type="text" id="tx-note" placeholder="Catatan (opsional)" class="w-full text-base text-on-surface outline-none bg-transparent placeholder:text-outline-variant" />
          </div>
        </div>

        <!-- Photo Upload -->
        <div class="mt-2">
          <label class="text-xs font-bold uppercase tracking-widest text-outline mb-4 block">Bukti Foto (Opsional)</label>
          <div class="clay-surface h-32 flex flex-col items-center justify-center border-2 border-dashed border-outline-variant/50 relative overflow-hidden transition-colors hover:bg-surface-variant/50 hover:border-primary/50 group" id="tx-photo-container">
            <input type="file" id="tx-photo" accept="image/*" class="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-20" />
            <span class="material-symbols-outlined text-4xl text-outline mb-2 group-hover:text-primary transition-colors duration-300 group-hover:scale-110">add_a_photo</span>
            <p class="text-xs font-medium text-outline text-center group-hover:text-primary transition-colors">Ketuk untuk unggah foto</p>
            <img id="tx-photo-preview" class="absolute inset-0 w-full h-full object-cover hidden z-10" />
          </div>
        </div>

        <!-- Save Button -->
        <button id="tx-save" class="w-full py-4 rounded-2xl font-bold text-lg text-on-surface clay-button mt-4 opacity-50 pointer-events-none transition-all active:scale-95 shadow-lg shadow-error/30">
          Simpan Transaksi
        </button>
      </div>
    </div>
  `,
  init: () => {
    const categories = {
      expense: [
        { id: 'Makanan', icon: 'restaurant' },
        { id: 'Minuman', icon: 'local_cafe' },
        { id: 'Transport', icon: 'directions_car' },
        { id: 'Belanja', icon: 'shopping_bag' },
        { id: 'Tagihan', icon: 'receipt_long' },
        { id: 'Hiburan', icon: 'sports_esports' },
        { id: 'Pendidikan', icon: 'school' },
        { id: 'Kesehatan', icon: 'medical_services' },
        { id: 'Lainnya', icon: 'category' }
      ],
      income: [
        { id: 'Gaji', icon: 'payments' },
        { id: 'Freelance', icon: 'laptop_mac' },
        { id: 'Bonus', icon: 'redeem' },
        { id: 'Hadiah', icon: 'featured_seasonal_and_gifts' },
        { id: 'Investasi', icon: 'trending_up' },
        { id: 'Lainnya', icon: 'category' }
      ]
    };

    let currentType = 'expense';
    let selectedCategory = '';
    let photoDataUrl = '';

    const btnExpense = document.getElementById('tx-type-expense');
    const btnIncome = document.getElementById('tx-type-income');
    const typeIndicator = document.getElementById('tx-type-indicator');
    const categoriesContainer = document.getElementById('tx-categories');
    const amountInput = document.getElementById('tx-amount');
    const dateInput = document.getElementById('tx-date');
    const noteInput = document.getElementById('tx-note');
    const photoInput = document.getElementById('tx-photo');
    const photoPreview = document.getElementById('tx-photo-preview');
    const btnSave = document.getElementById('tx-save');
    const btnClose = document.getElementById('tx-close');

    // Default date to today
    dateInput.valueAsDate = new Date();

    const renderCategories = () => {
      categoriesContainer.innerHTML = categories[currentType].map(cat => {
        const isSelected = selectedCategory === cat.id;
        const colorClass = currentType === 'expense' ? 'error' : 'secondary';
        
        return `
          <button class="cat-btn clay-surface-sm py-3 px-1 flex flex-col items-center justify-center gap-1.5 border-2 transition-all relative overflow-hidden ${isSelected ? `border-${colorClass} bg-${colorClass}/10` : 'border-transparent hover:bg-surface-variant/50'}" data-cat="${cat.id}">
            ${isSelected ? `<div class="absolute top-1.5 right-1.5 w-2.5 h-2.5 rounded-full bg-${colorClass} shadow-sm border border-surface-bright"></div>` : ''}
            <div class="${isSelected ? `text-${colorClass} scale-110` : 'text-on-surface-variant'} transition-transform duration-300">
              <span class="material-symbols-outlined text-3xl">${cat.icon}</span>
            </div>
            <span class="text-[10px] font-bold ${isSelected ? `text-${colorClass}` : 'text-on-surface-variant'} break-words w-full text-center px-1 leading-tight">${cat.id}</span>
          </button>
        `;
      }).join('');

      document.querySelectorAll('.cat-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
          selectedCategory = e.currentTarget.dataset.cat;
          renderCategories();
          validate();
        });
      });
    };

    const validate = () => {
      const amt = Number(amountInput.value);
      if (amt > 0 && selectedCategory !== '' && dateInput.value) {
        btnSave.classList.remove('opacity-50', 'pointer-events-none');
      } else {
        btnSave.classList.add('opacity-50', 'pointer-events-none');
      }
    };

    btnExpense.addEventListener('click', () => {
      currentType = 'expense';
      selectedCategory = '';
      btnExpense.classList.add('text-white');
      btnExpense.classList.remove('text-on-surface-variant');
      btnIncome.classList.add('text-on-surface-variant');
      btnIncome.classList.remove('text-white');
      typeIndicator.style.transform = 'translateX(0)';
      typeIndicator.className = 'absolute top-1.5 bottom-1.5 left-1.5 w-[calc(50%-6px)] bg-error rounded-full transition-all duration-300 shadow-md';
      
      btnSave.className = 'w-full py-4 rounded-2xl font-bold text-lg text-on-surface clay-button mt-4 opacity-50 pointer-events-none transition-all active:scale-95 shadow-lg shadow-error/30';
      btnSave.textContent = 'Simpan Transaksi';
      renderCategories();
      validate();
    });

    btnIncome.addEventListener('click', () => {
      currentType = 'income';
      selectedCategory = '';
      btnIncome.classList.add('text-white');
      btnIncome.classList.remove('text-on-surface-variant');
      btnExpense.classList.add('text-on-surface-variant');
      btnExpense.classList.remove('text-white');
      typeIndicator.style.transform = 'translateX(100%)';
      typeIndicator.className = 'absolute top-1.5 bottom-1.5 left-1.5 w-[calc(50%-6px)] bg-secondary rounded-full transition-all duration-300 shadow-md';
      
      btnSave.className = 'w-full py-4 rounded-2xl font-bold text-lg text-on-surface clay-button mt-4 opacity-50 pointer-events-none transition-all active:scale-95 shadow-lg shadow-secondary/30';
      btnSave.textContent = 'Simpan Transaksi';
      renderCategories();
      validate();
    });

    amountInput.addEventListener('input', validate);
    dateInput.addEventListener('input', validate);

    photoInput.addEventListener('change', (e) => {
      const file = e.target.files[0];
      if (file) {
        const reader = new FileReader();
        reader.onload = (ev) => {
          photoDataUrl = ev.target.result;
          photoPreview.src = photoDataUrl;
          photoPreview.classList.remove('hidden');
        };
        reader.readAsDataURL(file);
      }
    });

    btnClose.addEventListener('click', async () => {
      const { navigate } = await import('../main.js');
      navigate('home');
    });

    btnSave.addEventListener('click', async () => {
      const amount = Number(amountInput.value);
      const tx = {
        id: new Date().getTime().toString(),
        type: currentType,
        amount: amount,
        category: selectedCategory,
        date: dateInput.value,
        note: noteInput.value,
        image: photoDataUrl,
        timestamp: new Date().getTime()
      };

      await put(stores.TRANSACTIONS, tx);

      // Update user balance
      const user = await get(stores.USERS, 'me');
      if (user) {
        if (currentType === 'expense') {
          user.current_balance -= amount;
          playSound('add-expense');
        } else {
          user.current_balance += amount;
          playSound('add-income');
          createConfetti();
        }
        await put(stores.USERS, user);
      }

      showToast('Transaksi berhasil dicatat');
      
      setTimeout(async () => {
        const { navigate } = await import('../main.js');
        navigate('home');
      }, 500);
    });

    renderCategories();
  }
};
