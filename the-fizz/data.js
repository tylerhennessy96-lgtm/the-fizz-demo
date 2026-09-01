// ── THE FIZZ / Dynamica SmartRents Seed Data ─────────────────
// Student accommodation portfolio across Germany, Austria, the
// Netherlands and Czech Republic. All prices are monthly EUR.

// Demo "today" — booking curves and pace are anchored to this date,
// mid-season for the Sep/Oct 2026 move-in cohort.
const DEMO_TODAY = new Date(2026, 4, 15); // 15 May 2026

// ── Seeded RNG (stable across reloads) ───────────────────────
function _hashStr(s) {
  let h = 2166136261 >>> 0;
  for (let i = 0; i < s.length; i++) {
    h ^= s.charCodeAt(i);
    h = Math.imul(h, 16777619) >>> 0;
  }
  return h >>> 0;
}
function _mulberry32(seed) {
  let a = seed >>> 0;
  return function () {
    a = (a + 0x6D2B79F5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}
function rngFor(key) { return _mulberry32(_hashStr(key)); }
function rpick(rng, lo, hi) { return lo + rng() * (hi - lo); }
function rpickInt(rng, lo, hi) { return Math.round(rpick(rng, lo, hi)); }

// ── Geography ────────────────────────────────────────────────
const COUNTRIES = ['All Countries', 'Germany', 'Austria', 'Netherlands', 'Czech Republic'];

const CITIES = {
  'All Countries': ['All Cities'],
  'Germany': ['All Cities', 'Berlin', 'Hamburg', 'Munich', 'Frankfurt', 'Freiburg', 'Bremen'],
  'Austria': ['All Cities', 'Vienna'],
  'Netherlands': ['All Cities', 'Utrecht', 'Leiden'],
  'Czech Republic': ['All Cities', 'Prague'],
};

const ALL_AMENITIES = ['Rooftop Terrace','Study Rooms','Movie Lounge','Community Kitchen','Laundry Room','Gym','Bike Storage','Package Service','Game Zone','Co-working Space','Music Room','Courtyard'];

// ── Houses (real THE FIZZ locations) ─────────────────────────
const _HOUSES_RAW = [
  { id: 'FZZ-001', name: 'THE FIZZ Berlin Kreuzberg',     country: 'Germany',        city: 'Berlin',   rm: 'Lena Hoffmann',   hm: 'Jonas Weber',     baseSingle: 1205 },
  { id: 'FZZ-002', name: 'THE FIZZ Berlin Friedrichshain',country: 'Germany',        city: 'Berlin',   rm: 'Lena Hoffmann',   hm: 'Marta Kowalska',  baseSingle: 1240 },
  { id: 'FZZ-003', name: 'THE FIZZ Hamburg Altona',       country: 'Germany',        city: 'Hamburg',  rm: 'Lena Hoffmann',   hm: 'Felix Brandt',    baseSingle: 1095 },
  { id: 'FZZ-004', name: 'THE FIZZ Hamburg Hammerbrook',  country: 'Germany',        city: 'Hamburg',  rm: 'David Meyer',     hm: 'Felix Brandt',    baseSingle: 1060 },
  { id: 'FZZ-005', name: 'THE FIZZ Munich',               country: 'Germany',        city: 'Munich',   rm: 'David Meyer',     hm: 'Sophie Bauer',    baseSingle: 1345 },
  { id: 'FZZ-006', name: 'THE FIZZ Frankfurt',            country: 'Germany',        city: 'Frankfurt',rm: 'David Meyer',     hm: 'Sophie Bauer',    baseSingle: 1030 },
  { id: 'FZZ-007', name: 'THE FIZZ Freiburg Mitte',       country: 'Germany',        city: 'Freiburg', rm: 'Anna Novak',      hm: 'Tim Schuster',    baseSingle: 950  },
  { id: 'FZZ-008', name: 'THE FIZZ Bremen',               country: 'Germany',        city: 'Bremen',   rm: 'Anna Novak',      hm: 'Tim Schuster',    baseSingle: 820  },
  { id: 'FZZ-009', name: 'THE FIZZ Vienna Main Station',  country: 'Austria',        city: 'Vienna',   rm: 'Anna Novak',      hm: 'Clara Steiner',   baseSingle: 895  },
  { id: 'FZZ-010', name: 'THE FIZZ Vienna Brigittenau',   country: 'Austria',        city: 'Vienna',   rm: 'Pieter de Vries', hm: 'Clara Steiner',   baseSingle: 860  },
  { id: 'FZZ-011', name: 'THE FIZZ Utrecht',              country: 'Netherlands',    city: 'Utrecht',  rm: 'Pieter de Vries', hm: 'Emma Visser',     baseSingle: 1120 },
  { id: 'FZZ-012', name: 'THE FIZZ Prague',               country: 'Czech Republic', city: 'Prague',   rm: 'Pieter de Vries', hm: 'Jakub Dvorak',    baseSingle: 780  },
];

const HOUSES = _HOUSES_RAW.map((h, i) => {
  const r = rngFor('house|' + h.id);
  return {
    ...h,
    yearBuilt: 2013 + rpickInt(r, 0, 12),
    totalBeds: rpickInt(r, 180, 420),
    amenities: ALL_AMENITIES.filter(() => r() > 0.4),
  };
});
// Backwards-compat alias — several pages iterate COMMUNITIES.
const COMMUNITIES = HOUSES;

const REVENUE_MANAGERS = ['All RMs', 'Lena Hoffmann', 'David Meyer', 'Anna Novak', 'Pieter de Vries'];
const HOUSE_MANAGERS = ['All HMs', 'Jonas Weber', 'Marta Kowalska', 'Felix Brandt', 'Sophie Bauer', 'Tim Schuster', 'Clara Steiner', 'Emma Visser', 'Jakub Dvorak'];

// ── Room types ───────────────────────────────────────────────
const UNIT_TYPES = ['Single Studio', 'Double Studio'];
const DOUBLE_MULT = 1.25;   // Double Studio ≈ +25% over Single

// ── Stay types ───────────────────────────────────────────────
// Premiums are relative to Full Year Stay (the default shown in the table).
// Plug&Play = fully serviced all-in package (linens, kitchen box, cleaning).
const STAY_TYPES = [
  { id: 'full_year',      label: 'Full Year Stay',            short: 'Full Year',      months: 12, premiumPct: 0   },
  { id: 'full_year_pp',   label: 'Full Year Stay Plug&Play',  short: 'Full Year P&P',  months: 12, premiumPct: 8   },
  { id: 'long_term',      label: 'Long Term',                 short: 'Long Term',      months: 24, premiumPct: -4  },
  { id: 'semester',       label: 'Semester Stay',             short: 'Semester',       months: 6,  premiumPct: 12  },
  { id: 'semester_pp',    label: 'Semester Stay Plug&Play',   short: 'Semester P&P',   months: 6,  premiumPct: 20  },
];
const DEFAULT_STAY_TYPE = 'full_year';

// ── Move-in dates (hold-time pricing) ────────────────────────
// Students can start Sep 1 or Oct 1. October delays revenue by a month,
// so it carries a hold-time premium.
const MOVE_IN_DATES = [
  { id: 'sep1', label: 'Sep 1, 2026', short: 'Sep 1', iso: '2026-09-01', premiumPct: 0 },
  { id: 'oct1', label: 'Oct 1, 2026', short: 'Oct 1', iso: '2026-10-01', premiumPct: 5 },
];
const DEFAULT_MOVE_IN = 'sep1';

function stayTypeById(id) { return STAY_TYPES.find(s => s.id === id) || STAY_TYPES[0]; }
function moveInById(id)   { return MOVE_IN_DATES.find(m => m.id === id) || MOVE_IN_DATES[0]; }

// Price for a given base rate + stay type + move-in date. Base rates are
// the Full Year / Sep 1 reference; everything else derives from premiums.
function priceFor(baseRate, stayTypeId, moveInId) {
  const st = stayTypeById(stayTypeId);
  const mi = moveInById(moveInId);
  return Math.round(baseRate * (1 + st.premiumPct / 100) * (1 + mi.premiumPct / 100));
}

// ── Demand levels (drives the price recommendation) ──────────
const DEMAND_LEVELS = {
  5: { level: 5, code: 'DL5', label: 'Very high demand',   interp: 'Strong outperformance vs. expected bookings' },
  4: { level: 4, code: 'DL4', label: 'High demand',        interp: 'Bookings clearly above expectation' },
  3: { level: 3, code: 'DL3', label: 'Standard demand',    interp: 'In line with expectation' },
  2: { level: 2, code: 'DL2', label: 'Low demand',         interp: 'Bookings below expectation' },
  1: { level: 1, code: 'DL1', label: 'Very low demand',    interp: 'Significant underperformance' },
};
function demandPpt(score) { return Math.round((score - 45) * 0.55); }
function signedPpt(ppt) { return (ppt > 0 ? '+' : '') + ppt + 'ppt'; }
function demandLevelFor(ppt) {
  if (ppt >= 20)  return DEMAND_LEVELS[5];
  if (ppt >= 10)  return DEMAND_LEVELS[4];
  if (ppt >= -5)  return DEMAND_LEVELS[3];
  if (ppt >= -12) return DEMAND_LEVELS[2];
  return DEMAND_LEVELS[1];
}
function demandLevelForScore(score) { return demandLevelFor(demandPpt(score)); }
const DEMAND_SHORT = { 5: 'Very high', 4: 'High', 3: 'Standard', 2: 'Low', 1: 'Very low' };

// ── Notes pool ───────────────────────────────────────────────
const NOTE_TEXTS = [
  'Holding rate pending university intake data',
  'RM approved override',
  'Do not discount — corporate nomination block',
  'High demand floor',
  'Erasmus cohort pricing',
  'Rate matched to sister house',
  'Below market — strategic hold',
  'Pending refurbishment premium',
];

function makeNote(rng) {
  if (rng() > 0.35) return null;
  const text = NOTE_TEXTS[Math.floor(rng() * NOTE_TEXTS.length)];
  const d = new Date(DEMO_TODAY);
  d.setDate(d.getDate() + Math.floor(rng() * 60) + 7);
  const expires = String(d.getMonth() + 1).padStart(2, '0') + '/' + String(d.getDate()).padStart(2, '0') + '/' + String(d.getFullYear()).slice(-2);
  return { text, expires };
}

// ── Room-type metrics ────────────────────────────────────────
// Booking curves, pace and demand live at the house × room-type level
// (bookings are for a bed of a type, not a specific apartment). Units
// below carry only their own rate + recommendation.
function makeRoomTypeMetrics(house, roomType) {
  const isDouble = roomType === 'Double Studio';
  const r = rngFor('rtm|' + house.id + '|' + roomType);

  // Season forecast for this room-type cluster; sold = confirmed to date.
  const fcst = isDouble ? rpickInt(r, 40, 90) : rpickInt(r, 90, 200);
  const sellThrough = rpick(r, 0.35, 0.95);
  const sold = Math.round(fcst * sellThrough);

  // Pace vs last-year benchmark (%). Benchmark sell-through at T-108
  // days out is ~62%.
  const benchmarkSellThrough = 0.62;
  const ros = Math.round((sellThrough / benchmarkSellThrough - 1) * 100 + rpick(r, -4, 4));

  // Demand score 0-100 → DL1..DL5
  let dsBase = 46;
  if (['Berlin', 'Munich', 'Utrecht'].includes(house.city)) dsBase += 14;
  if (['Bremen', 'Prague'].includes(house.city)) dsBase -= 12;
  if (isDouble) dsBase -= 5;
  const demand = Math.max(6, Math.min(99, Math.round(dsBase + rpick(r, -16, 16))));

  // Projected occupancy at move-in (%)
  const projOcc = Math.min(100, Math.round((sellThrough / benchmarkSellThrough) * 88 + rpick(r, -4, 6)));

  return { fcst, sold, ros, demand, projOcc };
}

// ── Unit factory ─────────────────────────────────────────────
// A "unit" is an apartment within a house. Its recommendation is driven
// by the room-type demand level, with per-unit rate variation.
function makeUnits(house, roomType, count, rtMetrics) {
  const isDouble = roomType === 'Double Studio';
  const baseRate = Math.round(house.baseSingle * (isDouble ? DOUBLE_MULT : 1));
  const dl = demandLevelFor(demandPpt(rtMetrics.demand)).level;
  return Array.from({ length: count }, (_, i) => {
    const num = String(i + 1).padStart(3, '0');
    const typeSlug = isDouble ? 'DBL' : 'SGL';
    const unitId = `${house.id}-${typeSlug}-${num}`;
    const r = rngFor('unit|' + unitId);

    // Small per-unit rate variation (floor, view, size)
    const rate = Math.round((baseRate + rpickInt(r, -3, 5) * 10) / 5) * 5;

    // ── Recommendation engine (rules-driven, off the room-type DL) ──
    let rec = rate;
    if      (dl === 5) rec = Math.round(rate * rpick(r, 1.04, 1.08));
    else if (dl === 4) rec = Math.round(rate * rpick(r, 1.02, 1.045));
    else if (dl === 2) rec = Math.round(rate * rpick(r, 0.955, 0.98));
    else if (dl === 1) rec = Math.round(rate * rpick(r, 0.90, 0.945));
    rec = Math.round(rec / 5) * 5;
    const pctChange = Math.round(((rec - rate) / rate) * 1000) / 10;

    const status = r() < 0.55 ? 'vacant' : 'on notice';

    return {
      id: unitId,
      houseId: house.id,
      roomType,
      status,                    // 'vacant' | 'on notice' (resident leaving before season)
      rate,                      // current price — Full Year / Sep 1 reference
      rec,                       // recommended price (same reference)
      pctChange,
      floor: rpickInt(r, 1, 8),
      area: isDouble ? rpickInt(r, 45, 57) : rpickInt(r, 16, 36),
      lock: null,                // session-only price lock
      note: makeNote(r),
      priorYearRate: Math.round(rate * rpick(r, 0.93, 0.985) / 5) * 5,
    };
  });
}

// ── Alerts ───────────────────────────────────────────────────
const ALERT_DEFAULTS = {
  lowPace:    { enabled: true, threshold: -15 },   // pace % below
  highDemand: { enabled: true, threshold: 80 },
  lowDemand:  { enabled: true, threshold: 25 },
};

const ALERT_META = {
  lowPace:    { label: 'Low pace',    color: '#ea580c' },
  highDemand: { label: 'High demand', color: '#16a34a' },
  lowDemand:  { label: 'Low demand',  color: '#2563eb' },
};

const ALERT_ICONS = {
  lowPace:    '<svg viewBox="0 0 10 10" width="10" height="10" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><polyline points="1.5,3 4,5.5 6,4 8,6.5"/><polygon points="6.5,8.7 8.7,8.7 8.7,5.5" fill="currentColor" stroke="none"/></svg>',
  highDemand: '<svg viewBox="0 0 10 10" width="10" height="10" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><polyline points="1.5,6.5 4,4 6,5.5 8.5,2"/><polyline points="6.3,2 8.5,2 8.5,4.2"/></svg>',
  lowDemand:  '<svg viewBox="0 0 10 10" width="10" height="10" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><polyline points="1.5,3.5 4,6 6,4.5 8.5,8"/><polyline points="6.3,8 8.5,8 8.5,5.8"/></svg>',
};

const ALERT_ORDER = ['lowPace', 'highDemand', 'lowDemand'];

function makeAlert(type, tooltip, isRollup) {
  return { type, tooltip, isRollup: !!isRollup, label: ALERT_META[type].label, color: ALERT_META[type].color };
}

// Compute alerts for a metrics object ({ros, demand}) — a room-type
// cluster or a house aggregate. Alerts never fire on individual units:
// pace and demand are room-type-level signals.
function computeAlerts(m, cfg) {
  cfg = cfg || ALERT_DEFAULTS;
  const out = [];
  if (cfg.lowPace.enabled && m.ros < cfg.lowPace.threshold) {
    out.push(makeAlert('lowPace', 'Low pace: bookings ' + (m.ros > 0 ? '+' : '') + m.ros + '% vs last year (threshold ' + cfg.lowPace.threshold + '%)'));
  }
  if (cfg.highDemand.enabled && m.demand > cfg.highDemand.threshold) {
    const dl = demandLevelForScore(m.demand);
    out.push(makeAlert('highDemand', 'High demand: ' + dl.code + ' — ' + dl.label + ' (forecast ' + signedPpt(demandPpt(m.demand)) + ' vs expected)'));
  }
  if (cfg.lowDemand.enabled && m.demand < cfg.lowDemand.threshold) {
    const dl = demandLevelForScore(m.demand);
    out.push(makeAlert('lowDemand', 'Low demand: ' + dl.code + ' — ' + dl.label + ' (forecast ' + signedPpt(demandPpt(m.demand)) + ' vs expected)'));
  }
  return out;
}

// Union of a row's direct alerts and its children's alerts (one list per
// child metrics object), de-duplicated by type. Direct alerts win.
function unionAlerts(directAlerts, childMetricsList, cfg) {
  const byType = new Map();
  directAlerts.forEach(a => byType.set(a.type, a));
  const descendantCount = {};
  (childMetricsList || []).forEach(m => {
    computeAlerts(m, cfg).forEach(a => {
      descendantCount[a.type] = (descendantCount[a.type] || 0) + 1;
    });
  });
  Object.keys(descendantCount).forEach(type => {
    if (byType.has(type)) return;
    byType.set(type, makeAlert(type,
      ALERT_META[type].label + ': ' + descendantCount[type] + ' room type' + (descendantCount[type] === 1 ? '' : 's'), true));
  });
  const out = [];
  ALERT_ORDER.forEach(t => { if (byType.has(t)) out.push(byType.get(t)); });
  return out;
}

// ── Portfolio assembly ───────────────────────────────────────
const PRICING_DATA = HOUSES.map(h => {
  const r = rngFor('pricing|' + h.id);
  const roomTypes = UNIT_TYPES.map(rt => {
    const m = makeRoomTypeMetrics(h, rt);
    const units = makeUnits(h, rt, rt === 'Single Studio' ? 3 : 2, m);
    const totalBedsOfType = Math.round(h.totalBeds * (rt === 'Single Studio' ? 0.7 : 0.3));
    const avgRate = Math.round(units.reduce((s, u) => s + u.rate, 0) / units.length);
    const avgRec  = Math.round(units.reduce((s, u) => s + u.rec, 0) / units.length);
    return {
      type: rt,
      totalBeds: totalBedsOfType,
      availBeds: Math.max(2, Math.round(totalBedsOfType * rpick(r, 0.04, 0.16))),
      units,
      rate: avgRate,
      rec: avgRec,
      sold: m.sold, fcst: m.fcst, ros: m.ros, demand: m.demand, projOcc: m.projOcc,
      note: null,
    };
  });
  const fcstSum = roomTypes.reduce((s, rt) => s + rt.fcst, 0);
  const revW = roomTypes.reduce((s, rt) => s + rt.sold * rt.rate, 0);
  return {
    ...h,
    totalUnits: h.totalBeds,
    availBeds: roomTypes.reduce((s, rt) => s + rt.availBeds, 0),
    sold: roomTypes.reduce((s, rt) => s + rt.sold, 0),
    fcst: fcstSum,
    ros: revW ? Math.round(roomTypes.reduce((s, rt) => s + rt.ros * rt.sold * rt.rate, 0) / revW) : 0,
    demand: fcstSum ? Math.round(roomTypes.reduce((s, rt) => s + rt.demand * rt.fcst, 0) / fcstSum) : 0,
    projOcc: Math.round(roomTypes.reduce((s, rt) => s + rt.projOcc, 0) / roomTypes.length),
    roomTypes,
    // Legacy alias used by shared helpers
    bedTypes: roomTypes,
  };
});
PRICING_DATA.forEach(h => { h.availPct = (h.availBeds / h.totalBeds * 100).toFixed(1); h.roomTypes.forEach(rt => { rt.availPct = (rt.availBeds / rt.totalBeds * 100).toFixed(1); }); });

// ── Unit lock helpers ────────────────────────────────────────
function findUnitInPricingData(unitId) {
  for (const c of PRICING_DATA) {
    for (const bt of c.roomTypes) {
      const u = bt.units.find(x => x.id === unitId);
      if (u) return { unit: u, house: c, roomType: bt };
    }
  }
  return null;
}

function expireStaleUnitLocks() {
  const now = Date.now();
  PRICING_DATA.forEach(c => c.roomTypes.forEach(bt => bt.units.forEach(u => {
    if (u.lock && u.lock.locked && u.lock.lockUntil) {
      if (Date.parse(u.lock.lockUntil) <= now) u.lock = null;
    }
  })));
}

function applyUnitLock(unitId, untilDate, reason) {
  const found = findUnitInPricingData(unitId);
  if (!found) return null;
  const u = found.unit;
  const prev = u.lock;
  u.lock = {
    locked: true,
    lockUntil: untilDate ? untilDate.toISOString() : null,
    lockedRate: prev?.lockedRate ?? u.rec,
    reason: reason || null,
    lockedAt: prev?.lockedAt ?? new Date().toISOString(),
  };
  return u.lock;
}

function clearUnitLock(unitId) {
  const found = findUnitInPricingData(unitId);
  if (!found) return;
  found.unit.lock = null;
}

// Seed a few demo locks so the locked state is visible on first load.
(function _seedUnitLocks() {
  const daysOut = (n) => new Date(Date.now() + n * 864e5);
  const seeds = [
    { unitId: 'FZZ-001-SGL-001', until: null,        reason: 'Held for TU Berlin nomination agreement' },
    { unitId: 'FZZ-005-SGL-002', until: daysOut(45), reason: 'Refurbishment — rate frozen until floor reopens' },
    { unitId: 'FZZ-011-DBL-001', until: daysOut(14), reason: 'Active corporate negotiation — hold rate' },
  ];
  seeds.forEach(({ unitId, until, reason }) => {
    const found = findUnitInPricingData(unitId);
    if (!found) return;
    found.unit.lock = {
      locked: true,
      lockUntil: until ? until.toISOString() : null,
      lockedRate: found.unit.rec,
      reason,
      lockedAt: new Date().toISOString(),
    };
  });
})();

// ── Stay-type configuration (stay-types.html) ────────────────
// Per house × room type: which stay types are offered, and the premium
// (% vs Full Year Stay) at each scope. null premium = inherit default.
const STAY_CONFIG = HOUSES.map(h => {
  const r = rngFor('stayconf|' + h.id);
  const mk = () => STAY_TYPES.map(st => ({
    stayTypeId: st.id,
    available: st.id === 'full_year' ? true : r() > 0.15,
    premiumPct: st.premiumPct,
  }));
  return {
    ...h,
    stays: mk(),
    roomTypes: UNIT_TYPES.map(rt => ({ type: rt, stays: mk() })),
  };
});

// ── Booking curve data (per unit or aggregate) ───────────────
// Cumulative bookings from season open (T-N days) to demo-today, plus a
// last-year benchmark curve. Student-housing curves are front-loaded
// around admission-results waves rather than last-minute like theme parks.
function bookingCurveData(seedKey, sold, fcst, ros) {
  const r = rngFor('curve|' + seedKey);
  const N = 15;  // weekly points across the booking season
  const actualTotal = sold;
  const benchmarkTotal = Math.max(1, Math.round(sold / (1 + ros / 100)));
  // S-curve with admission-wave bumps
  const pace = (t, total) => {
    const x = t / (N - 1);
    const s = 1 / (1 + Math.exp(-(x - 0.45) * 7));
    const s0 = 1 / (1 + Math.exp(0.45 * 7));
    const s1 = 1 / (1 + Math.exp(-0.55 * 7));
    return Math.round(total * (s - s0) / (s1 - s0));
  };
  const actualSeries = Array.from({ length: N }, (_, i) => pace(i, actualTotal));
  const benchmarkSeries = Array.from({ length: N }, (_, i) => pace(i, benchmarkTotal));
  for (let i = 1; i < N; i++) {
    const noise = Math.round((r() - 0.5) * actualTotal * 0.06);
    actualSeries[i] = Math.max(actualSeries[i - 1], actualSeries[i] + noise);
  }
  actualSeries[N - 1] = actualTotal;

  // Weekly booking counts for the last 7 weeks + benchmark
  const weekLabels = [];
  for (let i = 6; i >= 0; i--) {
    const d = new Date(DEMO_TODAY.getTime() - i * 7 * 86400000);
    weekLabels.push({
      iso: d.toISOString().slice(0, 10),
      short: 'W' + (0 - i === 0 ? '0' : String(-i)),
      num: d.getDate() + ' ' + ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'][d.getMonth()],
    });
  }
  const weeklyRate = Math.max(1.5, sold / 7);
  const weekly = weekLabels.map((_, i) => {
    const trend = 0.55 + (i / 6) * 0.9;
    return Math.max(0, Math.round(weeklyRate * trend * (0.7 + r() * 0.7)));
  });
  const benchRng = rngFor('curvebench|' + seedKey);
  const weeklyBenchmark = weekLabels.map(() => Math.max(1, Math.round(weeklyRate * (0.75 + benchRng() * 0.6))));

  return { actualSeries, benchmarkSeries, weekly, weeklyBenchmark, weekLabels, benchmarkTotal };
}

// ── Parameters data (concessions / rounding / renewals removed) ──
const PARAM_DEFAULTS = {
  maxPriceChange: 10, minPriceChange: -10,
  compCorrMax: 10, compCorrMin: -45, compCorrPrio1: 30, compCorrPrio2: 40,
  modelHoldDays: 0, modelPriceDown: -0.5, modelPriceUp: 5, manualHoldDays: 1,
  octPremiumPct: 5,          // hold-time premium for Oct 1 move-in
  semesterFloorPct: 0,       // min premium allowed on semester stays
  paceReviewDays: 7,         // cadence for pace review
  paceAlertPrio1: -10,       // pace vs target (%) — priority 1 alert
  paceAlertPrio2: -20,       // pace vs target (%) — priority 2 alert
};

const PARAMETERS_DATA = HOUSES.map(h => ({
  ...h,
  params: { ...PARAM_DEFAULTS },
  roomTypes: UNIT_TYPES.map(rt => ({ type: rt, params: { ...PARAM_DEFAULTS } })),
  bedTypes: UNIT_TYPES.map(rt => ({ type: rt, params: { ...PARAM_DEFAULTS } })),
}));

// ── Rent Control — EU regulatory rules ───────────────────────
const CURRENT_CPI = 2.4;

let RENT_CONTROL_RULES = [
  {
    id: 'RCR-001',
    name: 'Berlin Mietpreisbremse — Kreuzberg',
    scope: { communityIds: ['FZZ-001'], bedTypes: ['Single Studio'], unitIds: 'all' },
    formula: { type: 'flat_pct', value: 10 },
    ceiling: null, timeframe: '12mo', firstYearProtection: false,
    noticePeriodDays: 60, buildingAgeExemptionYears: null,
    vacancyDecontrol: 'none', vacancyBonusPct: null, vacancyMaxTotalPct: null,
    bankingAllowed: false, bankingMaxMultiplier: null,
    activeFrom: '2026-01-01T00:00:00.000Z', activeTo: null,
    notes: 'German rent brake: new lets capped at local reference rent +10%. Furnished all-in lets partially exempt — legal review ongoing.',
  },
  {
    id: 'RCR-002',
    name: 'Berlin Mietpreisbremse — Friedrichshain',
    scope: { communityIds: ['FZZ-002'], bedTypes: ['Single Studio', 'Double Studio'], unitIds: 'all' },
    formula: { type: 'flat_pct', value: 10 },
    ceiling: null, timeframe: '12mo', firstYearProtection: false,
    noticePeriodDays: 60, buildingAgeExemptionYears: 12,
    vacancyDecontrol: 'none', vacancyBonusPct: null, vacancyMaxTotalPct: null,
    bankingAllowed: false, bankingMaxMultiplier: null,
    activeFrom: '2026-01-01T00:00:00.000Z', activeTo: null,
    notes: 'New-build exemption applies while the building is under 12 years old — confirm status before repricing.',
  },
  {
    id: 'RCR-003',
    name: 'Hamburg capped-increase zone',
    scope: { communityIds: ['FZZ-003', 'FZZ-004'], bedTypes: 'all', unitIds: 'all' },
    formula: { type: 'flat_pct', value: 15 },
    ceiling: null, timeframe: '36mo', firstYearProtection: false,
    noticePeriodDays: 90, buildingAgeExemptionYears: null,
    vacancyDecontrol: 'none', vacancyBonusPct: null, vacancyMaxTotalPct: null,
    bankingAllowed: true, bankingMaxMultiplier: 1.5,
    activeFrom: '2026-01-01T00:00:00.000Z', activeTo: null,
    notes: 'Kappungsgrenze: existing-tenant increases capped at 15% over three years in Hamburg’s designated tight-market zone.',
  },
  {
    id: 'RCR-004',
    name: 'Vienna Richtwert cap — Brigittenau',
    scope: { communityIds: ['FZZ-010'], bedTypes: ['Single Studio'], unitIds: 'all' },
    formula: { type: 'cpi', cpiMultiplier: 100, cpiAddition: 0 },
    ceiling: null, timeframe: '12mo', firstYearProtection: true,
    noticePeriodDays: 30, buildingAgeExemptionYears: null,
    vacancyDecontrol: 'none', vacancyBonusPct: null, vacancyMaxTotalPct: null,
    bankingAllowed: false, bankingMaxMultiplier: null,
    activeFrom: '2026-04-01T00:00:00.000Z', activeTo: null,
    notes: 'Austrian reference-rate regime: annual indexation limited to CPI for pre-1945 building stock.',
  },
  {
    id: 'RCR-005',
    name: 'Utrecht middenhuur points cap',
    scope: { communityIds: ['FZZ-011'], bedTypes: ['Single Studio'], unitIds: ['FZZ-011-SGL-002', 'FZZ-011-SGL-003'] },
    formula: { type: 'lesser_of', operands: [ { type: 'cpi', cpiMultiplier: 100, cpiAddition: 1 }, { type: 'flat_pct', value: 5.5 } ] },
    ceiling: null, timeframe: '12mo', firstYearProtection: true,
    noticePeriodDays: 60, buildingAgeExemptionYears: null,
    vacancyDecontrol: 'none', vacancyBonusPct: null, vacancyMaxTotalPct: null,
    bankingAllowed: false, bankingMaxMultiplier: null,
    activeFrom: '2026-01-01T00:00:00.000Z', activeTo: null,
    notes: 'Dutch WWS points system (Wet betaalbare huur): units scoring under 187 points are capped at the regulated rent table (€1,123/mo at current points); increase capped at lesser of CPI+1% or 5.5%.',
  },
  {
    id: 'RCR-006',
    name: 'Munich Mietpreisbremse',
    scope: { communityIds: ['FZZ-005'], bedTypes: 'all', unitIds: 'all' },
    formula: { type: 'flat_pct', value: 10 },
    ceiling: null, timeframe: '12mo', firstYearProtection: false,
    noticePeriodDays: 60, buildingAgeExemptionYears: 12,
    vacancyDecontrol: 'none', vacancyBonusPct: null, vacancyMaxTotalPct: null,
    bankingAllowed: false, bankingMaxMultiplier: null,
    activeFrom: '2026-01-01T00:00:00.000Z', activeTo: null,
    notes: 'Bavarian rent-brake ordinance renewed through 2029 — applies to the Munich house across both room types.',
  },
];

function getActiveRcRulesForUnit(commId, bedType, unitId, nowMs) {
  if (typeof RENT_CONTROL_RULES === 'undefined') return [];
  const t = nowMs == null ? Date.now() : nowMs;
  const matches = [];
  for (const rule of RENT_CONTROL_RULES) {
    const fromMs = Date.parse(rule.activeFrom);
    const toMs   = rule.activeTo ? Date.parse(rule.activeTo) : Infinity;
    if (t < fromMs || t > toMs) continue;
    const s = rule.scope;
    if (s.communityIds !== 'all' && !s.communityIds.includes(commId)) continue;
    if (s.bedTypes     !== 'all' && !s.bedTypes.includes(bedType))    continue;
    if (s.unitIds      !== 'all' && !s.unitIds.includes(unitId))      continue;
    matches.push(rule);
  }
  return matches;
}

// ── Chart helper data (occupancy panel) ──────────────────────
const CHART_MONTHS = ['Sep 25','Oct 25','Nov 25','Dec 25','Jan 26','Feb 26','Mar 26','Apr 26','May 26','Jun 26','Jul 26','Aug 26'];
