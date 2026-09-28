import React, { useState, useMemo } from 'react';
import { Card } from '../components/ui/Card';
import { StatCard } from '../components/ui/StatCard';
import { Badge } from '../components/ui/Badge';
import { DataTable, Column } from '../components/ui/DataTable';
import { Input } from '../components/ui/Input';
import { Button } from '../components/ui/Button';
import { Modal } from '../components/ui/Modal';
import { Select } from '../components/ui/Select';
import { PageLayout } from '../components/layout/PageLayout';
import { useApp } from '../App';
import {
  Search,
  Plus,
  Eye,
  ClipboardList,
  Clock,
  CheckCircle,
  AlertTriangle,
  Package,
  Wrench,
  Trash2,
  ShoppingCart,
  Truck,
  FileText,
  ArrowRight,
  Edit,
  BarChart3
} from 'lucide-react';

interface JobOrder {
  id: string;
  jobNumber: string;
  description: string;
  customer: string;
  quantity: number;
  unit: string;
  startDate: string;
  endDate: string;
  status: string;
  priority: string;
  bomItems: number;
  materialReady: string;
  estimatedCost: number;
  remarks: string;
}

interface BOMItem {
  id: string;
  item: string;
  required: number;
  unit: string;
  available: number;
  shortage: number;
  unitCost: number;
  totalCost: number;
  issued: number;
}

interface CourierTracking {
  id: string;
  trackingId: string;
  courier: string;
  status: string;
  dispatchedDate: string;
  expectedDelivery: string;
  destination: string;
  material: string;
}

const JOB_SIZES = [
  { value: '1200x1300', label: '1200 x 1300 mm' },
  { value: '1200x13000', label: '1200 x 13000 mm' },
  { value: '600x800', label: '600 x 800 mm' },
  { value: 'custom', label: 'Custom Size' },
];

const INITIAL_JOBS: JobOrder[] = [
  { id: '1', jobNumber: 'JO-045', description: 'Control Panel Assembly — 100 units', customer: 'Tata Steel Ltd', quantity: 100, unit: 'units', startDate: 'Jul 20, 2024', endDate: 'Aug 15, 2024', status: 'In Progress', priority: 'High', bomItems: 8, materialReady: '6 of 8', estimatedCost: 1250000, remarks: 'Rush order — expedite material procurement' },
  { id: '2', jobNumber: 'JO-046', description: 'Wiring Harness Set — 250 units', customer: 'L&T Power', quantity: 250, unit: 'units', startDate: 'Jul 25, 2024', endDate: 'Aug 20, 2024', status: 'Planned', priority: 'Medium', bomItems: 5, materialReady: '2 of 5', estimatedCost: 875000, remarks: '' },
  { id: '3', jobNumber: 'JO-047', description: 'Chemical Processing Unit — 10 units', customer: 'Reliance Industries', quantity: 10, unit: 'units', startDate: 'Aug 01, 2024', endDate: 'Sep 10, 2024', status: 'Planned', priority: 'High', bomItems: 12, materialReady: '0 of 12', estimatedCost: 4500000, remarks: 'Custom order — special chemical grade materials required' },
  { id: '4', jobNumber: 'JO-044', description: 'Sensor Calibration Kit — 50 units', customer: 'Honeywell India', quantity: 50, unit: 'kits', startDate: 'Jul 10, 2024', endDate: 'Jul 30, 2024', status: 'Completed', priority: 'Low', bomItems: 6, materialReady: '6 of 6', estimatedCost: 325000, remarks: '' },
  { id: '5', jobNumber: 'JO-043', description: 'Motor Drive Assembly — 30 units', customer: 'Siemens India', quantity: 30, unit: 'units', startDate: 'Jul 05, 2024', endDate: 'Jul 25, 2024', status: 'On Hold', priority: 'Medium', bomItems: 10, materialReady: '7 of 10', estimatedCost: 1800000, remarks: 'Waiting for PLC module delivery from vendor' },
];

const INITIAL_BOM: BOMItem[] = [
  { id: '1', item: 'PLC-XYZ Control Module', required: 100, unit: 'pcs', available: 25, shortage: 75, unitCost: 8500, totalCost: 850000, issued: 25 },
  { id: '2', item: 'Copper Wire 2.5mm', required: 50, unit: 'kg', available: 120, shortage: 0, unitCost: 420, totalCost: 21000, issued: 50 },
  { id: '3', item: 'Steel Sheet 3mm', required: 20, unit: 'bundles', available: 85, shortage: 0, unitCost: 2800, totalCost: 56000, issued: 20 },
  { id: '4', item: 'Relay Switch 24V', required: 200, unit: 'pcs', available: 12, shortage: 188, unitCost: 350, totalCost: 70000, issued: 12 },
  { id: '5', item: 'Terminal Block', required: 400, unit: 'pcs', available: 500, shortage: 0, unitCost: 85, totalCost: 34000, issued: 400 },
  { id: '6', item: 'Cable Tie Pack', required: 10, unit: 'boxes', available: 25, shortage: 0, unitCost: 150, totalCost: 1500, issued: 10 },
  { id: '7', item: 'Safety Gloves (Pack)', required: 5, unit: 'packs', available: 45, shortage: 0, unitCost: 600, totalCost: 3000, issued: 5 },
  { id: '8', item: 'Heat Shrink Tubing', required: 100, unit: 'm', available: 80, shortage: 20, unitCost: 45, totalCost: 4500, issued: 80 },
];

const INITIAL_COURIER: CourierTracking[] = [
  { id: '1', trackingId: 'CV-2024-001', courier: 'BlueDart', status: 'In Transit', dispatchedDate: 'Jul 26, 2024', expectedDelivery: 'Jul 29, 2024', destination: 'Tata Steel — Jamshedpur', material: 'PLC-XYZ Module (25 pcs)' },
  { id: '2', trackingId: 'CV-2024-002', courier: 'DTDC', status: 'Delivered', dispatchedDate: 'Jul 24, 2024', expectedDelivery: 'Jul 26, 2024', destination: 'L&T Power — Mumbai', material: 'Wiring Harness Samples (5 sets)' },
];

export const JobsPage: React.FC = () => {
  const { showToast, globalSearch, setGlobalSearch } = useApp();
  const [selectedJob, setSelectedJob] = useState<JobOrder | null>(null);
  const [isCreateJobOpen, setIsCreateJobOpen] = useState(false);
  const [isExtraPartOpen, setIsExtraPartOpen] = useState(false);
  const [isIssueMaterialOpen, setIsIssueMaterialOpen] = useState(false);
  const [isBomAnalysisOpen, setIsBomAnalysisOpen] = useState(false);
  const [isAddBomItemOpen, setIsAddBomItemOpen] = useState(false);
  const [activeJobTab, setActiveJobTab] = useState<'bom' | 'analysis' | 'courier' | 'log'>('bom');
  const [extraPartItem, setExtraPartItem] = useState<string | undefined>(undefined);
  const [issueItem, setIssueItem] = useState<string | undefined>(undefined);

  const filteredJobs = useMemo(() => {
    return INITIAL_JOBS.filter(j =>
      j.jobNumber.toLowerCase().includes(globalSearch.toLowerCase()) ||
      j.description.toLowerCase().includes(globalSearch.toLowerCase()) ||
      j.customer.toLowerCase().includes(globalSearch.toLowerCase())
    );
  }, [globalSearch]);

  const stats = useMemo(() => {
    const active = INITIAL_JOBS.filter(j => j.status === 'In Progress').length;
    const planned = INITIAL_JOBS.filter(j => j.status === 'Planned').length;
    const completed = INITIAL_JOBS.filter(j => j.status === 'Completed').length;
    const onHold = INITIAL_JOBS.filter(j => j.status === 'On Hold').length;
    return { active, planned, completed, onHold };
  }, []);

  const handleIssueMaterial = (e: React.FormEvent) => {
    e.preventDefault();
    showToast('Material issued to job — stock updated', 'success');
    setIsIssueMaterialOpen(false);
    setIssueItem(undefined);
  };

  if (selectedJob) {
    const bomColumns: Column<BOMItem>[] = [
      {
        key: 'item',
        label: 'Item',
        render: (b) => (
          <div className="flex items-center gap-2">
            <Package size={14} className="text-slate-400" />
            <span className="text-xs font-bold text-slate-800">{b.item}</span>
          </div>
        )
      },
      {
        key: 'required',
        label: 'Required',
        align: 'center',
        render: (b) => (
          <span className="text-xs font-bold text-slate-900 tabular-nums">{b.required} {b.unit}</span>
        )
      },
      {
        key: 'available',
        label: 'In Stock',
        align: 'center',
        render: (b) => (
          <span className={`text-xs font-bold tabular-nums ${b.available >= b.required ? 'text-emerald-600' : 'text-amber-600'}`}>
            {b.available}
          </span>
        )
      },
      {
        key: 'shortage',
        label: 'Shortage',
        align: 'center',
        render: (b) => (
          <span className={`text-xs font-bold tabular-nums ${b.shortage > 0 ? 'text-rose-500' : 'text-slate-400'}`}>
            {b.shortage > 0 ? b.shortage : '—'}
          </span>
        )
      },
      {
        key: 'issued',
        label: 'Issued',
        align: 'center',
        render: (b) => (
          <span className={`text-xs font-bold tabular-nums ${b.issued >= b.required ? 'text-emerald-600' : 'text-blue-600'}`}>
            {b.issued}/{b.required}
          </span>
        )
      },
      {
        key: 'unitCost',
        label: 'Unit Cost',
        align: 'right',
        render: (b) => (
          <span className="text-xs font-semibold text-slate-600 tabular-nums">₹{b.unitCost.toLocaleString('en-IN')}</span>
        )
      },
      {
        key: 'totalCost',
        label: 'Total',
        align: 'right',
        render: (b) => (
          <span className="text-xs font-bold text-slate-900 tabular-nums">₹{b.totalCost.toLocaleString('en-IN')}</span>
        )
      },
      {
        key: 'actions',
        label: '',
        sortable: false,
        align: 'right',
        render: (b) => (
          <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
            <button
              onClick={(e) => { e.stopPropagation(); setIssueItem(b.item); setIsIssueMaterialOpen(true); }}
              className="p-1.5 hover:bg-blue-50 rounded-lg transition-colors text-slate-300 hover:text-blue-600"
              title="Issue Material"
            >
              <Truck size={14} />
            </button>
            <button
              onClick={(e) => { e.stopPropagation(); showToast(`Editing ${b.item} in BOM`, 'info'); }}
              className="p-1.5 hover:bg-slate-100 rounded-lg transition-colors text-slate-300 hover:text-slate-600"
            >
              <Edit size={14} />
            </button>
          </div>
        )
      }
    ];

    const shortageItems = INITIAL_BOM.filter(b => b.shortage > 0);
    const totalCost = INITIAL_BOM.reduce((sum, b) => sum + b.totalCost, 0);
    const issuedCost = INITIAL_BOM.reduce((sum, b) => sum + (b.issued * b.unitCost), 0);

    return (
      <PageLayout
        title={`${selectedJob.jobNumber} — ${selectedJob.description}`}
        description={`Production run for ${selectedJob.customer} | ${selectedJob.quantity} ${selectedJob.unit}`}
        breadcrumbs={[
          { label: 'Job Orders', href: '/jobs' },
          { label: selectedJob.jobNumber }
        ]}
        actions={
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={() => setIsExtraPartOpen(true)} leftIcon={<Wrench size={14} />}>
              Request Extra Part
            </Button>
            <Button variant="ghost" size="sm" onClick={() => setSelectedJob(null)}>
              ← Back to Jobs
            </Button>
          </div>
        }
      >
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
          <Card>
            <p className="text-xs font-semibold text-slate-500 mb-2">Status</p>
            <Badge variant={selectedJob.status === 'In Progress' ? 'default' : selectedJob.status === 'Completed' ? 'success' : selectedJob.status === 'On Hold' ? 'error' : 'warning'}>
              {selectedJob.status}
            </Badge>
          </Card>
          <Card>
            <p className="text-xs font-semibold text-slate-500 mb-2">Materials Ready</p>
            <p className="text-xl font-bold text-slate-900">{selectedJob.materialReady}</p>
          </Card>
          <Card>
            <p className="text-xs font-semibold text-slate-500 mb-2">Total BOM Cost</p>
            <p className="text-xl font-bold text-slate-900 tabular-nums">₹{totalCost.toLocaleString('en-IN')}</p>
          </Card>
          <Card>
            <p className="text-xs font-semibold text-slate-500 mb-2">Material Issued</p>
            <p className="text-xl font-bold text-emerald-600 tabular-nums">₹{issuedCost.toLocaleString('en-IN')}</p>
          </Card>
        </div>

        {shortageItems.length > 0 && (
          <div className="bg-rose-50 border border-rose-200 rounded-xl p-4 mb-4 flex items-start gap-3">
            <div className="p-1.5 bg-rose-100 rounded-lg">
              <AlertTriangle size={16} className="text-rose-500" />
            </div>
            <div className="flex-1">
              <p className="text-xs font-bold text-rose-800">Material Shortage Alert</p>
              <p className="text-xs text-rose-600 mt-1">
                {shortageItems.length} items are short: {shortageItems.map(s => s.item).join(', ')}. Please raise a procurement request.
              </p>
            </div>
            <Button variant="outline" size="xs" onClick={() => { showToast('Creating urgent procurement request...', 'info'); }} leftIcon={<ShoppingCart size={12} />}>
              Raise PO
            </Button>
          </div>
        )}

        {/* Job Tabs */}
        <div className="flex gap-2 mb-4">
          {[
            { key: 'bom', label: 'BOM', icon: Package },
            { key: 'analysis', label: 'Analysis', icon: BarChart3 },
            { key: 'courier', label: 'Dispatch', icon: Truck },
            { key: 'log', label: 'Activity Log', icon: FileText },
          ].map(tab => (
            <button
              key={tab.key}
              onClick={() => setActiveJobTab(tab.key as any)}
              className={`px-4 py-2.5 text-xs font-bold rounded-xl transition-all flex items-center gap-2 ${
                activeJobTab === tab.key
                  ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/20'
                  : 'bg-white text-slate-500 border border-slate-200 hover:border-slate-300'
              }`}
            >
              <tab.icon size={14} />
              {tab.label}
            </button>
          ))}
        </div>

        {activeJobTab === 'bom' && (
          <Card noPadding className="overflow-hidden">
            <div className="px-5 py-3 border-b border-slate-100 bg-white flex items-center justify-between">
              <h3 className="text-xs font-bold text-slate-900">Bill of Materials (Recipe)</h3>
              <div className="flex gap-2">
                <Button variant="ghost" size="xs" leftIcon={<Plus size={12} />} onClick={() => setIsAddBomItemOpen(true)}>Add Item</Button>
                <Button variant="outline" size="xs" leftIcon={<ShoppingCart size={12} />} onClick={() => showToast('Creating PO for shortage items...', 'info')}>Order Shortage</Button>
              </div>
            </div>
            <DataTable
              data={INITIAL_BOM}
              columns={bomColumns}
              rowKey={(b) => b.id}
            />
          </Card>
        )}

        {activeJobTab === 'analysis' && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card>
              <h3 className="text-xs font-bold text-slate-900 mb-3">Material Readiness</h3>
              <div className="space-y-3">
                {INITIAL_BOM.map(b => (
                  <div key={b.id} className="space-y-1">
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-slate-600 font-medium truncate max-w-[200px]">{b.item}</span>
                      <span className="font-bold tabular-nums">{b.issued}/{b.required}</span>
                    </div>
                    <div className="h-1.5 bg-slate-100 rounded-full overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all ${b.issued >= b.required ? 'bg-emerald-500' : 'bg-amber-500'}`}
                        style={{ width: `${Math.min(100, (b.issued / b.required) * 100)}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </Card>
            <Card>
              <h3 className="text-xs font-bold text-slate-900 mb-3">Cost Breakdown</h3>
              <div className="space-y-2">
                {INITIAL_BOM.map(b => (
                  <div key={b.id} className="flex items-center justify-between bg-slate-50 rounded-lg px-3 py-2">
                    <span className="text-xs text-slate-600 font-medium truncate max-w-[180px]">{b.item}</span>
                    <span className="text-xs font-bold text-slate-900 tabular-nums">₹{b.totalCost.toLocaleString('en-IN')}</span>
                  </div>
                ))}
                <div className="flex items-center justify-between border-t border-slate-200 pt-2 mt-2">
                  <span className="text-xs font-bold text-slate-900">Total</span>
                  <span className="text-sm font-bold text-blue-600 tabular-nums">₹{totalCost.toLocaleString('en-IN')}</span>
                </div>
              </div>
            </Card>
          </div>
        )}

        {activeJobTab === 'courier' && (
          <Card noPadding className="overflow-hidden">
            <div className="px-5 py-3 border-b border-slate-100 bg-white flex items-center justify-between">
              <h3 className="text-xs font-bold text-slate-900">Dispatch & Courier Tracking</h3>
              <Button variant="ghost" size="xs" leftIcon={<Truck size={12} />}>New Dispatch</Button>
            </div>
            <div className="p-4 space-y-3">
              {INITIAL_COURIER.map(c => (
                <div key={c.id} className="flex items-center gap-3 bg-white border border-slate-100 rounded-xl p-4">
                  <div className="w-8 h-8 bg-blue-50 rounded-lg flex items-center justify-center flex-shrink-0">
                    <Truck size={14} className="text-blue-500" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-slate-800">{c.trackingId}</span>
                      <Badge variant={c.status === 'Delivered' ? 'success' : 'warning'} className="py-0 h-4 text-[9px]">{c.status}</Badge>
                    </div>
                    <p className="text-xs text-slate-500 truncate">{c.material} → {c.destination}</p>
                    <p className="text-[10px] text-slate-400">{c.courier} | Dispatched: {c.dispatchedDate} | ETA: {c.expectedDelivery}</p>
                  </div>
                  <Button variant="outline" size="xs" onClick={() => showToast(`Tracking ${c.trackingId} on ${c.courier} website`, 'info')}>
                    Track
                  </Button>
                </div>
              ))}
              {INITIAL_COURIER.length === 0 && (
                <p className="text-xs text-slate-400 text-center py-8">No dispatches yet for this job.</p>
              )}
            </div>
          </Card>
        )}

        {activeJobTab === 'log' && (
          <Card>
            <h3 className="text-xs font-bold text-slate-900 mb-3">Activity Log</h3>
            <div className="space-y-3">
              {[
                { time: 'Jul 26, 14:30', action: 'Material issued', detail: 'Terminal Block — 400 pcs issued from G1-R03', user: 'Ramesh' },
                { time: 'Jul 25, 11:15', action: 'BOM updated', detail: 'Added Heat Shrink Tubing to BOM (100m)', user: 'Mr. Sharma' },
                { time: 'Jul 24, 09:00', action: 'Status changed', detail: 'Status changed from Planned to In Progress', user: 'System' },
                { time: 'Jul 23, 16:45', action: 'Material issued', detail: 'Copper Wire 2.5mm — 50 kg issued from G1-R01', user: 'Suresh' },
                { time: 'Jul 22, 10:30', action: 'Material issued', detail: 'Steel Sheet 3mm — 20 bundles issued from G1-R02', user: 'Ramesh' },
                { time: 'Jul 20, 08:00', action: 'Job created', detail: `Job ${selectedJob.jobNumber} created for ${selectedJob.customer}`, user: 'Mr. Sharma' },
              ].map((log, idx) => (
                <div key={idx} className="flex items-start gap-3">
                  <div className="w-2 h-2 bg-blue-500 rounded-full mt-1.5 flex-shrink-0" />
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-slate-800">{log.action}</span>
                      <span className="text-[10px] text-slate-400">{log.user}</span>
                    </div>
                    <p className="text-xs text-slate-500">{log.detail}</p>
                    <p className="text-[10px] text-slate-400 mt-0.5">{log.time}</p>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        )}

        {/* Request Extra Part Modal */}
        <Modal
          isOpen={isExtraPartOpen}
          onClose={() => { setIsExtraPartOpen(false); setExtraPartItem(undefined); }}
          title="Request Extra Part"
          footer={
            <>
              <Button variant="ghost" size="sm" onClick={() => setIsExtraPartOpen(false)}>Cancel</Button>
              <Button size="sm" onClick={() => { showToast('Extra part request sent for approval', 'success'); setIsExtraPartOpen(false); setExtraPartItem(undefined); }}>Submit Request</Button>
            </>
          }
        >
          <div className="space-y-4">
            <div className="bg-amber-50 border border-amber-100 rounded-xl p-3 text-xs text-amber-700 font-medium">
              This part is not in the original BOM. It will be sent to the supervisor for approval before issuing.
            </div>
            <Select
              label="Item"
              options={[
                { value: 'extra-relay', label: 'Relay Switch 24V (Extra)' },
                { value: 'extra-cable', label: 'Cable 4mm (Extra)' },
                { value: 'extra-fuse', label: 'Fuse 10A (Extra)' },
              ]}
              value={extraPartItem}
              onChange={(val) => setExtraPartItem(val as string)}
              placeholder="Select extra item"
            />
            <Input label="Quantity" type="number" placeholder="e.g. 10" />
            <Input label="Reason for Extra Part" required placeholder="e.g. Original part was damaged during assembly" />
          </div>
        </Modal>

        {/* Issue Material Modal */}
        <Modal
          isOpen={isIssueMaterialOpen}
          onClose={() => { setIsIssueMaterialOpen(false); setIssueItem(undefined); }}
          title="Issue Material from Stock"
          footer={
            <>
              <Button variant="ghost" size="sm" onClick={() => setIsIssueMaterialOpen(false)}>Cancel</Button>
              <Button size="sm" onClick={handleIssueMaterial}>Confirm Issue</Button>
            </>
          }
        >
          <div className="space-y-4">
            <div className="bg-blue-50 border border-blue-100 rounded-xl p-3 text-xs text-blue-700 font-medium">
              Material will be deducted from stock and linked to {selectedJob.jobNumber}. FIFO will be applied.
            </div>
            <Input label="Item" value={issueItem || ''} readOnly />
            <Input label="Quantity to Issue" type="number" placeholder="e.g. 25" required />
            <Select
              label="Issue From Rack"
              options={[
                { value: 'G1-R01', label: 'G1-R01 — Zone A, Entry Side' },
                { value: 'G1-R03', label: 'G1-R03 — Zone B, Electrical' },
                { value: 'G2-R01', label: 'G2-R01 — Annex, General' },
              ]}
              onChange={() => {}}
              placeholder="Select rack"
            />
            <Input label="Remarks" placeholder="e.g. For JO-045 — Control Panel Assembly" />
          </div>
        </Modal>

        {/* Add BOM Item Modal */}
        <Modal
          isOpen={isAddBomItemOpen}
          onClose={() => setIsAddBomItemOpen(false)}
          title="Add Item to BOM"
          footer={
            <>
              <Button variant="ghost" size="sm" onClick={() => setIsAddBomItemOpen(false)}>Cancel</Button>
              <Button size="sm" onClick={() => { showToast('Item added to BOM', 'success'); setIsAddBomItemOpen(false); }}>Add Item</Button>
            </>
          }
        >
          <div className="space-y-4">
            <Select
              label="Item"
              options={[
                { value: 'Copper Wire 4mm', label: 'Copper Wire 4mm' },
                { value: 'Steel Sheet 5mm', label: 'Steel Sheet 5mm' },
                { value: 'Cleaning Solvent 5L', label: 'Cleaning Solvent 5L' },
              ]}
              onChange={() => {}}
              placeholder="Select item"
            />
            <Input label="Required Quantity" type="number" placeholder="e.g. 50" required />
            <Select
              label="Unit"
              options={[
                { value: 'pcs', label: 'Pieces' },
                { value: 'kg', label: 'Kilograms' },
                { value: 'm', label: 'Meters' },
                { value: 'bundles', label: 'Bundles' },
                { value: 'boxes', label: 'Boxes' },
              ]}
              onChange={() => {}}
              placeholder="Select unit"
            />
            <Input label="Estimated Unit Cost (₹)" type="number" placeholder="e.g. 420" />
          </div>
        </Modal>
      </PageLayout>
    );
  }

  const columns: Column<JobOrder>[] = [
    {
      key: 'jobNumber',
      label: 'Job Number',
      render: (j) => (
        <div className="flex items-center gap-2">
          <ClipboardList size={14} className="text-slate-400" />
          <span className="text-xs font-bold text-blue-600">{j.jobNumber}</span>
        </div>
      )
    },
    {
      key: 'description',
      label: 'Description',
      cellClassName: 'text-xs font-semibold text-slate-700 max-w-[250px] truncate'
    },
    {
      key: 'customer',
      label: 'Customer',
      cellClassName: 'text-xs font-semibold text-slate-500'
    },
    {
      key: 'startDate',
      label: 'Start',
      cellClassName: 'text-xs font-semibold text-slate-400'
    },
    {
      key: 'endDate',
      label: 'End',
      cellClassName: 'text-xs font-semibold text-slate-400'
    },
    {
      key: 'priority',
      label: 'Priority',
      align: 'center',
      render: (j) => (
        <Badge
          variant={j.priority === 'High' ? 'error' : j.priority === 'Medium' ? 'warning' : 'default'}
          className="py-0 h-5 flex items-center justify-center w-fit mx-auto"
        >
          {j.priority}
        </Badge>
      )
    },
    {
      key: 'bomItems',
      label: 'BOM',
      align: 'center',
      cellClassName: 'text-xs font-bold text-slate-600 tabular-nums'
    },
    {
      key: 'materialReady',
      label: 'Materials',
      align: 'center',
      render: (j) => {
        const [ready, total] = j.materialReady.split(' of ').map(Number);
        return (
          <span className={`text-xs font-bold tabular-nums ${ready === total ? 'text-emerald-600' : 'text-amber-600'}`}>
            {j.materialReady}
          </span>
        );
      }
    },
    {
      key: 'estimatedCost',
      label: 'Est. Cost',
      align: 'right',
      render: (j) => (
        <span className="text-xs font-bold text-slate-900 tabular-nums">₹{j.estimatedCost.toLocaleString('en-IN')}</span>
      )
    },
    {
      key: 'status',
      label: 'Status',
      align: 'center',
      render: (j) => (
        <Badge
          variant={
            j.status === 'Completed' ? 'success' :
              j.status === 'In Progress' ? 'default' :
                j.status === 'On Hold' ? 'error' : 'warning'
          }
          className="py-0 h-5 flex items-center justify-center w-fit mx-auto"
        >
          {j.status}
        </Badge>
      )
    },
    {
      key: 'actions',
      label: '',
      sortable: false,
      align: 'right',
      render: (j) => (
        <button
          onClick={(e) => { e.stopPropagation(); setSelectedJob(j); }}
          className="p-1.5 hover:bg-blue-50 rounded-lg transition-colors text-slate-300 hover:text-blue-600 opacity-0 group-hover:opacity-100"
        >
          <Eye size={14} />
        </button>
      )
    }
  ];

  return (
    <PageLayout
      title="Job Orders"
      description="Track production runs, material recipes (BOM), and usage."
      actions={
        <Button size="sm" onClick={() => setIsCreateJobOpen(true)} leftIcon={<Plus size={14} strokeWidth={3} />}>
          New Job Order
        </Button>
      }
    >
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard stat={{ label: 'Active Jobs', value: String(stats.active), change: 'Currently running', trend: 'up', icon: ClipboardList }} />
        <StatCard stat={{ label: 'Planned', value: String(stats.planned), change: 'Upcoming', trend: 'neutral', icon: Clock }} />
        <StatCard stat={{ label: 'Completed', value: String(stats.completed), change: 'Finished', trend: 'up', icon: CheckCircle }} />
        <StatCard stat={{ label: 'On Hold', value: String(stats.onHold), change: 'Needs attention', trend: 'down', icon: AlertTriangle }} />
      </div>

      <Card noPadding className="overflow-hidden">
        <div className="p-4 border-b border-slate-100 flex flex-wrap gap-4 items-center justify-between bg-white">
          <Input
            variant="white"
            inputSize="sm"
            className="max-w-md rounded-full shadow-sm"
            placeholder="Search jobs by number, description, or customer..."
            value={globalSearch}
            onChange={(e) => setGlobalSearch(e.target.value)}
            icon={<Search size={14} className="text-slate-400" strokeWidth={2.5} />}
          />
        </div>

        <DataTable
          data={filteredJobs}
          columns={columns}
          rowKey={(j) => j.id}
          onRowClick={(j) => setSelectedJob(j)}
        />
      </Card>

      {/* Create Job Order Modal */}
      <Modal
        isOpen={isCreateJobOpen}
        onClose={() => setIsCreateJobOpen(false)}
        title="Create New Job Order"
        contentClassName="max-w-2xl"
        footer={
          <>
            <Button variant="ghost" size="sm" onClick={() => setIsCreateJobOpen(false)}>Cancel</Button>
            <Button size="sm" onClick={() => { showToast('Job order created successfully', 'success'); setIsCreateJobOpen(false); }}>Create Job Order</Button>
          </>
        }
      >
        <div className="space-y-4">
          <Input label="Job Number" required placeholder="e.g. JO-048" />
          <Input label="Description" required placeholder="e.g. Motor Controller Unit — 50 units" />
          <Input label="Customer" required placeholder="e.g. Tata Steel Ltd" />
          <div className="grid grid-cols-2 gap-4">
            <Input label="Quantity" type="number" required placeholder="e.g. 50" />
            <Select
              label="Unit"
              options={[
                { value: 'units', label: 'Units' },
                { value: 'kits', label: 'Kits' },
                { value: 'sets', label: 'Sets' },
                { value: 'pcs', label: 'Pieces' },
              ]}
              onChange={() => {}}
              placeholder="Select unit"
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <Input label="Start Date" type="date" required />
            <Input label="End Date" type="date" required />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <Select
              label="Priority"
              options={[
                { value: 'high', label: 'High' },
                { value: 'medium', label: 'Medium' },
                { value: 'low', label: 'Low' },
              ]}
              onChange={() => {}}
              placeholder="Select priority"
            />
            <Input label="Estimated Cost (₹)" type="number" placeholder="e.g. 1250000" />
          </div>
          <Select
            label="Job Size (if applicable)"
            options={JOB_SIZES}
            onChange={() => {}}
            placeholder="Select standard size"
          />
          <Input label="Remarks" placeholder="e.g. Rush order — expedite material procurement" />
        </div>
      </Modal>
    </PageLayout>
  );
};

export default JobsPage;
