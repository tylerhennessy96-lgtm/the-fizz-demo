// ── Windsor Communities / GID Seed Data ───────────────────

const STATES = ['All States', 'Texas', 'Florida', 'Georgia', 'North Carolina', 'Virginia', 'Arizona', 'Colorado'];

const METROS = {
  'All States': ['All Metros'],
  'Texas': ['All Metros', 'Dallas-Fort Worth', 'Houston', 'Austin', 'San Antonio'],
  'Florida': ['All Metros', 'Miami', 'Orlando', 'Tampa', 'Jacksonville'],
  'Georgia': ['All Metros', 'Atlanta'],
  'North Carolina': ['All Metros', 'Charlotte', 'Raleigh'],
  'Virginia': ['All Metros', 'Northern Virginia', 'Richmond'],
  'Arizona': ['All Metros', 'Phoenix', 'Scottsdale'],
  'Colorado': ['All Metros', 'Denver', 'Boulder'],
};

const ALL_AMENITIES = ['Pool','Concierge','Parking Garage','Co-working Lounge','Fitness Center','Pet Friendly','Rooftop Deck','EV Charging','Dog Park','Package Lockers','Business Center','Bike Storage'];

function _randAmenities() {
  return ALL_AMENITIES.filter(() => Math.random() > 0.45);
}

const _COMMUNITIES_RAW = [
  { id: 'WCC-001', name: 'Windsor Turtle Creek',          state: 'Texas',          metro: 'Dallas-Fort Worth', rm: 'Sarah Mitchell',  cd: 'James Holbrook' },
  { id: 'WCC-002', name: 'Windsor on White Rock Lake',    state: 'Texas',          metro: 'Dallas-Fort Worth', rm: 'Sarah Mitchell',  cd: 'James Holbrook' },
  { id: 'WCC-003', name: 'Windsor CityLine',              state: 'Texas',          metro: 'Dallas-Fort Worth', rm: 'Sarah Mitchell',  cd: 'Dana Cortez'    },
  { id: 'WCC-004', name: 'Windsor Lantana Hills',         state: 'Texas',          metro: 'Austin',            rm: 'Tom Bridges',     cd: 'Dana Cortez'    },
  { id: 'WCC-005', name: 'Windsor Memorial',              state: 'Texas',          metro: 'Houston',           rm: 'Tom Bridges',     cd: 'Renee Park'     },
  { id: 'WCC-006', name: 'Windsor Interlock',             state: 'Georgia',        metro: 'Atlanta',           rm: 'Priya Nair',      cd: 'Renee Park'     },
  { id: 'WCC-007', name: 'Windsor Old Fourth Ward',       state: 'Georgia',        metro: 'Atlanta',           rm: 'Priya Nair',      cd: 'Marcus Webb'    },
  { id: 'WCC-008', name: 'Windsor Vinings',               state: 'Georgia',        metro: 'Atlanta',           rm: 'Priya Nair',      cd: 'Marcus Webb'    },
  { id: 'WCC-009', name: 'Windsor at Pembroke Gardens',   state: 'Florida',        metro: 'Miami',             rm: 'Carlos Reyes',    cd: 'Marcus Webb'    },
  { id: 'WCC-010', name: 'Windsor Boca Raton',            state: 'Florida',        metro: 'Miami',             rm: 'Carlos Reyes',    cd: 'Linda Foss'     },
  { id: 'WCC-011', name: 'Windsor Addison Park',          state: 'North Carolina', metro: 'Charlotte',         rm: 'Carlos Reyes',    cd: 'Linda Foss'     },
  { id: 'WCC-012', name: 'Windsor Kingstowne',            state: 'Virginia',       metro: 'Northern Virginia', rm: 'Amy Chen',        cd: 'Steve Nguyen'   },
];

const COMMUNITIES = _COMMUNITIES_RAW.map((c, i) => ({
  ...c,
  class: i < 6 ? 'A' : 'B',
  yearBuilt: Math.floor(Math.random() * 31 + 1985),
  amenities: _randAmenities(),
}));

const REVENUE_MANAGERS = ['All RMs', 'Sarah Mitchell', 'Tom Bridges', 'Priya Nair', 'Carlos Reyes', 'Amy Chen'];
const COMMUNITY_DIRECTORS = ['All CDs', 'James Holbrook', 'Dana Cortez', 'Renee Park', 'Marcus Webb', 'Linda Foss', 'Steve Nguyen'];

// Pricing table data — units per community
const UNIT_TYPES = ['1 Bed', '2 Bed', '3 Bed'];

const NOTE_TEXTS = [
  'Holding price pending comp survey',
  'Manager approved override',
  'Lease-up concession applied',
  'Do not discount',
  'High demand floor',
  'Seasonal rate adjustment',
  'Renewal retention pricing',
  'Below market — strategic hold',
  'Pending renovation premium',
  'Price matched to sister community',
];

function makeNote() {
  if (Math.random() > 0.4) return null;
  const text = NOTE_TEXTS[Math.floor(Math.random() * NOTE_TEXTS.length)];
  const d = new Date();
  d.setDate(d.getDate() + Math.floor(Math.random() * 60) + 7);
  const expires = String(d.getMonth() + 1).padStart(2, '0') + '/' + String(d.getDate()).padStart(2, '0') + '/' + String(d.getFullYear()).slice(-2);
  return { text, expires };
}

// Communities with any units under an Affordable-housing designation
// (LIHTC / Section 8 / inclusionary-zoning). Being in the set only makes a
// community *eligible* for AF flags — only a subset of each community's
// units is actually marked affordable (see makeUnits / makeRenewalUnits),
// which keeps the demo visually varied rather than all-or-nothing.
const AFFORDABLE_COMMUNITIES = new Set(['WCC-001', 'WCC-003', 'WCC-007', 'WCC-009']);

// Deterministic per-unit prior lease term drawn from a weighted distribution:
// 12mo ~60%, 13mo ~15%, 14mo ~10%, 6/9/15/18mo ~4% each. Keyed off the unit
// id so reloads produce the same term per unit (no seeded RNG needed since
// the id is itself deterministic). Returns null when there's no prior lease.
function _pickPriorLeaseTerm(unitId, hasPriorLease) {
  if (!hasPriorLease) return null;
  let h = 2166136261; // FNV-1a-ish
  for (let i = 0; i < unitId.length; i++) {
    h ^= unitId.charCodeAt(i);
    h = (h * 16777619) >>> 0;
  }
  const r = h % 100;
  if (r < 60) return 12;  // 0–59 → 12mo (60%)
  if (r < 75) return 13;  // 60–74 → 13mo (15%)
  if (r < 85) return 14;  // 75–84 → 14mo (10%)
  if (r < 89) return 6;   // 85–88 → 6mo  (4%)
  if (r < 93) return 9;   // 89–92 → 9mo  (4%)
  if (r < 97) return 15;  // 93–96 → 15mo (4%)
  return 18;              // 97–99 → 18mo (3%)
}

function makeUnits(communityId, bedType, count, baseRent) {
  const moveOutDays = [10, 25, 40];
  const availDays = [18, 33, 48];
  return Array.from({ length: count }, (_, i) => {
    const num = String(i + 1).padStart(3, '0');
    const status = i % 2 === 0 ? 'vacant' : 'on notice';
    const mo = new Date(); mo.setDate(mo.getDate() + (moveOutDays[i] || 30));
    const av = new Date(); av.setDate(av.getDate() + (availDays[i] || 40));
    const moveOut = String(mo.getMonth()+1).padStart(2,'0') + '/' + String(mo.getDate()).padStart(2,'0') + '/' + String(mo.getFullYear()).slice(-2);
    const availDate = String(av.getMonth()+1).padStart(2,'0') + '/' + String(av.getDate()).padStart(2,'0') + '/' + String(av.getFullYear()).slice(-2);
    const priorRent = baseRent - 80;
    const recRent = baseRent + 20;
    const alertPool = ['concession', 'comp', 'optimizer', 'manual'];
    const alerts = alertPool.filter(() => Math.random() > 0.65);
    const grossRent = priorRent + [0,50,100,150][Math.floor(Math.random()*4)];
    const unitId = `${communityId}-${bedType.replace(' ', '')}-${num}`;
    return {
      id: unitId,
      status,
      moveOut,
      availDate,
      priorRent,
      priorLeaseTerm: _pickPriorLeaseTerm(unitId, priorRent != null && priorRent > 0),
      grossRent,
      hasPriorConcession: grossRent > priorRent,
      // "New to market" — simple seeded flag. Drives a faint aquamarine
      // row tint on pricing.html; not computed from availDate.
      newToMarket: false,
      // In-memory unit lock — freezes Rec. Rent Current at `lockedRecRent`
      // until `lockUntil` passes (or indefinitely when lockUntil is null).
      // Session-only state — not persisted; seeded fresh each page load.
      lock: null,
      floorplan: ['Studio','1BR/1BA','1BR/2BA','2BR/1BA','2BR/2BA','3BR/2BA'][Math.floor(Math.random()*6)],
      area: Math.floor(Math.random()*600+450),
      floor: Math.floor(Math.random()*8+1),
      initialPrice: baseRent,
      priorPeriodPrice: baseRent - 40,
      recRent,
      deltaInitial: -2.2,
      deltaPrior: 1.1,
      lt: 12,
      attValue: 100,
      netEffRent: recRent,
      concsAmt: Math.random() < 0.6 ? [100,150,200,250,300][Math.floor(Math.random()*5)] : null,
      alerts,
      note: makeNote(),
      rcStatus: ['RC','AF','HA',null,null,null][Math.floor(Math.random()*6)],
      isAffordable: AFFORDABLE_COMMUNITIES.has(communityId) && Math.random() < 0.35,
      anchorPrice: Math.round(recRent * (0.96 + Math.random() * 0.06) / 10) * 10,
    };
  });
}

function makeRandomAlerts() {
  const alertPool = ['concession', 'comp', 'optimizer', 'manual'];
  return alertPool.filter(() => Math.random() > 0.65);
}

const PRICING_DATA = COMMUNITIES.map(c => {
  const baseRents = { '1 Bed': 1800, '2 Bed': 2400, '3 Bed': 3100 };
  const totalUnits = Math.floor(Math.random() * 40) + 60;
  const avail = (Math.random() * 6 + 2).toFixed(1);
  return {
    ...c,
    totalUnits,
    availPct: avail,
    alerts: makeRandomAlerts(),
    bedTypes: UNIT_TYPES.map(bt => {
      const units = makeUnits(c.id, bt, 2, baseRents[bt]);
      return {
        type: bt,
        totalUnits: Math.floor(totalUnits / 3),
        availPct: (Math.random() * 6 + 2).toFixed(1),
        units,
        recRent: baseRents[bt] + 20,
        initialPrice: baseRents[bt],
        priorPeriodPrice: baseRents[bt] - 40,
        deltaInitial: -2.2,
        deltaPrior: 1.1,
        alerts: makeRandomAlerts(),
        concsAmt: null,
        note: null,
      };
    }),
  };
});

// ── Unit lock helpers ────────────────────────────────────────
// Find a unit anywhere in PRICING_DATA by its id. O(total-units) but the
// portfolio is small enough that a lookup map isn't worth maintaining.
function findUnitInPricingData(unitId) {
  for (const c of PRICING_DATA) {
    for (const bt of c.bedTypes) {
      const u = bt.units.find(x => x.id === unitId);
      if (u) return { unit: u, community: c, bedType: bt };
    }
  }
  return null;
}

// Clear any expired locks so Rec. Rent Current reverts to dynamic. A lock is
// considered expired when lockUntil is set and has already passed; indefinite
// locks (lockUntil === null) never expire automatically.
function expireStaleUnitLocks() {
  const now = Date.now();
  PRICING_DATA.forEach(c => c.bedTypes.forEach(bt => bt.units.forEach(u => {
    if (u.lock && u.lock.locked && u.lock.lockUntil) {
      if (Date.parse(u.lock.lockUntil) <= now) u.lock = null;
    }
  })));
}

// Apply a lock to a unit. `untilDate` may be null for an indefinite lock.
// Preserves the existing lockedRecRent snapshot when editing an already-
// locked unit — that's the point of the feature: the frozen value must not
// move when the RM only changes the end date or reason.
function applyUnitLock(unitId, untilDate, reason) {
  const found = findUnitInPricingData(unitId);
  if (!found) return null;
  const u = found.unit;
  const prev = u.lock;
  u.lock = {
    locked: true,
    lockUntil: untilDate ? untilDate.toISOString() : null,
    lockedRecRent: prev?.lockedRecRent ?? u.recRent,
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

// Seed eight units across the portfolio as "new to market" so the faint
// aquamarine row tint on pricing.html is visible on load. Spread is:
// 3 in the top-visible communities (WCC-001/002/003), 1 overlapping with
// a seeded lock (WCC-005-1Bed-001) to demo the locked + new-to-market
// combination, and the rest scattered further down the portfolio.
(function _seedNewToMarket() {
  const ids = [
    'WCC-001-1Bed-002',  // Windsor Turtle Creek
    'WCC-002-2Bed-001',  // Windsor on White Rock Lake
    'WCC-003-3Bed-001',  // Windsor CityLine
    'WCC-005-1Bed-001',  // Windsor Memorial (also locked — demonstrates overlap)
    'WCC-006-2Bed-002',  // Windsor Interlock
    'WCC-008-1Bed-001',  // Windsor Vinings
    'WCC-010-2Bed-001',  // Windsor Boca Raton
    'WCC-011-2Bed-002',  // Windsor Addison Park
  ];
  ids.forEach(id => {
    const found = findUnitInPricingData(id);
    if (found) found.unit.newToMarket = true;
  });
})();

// Seed four demo locks across the portfolio so locked state is visible on
// first load. Dynamic lockUntil values (14 and 60 days from today) are
// computed at load time, so the seed stays stable across time zones.
(function _seedUnitLocks() {
  const iso = (d) => d.toISOString();
  const daysOut = (n) => new Date(Date.now() + n * 864e5);
  const seeds = [
    { unitId: 'WCC-001-1Bed-001', until: null,         reason: 'Held for corporate relo program' },
    { unitId: 'WCC-005-1Bed-001', until: daysOut(60),  reason: 'Renovation in progress' },
    { unitId: 'WCC-006-2Bed-001', until: daysOut(14),  reason: 'Active negotiation — hold price' },
    { unitId: 'WCC-009-1Bed-001', until: null,         reason: null },
  ];
  seeds.forEach(({ unitId, until, reason }) => {
    const found = findUnitInPricingData(unitId);
    if (!found) return;
    found.unit.lock = {
      locked: true,
      lockUntil: until ? iso(until) : null,
      lockedRecRent: found.unit.recRent,
      reason,
      lockedAt: iso(new Date()),
    };
  });
})();

// Term availability + premiums (24 months × communities). Each array is
// split into new-lease and renewal variants so term.html / term-premiums.html
// can configure the two contexts independently.
//
// Renewal availability inherits from new lease, then forces indices 4 and 7
// (UI columns labelled "6" and "9") to true — the common pattern of
// offering shorter terms to retain existing residents.
// Renewal premiums inherit similarly, then set those same two indices to 2%.
// Terms 10–24 (indices 8–22) stay at 0 on both datasets to respect the
// short-term-only premium rule enforced by term-premiums.html.
const TERM_DATA = COMMUNITIES.map(c => {
  const propAvailNew = Array.from({ length: 24 }, (_, i) => {
    if (i < 3 || i === 11) return Math.random() > 0.2;
    return Math.random() > 0.35;
  });
  const propAvailRen = propAvailNew.map((a, i) => (i === 4 || i === 7) ? true : a);
  const propPremNew = propAvailNew.map((a, i) => i > 7 ? 0 : (a ? (Math.random() > 0.5 ? 50 : 35) : null));
  const propPremRen = propPremNew.map((v, i) => (i === 4 || i === 7) ? 2 : v);
  return {
    ...c,
    availabilityNewLease: propAvailNew,
    availabilityRenewal:  propAvailRen,
    premiumsNewLease:     propPremNew,
    premiumsRenewal:      propPremRen,
    bedTypes: UNIT_TYPES.map(bt => {
      const btAvailNew = Array.from({ length: 24 }, () => Math.random() > 0.3);
      const btAvailRen = btAvailNew.map((a, i) => (i === 4 || i === 7) ? true : a);
      const btPremNew  = Array.from({ length: 24 }, (_, i) => i > 7 ? 0 : (Math.random() > 0.5 ? 50 : 35));
      const btPremRen  = btPremNew.map((v, i) => (i === 4 || i === 7) ? 2 : v);
      return {
        type: bt,
        availabilityNewLease: btAvailNew,
        availabilityRenewal:  btAvailRen,
        premiumsNewLease:     btPremNew,
        premiumsRenewal:      btPremRen,
      };
    }),
  };
});

// Expiration data — 24 months per bed type per community
const EXPIRATION_DATA = COMMUNITIES.map(c => {
  const commPricing = PRICING_DATA.find(p => p.id === c.id);
  const totalUnits = commPricing?.totalUnits ?? 80;
  return {
    ...c,
    totalUnits,
    bedTypes: ['1 Bed', '2 Bed', '3 Bed'].map(bt => {
      const btUnits = Math.floor(totalUnits / 3);
      const baseRents = { '1 Bed': 1820, '2 Bed': 2420, '3 Bed': 3120 };
      const baseRent = baseRents[bt];
      const months = Array.from({ length: 24 }, (_, i) => {
        const date = new Date(2025, 3 + i, 1);
        const monthLabel = date.toLocaleString('en-US', { month: 'long', year: 'numeric' });
        const recAbs = Math.max(1, Math.round(btUnits * (0.06 + Math.random() * 0.05)));
        const recRel = parseFloat((recAbs / btUnits * 100).toFixed(1));
        const forecastedAbs = Math.max(0, recAbs + Math.floor(Math.random() * 9) - 3);
        const forecastedRel = parseFloat((forecastedAbs / btUnits * 100).toFixed(1));
        const delta = forecastedAbs - recAbs;
        const rentForecast = Math.round(baseRent + (i * 6) + (Math.random() * 30 - 10));
        return { monthLabel, date, recAbs, recRel, forecastedAbs, forecastedRel, delta, rentForecast, manualPremium: null, recOverride: null };
      });
      return { type: bt, totalUnits: btUnits, months };
    }),
  };
});

// Parameters data
const PARAM_DEFAULTS = {
  maxPriceChange:10, minPriceChange:-10, unitGroup:'Individual',
  exposurePrio1:8, exposurePrio2:3, exposureMax:10, exposureMin:-45,
  compCorrMax:10, compCorrMin:-45, compCorrPrio1:30, compCorrPrio2:40,
  concessionPrio1:15, concessionPrio2:25,
  modelHoldDays:0, modelPriceDown:-0.5, modelPriceUp:5, manualHoldDays:1,
  freeDaysOnNotice:2, freeDaysVacant:2, onNoticeMax:15, vacantMax:30,
  onNoticeRecovery:100, vacantRecovery:100,
  renewalLeadDays:90, relConcession:0, deltaNewLeaseMax:5, deltaNewLeaseMin:-2, inheritBestPrice:false,
  roundingMethod:'nearest', roundingAmount:10,
  // Concession rounding is configured separately from rent rounding — dollar
  // values and percent values each have their own method + amount.
  concessionRounding: {
    dollarMethod:  'nearest',  // 'nearest' | 'up' | 'down'
    dollarAmount:  25,         // one of [1, 5, 10, 25, 50, 100]
    percentMethod: 'nearest',
    percentAmount: 5,          // one of [1, 2.5, 5, 10]
  },
};

const COMPETITOR_EXCLUSIONS = [
  { id:'excl-1', jurisdiction:'Texas',        level:'State', status:'Under Review', excluded:false, effectiveDate:'01/01/25', notes:'Monitoring TX AG guidance on RealPage litigation' },
  { id:'excl-2', jurisdiction:'Georgia',      level:'State', status:'Active',       excluded:true,  effectiveDate:'06/01/24', notes:'Excluded per legal counsel recommendation' },
  { id:'excl-3', jurisdiction:'New York City',level:'City',  status:'Active',       excluded:true,  effectiveDate:'01/01/24', notes:'NYC Local Law 102 compliance' },
];

const PARAMETERS_DATA = COMMUNITIES.map(c => ({
  ...c,
  params: {
    ...PARAM_DEFAULTS,
    concessionRounding: { ...PARAM_DEFAULTS.concessionRounding },
    inheritBestPrice: Math.random() > 0.4,
    concessionPrio1: Math.floor(Math.random() * 20 + 10),
    concessionPrio2: Math.floor(Math.random() * 30 + 20),
  },
  bedTypes: ['1 Bed','2 Bed','3 Bed'].map(bt => ({
    type: bt,
    params: {
      ...PARAM_DEFAULTS,
      concessionRounding: { ...PARAM_DEFAULTS.concessionRounding },
      inheritBestPrice: Math.random() > 0.4,
      concessionPrio1: Math.floor(Math.random() * 20 + 10),
      concessionPrio2: Math.floor(Math.random() * 30 + 20),
    },
  })),
}));

// Renewals data
const LEASE_TERMS = [6,9,10,11,12,13,14,15];

function makeRenewalUnits(commId, bedType, count, baseRent) {
  return Array.from({ length: count }, (_, i) => {
    const num = String(i+1).padStart(3,'0');
    const leaseEndDays = Math.floor(Math.random()*180)+10;
    const le = new Date(2025,3,8); le.setDate(le.getDate()+leaseEndDays);
    const leaseEnd = (le.getMonth()+1).toString().padStart(2,'0')+'/'+le.getDate().toString().padStart(2,'0')+'/'+String(le.getFullYear()).slice(2);
    const daysToOffer = leaseEndDays - 90;
    const leaseTerm = LEASE_TERMS[Math.floor(Math.random()*LEASE_TERMS.length)];
    const leasePrice = baseRent + Math.floor(Math.random()*100-50);
    const concsAmt = Math.random()>0.6 ? [0,50,100,150,200][Math.floor(Math.random()*5)] : 0;
    const netEffLeasePrice = leasePrice - concsAmt;
    const renewalPricePct = parseFloat((Math.random()*6+1).toFixed(1));
    const renewalOfferPrice = Math.round(leasePrice*(1+renewalPricePct/100));
    const newLeasePrice = baseRent + 20;
    const deltaToNewLease = parseFloat(((renewalOfferPrice-newLeasePrice)/newLeasePrice*100).toFixed(1));
    const rcStatuses = ['RC','AF','HA',null,null,null,null];
    let status;
    if (daysToOffer > 0) { status = 'Pending'; }
    else {
      const openStatuses = ['Offer Sent','Offer Sent','Offer Sent','Accepted','Accepted','Declined','Negotiating','Pending'];
      status = openStatuses[Math.floor(Math.random()*openStatuses.length)];
    }
    return {
      id: commId+'-'+bedType.replace(' ','')+'-'+num,
      leaseId: 'LSE-'+commId.slice(-3)+'-'+num,
      bedType, rcStatus: rcStatuses[Math.floor(Math.random()*7)],
      isAffordable: AFFORDABLE_COMMUNITIES.has(commId) && Math.random() < 0.35,
      leaseEnd, leaseEndDays, daysToOffer, leaseTerm, leasePrice, concsAmt, netEffLeasePrice,
      renewalOfferPrice, renewalOfferTerm: 12, renewalPricePct, deltaToNewLease, newLeasePrice,
      status,
      attValue: [80,100,120,150,175,200][Math.floor(Math.random()*6)],
      floorplan: ['Studio','1BR/1BA','1BR/2BA','2BR/1BA','2BR/2BA','3BR/2BA'][Math.floor(Math.random()*6)],
      area: Math.floor(Math.random()*600+450),
      alerts: ['concession','comp','optimizer','manual'].filter(()=>Math.random()>0.7),
    };
  });
}

const RENEWALS_DATA = PRICING_DATA.map(comm => ({
  ...comm,
  bedTypes: comm.bedTypes.map(bt => ({
    ...bt,
    renewalUnits: makeRenewalUnits(comm.id, bt.type, Math.floor(Math.random()*4)+2, bt.recRent),
  })),
}));

// Concession Management — priority-based stacking
// Legacy Auto-Params dropdowns still reference these display names; the
// New/Edit form no longer asks for a categorical concession "type" — it asks
// only for a value type (flat_monthly / total_dollar / pct_monthly_rent) plus
// an amount, apply-to mode, and applicable lease terms.
const CONCESSION_TYPE_OPTIONS=['Flat monthly','Total $ amount','Total amount as % of monthly rent'];
const CONCESSION_VALUE_TYPES = [
  { id: 'flat_monthly',     label: 'Flat monthly',                     desc: 'Fixed $ amount per month, applied across the lease term' },
  { id: 'total_dollar',     label: 'Total $ amount',                   desc: 'One-time $ amount spread across the lease term' },
  { id: 'pct_monthly_rent', label: 'Total amount as % of monthly rent', desc: 'One-time amount equal to X% of a month’s rent, spread across the lease term' },
];
const _fmtD=d=>(d.getMonth()+1).toString().padStart(2,'0')+'/'+d.getDate().toString().padStart(2,'0')+'/'+String(d.getFullYear()).slice(2);
const _RM_NAMES = ['Sarah Mitchell','Tom Bridges','Priya Nair','Carlos Reyes','Amy Chen'];

// Legacy; still referenced by Auto-Params Default Type dropdown — all three
// new value types amortise into a monthly impact, so everything is monthly.
const MONTHLY_BY_TYPE = {
  'Flat monthly': true,
  'Total $ amount': true,
  'Total amount as % of monthly rent': true,
};

// Returns the union of lease terms (2..24) marked available across every bed
// type covered by the given scope. Used to populate the Applicable Lease
// Terms multi-select on the concession form. Reads both the new-lease and
// renewal availability arrays so the form's term list covers every lease
// type a concession might apply to.
function getAvailableTermsForScope(commId, bedType) {
  if (typeof TERM_DATA === 'undefined') return [];
  const comm = TERM_DATA.find(c => c.id === commId);
  if (!comm) return [];
  const bts = bedType ? comm.bedTypes.filter(b => b.type === bedType) : comm.bedTypes;
  const terms = new Set();
  bts.forEach(bt => {
    for (let m = 2; m <= 24; m++) {
      if ((bt.availabilityNewLease && bt.availabilityNewLease[m]) ||
          (bt.availabilityRenewal  && bt.availabilityRenewal[m])) {
        terms.add(m);
      }
    }
  });
  return Array.from(terms).sort((a, b) => a - b);
}

// Monthly $ impact of a single concession at the given gross rent and lease
// term. Lease term defaults to 12 for display contexts where the actual
// signed term is not yet known.
function concessionMonthlyImpact(conc, baseRent, leaseTerm) {
  const term = leaseTerm || 12;
  if (conc.valueType === 'flat_monthly')     return conc.value;
  if (conc.valueType === 'total_dollar')     return Math.round(conc.value / term);
  if (conc.valueType === 'pct_monthly_rent') return Math.round(baseRent * (conc.value / 100) / term);
  return 0;
}

// Stacks every Active concession that covers the requested lease term,
// respecting priority + non-stackable overrides. Returns:
//   totalAmount    — sum of monthly impact for applyTo='net_eff' concessions
//                    (i.e. monthly reduction to the tenant's effective rent)
//   grossAddition  — sum of monthly impact for applyTo='gross' concessions
//                    (i.e. monthly markup layered onto the advertised gross)
//   effectiveRent  — baseRent − totalAmount (what the tenant pays monthly)
//   stackedList    — concessions that survived priority / stackable filtering
//                    and the lease-term filter
function computeUnitConcessions(baseRent, concessions, leaseTerm) {
  const term = leaseTerm || 12;
  const active = concessions
    .filter(c => c.status === 'Active')
    .filter(c => !Array.isArray(c.applicableLeaseTerms) || c.applicableLeaseTerms.length === 0 || c.applicableLeaseTerms.includes(term))
    .sort((a, b) => a.priority - b.priority);
  if (!active.length) return { totalAmount: 0, grossAddition: 0, effectiveRent: baseRent, stackedList: [] };
  const ns = active.find(c => !c.stackable);
  const applied = ns ? active.filter(c => c.priority < ns.priority || c.id === ns.id) : active;
  let totalAmount = 0;
  let grossAddition = 0;
  applied.forEach(c => {
    const impact = concessionMonthlyImpact(c, baseRent, term);
    if (c.applyTo === 'gross') grossAddition += impact;
    else                        totalAmount   += impact;
  });
  return {
    totalAmount,
    grossAddition,
    effectiveRent: Math.max(0, baseRent - totalAmount),
    stackedList: applied,
  };
}

function generateConcessions(comm, bt, unitId, level) {
  const baseRent = bt.recRent;
  const prob = { community: 0.5, bedtype: 0.55, unit: 0.4 };
  if (Math.random() > prob[level]) return [];
  const count = level === 'unit'
    ? (Math.random() > 0.7 ? 2 : 1)
    : (Math.random() > 0.6 ? 2 : 1);

  const availableTerms = getAvailableTermsForScope(comm.id, bt?.type ?? null);
  const defaultTerm    = 12;

  return Array.from({ length: count }, (_, i) => {
    // Pick one of the three value types with a roughly even distribution.
    const roll = Math.random();
    let valueType, value;
    if (roll < 0.4) {
      valueType = 'flat_monthly';
      value = [50, 75, 100, 150, 200, 250][Math.floor(Math.random() * 6)];
    } else if (roll < 0.8) {
      valueType = 'total_dollar';
      value = [500, 750, 1000, 1500, 2000, 2500][Math.floor(Math.random() * 6)];
    } else {
      valueType = 'pct_monthly_rent';
      value = [25, 50, 75, 100][Math.floor(Math.random() * 4)];
    }

    // Display amount = monthly impact at the default 12-month term.
    const tempConc = { valueType, value };
    const displayAmount = concessionMonthlyImpact(tempConc, baseRent, defaultTerm);

    // ~15% of seeded concessions use the gross-up mode.
    const applyTo = Math.random() > 0.85 ? 'gross' : 'net_eff';

    // Default to all terms available for the scope; if TERM_DATA has none
    // available for this scope, fall back to a sensible default set so the
    // concession still applies to typical leases.
    const applicableLeaseTerms = availableTerms.length > 0
      ? [...availableTerms]
      : [6, 9, 12];

    const priority = i + 1 + (level === 'community' ? 0 : level === 'bedtype' ? 2 : 4);
    const stackable = Math.random() > 0.25;
    const dr = Math.floor(Math.random() * 60) - 5;
    const da = Math.floor(Math.random() * 40) + 5;
    const status = dr < 0 ? 'Expired' : Math.random() > 0.85 ? 'Paused' : 'Active';
    const leaseType = level === 'community' ? 'Both' : Math.random() > 0.5 ? 'New Lease' : 'Renewal';
    const sd = new Date(2025, 2, 1);
    const ed = new Date(2025, 3, 8);
    ed.setDate(ed.getDate() + Math.max(0, dr));
    const startDate = _fmtD(sd);
    const endDate = _fmtD(ed);
    const lo = level !== 'unit' ? Math.floor(Math.random() * 15) + 3 : null;
    const lt = lo ? Math.floor(lo * (Math.random() * 0.5 + 0.15)) : null;

    // Audit trail
    const createdBy = _RM_NAMES[Math.floor(Math.random() * _RM_NAMES.length)];
    const daysAgo = Math.floor(Math.random() * 60 + 5);
    const _fmtDate = d => d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
    const _createdAtDate = new Date();
    _createdAtDate.setDate(_createdAtDate.getDate() - daysAgo);
    const createdAt = _fmtDate(_createdAtDate);
    const editedBy = Math.random() > 0.5 ? _RM_NAMES[Math.floor(Math.random() * _RM_NAMES.length)] : null;
    let editedAt = null;
    if (editedBy) {
      const _ed = new Date();
      _ed.setDate(_ed.getDate() - Math.floor(Math.random() * daysAgo));
      editedAt = _fmtDate(_ed);
    }
    const history = Array.from({ length: Math.floor(Math.random() * 3) + 1 }, (_, hi) => {
      const fields = ['amount', 'status', 'endDate', 'leaseType'];
      const field = fields[Math.floor(Math.random() * fields.length)];
      const hd = new Date();
      hd.setDate(hd.getDate() - Math.max(0, daysAgo - hi * 7));
      return {
        date: _fmtDate(hd),
        editedBy: _RM_NAMES[Math.floor(Math.random() * _RM_NAMES.length)],
        field,
        oldValue: field === 'amount' ? '$' + Math.max(0, value - 50)
          : field === 'status'       ? 'Paused'
          : field === 'endDate'      ? '03/31/25'
          :                            'New Lease',
        newValue: field === 'amount' ? '$' + value
          : field === 'status'       ? 'Active'
          : field === 'endDate'      ? endDate
          :                            leaseType,
      };
    });

    return {
      id: 'CONC-' + level.toUpperCase() + '-' + (unitId ?? bt.type) + '-' + comm.id + '-' + i,
      level, commId: comm.id, commName: comm.name,
      bedType: bt?.type ?? null, unitId: unitId ?? null,
      leaseType, value, valueType, displayAmount,
      applyTo, applicableLeaseTerms,
      monthly: true,
      priority, stackable, status,
      daysActive: da, daysRemaining: dr,
      startDate, endDate,
      excludeAffordable: Math.random() > 0.7,
      excludeRC: Math.random() > 0.6,
      leasesOfferedTo: lo, leasesTaken: lt,
      uptakeRate: lo && lt ? parseFloat((lt / lo * 100).toFixed(1)) : null,
      totalCost: lt ? lt * displayAmount : null,
      taken: level === 'unit' ? Math.random() > 0.5 : null,
      daysVacant: level === 'unit' ? Math.floor(Math.random() * 45) + 5 : null,
      daysToSign: level === 'unit' && Math.random() > 0.5 ? Math.floor(Math.random() * 20) + 2 : null,
      createdBy, createdAt, editedBy, editedAt, history,
    };
  });
}


const CONCESSIONS_DATA=PRICING_DATA.map(comm=>{
  const cc=generateConcessions(comm,{recRent:comm.bedTypes[0]?.recRent??1800},null,'community');
  const bedTypes=comm.bedTypes.map(bt=>{
    const bc=generateConcessions(comm,bt,null,'bedtype');
    const units=(bt.units||[]).map(unit=>{
      const uc=generateConcessions(comm,bt,unit.id,'unit');
      const allApp=[...cc,...bc,...uc].filter(c=>{if(c.excludeAffordable&&unit.rcStatus==='AF')return false;if(c.excludeRC&&unit.rcStatus==='RC')return false;return true;});
      const{totalAmount,effectiveRent,stackedList}=computeUnitConcessions(unit.recRent??bt.recRent,allApp);
      const concPct=unit.recRent?parseFloat((totalAmount/unit.recRent*100).toFixed(1)):0;
      return{...unit,baseRent:unit.recRent??bt.recRent,concessions:uc,allApplicableConcessions:allApp,stackedList,totalConcessionAmount:totalAmount,effectiveNetRent:effectiveRent,concPctOfRent:concPct,hasConcession:totalAmount>0,stackCount:stackedList.length,daysOnMarket:Math.floor(Math.random()*45)+5};
    });
    const uwc=units.filter(u=>u.hasConcession);
    const avgCA=uwc.length>0?Math.round(uwc.reduce((s,u)=>s+u.totalConcessionAmount,0)/uwc.length):0;
    const avgCP=uwc.length>0?parseFloat((uwc.reduce((s,u)=>s+u.concPctOfRent,0)/uwc.length).toFixed(1)):0;
    const avgNER=units.length>0?Math.round(units.reduce((s,u)=>s+u.effectiveNetRent,0)/units.length):0;
    const covPct=units.length>0?parseFloat((uwc.length/units.length*100).toFixed(1)):0;
    return{...bt,units,btConcessions:bc,coveragePct:covPct,unitsWithConc:uwc.length,avgConcAmt:avgCA,avgConcPct:avgCP,avgNetEffRent:avgNER};
  });
  const allU=bedTypes.flatMap(bt=>bt.units);const auwc=allU.filter(u=>u.hasConcession);
  const cCov=allU.length>0?parseFloat((auwc.length/allU.length*100).toFixed(1)):0;
  const cAvgCA=auwc.length>0?Math.round(auwc.reduce((s,u)=>s+u.totalConcessionAmount,0)/auwc.length):0;
  const cAvgCP=auwc.length>0?parseFloat((auwc.reduce((s,u)=>s+u.concPctOfRent,0)/auwc.length).toFixed(1)):0;
  const cAvgNER=allU.length>0?Math.round(allU.reduce((s,u)=>s+u.effectiveNetRent,0)/allU.length):0;
  const tga=auwc.reduce((s,u)=>s+u.totalConcessionAmount,0);
  const usc=allU.filter(u=>u.stackCount>=2).length;
  return{...comm,commConcessions:cc,bedTypes,allUnits:allU,commCoveragePct:cCov,commAvgConcAmt:cAvgCA,commAvgConcPct:cAvgCP,commAvgNetEffRent:cAvgNER,totalGivenAway:tga,unitsStackedConc:usc};
});

function getConcessionKPIs(data){const allU=data.flatMap(c=>c.allUnits);const wc=allU.filter(u=>u.hasConcession);const stk=allU.filter(u=>u.stackCount>=2);const tga=data.reduce((s,c)=>s+c.totalGivenAway,0);const allC=data.flatMap(c=>[...c.commConcessions,...c.bedTypes.flatMap(bt=>bt.btConcessions),...c.bedTypes.flatMap(bt=>bt.units.flatMap(u=>u.concessions))]);const exp=allC.filter(c=>c.status==='Active'&&c.daysRemaining>=0&&c.daysRemaining<=14).length;return{totalActive:allC.filter(c=>c.status==='Active').length,coveragePct:allU.length>0?parseFloat((wc.length/allU.length*100).toFixed(1)):0,totalGivenAway:tga,stackedUnits:stk.length,expiringSoon:exp};}

// Competitor concession data
const COMPETITOR_NAMES=['Greystar Residences','Camden Properties','Aimco Apartments','Equity Residential','Post Apartments','MAA Communities','UDR Living','Broadstone','Cortland','Bell Partners'];
const COMP_CONCESSION_TYPES=['Free Month','Move-in Special','Look & Lease','Reduced Deposit','Gift Card','Waived Fees'];
const COMP_STATUSES=['Active','Active','Active','Expired','Unverified'];

const COMPETITOR_DATA=COMMUNITIES.map(comm=>{
  const cp=PRICING_DATA.find(p=>p.id===comm.id);
  const baseRent=cp?.bedTypes[0]?.recRent??1800;
  const numComp=Math.floor(Math.random()*3)+3;
  const fmtD=d=>(d.getMonth()+1).toString().padStart(2,'0')+'/'+d.getDate().toString().padStart(2,'0')+'/'+String(d.getFullYear()).slice(2);
  const competitors=Array.from({length:numComp},(_,i)=>{
    const name=COMPETITOR_NAMES[Math.floor(Math.random()*10)];
    const bedType=['1 Bed','2 Bed','3 Bed'][Math.floor(Math.random()*3)];
    const concType=COMP_CONCESSION_TYPES[Math.floor(Math.random()*6)];
    const amount=[100,150,200,250,300,500,0][Math.floor(Math.random()*7)];
    const daysAgo=Math.floor(Math.random()*60);
    const fs=new Date(2025,3,8);fs.setDate(fs.getDate()-daysAgo);
    const vda=Math.floor(Math.random()*20);
    const lv=new Date(2025,3,8);lv.setDate(lv.getDate()-vda);
    const status=COMP_STATUSES[Math.floor(Math.random()*5)];
    const wc=CONCESSIONS_DATA.find(c=>c.id===comm.id);
    const wbt=wc?.bedTypes.find(b=>b.type===bedType);
    const wAvg=wbt?.avgAmount??0;
    let windsorResponse;
    if(wAvg===0)windsorResponse='No concession';else if(wAvg>amount+50)windsorResponse='Exceeding';else if(Math.abs(wAvg-amount)<=50)windsorResponse='Matched';else windsorResponse='Below market';
    const compBaseRent=Math.round(baseRent*(0.97+Math.random()*0.06));
    const netEffRent=amount>0?compBaseRent-amount:compBaseRent;
    const hLen=Math.floor(Math.random()*4)+2;
    const history=Array.from({length:hLen},(_,h)=>{const hd=new Date(fs);hd.setDate(hd.getDate()-(h*15));return{date:fmtD(hd),amount:amount+Math.floor(Math.random()*100-50),type:COMP_CONCESSION_TYPES[Math.floor(Math.random()*6)],status:h===0?status:'Expired'};});
    return{id:'COMP-'+comm.id+'-'+i,commId:comm.id,commName:comm.name,metro:comm.metro,name,bedType,concType,amount,baseRent:compBaseRent,netEffRent,firstSeen:fmtD(fs),lastVerified:fmtD(lv),verifiedDaysAgo:vda,status,windsorResponse,windsorAvgAmount:wAvg,flaggedForResponse:false,unitCoverage:parseFloat((Math.random()*50+15).toFixed(1)),history};
  });
  const activeComps=competitors.filter(c=>c.status==='Active');
  const avgCompAmount=activeComps.length>0?Math.round(activeComps.reduce((s,c)=>s+c.amount,0)/activeComps.length):0;
  const wComm=CONCESSIONS_DATA.find(c=>c.id===comm.id);
  const windsorAvg=wComm?Math.round(wComm.bedTypes.reduce((s,bt)=>s+bt.avgAmount,0)/wComm.bedTypes.length):0;
  const marketPosition=windsorAvg===0&&avgCompAmount>0?'No concession':windsorAvg>avgCompAmount+50?'Leading':Math.abs(windsorAvg-avgCompAmount)<=50?'At market':'Below market';
  return{commId:comm.id,commName:comm.name,metro:comm.metro,state:comm.state,rm:comm.rm,cd:comm.cd,competitors,numActive:activeComps.length,numTotal:competitors.length,avgCompAmount,windsorAvg,marketPosition};
});

function getMarketKPIs(data){
  const all=data.flatMap(c=>c.competitors);const active=all.filter(c=>c.status==='Active');
  const moreAgg=data.filter(c=>c.avgCompAmount>c.windsorAvg+50).length;
  const leading=data.filter(c=>c.marketPosition==='Leading').length;
  const unverified=all.filter(c=>c.verifiedDaysAgo>14).length;
  const tc={};active.forEach(c=>{tc[c.concType]=(tc[c.concType]||0)+1;});
  const mc=Object.entries(tc).sort((a,b)=>b[1]-a[1])[0];
  return{moreAggressive:moreAgg,windsorLeading:leading,mostCommonType:mc?mc[0]:'\u2014',mostCommonPct:mc?Math.round(mc[1]/active.length*100):0,unverified};
}

// Rent Control — rule config. Rules are data only; they aren't evaluated
// against actual prices anywhere else in the app.
//
// Current CPI rate (percent). In production this would come from a BLS feed;
// for the POC it's a single hard-coded constant that flows into every
// CPI-based rule's effective-cap computation.
const CURRENT_CPI = 3.1;

// Rule shape:
//   formula.type: 'flat_pct' | 'flat_dollar' | 'cpi' | 'lesser_of' | 'greater_of'
//   flat_pct    → { type, value }
//   flat_dollar → { type, value }
//   cpi         → { type, cpiMultiplier (percent, 100 = raw CPI), cpiAddition (percent) }
//   lesser_of/greater_of → { type, operands: [sub, sub] }, sub ∈ {flat_pct, flat_dollar, cpi}
//   (nested lesser_of / greater_of is not allowed — flatten to a single level)
let RENT_CONTROL_RULES = [
  {
    id: 'RCR-001',
    name: 'Windsor Turtle Creek 1-bed cap',
    scope: { communityIds: ['WCC-001'], bedTypes: ['1 Bed'], unitIds: 'all' },
    formula: { type: 'flat_pct', value: 5 },
    ceiling: null,
    timeframe: '12mo',
    firstYearProtection: false,
    noticePeriodDays: 60,
    buildingAgeExemptionYears: null,
    vacancyDecontrol: 'none',
    vacancyBonusPct: null,
    vacancyMaxTotalPct: null,
    bankingAllowed: false,
    bankingMaxMultiplier: null,
    activeFrom: '2026-03-01T00:00:00.000Z',
    activeTo: null,
    notes: 'Tighter cap on Turtle Creek 1-bed units per asset management request.',
  },
  {
    id: 'RCR-002',
    name: 'Windsor CityLine legacy cap',
    scope: { communityIds: ['WCC-003'], bedTypes: ['2 Bed'], unitIds: ['WCC-003-2Bed-001'] },
    formula: { type: 'flat_pct', value: 3.5 },
    ceiling: null,
    timeframe: '12mo',
    firstYearProtection: false,
    noticePeriodDays: 30,
    buildingAgeExemptionYears: null,
    vacancyDecontrol: 'none',
    vacancyBonusPct: null,
    vacancyMaxTotalPct: null,
    bankingAllowed: false,
    bankingMaxMultiplier: null,
    activeFrom: '2026-01-01T00:00:00.000Z',
    activeTo: null,
    notes: 'Carried over from the prior tenant agreement on unit WCC-003-2Bed-001.',
  },
  {
    id: 'RCR-003',
    name: 'WCC-005-2Bed-002 legacy cap',
    scope: { communityIds: ['WCC-005'], bedTypes: ['2 Bed'], unitIds: ['WCC-005-2Bed-002'] },
    formula: { type: 'flat_pct', value: 3 },
    ceiling: null,
    timeframe: '12mo',
    firstYearProtection: false,
    noticePeriodDays: 30,
    buildingAgeExemptionYears: null,
    vacancyDecontrol: 'none',
    vacancyBonusPct: null,
    vacancyMaxTotalPct: null,
    bankingAllowed: false,
    bankingMaxMultiplier: null,
    activeFrom: '2026-01-01T00:00:00.000Z',
    activeTo: null,
    notes: 'Legacy tenant agreement — honor reduced cap until turnover.',
  },
  {
    id: 'RCR-004',
    name: 'Windsor Old Fourth Ward 2-bed cap',
    scope: { communityIds: ['WCC-007'], bedTypes: ['2 Bed'], unitIds: 'all' },
    formula: { type: 'flat_dollar', value: 125 },
    ceiling: null,
    timeframe: '12mo',
    firstYearProtection: false,
    noticePeriodDays: 60,
    buildingAgeExemptionYears: null,
    vacancyDecontrol: 'none',
    vacancyBonusPct: null,
    vacancyMaxTotalPct: null,
    bankingAllowed: false,
    bankingMaxMultiplier: null,
    activeFrom: '2026-02-01T00:00:00.000Z',
    activeTo: '2026-12-31T00:00:00.000Z',
    notes: 'Dollar-cap on 2-bed units through year-end; tracks Atlanta inclusionary-zoning overlay.',
  },
  {
    id: 'RCR-005',
    name: 'Windsor at Pembroke Gardens cap',
    scope: { communityIds: ['WCC-009'], bedTypes: ['1 Bed', '2 Bed'], unitIds: 'all' },
    formula: { type: 'flat_pct', value: 4 },
    ceiling: null,
    timeframe: '12mo',
    firstYearProtection: false,
    noticePeriodDays: 60,
    buildingAgeExemptionYears: null,
    vacancyDecontrol: 'none',
    vacancyBonusPct: null,
    vacancyMaxTotalPct: null,
    bankingAllowed: false,
    bankingMaxMultiplier: null,
    activeFrom: '2026-01-01T00:00:00.000Z',
    activeTo: null,
    notes: 'South Florida affordable-housing overlay — applies to 1 and 2-bed units (3-bed units exempt).',
  },
  {
    id: 'RCR-006',
    name: 'Windsor Addison Park 2-bed cap',
    scope: { communityIds: ['WCC-011'], bedTypes: ['2 Bed'], unitIds: 'all' },
    formula: { type: 'flat_pct', value: 6 },
    ceiling: null,
    timeframe: '12mo',
    firstYearProtection: false,
    noticePeriodDays: 60,
    buildingAgeExemptionYears: null,
    vacancyDecontrol: 'none',
    vacancyBonusPct: null,
    vacancyMaxTotalPct: null,
    bankingAllowed: false,
    bankingMaxMultiplier: null,
    activeFrom: '2026-01-01T00:00:00.000Z',
    activeTo: null,
    notes: 'Charlotte portfolio — legacy 2-bed cap carried from prior management agreement.',
  },
  {
    id: 'RCR-007',
    name: 'Windsor on White Rock Lake 3-bed cap',
    scope: { communityIds: ['WCC-002'], bedTypes: ['3 Bed'], unitIds: ['WCC-002-3Bed-001'] },
    formula: { type: 'flat_pct', value: 5 },
    ceiling: null,
    timeframe: '12mo',
    firstYearProtection: false,
    noticePeriodDays: 30,
    buildingAgeExemptionYears: null,
    vacancyDecontrol: 'none',
    vacancyBonusPct: null,
    vacancyMaxTotalPct: null,
    bankingAllowed: false,
    bankingMaxMultiplier: null,
    activeFrom: '2026-02-01T00:00:00.000Z',
    activeTo: null,
    notes: 'Single-unit legacy cap on a 3-bed unit at White Rock Lake.',
  },
];

// Returns every currently-active rule whose scope covers this (community, bed
// type, unit) triple. A rule is active when "now" (ms) falls within
// activeFrom..activeTo; activeTo === null means indefinite. Scope matches when
// each of communityIds / bedTypes / unitIds is either the string 'all' or an
// array that includes the unit's value.
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

// Chart data for exposure panel
const CHART_MONTHS = ['Jan 25','Feb 25','Mar 25','Apr 25','May 25','Jun 25','Jul 25','Aug 25','Sep 25','Oct 25','Nov 25','Dec 25'];

function makeExposureData() {
  return CHART_MONTHS.map((m, i) => ({
    month: m,
    vacantExposure: +(Math.random() * 2.5 + 1.0).toFixed(2),
    exp30:          +(Math.random() * 2.5 + 1.5).toFixed(2),
    exp60:          +(Math.random() * 3.0 + 2.0).toFixed(2),
  }));
}

function makePricingData(baseRent) {
  return CHART_MONTHS.map(m => {
    const compMedian = baseRent + 60 + Math.floor(Math.random() * 80 - 40);
    return {
      month: m,
      windsorMedian: baseRent + Math.floor(Math.random() * 60 - 30),
      compMedian,
      compFloor:   compMedian - 150 + Math.floor(Math.random() * 40 - 20),
      compCeiling: compMedian + 180 + Math.floor(Math.random() * 40 - 20),
    };
  });
}

// ── Lease History ─────────────────────────────────────────
// Unit-level lease ledger: new leases, renewals, move-ins, move-outs.
const LEASE_EVENT_META = {
  new_lease_signed: { label: 'New Lease' },
  renewal_signed:   { label: 'Renewal' },
  move_in:          { label: 'Move-in' },
  move_out:         { label: 'Move-out' },
};

const LEASE_EVENT_STYLE = {
  new_lease_signed: { bg:'#fce7f3', fg:'#b91c6d' },  // pink family (accent tint)
  renewal_signed:   { bg:'#dbeafe', fg:'#1e40af' },  // blue family
  move_in:          { bg:'#dcfce7', fg:'#166534' },  // green family
  move_out:         { bg:'#e2e8f0', fg:'#475569' },  // slate/grey family
};

const LEASE_RESIDENT_NAMES = [
  'J. Martinez','S. Chen','R. Patel','M. Kim','A. Thompson',
  'L. Rodriguez','D. Okafor','E. Nguyen','K. Brown','C. Wilson',
  'T. Garcia','P. Singh','N. Ivanov','H. Yamamoto','B. Johnson',
  'F. Ortiz','G. Adebayo','V. Popescu','O. Osei','W. Lee',
  'Y. Abdi','Q. Zhao','J. Davis','S. Rashid','K. Fischer',
  'L. Park','A. Ramirez','M. Dubois','T. Ali','E. Schultz',
  'R. Mendez','B. Webber','C. Jensen','A. Malik','J. Cooper',
  'N. Ahmad','L. Ortega','P. Svensson','D. Hernandez','M. O’Brien',
];

const LEASE_HISTORY_DATA = (function() {
  // Seeded PRNG (mulberry32) for stable output across reloads
  let s = 0x7e23a9bf;
  const rng = () => {
    s = (s + 0x6d2b79f5) | 0;
    let t = Math.imul(s ^ (s >>> 15), 1 | s);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
  const roundTen = n => Math.round(n / 10) * 10;

  // Weight each unit by community size so larger properties get more events.
  const unitPool = [];
  PRICING_DATA.forEach(comm => {
    const weight = Math.max(1, Math.round(comm.totalUnits / 20));
    comm.bedTypes.forEach(bt => {
      bt.units.forEach(u => {
        for (let k = 0; k < weight; k++) {
          unitPool.push({
            commId: comm.id, unitId: u.id, bedType: bt.type,
            rm: comm.rm, commClass: comm.class,
          });
        }
      });
    });
  });

  const MIX = [
    ['new_lease_signed', 42],
    ['renewal_signed',   42],
    ['move_in',          18],
    ['move_out',         18],
  ];

  const todayMs = Date.parse('2026-04-21T12:00:00Z');
  const DAY_MS  = 86400000;
  const LEASE_TERMS = [6, 9, 10, 12, 13, 14, 15];

  // Concession pool: mostly "1 mo free" / "$500 flat" / "$1,000 flat",
  // with ~1/3 of leases running at None.
  const CONC_POOL = [
    { type:'Free Period',  amount:1,    description:'1 mo free'         },
    { type:'Free Period',  amount:1,    description:'1 mo free'         },
    { type:'Free Period',  amount:1,    description:'1 mo free'         },
    { type:'Flat Monthly', amount:500,  description:'$500 flat'         },
    { type:'Flat Monthly', amount:500,  description:'$500 flat'         },
    { type:'Flat Monthly', amount:1000, description:'$1,000 flat'       },
    null, null, null, // "None"
  ];

  // Class A: $2,000–$3,200; Class B: $1,600–$2,400. Bed-type graded so
  // larger units skew high within each band.
  function grossRentFor(commClass, bedType) {
    const [lo, hi] = commClass === 'A' ? [2000, 3200] : [1600, 2400];
    const bedFrac  = bedType === '1 Bed' ? 0.15 : bedType === '2 Bed' ? 0.5 : 0.85;
    const center   = lo + bedFrac * (hi - lo);
    const jitter   = (rng() - 0.5) * (hi - lo) * 0.25;
    return roundTen(Math.min(hi, Math.max(lo, center + jitter)));
  }

  function netEffFor(gross, term, conc) {
    if (!conc) return gross;
    if (conc.type === 'Free Period')  return roundTen(gross * (term - conc.amount) / term);
    if (conc.type === 'Flat Monthly') return gross - conc.amount;
    return gross;
  }

  // All event dates land at UTC noon to keep calendar-day identity stable
  // across timezones when formatted.
  function dateAtUTCNoon(ms) {
    const d = new Date(ms);
    d.setUTCHours(12, 0, 0, 0);
    return d;
  }
  function addDays(d, days) {
    const out = new Date(d);
    out.setUTCDate(out.getUTCDate() + days);
    return out;
  }
  function addMonths(d, months) {
    const out = new Date(d);
    out.setUTCMonth(out.getUTCMonth() + months);
    return out;
  }
  const iso = d => d.toISOString();

  const events = [];
  let seq = 0;
  MIX.forEach(([type, count]) => {
    for (let i = 0; i < count; i++) {
      const u = unitPool[Math.floor(rng() * unitPool.length)];
      const dayBack = Math.floor(rng() * 90);
      const evDate  = dateAtUTCNoon(todayMs - dayBack * DAY_MS);
      seq++;
      const resident = LEASE_RESIDENT_NAMES[Math.floor(rng() * LEASE_RESIDENT_NAMES.length)];

      const ev = {
        id: 'LHE-' + String(seq).padStart(4, '0'),
        eventDate: iso(evDate),
        moveInDate: null,
        moveOutDate: null,
        renewalEffectiveDate: null,
        communityId: u.commId,
        unitId: u.unitId,
        bedType: u.bedType,
        eventType: type,
        resident, user: u.rm,
        leaseTerm: null, grossRent: null, concession: null, netEffRent: null,
      };

      if (type === 'new_lease_signed') {
        const term  = LEASE_TERMS[Math.floor(rng() * LEASE_TERMS.length)];
        const gross = grossRentFor(u.commClass, u.bedType);
        const conc  = CONC_POOL[Math.floor(rng() * CONC_POOL.length)];
        ev.leaseTerm  = term;
        ev.grossRent  = gross;
        ev.concession = conc;
        ev.netEffRent = netEffFor(gross, term, conc);
        ev.moveInDate  = iso(addDays(evDate, Math.floor(rng() * 22)));    // 0–21 days after signing
        ev.moveOutDate = iso(addMonths(evDate, term));                    // signing + term
      } else if (type === 'renewal_signed') {
        const term  = LEASE_TERMS[Math.floor(rng() * LEASE_TERMS.length)];
        const gross = grossRentFor(u.commClass, u.bedType);
        const conc  = CONC_POOL[Math.floor(rng() * CONC_POOL.length)];
        ev.leaseTerm  = term;
        ev.grossRent  = gross;
        ev.concession = conc;
        ev.netEffRent = netEffFor(gross, term, conc);
        const rEff = addDays(evDate, Math.floor(rng() * 61));             // 0–60 days after signing
        ev.renewalEffectiveDate = iso(rEff);
        ev.moveOutDate = iso(addMonths(rEff, term));                      // renewal effective + term
      } else if (type === 'move_in') {
        ev.moveInDate = ev.eventDate;
      } else if (type === 'move_out') {
        ev.moveOutDate = ev.eventDate;
      }

      events.push(ev);
    }
  });

  events.sort((a, b) => b.eventDate.localeCompare(a.eventDate));
  return events;
})();
