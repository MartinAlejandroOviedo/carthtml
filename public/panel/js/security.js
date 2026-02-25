const topbarRoot = document.getElementById('panel-topbar');
const navRoot = document.getElementById('panel-nav');
const contentRoot = document.getElementById('security-content');

async function ensurePanelSession() {
  const response = await fetch('/api/panel/session');
  if (!response.ok) {
    window.location.replace('/panel/login.html');
    return null;
  }
  return response.json().catch(() => null);
}

async function requestJson(url, options = {}) {
  const response = await fetch(url, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...(options.headers || {})
    }
  });

  const data = await response.json().catch(() => ({}));
  if (response.status === 401) {
    window.location.replace('/panel/login.html');
    return null;
  }
  if (!response.ok) throw new Error(data.error || 'Error de API.');
  return data;
}

async function loadPart(path) {
  const response = await fetch(path);
  if (!response.ok) throw new Error(`No se pudo cargar ${path}`);
  return response.text();
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
    logoutBtn.addEventListener('click', async () => {
      await fetch('/api/panel/logout', { method: 'POST' }).catch(() => null);
      window.location.replace('/panel/login.html');
    });
  }

  setupPanelNavButtons();
  markSecurityNavActive();
}

function renderMessage(message, isError = false) {
  const el = document.getElementById('security-message');
  if (!el) return;
  el.textContent = message || '';
  el.className = isError ? 'text-sm text-rose-300' : 'text-sm text-slate-300';
}

function renderSecurityForm(settings = {}, status = {}) {
  contentRoot.innerHTML = `
    <div class="rounded-2xl border border-white/10 bg-slate-950/40 p-4">
      <div class="flex flex-wrap items-center justify-between gap-3">
        <div>
          <p class="font-display text-2xl uppercase text-white">Seguridad Operativa</p>
          <p class="mt-1 text-sm text-slate-300">
            Solo controles implementados en runtime: headers, rate limit, bloqueo de UA y honeypot.
          </p>
        </div>
        <button
          id="security-refresh"
          type="button"
          class="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-sky-300/30 bg-sky-500/20 text-sky-100 has-tooltip"
          aria-label="Recargar estado"
          data-tooltip="Recargar estado"
        >
          <span class="lucide h-4 w-4" data-lucide="refresh-cw"></span>
        </button>
      </div>
    </div>

    <form id="security-form" class="mt-4 grid gap-3 sm:grid-cols-2 rounded-2xl border border-white/10 bg-slate-900/70 p-4">
      <label class="text-sm text-slate-200 sm:col-span-2">
        Seguridad global
        <select name="enabled" class="mt-1 w-full rounded-xl border border-white/10 bg-slate-950/60 px-3 py-2 text-sm">
          <option value="1" ${Number(settings.enabled) === 1 ? 'selected' : ''}>Activa</option>
          <option value="0" ${Number(settings.enabled) === 0 ? 'selected' : ''}>Desactivada</option>
        </select>
      </label>

      <label class="text-sm text-slate-200">
        Headers de seguridad
        <select name="headersEnabled" class="mt-1 w-full rounded-xl border border-white/10 bg-slate-950/60 px-3 py-2 text-sm">
          <option value="1" ${Number(settings.headersEnabled) === 1 ? 'selected' : ''}>Activos</option>
          <option value="0" ${Number(settings.headersEnabled) === 0 ? 'selected' : ''}>Inactivos</option>
        </select>
      </label>

      <label class="text-sm text-slate-200">
        Bloqueo User-Agent sospechoso
        <select name="blockBadUaEnabled" class="mt-1 w-full rounded-xl border border-white/10 bg-slate-950/60 px-3 py-2 text-sm">
          <option value="1" ${Number(settings.blockBadUaEnabled) === 1 ? 'selected' : ''}>Activo</option>
          <option value="0" ${Number(settings.blockBadUaEnabled) === 0 ? 'selected' : ''}>Inactivo</option>
        </select>
      </label>

      <label class="text-sm text-slate-200 sm:col-span-2">
        Patrones de UA bloqueados (coma separado)
        <input
          name="blockedUaPatterns"
          type="text"
          value="${String(settings.blockedUaPatterns || '').replace(/"/g, '&quot;')}"
          class="mt-1 w-full rounded-xl border border-white/10 bg-slate-950/60 px-3 py-2 text-sm"
        />
      </label>

      <label class="text-sm text-slate-200">
        Rate limit API
        <select name="rateLimitEnabled" class="mt-1 w-full rounded-xl border border-white/10 bg-slate-950/60 px-3 py-2 text-sm">
          <option value="1" ${Number(settings.rateLimitEnabled) === 1 ? 'selected' : ''}>Activo</option>
          <option value="0" ${Number(settings.rateLimitEnabled) === 0 ? 'selected' : ''}>Inactivo</option>
        </select>
      </label>

      <label class="text-sm text-slate-200">
        Ventana rate limit (seg)
        <input
          name="rateLimitWindowSec"
          type="number"
          min="10"
          max="3600"
          value="${Number(settings.rateLimitWindowSec || 60)}"
          class="mt-1 w-full rounded-xl border border-white/10 bg-slate-950/60 px-3 py-2 text-sm"
        />
      </label>

      <label class="text-sm text-slate-200">
        Max requests productos / ventana
        <input
          name="rateLimitMax"
          type="number"
          min="10"
          max="5000"
          value="${Number(settings.rateLimitMax || 120)}"
          class="mt-1 w-full rounded-xl border border-white/10 bg-slate-950/60 px-3 py-2 text-sm"
        />
      </label>

      <label class="text-sm text-slate-200">
        Max pedidos / ventana por IP
        <input
          name="orderRateLimitMax"
          type="number"
          min="1"
          max="1000"
          value="${Number(settings.orderRateLimitMax || 20)}"
          class="mt-1 w-full rounded-xl border border-white/10 bg-slate-950/60 px-3 py-2 text-sm"
        />
      </label>

      <label class="text-sm text-slate-200">
        Honeypot en pedidos
        <select name="honeypotEnabled" class="mt-1 w-full rounded-xl border border-white/10 bg-slate-950/60 px-3 py-2 text-sm">
          <option value="1" ${Number(settings.honeypotEnabled) === 1 ? 'selected' : ''}>Activo</option>
          <option value="0" ${Number(settings.honeypotEnabled) === 0 ? 'selected' : ''}>Inactivo</option>
        </select>
      </label>

      <label class="text-sm text-slate-200">
        Campo honeypot
        <input
          name="honeypotField"
          type="text"
          value="${String(settings.honeypotField || 'website').replace(/"/g, '&quot;')}"
          class="mt-1 w-full rounded-xl border border-white/10 bg-slate-950/60 px-3 py-2 text-sm"
        />
      </label>

      <div class="sm:col-span-2 flex items-center gap-2">
        <button id="security-save" type="submit" class="rounded-xl bg-primary-600 px-4 py-2 text-sm font-semibold text-white">Guardar</button>
        <span id="security-message" class="text-sm text-slate-300"></span>
      </div>
    </form>

    <div class="mt-4 rounded-2xl border border-white/10 bg-slate-900/60 p-4">
      <p class="text-xs uppercase tracking-wide text-slate-400">Estado runtime</p>
      <div class="mt-2 grid gap-2 sm:grid-cols-3 text-sm text-slate-200">
        <p>Buckets activos: <span class="text-sky-300">${Number(status.runtime?.activeRateBuckets || 0)}</span></p>
        <p>Cache seguridad: <span class="text-sky-300">${Number(status.runtime?.cacheAgeMs || 0)} ms</span></p>
        <p>Modulo global: <span class="text-sky-300">${Number(settings.enabled) === 1 ? 'Activo' : 'Inactivo'}</span></p>
      </div>
    </div>
  `;

  const form = document.getElementById('security-form');
  const refreshBtn = document.getElementById('security-refresh');

  if (form) {
    form.addEventListener('submit', async (event) => {
      event.preventDefault();
      const formData = new FormData(form);
      const payload = {
        enabled: Number(formData.get('enabled') || 1),
        headersEnabled: Number(formData.get('headersEnabled') || 1),
        rateLimitEnabled: Number(formData.get('rateLimitEnabled') || 1),
        rateLimitWindowSec: Number(formData.get('rateLimitWindowSec') || 60),
        rateLimitMax: Number(formData.get('rateLimitMax') || 120),
        orderRateLimitMax: Number(formData.get('orderRateLimitMax') || 20),
        blockBadUaEnabled: Number(formData.get('blockBadUaEnabled') || 1),
        blockedUaPatterns: String(formData.get('blockedUaPatterns') || ''),
        honeypotEnabled: Number(formData.get('honeypotEnabled') || 1),
        honeypotField: String(formData.get('honeypotField') || 'website')
      };

      const saveBtn = document.getElementById('security-save');
      if (saveBtn) saveBtn.disabled = true;
      renderMessage('Guardando...');
      try {
        await requestJson('/api/panel/security-settings', {
          method: 'PUT',
          body: JSON.stringify(payload)
        });
        renderMessage('Configuracion de seguridad guardada.');
      } catch (error) {
        renderMessage(error.message, true);
      } finally {
        if (saveBtn) saveBtn.disabled = false;
      }
    });
  }

  if (refreshBtn) {
    refreshBtn.addEventListener('click', async () => {
      await loadSecurityView();
    });
  }

  if (window.lucide?.createIcons) {
    window.lucide.createIcons();
  }
}

async function loadSecurityView() {
  try {
    const [settings, status] = await Promise.all([
      requestJson('/api/panel/security-settings'),
      requestJson('/api/panel/security-status')
    ]);
    renderSecurityForm(settings || {}, status || {});
  } catch (error) {
    contentRoot.innerHTML = `
      <div class="rounded-2xl border border-rose-300/30 bg-rose-500/10 p-4">
        <p class="font-display text-2xl uppercase text-white">Seguridad</p>
        <p class="mt-2 text-sm text-rose-200">${error.message || 'No se pudo cargar seguridad.'}</p>
      </div>
    `;
  }
}

async function bootstrap() {
  await ensurePanelSession();
  await setupLayoutParts();
  await loadSecurityView();
}

bootstrap().catch((error) => {
  contentRoot.innerHTML = `
    <div class="rounded-2xl border border-rose-300/30 bg-rose-500/10 p-4">
      <p class="font-display text-2xl uppercase text-white">Seguridad</p>
      <p class="mt-2 text-sm text-rose-200">${error.message || 'No se pudo cargar seguridad.'}</p>
    </div>
  `;
});
