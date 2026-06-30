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

const initApp = async () => {
  if ('serviceWorker' in navigator) {
    navigator.serviceWorker.register('/service-worker.js').catch(err => console.log('SW registration failed: ', err));
  }

  await initDB();
  
  // Setup bottom nav listeners
  document.querySelectorAll('.nav-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      navigate(btn.dataset.nav);
    });
  });

  // Check if user exists
  const user = await get(stores.USERS, 'me');
  if (user) {
    navigate('home');
  } else {
    navigate('onboarding');
  }
};

document.addEventListener('DOMContentLoaded', initApp);
