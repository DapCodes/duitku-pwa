import './style.css';
import { initDB, get, put, stores } from './db.js';
import { setupView } from './views/setup.js';
import { homeView } from './views/home.js';
import { transactionView } from './views/transaction.js';
import { goalsView } from './views/goals.js';
import { goalDetailView } from './views/goalDetail.js';
import { reportsView } from './views/reports.js';
import { timelineView } from './views/timeline.js';
import { onboardingView } from './views/onboarding.js';
import { settingsView } from './views/settings.js';

const routes = {
  'onboarding': onboardingView,
  'setup': setupView,
  'home': homeView,
  'transaction': transactionView,
  'goals': goalsView,
  'goalDetail': goalDetailView,
  'reports': reportsView,
  'timeline': timelineView,
  'settings': settingsView
};

let currentRoute = null;

// ──────────────────────────────────────────────
// PWA Install Prompt
// Store the deferred prompt so the user can install from within the app
// ──────────────────────────────────────────────
let deferredInstallPrompt = null;

window.addEventListener('beforeinstallprompt', (e) => {
  e.preventDefault();
  deferredInstallPrompt = e;

  // Show install banner if it exists and hasn't been dismissed in this session
  if (sessionStorage.getItem('pwa-install-dismissed') !== 'true') {
    const banner = document.getElementById('pwa-install-banner');
    if (banner) {
      banner.classList.remove('hidden');
      banner.classList.add('flex');
    }
  }
});

window.addEventListener('appinstalled', () => {
  deferredInstallPrompt = null;
  const banner = document.getElementById('pwa-install-banner');
  if (banner) {
    banner.classList.add('hidden');
    banner.classList.remove('flex');
  }
  console.log('[PWA] App installed successfully');
});

// Export for use in views
export const triggerInstall = async () => {
  if (!deferredInstallPrompt) return false;
  deferredInstallPrompt.prompt();
  const { outcome } = await deferredInstallPrompt.userChoice;
  deferredInstallPrompt = null;
  return outcome === 'accepted';
};

export const canInstall = () => deferredInstallPrompt !== null;

// ──────────────────────────────────────────────
// Navigation
// ──────────────────────────────────────────────

const TAB_ORDER = { 'home': 0, 'timeline': 1, 'goals': 2, 'reports': 3 };

const getTransitionType = (from, to) => {
  if (!from || !to) return 'fade-scale';
  if (from === to) return 'none';

  // Beranda selalu tampil instan (tanpa animasi transisi halaman).
  // Animasi di Beranda dibangun sendiri di dalam home.js (count-up, stagger),
  // terpisah dari sistem transisi antar-halaman ini.
  if (to === 'home') return 'none';

  // Between main bottom tabs → horizontal slide
  if (TAB_ORDER[from] !== undefined && TAB_ORDER[to] !== undefined) {
    return TAB_ORDER[to] > TAB_ORDER[from] ? 'slide-left' : 'slide-right';
  }

  // Modal-style pages → vertical slide
  if (to === 'transaction' || to === 'setup') return 'slide-up';
  if (from === 'transaction' || from === 'setup') return 'slide-down';

  // Detail pages → horizontal push
  if (to === 'goalDetail' || to === 'settings') return 'slide-left';
  if (from === 'goalDetail' || from === 'settings') return 'slide-right';

  return 'fade-scale';
};

export const navigate = async (path, params = {}) => {
  if (currentRoute === path) return;

  const container = document.getElementById('app-container');
  const bottomNav = document.getElementById('bottom-nav');

  const fromRoute = currentRoute;
  const transition = getTransitionType(fromRoute, path);
  const oldChild = container.firstElementChild;

  // Load new view
  const view = routes[path];
  if (!view) return;

  // Create new page element
  const wrapper = document.createElement('div');
  wrapper.innerHTML = view.render().trim();
  const newPage = wrapper.firstElementChild;
  if (!newPage) return;

  // Position both pages for simultaneous animation
  if (oldChild && transition !== 'none') {
    container.style.position = 'relative';
    container.style.overflow = 'hidden';

    oldChild.style.position = 'absolute';
    oldChild.style.inset = '0';
    oldChild.style.width = '100%';
    oldChild.style.zIndex = '1';
    oldChild.classList.add(`${transition}-exit`);

    newPage.style.position = 'absolute';
    newPage.style.inset = '0';
    newPage.style.width = '100%';
    newPage.style.zIndex = '2';
    newPage.classList.add(`${transition}-enter`);

    container.appendChild(newPage);

    // Init the new view while animation plays
    currentRoute = path;
    if (view.init) view.init(params);

    // Wait for animation to complete (450ms)
    await new Promise(r => setTimeout(r, 460));

    // Cleanup: remove old page, reset styles on new page
    if (oldChild.parentNode === container) container.removeChild(oldChild);
    newPage.classList.remove(`${transition}-enter`);
    newPage.style.position = '';
    newPage.style.inset = '';
    newPage.style.width = '';
    newPage.style.zIndex = '';
    container.style.position = '';
    container.style.overflow = '';
  } else {
    // First load, same-route, or transition === 'none' → replace instantly, tanpa delay
    container.innerHTML = '';
    container.appendChild(newPage);
    container.style.overflow = '';
    container.style.overflowY = '';
    currentRoute = path;
    if (view.init) view.init(params);
  }

  // Toggle bottom nav visibility
  const navVisiblePaths = ['home', 'timeline', 'goals', 'reports'];
  if (navVisiblePaths.includes(path)) {
    bottomNav.classList.remove('translate-y-full');

    // Update active state + bounce icon
    document.querySelectorAll('.nav-btn').forEach(btn => {
      if (btn.dataset.nav === path) {
        btn.classList.add('text-primary');
        btn.classList.remove('text-outline');
        const icon = btn.querySelector('.material-symbols-outlined');
        if (icon) {
          icon.classList.remove('animate-bounce-short');
          void icon.offsetWidth;
          icon.classList.add('animate-bounce-short');
        }
      } else {
        btn.classList.remove('text-primary');
        btn.classList.add('text-outline');
      }
    });
  } else {
    bottomNav.classList.add('translate-y-full');
  }
};

// ──────────────────────────────────────────────
// App Initialization
// ──────────────────────────────────────────────

const initApp = async () => {
  // Register Service Worker for PWA
  if ('serviceWorker' in navigator) {
    try {
      const registration = await navigator.serviceWorker.register('/service-worker.js', {
        scope: '/'
      });

      // Handle SW updates
      registration.addEventListener('updatefound', () => {
        const newWorker = registration.installing;
        newWorker.addEventListener('statechange', () => {
          if (newWorker.state === 'activated') {
            console.log('[SW] New version activated');
          }
        });
      });

      console.log('[SW] Registered successfully, scope:', registration.scope);
    } catch (err) {
      console.warn('[SW] Registration failed:', err);
    }
  }

  await initDB();

  // Setup bottom nav listeners
  document.querySelectorAll('.nav-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      navigate(btn.dataset.nav);
    });
  });

  // Setup PWA install banner listeners
  const installBtn = document.getElementById('pwa-install-btn');
  const dismissBtn = document.getElementById('pwa-install-dismiss');

  if (installBtn) {
    installBtn.addEventListener('click', async () => {
      const accepted = await triggerInstall();
      if (accepted) {
        const banner = document.getElementById('pwa-install-banner');
        if (banner) {
          banner.classList.add('hidden');
          banner.classList.remove('flex');
        }
      }
    });
  }

  if (dismissBtn) {
    dismissBtn.addEventListener('click', () => {
      const banner = document.getElementById('pwa-install-banner');
      if (banner) {
        banner.classList.add('hidden');
        banner.classList.remove('flex');
      }
      sessionStorage.setItem('pwa-install-dismissed', 'true');
    });
  }

  // Check if user exists
  const user = await get(stores.USERS, 'me');
  if (user) {
    navigate('home');
  } else {
    navigate('onboarding');
  }
};

document.addEventListener('DOMContentLoaded', initApp);