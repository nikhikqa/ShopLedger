# ShopLedger

## Stack
- Node.js CommonJS application using Express 4 and body-parser.
- Browser UI is static HTML, CSS, and JavaScript served from `public/`.
- Application data is stored in `data/db.json` through `lib/store.js`.

## Module map
- `routes/customers.js` — lists customers and settlements; records Khata settlements.
- `routes/orders.js` — lists, retrieves, places, and cancels orders.
- `routes/products.js` — lists/searches products and lists active coupons.
- `routes/reports.js` — dashboard and GST reconciliation, pricing preview, admin export.
- `lib/coupons.js` — normalizes, validates, and calculates coupon discounts.
- `lib/dates.js` — formats today’s date, normalizes date keys, and derives fiscal year.
- `lib/inventory.js` — finds products, checks/reserves/releases stock, and summarizes inventory.
- `lib/invoice.js` — computes invoice figures and renders printable invoice HTML.
- `lib/ledger.js` — customer lookup/listing, Khata charges/reversals, and settlements.
- `lib/orders.js` — adds, retrieves, cancels, and filters orders.
- `lib/pricing.js` — computes subtotals, discounts, line tax, and order totals.
- `lib/reports.js` — computes dashboard summaries and invoice reconciliation.
- `lib/store.js` — reads/writes the JSON database and appends audit entries.
- `lib/tax.js` — resolves item GST rates and splits tax into CGST/SGST.

## Commands
- Start the app: `npm start` (runs `node server.js`).
- Run tests: `node --test`.

## Rules
1. Write characterization tests before changing behaviour.
2. Change only the module(s) the ticket is about.
3. Tests never read or write `data/db.json`; use in-memory data.
4. Add no dependencies.
5. Make the smallest fix that works.

## Current ticket
- Invoice total and GST breakdown do not match what the customer was billed.
- Allowed files: `lib/invoice.js` (`lib/tax.js` only if truly needed).
