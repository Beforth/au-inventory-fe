import React, { useState, useMemo, useEffect } from 'react';
import {
  User,
  Globe,
  RefreshCw,
  History,
  Calendar,
  Sparkles,
  Bug,
  Tag,
  Settings,
  Shield,
  Package,
  BarChart3,
  Plus,
  Edit,
  Trash2,
  Eye,
  Search,
  Users,
  CheckCircle,
  AlertTriangle,
  Save,
  Tag as TagIcon
} from 'lucide-react';
import { useApp } from '../App';
import { PageLayout } from '../components/layout/PageLayout';
import { BreadcrumbItem } from '../UI/Breadcrumb';
import { Column } from '../components/ui/DataTable';
import { DataTable } from '../components/ui/DataTable';
import { Pagination } from '../components/ui/Pagination';
import { SearchInput } from '../components/ui/SearchInput';
import {
  Button,
  Card,
  CardContent,
  Input,
  Label,
  Modal,
} from '../UI';
import { Badge } from '../components/ui/Badge';
import { Select } from '../components/ui/Select';

interface AuditLog {
  id: string;
  created_at: string;
  employee_name: string;
  action: string;
  entity_type: string;
  details: string;
  entity_id: string;
}

interface UserRecord {
  id: string;
  name: string;
  email: string;
  role: string;
  department: string;
  status: string;
  lastLogin: string;
}

interface MaterialCategory {
  id: string;
  code: string;
  name: string;
  parentCategory: string;
  gstRate: number;
  hsnCode: string;
  itemCount: number;
}

interface MaterialMatrix {
  id: string;
  categoryCode: string;
  categoryName: string;
  subCategory: string;
  unit: string;
  defaultRack: string;
  minStock: number;
  bufferStock: number;
  autoPO: boolean;
}

const MOCK_AUDIT_LOGS: AuditLog[] = [
  { id: '1', created_at: '2026-06-28T09:15:00Z', employee_name: 'Ramesh Kumar', action: 'Create', entity_type: 'grn', details: 'Created GRN-2024-001 for PO-2024-001 — 4 items received', entity_id: 'GRN-2024-001' },
  { id: '2', created_at: '2026-06-27T14:30:00Z', employee_name: 'Suresh Yadav', action: 'Issue', entity_type: 'stock', details: 'Issued 50 kg Copper Wire 2.5mm to JO-045', entity_id: 'JO-045' },
  { id: '3', created_at: '2026-06-27T11:20:00Z', employee_name: 'Mr. Sharma', action: 'Approve', entity_type: 'po', details: 'Approved PO-2024-004 for SteelCorp Industries — ₹61,600', entity_id: 'PO-2024-004' },
  { id: '4', created_at: '2026-06-26T16:45:00Z', employee_name: 'Rajesh Verma', action: 'Update', entity_type: 'item', details: 'Updated buffer stock level for PLC-XYZ Control Module to 5', entity_id: 'SP-001' },
  { id: '5', created_at: '2026-06-26T10:00:00Z', employee_name: 'System', action: 'Alert', entity_type: 'stock', details: 'Low stock alert triggered for Relay Switch 24V (12 remaining, min: 50)', entity_id: 'SP-003' },
  { id: '6', created_at: '2026-06-25T08:30:00Z', employee_name: 'Vikram Singh', action: 'Transfer', entity_type: 'stores', details: 'Transferred 25 units Copper Wire from G1-R01 to G2-R01', entity_id: 'TRF-001' },
  { id: '7', created_at: '2026-06-24T13:15:00Z', employee_name: 'Ramesh Kumar', action: 'Create', entity_type: 'job', details: 'Created job order JO-048 for Tata Steel — Motor Controller Unit', entity_id: 'JO-048' },
  { id: '8', created_at: '2026-06-24T09:45:00Z', employee_name: 'Neha Gupta', action: 'Return', entity_type: 'returns', details: 'Returned unused PLC-XYZ modules from JO-044 — 2 pcs', entity_id: 'RET-002' },
];

const MOCK_USERS: UserRecord[] = [
  { id: '1', name: 'Ramesh Kumar', email: 'ramesh@aureole.com', role: 'Store Manager', department: 'Stores', status: 'Active', lastLogin: 'Jul 27, 2024' },
  { id: '2', name: 'Suresh Yadav', email: 'suresh@aureole.com', role: 'Store Executive', department: 'Stores', status: 'Active', lastLogin: 'Jul 27, 2024' },
  { id: '3', name: 'Vikram Singh', email: 'vikram@aureole.com', role: 'R&D Engineer', department: 'R&D', status: 'Active', lastLogin: 'Jul 26, 2024' },
  { id: '4', name: 'Rajesh Verma', email: 'rajesh@aureole.com', role: 'QC Inspector', department: 'Quality', status: 'Active', lastLogin: 'Jul 25, 2024' },
  { id: '5', name: 'Neha Gupta', email: 'neha@aureole.com', role: 'Production Lead', department: 'Production', status: 'Active', lastLogin: 'Jul 24, 2024' },
  { id: '6', name: 'Mr. Sharma', email: 'sharma@aureole.com', role: 'Plant Head', department: 'Management', status: 'Active', lastLogin: 'Jul 27, 2024' },
  { id: '7', name: 'Amit Kumar', email: 'amit@aureole.com', role: 'Purchase Executive', department: 'Purchase', status: 'Active', lastLogin: 'Jul 23, 2024' },
  { id: '8', name: 'Priya Sharma', email: 'priya@aureole.com', role: 'Accounts', department: 'Finance', status: 'Active', lastLogin: 'Jul 22, 2024' },
];

const MOCK_CATEGORIES: MaterialCategory[] = [
  { id: '1', code: 'RM', name: 'Raw Materials', parentCategory: 'Materials', gstRate: 18, hsnCode: '7208', itemCount: 5 },
  { id: '2', code: 'SP', name: 'Spares & Components', parentCategory: 'Materials', gstRate: 18, hsnCode: '8536', itemCount: 4 },
  { id: '3', code: 'CS', name: 'Consumables', parentCategory: 'Materials', gstRate: 12, hsnCode: '3402', itemCount: 3 },
  { id: '4', code: 'TL', name: 'Tools & Equipment', parentCategory: 'Assets', gstRate: 18, hsnCode: '9030', itemCount: 2 },
  { id: '5', code: 'SF', name: 'Safety Equipment', parentCategory: 'Materials', gstRate: 12, hsnCode: '6307', itemCount: 3 },
  { id: '6', code: 'CL', name: 'Chemicals', parentCategory: 'Materials', gstRate: 18, hsnCode: '2812', itemCount: 2 },
];

const MOCK_MATRIX: MaterialMatrix[] = [
  { id: '1', categoryCode: 'RM', categoryName: 'Raw Materials', subCategory: 'Copper', unit: 'kg', defaultRack: 'G1-R01', minStock: 50, bufferStock: 15, autoPO: true },
  { id: '2', categoryCode: 'RM', categoryName: 'Raw Materials', subCategory: 'Steel', unit: 'bundles', defaultRack: 'G1-R02', minStock: 100, bufferStock: 20, autoPO: true },
  { id: '3', categoryCode: 'SP', categoryName: 'Spares & Components', subCategory: 'Electronics', unit: 'pcs', defaultRack: 'G1-R03', minStock: 10, bufferStock: 5, autoPO: true },
  { id: '4', categoryCode: 'CS', categoryName: 'Consumables', subCategory: 'Safety', unit: 'packs', defaultRack: 'G1-R05', minStock: 20, bufferStock: 10, autoPO: false },
  { id: '5', categoryCode: 'CL', categoryName: 'Chemicals', subCategory: 'Industrial', unit: 'litres', defaultRack: 'G1-R04', minStock: 30, bufferStock: 10, autoPO: false },
];

const MOCK_VERSIONS = [
  {
    version: '1.1.1',
    release_date: 'June 28, 2026',
    sections: [
      { title: 'New Features', items: ['Audit Logs tab in Settings for full activity tracking', 'Version changelog modal accessible from sidebar', 'Expanded dashboard with Team Leaderboard chart'] },
      { title: 'Bug Fixes', items: ['Fixed pagination reset on search', 'Resolved Sidebar active state flicker on route change', 'Corrected breadcrumb overflow on narrow screens'] },
    ],
  },
  {
    version: '1.1.0',
    release_date: 'June 15, 2026',
    sections: [
      { title: 'New Features', items: ['Help Center page with module FAQ accordion', 'Quick-launch cards for User Guide and Getting Started', 'SearchInput component with debounced filtering'] },
      { title: 'Enhancements', items: ['Migrated design system to Outfit font family', 'Unified button variants across all Button components', 'Card component now supports title/description/actions slots'] },
    ],
  },
  {
    version: '1.0.0',
    release_date: 'June 1, 2026',
    sections: [
      { title: 'Initial Release', items: ['Inventory Management System — all modules live', '13 core pages: Dashboard, Items, Vendors, Procurement, Inward, Stores, Jobs, Stock, Returns, Assets, AMC, Reports, Settings'] },
    ],
  },
];

type SettingsTab = 'Users' | 'Categories' | 'Material Matrix' | 'Stock Rules' | 'Audit Logs' | 'Versions';

export const SettingsPage: React.FC = () => {
  const { showToast } = useApp();
  const [activeTab, setActiveTab] = useState<SettingsTab>('Users');

  const [logsPage, setLogsPage] = useState(1);
  const [logsPageSize, setLogsPageSize] = useState(25);
  const [logsSearch, setLogsSearch] = useState('');

  const [isAddUserOpen, setIsAddUserOpen] = useState(false);
  const [isAddCategoryOpen, setIsAddCategoryOpen] = useState(false);
  const [isAddMatrixOpen, setIsAddMatrixOpen] = useState(false);

  const filteredLogs = useMemo(() => {
    if (!logsSearch.trim()) return MOCK_AUDIT_LOGS;
    const q = logsSearch.toLowerCase();
    return MOCK_AUDIT_LOGS.filter(log =>
      log.employee_name.toLowerCase().includes(q) ||
      log.action.toLowerCase().includes(q) ||
      log.entity_type.toLowerCase().includes(q) ||
      log.details.toLowerCase().includes(q)
    );
  }, [logsSearch]);

  const paginatedLogs = useMemo(() => {
    const start = (logsPage - 1) * logsPageSize;
    return filteredLogs.slice(start, start + logsPageSize);
  }, [filteredLogs, logsPage, logsPageSize]);

  useEffect(() => { setLogsPage(1); }, [logsSearch]);

  const auditLogColumns = useMemo<Column<AuditLog>[]>(() => [
    {
      key: 'created_at',
      label: 'Date & Time',
      width: 140,
      render: (log) => (
        <div>
          <div className="text-[10px] font-mono text-slate-400 tracking-tighter uppercase leading-none mb-1">
            {new Date(log.created_at).toLocaleDateString('en-GB')}
          </div>
          <div className="text-xs font-semibold text-slate-700 leading-none">
            {new Date(log.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
          </div>
        </div>
      ),
    },
    {
      key: 'employee_name',
      label: 'User',
      width: 200,
      render: (log) => {
        const name = log.employee_name || 'System';
        const initial = name.slice(0, 1).toUpperCase();
        return (
          <div className="flex items-center gap-2">
            <div className="size-6 rounded-full bg-slate-100 border border-slate-200 text-slate-600 flex items-center justify-center font-bold text-[10px] uppercase shrink-0">
              {initial}
            </div>
            <span className="text-xs font-semibold text-slate-800 truncate max-w-[150px] leading-tight" title={name}>
              {name}
            </span>
          </div>
        );
      },
    },
    {
      key: 'action',
      label: 'Action',
      width: 100,
      align: 'center',
      render: (log) => {
        const action = log.action?.toLowerCase() || '';
        const isDanger = action.includes('delete') || action.includes('remove');
        const isSuccess = action.includes('create') || action.includes('add') || action.includes('approve');
        return (
          <span className={
            `inline-flex items-center justify-center px-2 py-0.5 rounded-md text-[9px] font-bold uppercase tracking-wider border ` +
            (isDanger ? 'bg-rose-50 text-rose-700 border-rose-200' :
            isSuccess ? 'bg-emerald-50 text-emerald-700 border-emerald-200' :
            'bg-blue-50 text-blue-700 border-blue-200')
          }>
            {log.action}
          </span>
        );
      },
    },
    {
      key: 'details',
      label: 'Log Details',
      render: (log) => {
        const entityLabel = log.entity_type ? log.entity_type.split('_').join(' ') : 'System';
        return (
          <div className="flex items-start gap-2 max-w-full">
            <span className="shrink-0 inline-flex items-center px-1.5 py-0.5 bg-slate-100 text-slate-700 border border-slate-200 rounded text-[9px] font-bold uppercase tracking-wider mt-0.5">
              {entityLabel}
            </span>
            <span
              className="text-xs text-slate-600 font-medium leading-normal break-words whitespace-normal"
              title={log.details || ''}
            >
              {log.details || `ID: ${log.entity_id || 'n/a'}`}
            </span>
          </div>
        );
      },
    },
  ], []);

  const userColumns: Column<UserRecord>[] = [
    {
      key: 'name',
      label: 'User',
      render: (u) => {
        const initial = u.name.slice(0, 1).toUpperCase();
        return (
          <div className="flex items-center gap-2">
            <div className="size-7 rounded-lg bg-blue-50 border border-blue-100 text-blue-600 flex items-center justify-center font-bold text-[10px] uppercase shrink-0">
              {initial}
            </div>
            <div>
              <span className="text-xs font-bold text-slate-800 block leading-none">{u.name}</span>
              <span className="text-[10px] text-slate-400">{u.email}</span>
            </div>
          </div>
        );
      },
    },
    { key: 'role', label: 'Role', cellClassName: 'text-xs font-semibold text-slate-600' },
    { key: 'department', label: 'Department', cellClassName: 'text-xs font-semibold text-slate-500' },
    { key: 'lastLogin', label: 'Last Login', cellClassName: 'text-xs font-semibold text-slate-400' },
    {
      key: 'status',
      label: 'Status',
      align: 'center',
      render: (u) => (
        <Badge variant={u.status === 'Active' ? 'success' : 'error'} className="py-0 h-5 flex items-center justify-center w-fit mx-auto">
          {u.status}
        </Badge>
      )
    },
    {
      key: 'id',
      label: '',
      sortable: false,
      align: 'right',
      render: (u) => (
        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
          <button onClick={(e) => { e.stopPropagation(); showToast(`Editing ${u.name}`, 'info'); }} className="p-1.5 hover:bg-slate-100 rounded-lg transition-colors text-slate-300 hover:text-slate-600">
            <Edit size={14} />
          </button>
        </div>
      )
    },
  ];

  const categoryColumns: Column<MaterialCategory>[] = [
    {
      key: 'code',
      label: 'Code',
      render: (c) => <span className="text-xs font-bold text-blue-600 font-mono">{c.code}</span>
    },
    { key: 'name', label: 'Category Name', cellClassName: 'text-xs font-bold text-slate-800' },
    { key: 'parentCategory', label: 'Parent', render: (c) => <Badge variant="default" className="py-0 h-4">{c.parentCategory}</Badge> },
    { key: 'gstRate', label: 'GST %', align: 'center', render: (c) => <span className="text-xs font-bold tabular-nums">{c.gstRate}%</span> },
    { key: 'hsnCode', label: 'HSN', cellClassName: 'text-xs font-mono text-slate-500' },
    { key: 'itemCount', label: 'Items', align: 'center', cellClassName: 'text-xs font-bold text-slate-600 tabular-nums' },
    {
      key: 'id',
      label: '',
      sortable: false,
      align: 'right',
      render: (c) => (
        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
          <button onClick={(e) => { e.stopPropagation(); showToast(`Editing ${c.name}`, 'info'); }} className="p-1.5 hover:bg-slate-100 rounded-lg transition-colors text-slate-300 hover:text-slate-600">
            <Edit size={14} />
          </button>
        </div>
      )
    },
  ];

  const matrixColumns: Column<MaterialMatrix>[] = [
    { key: 'categoryCode', label: 'Code', render: (m) => <span className="text-xs font-bold text-blue-600 font-mono">{m.categoryCode}</span> },
    { key: 'categoryName', label: 'Category', cellClassName: 'text-xs font-semibold text-slate-700' },
    { key: 'subCategory', label: 'Sub-Category', cellClassName: 'text-xs font-semibold text-slate-600' },
    { key: 'unit', label: 'Unit', align: 'center', cellClassName: 'text-xs font-semibold text-slate-500' },
    { key: 'defaultRack', label: 'Default Rack', render: (m) => <span className="text-xs font-bold text-blue-600">{m.defaultRack}</span> },
    { key: 'minStock', label: 'Min', align: 'center', cellClassName: 'text-xs font-bold tabular-nums' },
    { key: 'bufferStock', label: 'Buffer', align: 'center', cellClassName: 'text-xs font-bold tabular-nums' },
    { key: 'autoPO', label: 'Auto-PO', align: 'center', render: (m) => m.autoPO ? <CheckCircle size={14} className="text-emerald-500 mx-auto" /> : <span className="text-xs text-slate-300">—</span> },
    {
      key: 'id',
      label: '',
      sortable: false,
      align: 'right',
      render: (m) => (
        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
          <button onClick={(e) => { e.stopPropagation(); showToast(`Editing matrix rule`, 'info'); }} className="p-1.5 hover:bg-slate-100 rounded-lg transition-colors text-slate-300 hover:text-slate-600">
            <Edit size={14} />
          </button>
        </div>
      )
    },
  ];

  const renderContent = () => {
    switch (activeTab) {
      case 'Users':
        return (
          <div className="space-y-4 animate-in fade-in slide-in-from-bottom-2 duration-300">
            <div className="flex items-center justify-between">
              <p className="text-xs text-slate-500 font-medium">{MOCK_USERS.length} users registered — manage roles, access, and permissions</p>
              <Button size="sm" onClick={() => setIsAddUserOpen(true)} leftIcon={<Plus size={14} />}>Add User</Button>
            </div>
            <DataTable data={MOCK_USERS} columns={userColumns} rowKey={(u) => u.id} />
          </div>
        );

      case 'Categories':
        return (
          <div className="space-y-4 animate-in fade-in slide-in-from-bottom-2 duration-300">
            <div className="flex items-center justify-between">
              <p className="text-xs text-slate-500 font-medium">Material category codes used across Items, Inward, and Stock modules</p>
              <Button size="sm" onClick={() => setIsAddCategoryOpen(true)} leftIcon={<Plus size={14} />}>Add Category</Button>
            </div>
            <DataTable data={MOCK_CATEGORIES} columns={categoryColumns} rowKey={(c) => c.id} />
          </div>
        );

      case 'Material Matrix':
        return (
          <div className="space-y-4 animate-in fade-in slide-in-from-bottom-2 duration-300">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-slate-500 font-medium">Default settings per material category — rack, min stock, buffer, auto-PO</p>
                <p className="text-[10px] text-slate-400 mt-0.5">These defaults are applied when new items are added to a category</p>
              </div>
              <Button size="sm" onClick={() => setIsAddMatrixOpen(true)} leftIcon={<Plus size={14} />}>Add Rule</Button>
            </div>
            <DataTable data={MOCK_MATRIX} columns={matrixColumns} rowKey={(m) => m.id} />
          </div>
        );

      case 'Stock Rules':
        return (
          <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-300">
            <div>
              <h3 className="text-xs font-bold text-slate-900 mb-1">Global Stock Rules</h3>
              <p className="text-[10px] text-slate-400">System-wide settings for stock management, alerts, and procurement automation</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Card>
                <h4 className="text-xs font-bold text-slate-900 mb-3">Auto-PO Generation</h4>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-semibold text-slate-600">Enable auto-PO for low stock items</span>
                    <div className="w-10 h-5 bg-emerald-500 rounded-full relative cursor-pointer">
                      <div className="absolute right-0.5 top-0.5 w-4 h-4 bg-white rounded-full shadow-sm" />
                    </div>
                  </div>
                  <Input label="Buffer Threshold Multiplier" defaultValue="1.5" placeholder="e.g. 1.5" />
                  <Select
                    label="Default PO Priority"
                    options={[{ value: 'high', label: 'High (Urgent)' }, { value: 'medium', label: 'Medium' }, { value: 'low', label: 'Low' }]}
                    placeholder="Select priority"
                    onChange={() => {}}
                  />
                </div>
              </Card>

              <Card>
                <h4 className="text-xs font-bold text-slate-900 mb-3">FIFO Enforcement</h4>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-semibold text-slate-600">Enforce FIFO on material issue</span>
                    <div className="w-10 h-5 bg-emerald-500 rounded-full relative cursor-pointer">
                      <div className="absolute right-0.5 top-0.5 w-4 h-4 bg-white rounded-full shadow-sm" />
                    </div>
                  </div>
                  <Input label="Non-Moving Threshold (days)" defaultValue="30" placeholder="e.g. 30" />
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-semibold text-slate-600">Alert on FIFO violation</span>
                    <div className="w-10 h-5 bg-emerald-500 rounded-full relative cursor-pointer">
                      <div className="absolute right-0.5 top-0.5 w-4 h-4 bg-white rounded-full shadow-sm" />
                    </div>
                  </div>
                </div>
              </Card>

              <Card>
                <h4 className="text-xs font-bold text-slate-900 mb-3">QC & Inward</h4>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-semibold text-slate-600">Mandatory QC before stock entry</span>
                    <div className="w-10 h-5 bg-emerald-500 rounded-full relative cursor-pointer">
                      <div className="absolute right-0.5 top-0.5 w-4 h-4 bg-white rounded-full shadow-sm" />
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-semibold text-slate-600">Require batch number on GRN</span>
                    <div className="w-10 h-5 bg-emerald-500 rounded-full relative cursor-pointer">
                      <div className="absolute right-0.5 top-0.5 w-4 h-4 bg-white rounded-full shadow-sm" />
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-semibold text-slate-600">Require rack assignment on GRN</span>
                    <div className="w-10 h-5 bg-slate-300 rounded-full relative cursor-pointer">
                      <div className="absolute left-0.5 top-0.5 w-4 h-4 bg-white rounded-full shadow-sm" />
                    </div>
                  </div>
                </div>
              </Card>

              <Card>
                <h4 className="text-xs font-bold text-slate-900 mb-3">Notifications</h4>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-semibold text-slate-600">Low stock email alerts</span>
                    <div className="w-10 h-5 bg-emerald-500 rounded-full relative cursor-pointer">
                      <div className="absolute right-0.5 top-0.5 w-4 h-4 bg-white rounded-full shadow-sm" />
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-semibold text-slate-600">AMC expiry reminders (30 days)</span>
                    <div className="w-10 h-5 bg-emerald-500 rounded-full relative cursor-pointer">
                      <div className="absolute right-0.5 top-0.5 w-4 h-4 bg-white rounded-full shadow-sm" />
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-semibold text-slate-600">Exhibition return reminders (2 days)</span>
                    <div className="w-10 h-5 bg-emerald-500 rounded-full relative cursor-pointer">
                      <div className="absolute right-0.5 top-0.5 w-4 h-4 bg-white rounded-full shadow-sm" />
                    </div>
                  </div>
                </div>
              </Card>
            </div>

            <div className="flex justify-end">
              <Button onClick={() => showToast('Stock rules saved successfully', 'success')} leftIcon={<Save size={14} />}>Save Rules</Button>
            </div>
          </div>
        );

      case 'Audit Logs':
        return (
          <div className="space-y-4 animate-in fade-in slide-in-from-bottom-2 duration-300">
            <div className="flex items-center gap-3">
              <SearchInput
                placeholder="Filter by user, action, entity or details..."
                value={logsSearch}
                onChange={(e) => setLogsSearch(e.target.value)}
                onClear={() => setLogsSearch('')}
                containerClassName="max-w-md shadow-none"
                inputSize="sm"
              />
            </div>

            <DataTable<AuditLog>
              bordered={true}
              data={paginatedLogs}
              rowKey={(l) => l.id}
              dense={true}
              columns={auditLogColumns}
            />

            <div className="border-t border-slate-100 pt-3">
              <Pagination
                page={logsPage}
                pageSize={logsPageSize}
                total={filteredLogs.length}
                totalPages={Math.ceil(filteredLogs.length / logsPageSize)}
                onPageChange={setLogsPage}
                onPageSizeChange={(sz: number) => { setLogsPageSize(sz); setLogsPage(1); }}
              />
            </div>
          </div>
        );

      case 'Versions':
        return (
          <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-300">
            <div className="space-y-8">
              {MOCK_VERSIONS.map((v) => (
                <div key={v.version} className="space-y-4">
                  <div className="flex items-center gap-3 border-b border-slate-100 pb-2">
                    <span className="px-2.5 py-1 text-xs font-semibold text-blue-700 bg-blue-50 border border-blue-100 rounded-lg">
                      Version {v.version}
                    </span>
                    <span className="text-[11px] font-bold text-slate-400 uppercase tracking-widest flex items-center gap-1">
                      <Calendar size={12} className="text-slate-300" />
                      {v.release_date}
                    </span>
                  </div>
                  <div className="space-y-4 pl-4 border-l-2 border-slate-100/80">
                    {v.sections.map((section) => (
                      <section key={section.title} className="space-y-2">
                        <h4 className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                          {section.title.toLowerCase().includes('bug') ? (
                            <Bug size={13} className="text-rose-500" />
                          ) : (
                            <Sparkles size={13} className="text-amber-500" />
                          )}
                          {section.title}
                        </h4>
                        <ul className="list-disc pl-5 space-y-1.5 text-slate-600 text-xs leading-relaxed font-medium">
                          {section.items.map((item, i) => (
                            <li key={i}>{item}</li>
                          ))}
                        </ul>
                      </section>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  const tabs: { label: SettingsTab; icon: any }[] = [
    { label: 'Users', icon: Users },
    { label: 'Categories', icon: TagIcon },
    { label: 'Material Matrix', icon: BarChart3 },
    { label: 'Stock Rules', icon: Settings },
    { label: 'Audit Logs', icon: History },
    { label: 'Versions', icon: Tag },
  ];

  const breadcrumbs: BreadcrumbItem[] = [
    { label: 'Settings', href: '/settings' },
    { label: activeTab },
  ];

  return (
    <PageLayout
      title={activeTab}
      description="Manage users, categories, stock rules, and system configuration."
      breadcrumbs={breadcrumbs}
    >
      <div className="w-full space-y-4">
        <div className="flex items-center justify-between gap-4 py-1 border-b border-slate-100 mb-2">
          <div className="flex items-center gap-1 overflow-x-auto no-scrollbar scroll-smooth">
            {tabs.map((item) => (
              <button
                key={item.label}
                onClick={() => setActiveTab(item.label)}
                className={
                  `flex items-center gap-2 px-4 py-2.5 rounded-xl transition-all duration-300 relative group whitespace-nowrap active:scale-[0.98] ` +
                  (activeTab === item.label
                    ? 'text-blue-600 font-semibold'
                    : 'text-slate-500 hover:text-slate-900')
                }
              >
                {activeTab === item.label && (
                  <span className="absolute inset-0 bg-blue-50 rounded-xl -z-10 animate-in fade-in duration-200" />
                )}
                <item.icon size={15} className={`transition-transform group-hover:scale-110 ${activeTab === item.label ? 'text-blue-600' : 'opacity-40'}`} />
                <span className="text-xs font-medium uppercase tracking-wide">{item.label}</span>
                {activeTab === item.label && (
                  <span className="absolute bottom-0 left-4 right-4 h-0.5 bg-blue-600 rounded-full animate-in fade-in duration-200" />
                )}
              </button>
            ))}
          </div>
        </div>

        <main className="w-full">
          <Card className="rounded-2xl shadow-sm border-slate-200 overflow-hidden">
            <CardContent className="p-4 md:p-6 lg:p-8">
              {renderContent()}
            </CardContent>
          </Card>
        </main>
      </div>

      {/* Add User Modal */}
      <Modal
        isOpen={isAddUserOpen}
        onClose={() => setIsAddUserOpen(false)}
        title="Add New User"
        footer={
          <>
            <Button variant="ghost" size="sm" onClick={() => setIsAddUserOpen(false)}>Cancel</Button>
            <Button size="sm" onClick={() => { showToast('User created successfully', 'success'); setIsAddUserOpen(false); }}>Create User</Button>
          </>
        }
      >
        <div className="space-y-4">
          <Input label="Full Name" required placeholder="e.g. Rahul Mehta" />
          <Input label="Email" type="email" required placeholder="e.g. rahul@aureole.com" />
          <Select
            label="Role"
            options={[
              { value: 'admin', label: 'System Admin' },
              { value: 'store_manager', label: 'Store Manager' },
              { value: 'store_exec', label: 'Store Executive' },
              { value: 'purchase', label: 'Purchase Executive' },
              { value: 'qc', label: 'QC Inspector' },
              { value: 'production', label: 'Production Lead' },
              { value: 'rd', label: 'R&D Engineer' },
              { value: 'accounts', label: 'Accounts' },
            ]}
            placeholder="Select role"
            onChange={() => {}}
          />
          <Select
            label="Department"
            options={[
              { value: 'stores', label: 'Stores' },
              { value: 'purchase', label: 'Purchase' },
              { value: 'quality', label: 'Quality' },
              { value: 'production', label: 'Production' },
              { value: 'rd', label: 'R&D' },
              { value: 'finance', label: 'Finance' },
              { value: 'management', label: 'Management' },
            ]}
            placeholder="Select department"
            onChange={() => {}}
          />
        </div>
      </Modal>

      {/* Add Category Modal */}
      <Modal
        isOpen={isAddCategoryOpen}
        onClose={() => setIsAddCategoryOpen(false)}
        title="Add Material Category"
        footer={
          <>
            <Button variant="ghost" size="sm" onClick={() => setIsAddCategoryOpen(false)}>Cancel</Button>
            <Button size="sm" onClick={() => { showToast('Category created successfully', 'success'); setIsAddCategoryOpen(false); }}>Create Category</Button>
          </>
        }
      >
        <div className="space-y-4">
          <Input label="Category Code" required placeholder="e.g. HM" />
          <Input label="Category Name" required placeholder="e.g. Housekeeping Materials" />
          <Select
            label="Parent Category"
            options={[{ value: 'materials', label: 'Materials' }, { value: 'assets', label: 'Assets' }]}
            placeholder="Select parent"
            onChange={() => {}}
          />
          <div className="grid grid-cols-2 gap-4">
            <Input label="Default GST Rate (%)" type="number" placeholder="e.g. 18" />
            <Input label="HSN Code" placeholder="e.g. 9030" />
          </div>
        </div>
      </Modal>

      {/* Add Matrix Rule Modal */}
      <Modal
        isOpen={isAddMatrixOpen}
        onClose={() => setIsAddMatrixOpen(false)}
        title="Add Material Matrix Rule"
        footer={
          <>
            <Button variant="ghost" size="sm" onClick={() => setIsAddMatrixOpen(false)}>Cancel</Button>
            <Button size="sm" onClick={() => { showToast('Matrix rule added successfully', 'success'); setIsAddMatrixOpen(false); }}>Add Rule</Button>
          </>
        }
      >
        <div className="space-y-4">
          <Select
            label="Category"
            options={MOCK_CATEGORIES.map(c => ({ value: c.code, label: `${c.code} — ${c.name}` }))}
            placeholder="Select category"
            onChange={() => {}}
          />
          <Input label="Sub-Category" required placeholder="e.g. Copper, Steel, Electronics" />
          <Select
            label="Default Unit"
            options={[{ value: 'kg', label: 'Kilograms' }, { value: 'pcs', label: 'Pieces' }, { value: 'bundles', label: 'Bundles' }, { value: 'litres', label: 'Litres' }, { value: 'm', label: 'Meters' }]}
            placeholder="Select unit"
            onChange={() => {}}
          />
          <Select
            label="Default Rack"
            options={[{ value: 'G1-R01', label: 'G1-R01' }, { value: 'G1-R02', label: 'G1-R02' }, { value: 'G1-R03', label: 'G1-R03' }, { value: 'G1-R04', label: 'G1-R04' }, { value: 'G1-R05', label: 'G1-R05' }]}
            placeholder="Select default rack"
            onChange={() => {}}
          />
          <div className="grid grid-cols-2 gap-4">
            <Input label="Min Stock Level" type="number" placeholder="e.g. 50" />
            <Input label="Buffer Stock Level" type="number" placeholder="e.g. 15" />
          </div>
        </div>
      </Modal>
    </PageLayout>
  );
};

export default SettingsPage;
