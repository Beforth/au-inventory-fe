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
  Search, Plus, Edit, Eye, ShoppingCart, Clock, CheckCircle, AlertTriangle,
  Send, FileText, GitCompare, History, LayoutGrid, List, Copy
} from 'lucide-react';

interface PurchaseOrder {
  id: string;
  poNumber: string;
  vendor: string;
  date: string;
  totalAmount: string;
  status: string;
  itemCount: number;
  approvedBy: string;
  revision: string;
  leadTime: string;
  paymentTerms: string;
  lineItems: { item: string; qty: number; unitPrice: number }[];
}

interface MaterialRequisition {
  id: string;
  reqNo: string;
  requestedBy: string;
  department: string;
  date: string;
  itemCount: number;
  status: string;
  items: { item: string; qty: number; unit: string; justification: string }[];
}

interface VendorComparison {
  vendor: string;
  specs: string;
  price: string;
  qp: string;
  fp: string;
  rating: number;
}

const VENDORS = [
  { value: 'VND-001', label: 'SteelCorp Industries' },
  { value: 'VND-002', label: 'ElectroParts Pvt Ltd' },
  { value: 'VND-003', label: 'ChemSource Solutions' },
  { value: 'VND-004', label: 'SafeGear Co.' },
];

const EMPLOYEES = [
  { value: 'ramesh', label: 'Ramesh — Store' },
  { value: 'suresh', label: 'Suresh — Store' },
  { value: 'amit', label: 'Amit — Purchase' },
  { value: 'priya', label: 'Priya — Purchase' },
];

const DEPARTMENTS = [
  { value: 'production', label: 'Production' },
  { value: 'quality', label: 'Quality' },
  { value: 'maintenance', label: 'Maintenance' },
  { value: 'rd', label: 'R&D' },
];

const INITIAL_POS: PurchaseOrder[] = [
  { id: '1', poNumber: 'PO-2024-001', vendor: 'SteelCorp Industries', date: 'Jul 10, 2024', totalAmount: '₹1,45,000', status: 'Approved', itemCount: 4, approvedBy: 'Mr. Sharma', revision: '1', leadTime: '15 days', paymentTerms: '30 Days', lineItems: [{ item: 'Steel Sheet 3mm', qty: 20, unitPrice: 2800 }, { item: 'Aluminium Rod 10mm', qty: 100, unitPrice: 200 }] },
  { id: '2', poNumber: 'PO-2024-002', vendor: 'ElectroParts Pvt Ltd', date: 'Jul 12, 2024', totalAmount: '₹82,500', status: 'Pending', itemCount: 2, approvedBy: '—', revision: '1', leadTime: '10 days', paymentTerms: '15 Days', lineItems: [{ item: 'PLC-XYZ Control Module', qty: 10, unitPrice: 8500 }] },
  { id: '3', poNumber: 'PO-2024-003', vendor: 'ChemSource Solutions', date: 'Jul 15, 2024', totalAmount: '₹34,200', status: 'Draft', itemCount: 3, approvedBy: '—', revision: '1', leadTime: '7 days', paymentTerms: '45 Days', lineItems: [{ item: 'Chemical Powder X200', qty: 20, unitPrice: 1500 }] },
  { id: '4', poNumber: 'PO-2024-004', vendor: 'SteelCorp Industries', date: 'Jul 18, 2024', totalAmount: '₹2,10,000', status: 'Received', itemCount: 6, approvedBy: 'Mr. Sharma', revision: '2', leadTime: '15 days', paymentTerms: '30 Days', lineItems: [{ item: 'Steel Sheet 5mm', qty: 30, unitPrice: 3500 }] },
  { id: '5', poNumber: 'PO-2024-005', vendor: 'SafeGear Co.', date: 'Jul 20, 2024', totalAmount: '₹18,900', status: 'Approved', itemCount: 5, approvedBy: 'Ms. Gupta', revision: '1', leadTime: '5 days', paymentTerms: '30 Days', lineItems: [] },
  { id: '6', poNumber: 'PO-2024-006', vendor: 'ElectroParts Pvt Ltd', date: 'Jul 22, 2024', totalAmount: '₹56,000', status: 'Cancelled', itemCount: 1, approvedBy: '—', revision: '1', leadTime: '10 days', paymentTerms: '15 Days', lineItems: [] },
];

const INITIAL_REQUISITIONS: MaterialRequisition[] = [
  { id: '1', reqNo: 'MRF-2024-001', requestedBy: 'Ramesh', department: 'Production', date: 'Jul 14, 2024', itemCount: 3, status: 'Approved', items: [{ item: 'Copper Wire 2.5mm', qty: 50, unit: 'kg', justification: 'Regular production need' }, { item: 'Relay Switch 24V', qty: 100, unit: 'pcs', justification: 'Replenishment' }] },
  { id: '2', reqNo: 'MRF-2024-002', requestedBy: 'Suresh', department: 'Maintenance', date: 'Jul 16, 2024', itemCount: 1, status: 'Pending', items: [{ item: 'Cleaning Solvent 5L', qty: 20, unit: 'L', justification: 'Quarterly maintenance cleanup' }] },
  { id: '3', reqNo: 'MRF-2024-003', requestedBy: 'Amit', department: 'R&D', date: 'Jul 18, 2024', itemCount: 2, status: 'Draft', items: [{ item: 'PLC-XYZ Control Module', qty: 5, unit: 'pcs', justification: 'New prototype testing' }] },
];

const COMPARISON_DATA: VendorComparison[] = [
  { vendor: 'SteelCorp Industries', specs: 'IS 2062 Grade, 3mm thickness', price: '₹2,800/bundle', qp: 'Q1-2024', fp: 'FOB Faridabad', rating: 4 },
  { vendor: 'MetalWorks Ltd', specs: 'IS 2062 Grade, 3mm thickness', price: '₹2,650/bundle', qp: 'Q1-2024', fp: 'CIF Delhi', rating: 3 },
  { vendor: 'IronSource India', specs: 'IS 2062 Grade, 3.2mm thickness', price: '₹2,900/bundle', qp: 'Q2-2024', fp: 'FOB Faridabad', rating: 4 },
];

interface LineItem {
  item: string;
  qty: string;
  unitPrice: string;
}

export const ProcurementPage: React.FC = () => {
  const { showToast, globalSearch, setGlobalSearch } = useApp();
  const [activeView, setActiveView] = useState<'po' | 'kanban' | 'requisition' | 'comparison'>('po');
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isReqCreateOpen, setIsReqCreateOpen] = useState(false);
  const [isComparisonOpen, setIsComparisonOpen] = useState(false);
  const [isRevisionOpen, setIsRevisionOpen] = useState(false);
  const [filterStatus, setFilterStatus] = useState<string | undefined>(undefined);
  const [selectedPO, setSelectedPO] = useState<PurchaseOrder | null>(null);
  const [lineItems, setLineItems] = useState<LineItem[]>([{ item: '', qty: '', unitPrice: '' }]);
  const [poForm, setPoForm] = useState({ vendor: '', deliveryDate: '', notes: '', leadTime: '', paymentTerms: '' });
  const [reqForm, setReqForm] = useState<{ requestedBy: string; department: string; items: { item: string; qty: string; unit: string; justification: string }[] }>({ requestedBy: '', department: '', items: [{ item: '', qty: '', unit: '', justification: '' }] });

  const filteredPOs = useMemo(() => {
    return INITIAL_POS.filter(po => {
      const matchesSearch = po.poNumber.toLowerCase().includes(globalSearch.toLowerCase()) || po.vendor.toLowerCase().includes(globalSearch.toLowerCase());
      const matchesStatus = !filterStatus || po.status.toLowerCase() === filterStatus;
      return matchesSearch && matchesStatus;
    });
  }, [globalSearch, filterStatus]);

  const stats = useMemo(() => {
    const total = INITIAL_POS.length;
    const pending = INITIAL_POS.filter(p => p.status === 'Pending' || p.status === 'Draft').length;
    const active = INITIAL_POS.filter(p => p.status === 'Approved').length;
    const received = INITIAL_POS.filter(p => p.status === 'Received').length;
    return { total, pending, active, received };
  }, []);

  const addLineItem = () => setLineItems([...lineItems, { item: '', qty: '', unitPrice: '' }]);
  const removeLineItem = (index: number) => { if (lineItems.length > 1) setLineItems(lineItems.filter((_, i) => i !== index)); };
  const updateLineItem = (index: number, field: keyof LineItem, value: string) => { const updated = [...lineItems]; updated[index] = { ...updated[index], [field]: value }; setLineItems(updated); };

  const handleCreatePO = (e: React.FormEvent) => {
    e.preventDefault();
    showToast('Purchase Order created successfully', 'success');
    setIsCreateOpen(false);
    setLineItems([{ item: '', qty: '', unitPrice: '' }]);
    setPoForm({ vendor: '', deliveryDate: '', notes: '', leadTime: '', paymentTerms: '' });
  };

  const handleCreateReq = (e: React.FormEvent) => {
    e.preventDefault();
    showToast('Material Requisition submitted', 'success');
    setIsReqCreateOpen(false);
  };

  const poColumns: Column<PurchaseOrder>[] = [
    { key: 'poNumber', label: 'PO Number', render: (po) => <div className="flex items-center gap-2"><FileText size={14} className="text-slate-400" /><span className="text-xs font-bold text-blue-600">{po.poNumber}</span>{po.revision !== '1' && <Badge variant="warning" className="py-0 h-4 text-[9px]">Rev {po.revision}</Badge>}</div> },
    { key: 'vendor', label: 'Vendor', cellClassName: 'text-xs font-semibold text-slate-700' },
    { key: 'date', label: 'Date', cellClassName: 'text-xs font-semibold text-slate-400' },
    { key: 'itemCount', label: 'Items', align: 'center', cellClassName: 'text-xs font-bold text-slate-600 tabular-nums' },
    { key: 'totalAmount', label: 'Amount', align: 'right', cellClassName: 'text-xs font-bold text-slate-900 tabular-nums' },
    { key: 'approvedBy', label: 'Approved By', cellClassName: 'text-xs font-medium text-slate-500' },
    { key: 'status', label: 'Status', align: 'center', render: (po) => <Badge variant={po.status === 'Received' ? 'success' : po.status === 'Approved' ? 'default' : po.status === 'Pending' ? 'warning' : po.status === 'Cancelled' ? 'error' : 'default'} className="py-0 h-5 flex items-center justify-center w-fit mx-auto">{po.status}</Badge> },
    { key: 'actions', label: '', sortable: false, align: 'right', render: (po) => (
      <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
        <button onClick={(e) => { e.stopPropagation(); setSelectedPO(po); setIsRevisionOpen(true); }} className="p-1.5 hover:bg-slate-100 rounded-lg transition-colors text-slate-300 hover:text-slate-600"><Eye size={14} /></button>
        {po.status === 'Draft' && <button onClick={(e) => { e.stopPropagation(); showToast(`Editing ${po.poNumber}`, 'info'); }} className="p-1.5 hover:bg-blue-50 rounded-lg transition-colors text-slate-300 hover:text-blue-600"><Edit size={14} /></button>}
      </div>
    )},
  ];

  const reqColumns: Column<MaterialRequisition>[] = [
    { key: 'reqNo', label: 'Requisition #', render: (r) => <div className="flex items-center gap-2"><FileText size={14} className="text-slate-400" /><span className="text-xs font-bold text-blue-600">{r.reqNo}</span></div> },
    { key: 'requestedBy', label: 'Requested By', cellClassName: 'text-xs font-semibold text-slate-600' },
    { key: 'department', label: 'Department', cellClassName: 'text-xs font-semibold text-slate-500' },
    { key: 'date', label: 'Date', cellClassName: 'text-xs font-semibold text-slate-400' },
    { key: 'itemCount', label: 'Items', align: 'center', cellClassName: 'text-xs font-bold text-slate-600 tabular-nums' },
    { key: 'status', label: 'Status', align: 'center', render: (r) => <Badge variant={r.status === 'Approved' ? 'success' : r.status === 'Pending' ? 'warning' : 'default'} className="py-0 h-5 flex items-center justify-center w-fit mx-auto">{r.status}</Badge> },
  ];

  const kanbanColumns = ['Draft', 'Pending', 'Approved', 'Received', 'Cancelled'];

  const actions = (
    <div className="flex gap-2">
      <Button size="sm" onClick={() => setIsCreateOpen(true)} leftIcon={<Plus size={14} strokeWidth={3} />}>New Purchase Order</Button>
      <Button variant="outline" size="sm" onClick={() => setIsReqCreateOpen(true)} leftIcon={<FileText size={14} />}>New Requisition</Button>
    </div>
  );

  return (
    <PageLayout title="Procurement" description="Create, track, and manage all purchase orders and requisitions." actions={actions}>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard stat={{ label: 'Total POs', value: String(stats.total), change: 'All time', trend: 'neutral', icon: ShoppingCart }} />
        <StatCard stat={{ label: 'Pending', value: String(stats.pending), change: 'Awaiting approval', trend: 'down', icon: Clock }} />
        <StatCard stat={{ label: 'Active', value: String(stats.active), change: 'Approved orders', trend: 'up', icon: AlertTriangle }} />
        <StatCard stat={{ label: 'Received', value: String(stats.received), change: 'Successfully received', trend: 'up', icon: CheckCircle }} />
      </div>

      <div className="flex gap-2 mb-4">
        {[
          { key: 'po' as const, label: 'Purchase Orders', icon: List },
          { key: 'kanban' as const, label: 'Kanban Board', icon: LayoutGrid },
          { key: 'requisition' as const, label: 'Requisitions', icon: FileText },
          { key: 'comparison' as const, label: 'Vendor Comparison', icon: GitCompare },
        ].map((v) => (
          <button key={v.key} onClick={() => setActiveView(v.key)} className={`px-4 py-2.5 text-xs font-bold rounded-xl transition-all flex items-center gap-2 ${activeView === v.key ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/20' : 'bg-white text-slate-500 border border-slate-200 hover:border-slate-300'}`}>
            <v.icon size={14} />{v.label}
          </button>
        ))}
      </div>

      {activeView === 'po' && (
        <Card noPadding className="overflow-hidden">
          <div className="p-4 border-b border-slate-100 flex flex-wrap gap-4 items-center justify-between bg-white">
            <Input variant="white" inputSize="sm" className="max-w-md rounded-full shadow-sm" placeholder="Search by PO number or vendor..." value={globalSearch} onChange={(e) => setGlobalSearch(e.target.value)} icon={<Search size={14} className="text-slate-400" strokeWidth={2.5} />} />
            <div className="w-40">
              <Select options={[{ value: 'draft', label: 'Draft' }, { value: 'pending', label: 'Pending' }, { value: 'approved', label: 'Approved' }, { value: 'received', label: 'Received' }, { value: 'cancelled', label: 'Cancelled' }]} value={filterStatus} onChange={(val) => setFilterStatus(val as string)} placeholder="All Status" searchable={false} clearable inputSize="sm" />
            </div>
          </div>
          <DataTable data={filteredPOs} columns={poColumns} rowKey={(po) => po.id} onRowClick={(po) => { setSelectedPO(po); setIsRevisionOpen(true); }} />
        </Card>
      )}

      {activeView === 'kanban' && (
        <div className="grid grid-cols-5 gap-3">
          {kanbanColumns.map((col) => {
            const colPOs = INITIAL_POS.filter(p => p.status === col);
            const colColors: Record<string, string> = { Draft: 'border-slate-300 bg-slate-50', Pending: 'border-amber-300 bg-amber-50', Approved: 'border-blue-300 bg-blue-50', Received: 'border-emerald-300 bg-emerald-50', Cancelled: 'border-rose-300 bg-rose-50' };
            return (
              <div key={col} className={`rounded-xl border-2 ${colColors[col] || 'border-slate-200 bg-white'} p-3`}>
                <div className="flex items-center justify-between mb-3">
                  <h4 className="text-xs font-bold text-slate-700">{col}</h4>
                  <span className="text-[10px] font-bold text-slate-400 bg-white px-2 py-0.5 rounded-full">{colPOs.length}</span>
                </div>
                <div className="space-y-2">
                  {colPOs.map((po) => (
                    <div key={po.id} className="bg-white rounded-lg border border-slate-200 p-3 cursor-pointer hover:shadow-md transition-shadow" onClick={() => { setSelectedPO(po); setIsRevisionOpen(true); }}>
                      <p className="text-xs font-bold text-blue-600">{po.poNumber}</p>
                      <p className="text-[10px] font-semibold text-slate-500 mt-1">{po.vendor}</p>
                      <div className="flex items-center justify-between mt-2">
                        <span className="text-[10px] font-bold text-slate-900">{po.totalAmount}</span>
                        <span className="text-[10px] font-semibold text-slate-400">{po.date}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {activeView === 'requisition' && (
        <Card noPadding className="overflow-hidden">
          <div className="p-4 border-b border-slate-100 flex flex-wrap gap-4 items-center justify-between bg-white">
            <Input variant="white" inputSize="sm" className="max-w-md rounded-full shadow-sm" placeholder="Search requisitions..." value={globalSearch} onChange={(e) => setGlobalSearch(e.target.value)} icon={<Search size={14} className="text-slate-400" strokeWidth={2.5} />} />
            <Button size="sm" onClick={() => setIsReqCreateOpen(true)} leftIcon={<Plus size={14} strokeWidth={3} />}>New Requisition</Button>
          </div>
          <DataTable data={INITIAL_REQUISITIONS} columns={reqColumns} rowKey={(r) => r.id} />
        </Card>
      )}

      {activeView === 'comparison' && (
        <Card title="Vendor Comparison — Steel Sheet 3mm" description="Compare vendors before finalizing purchase">
          <div className="overflow-x-auto">
            <table className="w-full text-xs">
              <thead>
                <tr className="border-b border-slate-200">
                  <th className="text-left py-3 px-4 font-bold text-slate-500 uppercase">Criteria</th>
                  {COMPARISON_DATA.map((v) => <th key={v.vendor} className="text-left py-3 px-4 font-bold text-slate-700">{v.vendor}</th>)}
                  <th className="text-left py-3 px-4 font-bold text-blue-600 bg-blue-50">Finalized</th>
                </tr>
              </thead>
              <tbody>
                {[
                  { label: 'Specs', key: 'specs' as const },
                  { label: 'Price', key: 'price' as const },
                  { label: 'QP', key: 'qp' as const },
                  { label: 'FP', key: 'fp' as const },
                  { label: 'Rating', key: 'rating' as const },
                ].map((row) => (
                  <tr key={row.label} className="border-b border-slate-100">
                    <td className="py-3 px-4 font-bold text-slate-600">{row.label}</td>
                    {COMPARISON_DATA.map((v) => (
                      <td key={v.vendor} className="py-3 px-4 text-slate-600">{row.key === 'rating' ? `${v[row.key]}/5` : v[row.key]}</td>
                    ))}
                    <td className="py-3 px-4 bg-blue-50 text-slate-700 font-semibold">{row.key === 'rating' ? '—' : '—'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="mt-4 flex justify-end">
            <Button size="sm" onClick={() => showToast('Vendor finalized successfully', 'success')} leftIcon={<CheckCircle size={14} />}>Finalize Vendor</Button>
          </div>
        </Card>
      )}

      {/* Create PO Modal */}
      <Modal isOpen={isCreateOpen} onClose={() => setIsCreateOpen(false)} title="New Purchase Order" contentClassName="max-w-2xl"
        footer={<>
          <Button variant="ghost" size="sm" type="button" onClick={() => setIsCreateOpen(false)}>Cancel</Button>
          <Button variant="outline" size="sm" type="button" onClick={() => { showToast('PO saved as draft', 'info'); setIsCreateOpen(false); }}>Save Draft</Button>
          <Button size="sm" type="submit" form="po-form" leftIcon={<Send size={12} />}>Submit for Approval</Button>
        </>}
      >
        <form id="po-form" className="space-y-5" onSubmit={handleCreatePO}>
          <div className="grid grid-cols-2 gap-4">
            <Select label="Vendor" required options={VENDORS} value={poForm.vendor} onChange={(val) => setPoForm({ ...poForm, vendor: val as string })} placeholder="Select vendor" />
            <Input label="Delivery Date" type="date" value={poForm.deliveryDate} onChange={(e) => setPoForm({ ...poForm, deliveryDate: e.target.value })} />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <Input label="Lead Time (days)" type="number" placeholder="e.g. 15" value={poForm.leadTime} onChange={(e) => setPoForm({ ...poForm, leadTime: e.target.value })} />
            <Select label="Payment Terms" options={[{ value: 'advance', label: 'Advance' }, { value: 'net15', label: 'Net 15 Days' }, { value: 'net30', label: 'Net 30 Days' }, { value: 'net60', label: 'Net 60 Days' }, { value: 'net90', label: 'Net 90 Days' }]} value={poForm.paymentTerms} onChange={(val) => setPoForm({ ...poForm, paymentTerms: val as string })} placeholder="Select terms" />
          </div>
          <div>
            <label className="text-xs font-semibold text-slate-700 ml-0.5">Line Items</label>
            <div className="mt-2 border border-slate-200 rounded-xl overflow-hidden">
              <div className="grid grid-cols-12 gap-0 bg-slate-50 border-b border-slate-200 text-xs font-bold uppercase text-slate-400 tracking-wider">
                <div className="col-span-5 px-4 py-2.5">Item</div>
                <div className="col-span-2 px-4 py-2.5 text-center">Quantity</div>
                <div className="col-span-3 px-4 py-2.5 text-right">Unit Price</div>
                <div className="col-span-2 px-4 py-2.5 text-center">Action</div>
              </div>
              {lineItems.map((li, idx) => (
                <div key={idx} className="grid grid-cols-12 gap-0 border-b border-slate-100 last:border-b-0">
                  <div className="col-span-5 px-3 py-2">
                    <input type="text" placeholder="e.g. Copper Wire 2.5mm" value={li.item} onChange={(e) => updateLineItem(idx, 'item', e.target.value)} className="w-full px-3 py-2 text-xs font-medium border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" />
                  </div>
                  <div className="col-span-2 px-3 py-2">
                    <input type="number" placeholder="0" value={li.qty} onChange={(e) => updateLineItem(idx, 'qty', e.target.value)} className="w-full px-3 py-2 text-xs font-medium text-center border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none tabular-nums" />
                  </div>
                  <div className="col-span-3 px-3 py-2">
                    <input type="number" placeholder="0.00" value={li.unitPrice} onChange={(e) => updateLineItem(idx, 'unitPrice', e.target.value)} className="w-full px-3 py-2 text-xs font-medium text-right border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none tabular-nums" />
                  </div>
                  <div className="col-span-2 px-3 py-2 flex items-center justify-center">
                    <button type="button" onClick={() => removeLineItem(idx)} className="text-xs text-rose-400 hover:text-rose-600 font-medium px-2 py-1 rounded hover:bg-rose-50 transition-colors">Remove</button>
                  </div>
                </div>
              ))}
            </div>
            <button type="button" onClick={addLineItem} className="mt-2 text-xs font-semibold text-blue-600 hover:text-blue-700 flex items-center gap-1 transition-colors"><Plus size={12} strokeWidth={3} /> Add another item</button>
          </div>
          <Input label="Notes" placeholder="Any special instructions for this order..." value={poForm.notes} onChange={(e) => setPoForm({ ...poForm, notes: e.target.value })} />
          <div className="flex items-center gap-2 p-3 bg-blue-50 rounded-xl border border-blue-100">
            <Copy size={14} className="text-blue-500" />
            <span className="text-xs font-semibold text-blue-700">A copy of this PO will be sent to the Accounts Department for payment processing.</span>
          </div>
        </form>
      </Modal>

      {/* Create Requisition Modal */}
      <Modal isOpen={isReqCreateOpen} onClose={() => setIsReqCreateOpen(false)} title="Material Requisition Form" contentClassName="max-w-2xl"
        footer={<>
          <Button variant="ghost" size="sm" onClick={() => setIsReqCreateOpen(false)}>Cancel</Button>
          <Button size="sm" type="submit" form="req-form">Submit for Approval</Button>
        </>}
      >
        <form id="req-form" className="space-y-5" onSubmit={handleCreateReq}>
          <div className="grid grid-cols-2 gap-4">
            <Select label="Requested By" options={EMPLOYEES} value={reqForm.requestedBy} onChange={(val) => setReqForm({ ...reqForm, requestedBy: val as string })} placeholder="Select person" />
            <Select label="Department" options={DEPARTMENTS} value={reqForm.department} onChange={(val) => setReqForm({ ...reqForm, department: val as string })} placeholder="Select department" />
          </div>
          <div>
            <label className="text-xs font-semibold text-slate-700 ml-0.5">Items Required</label>
            <div className="mt-2 border border-slate-200 rounded-xl overflow-hidden">
              <div className="grid grid-cols-12 gap-0 bg-slate-50 border-b border-slate-200 text-xs font-bold uppercase text-slate-400 tracking-wider">
                <div className="col-span-4 px-4 py-2.5">Item</div>
                <div className="col-span-2 px-4 py-2.5 text-center">Qty</div>
                <div className="col-span-2 px-4 py-2.5 text-center">Unit</div>
                <div className="col-span-4 px-4 py-2.5">Justification</div>
              </div>
              {reqForm.items.map((item, idx) => (
                <div key={idx} className="grid grid-cols-12 gap-0 border-b border-slate-100 last:border-b-0">
                  <div className="col-span-4 px-3 py-2"><input type="text" placeholder="Item name" value={item.item} onChange={(e) => { const items = [...reqForm.items]; items[idx].item = e.target.value; setReqForm({ ...reqForm, items }); }} className="w-full px-3 py-2 text-xs font-medium border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" /></div>
                  <div className="col-span-2 px-3 py-2"><input type="number" placeholder="0" value={item.qty} onChange={(e) => { const items = [...reqForm.items]; items[idx].qty = e.target.value; setReqForm({ ...reqForm, items }); }} className="w-full px-3 py-2 text-xs font-medium text-center border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none tabular-nums" /></div>
                  <div className="col-span-2 px-3 py-2"><input type="text" placeholder="kg/pcs" value={item.unit} onChange={(e) => { const items = [...reqForm.items]; items[idx].unit = e.target.value; setReqForm({ ...reqForm, items }); }} className="w-full px-3 py-2 text-xs font-medium text-center border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" /></div>
                  <div className="col-span-4 px-3 py-2"><input type="text" placeholder="Why needed" value={item.justification} onChange={(e) => { const items = [...reqForm.items]; items[idx].justification = e.target.value; setReqForm({ ...reqForm, items }); }} className="w-full px-3 py-2 text-xs font-medium border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" /></div>
                </div>
              ))}
            </div>
            <button type="button" onClick={() => setReqForm({ ...reqForm, items: [...reqForm.items, { item: '', qty: '', unit: '', justification: '' }] })} className="mt-2 text-xs font-semibold text-blue-600 hover:text-blue-700 flex items-center gap-1 transition-colors"><Plus size={12} strokeWidth={3} /> Add item</button>
          </div>
        </form>
      </Modal>

      {/* PO Revision History Modal */}
      <Modal isOpen={isRevisionOpen} onClose={() => setIsRevisionOpen(false)} title={selectedPO ? `${selectedPO.poNumber} — Revision History` : 'PO Details'} contentClassName="max-w-2xl"
        footer={<Button variant="ghost" size="sm" onClick={() => setIsRevisionOpen(false)}>Close</Button>}
      >
        {selectedPO && (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              {[
                { label: 'Vendor', value: selectedPO.vendor },
                { label: 'Date', value: selectedPO.date },
                { label: 'Amount', value: selectedPO.totalAmount },
                { label: 'Status', value: selectedPO.status },
                { label: 'Lead Time', value: selectedPO.leadTime },
                { label: 'Payment Terms', value: selectedPO.paymentTerms },
                { label: 'Revision', value: `Rev ${selectedPO.revision}` },
                { label: 'Approved By', value: selectedPO.approvedBy },
              ].map((f) => (
                <div key={f.label} className="bg-slate-50 rounded-lg p-2.5 border border-slate-100">
                  <p className="text-[10px] font-bold text-slate-400 uppercase">{f.label}</p>
                  <p className="text-xs font-semibold text-slate-700 mt-0.5">{f.value}</p>
                </div>
              ))}
            </div>
            {selectedPO.lineItems.length > 0 && (
              <div>
                <p className="text-xs font-bold text-slate-700 mb-2">Line Items</p>
                <div className="border border-slate-200 rounded-xl overflow-hidden">
                  <div className="grid grid-cols-3 gap-0 bg-slate-50 border-b border-slate-200 text-xs font-bold uppercase text-slate-400">
                    <div className="px-4 py-2">Item</div>
                    <div className="px-4 py-2 text-center">Qty</div>
                    <div className="px-4 py-2 text-right">Unit Price</div>
                  </div>
                  {selectedPO.lineItems.map((li, idx) => (
                    <div key={idx} className="grid grid-cols-3 gap-0 border-b border-slate-100 last:border-b-0">
                      <div className="px-4 py-2 text-xs font-semibold text-slate-700">{li.item}</div>
                      <div className="px-4 py-2 text-xs font-bold text-slate-600 text-center tabular-nums">{li.qty}</div>
                      <div className="px-4 py-2 text-xs font-bold text-slate-600 text-right tabular-nums">₹{li.unitPrice.toLocaleString('en-IN')}</div>
                    </div>
                  ))}
                </div>
              </div>
            )}
            <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
              <p className="text-xs font-bold text-slate-700 mb-2">Revision Timeline</p>
              <div className="space-y-2">
                {Array.from({ length: parseInt(selectedPO.revision) }, (_, i) => i + 1).map((rev) => (
                  <div key={rev} className="flex items-center gap-3">
                    <div className={`w-2 h-2 rounded-full ${rev === parseInt(selectedPO.revision) ? 'bg-blue-600' : 'bg-slate-300'}`} />
                    <div>
                      <p className="text-xs font-bold text-slate-700">Revision {rev}</p>
                      <p className="text-[10px] font-semibold text-slate-400">{rev === 1 ? 'Created' : 'Updated'} — {selectedPO.date}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </Modal>
    </PageLayout>
  );
};

export default ProcurementPage;
