import React, { useMemo, useState } from 'react';
import { Card } from '../components/ui/Card';
import { Badge } from '../components/ui/Badge';
import { DataTable, Column } from '../components/ui/DataTable';
import { Input } from '../components/ui/Input';
import { Button } from '../components/ui/Button';
import { Modal } from '../components/ui/Modal';
import { Select } from '../components/ui/Select';
import { PageLayout } from '../components/layout/PageLayout';
import { useApp } from '../App';
import {
  FileBarChart,
  Download,
  BarChart3,
  Search,
  AlertTriangle,
  CheckCircle,
  XCircle,
  Eye,
  Package,
  TrendingDown,
  Clock,
  FileText,
  Filter,
  ArrowUp,
  ArrowDown,
  Truck,
  Users,
  Plus
} from 'lucide-react';

interface TallyRow {
  itemName: string;
  itemCode: string;
  erpStock: number;
  tallyStock: number;
  erpValue: string;
  tallyValue: string;
  difference: number;
  status: string;
}

interface PhysicalAuditRow {
  itemName: string;
  itemCode: string;
  systemQty: number;
  physicalQty: number;
  variance: number;
  variancePercent: string;
  status: string;
  countedBy: string;
}

interface StockStatementRow {
  category: string;
  godown: string;
  itemCount: number;
  totalQty: number;
  totalValue: number;
}

interface ConsumptionRow {
  itemName: string;
  totalIssued: number;
  jobWise: { job: string; qty: number }[];
  unit: string;
  totalValue: number;
}

interface NonMovingRow {
  itemName: string;
  itemCode: string;
  currentQty: number;
  lastIssued: string;
  daysIdle: number;
  value: number;
  recommendation: string;
}

interface VendorPerformanceRow {
  vendor: string;
  totalPOs: number;
  onTimeDelivery: string;
  qualityScore: number;
  avgLeadTime: string;
  totalValue: number;
  rating: string;
}

const TALLY_DATA: TallyRow[] = [
  { itemName: 'Copper Wire 2.5mm', itemCode: 'RM-001', erpStock: 120, tallyStock: 120, erpValue: '₹50,400', tallyValue: '₹50,400', difference: 0, status: 'Matched' },
  { itemName: 'Steel Sheet 3mm', itemCode: 'RM-002', erpStock: 85, tallyStock: 90, erpValue: '₹2,38,000', tallyValue: '₹2,52,000', difference: 5, status: 'Discrepancy' },
  { itemName: 'Chemical Powder X200', itemCode: 'RM-003', erpStock: 30, tallyStock: 30, erpValue: '₹45,000', tallyValue: '₹45,000', difference: 0, status: 'Matched' },
  { itemName: 'PLC-XYZ Control Module', itemCode: 'SP-001', erpStock: 25, tallyStock: 25, erpValue: '₹2,12,500', tallyValue: '₹2,12,500', difference: 0, status: 'Matched' },
  { itemName: 'Relay Switch 24V', itemCode: 'SP-003', erpStock: 12, tallyStock: 20, erpValue: '₹4,200', tallyValue: '₹7,000', difference: 8, status: 'Discrepancy' },
  { itemName: 'Safety Gloves (Pack)', itemCode: 'CS-001', erpStock: 45, tallyStock: 45, erpValue: '₹27,000', tallyValue: '₹27,000', difference: 0, status: 'Matched' },
  { itemName: 'Cleaning Solvent 5L', itemCode: 'CS-002', erpStock: 0, tallyStock: 5, erpValue: '₹0', tallyValue: '₹3,750', difference: 5, status: 'Discrepancy' },
  { itemName: 'Aluminium Rod 10mm', itemCode: 'RM-004', erpStock: 340, tallyStock: 340, erpValue: '₹68,000', tallyValue: '₹68,000', difference: 0, status: 'Matched' },
];

const AUDIT_DATA: PhysicalAuditRow[] = [
  { itemName: 'Copper Wire 2.5mm', itemCode: 'RM-001', systemQty: 120, physicalQty: 118, variance: -2, variancePercent: '-1.7%', status: 'Variance', countedBy: 'Ramesh' },
  { itemName: 'Steel Sheet 3mm', itemCode: 'RM-002', systemQty: 85, physicalQty: 85, variance: 0, variancePercent: '0%', status: 'Matched', countedBy: 'Suresh' },
  { itemName: 'PLC-XYZ Control Module', itemCode: 'SP-001', systemQty: 25, physicalQty: 24, variance: -1, variancePercent: '-4%', status: 'Variance', countedBy: 'Ramesh' },
  { itemName: 'Safety Gloves (Pack)', itemCode: 'CS-001', systemQty: 45, physicalQty: 45, variance: 0, variancePercent: '0%', status: 'Matched', countedBy: 'Vikram' },
  { itemName: 'Relay Switch 24V', itemCode: 'SP-003', systemQty: 12, physicalQty: 15, variance: 3, variancePercent: '+25%', status: 'Variance', countedBy: 'Suresh' },
];

const STOCK_STATEMENT: StockStatementRow[] = [
  { category: 'Raw Materials', godown: 'Godown 1', itemCount: 4, totalQty: 575, totalValue: 333400 },
  { category: 'Raw Materials', godown: 'Godown 2', itemCount: 1, totalQty: 340, totalValue: 333200 },
  { category: 'Spares', godown: 'Godown 1', itemCount: 3, totalQty: 40, totalValue: 252700 },
  { category: 'Consumables', godown: 'Godown 1', itemCount: 1, totalQty: 45, totalValue: 27000 },
  { category: 'Consumables', godown: 'Godown 2', itemCount: 1, totalQty: 0, totalValue: 0 },
  { category: 'Tools', godown: 'Godown 3', itemCount: 1, totalQty: 8, totalValue: 120000 },
];

const CONSUMPTION_DATA: ConsumptionRow[] = [
  { itemName: 'Copper Wire 2.5mm', totalIssued: 50, unit: 'kg', jobWise: [{ job: 'JO-045', qty: 30 }, { job: 'JO-043', qty: 20 }], totalValue: 21000 },
  { itemName: 'Steel Sheet 3mm', totalIssued: 20, unit: 'bundles', jobWise: [{ job: 'JO-045', qty: 20 }], totalValue: 56000 },
  { itemName: 'Terminal Block', totalIssued: 400, unit: 'pcs', jobWise: [{ job: 'JO-045', qty: 400 }], totalValue: 34000 },
  { itemName: 'Relay Switch 24V', totalIssued: 12, unit: 'pcs', jobWise: [{ job: 'JO-045', qty: 12 }], totalValue: 4200 },
  { itemName: 'Safety Gloves (Pack)', totalIssued: 5, unit: 'packs', jobWise: [{ job: 'JO-045', qty: 5 }], totalValue: 3000 },
];

const NON_MOVING_DATA: NonMovingRow[] = [
  { itemName: 'Digital Multimeter', itemCode: 'TL-001', currentQty: 8, lastIssued: 'Jun 15, 2024', daysIdle: 62, value: 120000, recommendation: 'Return to vendor or assign to active project' },
  { itemName: 'Safety Goggles', itemCode: 'CS-003', currentQty: 20, lastIssued: 'Jun 01, 2024', daysIdle: 76, value: 9000, recommendation: 'Reassign to production team' },
  { itemName: 'Cleaning Solvent 5L', itemCode: 'CS-002', currentQty: 0, lastIssued: 'Jul 10, 2024', daysIdle: 45, value: 0, recommendation: 'Out of stock — reorder or remove from catalog' },
];

const VENDOR_PERF: VendorPerformanceRow[] = [
  { vendor: 'SteelCorp Industries', totalPOs: 12, onTimeDelivery: '92%', qualityScore: 4.5, avgLeadTime: '5 days', totalValue: 1250000, rating: 'Excellent' },
  { vendor: 'ElectroParts Pvt Ltd', totalPOs: 8, onTimeDelivery: '78%', qualityScore: 3.8, avgLeadTime: '7 days', totalValue: 680000, rating: 'Good' },
  { vendor: 'ChemSupply India', totalPOs: 5, onTimeDelivery: '85%', qualityScore: 4.2, avgLeadTime: '4 days', totalValue: 320000, rating: 'Good' },
  { vendor: 'ToolMaster Co', totalPOs: 3, onTimeDelivery: '95%', qualityScore: 4.8, avgLeadTime: '3 days', totalValue: 180000, rating: 'Excellent' },
  { vendor: 'SafetyFirst Ltd', totalPOs: 6, onTimeDelivery: '88%', qualityScore: 4.0, avgLeadTime: '6 days', totalValue: 240000, rating: 'Good' },
];

type ReportView = 'overview' | 'tally' | 'audit' | 'statement' | 'consumption' | 'nonmoving' | 'vendorperf';

export const ReportsPage: React.FC = () => {
  const { showToast, globalSearch, setGlobalSearch } = useApp();
  const [activeReport, setActiveReport] = useState<ReportView>('overview');
  const [auditDateRange, setAuditDateRange] = useState<string | undefined>(undefined);

  const matchedCount = TALLY_DATA.filter(r => r.status === 'Matched').length;
  const discrepancyCount = TALLY_DATA.filter(r => r.status === 'Discrepancy').length;
  const auditMatched = AUDIT_DATA.filter(r => r.status === 'Matched').length;
  const auditVariance = AUDIT_DATA.filter(r => r.status === 'Variance').length;

  const overviewCards = [
    { key: 'tally', title: 'ERP vs Tally Comparison', desc: 'Compare system stock with accounting books (Tally)', icon: BarChart3, matched: matchedCount, discrepancy: discrepancyCount, label: `${matchedCount} Matched | ${discrepancyCount} Discrepancies`, labelVariant: discrepancyCount > 0 ? 'error' as const : 'success' as const },
    { key: 'audit', title: 'Physical Audit', desc: 'Record manual stock counts and calculate variances', icon: FileBarChart, extra: 'Last audit: Jul 15, 2024', label: `${auditMatched} Matched | ${auditVariance} Variances`, labelVariant: auditVariance > 0 ? 'warning' as const : 'success' as const },
    { key: 'statement', title: 'Stock Statement', desc: 'Godown-wise and category-wise stock with valuation', icon: FileText, extra: '10 SKUs tracked | ₹10.66L total', label: '6 locations', labelVariant: 'default' as const },
    { key: 'consumption', title: 'Consumption Report', desc: 'Item-wise usage over date range, by job order', icon: TrendingDown, extra: 'Jul 1 – Jul 26, 2024', label: '5 items consumed', labelVariant: 'default' as const },
    { key: 'nonmoving', title: 'Non-Moving Stock', desc: 'Items not issued in more than 30 days', icon: Clock, extra: '2 items flagged', label: '₹1.29L idle value', labelVariant: 'warning' as const },
    { key: 'vendorperf', title: 'Vendor Performance', desc: 'Delivery time, quality scores, and price comparison', icon: Users, extra: '5 vendors tracked', label: '4.2 avg quality', labelVariant: 'default' as const },
  ];

  if (activeReport !== 'overview') {
    return (
      <PageLayout
        title={
          activeReport === 'tally' ? 'ERP vs Tally Comparison' :
          activeReport === 'audit' ? 'Physical Stock Audit' :
          activeReport === 'statement' ? 'Stock Statement' :
          activeReport === 'consumption' ? 'Consumption Report' :
          activeReport === 'nonmoving' ? 'Non-Moving Stock Report' :
          'Vendor Performance Report'
        }
        description="View, filter, and export report data."
        breadcrumbs={[
          { label: 'Reports', href: '/reports' },
          { label: activeReport === 'tally' ? 'ERP vs Tally' : activeReport === 'audit' ? 'Physical Audit' : activeReport === 'statement' ? 'Stock Statement' : activeReport === 'consumption' ? 'Consumption' : activeReport === 'nonmoving' ? 'Non-Moving' : 'Vendor Performance' }
        ]}
        actions={
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={() => setActiveReport('overview')} leftIcon={<FileBarChart size={14} />}>
              All Reports
            </Button>
            <Button size="sm" onClick={() => showToast(`Exporting ${activeReport} report...`, 'info')} leftIcon={<Download size={14} />}>
              Export CSV
            </Button>
          </div>
        }
      >
        {activeReport === 'tally' && (
          <>
            <div className="grid grid-cols-3 gap-3 mb-4">
              <div className="bg-emerald-50 border border-emerald-100 rounded-xl p-3 text-center">
                <CheckCircle size={16} className="text-emerald-600 mx-auto mb-1" />
                <p className="text-lg font-bold text-emerald-700">{matchedCount}</p>
                <p className="text-xs font-bold text-emerald-600 uppercase">Matched</p>
              </div>
              <div className="bg-rose-50 border border-rose-100 rounded-xl p-3 text-center">
                <XCircle size={16} className="text-rose-500 mx-auto mb-1" />
                <p className="text-lg font-bold text-rose-600">{discrepancyCount}</p>
                <p className="text-xs font-bold text-rose-500 uppercase">Discrepancies</p>
              </div>
              <div className="bg-slate-50 border border-slate-100 rounded-xl p-3 text-center">
                <FileBarChart size={16} className="text-slate-500 mx-auto mb-1" />
                <p className="text-lg font-bold text-slate-700">{TALLY_DATA.length}</p>
                <p className="text-xs font-bold text-slate-500 uppercase">Total Items</p>
              </div>
            </div>
            {discrepancyCount > 0 && (
              <div className="bg-rose-50 border border-rose-200 rounded-xl p-3 mb-4 text-xs text-rose-700 font-medium flex items-start gap-2">
                <AlertTriangle size={14} className="mt-0.5 flex-shrink-0" />
                <span>{discrepancyCount} items have a mismatch between ERP and Tally. Please review and reconcile.</span>
              </div>
            )}
            <Card noPadding className="overflow-hidden">
              <DataTable
                data={TALLY_DATA}
                columns={[
                  { key: 'itemName', label: 'Item', render: (r) => <div><span className="text-xs font-bold text-slate-800 block">{r.itemName}</span><span className="text-[10px] font-mono text-slate-400">{r.itemCode}</span></div> },
                  { key: 'erpStock', label: 'ERP Stock', align: 'center', cellClassName: 'text-xs font-bold text-blue-600 tabular-nums' },
                  { key: 'tallyStock', label: 'Tally Stock', align: 'center', cellClassName: 'text-xs font-bold text-slate-600 tabular-nums' },
                  { key: 'difference', label: 'Diff', align: 'center', render: (r) => <span className={`text-xs font-bold tabular-nums ${r.difference > 0 ? 'text-rose-500' : 'text-slate-400'}`}>{r.difference > 0 ? `+${r.difference}` : '—'}</span> },
                  { key: 'erpValue', label: 'ERP Value', align: 'right', cellClassName: 'text-xs font-semibold text-slate-600 tabular-nums' },
                  { key: 'tallyValue', label: 'Tally Value', align: 'right', cellClassName: 'text-xs font-semibold text-slate-600 tabular-nums' },
                  { key: 'status', label: 'Status', align: 'center', render: (r) => <Badge variant={r.status === 'Matched' ? 'success' : 'error'} className="py-0 h-5 flex items-center justify-center w-fit mx-auto">{r.status}</Badge> },
                ]}
                rowKey={(r) => r.itemName}
              />
            </Card>
          </>
        )}

        {activeReport === 'audit' && (
          <>
            <div className="grid grid-cols-3 gap-3 mb-4">
              <div className="bg-emerald-50 border border-emerald-100 rounded-xl p-3 text-center">
                <CheckCircle size={16} className="text-emerald-600 mx-auto mb-1" />
                <p className="text-lg font-bold text-emerald-700">{auditMatched}</p>
                <p className="text-xs font-bold text-emerald-600 uppercase">Matched</p>
              </div>
              <div className="bg-amber-50 border border-amber-100 rounded-xl p-3 text-center">
                <AlertTriangle size={16} className="text-amber-500 mx-auto mb-1" />
                <p className="text-lg font-bold text-amber-600">{auditVariance}</p>
                <p className="text-xs font-bold text-amber-600 uppercase">Variances</p>
              </div>
              <div className="bg-slate-50 border border-slate-100 rounded-xl p-3 text-center">
                <Package size={16} className="text-slate-500 mx-auto mb-1" />
                <p className="text-lg font-bold text-slate-700">{AUDIT_DATA.length}</p>
                <p className="text-xs font-bold text-slate-500 uppercase">Items Counted</p>
              </div>
            </div>
            <Card noPadding className="overflow-hidden">
              <div className="px-5 py-3 border-b border-slate-100 bg-white flex items-center justify-between">
                <h3 className="text-xs font-bold text-slate-900">Physical Count Results — Jul 15, 2024</h3>
                <Button variant="outline" size="xs" leftIcon={<Plus size={12} />}>Start New Audit</Button>
              </div>
              <DataTable
                data={AUDIT_DATA}
                columns={[
                  { key: 'itemName', label: 'Item', render: (r) => <div><span className="text-xs font-bold text-slate-800 block">{r.itemName}</span><span className="text-[10px] font-mono text-slate-400">{r.itemCode}</span></div> },
                  { key: 'systemQty', label: 'System Qty', align: 'center', cellClassName: 'text-xs font-bold text-blue-600 tabular-nums' },
                  { key: 'physicalQty', label: 'Physical Qty', align: 'center', cellClassName: 'text-xs font-bold text-slate-900 tabular-nums' },
                  { key: 'variance', label: 'Variance', align: 'center', render: (r) => <span className={`text-xs font-bold tabular-nums ${r.variance === 0 ? 'text-slate-400' : r.variance > 0 ? 'text-emerald-600' : 'text-rose-500'}`}>{r.variance === 0 ? '—' : r.variance > 0 ? `+${r.variance}` : r.variance}</span> },
                  { key: 'variancePercent', label: '% Diff', align: 'center', render: (r) => <span className={`text-xs font-bold tabular-nums ${r.variance === 0 ? 'text-slate-400' : 'text-rose-500'}`}>{r.variancePercent}</span> },
                  { key: 'countedBy', label: 'Counted By', cellClassName: 'text-xs font-semibold text-slate-500' },
                  { key: 'status', label: 'Status', align: 'center', render: (r) => <Badge variant={r.status === 'Matched' ? 'success' : 'warning'} className="py-0 h-5 flex items-center justify-center w-fit mx-auto">{r.status}</Badge> },
                ]}
                rowKey={(r) => r.itemCode}
              />
            </Card>
          </>
        )}

        {activeReport === 'statement' && (
          <Card noPadding className="overflow-hidden">
            <div className="px-5 py-3 border-b border-slate-100 bg-white">
              <h3 className="text-xs font-bold text-slate-900">Godown-wise & Category-wise Stock</h3>
              <p className="text-[10px] text-slate-400 mt-0.5">As of Jul 27, 2024</p>
            </div>
            <DataTable
              data={STOCK_STATEMENT}
              columns={[
                { key: 'category', label: 'Category', render: (r) => <Badge variant="default" className="py-0 h-4">{r.category}</Badge> },
                { key: 'godown', label: 'Godown', cellClassName: 'text-xs font-semibold text-slate-700' },
                { key: 'itemCount', label: 'SKUs', align: 'center', cellClassName: 'text-xs font-bold text-slate-600 tabular-nums' },
                { key: 'totalQty', label: 'Total Qty', align: 'center', cellClassName: 'text-xs font-bold text-slate-900 tabular-nums' },
                { key: 'totalValue', label: 'Value', align: 'right', render: (r) => <span className="text-xs font-bold text-slate-900 tabular-nums">₹{r.totalValue.toLocaleString('en-IN')}</span> },
              ]}
              rowKey={(r) => `${r.category}-${r.godown}`}
            />
            <div className="p-4 border-t border-slate-100 bg-slate-50/30 flex items-center justify-between">
              <span className="text-xs font-bold text-slate-900">Total Stock Value: ₹{STOCK_STATEMENT.reduce((s, r) => s + r.totalValue, 0).toLocaleString('en-IN')}</span>
            </div>
          </Card>
        )}

        {activeReport === 'consumption' && (
          <Card noPadding className="overflow-hidden">
            <div className="px-5 py-3 border-b border-slate-100 bg-white flex items-center justify-between">
              <div>
                <h3 className="text-xs font-bold text-slate-900">Item-wise Consumption — Jul 1 to Jul 26, 2024</h3>
                <p className="text-[10px] text-slate-400 mt-0.5">Total consumed value: ₹{CONSUMPTION_DATA.reduce((s, r) => s + r.totalValue, 0).toLocaleString('en-IN')}</p>
              </div>
            </div>
            <DataTable
              data={CONSUMPTION_DATA}
              columns={[
                { key: 'itemName', label: 'Item', cellClassName: 'text-xs font-bold text-slate-800' },
                { key: 'totalIssued', label: 'Total Issued', align: 'center', render: (r) => <span className="text-xs font-bold text-slate-900 tabular-nums">{r.totalIssued} {r.unit}</span> },
                { key: 'jobWise', label: 'Job-wise Breakdown', render: (r) => (
                  <div className="flex flex-wrap gap-1">
                    {r.jobWise.map(j => <Badge key={j.job} variant="default" className="py-0 h-4 text-[9px]">{j.job}: {j.qty}</Badge>)}
                  </div>
                )},
                { key: 'totalValue', label: 'Value', align: 'right', render: (r) => <span className="text-xs font-bold text-slate-900 tabular-nums">₹{r.totalValue.toLocaleString('en-IN')}</span> },
              ]}
              rowKey={(r) => r.itemName}
            />
          </Card>
        )}

        {activeReport === 'nonmoving' && (
          <Card noPadding className="overflow-hidden">
            <div className="px-5 py-3 border-b border-slate-100 bg-white">
              <h3 className="text-xs font-bold text-slate-900">Non-Moving Stock (Idle 30+ Days)</h3>
              <p className="text-[10px] text-slate-400 mt-0.5">Total idle value: ₹{NON_MOVING_DATA.reduce((s, r) => s + r.value, 0).toLocaleString('en-IN')}</p>
            </div>
            <DataTable
              data={NON_MOVING_DATA}
              columns={[
                { key: 'itemName', label: 'Item', render: (r) => <div><span className="text-xs font-bold text-slate-800 block">{r.itemName}</span><span className="text-[10px] font-mono text-slate-400">{r.itemCode}</span></div> },
                { key: 'currentQty', label: 'Qty', align: 'center', cellClassName: 'text-xs font-bold text-slate-900 tabular-nums' },
                { key: 'daysIdle', label: 'Days Idle', align: 'center', render: (r) => <Badge variant="warning" className="py-0 h-4">{r.daysIdle} days</Badge> },
                { key: 'lastIssued', label: 'Last Issued', cellClassName: 'text-xs font-semibold text-slate-400' },
                { key: 'value', label: 'Value', align: 'right', render: (r) => <span className="text-xs font-bold text-slate-900 tabular-nums">₹{r.value.toLocaleString('en-IN')}</span> },
                { key: 'recommendation', label: 'Recommendation', cellClassName: 'text-xs font-medium text-slate-500 max-w-[200px] truncate' },
              ]}
              rowKey={(r) => r.itemCode}
            />
          </Card>
        )}

        {activeReport === 'vendorperf' && (
          <Card noPadding className="overflow-hidden">
            <div className="px-5 py-3 border-b border-slate-100 bg-white">
              <h3 className="text-xs font-bold text-slate-900">Vendor Performance Summary</h3>
              <p className="text-[10px] text-slate-400 mt-0.5">Based on PO delivery, quality inspection, and response time</p>
            </div>
            <DataTable
              data={VENDOR_PERF}
              columns={[
                { key: 'vendor', label: 'Vendor', cellClassName: 'text-xs font-bold text-slate-800' },
                { key: 'totalPOs', label: 'POs', align: 'center', cellClassName: 'text-xs font-bold text-slate-600 tabular-nums' },
                { key: 'onTimeDelivery', label: 'On-Time', align: 'center', render: (r) => <span className={`text-xs font-bold tabular-nums ${parseInt(r.onTimeDelivery) >= 90 ? 'text-emerald-600' : parseInt(r.onTimeDelivery) >= 80 ? 'text-amber-600' : 'text-rose-500'}`}>{r.onTimeDelivery}</span> },
                { key: 'qualityScore', label: 'Quality', align: 'center', render: (r) => <span className="text-xs font-bold text-slate-900 tabular-nums">{r.qualityScore}/5</span> },
                { key: 'avgLeadTime', label: 'Lead Time', align: 'center', cellClassName: 'text-xs font-semibold text-slate-500' },
                { key: 'totalValue', label: 'Total Value', align: 'right', render: (r) => <span className="text-xs font-bold text-slate-900 tabular-nums">₹{r.totalValue.toLocaleString('en-IN')}</span> },
                { key: 'rating', label: 'Rating', align: 'center', render: (r) => <Badge variant={r.rating === 'Excellent' ? 'success' : 'default'} className="py-0 h-5 flex items-center justify-center w-fit mx-auto">{r.rating}</Badge> },
              ]}
              rowKey={(r) => r.vendor}
            />
          </Card>
        )}
      </PageLayout>
    );
  }

  return (
    <PageLayout
      title="Reports"
      description="Compare stock with accounting, run audits, and generate reports."
    >
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {overviewCards.map(card => (
          <Card
            key={card.key}
            onClick={() => setActiveReport(card.key as ReportView)}
            className="hover:border-blue-600/30 transition-all cursor-pointer group"
          >
            <div className="flex items-start justify-between mb-3">
              <div className="p-1.5 bg-slate-50 rounded-lg group-hover:bg-blue-50 transition-colors">
                <card.icon className="text-slate-400 group-hover:text-blue-600" size={14} strokeWidth={2.5} />
              </div>
            </div>
            <h3 className="font-bold text-slate-900 text-sm tracking-tight leading-none mb-1.5">{card.title}</h3>
            <p className="text-xs text-slate-400 font-medium mb-3">{card.desc}</p>
            <div className="flex items-center justify-between">
              <Badge variant={card.labelVariant}>{card.label}</Badge>
              <span className="text-xs font-bold text-blue-600">View →</span>
            </div>
          </Card>
        ))}
      </div>
    </PageLayout>
  );
};


