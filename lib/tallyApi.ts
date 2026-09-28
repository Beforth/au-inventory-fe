/**
 * TallyConnect API client.
 *
 * TallyConnect is a read-only gateway to Tally. Every endpoint here is a GET.
 * See Tally_API.md for the full reference. Auth is via an `X-API-Key` header; a
 * `read_only` key is sufficient for the inventory module.
 *
 * Config comes from Vite env vars (see .env.example):
 *   VITE_TALLY_API_URL  – base URL, e.g. http://localhost:8000 (blank = same origin / dev proxy)
 *   VITE_TALLY_API_KEY  – tc_live_...
 */

const RAW_BASE = (import.meta.env.VITE_TALLY_API_URL ?? '').trim().replace(/\/+$/, '');
const API_KEY = (import.meta.env.VITE_TALLY_API_KEY ?? '').trim();
const PREFIX = '/api/v1';

const DEMO_MODE = (import.meta.env.VITE_TALLY_DEMO ?? '').trim().toLowerCase() === 'true';

/** True when a live API key is present AND VITE_TALLY_DEMO is not "true". */
export const isTallyConfigured = (): boolean => !DEMO_MODE && API_KEY.length > 0;

/** Human-readable base URL for display ("same origin" when relative). */
export const tallyBaseLabel = (): string => RAW_BASE || `${window.location.origin} (proxy / same origin)`;

// ---------------------------------------------------------------------------
// Types (mirror the API response schema — decimals arrive as JSON strings)
// ---------------------------------------------------------------------------

export interface TallyPagination {
  page: number;
  page_size: number;
  total: number;
  total_pages: number;
}

export interface TallyResult<T> {
  data: T;
  last_sync: string | null;
  pagination?: TallyPagination;
}

export interface TallyItem {
  id: string;
  name: string;
  parent_name: string | null;
  base_units: string | null;
  opening_balance: string | null;
  closing_balance: string | null;
  std_selling_price: string | null;
  std_cost_price: string | null;
  created_at: string;
  updated_at: string;
}

export interface TallyStockRow {
  id: string;
  item_name: string;
  godown_name: string | null;
  quantity: string | null;
  unit: string | null;
  rate: string | null;
  amount: string | null;
  created_at: string;
  updated_at: string;
}

export interface TallyUnit {
  id: string;
  name: string;
  tally_guid: string;
  symbol: string | null;
  formal_name: string | null;
  type: 'SIMPLE' | 'COMPOUND' | string | null;
  first_unit: string | null;
  conversion: string | null;
  second_unit: string | null;
  decimal_places: number | null;
  is_deleted: boolean;
  created_at: string;
  updated_at: string;
}

export interface TallyLedger {
  id: string;
  name: string;
  parent_name: string | null;
  opening_balance: string | null;
  closing_balance: string | null;
  address: string | null;
  pincode: string | null;
  phone: string | null;
  mobile: string | null;
  email: string | null;
  gstin: string | null;
  pan: string | null;
  ledger_type: string;
  created_at: string;
  updated_at: string;
}

export interface TallyVoucherLine {
  line_no: number;
  item_name: string | null;
  qty: string | null;
  qty_unit: string | null;
  rate: string | null;
  rate_unit: string | null;
  amount: string | null;
  godown: string | null;
  batch: string | null;
}

export interface TallyVoucher {
  id: string;
  voucher_type: string;
  voucher_number: string | null;
  date: string;
  narration: string | null;
  party_name: string | null;
  reference: string | null;
  gross_total: string | null;
  ledger_entries: unknown;
  alter_id: number | null;
  is_deleted: boolean;
  synced_at: string | null;
  items: TallyVoucherLine[];
  created_at: string;
  updated_at: string;
}

export interface TallyCompany {
  id: string;
  name: string;
  address: string | null;
  phone: string | null;
  email: string | null;
  created_at: string;
  updated_at: string;
}

export interface TallySystem {
  version: string;
  tally: {
    host: string;
    port: number;
    scheme: string;
    url: string;
    connected: boolean;
    company: string | null;
    available_companies: string[];
  };
}

// ---------------------------------------------------------------------------
// Error type
// ---------------------------------------------------------------------------

export class TallyApiError extends Error {
  /** HTTP status, or 0 for network / config failures. */
  readonly status: number;
  /** Application error code from the envelope (e.g. SYNC_LOCKED, RATE_LIMIT_EXCEEDED). */
  readonly code?: string;

  constructor(message: string, status: number, code?: string) {
    super(message);
    this.name = 'TallyApiError';
    this.status = status;
    this.code = code;
  }
}

// ---------------------------------------------------------------------------
// Request core
// ---------------------------------------------------------------------------

function buildUrl(path: string, params?: unknown): string {
  const base = RAW_BASE || window.location.origin;
  const url = new URL(`${base}${PREFIX}${path}`);
  if (params && typeof params === 'object') {
    for (const [key, value] of Object.entries(params as Record<string, unknown>)) {
      if (value === undefined || value === null || value === '') continue;
      url.searchParams.set(key, String(value));
    }
  }
  return url.toString();
}

async function parseJson(res: Response): Promise<any> {
  try {
    return await res.json();
  } catch {
    return null;
  }
}

/** Unwraps the standard `{ success, data, last_sync, pagination }` envelope. */
async function request<T>(path: string, params?: unknown): Promise<TallyResult<T>> {
  if (!isTallyConfigured()) {
    throw new TallyApiError(
      'TallyConnect API key not set. Add VITE_TALLY_API_KEY (and VITE_TALLY_API_URL) to .env.local and restart the dev server.',
      0,
      'NOT_CONFIGURED',
    );
  }

  let res: Response;
  try {
    res = await fetch(buildUrl(path, params), {
      headers: { 'X-API-Key': API_KEY, Accept: 'application/json' },
    });
  } catch {
    throw new TallyApiError(
      `Could not reach TallyConnect at ${tallyBaseLabel()}. Check the URL is running and CORS allows this origin.`,
      0,
      'NETWORK',
    );
  }

  const body = await parseJson(res);

  if (!res.ok) {
    const code: string | undefined = body?.error?.code;
    const msg: string =
      body?.error?.message ||
      body?.detail ||
      (res.status === 429
        ? 'Rate limit exceeded (100 req/min). Slow down or raise page_size.'
        : `Request failed with ${res.status}`);
    throw new TallyApiError(msg, res.status, code);
  }

  if (body && body.success === false) {
    throw new TallyApiError(body.error?.message ?? 'Request failed', res.status, body.error?.code);
  }

  return {
    data: body?.data as T,
    last_sync: body?.last_sync ?? null,
    pagination: body?.pagination,
  };
}

// ---------------------------------------------------------------------------
// Endpoint helpers
// ---------------------------------------------------------------------------

export interface ListParams {
  page?: number;
  page_size?: number;
  search?: string;
}

export const getItems = (p?: ListParams) => request<TallyItem[]>('/items', p);
export const getItem = (id: string) => request<TallyItem>(`/items/${id}`);

export const getStock = (p?: ListParams) => request<TallyStockRow[]>('/stock', p);

export const getLedgers = (p?: ListParams & { ledger_type?: string }) =>
  request<TallyLedger[]>('/ledgers', p);
export const getLedger = (id: string) => request<TallyLedger>(`/ledgers/${id}`);

export const getUnits = (p?: ListParams & { type?: 'SIMPLE' | 'COMPOUND' }) =>
  request<TallyUnit[]>('/units', p);
export const getUnit = (id: string) => request<TallyUnit>(`/units/${id}`);

export const getVouchers = (p?: { page?: number; page_size?: number; voucher_type?: string }) =>
  request<TallyVoucher[]>('/vouchers', p);
export const getVoucher = (id: string) => request<TallyVoucher>(`/vouchers/${id}`);

export const getCompanies = () => request<TallyCompany[]>('/companies');

export interface TallyIdentity {
  role: string;
  name: string;
  auth_type: string;
}
/** `/api/v1/auth/identity` returns a bare object (no envelope), like `/system`. */
export async function getIdentity(): Promise<TallyIdentity> {
  if (!isTallyConfigured()) throw new TallyApiError('API key not set', 0, 'NOT_CONFIGURED');
  const base = RAW_BASE || window.location.origin;
  const res = await fetch(`${base}${PREFIX}/auth/identity`, {
    headers: { 'X-API-Key': API_KEY, Accept: 'application/json' },
  });
  if (!res.ok) throw new TallyApiError(`identity check failed (${res.status})`, res.status);
  return (await res.json()) as TallyIdentity;
}

/** `/api/v1/system` is unauthenticated and returns a bare object (no envelope). */
export async function getSystem(): Promise<TallySystem> {
  const base = RAW_BASE || window.location.origin;
  let res: Response;
  try {
    res = await fetch(`${base}${PREFIX}/system`, { headers: { Accept: 'application/json' } });
  } catch {
    throw new TallyApiError(`Could not reach TallyConnect at ${tallyBaseLabel()}.`, 0, 'NETWORK');
  }
  if (!res.ok) throw new TallyApiError(`System check failed (${res.status})`, res.status);
  return (await res.json()) as TallySystem;
}

// ---------------------------------------------------------------------------
// Display helpers
// ---------------------------------------------------------------------------

/** Format a decimal string (or null) for display. Keeps 2 dp, groups thousands (en-IN). */
export function fmtDecimal(value: string | null | undefined, dp = 2): string {
  if (value === null || value === undefined || value === '') return '—';
  const n = Number(value);
  if (!Number.isFinite(n)) return value;
  return n.toLocaleString('en-IN', { minimumFractionDigits: dp, maximumFractionDigits: dp });
}

/** Format a decimal string as ₹ currency. */
export function fmtMoney(value: string | null | undefined): string {
  if (value === null || value === undefined || value === '') return '—';
  const n = Number(value);
  if (!Number.isFinite(n)) return value;
  return `₹${n.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

/** Short local datetime, e.g. "31 Aug 2026, 14:45". Accepts ISO strings. */
export function fmtDateTime(value: string | null | undefined): string {
  if (!value) return '—';
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return value;
  return d.toLocaleString('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

/** Date-only (voucher `date` is YYYY-MM-DD). */
export function fmtDate(value: string | null | undefined): string {
  if (!value) return '—';
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return value;
  return d.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });
}

/** "5m ago" style relative time. */
export function fmtRelative(value: string | null | undefined): string {
  if (!value) return 'never';
  const then = new Date(value).getTime();
  if (Number.isNaN(then)) return value;
  const diffSec = Math.round((Date.now() - then) / 1000);
  if (diffSec < 60) return `${diffSec}s ago`;
  if (diffSec < 3600) return `${Math.floor(diffSec / 60)}m ago`;
  if (diffSec < 86400) return `${Math.floor(diffSec / 3600)}h ago`;
  return `${Math.floor(diffSec / 86400)}d ago`;
}

/** Common Tally voucher types for filtering the voucher list. */
export const VOUCHER_TYPES = [
  'Sales',
  'Purchase',
  'Stock Journal',
  'Delivery Note',
  'Receipt Note',
  'Sales Order',
  'Purchase Order',
  'Material In',
  'Material Out',
  'Physical Stock',
  'Rejections In',
  'Rejections Out',
] as const;
