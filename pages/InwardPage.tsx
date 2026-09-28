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
  Truck,
  CheckCircle,
  Clock,
  AlertTriangle,
  Package,
  Camera,
  MapPin,
  FileText,
  Download,
  ArrowRight,
  ClipboardCheck,
  X
} from 'lucide-react';

interface POItem {
  id: string;
  name: string;
  orderedQty: number;
  unit: string;
  rate: number;
  gstPercent: number;
}

interface PurchaseOrder {
  id: string;
  poNumber: string;
  vendor: string;
  date: string;
  items: POItem[];
  totalValue: number;
}

interface ReceivedItem {
  name: string;
  expectedQty: number;
  receivedQty: string;
  acceptedQty: string;
  rejectedQty: string;
  condition: string;
  batchNumber: string;
  expiryDate: string;
  rackAssigned: string;
  qcStatus: string;
  qcRemarks: string;
}

interface GRN {
  id: string;
  grnNumber: string;
  poReference: string;
  vendor: string;
  receivedDate: string;
  itemCount: number;
  status: string;
  receivedBy: string;
  stockType: string;
  linkedJob: string;
  items: ReceivedItem[];
  totalValue: number;
  notes: string;
}

const PURCHASE_ORDERS: PurchaseOrder[] = [
  {
    id: '1',
    poNumber: 'PO-2024-001',
    vendor: 'SteelCorp Industries',
    date: 'Jul 10, 2024',
    totalValue: 385000,
    items: [
      { id: '1', name: 'Copper Wire 2.5mm (50 kg drum)', orderedQty: 50, unit: 'kg', rate: 420, gstPercent: 18 },
      { id: '2', name: 'Steel Sheet 3mm (bundle)', orderedQty: 20, unit: 'bundles', rate: 2800, gstPercent: 18 },
      { id: '3', name: 'Cable Tie Pack (box)', orderedQty: 10, unit: 'boxes', rate: 150, gstPercent: 12 },
      { id: '4', name: 'Terminal Block (pcs)', orderedQty: 100, unit: 'pcs', rate: 85, gstPercent: 18 },
    ],
  },
  {
    id: '2',
    poNumber: 'PO-2024-002',
    vendor: 'ElectroParts Pvt Ltd',
    date: 'Jul 15, 2024',
    totalValue: 172000,
    items: [
      { id: '5', name: 'PLC-XYZ Control Module', orderedQty: 25, unit: 'pcs', rate: 8500, gstPercent: 18 },
      { id: '6', name: 'Relay Switch 24V', orderedQty: 200, unit: 'pcs', rate: 350, gstPercent: 18 },
    ],
  },
  {
    id: '3',
    poNumber: 'PO-2024-004',
    vendor: 'SteelCorp Industries',
    date: 'Jul 20, 2024',
    totalValue: 61600,
    items: [
      { id: '7', name: 'Aluminium Rod 10mm', orderedQty: 40, unit: 'pcs', rate: 980, gstPercent: 18 },
      { id: '8', name: 'Steel Sheet 5mm (bundle)', orderedQty: 8, unit: 'bundles', rate: 4200, gstPercent: 18 },
      { id: '9', name: 'Copper Wire 4mm (drum)', orderedQty: 5, unit: 'drums', rate: 3500, gstPercent: 18 },
      { id: '10', name: 'Heat Shrink Tubing (m)', orderedQty: 200, unit: 'm', rate: 45, gstPercent: 12 },
      { id: '11', name: 'Safety Gloves (pack)', orderedQty: 10, unit: 'packs', rate: 600, gstPercent: 12 },
      { id: '12', name: 'Cleaning Solvent 5L', orderedQty: 8, unit: 'cans', rate: 750, gstPercent: 18 },
    ],
  },
];

const RACK_OPTIONS = [
  { value: 'G1-R01', label: 'G1-R01 — Zone A, Entry Side' },
  { value: 'G1-R02', label: 'G1-R02 — Zone A, Middle' },
  { value: 'G1-R03', label: 'G1-R03 — Zone B, Electrical' },
  { value: 'G1-R04', label: 'G1-R04 — Zone B, Chemical' },
  { value: 'G1-R05', label: 'G1-R05 — Zone C, Safety' },
  { value: 'G2-R01', label: 'G2-R01 — Annex, General' },
  { value: 'G2-R02', label: 'G2-R02 — Annex, Spares' },
  { value: 'G3-R01', label: 'G3-R01 — Remote Yard, Bulk' },
];

const JOB_OPTIONS = [
  { value: 'JO-045', label: 'JO-045 — Control Panel Assembly' },
  { value: 'JO-046', label: 'JO-046 — Wiring Harness Set' },
  { value: 'JO-047', label: 'JO-047 — Chemical Processing Unit' },
];

const INITIAL_GRNS: GRN[] = [
  {
    id: '1',
    grnNumber: 'GRN-2024-001',
    poReference: 'PO-2024-001',
    vendor: 'SteelCorp Industries',
    receivedDate: 'Jul 18, 2024',
    itemCount: 4,
    status: 'QC Passed',
    receivedBy: 'Ramesh',
    stockType: 'General Stock',
    linkedJob: '',
    totalValue: 385000,
    notes: 'All items received in good condition',
    items: [
      { name: 'Copper Wire 2.5mm (50 kg drum)', expectedQty: 50, receivedQty: '50', acceptedQty: '50', rejectedQty: '0', condition: 'good', batchNumber: 'B-2024-0718', expiryDate: '', rackAssigned: 'G1-R01', qcStatus: 'Passed', qcRemarks: 'Weight verified, packaging intact' },
      { name: 'Steel Sheet 3mm (bundle)', expectedQty: 20, receivedQty: '20', acceptedQty: '20', rejectedQty: '0', condition: 'good', batchNumber: 'B-2024-0718', expiryDate: '', rackAssigned: 'G1-R02', qcStatus: 'Passed', qcRemarks: 'Thickness verified at 3mm ±0.1' },
      { name: 'Cable Tie Pack (box)', expectedQty: 10, receivedQty: '10', acceptedQty: '10', rejectedQty: '0', condition: 'good', batchNumber: 'B-2024-0718', expiryDate: '', rackAssigned: 'G1-R05', qcStatus: 'Passed', qcRemarks: 'Count verified — 100 pcs per box' },
      { name: 'Terminal Block (pcs)', expectedQty: 100, receivedQty: '100', acceptedQty: '100', rejectedQty: '0', condition: 'good', batchNumber: 'B-2024-0718', expiryDate: '', rackAssigned: 'G1-R03', qcStatus: 'Passed', qcRemarks: 'Visual inspection passed' },
    ],
  },
  {
    id: '2',
    grnNumber: 'GRN-2024-002',
    poReference: 'PO-2024-004',
    vendor: 'SteelCorp Industries',
    receivedDate: 'Jul 22, 2024',
    itemCount: 6,
    status: 'Received',
    receivedBy: 'Suresh',
    stockType: 'Job-Linked (JO-045)',
    linkedJob: 'JO-045',
    totalValue: 61600,
    notes: 'Linked to Control Panel Assembly job',
    items: [
      { name: 'Aluminium Rod 10mm', expectedQty: 40, receivedQty: '40', acceptedQty: '38', rejectedQty: '2', condition: 'good', batchNumber: 'B-2024-0722', expiryDate: '', rackAssigned: 'G2-R01', qcStatus: 'Pending', qcRemarks: '' },
      { name: 'Steel Sheet 5mm (bundle)', expectedQty: 8, receivedQty: '8', acceptedQty: '8', rejectedQty: '0', condition: 'good', batchNumber: 'B-2024-0722', expiryDate: '', rackAssigned: 'G1-R02', qcStatus: 'Pending', qcRemarks: '' },
    ],
  },
  {
    id: '3',
    grnNumber: 'GRN-2024-003',
    poReference: 'PO-2024-002',
    vendor: 'ElectroParts Pvt Ltd',
    receivedDate: 'Jul 25, 2024',
    itemCount: 2,
    status: 'QC Pending',
    receivedBy: 'Ramesh',
    stockType: 'General Stock',
    linkedJob: '',
    totalValue: 172000,
    notes: 'Awaiting QC for PLC modules',
    items: [
      { name: 'PLC-XYZ Control Module', expectedQty: 25, receivedQty: '25', acceptedQty: '', rejectedQty: '', condition: 'good', batchNumber: '', expiryDate: '', rackAssigned: '', qcStatus: 'Pending', qcRemarks: '' },
      { name: 'Relay Switch 24V', expectedQty: 200, receivedQty: '200', acceptedQty: '', rejectedQty: '', condition: 'good', batchNumber: '', expiryDate: '', rackAssigned: '', qcStatus: 'Pending', qcRemarks: '' },
    ],
  },
  {
    id: '4',
    grnNumber: 'GRN-2024-004',
    poReference: 'PO-2024-001',
    vendor: 'SteelCorp Industries',
    receivedDate: 'Jul 26, 2024',
    itemCount: 1,
    status: 'Damaged',
    receivedBy: 'Suresh',
    stockType: 'General Stock',
    linkedJob: '',
    totalValue: 28000,
    notes: 'Steel sheets had dented corners — damage report filed',
    items: [
      { name: 'Steel Sheet 3mm (bundle)', expectedQty: 5, receivedQty: '5', acceptedQty: '3', rejectedQty: '2', condition: 'damaged', batchNumber: 'B-2024-0726', expiryDate: '', rackAssigned: '', qcStatus: 'Rejected', qcRemarks: '2 bundles with bent corners, unusable' },
    ],
  },
];

export const InwardPage: React.FC = () => {
  const { showToast, globalSearch, setGlobalSearch } = useApp();
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [isDamageOpen, setIsDamageOpen] = useState(false);
  const [selectedGRN, setSelectedGRN] = useState<GRN | null>(null);
  const [step, setStep] = useState(1);
  const [selectedPO, setSelectedPO] = useState<string | undefined>(undefined);
  const [stockType, setStockType] = useState<string>('general');
  const [linkedJob, setLinkedJob] = useState<string | undefined>(undefined);
  const [damageGrn, setDamageGrn] = useState<string | undefined>(undefined);

  const [receivedItems, setReceivedItems] = useState<ReceivedItem[]>([]);

  const filteredGRNs = useMemo(() => {
    return INITIAL_GRNS.filter(g =>
      g.grnNumber.toLowerCase().includes(globalSearch.toLowerCase()) ||
      g.poReference.toLowerCase().includes(globalSearch.toLowerCase()) ||
      g.vendor.toLowerCase().includes(globalSearch.toLowerCase())
    );
  }, [globalSearch]);

  const stats = useMemo(() => {
    const total = INITIAL_GRNS.length;
    const received = INITIAL_GRNS.filter(g => g.status === 'Received' || g.status === 'QC Passed').length;
    const pending = INITIAL_GRNS.filter(g => g.status === 'QC Pending').length;
    const damaged = INITIAL_GRNS.filter(g => g.status === 'Damaged').length;
    return { total, received, pending, damaged };
  }, []);

  const selectedPOData = PURCHASE_ORDERS.find(p => p.poNumber === selectedPO);

  const handlePOSelect = (poNum: string) => {
    setSelectedPO(poNum);
    const po = PURCHASE_ORDERS.find(p => p.poNumber === poNum);
    if (po) {
      setReceivedItems(
        po.items.map(item => ({
          name: item.name,
          expectedQty: item.orderedQty,
          receivedQty: '',
          acceptedQty: '',
          rejectedQty: '',
          condition: 'good',
          batchNumber: '',
          expiryDate: '',
          rackAssigned: '',
          qcStatus: 'Pending',
          qcRemarks: '',
        }))
      );
    }
  };

  const handleCreateGRN = (e: React.FormEvent) => {
    e.preventDefault();
    if (step < 3) {
      setStep(step + 1);
      return;
    }
    showToast('GRN created and stock updated successfully', 'success');
    setIsCreateOpen(false);
    setStep(1);
    setSelectedPO(undefined);
    setStockType('general');
    setLinkedJob(undefined);
    setReceivedItems([]);
  };

  const updateReceivedItem = (index: number, field: keyof ReceivedItem, value: string | number) => {
    const updated = [...receivedItems];
    updated[index] = { ...updated[index], [field]: value };
    setReceivedItems(updated);
  };

  const handleViewGRN = (grn: GRN) => {
    setSelectedGRN(grn);
    setIsDetailOpen(true);
  };

  const columns: Column<GRN>[] = [
    {
      key: 'grnNumber',
      label: 'GRN Number',
      render: (g) => (
        <div className="flex items-center gap-2">
          <Truck size={14} className="text-slate-400" />
          <span className="text-xs font-bold text-blue-600">{g.grnNumber}</span>
        </div>
      )
    },
    {
      key: 'poReference',
      label: 'PO Reference',
      cellClassName: 'text-xs font-semibold text-slate-600 font-mono'
    },
    {
      key: 'vendor',
      label: 'Vendor',
      cellClassName: 'text-xs font-semibold text-slate-700'
    },
    {
      key: 'receivedDate',
      label: 'Received',
      cellClassName: 'text-xs font-semibold text-slate-400'
    },
    {
      key: 'itemCount',
      label: 'Items',
      align: 'center',
      cellClassName: 'text-xs font-bold text-slate-600 tabular-nums'
    },
    {
      key: 'stockType',
      label: 'Stock Type',
      render: (g) => (
        <span className={`text-xs font-semibold ${g.stockType.includes('Job-Linked') ? 'text-purple-600' : 'text-slate-500'}`}>
          {g.stockType}
        </span>
      )
    },
    {
      key: 'status',
      label: 'Status',
      align: 'center',
      render: (g) => (
        <Badge
          variant={
            g.status === 'QC Passed' || g.status === 'Received' ? 'success' :
              g.status === 'QC Pending' ? 'warning' : 'error'
          }
          className="py-0 h-5 flex items-center justify-center w-fit mx-auto"
        >
          {g.status}
        </Badge>
      )
    },
    {
      key: 'actions',
      label: '',
      sortable: false,
      align: 'right',
      render: (g) => (
        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
          <button
            onClick={(e) => { e.stopPropagation(); handleViewGRN(g); }}
            className="p-1.5 hover:bg-slate-100 rounded-lg transition-colors text-slate-300 hover:text-slate-600"
          >
            <Eye size={14} />
          </button>
        </div>
      )
    }
  ];

  const actions = (
    <div className="flex gap-2">
      <Button
        variant="outline"
        size="sm"
        onClick={() => setIsDamageOpen(true)}
        leftIcon={<AlertTriangle size={14} />}
      >
        Report Damage
      </Button>
      <Button
        size="sm"
        onClick={() => setIsCreateOpen(true)}
        leftIcon={<Plus size={14} strokeWidth={3} />}
      >
        New GRN
      </Button>
    </div>
  );

  return (
    <PageLayout
      title="Material Inward"
      description="Log incoming deliveries and create Goods Receipt Notes."
      actions={actions}
    >
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard stat={{ label: 'Total GRNs', value: String(stats.total), change: 'All receipts', trend: 'neutral', icon: Truck }} />
        <StatCard stat={{ label: 'Received', value: String(stats.received), change: 'Stock updated', trend: 'up', icon: CheckCircle }} />
        <StatCard stat={{ label: 'QC Pending', value: String(stats.pending), change: 'Awaiting check', trend: 'down', icon: Clock }} />
        <StatCard stat={{ label: 'Damaged', value: String(stats.damaged), change: 'Needs action', trend: 'down', icon: AlertTriangle }} />
      </div>

      <Card noPadding className="overflow-hidden">
        <div className="p-4 border-b border-slate-100 flex flex-wrap gap-4 items-center justify-between bg-white">
          <Input
            variant="white"
            inputSize="sm"
            className="max-w-md rounded-full shadow-sm"
            placeholder="Search GRN or PO number..."
            value={globalSearch}
            onChange={(e) => setGlobalSearch(e.target.value)}
            icon={<Search size={14} className="text-slate-400" strokeWidth={2.5} />}
          />
        </div>

        <DataTable
          data={filteredGRNs}
          columns={columns}
          rowKey={(g) => g.id}
          onRowClick={(g) => handleViewGRN(g)}
        />
      </Card>

      {/* Create GRN Wizard */}
      <Modal
        isOpen={isCreateOpen}
        onClose={() => { setIsCreateOpen(false); setStep(1); setSelectedPO(undefined); setStockType('general'); setLinkedJob(undefined); setReceivedItems([]); }}
        title={`New GRN — Step ${step} of 3`}
        contentClassName="max-w-3xl"
        footer={
          <>
            <Button variant="ghost" size="sm" type="button" onClick={() => step > 1 ? setStep(step - 1) : setIsCreateOpen(false)}>
              {step > 1 ? 'Back' : 'Cancel'}
            </Button>
            <Button size="sm" type="submit" form="grn-form">
              {step < 3 ? 'Next Step' : 'Create GRN'}
            </Button>
          </>
        }
      >
        <form id="grn-form" className="space-y-5" onSubmit={handleCreateGRN}>
          <div className="flex gap-2 mb-4">
            {[1, 2, 3].map(s => (
              <div key={s} className="flex-1 h-1.5 rounded-full transition-colors bg-slate-200">
                <div className={`h-full rounded-full transition-colors ${s <= step ? 'bg-blue-600' : 'bg-slate-200'}`} style={{ width: s < step ? '100%' : s === step ? '50%' : '0%' }} />
              </div>
            ))}
          </div>

          {step === 1 && (
            <>
              <p className="text-xs font-bold text-slate-900">Select Purchase Order</p>
              <Select
                label="PO Reference"
                required
                options={PURCHASE_ORDERS.map(po => ({
                  value: po.poNumber,
                  label: `${po.poNumber} — ${po.vendor} (₹${po.totalValue.toLocaleString('en-IN')})`,
                }))}
                value={selectedPO}
                onChange={(val) => handlePOSelect(val as string)}
                placeholder="Choose the PO this delivery belongs to"
              />

              {selectedPOData && (
                <div className="bg-slate-50 border border-slate-100 rounded-xl p-4">
                  <p className="text-xs font-bold text-slate-700 mb-2">PO Items ({selectedPOData.items.length})</p>
                  <div className="space-y-1">
                    {selectedPOData.items.map(item => (
                      <div key={item.id} className="flex items-center justify-between text-xs">
                        <span className="text-slate-600 font-medium">{item.name}</span>
                        <span className="font-bold text-slate-800 tabular-nums">{item.orderedQty} {item.unit}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-700 ml-0.5">Stock Type</label>
                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={() => { setStockType('general'); setLinkedJob(undefined); }}
                      className={`flex-1 px-4 py-3 rounded-xl border text-xs font-bold transition-all ${
                        stockType === 'general'
                          ? 'bg-blue-50 border-blue-300 text-blue-700'
                          : 'bg-white border-slate-200 text-slate-500 hover:border-slate-300'
                      }`}
                    >
                      General Stock
                    </button>
                    <button
                      type="button"
                      onClick={() => setStockType('job')}
                      className={`flex-1 px-4 py-3 rounded-xl border text-xs font-bold transition-all ${
                        stockType === 'job'
                          ? 'bg-purple-50 border-purple-300 text-purple-700'
                          : 'bg-white border-slate-200 text-slate-500 hover:border-slate-300'
                      }`}
                    >
                      Job-Linked
                    </button>
                  </div>
                </div>
                {stockType === 'job' && (
                  <Select
                    label="Job Order"
                    options={JOB_OPTIONS}
                    value={linkedJob}
                    onChange={(val) => setLinkedJob(val as string)}
                    placeholder="Select job order"
                  />
                )}
              </div>
            </>
          )}

          {step === 2 && (
            <>
              <p className="text-xs font-bold text-slate-900">Enter Received Quantities & QC Inspection</p>
              <div className="border border-slate-200 rounded-xl overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full min-w-[800px]">
                    <thead>
                      <tr className="bg-slate-50 border-b border-slate-200 text-xs font-bold uppercase text-slate-400 tracking-wider">
                        <th className="px-4 py-2.5 text-left w-[20%]">Item</th>
                        <th className="px-2 py-2.5 text-center w-[8%]">Expected</th>
                        <th className="px-2 py-2.5 text-center w-[8%]">Received</th>
                        <th className="px-2 py-2.5 text-center w-[8%]">Accepted</th>
                        <th className="px-2 py-2.5 text-center w-[8%]">Rejected</th>
                        <th className="px-2 py-2.5 text-left w-[12%]">Batch #</th>
                        <th className="px-2 py-2.5 text-left w-[12%]">Rack</th>
                        <th className="px-2 py-2.5 text-center w-[8%]">QC</th>
                        <th className="px-2 py-2.5 text-center w-[8%]">Condition</th>
                      </tr>
                    </thead>
                    <tbody>
                      {receivedItems.map((ri, idx) => (
                        <tr key={idx} className="border-b border-slate-100 last:border-b-0 items-center">
                          <td className="px-4 py-2">
                            <span className="text-xs font-semibold text-slate-700">{ri.name}</span>
                          </td>
                          <td className="px-2 py-2 text-center">
                            <span className="text-xs font-bold text-slate-500 tabular-nums">{ri.expectedQty}</span>
                          </td>
                          <td className="px-1 py-2">
                            <input
                              type="number"
                              placeholder="0"
                              value={ri.receivedQty}
                              onChange={(e) => updateReceivedItem(idx, 'receivedQty', e.target.value)}
                              className="w-full px-2 py-1.5 text-xs font-medium text-center border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none tabular-nums"
                            />
                          </td>
                          <td className="px-1 py-2">
                            <input
                              type="number"
                              placeholder="0"
                              value={ri.acceptedQty}
                              onChange={(e) => updateReceivedItem(idx, 'acceptedQty', e.target.value)}
                              className="w-full px-2 py-1.5 text-xs font-medium text-center border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none tabular-nums"
                            />
                          </td>
                          <td className="px-1 py-2">
                            <input
                              type="number"
                              placeholder="0"
                              value={ri.rejectedQty}
                              onChange={(e) => updateReceivedItem(idx, 'rejectedQty', e.target.value)}
                              className="w-full px-2 py-1.5 text-xs font-medium text-center border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none tabular-nums"
                            />
                          </td>
                          <td className="px-1 py-2">
                            <input
                              type="text"
                              placeholder="Batch #"
                              value={ri.batchNumber}
                              onChange={(e) => updateReceivedItem(idx, 'batchNumber', e.target.value)}
                              className="w-full px-2 py-1.5 text-xs font-medium border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                            />
                          </td>
                          <td className="px-1 py-2">
                            <select
                              value={ri.rackAssigned}
                              onChange={(e) => updateReceivedItem(idx, 'rackAssigned', e.target.value)}
                              className="w-full px-2 py-1.5 text-xs font-medium border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                            >
                              <option value="">Assign rack...</option>
                              {RACK_OPTIONS.map(r => (
                                <option key={r.value} value={r.value}>{r.value}</option>
                              ))}
                            </select>
                          </td>
                          <td className="px-1 py-2 text-center">
                            <select
                              value={ri.qcStatus}
                              onChange={(e) => updateReceivedItem(idx, 'qcStatus', e.target.value)}
                              className="w-full px-2 py-1.5 text-xs font-medium border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                            >
                              <option value="Pending">Pending</option>
                              <option value="Passed">Passed</option>
                              <option value="Failed">Failed</option>
                            </select>
                          </td>
                          <td className="px-1 py-2 text-center">
                            <select
                              value={ri.condition}
                              onChange={(e) => updateReceivedItem(idx, 'condition', e.target.value)}
                              className="w-full px-2 py-1.5 text-xs font-medium border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                            >
                              <option value="good">Good</option>
                              <option value="damaged">Damaged</option>
                            </select>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </>
          )}

          {step === 3 && (
            <>
              <p className="text-xs font-bold text-slate-900">Review & Confirm</p>
              <div className="bg-slate-50 rounded-xl p-4 space-y-3 border border-slate-100">
                <div className="flex justify-between text-xs">
                  <span className="text-slate-500">PO Reference</span>
                  <span className="font-bold text-slate-900">{selectedPO}</span>
                </div>
                <div className="flex justify-between text-xs">
                  <span className="text-slate-500">Vendor</span>
                  <span className="font-bold text-slate-900">{selectedPOData?.vendor}</span>
                </div>
                <div className="flex justify-between text-xs">
                  <span className="text-slate-500">Stock Type</span>
                  <span className="font-bold text-slate-900">{stockType === 'general' ? 'General Stock' : `Job-Linked (${linkedJob})`}</span>
                </div>
                <div className="flex justify-between text-xs">
                  <span className="text-slate-500">Total Items</span>
                  <span className="font-bold text-slate-900">{receivedItems.length} items</span>
                </div>
                <div className="flex justify-between text-xs">
                  <span className="text-slate-500">Total Value</span>
                  <span className="font-bold text-slate-900">₹{selectedPOData?.totalValue.toLocaleString('en-IN')}</span>
                </div>
              </div>

              <div className="space-y-2">
                <p className="text-xs font-bold text-slate-700">Item Summary</p>
                {receivedItems.map((ri, idx) => (
                  <div key={idx} className="flex items-center justify-between bg-white border border-slate-100 rounded-lg px-3 py-2">
                    <span className="text-xs font-medium text-slate-600">{ri.name}</span>
                    <div className="flex items-center gap-3 text-xs">
                      <span className="tabular-nums"><span className="text-slate-400">Recv:</span> <span className="font-bold text-slate-800">{ri.receivedQty || '—'}</span></span>
                      <span className="tabular-nums"><span className="text-slate-400">Acc:</span> <span className="font-bold text-emerald-600">{ri.acceptedQty || '—'}</span></span>
                      {ri.rackAssigned && (
                        <span className="flex items-center gap-1 text-blue-600 font-semibold">
                          <MapPin size={10} /> {ri.rackAssigned}
                        </span>
                      )}
                    </div>
                  </div>
                ))}
              </div>

              <div className="bg-blue-50 border border-blue-100 rounded-xl p-3 text-xs text-blue-700 font-medium flex items-start gap-2">
                <CheckCircle size={14} className="mt-0.5 flex-shrink-0" />
                <span>Stock will be updated and rack locations assigned upon GRN creation. QC results will be logged.</span>
              </div>
            </>
          )}
        </form>
      </Modal>

      {/* GRN Detail View */}
      <Modal
        isOpen={isDetailOpen}
        onClose={() => { setIsDetailOpen(false); setSelectedGRN(null); }}
        title={selectedGRN ? `${selectedGRN.grnNumber} — Detail View` : 'GRN Detail'}
        contentClassName="max-w-3xl"
        footer={
          <>
            <Button variant="ghost" size="sm" onClick={() => { setIsDetailOpen(false); setSelectedGRN(null); }}>Close</Button>
            <Button variant="outline" size="sm" onClick={() => showToast('Downloading GRN report...', 'info')} leftIcon={<Download size={14} />}>
              Export PDF
            </Button>
          </>
        }
      >
        {selectedGRN && (
          <div className="space-y-5">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              <div className="bg-slate-50 rounded-xl p-3 text-center">
                <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1">Status</p>
                <Badge
                  variant={
                    selectedGRN.status === 'QC Passed' || selectedGRN.status === 'Received' ? 'success' :
                      selectedGRN.status === 'QC Pending' ? 'warning' : 'error'
                  }
                >
                  {selectedGRN.status}
                </Badge>
              </div>
              <div className="bg-slate-50 rounded-xl p-3 text-center">
                <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1">PO Ref</p>
                <p className="text-xs font-bold text-slate-900">{selectedGRN.poReference}</p>
              </div>
              <div className="bg-slate-50 rounded-xl p-3 text-center">
                <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1">Received By</p>
                <p className="text-xs font-bold text-slate-900">{selectedGRN.receivedBy}</p>
              </div>
              <div className="bg-slate-50 rounded-xl p-3 text-center">
                <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1">Value</p>
                <p className="text-xs font-bold text-slate-900 tabular-nums">₹{selectedGRN.totalValue.toLocaleString('en-IN')}</p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3 text-xs">
              <div>
                <span className="text-slate-400 font-medium">Vendor:</span>
                <span className="ml-2 font-bold text-slate-800">{selectedGRN.vendor}</span>
              </div>
              <div>
                <span className="text-slate-400 font-medium">Date:</span>
                <span className="ml-2 font-bold text-slate-800">{selectedGRN.receivedDate}</span>
              </div>
              <div>
                <span className="text-slate-400 font-medium">Stock Type:</span>
                <span className="ml-2 font-bold text-slate-800">{selectedGRN.stockType}</span>
              </div>
              {selectedGRN.linkedJob && (
                <div>
                  <span className="text-slate-400 font-medium">Linked Job:</span>
                  <span className="ml-2 font-bold text-purple-600">{selectedGRN.linkedJob}</span>
                </div>
              )}
            </div>

            {selectedGRN.notes && (
              <div className="bg-amber-50 border border-amber-100 rounded-xl p-3 text-xs text-amber-700 font-medium">
                {selectedGRN.notes}
              </div>
            )}

            <div>
              <p className="text-xs font-bold text-slate-900 mb-2">Received Items ({selectedGRN.items.length})</p>
              <div className="border border-slate-200 rounded-xl overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full min-w-[700px]">
                    <thead>
                      <tr className="bg-slate-50 border-b border-slate-200 text-[10px] font-bold uppercase text-slate-400 tracking-wider">
                        <th className="px-4 py-2 text-left">Item</th>
                        <th className="px-2 py-2 text-center">Recv</th>
                        <th className="px-2 py-2 text-center">Accepted</th>
                        <th className="px-2 py-2 text-center">Rejected</th>
                        <th className="px-2 py-2 text-left">Batch</th>
                        <th className="px-2 py-2 text-left">Rack</th>
                        <th className="px-2 py-2 text-center">QC</th>
                      </tr>
                    </thead>
                    <tbody>
                      {selectedGRN.items.map((item, idx) => (
                        <tr key={idx} className="border-b border-slate-100 last:border-b-0">
                          <td className="px-4 py-2 text-xs font-semibold text-slate-700">{item.name}</td>
                          <td className="px-2 py-2 text-xs font-bold text-slate-600 text-center tabular-nums">{item.receivedQty || '—'}</td>
                          <td className="px-2 py-2 text-xs font-bold text-emerald-600 text-center tabular-nums">{item.acceptedQty || '—'}</td>
                          <td className="px-2 py-2 text-xs font-bold text-center tabular-nums">
                            {item.rejectedQty && parseInt(item.rejectedQty) > 0 ? (
                              <span className="text-rose-500">{item.rejectedQty}</span>
                            ) : (
                              <span className="text-slate-300">—</span>
                            )}
                          </td>
                          <td className="px-2 py-2 text-xs font-mono text-slate-500">{item.batchNumber || '—'}</td>
                          <td className="px-2 py-2">
                            {item.rackAssigned ? (
                              <span className="text-xs font-bold text-blue-600 flex items-center gap-1">
                                <MapPin size={10} /> {item.rackAssigned}
                              </span>
                            ) : (
                              <span className="text-xs text-slate-300">Unassigned</span>
                            )}
                          </td>
                          <td className="px-2 py-2 text-center">
                            <Badge
                              variant={
                                item.qcStatus === 'Passed' ? 'success' :
                                  item.qcStatus === 'Failed' || item.qcStatus === 'Rejected' ? 'error' : 'warning'
                              }
                              className="py-0 h-4 text-[9px]"
                            >
                              {item.qcStatus}
                            </Badge>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>

            {selectedGRN.status === 'QC Pending' && (
              <div className="flex gap-2">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => { showToast('QC inspection initiated for all pending items', 'success'); setIsDetailOpen(false); }}
                  leftIcon={<ClipboardCheck size={14} />}
                >
                  Start QC Inspection
                </Button>
              </div>
            )}
          </div>
        )}
      </Modal>

      {/* Report Damage Modal */}
      <Modal
        isOpen={isDamageOpen}
        onClose={() => setIsDamageOpen(false)}
        title="Report Damaged Goods"
        footer={
          <>
            <Button variant="ghost" size="sm" onClick={() => setIsDamageOpen(false)}>Cancel</Button>
            <Button size="sm" onClick={() => { showToast('Damage report sent to vendor', 'success'); setIsDamageOpen(false); setDamageGrn(undefined); }}>Send Report</Button>
          </>
        }
      >
        <div className="space-y-4">
          <Select
            label="Select GRN"
            options={INITIAL_GRNS.filter(g => g.status === 'Damaged' || g.items.some(i => i.condition === 'damaged')).map(g => ({ value: g.id, label: `${g.grnNumber} — ${g.vendor}` }))}
            value={damageGrn}
            onChange={(val) => setDamageGrn(val as string)}
            placeholder="Choose the GRN with damage"
          />
          <Input label="Description of Damage" placeholder="e.g. 3 items had dented packaging, contents leaked" />
          <div className="space-y-2">
            <label className="text-xs font-semibold text-slate-700 ml-0.5">Photos</label>
            <div className="border-2 border-dashed border-slate-200 rounded-xl p-8 text-center hover:border-blue-300 transition-colors cursor-pointer">
              <Camera size={24} className="text-slate-300 mx-auto mb-2" />
              <p className="text-xs font-bold text-slate-400">Click to upload photos</p>
              <p className="text-xs text-slate-300 mt-1">PNG, JPG up to 10MB each</p>
            </div>
          </div>
          <div className="bg-rose-50 border border-rose-100 rounded-xl p-3 text-xs text-rose-700 font-medium flex items-start gap-2">
            <AlertTriangle size={14} className="mt-0.5 flex-shrink-0" />
            <span>The vendor will be notified and a debit note may be raised for damaged goods.</span>
          </div>
        </div>
      </Modal>
    </PageLayout>
  );
};

export default InwardPage;
