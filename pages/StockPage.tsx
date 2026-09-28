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
  BarChart3,
  AlertTriangle,
  ShoppingCart,
  Clock,
  TrendingDown,
  ArrowRight,
  Package,
  Plus,
  Eye,
  History,
  Bell,
  Settings,
  Download,
  ArrowUp,
  ArrowDown
} from 'lucide-react';

interface StockLevel {
  id: string;
  itemCode: string;
  itemName: string;
  category: string;
  godown: string;
  rack: string;
  currentQty: number;
  minStock: number;
  bufferStock: number;
  status: string;
  lastUsed: string;
  fifoAge: string;
  lastGRN: string;
  unitCost: number;
  totalValue: number;
  batchNo: string;
}

interface BatchHistory {
  id: string;
  batchNo: string;
  itemName: string;
  grnRef: string;
  receivedDate: string;
  receivedQty: number;
  currentQty: number;
  rackLocation: string;
  supplier: string;
  unitCost: number;
}

const INITIAL_STOCK: StockLevel[] = [
  { id: '1', itemCode: 'RM-001', itemName: 'Copper Wire 2.5mm', category: 'Raw Material', godown: 'Godown 1', rack: 'Rack 1', currentQty: 120, minStock: 50, bufferStock: 15, status: 'In Stock', lastUsed: 'Jul 25, 2024', fifoAge: '12 days', lastGRN: 'GRN-2024-001', unitCost: 420, totalValue: 50400, batchNo: 'B-2024-0718' },
  { id: '2', itemCode: 'RM-002', itemName: 'Steel Sheet 3mm', category: 'Raw Material', godown: 'Godown 1', rack: 'Rack 2', currentQty: 85, minStock: 100, bufferStock: 20, status: 'Low Stock', lastUsed: 'Jul 22, 2024', fifoAge: '8 days', lastGRN: 'GRN-2024-001', unitCost: 2800, totalValue: 238000, batchNo: 'B-2024-0718' },
  { id: '3', itemCode: 'RM-003', itemName: 'Chemical Powder X200', category: 'Chemical', godown: 'Godown 1', rack: 'Rack 4', currentQty: 30, minStock: 30, bufferStock: 10, status: 'Critical', lastUsed: 'Jul 20, 2024', fifoAge: '25 days', lastGRN: 'GRN-2024-005', unitCost: 1500, totalValue: 45000, batchNo: 'B-2024-0701' },
  { id: '4', itemCode: 'SP-001', itemName: 'PLC-XYZ Control Module', category: 'Spares', godown: 'Godown 1', rack: 'Rack 3', currentQty: 25, minStock: 10, bufferStock: 5, status: 'In Stock', lastUsed: 'Jul 24, 2024', fifoAge: '5 days', lastGRN: 'GRN-2024-003', unitCost: 8500, totalValue: 212500, batchNo: 'B-2024-0725' },
  { id: '5', itemCode: 'SP-002', itemName: 'PLC-XYZ (Custom)', category: 'Spares', godown: 'Godown 1', rack: 'Rack 3', currentQty: 3, minStock: 5, bufferStock: 2, status: 'Low Stock', lastUsed: 'Jul 23, 2024', fifoAge: '15 days', lastGRN: 'GRN-2024-006', unitCost: 12000, totalValue: 36000, batchNo: 'B-2024-0710' },
  { id: '6', itemCode: 'CS-001', itemName: 'Safety Gloves (Pack)', category: 'Consumables', godown: 'Godown 1', rack: 'Rack 5', currentQty: 45, minStock: 20, bufferStock: 10, status: 'In Stock', lastUsed: 'Jul 26, 2024', fifoAge: '3 days', lastGRN: 'GRN-2024-004', unitCost: 600, totalValue: 27000, batchNo: 'B-2024-0726' },
  { id: '7', itemCode: 'CS-002', itemName: 'Cleaning Solvent 5L', category: 'Consumables', godown: 'Godown 2', rack: 'Rack 1', currentQty: 0, minStock: 10, bufferStock: 5, status: 'Out of Stock', lastUsed: 'Jul 10, 2024', fifoAge: '45 days', lastGRN: 'GRN-2024-007', unitCost: 750, totalValue: 0, batchNo: '—' },
  { id: '8', itemCode: 'SP-003', itemName: 'Relay Switch 24V', category: 'Spares', godown: 'Godown 1', rack: 'Rack 3', currentQty: 12, minStock: 50, bufferStock: 15, status: 'Critical', lastUsed: 'Jul 21, 2024', fifoAge: '20 days', lastGRN: 'GRN-2024-003', unitCost: 350, totalValue: 4200, batchNo: 'B-2024-0725' },
  { id: '9', itemCode: 'RM-004', itemName: 'Aluminium Rod 10mm', category: 'Raw Material', godown: 'Godown 2', rack: 'Rack 2', currentQty: 340, minStock: 200, bufferStock: 50, status: 'In Stock', lastUsed: 'Jul 26, 2024', fifoAge: '2 days', lastGRN: 'GRN-2024-002', unitCost: 980, totalValue: 333200, batchNo: 'B-2024-0722' },
  { id: '10', itemCode: 'TL-001', itemName: 'Digital Multimeter', category: 'Tools', godown: 'Godown 3', rack: 'Rack 1', currentQty: 8, minStock: 3, bufferStock: 1, status: 'In Stock', lastUsed: 'Jun 15, 2024', fifoAge: '62 days', lastGRN: 'GRN-2024-008', unitCost: 15000, totalValue: 120000, batchNo: 'B-2024-0601' },
];

const BATCH_HISTORY: BatchHistory[] = [
  { id: '1', batchNo: 'B-2024-0718', itemName: 'Copper Wire 2.5mm', grnRef: 'GRN-2024-001', receivedDate: 'Jul 18, 2024', receivedQty: 50, currentQty: 30, rackLocation: 'G1-R01', supplier: 'SteelCorp Industries', unitCost: 420 },
  { id: '2', batchNo: 'B-2024-0725', itemName: 'Copper Wire 2.5mm', grnRef: 'GRN-2024-009', receivedDate: 'Jul 25, 2024', receivedQty: 70, currentQty: 70, rackLocation: 'G1-R01', supplier: 'SteelCorp Industries', unitCost: 420 },
  { id: '3', batchNo: 'B-2024-0718', itemName: 'Steel Sheet 3mm', grnRef: 'GRN-2024-001', receivedDate: 'Jul 18, 2024', receivedQty: 20, currentQty: 15, rackLocation: 'G1-R02', supplier: 'SteelCorp Industries', unitCost: 2800 },
  { id: '4', batchNo: 'B-2024-0726', itemName: 'Steel Sheet 3mm', grnRef: 'GRN-2024-004', receivedDate: 'Jul 26, 2024', receivedQty: 70, currentQty: 70, rackLocation: 'G1-R02', supplier: 'SteelCorp Industries', unitCost: 2800 },
];

export const StockPage: React.FC = () => {
  const { showToast, globalSearch, setGlobalSearch } = useApp();
  const [filterStatus, setFilterStatus] = useState<string | undefined>(undefined);
  const [activeView, setActiveView] = useState<'stock' | 'nonmoving' | 'buffer'>('stock');
  const [isAdjustmentOpen, setIsAdjustmentOpen] = useState(false);
  const [isBatchHistoryOpen, setIsBatchHistoryOpen] = useState(false);
  const [isBufferConfigOpen, setIsBufferConfigOpen] = useState(false);
  const [adjustmentItem, setAdjustmentItem] = useState<string | undefined>(undefined);
  const [adjustmentType, setAdjustmentType] = useState<string>('add');

  const filteredStock = useMemo(() => {
    return INITIAL_STOCK.filter(s => {
      const matchesSearch =
        s.itemName.toLowerCase().includes(globalSearch.toLowerCase()) ||
        s.itemCode.toLowerCase().includes(globalSearch.toLowerCase()) ||
        s.category.toLowerCase().includes(globalSearch.toLowerCase());
      const matchesStatus = !filterStatus || s.status.toLowerCase().replace(/\s/g, '') === filterStatus;
      return matchesSearch && matchesStatus;
    });
  }, [globalSearch, filterStatus]);

  const stats = useMemo(() => {
    const total = INITIAL_STOCK.length;
    const inStock = INITIAL_STOCK.filter(s => s.status === 'In Stock').length;
    const lowStock = INITIAL_STOCK.filter(s => s.status === 'Low Stock' || s.status === 'Critical').length;
    const outOfStock = INITIAL_STOCK.filter(s => s.status === 'Out of Stock').length;
    const nonMoving = INITIAL_STOCK.filter(s => s.fifoAge.includes('days') && parseInt(s.fifoAge) > 30).length;
    const totalValue = INITIAL_STOCK.reduce((sum, s) => sum + s.totalValue, 0);
    return { total, inStock, lowStock, outOfStock, nonMoving, totalValue };
  }, []);

  const criticalItems = INITIAL_STOCK.filter(s => s.status === 'Critical' || s.status === 'Out of Stock');
  const nonMovingItems = INITIAL_STOCK.filter(s => s.fifoAge.includes('days') && parseInt(s.fifoAge) > 30);

  const columns: Column<StockLevel>[] = [
    {
      key: 'itemName',
      label: 'Item',
      render: (s) => (
        <div className="flex items-center gap-2">
          <Package size={14} className="text-slate-400" />
          <div>
            <span className="text-xs font-bold text-slate-800 block leading-none">{s.itemName}</span>
            <span className="text-xs font-mono text-slate-400">{s.itemCode} | {s.category}</span>
          </div>
        </div>
      )
    },
    {
      key: 'godown',
      label: 'Location',
      render: (s) => (
        <span className="text-xs font-semibold text-slate-500">{s.godown} / {s.rack}</span>
      )
    },
    {
      key: 'currentQty',
      label: 'In Stock',
      align: 'center',
      render: (s) => (
        <span className={`text-xs font-bold tabular-nums ${
          s.currentQty === 0 ? 'text-rose-500' :
            s.currentQty <= s.minStock ? 'text-amber-600' : 'text-slate-900'
        }`}>
          {s.currentQty}
        </span>
      )
    },
    {
      key: 'minStock',
      label: 'Min',
      align: 'center',
      cellClassName: 'text-xs font-semibold text-slate-400 tabular-nums'
    },
    {
      key: 'bufferStock',
      label: 'Buffer',
      align: 'center',
      cellClassName: 'text-xs font-semibold text-slate-400 tabular-nums'
    },
    {
      key: 'fifoAge',
      label: 'FIFO Age',
      align: 'center',
      render: (s) => {
        const days = parseInt(s.fifoAge);
        return (
          <span className={`text-xs font-bold tabular-nums ${days > 30 ? 'text-rose-500' : days > 14 ? 'text-amber-600' : 'text-slate-600'}`}>
            {s.fifoAge}
          </span>
        );
      }
    },
    {
      key: 'lastUsed',
      label: 'Last Used',
      cellClassName: 'text-xs font-semibold text-slate-400'
    },
    {
      key: 'totalValue',
      label: 'Value',
      align: 'right',
      render: (s) => (
        <span className="text-xs font-bold text-slate-900 tabular-nums">₹{s.totalValue.toLocaleString('en-IN')}</span>
      )
    },
    {
      key: 'status',
      label: 'Status',
      align: 'center',
      render: (s) => (
        <Badge
          variant={
            s.status === 'In Stock' ? 'success' :
              s.status === 'Low Stock' ? 'warning' :
                s.status === 'Critical' ? 'error' : 'error'
          }
          className="py-0 h-5 flex items-center justify-center w-fit mx-auto"
        >
          {s.status}
        </Badge>
      )
    }
  ];

  const actions = (
    <div className="flex gap-2">
      <Button variant="outline" size="sm" onClick={() => setIsBufferConfigOpen(true)} leftIcon={<Settings size={14} />}>
        Buffer Rules
      </Button>
      <Button variant="outline" size="sm" onClick={() => setIsAdjustmentOpen(true)} leftIcon={<ArrowUp size={14} />}>
        Stock Adjustment
      </Button>
      <Button size="sm" onClick={() => showToast('Auto-PO generation started for low items', 'success')} leftIcon={<ShoppingCart size={14} />}>
        Auto-Order Low Items
      </Button>
    </div>
  );

  return (
    <PageLayout
      title="Stock Levels"
      description="Real-time view of all stock, alerts, and FIFO tracking."
      actions={actions}
    >
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-4">
        <StatCard stat={{ label: 'Total SKUs', value: String(stats.total), change: 'Tracked items', trend: 'neutral', icon: BarChart3 }} />
        <StatCard stat={{ label: 'In Stock', value: String(stats.inStock), change: 'Healthy levels', trend: 'up', icon: Package }} />
        <StatCard stat={{ label: 'Low / Critical', value: String(stats.lowStock), change: 'Needs reorder', trend: 'down', icon: AlertTriangle }} />
        <StatCard stat={{ label: 'Out of Stock', value: String(stats.outOfStock), change: 'Urgent action', trend: 'down', icon: TrendingDown }} />
        <StatCard stat={{ label: 'Non-Moving', value: String(stats.nonMoving), change: '30+ days idle', trend: 'down', icon: Clock }} />
        <StatCard stat={{ label: 'Total Value', value: `₹${(stats.totalValue / 100000).toFixed(1)}L`, change: 'Current stock', trend: 'up', icon: BarChart3 }} />
      </div>

      {criticalItems.length > 0 && (
        <div className="bg-rose-50 border border-rose-200 rounded-xl p-4 mb-4 flex items-start gap-3">
          <div className="p-1.5 bg-rose-100 rounded-lg">
            <AlertTriangle size={16} className="text-rose-500" />
          </div>
          <div className="flex-1">
            <p className="text-xs font-bold text-rose-800">Critical Stock Alert</p>
            <p className="text-xs text-rose-600 mt-1">
              {criticalItems.map(c => c.itemName).join(', ')} — {criticalItems.length === 1 ? 'is' : 'are'} critically low or out of stock. Immediate action needed.
            </p>
          </div>
          <Button variant="outline" size="xs" onClick={() => showToast('Creating urgent PO...', 'info')} rightIcon={<ArrowRight size={10} />}>
            Order Now
          </Button>
        </div>
      )}

      {/* View Tabs */}
      <div className="flex gap-2 mb-4">
        {[
          { key: 'stock', label: 'All Stock', icon: Package, count: INITIAL_STOCK.length },
          { key: 'nonmoving', label: 'Non-Moving', icon: Clock, count: nonMovingItems.length },
          { key: 'buffer', label: 'Buffer Config', icon: Settings, count: null },
        ].map(tab => (
          <button
            key={tab.key}
            onClick={() => setActiveView(tab.key as any)}
            className={`px-4 py-2.5 text-xs font-bold rounded-xl transition-all flex items-center gap-2 ${
              activeView === tab.key
                ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/20'
                : 'bg-white text-slate-500 border border-slate-200 hover:border-slate-300'
            }`}
          >
            <tab.icon size={14} />
            {tab.label}
            {tab.count !== null && (
              <span className={`ml-1 px-1.5 py-0.5 text-[9px] rounded-full ${activeView === tab.key ? 'bg-blue-500' : 'bg-slate-100'}`}>
                {tab.count}
              </span>
            )}
          </button>
        ))}
      </div>

      {activeView === 'stock' && (
        <Card noPadding className="overflow-hidden">
          <div className="p-4 border-b border-slate-100 flex flex-wrap gap-4 items-center justify-between bg-white">
            <Input
              variant="white"
              inputSize="sm"
              className="max-w-md rounded-full shadow-sm"
              placeholder="Search stock by item name, code, or category..."
              value={globalSearch}
              onChange={(e) => setGlobalSearch(e.target.value)}
              icon={<Search size={14} className="text-slate-400" strokeWidth={2.5} />}
            />
            <div className="w-44">
              <Select
                options={[
                  { value: 'instock', label: 'In Stock' },
                  { value: 'lowstock', label: 'Low Stock' },
                  { value: 'critical', label: 'Critical' },
                  { value: 'outofstock', label: 'Out of Stock' },
                ]}
                value={filterStatus}
                onChange={(val) => setFilterStatus(val as string)}
                placeholder="All Status"
                searchable={false}
                clearable
                inputSize="sm"
              />
            </div>
          </div>

          <DataTable
            data={filteredStock}
            columns={columns}
            rowKey={(s) => s.id}
            onRowClick={(s) => {
              showToast(`Opening batch history for ${s.itemName}`, 'info');
              setIsBatchHistoryOpen(true);
            }}
          />

          <div className="p-4 border-t border-slate-100 flex items-center justify-between text-xs font-semibold text-slate-400 bg-slate-50/30">
            <p>Showing {filteredStock.length} stock records</p>
            <Button variant="outline" size="xs" onClick={() => showToast('Exporting stock data...', 'info')} leftIcon={<Download size={12} />}>
              Export CSV
            </Button>
          </div>
        </Card>
      )}

      {activeView === 'nonmoving' && (
        <Card noPadding className="overflow-hidden">
          <div className="px-5 py-3 border-b border-slate-100 bg-white">
            <h3 className="text-xs font-bold text-slate-900">Non-Moving Stock (Idle 30+ Days)</h3>
            <p className="text-[10px] text-slate-400 mt-0.5">Items that haven't been issued in over 30 days — consider returning to vendor or reassigning</p>
          </div>
          <div className="p-4 space-y-3">
            {nonMovingItems.length > 0 ? nonMovingItems.map(item => (
              <div key={item.id} className="flex items-center gap-3 bg-white border border-slate-100 rounded-xl p-4">
                <div className="w-8 h-8 bg-amber-50 rounded-lg flex items-center justify-center flex-shrink-0">
                  <Clock size={14} className="text-amber-500" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-slate-800">{item.itemName}</span>
                    <Badge variant="warning" className="py-0 h-4 text-[9px]">{item.fifoAge} idle</Badge>
                  </div>
                  <p className="text-[10px] text-slate-400">{item.godown} / {item.rack} | Qty: {item.currentQty} | Value: ₹{item.totalValue.toLocaleString('en-IN')}</p>
                </div>
                <div className="flex gap-2">
                  <Button variant="outline" size="xs" onClick={() => showToast(`Returning ${item.itemName} to vendor...`, 'info')}>Return</Button>
                  <Button variant="ghost" size="xs" onClick={() => showToast(`Reassigning ${item.itemName}...`, 'info')}>Reassign</Button>
                </div>
              </div>
            )) : (
              <p className="text-xs text-slate-400 text-center py-8">No non-moving stock items found.</p>
            )}
          </div>
        </Card>
      )}

      {activeView === 'buffer' && (
        <Card>
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-sm font-bold text-slate-900">Buffer Stock Reminders</h3>
              <p className="text-xs text-slate-400 mt-0.5">Configure minimum buffer levels and auto-alert thresholds for each item</p>
            </div>
            <Button size="sm" onClick={() => setIsBufferConfigOpen(true)} leftIcon={<Plus size={14} />}>
              Add Rule
            </Button>
          </div>
          <div className="border border-slate-200 rounded-xl overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-200 text-[10px] font-bold uppercase text-slate-400 tracking-wider">
                    <th className="px-4 py-2.5 text-left">Item</th>
                    <th className="px-4 py-2.5 text-center">Current</th>
                    <th className="px-4 py-2.5 text-center">Min Stock</th>
                    <th className="px-4 py-2.5 text-center">Buffer</th>
                    <th className="px-4 py-2.5 text-center">Status</th>
                    <th className="px-4 py-2.5 text-center">Auto-PO</th>
                    <th className="px-4 py-2.5 text-center">Alert</th>
                  </tr>
                </thead>
                <tbody>
                  {INITIAL_STOCK.map(s => (
                    <tr key={s.id} className="border-b border-slate-100 last:border-b-0 hover:bg-slate-50/50 transition-colors">
                      <td className="px-4 py-3">
                        <span className="text-xs font-bold text-slate-800">{s.itemName}</span>
                        <span className="text-[10px] text-slate-400 ml-2">{s.itemCode}</span>
                      </td>
                      <td className="px-4 py-3 text-center">
                        <span className={`text-xs font-bold tabular-nums ${s.currentQty <= s.minStock ? 'text-rose-500' : 'text-slate-900'}`}>
                          {s.currentQty}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-center">
                        <span className="text-xs font-semibold text-slate-600 tabular-nums">{s.minStock}</span>
                      </td>
                      <td className="px-4 py-3 text-center">
                        <span className="text-xs font-semibold text-slate-600 tabular-nums">{s.bufferStock}</span>
                      </td>
                      <td className="px-4 py-3 text-center">
                        <Badge
                          variant={s.currentQty <= s.bufferStock ? 'error' : s.currentQty <= s.minStock ? 'warning' : 'success'}
                          className="py-0 h-4 text-[9px]"
                        >
                          {s.currentQty <= s.bufferStock ? 'Below Buffer' : s.currentQty <= s.minStock ? 'Below Min' : 'OK'}
                        </Badge>
                      </td>
                      <td className="px-4 py-3 text-center">
                        <span className={`text-xs font-semibold ${s.currentQty <= s.minStock ? 'text-rose-500' : 'text-slate-400'}`}>
                          {s.currentQty <= s.minStock ? 'Yes' : 'No'}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-center">
                        {s.currentQty <= s.bufferStock && (
                          <Bell size={14} className="text-rose-500 mx-auto" />
                        )}
                        {s.currentQty > s.bufferStock && s.currentQty <= s.minStock && (
                          <Bell size={14} className="text-amber-500 mx-auto" />
                        )}
                        {s.currentQty > s.minStock && (
                          <span className="text-xs text-slate-300">—</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </Card>
      )}

      {/* Stock Adjustment Modal */}
      <Modal
        isOpen={isAdjustmentOpen}
        onClose={() => { setIsAdjustmentOpen(false); setAdjustmentItem(undefined); }}
        title="Stock Adjustment"
        footer={
          <>
            <Button variant="ghost" size="sm" onClick={() => { setIsAdjustmentOpen(false); setAdjustmentItem(undefined); }}>Cancel</Button>
            <Button size="sm" onClick={() => { showToast('Stock adjustment applied — journal entry created', 'success'); setIsAdjustmentOpen(false); setAdjustmentItem(undefined); }}>Apply Adjustment</Button>
          </>
        }
      >
        <div className="space-y-4">
          <div className="bg-amber-50 border border-amber-100 rounded-xl p-3 text-xs text-amber-700 font-medium">
            Stock adjustments create a journal entry and are logged for audit. Use for corrections only — not for regular issues.
          </div>
          <Select
            label="Item"
            options={INITIAL_STOCK.map(s => ({ value: s.itemCode, label: `${s.itemCode} — ${s.itemName} (Qty: ${s.currentQty})` }))}
            value={adjustmentItem}
            onChange={(val) => setAdjustmentItem(val as string)}
            placeholder="Select item to adjust"
          />
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-700 ml-0.5">Adjustment Type</label>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setAdjustmentType('add')}
                  className={`flex-1 px-4 py-3 rounded-xl border text-xs font-bold transition-all flex items-center justify-center gap-1 ${
                    adjustmentType === 'add' ? 'bg-emerald-50 border-emerald-300 text-emerald-700' : 'bg-white border-slate-200 text-slate-500'
                  }`}
                >
                  <ArrowUp size={12} /> Add
                </button>
                <button
                  type="button"
                  onClick={() => setAdjustmentType('remove')}
                  className={`flex-1 px-4 py-3 rounded-xl border text-xs font-bold transition-all flex items-center justify-center gap-1 ${
                    adjustmentType === 'remove' ? 'bg-rose-50 border-rose-300 text-rose-700' : 'bg-white border-slate-200 text-slate-500'
                  }`}
                >
                  <ArrowDown size={12} /> Remove
                </button>
              </div>
            </div>
            <Input label="Quantity" type="number" required placeholder="e.g. 25" />
          </div>
          <Input label="Reason for Adjustment" required placeholder="e.g. Physical count found extra stock / Damaged in warehouse" />
          <Input label="Authorized By" placeholder="e.g. Store Manager name" />
        </div>
      </Modal>

      {/* Batch History Modal */}
      <Modal
        isOpen={isBatchHistoryOpen}
        onClose={() => setIsBatchHistoryOpen(false)}
        title="Batch History"
        contentClassName="max-w-2xl"
        footer={
          <>
            <Button variant="ghost" size="sm" onClick={() => setIsBatchHistoryOpen(false)}>Close</Button>
            <Button variant="outline" size="sm" onClick={() => showToast('Exporting batch history...', 'info')} leftIcon={<Download size={14} />}>
              Export
            </Button>
          </>
        }
      >
        <div className="space-y-3">
          {BATCH_HISTORY.map(batch => (
            <div key={batch.id} className="bg-white border border-slate-100 rounded-xl p-4">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-slate-800">{batch.batchNo}</span>
                  <Badge variant="default" className="py-0 h-4 text-[9px]">{batch.grnRef}</Badge>
                </div>
                <span className="text-xs font-bold text-slate-900 tabular-nums">₹{batch.unitCost.toLocaleString('en-IN')}/unit</span>
              </div>
              <p className="text-xs text-slate-600 font-medium mb-2">{batch.itemName}</p>
              <div className="grid grid-cols-4 gap-3 text-center">
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-0.5">Received</p>
                  <p className="text-xs font-bold text-slate-900 tabular-nums">{batch.receivedQty}</p>
                </div>
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-0.5">Current</p>
                  <p className={`text-xs font-bold tabular-nums ${batch.currentQty < batch.receivedQty ? 'text-amber-600' : 'text-emerald-600'}`}>{batch.currentQty}</p>
                </div>
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-0.5">Location</p>
                  <p className="text-xs font-bold text-blue-600">{batch.rackLocation}</p>
                </div>
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-0.5">Date</p>
                  <p className="text-xs font-semibold text-slate-500">{batch.receivedDate}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </Modal>

      {/* Buffer Config Modal */}
      <Modal
        isOpen={isBufferConfigOpen}
        onClose={() => setIsBufferConfigOpen(false)}
        title="Buffer Stock Rules"
        contentClassName="max-w-2xl"
        footer={
          <>
            <Button variant="ghost" size="sm" onClick={() => setIsBufferConfigOpen(false)}>Close</Button>
            <Button size="sm" onClick={() => { showToast('Buffer rules saved', 'success'); setIsBufferConfigOpen(false); }}>Save Rules</Button>
          </>
        }
      >
        <div className="space-y-4">
          <p className="text-xs text-slate-500 font-medium">Set minimum stock levels and auto-PO thresholds for each item. When stock falls below the buffer level, an auto-PO will be triggered.</p>
          {INITIAL_STOCK.slice(0, 5).map(s => (
            <div key={s.id} className="flex items-center gap-3 bg-slate-50 border border-slate-100 rounded-xl px-4 py-3">
              <span className="text-xs font-bold text-slate-800 flex-1">{s.itemName}</span>
              <div className="w-20">
                <Input inputSize="sm" type="number" defaultValue={s.minStock} className="text-center" />
              </div>
              <div className="w-20">
                <Input inputSize="sm" type="number" defaultValue={s.bufferStock} className="text-center" />
              </div>
              <div className="flex items-center gap-1">
                <input type="checkbox" defaultChecked={s.currentQty <= s.minStock} className="rounded border-slate-300 text-blue-600" />
                <span className="text-[10px] font-semibold text-slate-500">Auto-PO</span>
              </div>
            </div>
          ))}
          <div className="flex items-center gap-4 text-[10px] font-bold uppercase tracking-wider text-slate-400 px-4">
            <span className="flex-1">Item</span>
            <span className="w-20 text-center">Min Stock</span>
            <span className="w-20 text-center">Buffer</span>
            <span className="w-16 text-center">Auto-PO</span>
          </div>
        </div>
      </Modal>
    </PageLayout>
  );
};

export default StockPage;
