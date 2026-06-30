# 🪙 Duitku

Aplikasi pencatatan keuangan pribadi (*personal finance tracker*) yang dirancang dengan estetika **Claymorphism** modern, premium, interaktif, dan responsif. Aplikasi ini berjalan sepenuhnya secara **offline** di perangkat pengguna untuk memastikan data Anda aman dan tidak membebani penggunaan kuota internet.

---

## ✨ Fitur Utama

- 🎨 **Claymorphism Design System** – Tampilan visual premium, bersih (*clean*), dan interaktif dengan efek bayangan clay yang menawan.
- 📱 **PWA (Progressive Web App) Ready** – Dapat diunduh dan dipasang langsung di perangkat iOS, Android, atau Desktop dengan logo kustom PWA.
- 🔒 **100% Offline & Privasi Terjaga** – Menggunakan **IndexedDB** lokal untuk menyimpan data profil, transaksi, target menabung, dan konfigurasi tanpa server eksternal.
- 🚀 **Bebas Kuota & Super Ringan** – Menggunakan Tailwind CSS v4 offline terkompilasi, menghasilkan ukuran bundel yang kecil dan waktu muat instan.
- 👧 **Maskot Interaktif** – Panduan visual interaktif sepanjang tur onboarding menggunakan maskot 3D Duitku yang menarik.
- ⚙️ **Backup & Restore** – Ekspor data Anda ke file JSON atau impor kembali dengan mudah untuk menghindari kehilangan data.

---

## 🛠️ Tech Stack

- **Core**: HTML5, Vanilla JavaScript, CSS3
- **CSS Framework**: [Tailwind CSS v4](https://tailwindcss.com/) (Offline compilation via Vite plugin)
- **Bundler & Dev Server**: [Vite](https://vite.dev/)
- **Database**: IndexedDB (Local Browser Storage)
- **Charts**: [Chart.js](https://www.chartjs.org/)

---

## 💻 Cara Menjalankan Project Secara Lokal

### **Persyaratan System:**
Pastikan Anda sudah menginstal **Node.js** di komputer Anda.

### **Langkah-langkah:**

1. **Clone repository dan masuk ke direktori proyek:**
   ```bash
   cd duitku
   ```

2. **Instal dependensi:**
   ```bash
   npm install
   ```

3. **Jalankan aplikasi dalam mode development:**
   ```bash
   npm run dev
   ```
   Buka browser dan akses alamat yang tertera di terminal (biasanya `http://localhost:3000`).

---

## 📦 Build untuk Produksi

Untuk mengompilasi dan mengoptimalkan aset aplikasi agar siap diunggah ke server hosting produksi:

```bash
npm run build
```

Hasil kompilasi akan berada di folder `dist/` dan siap dideploy.

---

## ☁️ Deployment (Vercel)

Proyek ini dilengkapi dengan konfigurasi `vercel.json` untuk *production ready* deployment di platform Vercel.

**Aturan konfigurasi Vercel:**
- **SPA Fallback**: Secara otomatis mengarahkan rute klien ke `index.html` untuk menghindari error 404 saat halaman di-refresh.
- **Cache-Control**: File `service-worker.js` dikonfigurasi untuk tidak dicache secara agresif agar pembaruan PWA dapat diterima pengguna seketika.

---

## 👨‍💻 Kontributor

Dibuat dengan 💙 oleh [DapCodes](https://github.com/DapCodes).
