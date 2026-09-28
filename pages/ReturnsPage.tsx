import React, { useState } from 'react';
import { Card } from '../components/ui/Card';
import { Badge } from '../components/ui/Badge';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Modal } from '../components/ui/Modal';
import { Select } from '../components/ui/Select';
import { PageLayout } from '../components/layout/PageLayout';
import { DataTable, Column } from '../components/ui/DataTable';
import { useApp } from '../App';
import {
  Search,
  Plus,
  RotateCcw,
  Trash2,
  Package,
  AlertTriangle,
  Eye,
  Download,
  Clock,
  ArrowRight
} from 'lucide-react';

interface ReturnEntry {
  id: string;
  returnNumber: string;
  type: string;
  sourceRef: string;
  vendor: string;
  itemsCount: number;
  totalValue: number;
  reason: string;
  status: string;
  date: string;
  handledBy: string;
  items: { name: string; qty: number; reason: string }[];
}

interface ScrapEntry {
  id: string;
  scrapNumber: string;
  jobRef: string;
  itemsCount: number;
  totalValue: number;
  reason: string;
  approvedBy: string;
  date: string;
  items: { name: string; qty: number; value: number }[];
}

interface NonMovingItem {
  id: string;
  itemName: string;
  itemCode: string;
  currentQty: number;
  lastIssued: string;
  daysIdle: number;
  value: number;
  rackLocation: string;
}

const INITIAL_RETURNS: ReturnEntry[] = [
  {
    id: '1', returnNumber: 'RET-001', type: 'Vendor Return', sourceRef: 'GRN-2024-004', vendor: 'SteelCorp Industries',
    itemsCount: 1, totalValue: 28000, reason: 'Damaged on delivery', status: 'Initiated', date: 'Jul 26, 2024', handledBy: 'Ramesh',
    items: [{ name: 'Steel Sheet 3mm (bundle)', qty: 2, reason: 'Bent corners — unusable' }],
  },
  {
    id: '2', returnNumber: 'RET-002', type: 'Job Return', sourceRef: 'JO-044', vendor: '',
    itemsCount: 3, totalValue: 12300, reason: 'Job cancelled — unused material', status: 'Completed', date: 'Jul 22, 2024', handledBy: 'Suresh',
    items: [
      { name: 'PLC-XYZ Control Module', qty: 2, reason: 'Job cancelled before assembly' },
      { name: 'Copper Wire 2.5mm (kg)', qty: 5, reason: 'Unused — returned to stock' },
      { name: 'Cable Tie Pack', qty: 1, reason: 'Unopened box returned' },
    ],
  },
  {
    id: '3', returnNumber: 'RET-003', type: 'Job Return', sourceRef: 'JO-043', vendor: '',
    itemsCount: 2, totalValue: 5600, reason: 'Wrong item issued', status: 'Approved', date: 'Jul 18, 2024', handledBy: 'Ramesh',
    items: [
      { name: 'Relay Switch 12V', qty: 10, reason: 'Wrong voltage spec issued' },
      { name: 'Terminal Block', qty: 50, reason: 'Wrong size issued' },
    ],
  },
];

const INITIAL_SCRAP: ScrapEntry[] = [
  { id: '1', scrapNumber: 'SCR-001', jobRef: 'JO-045', itemsCount: 2, totalValue: 3200, reason: 'Assembly waste — offcuts', approvedBy: 'Mr. Sharma', date: 'Jul 24, 2024', items: [{ name: 'Copper Wire Offcuts', qty: 2, value: 840 }, { name: 'Steel Sheet Offcuts', qty: 1, value: 2360 }] },
  { id: '2', scrapNumber: 'SCR-002', jobRef: 'JO-044', itemsCount: 1, totalValue: 1100, reason: 'Defective relay — testing failure', approvedBy: 'Ms. Gupta', date: 'Jul 20, 2024', items: [{ name: 'Defective Relay Switch', qty: 3, value: 1100 }] },
];

const NON_MOVING: NonMovingItem[] = [
  { id: '1', itemName: 'Digital Multimeter', itemCode: 'TL-001', currentQty: 8, lastIssued: 'Jun 15, 2024', daysIdle: 62, value: 120000, rackLocation: 'G3-R01' },
  { id: '2', itemName: 'Safety Goggles', itemCode: 'CS-003', currentQty: 20, lastIssued: 'Jun 01, 2024', daysIdle: 76, value: 9000, rackLocation: 'G1-R05' },
];

export const ReturnsPage: React.FC = () => {
  const { showToast, globalSearch, setGlobalSearch } = useApp();
  const [activeView, setActiveView] = useState<'returns' | 'scrap' | 'nonmoving'>('returns');
  const [isCreateReturnOpen, setIsCreateReturnOpen] = useState(false);
  const [isCreateScrapOpen, setIsCreateScrapOpen] = useState(false);
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [selectedReturn, setSelectedReturn] = useState<ReturnEntry | null>(null);
  const [returnType, setReturnType] = useState<string>('vendor');
  const [returnSource, setReturnSource] = useState<string | undefined>(undefined);
  const [returnItem, setReturnItem] = useState<string | undefined>(undefined);
  const [scrapJob, setScrapJob] = useState<string | undefined>(undefined);
  const [scrapItem, setScrapItem] = useState<string | undefined>(undefined);

  const returnColumns: Column<ReturnEntry>[] = [
    {
      key: 'returnNumber',
      label: 'Return #',
      render: (r) => (
        <div className="flex items-center gap-2">
          <RotateCcw size={14} className="text-slate-400" />
          <span className="text-xs font-bold text-blue-600">{r.returnNumber}</span>
        </div>
      )
    },
    {
      key: 'type',
      label: 'Type',
      render: (r) => (
        <Badge variant={r.type === 'Vendor Return' ? 'warning' : 'default'} className="py-0 h-5 flex items-center justify-center w-fit">
          {r.type}
        </Badge>
      )
    },
    {
      key: 'sourceRef',
      label: 'Source Ref',
      cellClassName: 'text-xs font-semibold text-slate-600 font-mono'
    },
    {
      key: 'vendor',
      label: 'Vendor',
      render: (r) => (
        <span className={`text-xs font-semibold ${r.vendor ? 'text-slate-700' : 'text-slate-300'}`}>
          {r.vendor || '—'}
        </span>
      )
    },
    {
      key: 'date',
      label: 'Date',
      cellClassName: 'text-xs font-semibold text-slate-400'
    },
    {
      key: 'itemsCount',
      label: 'Items',
      align: 'center',
      cellClassName: 'text-xs font-bold text-slate-600 tabular-nums'
    },
    {
      key: 'totalValue',
      label: 'Value',
      align: 'right',
      render: (r) => (
        <span className="text-xs font-bold text-slate-900 tabular-nums">₹{r.totalValue.toLocaleString('en-IN')}</span>
      )
    },
    {
      key: 'reason',
      label: 'Reason',
      cellClassName: 'text-xs font-medium text-slate-500 max-w-[200px] truncate'
    },
    {
      key: 'status',
      label: 'Status',
      align: 'center',
      render: (r) => (
        <Badge
          variant={r.status === 'Completed' ? 'success' : r.status === 'Approved' ? 'default' : 'warning'}
          className="py-0 h-5 flex items-center justify-center w-fit mx-auto"
        >
          {r.status}
        </Badge>
      )
    },
    {
      key: 'actions',
      label: '',
      sortable: false,
      align: 'right',
      render: (r) => (
        <button
          onClick={(e) => { e.stopPropagation(); setSelectedReturn(r); setIsDetailOpen(true); }}
          className="p-1.5 hover:bg-slate-100 rounded-lg transition-colors text-slate-300 hover:text-slate-600 opacity-0 group-hover:opacity-100"
        >
          <Eye size={14} />
        </button>
      )
    }
  ];

  const scrapColumns: Column<ScrapEntry>[] = [
    {
      key: 'scrapNumber',
      label: 'Scrap #',
      render: (s) => (
        <div className="flex items-center gap-2">
          <Trash2 size={14} className="text-slate-400" />
          <span className="text-xs font-bold text-blue-600">{s.scrapNumber}</span>
        </div>
      )
    },
    {
      key: 'jobRef',
      label: 'Job Ref',
      cellClassName: 'text-xs font-semibold text-slate-600 font-mono'
    },
    {
      key: 'date',
      label: 'Date',
      cellClassName: 'text-xs font-semibold text-slate-400'
    },
    {
      key: 'itemsCount',
      label: 'Items',
      align: 'center',
      cellClassName: 'text-xs font-bold text-slate-600 tabular-nums'
    },
    {
      key: 'totalValue',
      label: 'Value Loss',
      align: 'right',
      render: (s) => (
        <span className="text-xs font-bold text-rose-500 tabular-nums">₹{s.totalValue.toLocaleString('en-IN')}</span>
      )
    },
    {
      key: 'reason',
      label: 'Reason',
      cellClassName: 'text-xs font-medium text-slate-500 max-w-[250px] truncate'
    },
    {
      key: 'approvedBy',
      label: 'Approved By',
      cellClassName: 'text-xs font-medium text-slate-500'
    }
  ];

  return (
    <PageLayout
      title="Returns & Scrap"
      description="Track materials returned from jobs or sent back to vendors, log scrap disposal, and monitor non-moving stock."
    >
      <div className="flex gap-2 mb-4">
        <button
          onClick={() => setActiveView('returns')}
          className={`px-4 py-2.5 text-xs font-bold rounded-xl transition-all ${
            activeView === 'returns'
              ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/20'
              : 'bg-white text-slate-500 border border-slate-200 hover:border-slate-300'
          }`}
        >
          <RotateCcw size={14} className="inline mr-2" />
          Returns ({INITIAL_RETURNS.length})
        </button>
        <button
          onClick={() => setActiveView('scrap')}
          className={`px-4 py-2.5 text-xs font-bold rounded-xl transition-all ${
            activeView === 'scrap'
              ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/20'
              : 'bg-white text-slate-500 border border-slate-200 hover:border-slate-300'
          }`}
        >
          <Trash2 size={14} className="inline mr-2" />
          Scrap ({INITIAL_SCRAP.length})
        </button>
        <button
          onClick={() => setActiveView('nonmoving')}
          className={`px-4 py-2.5 text-xs font-bold rounded-xl transition-all ${
            activeView === 'nonmoving'
              ? 'bg-amber-600 text-white shadow-lg shadow-amber-600/20'
              : 'bg-white text-slate-500 border border-slate-200 hover:border-slate-300'
          }`}
        >
          <Clock size={14} className="inline mr-2" />
          Non-Moving Stock ({NON_MOVING.length})
        </button>
      </div>

      {activeView === 'returns' && (
        <Card noPadding className="overflow-hidden">
          <div className="p-4 border-b border-slate-100 flex flex-wrap gap-4 items-center justify-between bg-white">
            <Input
              variant="white"
              inputSize="sm"
              className="max-w-md rounded-full shadow-sm"
              placeholder="Search returns..."
              value={globalSearch}
              onChange={(e) => setGlobalSearch(e.target.value)}
              icon={<Search size={14} className="text-slate-400" strokeWidth={2.5} />}
            />
            <Button size="sm" onClick={() => setIsCreateReturnOpen(true)} leftIcon={<Plus size={14} strokeWidth={3} />}>
              New Return
            </Button>
          </div>
          <DataTable data={INITIAL_RETURNS} columns={returnColumns} rowKey={(r) => r.id} onRowClick={(r) => { setSelectedReturn(r); setIsDetailOpen(true); }} />
        </Card>
      )}

      {activeView === 'scrap' && (
        <Card noPadding className="overflow-hidden">
          <div className="p-4 border-b border-slate-100 flex flex-wrap gap-4 items-center justify-between bg-white">
            <Input
              variant="white"
              inputSize="sm"
              className="max-w-md rounded-full shadow-sm"
              placeholder="Search scrap records..."
              value={globalSearch}
              onChange={(e) => setGlobalSearch(e.target.value)}
              icon={<Search size={14} className="text-slate-400" strokeWidth={2.5} />}
            />
            <Button size="sm" onClick={() => setIsCreateScrapOpen(true)} leftIcon={<Plus size={14} strokeWidth={3} />}>
              Log Scrap
            </Button>
          </div>
          <DataTable data={INITIAL_SCRAP} columns={scrapColumns} rowKey={(s) => s.id} />
        </Card>
      )}

      {activeView === 'nonmoving' && (
        <Card noPadding className="overflow-hidden">
          <div className="px-5 py-3 border-b border-slate-100 bg-white flex items-center justify-between">
            <div>
              <h3 className="text-xs font-bold text-slate-900">Non-Moving Stock Items</h3>
              <p className="text-[10px] text-slate-400 mt-0.5">Items idle for 30+ days — consider returning to vendor or reassigning to active jobs</p>
            </div>
          </div>
          <div className="p-4 space-y-3">
            {NON_MOVING.map(item => (
              <div key={item.id} className="flex items-center gap-3 bg-white border border-slate-100 rounded-xl p-4">
                <div className="w-8 h-8 bg-amber-50 rounded-lg flex items-center justify-center flex-shrink-0">
                  <Clock size={14} className="text-amber-500" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-slate-800">{item.itemName}</span>
                    <Badge variant="warning" className="py-0 h-4 text-[9px]">{item.daysIdle} days idle</Badge>
                    <span className="text-[10px] font-mono text-slate-400">{item.itemCode}</span>
                  </div>
                  <p className="text-[10px] text-slate-400 mt-0.5">
                    Qty: {item.currentQty} | Value: ₹{item.value.toLocaleString('en-IN')} | Last issued: {item.lastIssued} | Location: {item.rackLocation}
                  </p>
                </div>
                <div className="flex gap-2">
                  <Button variant="outline" size="xs" onClick={() => showToast(`Returning ${item.itemName} to vendor...`, 'info')}>
                    Return to Vendor
                  </Button>
                  <Button variant="ghost" size="xs" onClick={() => showToast(`Reassigning ${item.itemName}...`, 'info')}>
                    Reassign
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </Card>
      )}

      {/* Return Detail Modal */}
      <Modal
        isOpen={isDetailOpen}
        onClose={() => { setIsDetailOpen(false); setSelectedReturn(null); }}
        title={selectedReturn ? `${selectedReturn.returnNumber} — Detail` : 'Return Detail'}
        contentClassName="max-w-2xl"
        footer={
          <>
            <Button variant="ghost" size="sm" onClick={() => { setIsDetailOpen(false); setSelectedReturn(null); }}>Close</Button>
            <Button variant="outline" size="sm" onClick={() => showToast('Downloading return report...', 'info')} leftIcon={<Download size={14} />}>
              Export
            </Button>
          </>
        }
      >
        {selectedReturn && (
          <div className="space-y-4">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              <div className="bg-slate-50 rounded-xl p-3 text-center">
                <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1">Status</p>
                <Badge variant={selectedReturn.status === 'Completed' ? 'success' : selectedReturn.status === 'Approved' ? 'default' : 'warning'}>
                  {selectedReturn.status}
                </Badge>
              </div>
              <div className="bg-slate-50 rounded-xl p-3 text-center">
                <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1">Type</p>
                <p className="text-xs font-bold text-slate-900">{selectedReturn.type}</p>
              </div>
              <div className="bg-slate-50 rounded-xl p-3 text-center">
                <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1">Source</p>
                <p className="text-xs font-bold text-slate-900 font-mono">{selectedReturn.sourceRef}</p>
              </div>
              <div className="bg-slate-50 rounded-xl p-3 text-center">
                <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1">Value</p>
                <p className="text-xs font-bold text-slate-900 tabular-nums">₹{selectedReturn.totalValue.toLocaleString('en-IN')}</p>
              </div>
            </div>

            <div className="bg-slate-50 border border-slate-100 rounded-xl p-3 text-xs text-slate-700 font-medium">
              <span className="text-slate-400">Reason:</span> {selectedReturn.reason}
            </div>

            <div>
              <p className="text-xs font-bold text-slate-900 mb-2">Returned Items ({selectedReturn.items.length})</p>
              <div className="space-y-2">
                {selectedReturn.items.map((item, idx) => (
                  <div key={idx} className="flex items-center gap-3 bg-white border border-slate-100 rounded-lg px-3 py-2">
                    <Package size={14} className="text-slate-400 flex-shrink-0" />
                    <div className="flex-1">
                      <span className="text-xs font-bold text-slate-800">{item.name}</span>
                      <p className="text-[10px] text-slate-400">{item.reason}</p>
                    </div>
                    <span className="text-xs font-bold text-slate-600 tabular-nums">×{item.qty}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3 text-xs">
              <div><span className="text-slate-400">Handled by:</span> <span className="font-bold text-slate-800 ml-1">{selectedReturn.handledBy}</span></div>
              <div><span className="text-slate-400">Date:</span> <span className="font-bold text-slate-800 ml-1">{selectedReturn.date}</span></div>
            </div>
          </div>
        )}
      </Modal>

      {/* Create Return Modal */}
      <Modal
        isOpen={isCreateReturnOpen}
        onClose={() => { setIsCreateReturnOpen(false); setReturnType('vendor'); setReturnSource(undefined); setReturnItem(undefined); }}
        title="New Material Return"
        footer={
          <>
            <Button variant="ghost" size="sm" onClick={() => { setIsCreateReturnOpen(false); setReturnType('vendor'); setReturnSource(undefined); setReturnItem(undefined); }}>Cancel</Button>
            <Button size="sm" onClick={() => { showToast('Return initiated successfully', 'success'); setIsCreateReturnOpen(false); setReturnType('vendor'); setReturnSource(undefined); setReturnItem(undefined); }}>Submit Return</Button>
          </>
        }
      >
        <div className="space-y-4">
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => { setReturnType('vendor'); setReturnSource(undefined); }}
              className={`flex-1 px-4 py-3 rounded-xl border text-xs font-bold transition-all ${
                returnType === 'vendor' ? 'bg-blue-50 border-blue-300 text-blue-700' : 'bg-white border-slate-200 text-slate-500'
              }`}
            >
              Return to Vendor
            </button>
            <button
              type="button"
              onClick={() => { setReturnType('job'); setReturnSource(undefined); }}
              className={`flex-1 px-4 py-3 rounded-xl border text-xs font-bold transition-all ${
                returnType === 'job' ? 'bg-blue-50 border-blue-300 text-blue-700' : 'bg-white border-slate-200 text-slate-500'
              }`}
            >
              Return from Job
            </button>
          </div>

          {returnType === 'vendor' ? (
            <Select
              label="GRN Reference"
              options={[
                { value: 'GRN-2024-004', label: 'GRN-2024-004 — SteelCorp Industries' },
                { value: 'GRN-2024-003', label: 'GRN-2024-003 — ElectroParts Pvt Ltd' },
              ]}
              value={returnSource}
              onChange={(val) => setReturnSource(val as string)}
              placeholder="Select GRN"
            />
          ) : (
            <Select
              label="Job Order"
              options={[
                { value: 'JO-045', label: 'JO-045 — Control Panel Assembly' },
                { value: 'JO-046', label: 'JO-046 — Wiring Harness Set' },
                { value: 'JO-043', label: 'JO-043 — Motor Drive Assembly' },
              ]}
              value={returnSource}
              onChange={(val) => setReturnSource(val as string)}
              placeholder="Select job order"
            />
          )}

          <Select
            label="Item to Return"
            options={[
              { value: 'cw-2.5', label: 'Copper Wire 2.5mm (kg)' },
              { value: 'relay', label: 'Relay Switch 24V' },
              { value: 'plc', label: 'PLC-XYZ Control Module' },
              { value: 'ss-3', label: 'Steel Sheet 3mm (bundle)' },
            ]}
            value={returnItem}
            onChange={(val) => setReturnItem(val as string)}
            placeholder="Select item"
          />
          <Input label="Quantity" type="number" placeholder="e.g. 10" />
          <Input label="Reason" required placeholder="e.g. Damaged during delivery / Job cancelled" />
        </div>
      </Modal>

      {/* Create Scrap Modal */}
      <Modal
        isOpen={isCreateScrapOpen}
        onClose={() => { setIsCreateScrapOpen(false); setScrapJob(undefined); setScrapItem(undefined); }}
        title="Log Scrap Material"
        footer={
          <>
            <Button variant="ghost" size="sm" onClick={() => { setIsCreateScrapOpen(false); setScrapJob(undefined); setScrapItem(undefined); }}>Cancel</Button>
            <Button size="sm" onClick={() => { showToast('Scrap logged successfully', 'success'); setIsCreateScrapOpen(false); setScrapJob(undefined); setScrapItem(undefined); }}>Log Scrap</Button>
          </>
        }
      >
        <div className="space-y-4">
          <Select
            label="Job Order"
            options={[
              { value: 'JO-045', label: 'JO-045 — Control Panel Assembly' },
              { value: 'JO-046', label: 'JO-046 — Wiring Harness Set' },
              { value: 'JO-044', label: 'JO-044 — Sensor Calibration Kit' },
            ]}
            value={scrapJob}
            onChange={(val) => setScrapJob(val as string)}
            placeholder="Select the job that produced this scrap"
          />
          <Select
            label="Item"
            options={[
              { value: 'cw-offcut', label: 'Copper Wire Offcuts' },
              { value: 'steel-offcut', label: 'Steel Sheet Offcuts' },
              { value: 'def-relay', label: 'Defective Relay Switch' },
            ]}
            value={scrapItem}
            onChange={(val) => setScrapItem(val as string)}
            placeholder="Select scrap item"
          />
          <Input label="Quantity" type="number" placeholder="e.g. 5" />
          <Input label="Estimated Scrap Value (₹)" type="number" placeholder="e.g. 3200" />
          <Input label="Reason" required placeholder="e.g. Assembly waste from cutting" />
          <div className="bg-amber-50 border border-amber-100 rounded-xl p-3 text-xs text-amber-700 font-medium">
            Scrap value will be deducted from the job cost and logged for accounting.
          </div>
        </div>
      </Modal>
    </PageLayout>
  );
};

export default ReturnsPage;
