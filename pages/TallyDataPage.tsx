import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
  RefreshCw,
  Search,
  Package,
  Boxes,
  Ruler,
  ScrollText,
  Contact,
  Building2,
  AlertTriangle,
  CheckCircle2,
  XCircle,
  HelpCircle,
  Sparkles,
} from 'lucide-react';
import { PageLayout } from '../components/layout/PageLayout';
import { DataTable, Column } from '../components/ui/DataTable';
import { SearchInput } from '../components/ui/SearchInput';
import { Select } from '../components/ui/Select';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';
import { Pagination } from '../components/ui/Pagination';
import { Modal } from '../components/ui/Modal';
import {
  getItems,
  getStock,
  getUnits,
  getLedgers,
  getVouchers,
  getCompanies,
  getSystem,
  isTallyConfigured,
  tallyBaseLabel,
  fmtDecimal,
  fmtMoney,
  fmtDate,
  fmtDateTime,
  fmtRelative,
  VOUCHER_TYPES,
  TallyApiError,
  type TallyPagination,
  type TallySystem,
  type TallyVoucher,
} from '../lib/tallyApi';
import {
  DEMO_TALLY_COMPANIES,
  DEMO_TALLY_SYSTEM,
  DEMO_TALLY_UNITS,
  DEMO_TALLY_ITEMS,
  DEMO_TALLY_STOCK,
  DEMO_TALLY_LEDGERS,
  DEMO_TALLY_VOUCHERS,
  DEMO_LAST_SYNC,
} from '../lib/tallyDemoData';

type TabId = 'items' | 'stock' | 'units' | 'ledgers' | 'vouchers' | 'companies';

const TABS: { id: TabId; label: string; icon: React.ElementType; searchable: boolean }[] = [
  { id: 'items', label: 'Items', icon: Package, searchable: true },
  { id: 'stock', label: 'Stock', icon: Boxes, searchable: true },
  { id: 'units', label: 'Units', icon: Ruler, searchable: true },
  { id: 'ledgers', label: 'Ledgers', icon: Contact, searchable: true },
  { id: 'vouchers', label: 'Vouchers', icon: ScrollText, searchable: false },
  { id: 'companies', label: 'Companies', icon: Building2, searchable: false },
];

const PAGE_SIZE_OPTIONS = [25, 50, 100, 250, 500, 1000];

export default function TallyDataPage() {
  const configured = isTallyConfigured();

  // --- connection / system status ---------------------------------------
  const [system, setSystem] = useState<TallySystem | null>(null);
  const [systemError, setSystemError] = useState<string | null>(null);

  // --- table state ------------------------------------------------------
  const [tab, setTab] = useState<TabId>('items');
  const [searchInput, setSearchInput] = useState('');
  const [query, setQuery] = useState('');
  const [voucherType, setVoucherType] = useState<string | undefined>(undefined);
  const [seenVoucherTypes, setSeenVoucherTypes] = useState<string[]>([]);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(100);

  const [rows, setRows] = useState<any[]>([]);
  const [pagination, setPagination] = useState<TallyPagination | null>(null);
  const [lastSync, setLastSync] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<{ message: string; code?: string } | null>(null);

  const [sortConfig, setSortConfig] = useState<{ key: string; direction: 'asc' | 'desc' } | undefined>();
  const [selectedVoucher, setSelectedVoucher] = useState<TallyVoucher | null>(null);

  const activeTab = TABS.find((t) => t.id === tab)!;

  // --- debounce the search box ----------------------------------------
  useEffect(() => {
    const handle = setTimeout(() => setQuery(searchInput.trim()), 350);
    return () => clearTimeout(handle);
  }, [searchInput]);

  // --- reset paging when the query shape changes ----------------------
  useEffect(() => {
    setPage(1);
  }, [tab, query, voucherType, pageSize]);

  // --- load system status --------------------------------------------
  const loadSystem = useCallback(() => {
    if (!configured) {
      setSystem(DEMO_TALLY_SYSTEM);
      setSystemError(null);
      return;
    }
    getSystem()
      .then((s) => {
        setSystem(s);
        setSystemError(null);
      })
      .catch((e: unknown) => {
        setSystem(null);
        setSystemError(e instanceof Error ? e.message : 'System status unavailable');
      });
  }, [configured]);

  useEffect(() => {
    loadSystem();
  }, [loadSystem]);

  // --- load table data ----------------------------------------------
  const load = useCallback(() => {
    if (!configured) {
      setError(null);

      const demoMap: Record<TabId, any[]> = {
        items: DEMO_TALLY_ITEMS,
        stock: DEMO_TALLY_STOCK,
        units: DEMO_TALLY_UNITS,
        ledgers: DEMO_TALLY_LEDGERS,
        vouchers: DEMO_TALLY_VOUCHERS,
        companies: DEMO_TALLY_COMPANIES,
      };

      let data = demoMap[tab] ?? [];

      if (query) {
        const q = query.toLowerCase();
        data = data.filter((r: any) =>
          Object.values(r).some((v) => v != null && String(v).toLowerCase().includes(q)),
        );
      }

      if (tab === 'vouchers' && voucherType) {
        data = data.filter((r: any) => r.voucher_type === voucherType);
      }

      const total = data.length;
      const start = (page - 1) * pageSize;
      const paged = data.slice(start, start + pageSize);

      setRows(paged);
      setPagination({
        page,
        page_size: pageSize,
        total,
        total_pages: Math.max(1, Math.ceil(total / pageSize)),
      });
      setLastSync(DEMO_LAST_SYNC);

      if (tab === 'vouchers') {
        setSeenVoucherTypes((prev) => {
          const next = new Set(prev);
          for (const v of demoMap.vouchers) if (v?.voucher_type) next.add(v.voucher_type as string);
          return next.size === prev.length ? prev : [...next].sort();
        });
      }

      return;
    }

    setLoading(true);
    setError(null);

    const req = (() => {
      switch (tab) {
        case 'items':
          return getItems({ page, page_size: pageSize, search: query || undefined });
        case 'stock':
          return getStock({ page, page_size: pageSize, search: query || undefined });
        case 'units':
          return getUnits({ page, page_size: pageSize, search: query || undefined });
        case 'ledgers':
          return getLedgers({ page, page_size: pageSize, search: query || undefined });
        case 'vouchers':
          return getVouchers({ page, page_size: pageSize, voucher_type: voucherType });
        case 'companies':
          return getCompanies();
        default:
          return getItems({ page, page_size: pageSize });
      }
    })();

    let cancelled = false;
    req
      .then((res) => {
        if (cancelled) return;
        const data: any[] = Array.isArray(res.data) ? res.data : [];
        setRows(data);
        setPagination(res.pagination ?? null);
        setLastSync(res.last_sync);
        if (tab === 'vouchers') {
          setSeenVoucherTypes((prev) => {
            const next = new Set(prev);
            for (const v of data) if (v?.voucher_type) next.add(v.voucher_type as string);
            return next.size === prev.length ? prev : [...next].sort();
          });
        }
      })
      .catch((e: unknown) => {
        if (cancelled) return;
        setRows([]);
        setPagination(null);
        if (e instanceof TallyApiError) setError({ message: e.message, code: e.code });
        else setError({ message: e instanceof Error ? e.message : 'Request failed' });
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [configured, tab, page, pageSize, query, voucherType]);

  useEffect(() => {
    const cleanup = load();
    return cleanup;
  }, [load]);

  const refresh = () => {
    loadSystem();
    load();
  };

  // --- client-side sort of the current page --------------------------
  const sortedRows = useMemo(() => {
    if (!sortConfig) return rows;
    const { key, direction } = sortConfig;
    const dir = direction === 'asc' ? 1 : -1;
    return [...rows].sort((a, b) => {
      const av = a[key];
      const bv = b[key];
      if (av === bv) return 0;
      if (av === null || av === undefined) return 1;
      if (bv === null || bv === undefined) return -1;
      const an = Number(av);
      const bn = Number(bv);
      if (Number.isFinite(an) && Number.isFinite(bn)) return (an - bn) * dir;
      return String(av).localeCompare(String(bv)) * dir;
    });
  }, [rows, sortConfig]);

  const columns = useMemo<Column<any>[]>(() => COLUMNS_BY_TAB[tab], [tab]);

  const totalLabel = pagination
    ? `${pagination.total.toLocaleString('en-IN')} record${pagination.total === 1 ? '' : 's'}`
    : `${rows.length} record${rows.length === 1 ? '' : 's'}`;

  // --- render ------------------------------------------------------
  const conn = connectionState(configured, system, systemError);

  return (
    <PageLayout
      title="Tally Live Data"
      description="Read-only view of items, stock, units, ledgers and vouchers straight from the TallyConnect gateway."
      actions={
        <Button variant="outline" size="sm" onClick={refresh} leftIcon={<RefreshCw size={14} />}>
          Refresh
        </Button>
      }
    >
      {/* connection strip */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-4">
        <InfoTile
          label="Connection"
          value={conn.label}
          tone={conn.tone}
          icon={conn.icon}
          hint={systemError ?? tallyBaseLabel()}
        />
        <InfoTile
          label="Active company"
          value={system?.tally.company || '—'}
          hint={
            system?.tally.available_companies?.length
              ? `${system.tally.available_companies.length} available`
              : undefined
          }
        />
        <InfoTile
          label="Gateway version"
          value={system ? `v${system.version}` : '—'}
          hint={system?.tally.url}
        />
        <InfoTile
          label="Last sync"
          value={lastSync ? fmtRelative(lastSync) : '—'}
          hint={lastSync ? fmtDateTime(lastSync) : 'not reported by this endpoint'}
        />
      </div>

      {/* tabs */}
      <div className="flex items-center gap-1 border-b border-slate-200 mb-4 overflow-x-auto">
        {TABS.map((t) => {
          const isActive = t.id === tab;
          return (
            <button
              key={t.id}
              type="button"
              onClick={() => {
                setTab(t.id);
                setSortConfig(undefined);
                setSearchInput('');
                setQuery('');
              }}
              className={`inline-flex items-center gap-2 px-3.5 py-2.5 text-[13px] font-semibold border-b-2 -mb-px transition-colors whitespace-nowrap ${
                isActive
                  ? 'border-blue-600 text-blue-700'
                  : 'border-transparent text-slate-500 hover:text-slate-800 hover:border-slate-200'
              }`}
            >
              <t.icon size={15} strokeWidth={isActive ? 2.4 : 1.9} />
              {t.label}
            </button>
          );
        })}
      </div>

      {/* controls */}
      <div className="flex flex-wrap items-center gap-3 mb-3">
        {activeTab.searchable ? (
          <div className="w-full sm:w-80">
            <SearchInput
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              onClear={() => setSearchInput('')}
              placeholder={`Search ${activeTab.label.toLowerCase()} by name…`}
              inputSize="sm"
              rightElement={<Search size={13} />}
            />
          </div>
        ) : tab === 'vouchers' ? (
          <div className="w-64">
            <Select
              options={[
                { value: '', label: 'All voucher types' },
                ...Array.from(new Set([...seenVoucherTypes, ...VOUCHER_TYPES])).map((v) => ({
                  value: v,
                  label: seenVoucherTypes.includes(v) ? v : `${v} (standard)`,
                })),
              ]}
              value={voucherType ?? ''}
              onChange={(v) => setVoucherType(v ? String(v) : undefined)}
              inputSize="sm"
              clearable={false}
              placeholder="Voucher type"
            />
          </div>
        ) : (
          <p className="text-xs text-slate-400 font-medium">
            This endpoint has no filters — showing all records.
          </p>
        )}

        <span className="text-xs font-semibold text-slate-400 ml-auto">
          {loading ? 'Loading…' : totalLabel}
        </span>
      </div>

      {/* demo mode banner */}
      {!configured && (
        <div className="rounded-xl border p-4 mb-3 flex items-start gap-3 bg-violet-50 border-violet-200">
          <Sparkles size={16} className="text-violet-600 mt-0.5" />
          <div className="min-w-0">
            <p className="text-[13px] font-semibold text-violet-800">
              Demo Mode — showing sample data
            </p>
            <p className="text-[11px] text-violet-600 mt-0.5">
              Connect to a live TallyConnect gateway by adding your API key to{' '}
              <code className="bg-violet-100 px-1 rounded">.env.local</code> and restarting the dev server.
            </p>
          </div>
        </div>
      )}

      {/* error banner */}
      {error && (
        <div className="rounded-xl border p-4 mb-3 flex items-start gap-3 bg-rose-50 border-rose-200">
          <AlertTriangle size={16} className="text-rose-600 mt-0.5" />
          <div className="min-w-0">
            <p className="text-[13px] font-semibold text-rose-800">
              {error.code ? `${error.code}: ` : ''}
              {error.message}
            </p>
          </div>
        </div>
      )}

      {/* table */}
      <DataTable
        data={sortedRows}
        columns={columns}
        rowKey={(r: any) => r.id ?? `${r.item_name}-${r.line_no ?? ''}`}
        isLoading={loading}
        bordered
        dense
        sortConfig={sortConfig}
        onSort={(key, direction) => setSortConfig({ key, direction })}
        onRowClick={tab === 'vouchers' ? (r) => setSelectedVoucher(r as TallyVoucher) : undefined}
      />

      {/* pagination */}
      {pagination && (
        <div className="mt-3">
          <Pagination
            page={pagination.page}
            pageSize={pagination.page_size}
            total={pagination.total}
            totalPages={pagination.total_pages}
            onPageChange={setPage}
            onPageSizeChange={setPageSize}
            pageSizeOptions={PAGE_SIZE_OPTIONS}
          />
        </div>
      )}

      <VoucherModal voucher={selectedVoucher} onClose={() => setSelectedVoucher(null)} />
    </PageLayout>
  );
}

// ===========================================================================
// Connection state helper
// ===========================================================================

function connectionState(
  configured: boolean,
  system: TallySystem | null,
  systemError: string | null,
): { label: string; tone: Tone; icon: React.ElementType } {
  if (!configured) return { label: 'Demo mode', tone: 'violet', icon: Sparkles };
  if (systemError) return { label: 'Gateway unreachable', tone: 'rose', icon: XCircle };
  if (!system) return { label: 'Checking…', tone: 'slate', icon: HelpCircle };
  if (system.tally.connected) return { label: 'Connected to Tally', tone: 'emerald', icon: CheckCircle2 };
  return { label: 'Gateway up, Tally offline', tone: 'amber', icon: AlertTriangle };
}

// ===========================================================================
// Small presentational bits
// ===========================================================================

type Tone = 'emerald' | 'amber' | 'rose' | 'slate' | 'violet';

const TONE_STYLES: Record<Tone, string> = {
  emerald: 'text-emerald-700 bg-emerald-50 border-emerald-100',
  amber: 'text-amber-700 bg-amber-50 border-amber-100',
  rose: 'text-rose-700 bg-rose-50 border-rose-100',
  slate: 'text-slate-600 bg-slate-50 border-slate-200',
  violet: 'text-violet-700 bg-violet-50 border-violet-100',
};

function InfoTile({
  label,
  value,
  hint,
  tone = 'slate',
  icon: Icon,
}: {
  label: string;
  value: string;
  hint?: string;
  tone?: Tone;
  icon?: React.ElementType;
}) {
  return (
    <div className="bg-white border border-slate-200/60 rounded-xl px-4 py-3 shadow-xs">
      <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1">{label}</p>
      <div className="flex items-center gap-1.5">
        {Icon && (
          <span className={`inline-flex items-center justify-center w-4 h-4 rounded-full border ${TONE_STYLES[tone]}`}>
            <Icon size={10} strokeWidth={2.6} />
          </span>
        )}
        <span className="text-sm font-bold text-slate-900 truncate">{value}</span>
      </div>
      {hint && <p className="text-[10px] text-slate-400 font-medium mt-0.5 truncate">{hint}</p>}
    </div>
  );
}

// ===========================================================================
// Column definitions per tab
// ===========================================================================

const money = (v: string | null) => (
  <span className="tabular-nums font-semibold text-slate-800">{fmtMoney(v)}</span>
);
const qty = (v: string | null) => <span className="tabular-nums font-semibold text-slate-800">{fmtDecimal(v)}</span>;
const muted = (v: React.ReactNode) => <span className="text-slate-500">{v ?? '—'}</span>;

const COLUMNS_BY_TAB: Record<TabId, Column<any>[]> = {
  items: [
    {
      key: 'name',
      label: 'Item',
      render: (r) => (
        <div className="flex items-center gap-2 min-w-0">
          <Package size={13} className="text-slate-400 shrink-0" />
          <span className="font-semibold text-slate-800 truncate">{r.name}</span>
        </div>
      ),
    },
    { key: 'parent_name', label: 'Group', render: (r) => muted(r.parent_name) },
    { key: 'base_units', label: 'Unit', align: 'center', render: (r) => muted(r.base_units) },
    { key: 'opening_balance', label: 'Opening', align: 'right', render: (r) => qty(r.opening_balance) },
    { key: 'closing_balance', label: 'Closing', align: 'right', render: (r) => qty(r.closing_balance) },
    { key: 'std_selling_price', label: 'Sell price', align: 'right', render: (r) => money(r.std_selling_price) },
    { key: 'std_cost_price', label: 'Cost price', align: 'right', render: (r) => money(r.std_cost_price) },
    { key: 'updated_at', label: 'Updated', align: 'right', render: (r) => muted(fmtRelative(r.updated_at)) },
  ],
  stock: [
    {
      key: 'item_name',
      label: 'Item',
      render: (r) => (
        <div className="flex items-center gap-2 min-w-0">
          <Boxes size={13} className="text-slate-400 shrink-0" />
          <span className="font-semibold text-slate-800 truncate">{r.item_name}</span>
        </div>
      ),
    },
    { key: 'godown_name', label: 'Godown', render: (r) => muted(r.godown_name ?? 'company-wide') },
    { key: 'quantity', label: 'Qty on hand', align: 'right', render: (r) => qty(r.quantity) },
    { key: 'unit', label: 'Unit', align: 'center', render: (r) => muted(r.unit) },
    { key: 'rate', label: 'Rate', align: 'right', render: (r) => money(r.rate) },
    { key: 'amount', label: 'Value', align: 'right', render: (r) => money(r.amount) },
    { key: 'updated_at', label: 'Updated', align: 'right', render: (r) => muted(fmtRelative(r.updated_at)) },
  ],
  units: [
    { key: 'name', label: 'Name', render: (r) => <span className="font-semibold text-slate-800">{r.name}</span> },
    { key: 'symbol', label: 'Symbol', align: 'center', render: (r) => muted(r.symbol) },
    { key: 'formal_name', label: 'Formal name', render: (r) => muted(r.formal_name) },
    {
      key: 'type',
      label: 'Type',
      align: 'center',
      render: (r) =>
        r.type ? (
          <Badge variant={r.type === 'COMPOUND' ? 'warning' : 'outline'} className="h-5 py-0">
            {r.type}
          </Badge>
        ) : (
          muted(null)
        ),
    },
    {
      key: 'conversion',
      label: 'Conversion',
      align: 'center',
      render: (r) =>
        r.type === 'COMPOUND'
          ? muted(`1 ${r.first_unit ?? ''} = ${r.conversion ?? '?'} ${r.second_unit ?? ''}`)
          : muted(null),
    },
    { key: 'decimal_places', label: 'Decimals', align: 'center', render: (r) => muted(r.decimal_places ?? 0) },
    {
      key: 'is_deleted',
      label: 'State',
      align: 'center',
      render: (r) =>
        r.is_deleted ? (
          <Badge variant="error" className="h-5 py-0">
            deleted
          </Badge>
        ) : (
          <Badge variant="success" className="h-5 py-0">
            active
          </Badge>
        ),
    },
  ],
  ledgers: [
    {
      key: 'name',
      label: 'Ledger',
      render: (r) => (
        <div className="flex items-center gap-2 min-w-0">
          <Contact size={13} className="text-slate-400 shrink-0" />
          <span className="font-semibold text-slate-800 truncate">{r.name}</span>
        </div>
      ),
    },
    { key: 'ledger_type', label: 'Group', render: (r) => <Badge variant="outline" className="h-5 py-0">{r.ledger_type}</Badge> },
    { key: 'gstin', label: 'GSTIN', render: (r) => <span className="font-mono text-xs text-slate-600">{r.gstin ?? '—'}</span> },
    { key: 'phone', label: 'Contact', render: (r) => muted(r.mobile || r.phone) },
    { key: 'email', label: 'Email', render: (r) => muted(r.email) },
    { key: 'closing_balance', label: 'Closing bal.', align: 'right', render: (r) => money(r.closing_balance) },
    { key: 'updated_at', label: 'Updated', align: 'right', render: (r) => muted(fmtRelative(r.updated_at)) },
  ],
  vouchers: [
    { key: 'date', label: 'Date', render: (r) => <span className="tabular-nums text-slate-700">{fmtDate(r.date)}</span> },
    { key: 'voucher_type', label: 'Type', render: (r) => <Badge variant="outline" className="h-5 py-0">{r.voucher_type}</Badge> },
    { key: 'voucher_number', label: 'Number', render: (r) => <span className="font-mono text-xs text-slate-600">{r.voucher_number ?? '—'}</span> },
    { key: 'party_name', label: 'Party', render: (r) => <span className="font-semibold text-slate-800 truncate">{r.party_name ?? '—'}</span> },
    { key: 'items', label: 'Lines', align: 'center', render: (r) => muted(Array.isArray(r.items) ? r.items.length : 0) },
    { key: 'gross_total', label: 'Gross total', align: 'right', render: (r) => money(r.gross_total) },
    {
      key: 'is_deleted',
      label: '',
      align: 'center',
      sortable: false,
      render: (r) => (r.is_deleted ? <Badge variant="error" className="h-5 py-0">deleted</Badge> : null),
    },
  ],
  companies: [
    { key: 'name', label: 'Company', render: (r) => <span className="font-semibold text-slate-800">{r.name}</span> },
    { key: 'address', label: 'Address', render: (r) => muted(r.address) },
    { key: 'phone', label: 'Phone', render: (r) => muted(r.phone) },
    { key: 'email', label: 'Email', render: (r) => muted(r.email) },
    { key: 'updated_at', label: 'Updated', align: 'right', render: (r) => muted(fmtRelative(r.updated_at)) },
  ],
};

// ===========================================================================
// Voucher detail modal
// ===========================================================================

function VoucherModal({ voucher, onClose }: { voucher: TallyVoucher | null; onClose: () => void }) {
  if (!voucher) return null;
  return (
    <Modal
      isOpen={!!voucher}
      onClose={onClose}
      title={`${voucher.voucher_type} ${voucher.voucher_number ?? ''}`.trim()}
      contentClassName="max-w-3xl"
    >
      <div className="space-y-5">
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
          <Field label="Date" value={fmtDate(voucher.date)} />
          <Field label="Party" value={voucher.party_name ?? '—'} />
          <Field label="Reference" value={voucher.reference ?? '—'} />
          <Field label="Gross total" value={fmtMoney(voucher.gross_total)} />
          <Field label="Alter ID" value={voucher.alter_id != null ? String(voucher.alter_id) : '—'} />
          <Field label="Synced" value={fmtDateTime(voucher.synced_at)} />
        </div>

        {voucher.narration && (
          <div>
            <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1">Narration</p>
            <p className="text-[13px] text-slate-700">{voucher.narration}</p>
          </div>
        )}

        <div>
          <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-2">
            Inventory lines ({voucher.items?.length ?? 0})
          </p>
          <div className="border border-slate-200 rounded-xl overflow-hidden">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-500 uppercase text-[10px] tracking-wider">
                <tr>
                  <th className="px-3 py-2 font-bold">#</th>
                  <th className="px-3 py-2 font-bold">Item</th>
                  <th className="px-3 py-2 font-bold text-right">Qty</th>
                  <th className="px-3 py-2 font-bold text-right">Rate</th>
                  <th className="px-3 py-2 font-bold text-right">Amount</th>
                  <th className="px-3 py-2 font-bold">Godown</th>
                  <th className="px-3 py-2 font-bold">Batch</th>
                </tr>
              </thead>
              <tbody>
                {(voucher.items ?? []).map((ln) => (
                  <tr key={ln.line_no} className="border-t border-slate-100">
                    <td className="px-3 py-2 text-slate-400">{ln.line_no}</td>
                    <td className="px-3 py-2 font-semibold text-slate-800">{ln.item_name ?? '—'}</td>
                    <td className="px-3 py-2 text-right tabular-nums">
                      {fmtDecimal(ln.qty)} {ln.qty_unit ?? ''}
                    </td>
                    <td className="px-3 py-2 text-right tabular-nums">{fmtMoney(ln.rate)}</td>
                    <td className="px-3 py-2 text-right tabular-nums font-semibold">{fmtMoney(ln.amount)}</td>
                    <td className="px-3 py-2 text-slate-500">{ln.godown ?? '—'}</td>
                    <td className="px-3 py-2 text-slate-500">{ln.batch ?? '—'}</td>
                  </tr>
                ))}
                {(!voucher.items || voucher.items.length === 0) && (
                  <tr>
                    <td colSpan={7} className="px-3 py-6 text-center text-slate-400">
                      No inventory lines on this voucher
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </Modal>
  );
}

function Field({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-0.5">{label}</p>
      <p className="text-[13px] font-semibold text-slate-800 truncate">{value}</p>
    </div>
  );
}
