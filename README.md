# THE FIZZ — Dynamica SmartRents Demo

Revenue-management demo tailored for **THE FIZZ** (student accommodation, International Campus), built by repurposing the `example-reit` demo with booking-curve / demand mechanics adapted from `example-theme-park`.

## Run it

Any static file server works, e.g.:

```
python3 -m http.server 8642 --directory the-fizz
```

then open http://localhost:8642/pricing.html

## Contents

- **`the-fizz/`** — the demo itself
  - `pricing.html` — main pricing screen (booking pace, demand, alerts, recommendations, stay types)
  - `stay-types.html` — stay-type availability & premium configuration
  - `rent-control.html` — EU rent-regulation rules (Mietpreisbremse, WWS, etc.)
  - `autopilot.html` — per-house auto-accept rules
  - `parameters.html` — engine parameters
  - `data.js` — seeded demo data (12 real FIZZ houses, EUR rates)
  - `filters.js` — shared pill-filter component
- **`example-reit/`**, **`example-theme-park/`** — the source demos this was adapted from

## Demo notes

- Demo "today" is pinned to **15 May 2026** (mid booking season for the Sep/Oct 2026 intake); data is seeded so it's stable across reloads.
- Booking curves, pace and demand exist at house and house × room-type (Single/Double Studio) level; units carry rate + recommendation only.
- Rates shown are Full Year Stay / Sep 1 move-in; the stay-type modal shows all five stay types for both move-in dates (Oct 1 = +5% hold premium).
