import { get, getAll, put, stores } from '../db.js';
import { formatRupiah } from '../utils.js';

export const timelineView = {
  render: () => `
    <div class="w-full min-h-full flex flex-col bg-surface-bright pb-32">
      <div class="px-6 pt-6 pb-3 sticky top-0 z-30">
        <div class="clay-surface bg-surface-bright/90 backdrop-blur-md rounded-[32px] px-6 py-4 flex flex-col justify-center h-20">
          <h1 class="font-headline-lg text-on-surface">Aktivitas</h1>
          <p class="font-body-sm text-on-surface-variant truncate">Jejak langkah keuanganmu.</p>
        </div>
      </div>

      <div class="px-6 flex flex-col relative pt-0" id="timeline-list">
        <div class="flex flex-col items-center justify-center py-20 text-center opacity-50" id="timeline-empty">
          <span class="material-symbols-outlined text-[64px] mb-4 text-outline">receipt_long</span>
          <p class="font-title-md">Belum ada aktivitas</p>
          <p class="font-body-sm">Catat transaksi pertamamu sekarang!</p>
        </div>
      </div>
    </div>
  `,
  init: async () => {
    const list = document.getElementById('timeline-list');
    const empty = document.getElementById('timeline-empty');
    
    let txs = await getAll(stores.TRANSACTIONS);
    const user = await get(stores.USERS, 'me');
    
    if (txs && txs.length > 0) {
      if (empty) empty.style.display = 'none';
      
      // Sort desc
      txs.sort((a, b) => b.timestamp - a.timestamp);
      
      let html = '';
      let currentDateStr = null;
      
      const userName = user?.name || 'User';
      const userHandle = user?.username ? `@${user.username}` : '@user';

      const now = new Date();
      const today = new Date(now.getTime() - now.getTimezoneOffset() * 60000).toISOString().split('T')[0];
      const yesterday = new Date(now.getTime() - 24 * 60 * 60 * 1000 - now.getTimezoneOffset() * 60000).toISOString().split('T')[0];

      txs.forEach(tx => {
        const isExpense = tx.type === 'expense';
        const color = isExpense ? 'error' : 'secondary';
        
        const dateObj = new Date(tx.date);
        let displayDate = dateObj.toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' });
        
        let headerLabel = displayDate;
        if (tx.date === today) headerLabel = 'Hari Ini';
        else if (tx.date === yesterday) headerLabel = 'Kemarin';

        if (currentDateStr !== tx.date) {
            html += `<div class="mt-6 mb-2 border-b-2 border-outline-variant/30 inline-block pb-1"><span class="font-bold text-lg text-on-surface">${headerLabel}</span></div>`;
            currentDateStr = tx.date;
        }

        const commentsHtml = (tx.comments || []).map(c => `
          <div class="mt-2 bg-surface-container/30 rounded-xl p-3 text-[14px] text-on-surface border border-outline-variant/30 relative">
            <div class="absolute -left-2 top-3 w-1 h-1 rounded-full bg-outline"></div>
            ${c.text}
          </div>
        `).join('');

        html += `
          <div class="tx-item flex flex-col w-full border-b border-outline-variant/20 pb-5 pt-3 select-none" data-id="${tx.id}">
            <div class="flex-1 min-w-0">
              <div class="flex items-center gap-2 mb-2">
                <span class="font-bold text-on-surface">${userName}</span>
                <span class="text-sm font-medium text-outline">${userHandle}</span>
              </div>
              <div class="mb-2">
                <p class="text-[15px] text-on-surface leading-relaxed">
                  ${isExpense ? 'Mencatat pengeluaran' : 'Mendapat pemasukan'} <strong>${tx.category}</strong> sebesar <span class="text-${color} font-bold">${formatRupiah(tx.amount)}</span>.
                </p>
                ${tx.note ? `<p class="text-[15px] text-on-surface-variant mt-2 italic border-l-2 border-outline-variant/50 pl-3">"${tx.note}"</p>` : ''}
              </div>
              ${tx.image ? `<div class="mt-3 rounded-2xl overflow-hidden border border-outline-variant/50 clay-inset pointer-events-none"><img src="${tx.image}" class="w-full object-cover max-h-80" /></div>` : ''}
              
              <div class="flex items-center mt-3 text-outline gap-6">
                <button class="btn-like flex items-center gap-2 hover:text-error transition-colors group cursor-pointer" data-id="${tx.id}">
                  <div class="w-8 h-8 rounded-full flex items-center justify-center group-hover:bg-error/10 transition-colors">
                    <span class="material-symbols-outlined text-[20px] pointer-events-none ${tx.liked ? 'text-error' : ''}" style="font-variation-settings: 'FILL' ${tx.liked ? '1' : '0'}">favorite</span>
                  </div>
                </button>
                <button class="btn-comment flex items-center gap-2 hover:text-primary transition-colors group cursor-pointer" data-id="${tx.id}">
                  <div class="w-8 h-8 rounded-full flex items-center justify-center group-hover:bg-primary/10 transition-colors">
                    <span class="material-symbols-outlined text-[20px] pointer-events-none">chat_bubble</span>
                  </div>
                </button>
              </div>

              <div id="comment-input-${tx.id}" class="hidden mt-3 flex gap-2 w-full">
                <input type="text" id="input-${tx.id}" placeholder="Tambahkan catatan..." class="flex-1 clay-inset px-4 py-2 text-sm bg-transparent outline-none text-on-surface" />
                <button class="btn-submit-comment clay-button bg-primary text-white px-4 py-2 rounded-xl text-sm font-semibold hover:opacity-90" data-id="${tx.id}">Simpan</button>
              </div>
            </div>
            ${commentsHtml}
          </div>
        `;
      });
      
      list.innerHTML = html;
    }

    // Double click to like
    list.ondblclick = async (e) => {
      const txItem = e.target.closest('.tx-item');
      if (txItem) {
        const txId = txItem.dataset.id;
        const tx = await get(stores.TRANSACTIONS, txId);
        if (!tx.liked) {
          tx.liked = true;
          tx.likes = (tx.likes || 0) + 1;
          await put(stores.TRANSACTIONS, tx);
          timelineView.init();
        }
      }
    };

    // Attach event listeners for like and comment
    list.onclick = async (e) => {
      const btnComment = e.target.closest('.btn-comment');
      if (btnComment) {
        const txId = btnComment.dataset.id;
        const inputContainer = document.getElementById(`comment-input-${txId}`);
        if (inputContainer) {
          inputContainer.classList.toggle('hidden');
          if (!inputContainer.classList.contains('hidden')) {
            document.getElementById(`input-${txId}`).focus();
          }
        }
        return;
      }
      
      const btnLike = e.target.closest('.btn-like');
      if (btnLike) {
        const txId = btnLike.dataset.id;
        const tx = await get(stores.TRANSACTIONS, txId);
        tx.liked = !tx.liked;
        tx.likes = tx.liked ? (tx.likes || 0) + 1 : Math.max(0, (tx.likes || 1) - 1);
        await put(stores.TRANSACTIONS, tx);
        timelineView.init();
        return;
      }
      
      const btnSubmit = e.target.closest('.btn-submit-comment');
      if (btnSubmit) {
        const txId = btnSubmit.dataset.id;
        const input = document.getElementById(`input-${txId}`);
        const text = input.value.trim();
        if (text) {
          const tx = await get(stores.TRANSACTIONS, txId);
          if (!tx.comments) tx.comments = [];
          tx.comments.push({
            text: text,
            date: new Date().getTime()
          });
          await put(stores.TRANSACTIONS, tx);
          timelineView.init();
        }
        return;
      }
    };
  }
};
