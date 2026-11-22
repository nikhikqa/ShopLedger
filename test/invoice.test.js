'use strict';

const test = require('node:test');
const assert = require('node:assert/strict');
const invoice = require('../lib/invoice');
const pricing = require('../lib/pricing');

function line(name, hsn, price, qty, gstRate) {
  return { name, sku: name, hsn, price, qty, gstRate };
}

const cases = [
  {
    name: 'CURRENT BEHAVIOUR: order 1001 mixed 18% and 5% slabs without coupon',
    items: [line('Assam CTC Masala Chai', '0902', 140, 2, 18), line('Toor Dal', '0713', 165, 2, 5)],
    coupon: '',
    checkout: { subtotal: 610, discount: 0, tax: 66.9, cgst: 33.45, sgst: 33.45, total: 676.9 },
    expected: {
      subtotal: 610, discount: 0, tax: 66.9, cgst: 33.45, sgst: 33.45, total: 676.9,
      rows: [
        { name: 'Assam CTC Masala Chai', sku: 'Assam CTC Masala Chai', hsn: '0902', qty: 2, price: 140, gstPercent: 18, line: 280, lineTax: 50.4 },
        { name: 'Toor Dal', sku: 'Toor Dal', hsn: '0713', qty: 2, price: 165, gstPercent: 5, line: 330, lineTax: 16.5 }
      ]
    }
  },
  {
    name: 'invoice matches checkout for order 1002 SAVE10 on ₹1,020',
    items: [line('Indrayani Rice', '1006', 640, 1, 5), line('Sunflower Oil', '1512', 190, 2, 5)],
    coupon: 'SAVE10',
    checkout: { subtotal: 1020, discount: 102, tax: 45.9, cgst: 22.95, sgst: 22.95, total: 963.9 },
    expected: {
      subtotal: 1020, discount: 102, tax: 45.9, cgst: 22.95, sgst: 22.95, total: 963.9,
      rows: [
        { name: 'Indrayani Rice', sku: 'Indrayani Rice', hsn: '1006', qty: 1, price: 640, gstPercent: 5, line: 640, lineTax: 28.8 },
        { name: 'Sunflower Oil', sku: 'Sunflower Oil', hsn: '1512', qty: 2, price: 190, gstPercent: 5, line: 380, lineTax: 17.1 }
      ]
    }
  },
  {
    name: 'invoice matches checkout for order 1004 SAVE10 with ₹150 cap',
    items: [line('Groundnut Oil', '1508', 1120, 2, 5)],
    coupon: 'SAVE10',
    checkout: { subtotal: 2240, discount: 150, tax: 104.5, cgst: 52.25, sgst: 52.25, total: 2194.5 },
    expected: {
      subtotal: 2240, discount: 150, tax: 104.5, cgst: 52.25, sgst: 52.25, total: 2194.5,
      rows: [
        { name: 'Groundnut Oil', sku: 'Groundnut Oil', hsn: '1508', qty: 2, price: 1120, gstPercent: 5, line: 2240, lineTax: 104.5 }
      ]
    }
  },
  {
    name: 'CURRENT BEHAVIOUR: order 1008 all 18% slabs without coupon',
    items: [line('Assam CTC Masala Chai', '0902', 140, 1, 18), line('Kokum Sherbet', '2106', 180, 2, 18)],
    coupon: '',
    checkout: { subtotal: 500, discount: 0, tax: 90, cgst: 45, sgst: 45, total: 590 },
    expected: {
      subtotal: 500, discount: 0, tax: 90, cgst: 45, sgst: 45, total: 590,
      rows: [
        { name: 'Assam CTC Masala Chai', sku: 'Assam CTC Masala Chai', hsn: '0902', qty: 1, price: 140, gstPercent: 18, line: 140, lineTax: 25.2 },
        { name: 'Kokum Sherbet', sku: 'Kokum Sherbet', hsn: '2106', qty: 2, price: 180, gstPercent: 18, line: 360, lineTax: 64.8 }
      ]
    }
  }
];

for (const scenario of cases) {
  test(scenario.name, () => {
    const checkoutFigures = pricing.computeTotals(scenario.items, scenario.coupon);
    const invoiceFigures = invoice.computeInvoiceFigures({ items: scenario.items, coupon: scenario.coupon });

    for (const [field, expected] of Object.entries(scenario.checkout)) {
      assert.equal(checkoutFigures[field], expected, `checkout ${field}`);
    }
    assert.deepEqual(invoiceFigures, scenario.expected);
  });
}

test('invoice matches checkout HSN GST and capped coupon totals', () => {
  const items = [line('Groundnut Oil', '1508', 1120, 2, 5)];
  const checkoutFigures = pricing.computeTotals(items, 'SAVE10');
  const invoiceFigures = invoice.computeInvoiceFigures({ items, coupon: 'SAVE10' });

  assert.equal(invoiceFigures.subtotal, checkoutFigures.subtotal);
  assert.equal(invoiceFigures.discount, checkoutFigures.discount);
  assert.equal(invoiceFigures.tax, checkoutFigures.tax);
  assert.equal(invoiceFigures.cgst, checkoutFigures.cgst);
  assert.equal(invoiceFigures.sgst, checkoutFigures.sgst);
  assert.equal(invoiceFigures.total, checkoutFigures.total);
  assert.equal(invoiceFigures.rows[0].gstPercent, checkoutFigures.lines[0].gstPercent);
  assert.equal(invoiceFigures.rows[0].lineTax, checkoutFigures.lines[0].tax);
});
