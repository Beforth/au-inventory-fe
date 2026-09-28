import React, { useState } from 'react';
import { Card } from '../components/ui/Card';
import { StatCard } from '../components/ui/StatCard';
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
  Briefcase,
  AlertTriangle,
  User,
  Laptop,
  Wrench,
  Eye,
  AlertOctagon,
  ArrowRightLeft,
  RotateCcw,
  Edit,
  Download,
  Package
} from 'lucide-react';

interface Asset {
  id: string;
  assetCode: string;
  name: string;
  category: string;
  subCategory: string;
  serialNumber: string;
  purchaseDate: string;
  purchaseValue: number;
  currentValue: number;
  assignedTo: string;
  department: string;
  issueDate: string;
  expectedReturn: string;
  location: string;
  status: string;
  warranty: string;
  remarks: string;
}

interface MissingReport {
  id: string;
  reportNumber: string;
  employee: string;
  department: string;
  item: string;
  reportedDate: string;
  status: string;
  replacementCost: number;
  lastKnownLocation: string;
  remarks: string;
}

const INITIAL_ASSETS: Asset[] = [
  { id: '1', assetCode: 'FA-001', name: 'Dell Latitude Laptop', category: 'Electronics', subCategory: 'Laptop', serialNumber: 'DL-2024-001', purchaseDate: 'Jan 15, 2024', purchaseValue: 85000, currentValue: 72000, assignedTo: 'Amit Kumar', department: 'Production', issueDate: 'Jan 20, 2024', expectedReturn: 'Jan 20, 2026', location: 'Office — Production Floor', status: 'Issued', warranty: 'Jan 15, 2027', remarks: 'Primary work laptop' },
  { id: '2', assetCode: 'FA-002', name: 'Digital Multimeter — Fluke 87V', category: 'Tools', subCategory: 'Measurement', serialNumber: 'FL-2024-087', purchaseDate: 'Mar 10, 2024', purchaseValue: 32000, currentValue: 28000, assignedTo: 'Rajesh Verma', department: 'Quality', issueDate: 'Mar 15, 2024', expectedReturn: 'Mar 15, 2025', location: 'QC Lab', status: 'Issued', warranty: 'Mar 10, 2027', remarks: 'Calibrated quarterly' },
  { id: '3', assetCode: 'FA-003', name: 'Safety Harness Kit', category: 'Safety', subCategory: 'Fall Protection', serialNumber: 'SH-2024-012', purchaseDate: 'Feb 20, 2024', purchaseValue: 8500, currentValue: 7200, assignedTo: 'Suresh Yadav', department: 'Maintenance', issueDate: 'Feb 25, 2024', expectedReturn: 'Feb 25, 2025', location: 'Maintenance Bay', status: 'Issued', warranty: 'Feb 20, 2026', remarks: 'Annual inspection due Feb 2025' },
  { id: '4', assetCode: 'FA-004', name: 'Cordless Drill Set', category: 'Tools', subCategory: 'Power Tools', serialNumber: 'CD-2024-005', purchaseDate: 'Apr 01, 2024', purchaseValue: 12000, currentValue: 10800, assignedTo: '', department: '', issueDate: '', expectedReturn: '', location: 'Tool Store — Godown 1', status: 'Available', warranty: 'Apr 01, 2027', remarks: '' },
  { id: '5', assetCode: 'FA-005', name: 'Wire Crimping Tool', category: 'Tools', subCategory: 'Hand Tools', serialNumber: 'WC-2024-003', purchaseDate: 'Apr 05, 2024', purchaseValue: 3500, currentValue: 3100, assignedTo: 'Neha Gupta', department: 'Production', issueDate: 'Apr 10, 2024', expectedReturn: 'Apr 10, 2025', location: 'Production Floor — Station 3', status: 'Issued', warranty: 'Apr 05, 2026', remarks: '' },
  { id: '6', assetCode: 'FA-006', name: 'iPad Air (for QC)', category: 'Electronics', subCategory: 'Tablet', serialNumber: 'IP-2024-002', purchaseDate: 'May 01, 2024', purchaseValue: 55000, currentValue: 48000, assignedTo: '', department: '', issueDate: '', expectedReturn: '', location: 'Under Maintenance — Screen Replacement', status: 'Under Maintenance', warranty: 'May 01, 2026', remarks: 'Screen cracked — replacement under warranty' },
  { id: '7', assetCode: 'FA-007', name: 'Oscilloscope — Tektronix', category: 'Tools', subCategory: 'Measurement', serialNumber: 'TK-2024-011', purchaseDate: 'May 12, 2024', purchaseValue: 180000, currentValue: 162000, assignedTo: 'Vikram Singh', department: 'R&D', issueDate: 'May 15, 2024', expectedReturn: 'May 15, 2025', location: 'R&D Lab', status: 'Issued', warranty: 'May 12, 2027', remarks: 'High-value instrument — annual calibration required' },
];

const INITIAL_MISSING: MissingReport[] = [
  { id: '1', reportNumber: 'MIS-001', employee: 'Rajesh Verma', department: 'Quality', item: 'Wire Stripping Tool', reportedDate: 'Jul 20, 2024', status: 'Investigating', replacementCost: 1200, lastKnownLocation: 'Godown 1, Rack 3', remarks: 'Last seen in QC station' },
  { id: '2', reportNumber: 'MIS-002', employee: 'Suresh Yadav', department: 'Maintenance', item: 'Safety Goggles', reportedDate: 'Jul 15, 2024', status: 'Resolved', replacementCost: 450, lastKnownLocation: 'Maintenance Bay', remarks: 'Found in Break Room — returned' },
];

const EMPLOYEES = [
  { value: 'amit', label: 'Amit Kumar — Production' },
  { value: 'rajesh', label: 'Rajesh Verma — Quality' },
  { value: 'suresh', label: 'Suresh Yadav — Maintenance' },
  { value: 'neha', label: 'Neha Gupta — Production' },
  { value: 'vikram', label: 'Vikram Singh — R&D' },
  { value: 'priya', label: 'Priya Sharma — Admin' },
];

export const AssetsPage: React.FC = () => {
  const { showToast, globalSearch, setGlobalSearch } = useApp();
  const [activeView, setActiveView] = useState<'assets' | 'missing'>('assets');
  const [isCreateAssetOpen, setIsCreateAssetOpen] = useState(false);
  const [isIssueOpen, setIsIssueOpen] = useState(false);
  const [isReturnOpen, setIsReturnOpen] = useState(false);
  const [isTransferOpen, setIsTransferOpen] = useState(false);
  const [isMissingOpen, setIsMissingOpen] = useState(false);
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [selectedAsset, setSelectedAsset] = useState<Asset | null>(null);
  const [issueEmployee, setIssueEmployee] = useState<string | undefined>(undefined);
  const [issueItem, setIssueItem] = useState<string | undefined>(undefined);
  const [returnAsset, setReturnAsset] = useState<string | undefined>(undefined);
  const [transferAsset, setTransferAsset] = useState<string | undefined>(undefined);
  const [missingEmployee, setMissingEmployee] = useState<string | undefined>(undefined);

  const stats = {
    total: INITIAL_ASSETS.length,
    issued: INITIAL_ASSETS.filter(a => a.status === 'Issued').length,
    available: INITIAL_ASSETS.filter(a => a.status === 'Available').length,
    maintenance: INITIAL_ASSETS.filter(a => a.status === 'Under Maintenance').length,
    totalValue: INITIAL_ASSETS.reduce((sum, a) => sum + a.currentValue, 0),
  };

  const assetColumns: Column<Asset>[] = [
    {
      key: 'assetCode',
      label: 'Asset',
      render: (a) => (
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 bg-blue-50 rounded-lg flex items-center justify-center">
            {a.category === 'Electronics' ? <Laptop size={12} className="text-blue-500" /> : <Wrench size={12} className="text-blue-500" />}
          </div>
          <div>
            <span className="text-xs font-bold text-slate-800 block leading-none">{a.assetCode}</span>
            <span className="text-xs text-slate-400">{a.name}</span>
          </div>
        </div>
      )
    },
    {
      key: 'category',
      label: 'Category',
      render: (a) => (
        <div>
          <span className="text-xs font-semibold text-slate-600 block">{a.category}</span>
          <span className="text-[10px] text-slate-400">{a.subCategory}</span>
        </div>
      )
    },
    {
      key: 'assignedTo',
      label: 'Assigned To',
      render: (a) => (
        <span className={`text-xs font-semibold ${a.assignedTo ? 'text-slate-700' : 'text-slate-300'}`}>
          {a.assignedTo || '—'}
        </span>
      )
    },
    {
      key: 'department',
      label: 'Department',
      render: (a) => (
        <span className={`text-xs font-semibold ${a.department ? 'text-slate-500' : 'text-slate-300'}`}>
          {a.department || '—'}
        </span>
      )
    },
    {
      key: 'location',
      label: 'Location',
      cellClassName: 'text-xs font-medium text-slate-500 max-w-[150px] truncate'
    },
    {
      key: 'currentValue',
      label: 'Value',
      align: 'right',
      render: (a) => (
        <span className="text-xs font-bold text-slate-900 tabular-nums">₹{a.currentValue.toLocaleString('en-IN')}</span>
      )
    },
    {
      key: 'status',
      label: 'Status',
      align: 'center',
      render: (a) => (
        <Badge
          variant={a.status === 'Issued' ? 'default' : a.status === 'Available' ? 'success' : 'warning'}
          className="py-0 h-5 flex items-center justify-center w-fit mx-auto"
        >
          {a.status}
        </Badge>
      )
    },
    {
      key: 'actions',
      label: '',
      sortable: false,
      align: 'right',
      render: (a) => (
        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
          {a.status === 'Issued' && (
            <button
              onClick={(e) => { e.stopPropagation(); setReturnAsset(a.assetCode); setIsReturnOpen(true); }}
              className="p-1.5 hover:bg-amber-50 rounded-lg transition-colors text-slate-300 hover:text-amber-600"
              title="Return Asset"
            >
              <RotateCcw size={14} />
            </button>
          )}
          <button
            onClick={(e) => { e.stopPropagation(); setSelectedAsset(a); setIsDetailOpen(true); }}
            className="p-1.5 hover:bg-slate-100 rounded-lg transition-colors text-slate-300 hover:text-slate-600"
          >
            <Eye size={14} />
          </button>
        </div>
      )
    }
  ];

  const missingColumns: Column<MissingReport>[] = [
    {
      key: 'reportNumber',
      label: 'Report #',
      render: (m) => (
        <div className="flex items-center gap-2">
          <AlertOctagon size={14} className="text-rose-400" />
          <span className="text-xs font-bold text-rose-600">{m.reportNumber}</span>
        </div>
      )
    },
    {
      key: 'employee',
      label: 'Employee',
      render: (m) => (
        <div>
          <span className="text-xs font-semibold text-slate-700 block">{m.employee}</span>
          <span className="text-[10px] text-slate-400">{m.department}</span>
        </div>
      )
    },
    {
      key: 'item',
      label: 'Item',
      cellClassName: 'text-xs font-semibold text-slate-600'
    },
    {
      key: 'lastKnownLocation',
      label: 'Last Location',
      cellClassName: 'text-xs font-medium text-slate-500'
    },
    {
      key: 'reportedDate',
      label: 'Reported',
      cellClassName: 'text-xs font-semibold text-slate-400'
    },
    {
      key: 'replacementCost',
      label: 'Cost',
      align: 'right',
      render: (m) => (
        <span className="text-xs font-bold text-rose-500 tabular-nums">₹{m.replacementCost.toLocaleString('en-IN')}</span>
      )
    },
    {
      key: 'status',
      label: 'Status',
      align: 'center',
      render: (m) => (
        <Badge
          variant={m.status === 'Resolved' ? 'success' : m.status === 'Replaced' ? 'default' : 'warning'}
          className="py-0 h-5 flex items-center justify-center w-fit mx-auto"
        >
          {m.status}
        </Badge>
      )
    }
  ];

  return (
    <PageLayout
      title="Assets & Employees"
      description="Track fixed assets, employee item issuance, returns, transfers, and missing item reports."
    >
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
        <StatCard stat={{ label: 'Total Assets', value: String(stats.total), change: 'All registered', trend: 'neutral', icon: Briefcase }} />
        <StatCard stat={{ label: 'Issued', value: String(stats.issued), change: 'With employees', trend: 'up', icon: User }} />
        <StatCard stat={{ label: 'Available', value: String(stats.available), change: 'Ready to issue', trend: 'up', icon: Briefcase }} />
        <StatCard stat={{ label: 'Maintenance', value: String(stats.maintenance), change: 'Under repair', trend: 'down', icon: Wrench }} />
        <StatCard stat={{ label: 'Total Value', value: `₹${(stats.totalValue / 100000).toFixed(1)}L`, change: 'Current value', trend: 'up', icon: Package }} />
      </div>

      <div className="flex gap-2 mb-4">
        <button
          onClick={() => setActiveView('assets')}
          className={`px-4 py-2.5 text-xs font-bold rounded-xl transition-all ${
            activeView === 'assets' ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/20' : 'bg-white text-slate-500 border border-slate-200'
          }`}
        >
          Asset Register ({INITIAL_ASSETS.length})
        </button>
        <button
          onClick={() => setActiveView('missing')}
          className={`px-4 py-2.5 text-xs font-bold rounded-xl transition-all ${
            activeView === 'missing' ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/20' : 'bg-white text-slate-500 border border-slate-200'
          }`}
        >
          <AlertOctagon size={14} className="inline mr-1" />
          Missing Reports ({INITIAL_MISSING.length})
        </button>
      </div>

      {activeView === 'assets' && (
        <Card noPadding className="overflow-hidden">
          <div className="p-4 border-b border-slate-100 flex flex-wrap gap-4 items-center justify-between bg-white">
            <Input
              variant="white"
              inputSize="sm"
              className="max-w-md rounded-full shadow-sm"
              placeholder="Search assets by name, code, or employee..."
              value={globalSearch}
              onChange={(e) => setGlobalSearch(e.target.value)}
              icon={<Search size={14} className="text-slate-400" strokeWidth={2.5} />}
            />
            <div className="flex gap-2">
              <Button variant="outline" size="sm" onClick={() => setIsTransferOpen(true)} leftIcon={<ArrowRightLeft size={14} />}>
                Transfer
              </Button>
              <Button size="sm" onClick={() => setIsCreateAssetOpen(true)} leftIcon={<Plus size={14} strokeWidth={3} />}>
                Register Asset
              </Button>
            </div>
          </div>
          <DataTable
            data={INITIAL_ASSETS}
            columns={assetColumns}
            rowKey={(a) => a.id}
            onRowClick={(a) => { setSelectedAsset(a); setIsDetailOpen(true); }}
          />
        </Card>
      )}

      {activeView === 'missing' && (
        <Card noPadding className="overflow-hidden">
          <div className="p-4 border-b border-slate-100 flex flex-wrap gap-4 items-center justify-between bg-white">
            <Input
              variant="white"
              inputSize="sm"
              className="max-w-md rounded-full shadow-sm"
              placeholder="Search missing reports..."
              value={globalSearch}
              onChange={(e) => setGlobalSearch(e.target.value)}
              icon={<Search size={14} className="text-slate-400" strokeWidth={2.5} />}
            />
            <Button variant="outline" size="sm" onClick={() => setIsMissingOpen(true)} leftIcon={<AlertOctagon size={14} />}>
              Report Missing Item
            </Button>
          </div>
          <DataTable data={INITIAL_MISSING} columns={missingColumns} rowKey={(m) => m.id} />
        </Card>
      )}

      {/* Asset Detail Modal */}
      <Modal
        isOpen={isDetailOpen}
        onClose={() => { setIsDetailOpen(false); setSelectedAsset(null); }}
        title={selectedAsset ? `${selectedAsset.assetCode} — ${selectedAsset.name}` : 'Asset Detail'}
        contentClassName="max-w-2xl"
        footer={
          <>
            <Button variant="ghost" size="sm" onClick={() => { setIsDetailOpen(false); setSelectedAsset(null); }}>Close</Button>
            <Button variant="outline" size="sm" onClick={() => showToast('Downloading asset report...', 'info')} leftIcon={<Download size={14} />}>
              Export
            </Button>
          </>
        }
      >
        {selectedAsset && (
          <div className="space-y-4">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              <div className="bg-slate-50 rounded-xl p-3 text-center">
                <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1">Status</p>
                <Badge variant={selectedAsset.status === 'Issued' ? 'default' : selectedAsset.status === 'Available' ? 'success' : 'warning'}>
                  {selectedAsset.status}
                </Badge>
              </div>
              <div className="bg-slate-50 rounded-xl p-3 text-center">
                <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1">Category</p>
                <p className="text-xs font-bold text-slate-900">{selectedAsset.category}</p>
              </div>
              <div className="bg-slate-50 rounded-xl p-3 text-center">
                <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1">Current Value</p>
                <p className="text-xs font-bold text-slate-900 tabular-nums">₹{selectedAsset.currentValue.toLocaleString('en-IN')}</p>
              </div>
              <div className="bg-slate-50 rounded-xl p-3 text-center">
                <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1">Purchase Value</p>
                <p className="text-xs font-bold text-slate-900 tabular-nums">₹{selectedAsset.purchaseValue.toLocaleString('en-IN')}</p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4 text-xs">
              <div className="space-y-2">
                <div><span className="text-slate-400">Serial No:</span> <span className="font-bold text-slate-800 ml-1 font-mono">{selectedAsset.serialNumber}</span></div>
                <div><span className="text-slate-400">Purchase Date:</span> <span className="font-bold text-slate-800 ml-1">{selectedAsset.purchaseDate}</span></div>
                <div><span className="text-slate-400">Warranty Until:</span> <span className="font-bold text-slate-800 ml-1">{selectedAsset.warranty}</span></div>
                <div><span className="text-slate-400">Location:</span> <span className="font-bold text-slate-800 ml-1">{selectedAsset.location}</span></div>
              </div>
              <div className="space-y-2">
                <div><span className="text-slate-400">Assigned To:</span> <span className="font-bold text-slate-800 ml-1">{selectedAsset.assignedTo || '—'}</span></div>
                <div><span className="text-slate-400">Department:</span> <span className="font-bold text-slate-800 ml-1">{selectedAsset.department || '—'}</span></div>
                <div><span className="text-slate-400">Issue Date:</span> <span className="font-bold text-slate-800 ml-1">{selectedAsset.issueDate || '—'}</span></div>
                <div><span className="text-slate-400">Expected Return:</span> <span className="font-bold text-slate-800 ml-1">{selectedAsset.expectedReturn || '—'}</span></div>
              </div>
            </div>

            {selectedAsset.remarks && (
              <div className="bg-slate-50 border border-slate-100 rounded-xl p-3 text-xs text-slate-600 font-medium">
                {selectedAsset.remarks}
              </div>
            )}

            {selectedAsset.status === 'Issued' && (
              <div className="flex gap-2">
                <Button variant="outline" size="sm" onClick={() => { setIsDetailOpen(false); setSelectedAsset(null); setReturnAsset(selectedAsset.assetCode); setIsReturnOpen(true); }} leftIcon={<RotateCcw size={14} />}>
                  Return Asset
                </Button>
                <Button variant="outline" size="sm" onClick={() => { setIsDetailOpen(false); setSelectedAsset(null); setTransferAsset(selectedAsset.assetCode); setIsTransferOpen(true); }} leftIcon={<ArrowRightLeft size={14} />}>
                  Transfer
                </Button>
              </div>
            )}
          </div>
        )}
      </Modal>

      {/* Create Asset Modal */}
      <Modal
        isOpen={isCreateAssetOpen}
        onClose={() => setIsCreateAssetOpen(false)}
        title="Register New Asset"
        contentClassName="max-w-2xl"
        footer={
          <>
            <Button variant="ghost" size="sm" onClick={() => setIsCreateAssetOpen(false)}>Cancel</Button>
            <Button size="sm" onClick={() => { showToast('Asset registered successfully', 'success'); setIsCreateAssetOpen(false); }}>Register Asset</Button>
          </>
        }
      >
        <div className="space-y-4">
          <Input label="Asset Name" required placeholder="e.g. Digital Multimeter — Fluke 87V" />
          <div className="grid grid-cols-2 gap-4">
            <Select
              label="Category"
              options={[
                { value: 'electronics', label: 'Electronics' },
                { value: 'tools', label: 'Tools' },
                { value: 'safety', label: 'Safety' },
                { value: 'furniture', label: 'Furniture' },
              ]}
              placeholder="Select category"
              onChange={() => {}}
            />
            <Input label="Sub-Category" placeholder="e.g. Measurement, Power Tools" />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <Input label="Serial Number" required placeholder="e.g. FL-2024-087" />
            <Input label="Purchase Date" type="date" required />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <Input label="Purchase Value (₹)" type="number" required placeholder="e.g. 32000" />
            <Input label="Warranty Until" type="date" />
          </div>
          <Input label="Location" placeholder="e.g. Godown 1, Rack 3" />
        </div>
      </Modal>

      {/* Issue to Employee Modal */}
      <Modal
        isOpen={isIssueOpen}
        onClose={() => { setIsIssueOpen(false); setIssueEmployee(undefined); setIssueItem(undefined); }}
        title="Issue Asset to Employee"
        footer={
          <>
            <Button variant="ghost" size="sm" onClick={() => { setIsIssueOpen(false); setIssueEmployee(undefined); setIssueItem(undefined); }}>Cancel</Button>
            <Button size="sm" onClick={() => { showToast('Asset issued successfully', 'success'); setIsIssueOpen(false); setIssueEmployee(undefined); setIssueItem(undefined); }}>Issue Asset</Button>
          </>
        }
      >
        <div className="space-y-4">
          <Select
            label="Employee"
            options={EMPLOYEES}
            value={issueEmployee}
            onChange={(val) => setIssueEmployee(val as string)}
            placeholder="Select employee"
          />
          <Select
            label="Asset to Issue"
            options={INITIAL_ASSETS.filter(a => a.status === 'Available').map(a => ({ value: a.assetCode, label: `${a.assetCode} — ${a.name}` }))}
            value={issueItem}
            onChange={(val) => setIssueItem(val as string)}
            placeholder="Select available asset"
          />
          <div className="bg-amber-50 border border-amber-100 rounded-xl p-3 text-xs text-amber-700 font-medium flex items-start gap-2">
            <AlertTriangle size={14} className="mt-0.5 flex-shrink-0" />
            <span>Duplicate check: If this asset is already checked out to someone, a warning will appear before issuing.</span>
          </div>
          <Input label="Expected Return Date" type="date" />
          <Input label="Remarks" placeholder="e.g. For field testing — expected 2 weeks" />
        </div>
      </Modal>

      {/* Return Asset Modal */}
      <Modal
        isOpen={isReturnOpen}
        onClose={() => { setIsReturnOpen(false); setReturnAsset(undefined); }}
        title="Return Asset"
        footer={
          <>
            <Button variant="ghost" size="sm" onClick={() => { setIsReturnOpen(false); setReturnAsset(undefined); }}>Cancel</Button>
            <Button size="sm" onClick={() => { showToast('Asset returned successfully — stock updated', 'success'); setIsReturnOpen(false); setReturnAsset(undefined); }}>Confirm Return</Button>
          </>
        }
      >
        <div className="space-y-4">
          <Input label="Asset Code" value={returnAsset || ''} readOnly />
          <Input label="Condition" placeholder="e.g. Good — no damage" />
          <Input label="Remarks" placeholder="e.g. Used for 3 months, all accessories returned" />
        </div>
      </Modal>

      {/* Transfer Asset Modal */}
      <Modal
        isOpen={isTransferOpen}
        onClose={() => { setIsTransferOpen(false); setTransferAsset(undefined); }}
        title="Transfer Asset to Another Employee"
        footer={
          <>
            <Button variant="ghost" size="sm" onClick={() => { setIsTransferOpen(false); setTransferAsset(undefined); }}>Cancel</Button>
            <Button size="sm" onClick={() => { showToast('Asset transferred successfully', 'success'); setIsTransferOpen(false); setTransferAsset(undefined); }}>Confirm Transfer</Button>
          </>
        }
      >
        <div className="space-y-4">
          <Input label="Asset Code" value={transferAsset || ''} readOnly />
          <Select
            label="Transfer To (Employee)"
            options={EMPLOYEES}
            placeholder="Select new assignee"
            onChange={() => {}}
          />
          <Input label="Transfer Reason" placeholder="e.g. Role change, project reassignment" />
        </div>
      </Modal>

      {/* Report Missing Modal */}
      <Modal
        isOpen={isMissingOpen}
        onClose={() => { setIsMissingOpen(false); setMissingEmployee(undefined); }}
        title="Report Missing Item"
        footer={
          <>
            <Button variant="ghost" size="sm" onClick={() => { setIsMissingOpen(false); setMissingEmployee(undefined); }}>Cancel</Button>
            <Button size="sm" onClick={() => { showToast('Missing item report filed — Accounts notified', 'success'); setIsMissingOpen(false); setMissingEmployee(undefined); }}>Submit Report</Button>
          </>
        }
      >
        <div className="space-y-4">
          <div className="bg-rose-50 border border-rose-200 rounded-xl p-3 text-xs text-rose-700 font-medium flex items-start gap-2">
            <AlertOctagon size={14} className="mt-0.5 flex-shrink-0" />
            <span>Filing this report will notify Accounts. The replacement cost may be deducted from the employee's salary if the item is not recovered.</span>
          </div>
          <Select
            label="Employee"
            options={EMPLOYEES}
            value={missingEmployee}
            onChange={(val) => setMissingEmployee(val as string)}
            placeholder="Select employee"
          />
          <Input label="Item Description" required placeholder="e.g. Wire Stripping Tool — Yellow Handle" />
          <Input label="Last Known Location" placeholder="e.g. Godown 1, Rack 3" />
          <Input label="Date Noticed Missing" type="date" required />
          <Input label="Estimated Replacement Cost (₹)" type="number" placeholder="e.g. 1200" />
          <Input label="Remarks" placeholder="e.g. Last seen in QC station on Jul 19" />
        </div>
      </Modal>
    </PageLayout>
  );
};

export default AssetsPage;
