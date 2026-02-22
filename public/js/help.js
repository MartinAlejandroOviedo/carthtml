import { fetchPageBySlug } from './api.js';
import { injectLayout } from './layout.js';

function renderFallback(message) {
  const root = document.getElementById('help-content');
  if (!root) return;

  root.innerHTML = `
    <section class="mx-auto max-w-6xl px-4 pt-8">
      <div class="rounded-3xl border border-white/10 bg-slate-900/75 p-5 shadow-2xl shadow-slate-950/60">
        <p class="font-display text-4xl uppercase leading-none text-white sm:text-5xl">Ayuda</p>
        <p class="mt-3 max-w-3xl text-sm text-slate-300">${message}</p>
      </div>
    </section>
  `;
}

async function bootstrap() {
  await injectLayout();

  try {
    const page = await fetchPageBySlug('help');
    const root = document.getElementById('help-content');
    if (!root) return;

    document.title = `${page.title} | SLStore`;
    root.innerHTML = page.contentHtml;

    if (window.lucide?.createIcons) {
      window.lucide.createIcons();
    }
  } catch (error) {
    renderFallback('No se pudo cargar la ayuda en este momento. Intenta nuevamente en unos minutos.');
  }
}

bootstrap();
