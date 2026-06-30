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

export const navigate = async (path, params = {}) => {
  if (currentRoute === path) return;
  
  const container = document.getElementById('app-container');
  const bottomNav = document.getElementById('bottom-nav');
  
  // Animation out
  if (container.firstElementChild) {
    container.firstElementChild.classList.add('page-exit');
    await new Promise(r => setTimeout(r, 200));
  }

  // Load new view
  const view = routes[path];
  if (view) {
    container.innerHTML = view.render();
    container.style.overflow = '';
    container.style.overflowY = '';
    const newPage = container.firstElementChild;
    newPage.classList.add('page-enter');
    if (view.init) view.init(params);
    
    // Remove the page-enter class after transition completes to restore viewport context for modals
    setTimeout(() => {
      if (newPage && newPage.classList.contains('page-enter')) {
        newPage.classList.remove('page-enter');
      }
    }, 450);
  }

  currentRoute = path;

  // Toggle bottom nav visibility
  const navVisiblePaths = ['home', 'timeline', 'goals', 'reports'];
  if (navVisiblePaths.includes(path)) {
    bottomNav.classList.remove('translate-y-full');
    
    // Update active state
    document.querySelectorAll('.nav-btn').forEach(btn => {
      if (btn.dataset.nav === path) {
        btn.classList.add('text-primary');
        btn.classList.remove('text-outline');
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
