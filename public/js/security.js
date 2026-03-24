import { fetchPageBySlug } from './api.js';
import { injectLayout } from './layout.js?v=20260320b';

const ACTIVE_TAB_CLASSES = ['border-sky-300/60', 'bg-sky-500/25', 'text-white'];
const INACTIVE_TAB_CLASSES = ['border-white/15', 'bg-slate-900/60', 'text-slate-200'];

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

function renderFallback(message) {
  const root = document.getElementById('security-content');
  if (!root) return;

  root.innerHTML = `
    <section class="mx-auto max-w-6xl px-4 pt-8">
      <div class="rounded-3xl border border-white/10 bg-slate-900/75 p-5 shadow-2xl shadow-slate-950/60">
        <p class="font-display text-4xl uppercase leading-none text-white sm:text-5xl">Seguridad</p>
        <p class="mt-3 max-w-3xl text-sm text-slate-300">${message}</p>
      </div>
    </section>
  `;
}

async function bootstrap() {
  await injectLayout();

  try {
    const page = await fetchPageBySlug('security');
    const root = document.getElementById('security-content');
    if (!root) return;

    document.title = `${page.title} | SLStore`;
    root.innerHTML = page.contentHtml;

    initTabs();

    if (window.lucide?.createIcons) {
      window.lucide.createIcons();
    }
  } catch (_error) {
    renderFallback('No se pudo cargar la pagina de seguridad en este momento. Intenta nuevamente en unos minutos.');
  }
}

bootstrap();
