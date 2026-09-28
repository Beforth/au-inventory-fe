import React, { useState, useMemo } from 'react';
import { Card } from '../components/ui/Card';
import { StatCard } from '../components/ui/StatCard';
import { Badge } from '../components/ui/Badge';
import { DataTable, Column } from '../components/ui/DataTable';
import { Input } from '../components/ui/Input';
import { Button } from '../components/ui/Button';
import { Modal } from '../components/ui/Modal';
import { PageLayout } from '../components/layout/PageLayout';
import { Select } from '../components/ui/Select';
import { useApp } from '../App';
import {
  Search,
  Download,
  Plus,
  Package,
  Box,
  Edit,
  Trash2,
  AlertTriangle,
  Barcode,
  History,
  ArrowRightLeft
} from 'lucide-react';

interface Item {
  id: string;
  code: string;
  name: string;
  category: string;
  subCategory: string;
  uom: string;
  minStock: number;
  currentStock: number;
  type: string;
  status: string;
  gst: string;
  hsnCode: string;
  unitConversion: string;
  vendor: string;
  criticality: string;
  barcode: string;
  rateHistory: { date: string; rate: string; changedBy: string }[];
  grnHistory: { grnNo: string; date: string; qty: number; poRef: string }[];
}

const CATEGORIES = [
  { value: 'raw-material', label: 'Raw Material' },
  { value: 'consumable', label: 'Consumable' },
  { value: 'spare-part', label: 'Spare Part' },
  { value: 'tool', label: 'Tool' },
  { value: 'fixed-asset', label: 'Fixed Asset' },
  { value: 'housekeeping', label: 'Housekeeping' },
  { value: 'finished-goods', label: 'Finished Goods' },
];

const ITEM_TYPES = [
  { value: 'oem', label: 'OEM' },
  { value: 'modified-oem', label: 'Modified OEM' },
];

const UOM_OPTIONS = [
  { value: 'kg', label: 'Kilogram (kg)' },
  { value: 'g', label: 'Gram (g)' },
  { value: 'l', label: 'Litre (L)' },
  { value: 'ml', label: 'Millilitre (mL)' },
  { value: 'pcs', label: 'Pieces (pcs)' },
  { value: 'box', label: 'Box' },
  { value: 'drum', label: 'Drum' },
  { value: 'm', label: 'Metre (m)' },
  { value: 'ft', label: 'Foot (ft)' },
  { value: 'roll', label: 'Roll' },
];

const CRITICALITY_OPTIONS = [
  { value: 'critical', label: 'Critical' },
  { value: 'high', label: 'High' },
  { value: 'medium', label: 'Medium' },
  { value: 'low', label: 'Low' },
];

const VENDOR_OPTIONS = [
  { value: 'VND-001', label: 'SteelCorp Industries' },
  { value: 'VND-002', label: 'ElectroParts Pvt Ltd' },
  { value: 'VND-003', label: 'ChemSource Solutions' },
  { value: 'VND-004', label: 'SafeGear Co.' },
];

const INITIAL_ITEMS: Item[] = [
  { id: '1', code: 'RM-001', name: 'Copper Wire 2.5mm', category: 'Raw Material', subCategory: 'Electrical', uom: 'kg', minStock: 50, currentStock: 120, type: 'OEM', status: 'In Stock', gst: '18', hsnCode: '8544', unitConversion: '1 drum = 200 kg', vendor: 'VND-002', criticality: 'high', barcode: 'AU-RM-001', rateHistory: [{ date: 'Jul 2024', rate: '₹420/kg', changedBy: 'Purchase Dept' }, { date: 'Apr 2024', rate: '₹400/kg', changedBy: 'Purchase Dept' }], grnHistory: [{ grnNo: 'GRN-2024-001', date: 'Jul 18, 2024', qty: 50, poRef: 'PO-2024-001' }] },
  { id: '2', code: 'RM-002', name: 'Steel Sheet 3mm', category: 'Raw Material', subCategory: 'Structural', uom: 'kg', minStock: 100, currentStock: 85, type: 'OEM', status: 'In Stock', gst: '18', hsnCode: '7208', unitConversion: '1 bundle = 50 kg', vendor: 'VND-001', criticality: 'critical', barcode: 'AU-RM-002', rateHistory: [{ date: 'Jul 2024', rate: '₹2,800/bundle', changedBy: 'Purchase Dept' }], grnHistory: [{ grnNo: 'GRN-2024-001', date: 'Jul 18, 2024', qty: 20, poRef: 'PO-2024-001' }] },
  { id: '3', code: 'RM-003', name: 'Chemical Powder X200', category: 'Raw Material', subCategory: 'Chemical', uom: 'kg', minStock: 30, currentStock: 30, type: 'OEM', status: 'Low Stock', gst: '18', hsnCode: '2833', unitConversion: '1 drum = 100 kg', vendor: 'VND-003', criticality: 'high', barcode: 'AU-RM-003', rateHistory: [{ date: 'Jul 2024', rate: '₹1,500/kg', changedBy: 'Purchase Dept' }], grnHistory: [] },
  { id: '4', code: 'SP-001', name: 'PLC-XYZ Control Module', category: 'Spare Part', subCategory: 'Electronics', uom: 'pcs', minStock: 10, currentStock: 25, type: 'OEM', status: 'In Stock', gst: '18', hsnCode: '8537', unitConversion: '', vendor: 'VND-002', criticality: 'critical', barcode: 'AU-SP-001', rateHistory: [{ date: 'Jul 2024', rate: '₹8,500/pc', changedBy: 'Purchase Dept' }], grnHistory: [{ grnNo: 'GRN-2024-001', date: 'Jul 18, 2024', qty: 10, poRef: 'PO-2024-001' }] },
  { id: '5', code: 'SP-002', name: 'PLC-XYZ Control Module (Custom)', category: 'Spare Part', subCategory: 'Electronics', uom: 'pcs', minStock: 5, currentStock: 3, type: 'Modified OEM', status: 'Low Stock', gst: '18', hsnCode: '8537', unitConversion: '', vendor: 'VND-002', criticality: 'high', barcode: 'AU-SP-002', rateHistory: [{ date: 'Jul 2024', rate: '₹12,500/pc', changedBy: 'Purchase Dept' }], grnHistory: [] },
  { id: '6', code: 'CS-001', name: 'Safety Gloves (Pack)', category: 'Consumable', subCategory: 'Safety', uom: 'box', minStock: 20, currentStock: 45, type: 'OEM', status: 'In Stock', gst: '18', hsnCode: '4203', unitConversion: '1 box = 50 pairs', vendor: 'VND-004', criticality: 'medium', barcode: 'AU-CS-001', rateHistory: [{ date: 'Jul 2024', rate: '₹600/box', changedBy: 'Purchase Dept' }], grnHistory: [] },
  { id: '7', code: 'CS-002', name: 'Cleaning Solvent 5L', category: 'Consumable', subCategory: 'Cleaning', uom: 'l', minStock: 10, currentStock: 0, type: 'OEM', status: 'Out of Stock', gst: '18', hsnCode: '3402', unitConversion: '1 drum = 200 L', vendor: 'VND-003', criticality: 'low', barcode: 'AU-CS-002', rateHistory: [{ date: 'Jul 2024', rate: '₹750/L', changedBy: 'Purchase Dept' }], grnHistory: [] },
  { id: '8', code: 'TL-001', name: 'Digital Multimeter', category: 'Tool', subCategory: 'Measurement', uom: 'pcs', minStock: 3, currentStock: 8, type: 'OEM', status: 'In Stock', gst: '18', hsnCode: '9030', unitConversion: '', vendor: 'VND-005', criticality: 'low', barcode: 'AU-TL-001', rateHistory: [{ date: 'Jul 2024', rate: '₹12,000/pc', changedBy: 'Purchase Dept' }], grnHistory: [] },
  { id: '9', code: 'RM-004', name: 'Aluminium Rod 10mm', category: 'Raw Material', subCategory: 'Structural', uom: 'm', minStock: 200, currentStock: 340, type: 'OEM', status: 'In Stock', gst: '18', hsnCode: '7604', unitConversion: '1 bundle = 12m', vendor: 'VND-001', criticality: 'medium', barcode: 'AU-RM-004', rateHistory: [{ date: 'Jul 2024', rate: '₹200/m', changedBy: 'Purchase Dept' }], grnHistory: [] },
  { id: '10', code: 'SP-003', name: 'Relay Switch 24V', category: 'Spare Part', subCategory: 'Electronics', uom: 'pcs', minStock: 50, currentStock: 12, type: 'OEM', status: 'Low Stock', gst: '18', hsnCode: '8536', unitConversion: '', vendor: 'VND-002', criticality: 'critical', barcode: 'AU-SP-003', rateHistory: [{ date: 'Jul 2024', rate: '₹350/pc', changedBy: 'Purchase Dept' }], grnHistory: [] },
];

export const ItemsPage: React.FC = () => {
  const { showToast, globalSearch, setGlobalSearch } = useApp();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<Item | null>(null);
  const [selectedItem, setSelectedItem] = useState<Item | null>(null);
  const [filterCategory, setFilterCategory] = useState<string | undefined>(undefined);
  const [filterType, setFilterType] = useState<string | undefined>(undefined);
  const [detailTab, setDetailTab] = useState<'details' | 'rate-history' | 'grn-links'>('details');

  const [formData, setFormData] = useState({
    code: '',
    name: '',
    category: '',
    subCategory: '',
    uom: 'pcs',
    minStock: '',
    type: 'oem',
    gst: '18',
    hsnCode: '',
    unitConversion: '',
    vendor: '',
    criticality: 'medium',
    barcode: '',
  });

  const filteredItems = useMemo(() => {
    return INITIAL_ITEMS.filter(item => {
      const matchesSearch =
        item.name.toLowerCase().includes(globalSearch.toLowerCase()) ||
        item.code.toLowerCase().includes(globalSearch.toLowerCase()) ||
        item.category.toLowerCase().includes(globalSearch.toLowerCase());
      const matchesCategory = !filterCategory || item.category.toLowerCase().replace(/\s/g, '-') === filterCategory;
      const matchesType = !filterType || item.type.toLowerCase().replace(/\s/g, '-') === filterType;
      return matchesSearch && matchesCategory && matchesType;
    });
  }, [globalSearch, filterCategory, filterType]);

  const stats = useMemo(() => {
    const total = INITIAL_ITEMS.length;
    const inStock = INITIAL_ITEMS.filter(i => i.status === 'In Stock').length;
    const lowStock = INITIAL_ITEMS.filter(i => i.status === 'Low Stock').length;
    const outOfStock = INITIAL_ITEMS.filter(i => i.status === 'Out of Stock').length;
    return { total, inStock, lowStock, outOfStock };
  }, []);

  const openCreateModal = () => {
    setEditingItem(null);
    setFormData({ code: '', name: '', category: '', subCategory: '', uom: 'pcs', minStock: '', type: 'oem', gst: '18', hsnCode: '', unitConversion: '', vendor: '', criticality: 'medium', barcode: '' });
    setIsModalOpen(true);
  };

  const openEditModal = (item: Item) => {
    setEditingItem(item);
    setFormData({
      code: item.code,
      name: item.name,
      category: item.category.toLowerCase().replace(/\s/g, '-'),
      subCategory: item.subCategory,
      uom: item.uom,
      minStock: String(item.minStock),
      type: item.type.toLowerCase().replace(/\s/g, '-'),
      gst: item.gst,
      hsnCode: item.hsnCode,
      unitConversion: item.unitConversion,
      vendor: item.vendor,
      criticality: item.criticality,
      barcode: item.barcode,
    });
    setIsModalOpen(true);
  };

  const openDetailModal = (item: Item) => {
    setSelectedItem(item);
    setDetailTab('details');
    setIsDetailOpen(true);
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    showToast(editingItem ? 'Item updated successfully' : 'New item added to master list', 'success');
    setIsModalOpen(false);
  };

  const columns: Column<Item>[] = [
    {
      key: 'name',
      label: 'Item Details',
      render: (item) => (
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-slate-50 rounded-lg flex items-center justify-center text-slate-400 group-hover:bg-white border border-transparent group-hover:border-slate-100 transition-all">
            <Box size={14} />
          </div>
          <div className="flex flex-col">
            <span className="text-xs font-bold text-slate-800 leading-none">{item.name}</span>
            <span className="text-xs font-mono text-slate-400 mt-1">{item.code}</span>
          </div>
        </div>
      )
    },
    {
      key: 'category',
      label: 'Category',
      render: (item) => (
        <span className="text-xs font-semibold text-slate-500">{item.category}</span>
      )
    },
    {
      key: 'type',
      label: 'Type',
      render: (item) => (
        <Badge variant={item.type === 'OEM' ? 'default' : 'warning'} className="py-0 h-5 flex items-center justify-center w-fit">
          {item.type}
        </Badge>
      )
    },
    {
      key: 'criticality',
      label: 'Criticality',
      render: (item) => (
        <Badge
          variant={item.criticality === 'critical' ? 'error' : item.criticality === 'high' ? 'warning' : item.criticality === 'medium' ? 'default' : 'success'}
          className="py-0 h-5 flex items-center justify-center w-fit"
        >
          {item.criticality}
        </Badge>
      )
    },
    {
      key: 'uom',
      label: 'UOM',
      cellClassName: 'text-xs font-semibold text-slate-500 uppercase'
    },
    {
      key: 'minStock',
      label: 'Min Stock',
      align: 'center',
      cellClassName: 'text-xs font-semibold text-slate-400 tabular-nums'
    },
    {
      key: 'currentStock',
      label: 'In Stock',
      align: 'center',
      render: (item) => (
        <span className={`text-xs font-bold tabular-nums ${item.currentStock === 0 ? 'text-rose-500' : item.currentStock <= item.minStock ? 'text-amber-600' : 'text-slate-900'}`}>
          {item.currentStock}
        </span>
      )
    },
    {
      key: 'status',
      label: 'Status',
      align: 'center',
      render: (item) => (
        <Badge
          variant={
            item.status === 'In Stock' ? 'success' :
              item.status === 'Low Stock' ? 'warning' : 'error'
          }
          className="py-0 h-5 flex items-center justify-center w-fit mx-auto"
        >
          {item.status}
        </Badge>
      )
    },
    {
      key: 'actions',
      label: '',
      sortable: false,
      align: 'right',
      render: (item) => (
        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
          <button
            onClick={(e) => { e.stopPropagation(); openEditModal(item); }}
            className="p-1.5 hover:bg-blue-50 rounded-lg transition-colors text-slate-300 hover:text-blue-600"
          >
            <Edit size={14} />
          </button>
          <button
            onClick={(e) => { e.stopPropagation(); showToast(`Item ${item.code} removed`, 'info'); }}
            className="p-1.5 hover:bg-rose-50 rounded-lg transition-colors text-slate-300 hover:text-rose-500"
          >
            <Trash2 size={14} />
          </button>
        </div>
      )
    }
  ];

  const actions = (
    <>
      <Button
        variant="outline"
        size="sm"
        className="rounded-full"
        onClick={() => showToast('Exporting item list...', 'info')}
        leftIcon={<Download size={14} />}
      >
        Export
      </Button>
      <Button
        size="sm"
        onClick={openCreateModal}
        leftIcon={<Plus size={14} strokeWidth={3} />}
      >
        Add New Item
      </Button>
    </>
  );

  return (
    <PageLayout
      title="Item Master"
      description="Manage all inventory items, categories, and stock rules."
      actions={actions}
    >
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard stat={{ label: 'Total Items', value: String(stats.total), change: 'All categories', trend: 'neutral', icon: Package }} />
        <StatCard stat={{ label: 'In Stock', value: String(stats.inStock), change: 'Healthy stock', trend: 'up', icon: Box }} />
        <StatCard stat={{ label: 'Low Stock', value: String(stats.lowStock), change: 'Needs attention', trend: 'down', icon: AlertTriangle }} />
        <StatCard stat={{ label: 'Out of Stock', value: String(stats.outOfStock), change: 'Critical items', trend: 'down', icon: AlertTriangle }} />
      </div>

      <Card noPadding className="overflow-hidden">
        <div className="p-4 border-b border-slate-100 flex flex-wrap gap-4 items-center justify-between bg-white">
          <Input
            variant="white"
            inputSize="sm"
            className="max-w-md rounded-full shadow-sm"
            placeholder="Search items by name, code or category..."
            value={globalSearch}
            onChange={(e) => setGlobalSearch(e.target.value)}
            icon={<Search size={14} className="text-slate-400" strokeWidth={2.5} />}
          />
          <div className="flex items-center gap-2">
            <div className="w-48">
              <Select
                options={CATEGORIES}
                value={filterCategory}
                onChange={(val) => setFilterCategory(val as string)}
                placeholder="All Categories"
                searchable={false}
                clearable
                inputSize="sm"
              />
            </div>
            <div className="w-40">
              <Select
                options={ITEM_TYPES}
                value={filterType}
                onChange={(val) => setFilterType(val as string)}
                placeholder="All Types"
                searchable={false}
                clearable
                inputSize="sm"
              />
            </div>
          </div>
        </div>

        <DataTable
          data={filteredItems}
          columns={columns}
          rowKey={(i) => i.id}
          onRowClick={(i) => openDetailModal(i)}
        />

        <div className="p-4 border-t border-slate-100 flex items-center justify-between text-xs font-semibold text-slate-400 bg-slate-50/30">
          <p>Showing {filteredItems.length} of {INITIAL_ITEMS.length} items</p>
          <div className="flex gap-2">
            <Button variant="outline" size="xs" disabled>Prev</Button>
            <Button variant="outline" size="xs">Next</Button>
          </div>
        </div>
      </Card>

      {/* Create/Edit Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingItem ? `Edit Item — ${editingItem.code}` : 'Add New Item'}
        contentClassName="max-w-2xl"
        footer={
          <>
            <Button variant="ghost" size="sm" type="button" onClick={() => setIsModalOpen(false)}>Cancel</Button>
            <Button size="sm" type="submit" form="item-form">
              {editingItem ? 'Save Changes' : 'Add Item'}
            </Button>
          </>
        }
      >
        <form id="item-form" className="space-y-5" onSubmit={handleSave}>
          <div className="grid grid-cols-2 gap-4">
            <Input
              label="Item Code"
              required
              placeholder="e.g. RM-005"
              value={formData.code}
              onChange={(e) => setFormData({ ...formData, code: e.target.value })}
            />
            <Input
              label="Item Name"
              required
              placeholder="e.g. Copper Wire 4mm"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            />
          </div>

          <div className="grid grid-cols-3 gap-4">
            <Select
              label="Category"
              options={CATEGORIES}
              value={formData.category}
              onChange={(val) => setFormData({ ...formData, category: val as string })}
              placeholder="Select category"
            />
            <Select
              label="Item Type"
              options={ITEM_TYPES}
              value={formData.type}
              onChange={(val) => setFormData({ ...formData, type: val as string })}
              placeholder="Select type"
            />
            <Select
              label="Criticality"
              options={CRITICALITY_OPTIONS}
              value={formData.criticality}
              onChange={(val) => setFormData({ ...formData, criticality: val as string })}
              placeholder="Select criticality"
            />
          </div>

          <Input
            label="Sub-Category"
            placeholder="e.g. Electrical, Structural, Chemical"
            value={formData.subCategory}
            onChange={(e) => setFormData({ ...formData, subCategory: e.target.value })}
          />

          <div className="grid grid-cols-2 gap-4">
            <Select
              label="Unit of Measure"
              options={UOM_OPTIONS}
              value={formData.uom}
              onChange={(val) => setFormData({ ...formData, uom: val as string })}
            />
            <Input
              label="Minimum Stock Level"
              type="number"
              required
              placeholder="e.g. 50"
              value={formData.minStock}
              onChange={(e) => setFormData({ ...formData, minStock: e.target.value })}
            />
          </div>

          <div className="grid grid-cols-3 gap-4">
            <Input
              label="GST %"
              type="number"
              placeholder="e.g. 18"
              value={formData.gst}
              onChange={(e) => setFormData({ ...formData, gst: e.target.value })}
            />
            <Input
              label="HSN Code"
              placeholder="e.g. 8544"
              value={formData.hsnCode}
              onChange={(e) => setFormData({ ...formData, hsnCode: e.target.value })}
            />
            <Input
              label="Barcode"
              placeholder="e.g. AU-RM-005"
              value={formData.barcode}
              onChange={(e) => setFormData({ ...formData, barcode: e.target.value })}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <Input
              label="Unit Conversion Formula"
              placeholder="e.g. 1 drum = 200 kg"
              value={formData.unitConversion}
              onChange={(e) => setFormData({ ...formData, unitConversion: e.target.value })}
            />
            <Select
              label="Linked Vendor"
              options={VENDOR_OPTIONS}
              value={formData.vendor}
              onChange={(val) => setFormData({ ...formData, vendor: val as string })}
              placeholder="Select vendor"
            />
          </div>
        </form>
      </Modal>

      {/* Detail View Modal */}
      <Modal
        isOpen={isDetailOpen}
        onClose={() => setIsDetailOpen(false)}
        title={selectedItem ? `${selectedItem.name} — ${selectedItem.code}` : 'Item Details'}
        contentClassName="max-w-2xl"
        footer={
          <Button variant="ghost" size="sm" onClick={() => setIsDetailOpen(false)}>Close</Button>
        }
      >
        {selectedItem && (
          <div className="space-y-4">
            <div className="flex gap-1 border-b border-slate-100">
              {(['details', 'rate-history', 'grn-links'] as const).map((tab) => (
                <button
                  key={tab}
                  onClick={() => setDetailTab(tab)}
                  className={`px-4 py-2.5 text-xs font-bold transition-colors border-b-2 ${
                    detailTab === tab
                      ? 'border-blue-600 text-blue-600'
                      : 'border-transparent text-slate-400 hover:text-slate-600'
                  }`}
                >
                  {tab === 'details' ? 'Details' : tab === 'rate-history' ? 'Rate History' : 'GRN Links'}
                </button>
              ))}
            </div>

            {detailTab === 'details' && (
              <div className="space-y-3">
                <div className="grid grid-cols-2 gap-3">
                  {[
                    { label: 'Category', value: selectedItem.category },
                    { label: 'Sub-Category', value: selectedItem.subCategory },
                    { label: 'Item Type', value: selectedItem.type },
                    { label: 'Criticality', value: selectedItem.criticality },
                    { label: 'UOM', value: selectedItem.uom.toUpperCase() },
                    { label: 'Min Stock', value: String(selectedItem.minStock) },
                    { label: 'Current Stock', value: String(selectedItem.currentStock) },
                    { label: 'Status', value: selectedItem.status },
                    { label: 'GST %', value: `${selectedItem.gst}%` },
                    { label: 'HSN Code', value: selectedItem.hsnCode },
                    { label: 'Barcode', value: selectedItem.barcode },
                    { label: 'Unit Conversion', value: selectedItem.unitConversion || '—' },
                    { label: 'Linked Vendor', value: VENDOR_OPTIONS.find(v => v.value === selectedItem.vendor)?.label || '—' },
                  ].map((field) => (
                    <div key={field.label} className="bg-slate-50 rounded-lg p-2.5 border border-slate-100">
                      <p className="text-[10px] font-bold text-slate-400 uppercase">{field.label}</p>
                      <p className="text-xs font-semibold text-slate-700 mt-0.5">{field.value}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {detailTab === 'rate-history' && (
              <div className="space-y-2">
                {selectedItem.rateHistory.length === 0 ? (
                  <p className="text-xs text-slate-400 text-center py-4">No rate history available</p>
                ) : (
                  selectedItem.rateHistory.map((entry, idx) => (
                    <div key={idx} className="flex items-center justify-between p-3 bg-slate-50 rounded-lg border border-slate-100">
                      <div className="flex items-center gap-2">
                        <History size={12} className="text-slate-400" />
                        <span className="text-xs font-bold text-slate-700">{entry.rate}</span>
                      </div>
                      <div className="text-right">
                        <p className="text-[10px] font-semibold text-slate-400">{entry.date}</p>
                        <p className="text-[10px] font-medium text-slate-500">{entry.changedBy}</p>
                      </div>
                    </div>
                  ))
                )}
              </div>
            )}

            {detailTab === 'grn-links' && (
              <div className="space-y-2">
                {selectedItem.grnHistory.length === 0 ? (
                  <p className="text-xs text-slate-400 text-center py-4">No GRN history available</p>
                ) : (
                  selectedItem.grnHistory.map((grn, idx) => (
                    <div key={idx} className="flex items-center justify-between p-3 bg-slate-50 rounded-lg border border-slate-100">
                      <div className="flex items-center gap-3">
                        <ArrowRightLeft size={12} className="text-slate-400" />
                        <div>
                          <p className="text-xs font-bold text-blue-600">{grn.grnNo}</p>
                          <p className="text-[10px] font-semibold text-slate-400">PO: {grn.poRef}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-xs font-bold text-slate-700">{grn.qty} units</p>
                        <p className="text-[10px] font-medium text-slate-400">{grn.date}</p>
                      </div>
                    </div>
                  ))
                )}
              </div>
            )}
          </div>
        )}
      </Modal>
    </PageLayout>
  );
};

export default ItemsPage;
