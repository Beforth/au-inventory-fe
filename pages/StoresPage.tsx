import React, { useState, useMemo } from 'react';
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
  Plus,
  Warehouse,
  ArrowRight,
  Edit,
  MapPin,
  Box,
  Search,
  Trash2,
  Package,
  Clock,
  Send,
  Eye
} from 'lucide-react';

interface Godown {
  id: string;
  name: string;
  address: string;
  totalRacks: number;
  itemsStored: number;
  capacity: string;
  incharge: string;
  contact: string;
}

interface RackItem {
  id: string;
  rackCode: string;
  rackName: string;
  location: string;
  category: string;
  capacityUsed: string;
  itemCount: number;
  items: { name: string; qty: number; batchNo: string }[];
}

interface StockTransfer {
  id: string;
  transferNumber: string;
  fromLocation: string;
  toLocation: string;
  itemName: string;
  quantity: number;
  date: string;
  status: string;
  requestedBy: string;
  trackingId: string;
}

const INITIAL_GODOWNS: Godown[] = [
  { id: '1', name: 'Godown 1 — Main Factory', address: 'Plot 12, Sector 5, Phase 2', totalRacks: 12, itemsStored: 85, capacity: '72%', incharge: 'Ramesh Kumar', contact: '+91 98765 43210' },
  { id: '2', name: 'Godown 2 — Annex Building', address: 'Plot 12, Sector 5, Phase 2 (Annex)', totalRacks: 8, itemsStored: 42, capacity: '55%', incharge: 'Suresh Yadav', contact: '+91 98765 43211' },
  { id: '3', name: 'Godown 3 — Remote Yard', address: 'Industrial Area, Faridabad', totalRacks: 6, itemsStored: 18, capacity: '30%', incharge: 'Vikram Singh', contact: '+91 98765 43212' },
];

const RACKS_G1: RackItem[] = [
  { id: 'r1', rackCode: 'G1-R01', rackName: 'Rack 1', location: 'Zone A, Entry Side', category: 'Electrical', capacityUsed: '85%', itemCount: 3, items: [{ name: 'Copper Wire 2.5mm', qty: 120, batchNo: 'B-2024-0718' }, { name: 'Copper Wire 4mm', qty: 45, batchNo: 'B-2024-0715' }, { name: 'Aluminium Rod 10mm', qty: 340, batchNo: 'B-2024-0722' }] },
  { id: 'r2', rackCode: 'G1-R02', rackName: 'Rack 2', location: 'Zone A, Middle', category: 'Structural', capacityUsed: '60%', itemCount: 2, items: [{ name: 'Steel Sheet 3mm', qty: 85, batchNo: 'B-2024-0718' }, { name: 'Steel Sheet 5mm', qty: 42, batchNo: 'B-2024-0722' }] },
  { id: 'r3', rackCode: 'G1-R03', rackName: 'Rack 3', location: 'Zone B, Electrical', category: 'Electrical', capacityUsed: '45%', itemCount: 3, items: [{ name: 'PLC-XYZ Control Module', qty: 25, batchNo: 'B-2024-0725' }, { name: 'PLC-XYZ (Custom)', qty: 3, batchNo: 'B-2024-0710' }, { name: 'Relay Switch 24V', qty: 12, batchNo: 'B-2024-0725' }] },
  { id: 'r4', rackCode: 'G1-R04', rackName: 'Rack 4', location: 'Zone B, Chemical', category: 'Chemical', capacityUsed: '30%', itemCount: 2, items: [{ name: 'Chemical Powder X200', qty: 30, batchNo: 'B-2024-0701' }, { name: 'Cleaning Solvent 5L', qty: 0, batchNo: '—' }] },
  { id: 'r5', rackCode: 'G1-R05', rackName: 'Rack 5', location: 'Zone C, Safety', category: 'Safety', capacityUsed: '50%', itemCount: 3, items: [{ name: 'Safety Gloves (Pack)', qty: 45, batchNo: 'B-2024-0726' }, { name: 'Safety Goggles', qty: 20, batchNo: 'B-2024-0615' }, { name: 'Hard Hat', qty: 15, batchNo: 'B-2024-0615' }] },
];

const INITIAL_TRANSFERS: StockTransfer[] = [
  { id: '1', transferNumber: 'TRF-001', fromLocation: 'G1-R01', toLocation: 'G2-R01', itemName: 'Copper Wire 2.5mm', quantity: 25, date: 'Jul 25, 2024', status: 'Completed', requestedBy: 'Ramesh', trackingId: 'TRK-2024-7801' },
  { id: '2', transferNumber: 'TRF-002', fromLocation: 'G1-R03', toLocation: 'G3-R01', itemName: 'Relay Switch 24V', quantity: 50, date: 'Jul 26, 2024', status: 'In Transit', requestedBy: 'Suresh', trackingId: 'TRK-2024-7802' },
  { id: '3', transferNumber: 'TRF-003', fromLocation: 'G1-R02', toLocation: 'G2-R02', itemName: 'Steel Sheet 3mm', quantity: 10, date: 'Jul 27, 2024', status: 'Pending', requestedBy: 'Vikram', trackingId: 'TRK-2024-7803' },
];

const RACK_CODE_OPTIONS = [
  { value: 'G1-R01', label: 'G1-R01 — Zone A, Entry Side' },
  { value: 'G1-R02', label: 'G1-R02 — Zone A, Middle' },
  { value: 'G1-R03', label: 'G1-R03 — Zone B, Electrical' },
  { value: 'G1-R04', label: 'G1-R04 — Zone B, Chemical' },
  { value: 'G1-R05', label: 'G1-R05 — Zone C, Safety' },
  { value: 'G2-R01', label: 'G2-R01 — Annex, General' },
  { value: 'G2-R02', label: 'G2-R02 — Annex, Spares' },
  { value: 'G3-R01', label: 'G3-R01 — Remote Yard, Bulk' },
];

const ITEM_OPTIONS = [
  { value: 'Copper Wire 2.5mm', label: 'Copper Wire 2.5mm' },
  { value: 'Steel Sheet 3mm', label: 'Steel Sheet 3mm' },
  { value: 'PLC-XYZ Control Module', label: 'PLC-XYZ Control Module' },
  { value: 'Relay Switch 24V', label: 'Relay Switch 24V' },
  { value: 'Safety Gloves (Pack)', label: 'Safety Gloves (Pack)' },
  { value: 'Cleaning Solvent 5L', label: 'Cleaning Solvent 5L' },
];

export const StoresPage: React.FC = () => {
  const { showToast, globalSearch, setGlobalSearch } = useApp();
  const [selectedGodown, setSelectedGodown] = useState<Godown | null>(null);
  const [selectedRack, setSelectedRack] = useState<RackItem | null>(null);
  const [isAddRackOpen, setIsAddRackOpen] = useState(false);
  const [isEditGodownOpen, setIsEditGodownOpen] = useState(false);
  const [isAddGodownOpen, setIsAddGodownOpen] = useState(false);
  const [isTransferOpen, setIsTransferOpen] = useState(false);
  const [isTransferHistoryOpen, setIsTransferHistoryOpen] = useState(false);
  const [isRackDetailOpen, setIsRackDetailOpen] = useState(false);
  const [rackCategory, setRackCategory] = useState<string | undefined>(undefined);
  const [transferFrom, setTransferFrom] = useState<string | undefined>(undefined);
  const [transferTo, setTransferTo] = useState<string | undefined>(undefined);
  const [transferItem, setTransferItem] = useState<string | undefined>(undefined);

  const getCapacityColor = (cap: string) => {
    const val = parseInt(cap);
    if (val >= 80) return 'text-rose-500';
    if (val >= 60) return 'text-amber-600';
    return 'text-emerald-600';
  };

  const getCapacityBarColor = (cap: string) => {
    const val = parseInt(cap);
    if (val >= 80) return 'bg-rose-500';
    if (val >= 60) return 'bg-amber-500';
    return 'bg-emerald-500';
  };

  const handleViewRack = (rack: RackItem) => {
    setSelectedRack(rack);
    setIsRackDetailOpen(true);
  };

  if (selectedGodown) {
    const rackColumns: Column<RackItem>[] = [
      {
        key: 'rackCode',
        label: 'Rack',
        render: (r) => (
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 bg-blue-50 rounded-lg flex items-center justify-center">
              <MapPin size={12} className="text-blue-500" />
            </div>
            <div>
              <span className="text-xs font-bold text-slate-800 block leading-none">{r.rackCode}</span>
              <span className="text-xs text-slate-400">{r.rackName}</span>
            </div>
          </div>
        )
      },
      {
        key: 'location',
        label: 'Location',
        cellClassName: 'text-xs font-semibold text-slate-500'
      },
      {
        key: 'category',
        label: 'Category',
        render: (r) => (
          <Badge variant="default" className="py-0 h-4">{r.category}</Badge>
        )
      },
      {
        key: 'itemCount',
        label: 'Items',
        align: 'center',
        cellClassName: 'text-xs font-bold text-slate-600 tabular-nums'
      },
      {
        key: 'capacityUsed',
        label: 'Capacity',
        align: 'center',
        render: (r) => (
          <div className="flex items-center gap-2">
            <div className="flex-1 h-1.5 bg-slate-100 rounded-full overflow-hidden">
              <div
                className={`h-full rounded-full transition-all ${getCapacityBarColor(r.capacityUsed)}`}
                style={{ width: r.capacityUsed }}
              />
            </div>
            <span className={`text-xs font-bold tabular-nums ${getCapacityColor(r.capacityUsed)}`}>
              {r.capacityUsed}
            </span>
          </div>
        )
      },
      {
        key: 'actions',
        label: '',
        sortable: false,
        align: 'right',
        render: (r) => (
          <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
            <button
              onClick={(e) => { e.stopPropagation(); handleViewRack(r); }}
              className="p-1.5 hover:bg-blue-50 rounded-lg transition-colors text-slate-300 hover:text-blue-600"
            >
              <Eye size={14} />
            </button>
            <button
              onClick={(e) => { e.stopPropagation(); showToast(`Editing ${r.rackCode}`, 'info'); }}
              className="p-1.5 hover:bg-slate-100 rounded-lg transition-colors text-slate-300 hover:text-slate-600"
            >
              <Edit size={14} />
            </button>
          </div>
        )
      }
    ];

    return (
      <PageLayout
        title={selectedGodown.name}
        description={selectedGodown.address}
        breadcrumbs={[
          { label: 'Stores & Racks', href: '/stores' },
          { label: selectedGodown.name }
        ]}
        actions={
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={() => setIsTransferOpen(true)} leftIcon={<ArrowRight size={14} />}>
              Send Material
            </Button>
            <Button variant="outline" size="sm" onClick={() => setIsEditGodownOpen(true)} leftIcon={<Edit size={14} />}>
              Edit Godown
            </Button>
            <Button size="sm" onClick={() => setIsAddRackOpen(true)} leftIcon={<Plus size={14} strokeWidth={3} />}>
              Add Rack
            </Button>
          </div>
        }
      >
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
          <div className="bg-white border border-slate-200 rounded-xl p-4">
            <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1">In-Charge</p>
            <p className="text-xs font-bold text-slate-900">{selectedGodown.incharge}</p>
            <p className="text-xs text-slate-500 mt-0.5">{selectedGodown.contact}</p>
          </div>
          <div className="bg-white border border-slate-200 rounded-xl p-4">
            <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1">Total Racks</p>
            <p className="text-xl font-bold text-slate-900 tabular-nums">{selectedGodown.totalRacks}</p>
          </div>
          <div className="bg-white border border-slate-200 rounded-xl p-4">
            <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1">Capacity</p>
            <div className="flex items-center gap-2">
              <p className={`text-xl font-bold tabular-nums ${getCapacityColor(selectedGodown.capacity)}`}>{selectedGodown.capacity}</p>
              <div className="flex-1 h-2 bg-slate-100 rounded-full overflow-hidden">
                <div className={`h-full rounded-full ${getCapacityBarColor(selectedGodown.capacity)}`} style={{ width: selectedGodown.capacity }} />
              </div>
            </div>
          </div>
        </div>

        <Card noPadding className="overflow-hidden">
          <div className="p-4 border-b border-slate-100 flex flex-wrap gap-4 items-center justify-between bg-white">
            <div className="flex items-center gap-3">
              <Button variant="ghost" size="xs" onClick={() => setSelectedGodown(null)}>
                ← Back to Warehouses
              </Button>
              <Input
                variant="white"
                inputSize="sm"
                className="max-w-xs rounded-full shadow-sm"
                placeholder="Search racks..."
                value={globalSearch}
                onChange={(e) => setGlobalSearch(e.target.value)}
                icon={<Search size={14} className="text-slate-400" strokeWidth={2.5} />}
              />
            </div>
            <Button variant="outline" size="xs" onClick={() => setIsTransferHistoryOpen(true)} leftIcon={<Clock size={12} />}>
              Transfer History
            </Button>
          </div>
          <DataTable
            data={RACKS_G1}
            columns={rackColumns}
            rowKey={(r) => r.id}
            onRowClick={(r) => handleViewRack(r)}
          />
        </Card>

        {/* Add Rack Modal */}
        <Modal
          isOpen={isAddRackOpen}
          onClose={() => setIsAddRackOpen(false)}
          title="Add New Rack"
          footer={
            <>
              <Button variant="ghost" size="sm" onClick={() => setIsAddRackOpen(false)}>Cancel</Button>
              <Button size="sm" onClick={() => { showToast('Rack added successfully', 'success'); setIsAddRackOpen(false); setRackCategory(undefined); }}>Add Rack</Button>
            </>
          }
        >
          <div className="space-y-4">
            <Input label="Rack Code" required placeholder="e.g. G1-R06" />
            <Input label="Rack Name" required placeholder="e.g. Rack 6" />
            <Input label="Location in Godown" placeholder="e.g. Zone C, Back Wall" />
            <Select
              label="Category Assignment"
              options={[
                { value: 'electrical', label: 'Electrical' },
                { value: 'structural', label: 'Structural' },
                { value: 'chemical', label: 'Chemical' },
                { value: 'safety', label: 'Safety' },
                { value: 'general', label: 'General' },
              ]}
              value={rackCategory}
              onChange={(val) => setRackCategory(val as string)}
              placeholder="Assign item category"
            />
            <Input label="Capacity (slots or weight)" placeholder="e.g. 50 slots or 500 kg" />
          </div>
        </Modal>

        {/* Edit Godown Modal */}
        <Modal
          isOpen={isEditGodownOpen}
          onClose={() => setIsEditGodownOpen(false)}
          title="Edit Godown Details"
          footer={
            <>
              <Button variant="ghost" size="sm" onClick={() => setIsEditGodownOpen(false)}>Cancel</Button>
              <Button size="sm" onClick={() => { showToast('Godown details updated', 'success'); setIsEditGodownOpen(false); }}>Save Changes</Button>
            </>
          }
        >
          <div className="space-y-4">
            <Input label="Godown Name" required defaultValue={selectedGodown.name} />
            <Input label="Address" defaultValue={selectedGodown.address} />
            <Input label="In-Charge Name" defaultValue={selectedGodown.incharge} />
            <Input label="Contact Number" defaultValue={selectedGodown.contact} />
          </div>
        </Modal>

        {/* Send Material Modal */}
        <Modal
          isOpen={isTransferOpen}
          onClose={() => setIsTransferOpen(false)}
          title="Send Material to Another Location"
          footer={
            <>
              <Button variant="ghost" size="sm" onClick={() => setIsTransferOpen(false)}>Cancel</Button>
              <Button size="sm" onClick={() => { showToast('Material transfer initiated — tracking ID generated', 'success'); setIsTransferOpen(false); setTransferFrom(undefined); setTransferTo(undefined); setTransferItem(undefined); }}>Confirm Transfer</Button>
            </>
          }
        >
          <div className="space-y-4">
            <div className="bg-blue-50 border border-blue-100 rounded-xl p-3 text-xs text-blue-700 font-medium">
              Material will be picked from the source rack and delivered to the destination. A tracking ID will be generated for status updates.
            </div>
            <div className="grid grid-cols-2 gap-4">
              <Select
                label="From Rack"
                options={RACK_CODE_OPTIONS}
                value={transferFrom}
                onChange={(val) => setTransferFrom(val as string)}
                placeholder="Source rack"
              />
              <Select
                label="To Rack"
                options={RACK_CODE_OPTIONS}
                value={transferTo}
                onChange={(val) => setTransferTo(val as string)}
                placeholder="Destination rack"
              />
            </div>
            <Select
              label="Item to Transfer"
              options={ITEM_OPTIONS}
              value={transferItem}
              onChange={(val) => setTransferItem(val as string)}
              placeholder="Select item"
            />
            <Input label="Quantity" type="number" placeholder="e.g. 25" />
            <Input label="Reason" placeholder="e.g. Reorganising Zone A shelves" />
          </div>
        </Modal>

        {/* Transfer History Modal */}
        <Modal
          isOpen={isTransferHistoryOpen}
          onClose={() => setIsTransferHistoryOpen(false)}
          title="Transfer History"
          contentClassName="max-w-2xl"
          footer={
            <Button variant="ghost" size="sm" onClick={() => setIsTransferHistoryOpen(false)}>Close</Button>
          }
        >
          <div className="space-y-3">
            {INITIAL_TRANSFERS.map(t => (
              <div key={t.id} className="flex items-center gap-3 bg-white border border-slate-100 rounded-xl p-3">
                <div className="w-8 h-8 bg-blue-50 rounded-lg flex items-center justify-center flex-shrink-0">
                  <Send size={14} className="text-blue-500" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-slate-800">{t.transferNumber}</span>
                    <Badge
                      variant={t.status === 'Completed' ? 'success' : t.status === 'In Transit' ? 'warning' : 'default'}
                      className="py-0 h-4 text-[9px]"
                    >
                      {t.status}
                    </Badge>
                  </div>
                  <p className="text-xs text-slate-500 truncate">{t.itemName} — {t.quantity} units</p>
                  <p className="text-[10px] text-slate-400 font-mono">{t.fromLocation} → {t.toLocation} | {t.date}</p>
                </div>
                <span className="text-[10px] font-bold text-slate-400 font-mono">{t.trackingId}</span>
              </div>
            ))}
          </div>
        </Modal>

        {/* Rack Detail Modal */}
        <Modal
          isOpen={isRackDetailOpen}
          onClose={() => { setIsRackDetailOpen(false); setSelectedRack(null); }}
          title={selectedRack ? `${selectedRack.rackCode} — Item Details` : 'Rack Detail'}
          contentClassName="max-w-2xl"
          footer={
            <Button variant="ghost" size="sm" onClick={() => { setIsRackDetailOpen(false); setSelectedRack(null); }}>Close</Button>
          }
        >
          {selectedRack && (
            <div className="space-y-4">
              <div className="grid grid-cols-3 gap-3">
                <div className="bg-slate-50 rounded-xl p-3 text-center">
                  <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1">Location</p>
                  <p className="text-xs font-bold text-slate-900">{selectedRack.location}</p>
                </div>
                <div className="bg-slate-50 rounded-xl p-3 text-center">
                  <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1">Category</p>
                  <Badge variant="default">{selectedRack.category}</Badge>
                </div>
                <div className="bg-slate-50 rounded-xl p-3 text-center">
                  <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1">Capacity</p>
                  <p className={`text-lg font-bold tabular-nums ${getCapacityColor(selectedRack.capacityUsed)}`}>{selectedRack.capacityUsed}</p>
                </div>
              </div>

              <div>
                <p className="text-xs font-bold text-slate-900 mb-2">Items Stored ({selectedRack.items.length})</p>
                <div className="space-y-2">
                  {selectedRack.items.map((item, idx) => (
                    <div key={idx} className="flex items-center gap-3 bg-slate-50 border border-slate-100 rounded-xl px-4 py-3">
                      <div className="w-8 h-8 bg-blue-50 rounded-lg flex items-center justify-center flex-shrink-0">
                        <Package size={14} className="text-blue-500" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-bold text-slate-800">{item.name}</p>
                        <p className="text-[10px] text-slate-400 font-mono">Batch: {item.batchNo}</p>
                      </div>
                      <div className="text-right">
                        <p className={`text-sm font-bold tabular-nums ${item.qty === 0 ? 'text-rose-500' : 'text-slate-900'}`}>{item.qty}</p>
                        <p className="text-[10px] text-slate-400">in stock</p>
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
  }

  return (
    <PageLayout
      title="Stores & Racks"
      description="Manage warehouses (godowns) and shelf locations (racks)."
      actions={
        <Button size="sm" onClick={() => setIsAddGodownOpen(true)} leftIcon={<Plus size={14} strokeWidth={3} />}>
          Add Godown
        </Button>
      }
    >
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <StatCard stat={{ label: 'Total Godowns', value: String(INITIAL_GODOWNS.length), change: 'Warehouses', trend: 'neutral', icon: Warehouse }} />
        <StatCard stat={{ label: 'Total Racks', value: String(INITIAL_GODOWNS.reduce((sum, g) => sum + g.totalRacks, 0)), change: 'Shelf locations', trend: 'neutral', icon: MapPin }} />
        <StatCard stat={{ label: 'Items Stored', value: String(INITIAL_GODOWNS.reduce((sum, g) => sum + g.itemsStored, 0)), change: 'Across all godowns', trend: 'up', icon: Box }} />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {INITIAL_GODOWNS.map(godown => (
          <Card
            key={godown.id}
            className="cursor-pointer hover:shadow-lg hover:border-blue-200 transition-all group"
            onClick={() => setSelectedGodown(godown)}
          >
            <div className="flex items-start justify-between mb-4">
              <div className="w-10 h-10 bg-blue-50 rounded-xl flex items-center justify-center group-hover:bg-blue-100 transition-colors">
                <Warehouse size={20} className="text-blue-600" />
              </div>
              <Badge variant="default">{godown.totalRacks} racks</Badge>
            </div>
            <h3 className="text-sm font-bold text-slate-900 mb-1">{godown.name}</h3>
            <p className="text-xs text-slate-400 mb-4">{godown.address}</p>

            <div className="space-y-2">
              <div className="flex items-center justify-between text-xs">
                <span className="text-slate-400 font-medium">Capacity Used</span>
                <span className={`font-bold tabular-nums ${getCapacityColor(godown.capacity)}`}>{godown.capacity}</span>
              </div>
              <div className="h-1.5 bg-slate-100 rounded-full overflow-hidden">
                <div
                  className={`h-full rounded-full transition-all ${getCapacityBarColor(godown.capacity)}`}
                  style={{ width: godown.capacity }}
                />
              </div>
            </div>

            <div className="flex items-center justify-between mt-4 pt-3 border-t border-slate-100">
              <span className="text-xs font-semibold text-slate-400">{godown.itemsStored} items stored</span>
              <span className="text-xs font-bold text-blue-600 flex items-center gap-1 group-hover:gap-2 transition-all">
                View Racks <ArrowRight size={10} />
              </span>
            </div>
          </Card>
        ))}
      </div>

      {/* Add Godown Modal */}
      <Modal
        isOpen={isAddGodownOpen}
        onClose={() => setIsAddGodownOpen(false)}
        title="Add New Godown"
        footer={
          <>
            <Button variant="ghost" size="sm" onClick={() => setIsAddGodownOpen(false)}>Cancel</Button>
            <Button size="sm" onClick={() => { showToast('Godown created successfully', 'success'); setIsAddGodownOpen(false); }}>Create Godown</Button>
          </>
        }
      >
        <div className="space-y-4">
          <Input label="Godown Name" required placeholder="e.g. Godown 4 — New Building" />
          <Input label="Address" required placeholder="e.g. Plot 20, Sector 8, Phase 1" />
          <Input label="In-Charge Name" placeholder="e.g. Amit Kumar" />
          <Input label="Contact Number" placeholder="e.g. +91 98765 43213" />
          <Input label="Total Rack Capacity" type="number" placeholder="e.g. 10" />
        </div>
      </Modal>
    </PageLayout>
  );
};

export default StoresPage;
