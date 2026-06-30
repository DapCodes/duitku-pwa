import { getAll, stores } from '../db.js';
import { formatRupiah } from '../utils.js';

export const reportsView = {
  render: () => `
    <div class="w-full min-h-full flex flex-col bg-surface-bright pb-32">
      <div class="px-6 pt-6 pb-3 sticky top-0 z-50">
        <div class="clay-surface bg-surface-bright/90 backdrop-blur-md rounded-[32px] px-6 py-4 flex flex-col justify-center h-20">
          <h1 class="font-headline-lg text-on-surface">Laporan</h1>
          <p class="font-body-sm text-on-surface-variant truncate">Analisis pengeluaran dan pemasukanmu.</p>
        </div>
      </div>

      <div class="px-6 flex flex-col gap-6 pt-0">
        <!-- Wrap Recap -->
        <div class="clay-surface p-6 relative overflow-hidden">
          <div class="absolute -top-10 -right-10 w-32 h-32 bg-secondary-container opacity-20 rounded-full"></div>
          <h2 class="font-headline-lg-mobile relative z-10 mb-4 text-on-surface">Ringkasan Bulan Ini</h2>
          
          <div class="flex flex-col gap-4 relative z-10">
            <div>
              <p class="font-label-md text-outline uppercase tracking-wider">Kategori Favorit</p>
              <p class="font-headline-lg mt-1 text-primary" id="rep-fav-cat">-</p>
            </div>
            
            <div class="w-full h-[1px] bg-outline-variant/50"></div>
            
            <div class="flex justify-between">
              <div>
                <p class="font-label-md text-outline">Total Pemasukan</p>
                <p class="font-title-md mt-1 text-secondary" id="rep-total-in">Rp 0</p>
              </div>
              <div class="text-right">
                <p class="font-label-md text-outline">Total Pengeluaran</p>
                <p class="font-title-md mt-1 text-error" id="rep-total-out">Rp 0</p>
              </div>
            </div>
          </div>
        </div>

        <!-- Insight -->
        <div class="clay-surface p-5 border-l-4 border-tertiary">
          <div class="flex gap-3">
            <span class="material-symbols-outlined text-tertiary">stars</span>
            <div>
              <h3 class="font-title-md text-on-surface">Insight Keuangan</h3>
              <p class="font-body-sm text-on-surface-variant mt-1" id="rep-insight">Belum cukup data untuk memberikan insight.</p>
            </div>
          </div>
        </div>

        <!-- Chart -->
        <div class="clay-surface p-6">
          <h3 class="font-title-md text-on-surface mb-4">Grafik Pengeluaran</h3>
          <div class="relative w-full h-64">
            <canvas id="expenseChart"></canvas>
          </div>
        </div>
        
        <!-- Statistik -->
        <div class="clay-surface p-6">
          <h3 class="font-title-md text-on-surface mb-4">Statistik Tambahan</h3>
          <div class="flex flex-col gap-4">
            <div class="flex justify-between items-center">
              <span class="font-body-md text-on-surface-variant">Rata-rata pengeluaran/hari</span>
              <span class="font-title-md text-on-surface" id="rep-avg-day">Rp 0</span>
            </div>
            <div class="w-full h-[1px] bg-outline-variant/50"></div>
            <div class="flex justify-between items-center">
              <span class="font-body-md text-on-surface-variant">Transaksi terbesar</span>
              <span class="font-title-md text-on-surface" id="rep-max-tx">Rp 0</span>
            </div>
            <div class="w-full h-[1px] bg-outline-variant/50"></div>
            <div class="flex justify-between items-center">
              <span class="font-body-md text-on-surface-variant">Total frekuensi transaksi</span>
              <span class="font-title-md text-on-surface" id="rep-total-freq">0</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  `,
  init: async () => {
    const txs = await getAll(stores.TRANSACTIONS);
    
    let totalIn = 0;
    let totalOut = 0;
    let expensesByCat = {};
    
    txs.forEach(tx => {
      if (tx.type === 'income') {
        totalIn += tx.amount;
      } else {
        totalOut += tx.amount;
        if (!expensesByCat[tx.category]) expensesByCat[tx.category] = 0;
        expensesByCat[tx.category] += tx.amount;
      }
    });

    document.getElementById('rep-total-in').textContent = formatRupiah(totalIn);
    document.getElementById('rep-total-out').textContent = formatRupiah(totalOut);

    let maxCat = '-';
    let maxAmt = 0;
    for (const [cat, amt] of Object.entries(expensesByCat)) {
      if (amt > maxAmt) {
        maxAmt = amt;
        maxCat = cat;
      }
    }
    
    document.getElementById('rep-fav-cat').textContent = maxCat;

    // Extra stats
    let maxTx = 0;
    let daysWithTx = new Set();
    txs.forEach(tx => {
      if (tx.type === 'expense' && tx.amount > maxTx) maxTx = tx.amount;
      daysWithTx.add(tx.date);
    });
    const avgDay = daysWithTx.size > 0 ? totalOut / daysWithTx.size : 0;
    
    document.getElementById('rep-avg-day').textContent = formatRupiah(avgDay);
    document.getElementById('rep-max-tx').textContent = formatRupiah(maxTx);
    document.getElementById('rep-total-freq').textContent = txs.length.toString();

    // Insight
    const insightEl = document.getElementById('rep-insight');
    if (totalOut === 0 && totalIn === 0) {
      insightEl.textContent = "Belum ada transaksi. Ayo mulai mencatat!";
    } else if (totalOut > totalIn && totalIn > 0) {
      insightEl.textContent = "Awas! Pengeluaranmu melebihi pemasukan bulan ini.";
    } else if (maxCat !== '-') {
      insightEl.textContent = `Kamu paling banyak menghabiskan uang untuk ${maxCat}. Coba kurangi jika tidak perlu.`;
    } else {
      insightEl.textContent = "Keuanganmu terlihat stabil. Pertahankan!";
    }

    // Chart.js
    const ctx = document.getElementById('expenseChart');
    if (ctx && window.Chart) {
      new window.Chart(ctx, {
        type: 'doughnut',
        data: {
          labels: Object.keys(expensesByCat).length > 0 ? Object.keys(expensesByCat) : ['Belum ada'],
          datasets: [{
            data: Object.keys(expensesByCat).length > 0 ? Object.values(expensesByCat) : [1],
            backgroundColor: [
              '#006b5f', '#3cddc7', '#a93349', '#674bb5', '#bacac5'
            ],
            borderWidth: 0,
            borderRadius: 5
          }]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            legend: {
              position: 'bottom',
              labels: {
                font: { family: 'Inter' },
                color: '#3c4a46'
              }
            }
          },
          cutout: '75%'
        }
      });
    }
  }
};
