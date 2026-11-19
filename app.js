(function () {
  'use strict';

  const STONE_TIERS = {
    base: { name: 'Базовая серия', rate: 9000 },
    standard: { name: 'Grandex / Staron / Tristone', rate: 11500 },
    designer: { name: 'LG HI-Macs / Neomarm', rate: 12000 },
    premium: { name: 'Corian DuPont', rate: 13500 }
  };

  const SHAPE_LABELS = {
    straight: 'Прямая',
    'l-shape': 'Г-образная',
    'u-shape': 'П-образная',
    island: 'С островом'
  };

  const state = {
    shape: 'straight',
    a: 280,
    b: 180,
    c: 160,
    depth: 60,
    islandW: 90,
    tier: 'standard',
    decor: 'Grandex S-204 Creamy Sand',
    decorColor: '#E7DFD2',
    hob: true,
    sinkIntegrated: true,
    plinth: true,
    delivery: true,
    deliveryCost: 9500,
    deliveryLabel: 'Москва в пределах МКАД',
    edgeCost: 0,
    edgeLabel: 'Прямая фаска R3 (в подарок)'
  };

  // DOM References
  const shapeBtns = document.querySelectorAll('.shape-btn');
  const tierBtns = document.querySelectorAll('.tier-card');
  const applyStoneBtns = document.querySelectorAll('.apply-stone-btn');

  const dimFields = {
    a: document.querySelector('[data-dim="a"]'),
    b: document.querySelector('[data-dim="b"]'),
    c: document.querySelector('[data-dim="c"]'),
    depth: document.querySelector('[data-dim="depth"]'),
    islandW: document.querySelector('[data-dim="island-w"]')
  };

  const labels = {
    a: document.getElementById('label-a'),
    b: document.getElementById('label-b'),
    c: document.getElementById('label-c')
  };

  const inputs = {
    a: document.getElementById('input-a'),
    b: document.getElementById('input-b'),
    c: document.getElementById('input-c'),
    depth: document.getElementById('input-depth'),
    islandW: document.getElementById('input-island-w')
  };

  const ranges = {
    a: document.getElementById('range-a'),
    b: document.getElementById('range-b'),
    c: document.getElementById('range-c'),
    depth: document.getElementById('range-depth'),
    islandW: document.getElementById('range-island-w')
  };

  const decorSelect = document.getElementById('decor-select');
  const activeSwatch = document.getElementById('active-swatch');
  const optHob = document.getElementById('opt-hob');
  const optSink = document.getElementById('opt-sink-integrated');
  const optPlinth = document.getElementById('opt-plinth');
  const optDelivery = document.getElementById('opt-delivery');
  const deliveryZone = document.getElementById('delivery-zone');
  const zoneWrap = document.getElementById('zone-wrap');
  const edgeProfile = document.getElementById('edge-profile');

  const sinkCostLabel = document.getElementById('sink-cost-label');
  const sinkGiftNote = document.getElementById('sink-gift-note');
  const deliveryCostLabel = document.getElementById('delivery-cost-label');

  const svgEl = document.getElementById('countertop-svg');
  const dimsBadge = document.getElementById('blueprint-dims-badge');
  const metricArea = document.getElementById('metric-area');
  const metricPm = document.getElementById('metric-pm');
  const metricWall = document.getElementById('metric-wall');

  const estimateLines = document.getElementById('estimate-lines');
  const totalPriceEl = document.getElementById('total-price');
  const totalStoneCaption = document.getElementById('total-stone-caption');
  const bonusBadge = document.getElementById('bonus-badge');

  const formSummaryPrice = document.getElementById('form-summary-price');
  const formSummaryText = document.getElementById('form-summary-text');

  const btnResetDims = document.getElementById('reset-dims');
  const btnCopyEstimate = document.getElementById('btn-copy-estimate');
  const measurerForm = document.getElementById('measurer-form');
  const formStatus = document.getElementById('form-status');

  function formatRub(val) {
    return Math.round(val).toString().replace(/\B(?=(\d{3})+(?!\d))/g, ' ') + ' ₽';
  }

  function clamp(val, min, max) {
    return Math.max(min, Math.min(max, val));
  }

  function computeMetrics() {
    const d = state.depth / 100; // meters
    const a = state.a / 100;
    const b = state.b / 100;
    const c = state.c / 100;
    const iw = state.islandW / 100;

    let areaM2 = 0;
    let wallLenM = 0;
    let badgeText = '';

    if (state.shape === 'straight') {
      areaM2 = a * d;
      wallLenM = a;
      badgeText = `${state.a} × ${state.depth} см`;
    } else if (state.shape === 'l-shape') {
      const effB = Math.max(b - d, 0.2);
      areaM2 = a * d + effB * d;
      wallLenM = a + effB;
      badgeText = `${state.a} × ${state.b} см (D ${state.depth})`;
    } else if (state.shape === 'u-shape') {
      const effB = Math.max(b - d, 0.2);
      const effC = Math.max(c - d, 0.2);
      areaM2 = a * d + effB * d + effC * d;
      wallLenM = a + effB + effC;
      badgeText = `${state.c} × ${state.a} × ${state.b} см`;
    } else if (state.shape === 'island') {
      areaM2 = a * d + c * iw;
      wallLenM = a; // пристеночный бортик идет только по основной кухонной линии
      badgeText = `${state.a}×${state.depth} + остров ${state.c}×${state.islandW} см`;
    }

    // Стандартная ставка на stoleshnitsi.com указана за пог.м шириной 60 см.
    // При пересчете через приведенный погонаж (площадь / 0.6) сохраняется честная геометрия для любой глубины и острова.
    const eqPm = areaM2 / 0.6;
    const rate = STONE_TIERS[state.tier].rate;
    const stoneSubtotal = Math.round((eqPm * rate) / 100) * 100;

    const sinkGift = areaM2 >= 5.0;
    const sinkPrice = state.sinkIntegrated ? (sinkGift ? 0 : 14000) : 0;
    const hobPrice = state.hob ? 2500 : 0;
    const plinthPrice = state.plinth ? Math.round(wallLenM * 1200) : 0;
    const edgePrice = state.edgeCost;
    const deliveryPrice = state.delivery ? state.deliveryCost : 0;

    const total = stoneSubtotal + sinkPrice + hobPrice + plinthPrice + edgePrice + deliveryPrice;

    return {
      areaM2,
      eqPm,
      wallLenM,
      badgeText,
      rate,
      stoneSubtotal,
      sinkGift,
      sinkPrice,
      hobPrice,
      plinthPrice,
      edgePrice,
      deliveryPrice,
      total
    };
  }

  function updateVisibility() {
    dimFields.b.classList.toggle('is-hidden', state.shape === 'straight' || state.shape === 'island');
    dimFields.c.classList.toggle('is-hidden', state.shape === 'straight' || state.shape === 'l-shape');
    dimFields.islandW.classList.toggle('is-hidden', state.shape !== 'island');

    if (state.shape === 'island') {
      labels.a.textContent = 'Длина пристенной линии (A)';
      labels.c.textContent = 'Длина острова (C)';
    } else {
      labels.a.textContent = 'Длина основной части (A)';
      labels.b.textContent = 'Длина правого крыла (B)';
      labels.c.textContent = 'Длина левого крыла (C)';
    }

    zoneWrap.style.opacity = state.delivery ? '1' : '0.45';
    deliveryZone.disabled = !state.delivery;
  }

  function createSvgEl(tag, attrs) {
    const el = document.createElementNS('http://www.w3.org/2000/svg', tag);
    for (const [k, v] of Object.entries(attrs)) {
      el.setAttribute(k, v);
    }
    return el;
  }

  function drawDimLine(parent, x1, y1, x2, y2, text, offsetLabelX, offsetLabelY) {
    const g = createSvgEl('g', { class: 'dim-line-group' });
    g.appendChild(createSvgEl('line', {
      x1, y1, x2, y2,
      stroke: '#1E4D5C',
      'stroke-width': '1.2'
    }));

    // Засечки (архитектурные тики)
    const isHoriz = Math.abs(y1 - y2) < 1;
    if (isHoriz) {
      g.appendChild(createSvgEl('line', { x1, y1: y1 - 4, x2: x1, y2: y1 + 4, stroke: '#1E4D5C', 'stroke-width': '1.4' }));
      g.appendChild(createSvgEl('line', { x1: x2, y1: y2 - 4, x2: x2, y2: y2 + 4, stroke: '#1E4D5C', 'stroke-width': '1.4' }));
    } else {
      g.appendChild(createSvgEl('line', { x1: x1 - 4, y1, x2: x1 + 4, y2: y1, stroke: '#1E4D5C', 'stroke-width': '1.4' }));
      g.appendChild(createSvgEl('line', { x1: x2 - 4, y1: y2, x2: x2 + 4, y2: y2, stroke: '#1E4D5C', 'stroke-width': '1.4' }));
    }

    const tx = (x1 + x2) / 2 + (offsetLabelX || 0);
    const ty = (y1 + y2) / 2 + (offsetLabelY || 0);
    const textEl = createSvgEl('text', {
      x: tx,
      y: ty,
      'text-anchor': 'middle',
      'dominant-baseline': 'middle',
      fill: '#171C21',
      'font-family': 'JetBrains Mono, monospace',
      'font-size': '11',
      'font-weight': '600'
    });
    textEl.textContent = text;

    const bgRect = createSvgEl('rect', {
      x: tx - (text.length * 3.8 + 5),
      y: ty - 8,
      width: text.length * 7.6 + 10,
      height: 16,
      rx: 3,
      fill: '#FAF9F6'
    });

    g.appendChild(bgRect);
    g.appendChild(textEl);
    parent.appendChild(g);
  }

  function renderBlueprint() {
    svgEl.innerHTML = '';
    const W = 540;
    const H = 340;
    const padX = 76;
    const padY = 58;

    // Фон с архитектурной сеткой
    const defs = createSvgEl('defs', {});
    const pat = createSvgEl('pattern', {
      id: 'arch-grid',
      width: '20',
      height: '20',
      patternUnits: 'userSpaceOnUse'
    });
    pat.appendChild(createSvgEl('path', {
      d: 'M 20 0 L 0 0 0 20',
      fill: 'none',
      stroke: '#E8E6E0',
      'stroke-width': '0.8'
    }));
    defs.appendChild(pat);
    svgEl.appendChild(defs);
    svgEl.appendChild(createSvgEl('rect', { x: 0, y: 0, width: W, height: H, fill: 'url(#arch-grid)' }));

    // Определение габаритного прямоугольника в см
    const a = state.a;
    const d = state.depth;
    const b = state.b;
    const c = state.c;
    const iw = state.islandW;

    let totalWcm = a;
    let totalHcm = d;
    if (state.shape === 'l-shape') {
      totalHcm = Math.max(b, d + 40);
    } else if (state.shape === 'u-shape') {
      totalHcm = Math.max(b, c, d + 40);
    } else if (state.shape === 'island') {
      totalWcm = Math.max(a, c);
      totalHcm = d + 110 + iw; // проход 110 см между основной линией и островом
    }

    const availW = W - padX * 2;
    const availH = H - padY * 2;
    const scale = Math.min(availW / totalWcm, availH / totalHcm);

    const drawW = totalWcm * scale;
    const drawH = totalHcm * scale;
    const ox = (W - drawW) / 2;
    const oy = (H - drawH) / 2 + 4;

    const pxA = a * scale;
    const pxD = d * scale;
    const pxB = b * scale;
    const pxC = c * scale;
    const pxIW = iw * scale;

    const stoneFill = state.decorColor || '#E7DFD2';
    const stoneStroke = '#171C21';

    const shapeGroup = createSvgEl('g', {});

    // Координаты для размещения выреза под варочную и мойку
    let sinkPos = { x: ox + pxA * 0.22, y: oy + pxD * 0.5 };
    let hobPos = { x: ox + pxA * 0.72, y: oy + pxD * 0.5 };

    if (state.shape === 'straight') {
      const startX = ox + (drawW - pxA) / 2;
      const startY = oy + (drawH - pxD) / 2;
      shapeGroup.appendChild(createSvgEl('rect', {
        x: startX, y: startY, width: pxA, height: pxD,
        fill: stoneFill, stroke: stoneStroke, 'stroke-width': '2', rx: '2'
      }));

      if (state.plinth) {
        shapeGroup.appendChild(createSvgEl('line', {
          x1: startX, y1: startY + 3.5, x2: startX + pxA, y2: startY + 3.5,
          stroke: '#1E4D5C', 'stroke-width': '3'
        }));
      }

      sinkPos = { x: startX + pxA * 0.26, y: startY + pxD * 0.5 };
      hobPos = { x: startX + pxA * 0.72, y: startY + pxD * 0.5 };

      drawDimLine(svgEl, startX, startY - 22, startX + pxA, startY - 22, `A = ${state.a} см`, 0, 0);
      drawDimLine(svgEl, startX - 24, startY, startX - 24, startY + pxD, `${state.depth} см`, 0, 0);
    } else if (state.shape === 'l-shape') {
      const pathD = `M ${ox} ${oy} H ${ox + pxA} V ${oy + pxB} H ${ox + pxA - pxD} V ${oy + pxD} H ${ox} Z`;
      shapeGroup.appendChild(createSvgEl('path', {
        d: pathD, fill: stoneFill, stroke: stoneStroke, 'stroke-width': '2', 'stroke-linejoin': 'round'
      }));

      if (state.plinth) {
        shapeGroup.appendChild(createSvgEl('path', {
          d: `M ${ox + 2} ${oy + 3.5} H ${ox + pxA - 3.5} V ${oy + pxB - 2}`,
          fill: 'none', stroke: '#1E4D5C', 'stroke-width': '3'
        }));
      }

      sinkPos = { x: ox + pxA * 0.34, y: oy + pxD * 0.5 };
      hobPos = { x: ox + pxA - pxD * 0.5, y: oy + Math.max(pxD + 22, pxB * 0.62) };

      drawDimLine(svgEl, ox, oy - 22, ox + pxA, oy - 22, `A = ${state.a} см`, 0, 0);
      drawDimLine(svgEl, ox + pxA + 26, oy, ox + pxA + 26, oy + pxB, `B = ${state.b} см`, 0, 0);
      drawDimLine(svgEl, ox - 24, oy, ox - 24, oy + pxD, `${state.depth}`, 0, 0);
    } else if (state.shape === 'u-shape') {
      const pathD = `M ${ox} ${oy} H ${ox + pxA} V ${oy + pxB} H ${ox + pxA - pxD} V ${oy + pxD} H ${ox + pxD} V ${oy + pxC} H ${ox} Z`;
      shapeGroup.appendChild(createSvgEl('path', {
        d: pathD, fill: stoneFill, stroke: stoneStroke, 'stroke-width': '2', 'stroke-linejoin': 'round'
      }));

      if (state.plinth) {
        shapeGroup.appendChild(createSvgEl('path', {
          d: `M ${ox + 3.5} ${oy + pxC - 2} V ${oy + 3.5} H ${ox + pxA - 3.5} V ${oy + pxB - 2}`,
          fill: 'none', stroke: '#1E4D5C', 'stroke-width': '3'
        }));
      }

      sinkPos = { x: ox + pxA * 0.5, y: oy + pxD * 0.5 };
      hobPos = { x: ox + pxA - pxD * 0.5, y: oy + Math.max(pxD + 22, pxB * 0.62) };

      drawDimLine(svgEl, ox, oy - 22, ox + pxA, oy - 22, `A = ${state.a} см`, 0, 0);
      drawDimLine(svgEl, ox + pxA + 26, oy, ox + pxA + 26, oy + pxB, `B = ${state.b} см`, 0, 0);
      drawDimLine(svgEl, ox - 26, oy, ox - 26, oy + pxC, `C = ${state.c} см`, 0, 0);
    } else if (state.shape === 'island') {
      const mainX = ox + (drawW - pxA) / 2;
      const islX = ox + (drawW - pxC) / 2;
      const gapPx = 110 * scale;
      const islY = oy + pxD + gapPx;

      // Основная линия у стены
      shapeGroup.appendChild(createSvgEl('rect', {
        x: mainX, y: oy, width: pxA, height: pxD,
        fill: stoneFill, stroke: stoneStroke, 'stroke-width': '2', rx: '2'
      }));
      if (state.plinth) {
        shapeGroup.appendChild(createSvgEl('line', {
          x1: mainX, y1: oy + 3.5, x2: mainX + pxA, y2: oy + 3.5,
          stroke: '#1E4D5C', 'stroke-width': '3'
        }));
      }

      // Остров
      shapeGroup.appendChild(createSvgEl('rect', {
        x: islX, y: islY, width: pxC, height: pxIW,
        fill: stoneFill, stroke: stoneStroke, 'stroke-width': '2', rx: '2'
      }));

      sinkPos = { x: mainX + pxA * 0.5, y: oy + pxD * 0.5 };
      hobPos = { x: islX + pxC * 0.5, y: islY + pxIW * 0.5 };

      drawDimLine(svgEl, mainX, oy - 22, mainX + pxA, oy - 22, `A = ${state.a} см`, 0, 0);
      drawDimLine(svgEl, islX, islY + pxIW + 20, islX + pxC, islY + pxIW + 20, `Остров C = ${state.c} см`, 0, 0);
      drawDimLine(svgEl, islX - 24, islY, islX - 24, islY + pxIW, `${state.islandW} см`, 0, 0);
    }

    svgEl.appendChild(shapeGroup);

    // Обозначение интегрированной мойки
    if (state.sinkIntegrated) {
      const sw = Math.min(38, pxD * 0.68);
      const sh = Math.min(28, pxD * 0.55);
      const sg = createSvgEl('g', {});
      sg.appendChild(createSvgEl('rect', {
        x: sinkPos.x - sw / 2,
        y: sinkPos.y - sh / 2,
        width: sw,
        height: sh,
        rx: '4',
        fill: '#FAF9F6',
        stroke: '#1E4D5C',
        'stroke-width': '1.5'
      }));
      sg.appendChild(createSvgEl('circle', {
        cx: sinkPos.x,
        cy: sinkPos.y,
        r: '3',
        fill: '#1E4D5C'
      }));
      svgEl.appendChild(sg);
    }

    // Обозначение варочной панели
    if (state.hob) {
      const hw = Math.min(40, pxD * 0.72);
      const hh = Math.min(30, pxD * 0.6);
      const hg = createSvgEl('g', {});
      hg.appendChild(createSvgEl('rect', {
        x: hobPos.x - hw / 2,
        y: hobPos.y - hh / 2,
        width: hw,
        height: hh,
        rx: '2',
        fill: '#171C21',
        'fill-opacity': '0.09',
        stroke: '#171C21',
        'stroke-width': '1.5',
        'stroke-dasharray': '3 2'
      }));
      const rOffsetX = hw * 0.24;
      const rOffsetY = hh * 0.24;
      [
        [-rOffsetX, -rOffsetY],
        [rOffsetX, -rOffsetY],
        [-rOffsetX, rOffsetY],
        [rOffsetX, rOffsetY]
      ].forEach(([dx, dy]) => {
        hg.appendChild(createSvgEl('circle', {
          cx: hobPos.x + dx,
          cy: hobPos.y + dy,
          r: '4',
          fill: 'none',
          stroke: '#171C21',
          'stroke-width': '1.2'
        }));
      });
      svgEl.appendChild(hg);
    }

    // Легенда внизу чертежа
    const legendText = createSvgEl('text', {
      x: 16,
      y: H - 12,
      fill: '#6C7680',
      'font-family': 'Manrope, sans-serif',
      'font-size': '11',
      'font-weight': '600'
    });
    const legendParts = [];
    if (state.plinth) legendParts.push('Синяя линия: бортик у стены');
    if (state.sinkIntegrated) legendParts.push('Мойка');
    if (state.hob) legendParts.push('Варочная');
    legendText.textContent = legendParts.length ? legendParts.join(' · ') : 'Чистое полотно без вырезов';
    svgEl.appendChild(legendText);
  }

  function renderEstimate(m) {
    dimsBadge.textContent = m.badgeText;
    metricArea.textContent = m.areaM2.toFixed(2) + ' м²';
    metricPm.textContent = m.eqPm.toFixed(2) + ' пог.м';
    metricWall.textContent = m.wallLenM.toFixed(2) + ' м';

    if (m.sinkGift) {
      sinkCostLabel.textContent = 'Подарок (0 ₽)';
      sinkGiftNote.textContent = 'Площадь от 5 м²: мойка из камня в подарок';
    } else {
      sinkCostLabel.textContent = '+14 000 ₽';
      sinkGiftNote.textContent = 'Бесшовная вклейка в цвет (от 5 м² в подарок)';
    }

    deliveryCostLabel.textContent = state.delivery ? `+${formatRub(state.deliveryCost)}` : 'Самовывоз';

    const rows = [
      {
        label: `Полотно камня (${m.eqPm.toFixed(2)} м × ${formatRub(m.rate)})`,
        val: formatRub(m.stoneSubtotal),
        gift: false
      }
    ];

    if (state.hob) {
      rows.push({ label: 'Вырез под варочную панель на ЧПУ', val: formatRub(m.hobPrice), gift: false });
    }
    if (state.sinkIntegrated) {
      rows.push({
        label: 'Интегрированная мойка из камня',
        val: m.sinkGift ? 'В подарок' : formatRub(m.sinkPrice),
        gift: m.sinkGift
      });
    }
    if (state.plinth) {
      rows.push({ label: `Пристеночный бортик (${m.wallLenM.toFixed(2)} м)`, val: formatRub(m.plinthPrice), gift: false });
    }
    if (state.edgeCost > 0) {
      rows.push({ label: state.edgeLabel, val: formatRub(m.edgePrice), gift: false });
    } else {
      rows.push({ label: 'Торцевая кромка R3', val: 'В подарок', gift: true });
    }
    if (state.delivery) {
      rows.push({ label: `Доставка и монтаж (${state.deliveryLabel})`, val: formatRub(m.deliveryPrice), gift: false });
    }
    rows.push({ label: 'Разделочная доска в тон камня', val: 'В подарок', gift: true });

    estimateLines.innerHTML = rows.map((r) => `
      <div class="est-row${r.gift ? ' is-gift' : ''}">
        <dt>${r.label}</dt>
        <dd>${r.val}</dd>
      </div>
    `).join('');

    totalPriceEl.textContent = formatRub(m.total);
    totalStoneCaption.textContent = `${STONE_TIERS[state.tier].name} · ${state.decor}`;
    bonusBadge.textContent = m.sinkGift ? 'Мойка + доска в подарок' : 'Доска и кромка в подарок';

    const summaryText = `${SHAPE_LABELS[state.shape]} столешница ${m.badgeText} (${m.areaM2.toFixed(2)} м²) | ${state.decor}`;
    formSummaryPrice.textContent = formatRub(m.total);
    formSummaryText.textContent = summaryText;
  }

  function updateAll() {
    updateVisibility();
    const metrics = computeMetrics();
    renderBlueprint();
    renderEstimate(metrics);
  }

  // Привязка формы
  shapeBtns.forEach((btn) => {
    btn.addEventListener('click', () => {
      shapeBtns.forEach((b) => {
        b.classList.remove('is-active');
        b.setAttribute('aria-pressed', 'false');
      });
      btn.classList.add('is-active');
      btn.setAttribute('aria-pressed', 'true');
      state.shape = btn.dataset.shape;
      updateAll();
    });
  });

  // Двусторонняя привязка number и range
  function bindDimension(key, min, max) {
    const numEl = inputs[key];
    const rngEl = ranges[key];

    rngEl.addEventListener('input', () => {
      const v = Number(rngEl.value);
      numEl.value = v;
      state[key] = v;
      updateAll();
    });

    numEl.addEventListener('input', () => {
      const raw = Number(numEl.value);
      if (!Number.isNaN(raw)) {
        const clamped = clamp(raw, min, max);
        rngEl.value = clamped;
        state[key] = clamped;
        updateAll();
      }
    });

    numEl.addEventListener('blur', () => {
      const clamped = clamp(Number(numEl.value) || min, min, max);
      numEl.value = clamped;
      rngEl.value = clamped;
      state[key] = clamped;
      updateAll();
    });
  }

  bindDimension('a', 80, 600);
  bindDimension('b', 80, 450);
  bindDimension('c', 80, 450);
  bindDimension('depth', 40, 120);
  bindDimension('islandW', 60, 140);

  function selectTier(tierKey) {
    state.tier = tierKey;
    tierBtns.forEach((btn) => {
      const active = btn.dataset.tier === tierKey;
      btn.classList.toggle('is-active', active);
      btn.setAttribute('aria-pressed', active ? 'true' : 'false');
    });
  }

  tierBtns.forEach((btn) => {
    btn.addEventListener('click', () => {
      selectTier(btn.dataset.tier);
      // Подберем первый подходящий декор для выбранной категории
      const match = Array.from(decorSelect.options).find((o) => o.dataset.tier === state.tier);
      if (match) {
        decorSelect.value = match.value;
        state.decor = match.value;
        state.decorColor = match.dataset.color || '#E7DFD2';
        activeSwatch.style.backgroundColor = state.decorColor;
      }
      updateAll();
    });
  });

  decorSelect.addEventListener('change', () => {
    const opt = decorSelect.options[decorSelect.selectedIndex];
    state.decor = opt.value;
    state.decorColor = opt.dataset.color || '#E7DFD2';
    activeSwatch.style.backgroundColor = state.decorColor;
    if (opt.dataset.tier) {
      selectTier(opt.dataset.tier);
    }
    updateAll();
  });

  applyStoneBtns.forEach((btn) => {
    btn.addEventListener('click', () => {
      const tier = btn.dataset.tier;
      const decor = btn.dataset.decor;
      selectTier(tier);
      const match = Array.from(decorSelect.options).find((o) => o.value === decor);
      if (match) {
        decorSelect.value = match.value;
        state.decor = match.value;
        state.decorColor = match.dataset.color || '#E7DFD2';
        activeSwatch.style.backgroundColor = state.decorColor;
      }
      updateAll();
      document.getElementById('calculator').scrollIntoView({ behavior: 'smooth' });
    });
  });

  optHob.addEventListener('change', () => { state.hob = optHob.checked; updateAll(); });
  optSink.addEventListener('change', () => { state.sinkIntegrated = optSink.checked; updateAll(); });
  optPlinth.addEventListener('change', () => { state.plinth = optPlinth.checked; updateAll(); });
  optDelivery.addEventListener('change', () => { state.delivery = optDelivery.checked; updateAll(); });

  deliveryZone.addEventListener('change', () => {
    const opt = deliveryZone.options[deliveryZone.selectedIndex];
    state.deliveryCost = Number(opt.value);
    state.deliveryLabel = opt.dataset.label;
    updateAll();
  });

  edgeProfile.addEventListener('change', () => {
    const opt = edgeProfile.options[edgeProfile.selectedIndex];
    state.edgeCost = Number(opt.value);
    state.edgeLabel = opt.dataset.label;
    updateAll();
  });

  btnResetDims.addEventListener('click', () => {
    state.a = 280;
    state.b = 180;
    state.c = 160;
    state.depth = 60;
    state.islandW = 90;
    inputs.a.value = ranges.a.value = 280;
    inputs.b.value = ranges.b.value = 180;
    inputs.c.value = ranges.c.value = 160;
    inputs.depth.value = ranges.depth.value = 60;
    inputs.islandW.value = ranges.islandW.value = 90;
    updateAll();
  });

  function buildPlainSummary() {
    const m = computeMetrics();
    return [
      'Расчет столешницы Stoleshnitsi.com',
      `Конфигурация: ${SHAPE_LABELS[state.shape]}`,
      `Габариты: ${m.badgeText}`,
      `Площадь: ${m.areaM2.toFixed(2)} м² (${m.eqPm.toFixed(2)} пог.м)`,
      `Материал: ${STONE_TIERS[state.tier].name} / ${state.decor} (${formatRub(m.rate)}/пог.м)`,
      `Вырез под варочную: ${state.hob ? 'Да' : 'Нет'}`,
      `Интегрированная мойка: ${state.sinkIntegrated ? (m.sinkGift ? 'Да (в подарок от 5 м²)' : 'Да') : 'Нет'}`,
      `Пристеночный бортик: ${state.plinth ? 'Да' : 'Нет'}`,
      `Кромка: ${state.edgeLabel}`,
      `Доставка и монтаж: ${state.delivery ? state.deliveryLabel : 'Самовывоз'}`,
      `Итого ориентировочно: ${formatRub(m.total)}`
    ].join('\n');
  }

  btnCopyEstimate.addEventListener('click', () => {
    const text = buildPlainSummary();
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(text).then(() => {
        const span = btnCopyEstimate.querySelector('span');
        span.textContent = 'Смета скопирована';
        setTimeout(() => { span.textContent = 'Скопировать расчет'; }, 2000);
      });
    }
  });

  measurerForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const name = document.getElementById('client-name').value.trim();
    const phone = document.getElementById('client-phone').value.trim();
    const address = document.getElementById('client-address').value.trim();
    const comment = document.getElementById('client-comment').value.trim();

    const bodyLines = [
      `Имя: ${name}`,
      `Телефон: ${phone}`,
      address ? `Адрес замера: ${address}` : null,
      comment ? `Комментарий: ${comment}` : null,
      '',
      buildPlainSummary()
    ].filter((line) => line !== null);

    const subject = encodeURIComponent(`Заявка на замер столешницы (${SHAPE_LABELS[state.shape]}, ${totalPriceEl.textContent})`);
    const body = encodeURIComponent(bodyLines.join('\n'));
    const mailtoHref = `mailto:info@stoleshnitsi.com?subject=${subject}&body=${body}`;

    formStatus.textContent = 'Письмо с расчетом сформировано для info@stoleshnitsi.com';
    window.location.href = mailtoHref;
  });

  // Инициализация
  activeSwatch.style.backgroundColor = state.decorColor;
  updateAll();
})();
