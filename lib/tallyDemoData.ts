/**
 * Frontend-only demo data for the Tally Live Data page (`pages/TallyDataPage.tsx`).
 *
 * Shaped exactly like the real TallyConnect responses (see Tally_API.md) so the
 * page's columns/formatters work unmodified. Used only when VITE_TALLY_API_KEY
 * is not set — lets the FE be demoed/screenshotted without a live gateway.
 */

import type {
  TallyItem,
  TallyStockRow,
  TallyUnit,
  TallyLedger,
  TallyVoucher,
  TallyCompany,
  TallySystem,
} from './tallyApi';

const h = (n: number) => new Date(Date.now() - n * 3_600_000).toISOString();
const d = (n: number) => new Date(Date.now() - n * 86_400_000).toISOString();
const dateOnly = (n: number) => new Date(Date.now() - n * 86_400_000).toISOString().slice(0, 10);

export const DEMO_TALLY_COMPANIES: TallyCompany[] = [
  {
    id: 'c0ffee00-1111-4a2b-9c3d-000000000001',
    name: 'Demo Traders Pvt Ltd',
    address: '12 MG Road, Pune, Maharashtra',
    phone: '020-1234567',
    email: 'accounts@demotraders.example',
    created_at: d(220),
    updated_at: d(1),
  },
];

export const DEMO_TALLY_SYSTEM: TallySystem = {
  version: '0.2.0-demo',
  tally: {
    host: 'demo.local',
    port: 9000,
    scheme: 'http',
    url: 'http://demo.local:9000',
    connected: true,
    company: 'Demo Traders Pvt Ltd',
    available_companies: ['Demo Traders Pvt Ltd'],
  },
};

export const DEMO_TALLY_UNITS: TallyUnit[] = [
  { id: 'u1111111-0000-4000-8000-000000000001', name: 'nos', tally_guid: 'guid-unit-nos', symbol: 'nos', formal_name: 'Numbers', type: 'SIMPLE', first_unit: null, conversion: null, second_unit: null, decimal_places: 0, is_deleted: false, created_at: d(220), updated_at: d(220) },
  { id: 'u1111111-0000-4000-8000-000000000002', name: 'kg', tally_guid: 'guid-unit-kg', symbol: 'kg', formal_name: 'Kilograms', type: 'SIMPLE', first_unit: null, conversion: null, second_unit: null, decimal_places: 2, is_deleted: false, created_at: d(220), updated_at: d(220) },
  { id: 'u1111111-0000-4000-8000-000000000003', name: 'mtr', tally_guid: 'guid-unit-mtr', symbol: 'mtr', formal_name: 'Meters', type: 'SIMPLE', first_unit: null, conversion: null, second_unit: null, decimal_places: 2, is_deleted: false, created_at: d(220), updated_at: d(220) },
  { id: 'u1111111-0000-4000-8000-000000000004', name: 'box of 10', tally_guid: 'guid-unit-box10', symbol: 'box', formal_name: 'Box', type: 'COMPOUND', first_unit: 'box', conversion: '10', second_unit: 'nos', decimal_places: 0, is_deleted: false, created_at: d(200), updated_at: d(200) },
];

export const DEMO_TALLY_ITEMS: TallyItem[] = [
  { id: 'i1111111-0000-4000-8000-000000000001', name: '6203 ZZ Bearing', parent_name: 'Bearings', base_units: 'nos', opening_balance: '120.00', closing_balance: '84.00', std_selling_price: '45.00', std_cost_price: '31.50', created_at: d(200), updated_at: h(3) },
  { id: 'i1111111-0000-4000-8000-000000000002', name: '6004 ZZ Bearing', parent_name: 'Bearings', base_units: 'nos', opening_balance: '80.00', closing_balance: '52.00', std_selling_price: '38.00', std_cost_price: '26.00', created_at: d(200), updated_at: h(9) },
  { id: 'i1111111-0000-4000-8000-000000000003', name: 'Copper Wire 2.5mm', parent_name: 'Raw Material', base_units: 'mtr', opening_balance: '500.00', closing_balance: '310.00', std_selling_price: '65.00', std_cost_price: '48.00', created_at: d(190), updated_at: d(1) },
  { id: 'i1111111-0000-4000-8000-000000000004', name: 'Steel Sheet 3mm', parent_name: 'Raw Material', base_units: 'kg', opening_balance: '200.00', closing_balance: '140.00', std_selling_price: '92.00', std_cost_price: '70.00', created_at: d(190), updated_at: d(2) },
  { id: 'i1111111-0000-4000-8000-000000000005', name: 'PLC Control Module XYZ', parent_name: 'Spares', base_units: 'nos', opening_balance: '15.00', closing_balance: '9.00', std_selling_price: '8500.00', std_cost_price: '6200.00', created_at: d(150), updated_at: d(5) },
  { id: 'i1111111-0000-4000-8000-000000000006', name: 'Safety Gloves (Pack of 10)', parent_name: 'Consumables', base_units: 'box of 10', opening_balance: '60.00', closing_balance: '22.00', std_selling_price: '450.00', std_cost_price: '300.00', created_at: d(150), updated_at: d(1) },
  { id: 'i1111111-0000-4000-8000-000000000007', name: 'Digital Multimeter', parent_name: 'Tools', base_units: 'nos', opening_balance: '10.00', closing_balance: '7.00', std_selling_price: '2200.00', std_cost_price: '1600.00', created_at: d(120), updated_at: d(12) },
  { id: 'i1111111-0000-4000-8000-000000000008', name: 'Aluminium Rod 10mm', parent_name: 'Raw Material', base_units: 'kg', opening_balance: '340.00', closing_balance: '210.00', std_selling_price: '310.00', std_cost_price: '240.00', created_at: d(120), updated_at: h(20) },
  { id: 'i1111111-0000-4000-8000-000000000009', name: 'Relay Switch 24V', parent_name: 'Spares', base_units: 'nos', opening_balance: '90.00', closing_balance: '41.00', std_selling_price: '145.00', std_cost_price: '98.00', created_at: d(100), updated_at: d(3) },
  { id: 'i1111111-0000-4000-8000-000000000010', name: 'Cleaning Solvent 5L', parent_name: 'Consumables', base_units: 'nos', opening_balance: '30.00', closing_balance: '0.00', std_selling_price: '750.00', std_cost_price: '520.00', created_at: d(100), updated_at: d(10) },
];

export const DEMO_TALLY_STOCK: TallyStockRow[] = DEMO_TALLY_ITEMS.map((it, i) => ({
  id: `s1111111-0000-4000-8000-0000000000${String(i + 1).padStart(2, '0')}`,
  item_name: it.name,
  godown_name: null,
  quantity: it.closing_balance,
  unit: it.base_units,
  rate: it.std_cost_price,
  amount:
    it.closing_balance && it.std_cost_price
      ? (Number(it.closing_balance) * Number(it.std_cost_price)).toFixed(2)
      : null,
  created_at: it.created_at,
  updated_at: it.updated_at,
}));

export const DEMO_TALLY_LEDGERS: TallyLedger[] = [
  { id: 'l1111111-0000-4000-8000-000000000001', name: 'Acme Traders', parent_name: 'Sundry Debtors', opening_balance: '0.00', closing_balance: '15230.00', address: '42 Industrial Estate, Pune', pincode: '411019', phone: '020-24001234', mobile: '9822012345', email: 'accounts@acme.example', gstin: '27ABCDE1234F1Z5', pan: 'ABCDE1234F', ledger_type: 'customer', created_at: d(200), updated_at: d(1) },
  { id: 'l1111111-0000-4000-8000-000000000002', name: 'SteelCorp Industries', parent_name: 'Sundry Creditors', opening_balance: '0.00', closing_balance: '-48500.00', address: '9 GIDC Estate, Vapi', pincode: '396195', phone: '0260-2451234', mobile: '9909012345', email: 'sales@steelcorp.example', gstin: '24ABCDE5678F1Z2', pan: 'ABCDE5678F', ledger_type: 'supplier', created_at: d(200), updated_at: d(4) },
  { id: 'l1111111-0000-4000-8000-000000000003', name: 'Bright Bearings Co.', parent_name: 'Sundry Creditors', opening_balance: '0.00', closing_balance: '-12300.00', address: '3 Bhosari MIDC, Pune', pincode: '411026', phone: '020-27122345', mobile: '9822098765', email: 'orders@brightbearings.example', gstin: '27PQRSX9012F1Z8', pan: 'PQRSX9012F', ledger_type: 'supplier', created_at: d(180), updated_at: d(6) },
  { id: 'l1111111-0000-4000-8000-000000000004', name: 'Praxis Electricals', parent_name: 'Sundry Debtors', opening_balance: '0.00', closing_balance: '8720.00', address: '77 Shivaji Nagar, Pune', pincode: '411005', phone: null, mobile: '9765043210', email: 'praxis.elec@example.com', gstin: '27LMNOP3456F1Z1', pan: 'LMNOP3456F', ledger_type: 'customer', created_at: d(150), updated_at: d(2) },
  { id: 'l1111111-0000-4000-8000-000000000005', name: 'Suresh Enterprises', parent_name: 'Sundry Debtors', opening_balance: '0.00', closing_balance: '3100.00', address: '5 Camp Area, Pune', pincode: '411001', phone: '020-26123456', mobile: null, email: null, gstin: null, pan: null, ledger_type: 'customer', created_at: d(90), updated_at: d(8) },
  { id: 'l1111111-0000-4000-8000-000000000006', name: 'Bank Charges', parent_name: 'Indirect Expenses', opening_balance: null, closing_balance: '1450.00', address: null, pincode: null, phone: null, mobile: null, email: null, gstin: null, pan: null, ledger_type: 'general', created_at: d(200), updated_at: d(15) },
];

export const DEMO_TALLY_VOUCHERS: TallyVoucher[] = [
  {
    id: 'v1111111-0000-4000-8000-000000000001',
    voucher_type: 'Sales',
    voucher_number: 'S/0042',
    date: dateOnly(1),
    narration: 'Counter sale',
    party_name: 'Acme Traders',
    reference: 'PO-9911',
    gross_total: '531.00',
    ledger_entries: [{ ledger: 'Acme Traders', amount: '531.00' }],
    alter_id: 20514,
    is_deleted: false,
    synced_at: h(3),
    items: [
      { line_no: 1, item_name: '6203 ZZ Bearing', qty: '10.00', qty_unit: 'nos', rate: '45.00', rate_unit: 'nos', amount: '450.00', godown: 'Main Location', batch: null },
      { line_no: 2, item_name: 'Relay Switch 24V', qty: '1.00', qty_unit: 'nos', rate: '81.00', rate_unit: 'nos', amount: '81.00', godown: 'Main Location', batch: null },
    ],
    created_at: d(1),
    updated_at: h(3),
  },
  {
    id: 'v1111111-0000-4000-8000-000000000002',
    voucher_type: 'Purchase',
    voucher_number: 'P/0117',
    date: dateOnly(4),
    narration: 'Raw material restock',
    party_name: 'SteelCorp Industries',
    reference: 'GRN-2026-117',
    gross_total: '18200.00',
    ledger_entries: [{ ledger: 'SteelCorp Industries', amount: '18200.00' }],
    alter_id: 20390,
    is_deleted: false,
    synced_at: d(4),
    items: [
      { line_no: 1, item_name: 'Steel Sheet 3mm', qty: '100.00', qty_unit: 'kg', rate: '70.00', rate_unit: 'kg', amount: '7000.00', godown: 'Godown 1', batch: 'B-2026-0904' },
      { line_no: 2, item_name: 'Copper Wire 2.5mm', qty: '150.00', qty_unit: 'mtr', rate: '48.00', rate_unit: 'mtr', amount: '7200.00', godown: 'Godown 1', batch: 'B-2026-0904' },
      { line_no: 3, item_name: 'Aluminium Rod 10mm', qty: '16.00', qty_unit: 'kg', rate: '250.00', rate_unit: 'kg', amount: '4000.00', godown: 'Godown 1', batch: 'B-2026-0904' },
    ],
    created_at: d(4),
    updated_at: d(4),
  },
  {
    id: 'v1111111-0000-4000-8000-000000000003',
    voucher_type: 'Sales',
    voucher_number: 'S/0041',
    date: dateOnly(2),
    narration: null,
    party_name: 'Praxis Electricals',
    reference: null,
    gross_total: '8500.00',
    ledger_entries: [{ ledger: 'Praxis Electricals', amount: '8500.00' }],
    alter_id: 20488,
    is_deleted: false,
    synced_at: d(2),
    items: [{ line_no: 1, item_name: 'PLC Control Module XYZ', qty: '1.00', qty_unit: 'nos', rate: '8500.00', rate_unit: 'nos', amount: '8500.00', godown: 'Main Location', batch: null }],
    created_at: d(2),
    updated_at: d(2),
  },
  {
    id: 'v1111111-0000-4000-8000-000000000004',
    voucher_type: 'Stock Journal',
    voucher_number: 'SJ/0009',
    date: dateOnly(6),
    narration: 'Internal transfer to service bay',
    party_name: null,
    reference: null,
    gross_total: null,
    ledger_entries: null,
    alter_id: 19980,
    is_deleted: false,
    synced_at: d(6),
    items: [
      { line_no: 1, item_name: 'Digital Multimeter', qty: '-2.00', qty_unit: 'nos', rate: '1600.00', rate_unit: 'nos', amount: '-3200.00', godown: 'Main Location', batch: null },
      { line_no: 2, item_name: 'Digital Multimeter', qty: '2.00', qty_unit: 'nos', rate: '1600.00', rate_unit: 'nos', amount: '3200.00', godown: 'Service Bay', batch: null },
    ],
    created_at: d(6),
    updated_at: d(6),
  },
  {
    id: 'v1111111-0000-4000-8000-000000000005',
    voucher_type: 'Purchase',
    voucher_number: 'P/0116',
    date: dateOnly(9),
    narration: 'Bearing top-up order',
    party_name: 'Bright Bearings Co.',
    reference: 'PO-9887',
    gross_total: '3120.00',
    ledger_entries: [{ ledger: 'Bright Bearings Co.', amount: '3120.00' }],
    alter_id: 19790,
    is_deleted: false,
    synced_at: d(9),
    items: [
      { line_no: 1, item_name: '6203 ZZ Bearing', qty: '40.00', qty_unit: 'nos', rate: '31.50', rate_unit: 'nos', amount: '1260.00', godown: 'Godown 1', batch: null },
      { line_no: 2, item_name: '6004 ZZ Bearing', qty: '30.00', qty_unit: 'nos', rate: '26.00', rate_unit: 'nos', amount: '780.00', godown: 'Godown 1', batch: null },
      { line_no: 3, item_name: 'Relay Switch 24V', qty: '11.00', qty_unit: 'nos', rate: '98.00', rate_unit: 'nos', amount: '1078.00', godown: 'Godown 1', batch: null },
    ],
    created_at: d(9),
    updated_at: d(9),
  },
  {
    id: 'v1111111-0000-4000-8000-000000000006',
    voucher_type: 'Delivery Note',
    voucher_number: 'DN/0075',
    date: dateOnly(1),
    narration: 'Dispatched with S/0042',
    party_name: 'Acme Traders',
    reference: 'S/0042',
    gross_total: null,
    ledger_entries: null,
    alter_id: 20515,
    is_deleted: false,
    synced_at: h(3),
    items: [{ line_no: 1, item_name: '6203 ZZ Bearing', qty: '10.00', qty_unit: 'nos', rate: null, rate_unit: null, amount: null, godown: 'Main Location', batch: null }],
    created_at: d(1),
    updated_at: h(3),
  },
];

/** For the connection strip when running on demo data — not a real "last_sync" timestamp. */
export const DEMO_LAST_SYNC = h(1);
