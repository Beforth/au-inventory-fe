
import React, { useState } from 'react';
import { useApp } from '../App';
import { StatCard } from '../components/ui/StatCard';
import { Card } from '../components/ui/Card';
import { Badge } from '../components/ui/Badge';
import { Button } from '../components/ui/Button';
import { DataTable, Column } from '../components/ui/DataTable';
import { Download, Layout as LayoutIcon, Check, AlertTriangle, Package, ShoppingCart, ClipboardList, TrendingDown, Clock, Truck, ArrowRight, ArrowUpRight, ArrowDownRight } from 'lucide-react';
import { PageLayout } from '../components/layout/PageLayout';

const DASHBOARD_STATS = [
  { label: 'Total Stock Value', value: '₹12,45,800', change: '+8.2% from last month', trend: 'up' as const, icon: Package },
  { label: 'Pending POs', value: '3', change: '2 awaiting approval', trend: 'down' as const, icon: ShoppingCart },
  { label: 'Low Stock Items', value: '4', change: '+1 since last week', trend: 'down' as const, icon: AlertTriangle },
  { label: 'Active Job Orders', value: '2', change: 'On track', trend: 'up' as const, icon: ClipboardList },
];

interface StockMovement {
  day: string;
  inward: number;
  outward: number;
}

const STOCK_MOVEMENT: StockMovement[] = [
  { day: 'Mon', inward: 45, outward: 32 },
  { day: 'Tue', inward: 28, outward: 41 },
  { day: 'Wed', inward: 62, outward: 38 },
  { day: 'Thu', inward: 15, outward: 52 },
  { day: 'Fri', inward: 38, outward: 29 },
  { day: 'Sat', inward: 20, outward: 18 },
  { day: 'Sun', inward: 0, outward: 0 },
];

interface AlertItem {
  id: string;
  type: 'low-stock' | 'non-moving' | 'pending-delivery' | 'damaged';
  message: string;
  time: string;
  severity: 'high' | 'medium' | 'low';
}

const ALERTS: AlertItem[] = [
  { id: '1', type: 'low-stock', message: 'Relay Switch 24V — 12 units left (min: 50)', time: '2h ago', severity: 'high' },
  { id: '2', type: 'pending-delivery', message: 'PO-2024-002 — ElectroParts delivery overdue by 3 days', time: '5h ago', severity: 'high' },
  { id: '3', type: 'non-moving', message: 'Digital Multimeter — unused for 62 days', time: '1d ago', severity: 'medium' },
  { id: '4', type: 'low-stock', message: 'PLC-XYZ (Custom) — 3 units left (min: 5)', time: '1d ago', severity: 'medium' },
  { id: '5', type: 'damaged', message: 'GRN-2024-004 — damage report pending vendor response', time: '2d ago', severity: 'low' },
];

interface RecentJob {
  jobNumber: string;
  description: string;
  materialsReady: string;
  status: string;
  priority: string;
}

const RECENT_JOBS: RecentJob[] = [
  { jobNumber: 'JO-045', description: 'Control Panel Assembly — 100 units', materialsReady: '6 of 8', status: 'In Progress', priority: 'High' },
  { jobNumber: 'JO-046', description: 'Wiring Harness Set — 250 units', materialsReady: '2 of 5', status: 'Planned', priority: 'Medium' },
  { jobNumber: 'JO-047', description: 'Chemical Processing Unit — 10 units', materialsReady: '0 of 12', status: 'Planned', priority: 'High' },
];

const DashboardPage: React.FC = () => {
  const { showToast } = useApp();
  const [isExporting, setIsExporting] = useState(false);

  const handleExport = () => {
    setIsExporting(true);
    setTimeout(() => {
      setIsExporting(false);
      showToast('Dashboard data exported successfully');
    }, 1500);
  };

  const alertColumns: Column<AlertItem>[] = [
    {
      key: 'type',
      label: 'Type',
      render: (a) => (
        <Badge
          variant={a.severity === 'high' ? 'error' : a.severity === 'medium' ? 'warning' : 'default'}
          className="py-0 h-5 flex items-center justify-center w-fit"
        >
          {a.type === 'low-stock' ? 'Low Stock' : a.type === 'pending-delivery' ? 'Pending Delivery' : a.type === 'non-moving' ? 'Non-Moving' : 'Damaged'}
        </Badge>
      )
    },
    {
      key: 'message',
      label: 'Alert',
      cellClassName: 'text-xs font-semibold text-slate-700'
    },
    {
      key: 'time',
      label: 'When',
      cellClassName: 'text-xs font-semibold text-slate-400'
    },
  ];

  const jobColumns: Column<RecentJob>[] = [
    {
      key: 'jobNumber',
      label: 'Job',
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
      cellClassName: 'text-xs font-semibold text-slate-600 max-w-[200px] truncate'
    },
    {
      key: 'materialsReady',
      label: 'Materials',
      align: 'center',
      render: (j) => {
        const [ready, total] = j.materialsReady.split(' of ').map(Number);
        return (
          <span className={`text-xs font-bold tabular-nums ${ready === total ? 'text-emerald-600' : 'text-amber-600'}`}>
            {j.materialsReady}
          </span>
        );
      }
    },
    {
      key: 'status',
      label: 'Status',
      align: 'center',
      render: (j) => (
        <Badge
          variant={j.status === 'Completed' ? 'success' : j.status === 'In Progress' ? 'default' : 'warning'}
          className="py-0 h-5 flex items-center justify-center w-fit mx-auto"
        >
          {j.status}
        </Badge>
      )
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
  ];

  const maxMovement = Math.max(...STOCK_MOVEMENT.map(d => d.inward + d.outward), 1);

  return (
    <PageLayout
      title="Inventory Overview"
      description="Real-time stock status, alerts, and job order pipeline."
      actions={
        <Button
          size="sm"
          onClick={handleExport}
          isLoading={isExporting}
          leftIcon={<Download size={14} />}
        >
          Export CSV
        </Button>
      }
    >
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {DASHBOARD_STATS.map((stat) => (
          <StatCard key={stat.label} stat={stat} />
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <Card className="lg:col-span-2" title="Stock Movement" description="Daily inward vs outward (last 7 days)">
          <div className="flex items-end gap-1.5 h-40 mt-2">
            {STOCK_MOVEMENT.map((d) => (
              <div key={d.day} className="flex-1 flex flex-col items-center gap-1">
                <div className="w-full flex flex-col items-center gap-0.5" style={{ height: '120px' }}>
                  <div
                    className="w-full bg-emerald-500 rounded-t-sm"
                    style={{ height: `${(d.inward / maxMovement) * 100}%`, minHeight: d.inward > 0 ? '4px' : '0' }}
                    title={`Inward: ${d.inward}`}
                  />
                  <div
                    className="w-full bg-rose-400 rounded-b-sm"
                    style={{ height: `${(d.outward / maxMovement) * 100}%`, minHeight: d.outward > 0 ? '4px' : '0' }}
                    title={`Outward: ${d.outward}`}
                  />
                </div>
                <span className="text-[10px] font-bold text-slate-400">{d.day}</span>
              </div>
            ))}
          </div>
          <div className="flex items-center gap-4 mt-3 text-xs font-semibold">
            <div className="flex items-center gap-1.5">
              <div className="w-2.5 h-2.5 rounded-sm bg-emerald-500" />
              <span className="text-slate-500">Inward</span>
            </div>
            <div className="flex items-center gap-1.5">
              <div className="w-2.5 h-2.5 rounded-sm bg-rose-400" />
              <span className="text-slate-500">Outward</span>
            </div>
          </div>
        </Card>

        <Card title="Alerts & Reminders" description={`${ALERTS.length} items need attention`}>
          <div className="space-y-2">
            {ALERTS.map((alert) => (
              <div key={alert.id} className={`flex items-start gap-2.5 p-2.5 rounded-lg ${
                alert.severity === 'high' ? 'bg-rose-50 border border-rose-100' :
                alert.severity === 'medium' ? 'bg-amber-50 border border-amber-100' :
                'bg-slate-50 border border-slate-100'
              }`}>
                <AlertTriangle size={12} className={`mt-0.5 flex-shrink-0 ${
                  alert.severity === 'high' ? 'text-rose-500' :
                  alert.severity === 'medium' ? 'text-amber-500' : 'text-slate-400'
                }`} />
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-semibold text-slate-700 leading-tight">{alert.message}</p>
                  <p className="text-[10px] font-medium text-slate-400 mt-0.5">{alert.time}</p>
                </div>
              </div>
            ))}
          </div>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <Card noPadding className="overflow-hidden">
          <div className="px-5 py-3 border-b border-slate-100 bg-white flex items-center justify-between">
            <div>
              <h3 className="text-xs font-bold text-slate-900">Recent Job Orders</h3>
              <p className="text-[10px] font-semibold text-slate-400 mt-0.5">Material pipeline for active jobs</p>
            </div>
            <Button variant="ghost" size="xs" onClick={() => showToast('Opening Job Orders...', 'info')} rightIcon={<ArrowRight size={10} />}>
              View All
            </Button>
          </div>
          <DataTable
            data={RECENT_JOBS}
            columns={jobColumns}
            rowKey={(j) => j.jobNumber}
          />
        </Card>

        <Card title="GRN Pipeline" description="Recent goods receipt status">
          <div className="space-y-3">
            {[
              { grn: 'GRN-2024-001', vendor: 'SteelCorp Industries', items: 4, status: 'QC Passed', date: 'Jul 18' },
              { grn: 'GRN-2024-002', vendor: 'SteelCorp Industries', items: 6, status: 'Received', date: 'Jul 22' },
              { grn: 'GRN-2024-003', vendor: 'ElectroParts Pvt Ltd', items: 2, status: 'QC Pending', date: 'Jul 25' },
              { grn: 'GRN-2024-004', vendor: 'SteelCorp Industries', items: 1, status: 'Damaged', date: 'Jul 26' },
            ].map((grn) => (
              <div key={grn.grn} className="flex items-center justify-between p-3 bg-slate-50 rounded-xl border border-slate-100">
                <div className="flex items-center gap-3">
                  <Truck size={14} className="text-slate-400" />
                  <div>
                    <p className="text-xs font-bold text-slate-800">{grn.grn}</p>
                    <p className="text-[10px] font-semibold text-slate-400">{grn.vendor} • {grn.items} items</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-semibold text-slate-400">{grn.date}</span>
                  <Badge
                    variant={grn.status === 'QC Passed' ? 'success' : grn.status === 'Received' ? 'default' : grn.status === 'QC Pending' ? 'warning' : 'error'}
                    className="py-0 h-5 flex items-center justify-center w-fit"
                  >
                    {grn.status}
                  </Badge>
                </div>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </PageLayout>
  );
};

export default DashboardPage;
