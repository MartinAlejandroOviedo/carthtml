const TOKEN_KEY = 'panel_token';

const ACTIVE_TAB_CLASSES = ['border-sky-300/60', 'bg-sky-500/25', 'text-white'];
const INACTIVE_TAB_CLASSES = ['border-white/15', 'bg-slate-900/60', 'text-slate-200'];

const topbarRoot = document.getElementById('panel-topbar');
const navRoot = document.getElementById('panel-nav');
const contentRoot = document.getElementById('security-content');

async function loadPart(path) {
  const response = await fetch(path);
  if (!response.ok) throw new Error(`No se pudo cargar ${path}`);
  return response.text();
}

function setActiveTab(root, tabName) {
  const buttons = root.querySelectorAll('.security-tab-btn[data-tab-target]');
  const panels = root.querySelectorAll('.security-tab-panel[data-tab-panel]');

  buttons.forEach((button) => {
    const isActive = button.dataset.tabTarget === tabName;
    button.classList.remove(...ACTIVE_TAB_CLASSES, ...INACTIVE_TAB_CLASSES);
    button.classList.add(...(isActive ? ACTIVE_TAB_CLASSES : INACTIVE_TAB_CLASSES));
    button.setAttribute('aria-selected', isActive ? 'true' : 'false');
  });

  panels.forEach((panel) => {
    const show = panel.dataset.tabPanel === tabName;
    panel.classList.toggle('hidden', !show);
  });
}

function initTabs() {
  const roots = document.querySelectorAll('[data-security-tabs]');
  roots.forEach((root) => {
    const buttons = root.querySelectorAll('.security-tab-btn[data-tab-target]');
    if (!buttons.length) return;

    buttons.forEach((button) => {
      button.addEventListener('click', () => {
        setActiveTab(root, button.dataset.tabTarget || '');
      });
    });

    const initial = buttons[0].dataset.tabTarget || '';
    if (initial) setActiveTab(root, initial);
  });
}

function markSecurityNavActive() {
  const link = navRoot.querySelector('a[href="/panel/security.html"]');
  if (!link) return;
  link.classList.add('bg-sky-500/25', 'border-sky-300/60', 'text-white');
}

function setupPanelNavButtons() {
  navRoot.querySelectorAll('[data-view]').forEach((button) => {
    button.addEventListener('click', () => {
      const view = button.dataset.view;
      if (!view) return;
      window.location.href = `/panel/index.html?view=${encodeURIComponent(view)}`;
    });
  });
}

async function setupLayoutParts() {
  topbarRoot.innerHTML = await loadPart('/panel/parts/topbar.html');
  navRoot.innerHTML = await loadPart('/panel/parts/nav.html');

  const logoutBtn = document.getElementById('logout-btn');
  if (logoutBtn) {
    logoutBtn.addEventListener('click', () => {
      localStorage.removeItem(TOKEN_KEY);
      localStorage.removeItem('panel_user');
      window.location.replace('/panel/login.html');
    });
  }

  setupPanelNavButtons();
  markSecurityNavActive();

  if (window.lucide?.createIcons) {
    window.lucide.createIcons();
  }
}

function renderFallback(message) {
  if (!contentRoot) return;
  contentRoot.innerHTML = `
    <div class="rounded-2xl border border-white/10 bg-slate-950/40 p-4">
      <p class="font-display text-2xl uppercase text-white">Seguridad</p>
      <p class="mt-2 text-sm text-slate-300">${message}</p>
    </div>
  `;
}

async function loadSecurityContent() {
  const response = await fetch('/api/pages/security');
  const data = await response.json().catch(() => ({}));
  if (!response.ok) {
    throw new Error(data.error || 'No se pudo cargar la pagina de seguridad.');
  }

  if (!contentRoot) return;
  contentRoot.innerHTML = data.contentHtml || '';
  initTabs();

  if (window.lucide?.createIcons) {
    window.lucide.createIcons();
  }
}

async function bootstrap() {
  try {
    await setupLayoutParts();
    await loadSecurityContent();
  } catch (error) {
    renderFallback(error.message || 'No se pudo cargar seguridad.');
  }
}

bootstrap();
