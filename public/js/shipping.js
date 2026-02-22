import { formatArs } from './products.js';

const ZONE_MULTIPLIER = {
  amba: 1,
  centro: 1.14,
  litoral: 1.22,
  cuyo: 1.28,
  noa: 1.35,
  patagonia: 1.5
};

const DELIVERY_BY_ZONE = {
  amba: { clasico: '2 a 4 dias habiles', expreso: '1 a 2 dias habiles' },
  centro: { clasico: '3 a 5 dias habiles', expreso: '2 a 3 dias habiles' },
  litoral: { clasico: '4 a 6 dias habiles', expreso: '2 a 4 dias habiles' },
  cuyo: { clasico: '4 a 7 dias habiles', expreso: '3 a 5 dias habiles' },
  noa: { clasico: '5 a 8 dias habiles', expreso: '3 a 6 dias habiles' },
  patagonia: { clasico: '6 a 9 dias habiles', expreso: '4 a 7 dias habiles' }
};

function getWeightMultiplier(weightKg) {
  if (weightKg <= 0.5) return 0.92;
  if (weightKg <= 1) return 1;
  if (weightKg <= 3) return 1.22;
  if (weightKg <= 5) return 1.44;
  if (weightKg <= 10) return 1.9;
  return 2.45;
}

function estimateShipping({ zone, service, weightKg, declaredValue }) {
  const base = service === 'expreso' ? 8900 : 6200;
  const zoneMultiplier = ZONE_MULTIPLIER[zone] || 1;
  const weightMultiplier = getWeightMultiplier(weightKg);
  const insurance = declaredValue > 0 ? declaredValue * 0.012 : 0;

  const subtotal = base * zoneMultiplier * weightMultiplier;
  const total = Math.round(subtotal + insurance);

  return {
    total,
    eta: DELIVERY_BY_ZONE[zone]?.[service] || '-',
    insurance: Math.round(insurance)
  };
}

export function setupShippingQuote() {
  const form = document.getElementById('shipping-form');
  const zoneEl = document.getElementById('shipping-zone');
  const serviceEl = document.getElementById('shipping-service');
  const weightEl = document.getElementById('shipping-weight');
  const declaredEl = document.getElementById('shipping-declared');
  const priceEl = document.getElementById('shipping-price');
  const timeEl = document.getElementById('shipping-time');
  const noteEl = document.getElementById('shipping-note');

  if (!form || !zoneEl || !serviceEl || !weightEl || !declaredEl || !priceEl || !timeEl || !noteEl) return;

  const recalc = () => {
    const zone = zoneEl.value;
    const service = serviceEl.value;
    const weightKg = Math.max(0.1, Number(weightEl.value) || 0.1);
    const declaredValue = Math.max(0, Number(declaredEl.value) || 0);

    const result = estimateShipping({ zone, service, weightKg, declaredValue });

    priceEl.textContent = formatArs(result.total);
    timeEl.textContent = result.eta;
    noteEl.textContent =
      result.insurance > 0
        ? `Incluye seguro estimado de ${formatArs(result.insurance)} por valor declarado.`
        : 'Sin seguro adicional. Para incluir cobertura, ingresa valor declarado.';
  };

  ['input', 'change'].forEach((eventName) => {
    form.addEventListener(eventName, recalc);
  });

  recalc();
}
