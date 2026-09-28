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
  CalendarCheck,
  Clock,
  AlertTriangle,
  CheckCircle,
  Package,
  MapPin,
  Eye,
  Send,
  Edit,
  Download,
  Phone,
  FileText,
  RotateCcw
} from 'lucide-react';

interface AMCContract {
  id: string;
  contractNumber: string;
  equipment: string;
  equipmentId: string;
  vendor: string;
  vendorContact: string;
  startDate: string;
  endDate: string;
  annualValue: number;
  status: string;
  nextService: string;
  lastService: string;
  serviceFrequency: string;
  scope: string;
  remarks: string;
}

interface ExhibitionItem {
  id: string;
  itemName: string;
  serialNo: string;
  event: string;
  eventVenue: string;
  deployedDate: string;
  expectedReturn: string;
  actualReturn: string;
  currentLocation: string;
  status: string;
  assignedTo: string;
  condition: string;
  remarks: string;
}

const INITIAL_AMCS: AMCContract[] = [
  { id: '1', contractNumber: 'AMC-2024-001', equipment: 'CNC Machine — Haas VF2', equipmentId: 'CNC-001', vendor: 'Haas Service India', vendorContact: '+91 98123 45678', startDate: 'Jan 01, 2024', endDate: 'Dec 31, 2024', annualValue: 180000, status: 'Active', nextService: 'Aug 15, 2024', lastService: 'May 15, 2024', serviceFrequency: 'Quarterly', scope: 'Preventive maintenance + breakdown repair', remarks: 'Includes spindle calibration and coolant change' },
  { id: '2', contractNumber: 'AMC-2024-002', equipment: 'Compressor — Atlas Copco', equipmentId: 'CMP-001', vendor: 'Atlas Copco Service', vendorContact: '+91 98234 56789', startDate: 'Mar 01, 2024', endDate: 'Feb 28, 2025', annualValue: 96000, status: 'Active', nextService: 'Sep 01, 2024', lastService: 'Jun 01, 2024', serviceFrequency: 'Bi-Monthly', scope: 'Oil change, filter replacement, pressure test', remarks: '' },
  { id: '3', contractNumber: 'AMC-2024-003', equipment: 'UPS System — 10KVA', equipmentId: 'UPS-001', vendor: 'Power Solutions Ltd', vendorContact: '+91 98345 67890', startDate: 'Jun 01, 2023', endDate: 'May 31, 2024', annualValue: 45000, status: 'Expired', nextService: '—', lastService: 'Mar 01, 2024', serviceFrequency: 'Half-Yearly', scope: 'Battery check, load test, firmware update', remarks: 'Renewal pending — awaiting management approval' },
  { id: '4', contractNumber: 'AMC-2024-004', equipment: 'HVAC Unit — Main Hall', equipmentId: 'HVAC-001', vendor: 'CoolTech Services', vendorContact: '+91 98456 78901', startDate: 'Apr 01, 2024', endDate: 'Mar 31, 2025', annualValue: 120000, status: 'Active', nextService: 'Oct 01, 2024', lastService: 'Jul 01, 2024', serviceFrequency: 'Quarterly', scope: 'Full service — filter, gas top-up, electrical check', remarks: '' },
];

const INITIAL_EXHIBITIONS: ExhibitionItem[] = [
  { id: '1', itemName: 'PLC Demo Kit — PLC-XYZ', serialNo: 'DEMO-001', event: 'Automation Expo 2024', eventVenue: 'BEC Mumbai', deployedDate: 'Jul 10, 2024', expectedReturn: 'Jul 30, 2024', actualReturn: '', currentLocation: 'Exhibition Hall — Mumbai', status: 'Deployed', assignedTo: 'Vikram Singh', condition: 'Good', remarks: 'Main demo unit — high priority return' },
  { id: '2', itemName: 'Sensor Display Panel', serialNo: 'DEMO-002', event: 'Automation Expo 2024', eventVenue: 'BEC Mumbai', deployedDate: 'Jul 10, 2024', expectedReturn: 'Jul 30, 2024', actualReturn: '', currentLocation: 'Exhibition Hall — Mumbai', status: 'Deployed', assignedTo: 'Rajesh Verma', condition: 'Good', remarks: '' },
  { id: '3', itemName: 'Motor Drive Unit', serialNo: 'DEMO-003', event: 'Industrial Tech Fair', eventVenue: 'Pragati Maidan, Delhi', deployedDate: 'Jun 01, 2024', expectedReturn: 'Jun 10, 2024', actualReturn: 'Jun 12, 2024', currentLocation: 'Godown 1, Rack 5', status: 'Returned', assignedTo: 'Neha Gupta', condition: 'Good — minor scratches on casing', remarks: 'Returned 2 days late, cosmetic damage only' },
  { id: '4', itemName: 'Digital Multimeter Set', serialNo: 'DEMO-004', event: 'Industrial Tech Fair', eventVenue: 'Pragati Maidan, Delhi', deployedDate: 'Jun 01, 2024', expectedReturn: 'Jun 10, 2024', actualReturn: '', currentLocation: 'Lost — under investigation', status: 'Lost', assignedTo: 'Rajesh Verma', condition: 'Lost', remarks: 'Last seen at venue — police complaint filed' },
];

export const AmcPage: React.FC = () => {
  const { showToast, globalSearch, setGlobalSearch } = useApp();
  const [activeView, setActiveView] = useState<'amc' | 'exhibition'>('amc');
  const [isCreateAMCOpen, setIsCreateAMCOpen] = useState(false);
  const [isCreateExhibitionOpen, setIsCreateExhibitionOpen] = useState(false);
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [selectedAMC, setSelectedAMC] = useState<AMCContract | null>(null);
  const [selectedExhibition, setSelectedExhibition] = useState<ExhibitionItem | null>(null);

  const amcStats = {
    active: INITIAL_AMCS.filter(a => a.status === 'Active').length,
    expiringSoon: 1,
    expired: INITIAL_AMCS.filter(a => a.status === 'Expired').length,
    totalValue: INITIAL_AMCS.filter(a => a.status === 'Active').reduce((sum, a) => sum + a.annualValue, 0),
  };

  const exhibitionStats = {
    total: INITIAL_EXHIBITIONS.length,
    deployed: INITIAL_EXHIBITIONS.filter(e => e.status === 'Deployed').length,
    returned: INITIAL_EXHIBITIONS.filter(e => e.status === 'Returned').length,
    lost: INITIAL_EXHIBITIONS.filter(e => e.status === 'Lost').length,
  };

  const amcColumns: Column<AMCContract>[] = [
    {
      key: 'contractNumber',
      label: 'Contract',
      render: (a) => (
        <div className="flex items-center gap-2">
          <CalendarCheck size={14} className="text-slate-400" />
          <span className="text-xs font-bold text-blue-600">{a.contractNumber}</span>
        </div>
      )
    },
    {
      key: 'equipment',
      label: 'Equipment',
      render: (a) => (
        <div>
          <span className="text-xs font-semibold text-slate-700 block">{a.equipment}</span>
          <span className="text-[10px] font-mono text-slate-400">{a.equipmentId}</span>
        </div>
      )
    },
    {
      key: 'vendor',
      label: 'Service Vendor',
      render: (a) => (
        <div>
          <span className="text-xs font-semibold text-slate-500 block">{a.vendor}</span>
          <span className="text-[10px] text-slate-400">{a.serviceFrequency}</span>
        </div>
      )
    },
    {
      key: 'annualValue',
      label: 'Annual Value',
      align: 'right',
      render: (a) => (
        <span className="text-xs font-bold text-slate-900 tabular-nums">₹{a.annualValue.toLocaleString('en-IN')}</span>
      )
    },
    {
      key: 'nextService',
      label: 'Next Service',
      render: (a) => (
        <span className={`text-xs font-semibold ${a.nextService !== '—' ? 'text-slate-600' : 'text-slate-300'}`}>
          {a.nextService}
        </span>
      )
    },
    {
      key: 'endDate',
      label: 'Expires',
      cellClassName: 'text-xs font-semibold text-slate-400'
    },
    {
      key: 'status',
      label: 'Status',
      align: 'center',
      render: (a) => (
        <Badge
          variant={a.status === 'Active' ? 'success' : a.status === 'Renewal Pending' ? 'warning' : 'error'}
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
        <button
          onClick={(e) => { e.stopPropagation(); setSelectedAMC(a); setIsDetailOpen(true); }}
          className="p-1.5 hover:bg-slate-100 rounded-lg transition-colors text-slate-300 hover:text-slate-600 opacity-0 group-hover:opacity-100"
        >
          <Eye size={14} />
        </button>
      )
    }
  ];

  const exhibitionColumns: Column<ExhibitionItem>[] = [
    {
      key: 'itemName',
      label: 'Item',
      render: (e) => (
        <div className="flex items-center gap-2">
          <Package size={14} className="text-slate-400" />
          <div>
            <span className="text-xs font-bold text-slate-800 block leading-none">{e.itemName}</span>
            <span className="text-xs font-mono text-slate-400">{e.serialNo}</span>
          </div>
        </div>
      )
    },
    {
      key: 'event',
      label: 'Event',
      render: (e) => (
        <div>
          <span className="text-xs font-semibold text-slate-600 block">{e.event}</span>
          <span className="text-[10px] text-slate-400">{e.eventVenue}</span>
        </div>
      )
    },
    {
      key: 'deployedDate',
      label: 'Deployed',
      cellClassName: 'text-xs font-semibold text-slate-400'
    },
    {
      key: 'expectedReturn',
      label: 'Expected Return',
      cellClassName: 'text-xs font-semibold text-slate-400'
    },
    {
      key: 'assignedTo',
      label: 'Responsible',
      cellClassName: 'text-xs font-semibold text-slate-500'
    },
    {
      key: 'currentLocation',
      label: 'Current Location',
      render: (e) => (
        <div className="flex items-center gap-1">
          <MapPin size={10} className="text-slate-400" />
          <span className="text-xs font-semibold text-slate-500 max-w-[150px] truncate">{e.currentLocation}</span>
        </div>
      )
    },
    {
      key: 'status',
      label: 'Status',
      align: 'center',
      render: (e) => (
        <Badge
          variant={e.status === 'Returned' ? 'success' : e.status === 'Deployed' ? 'default' : 'error'}
          className="py-0 h-5 flex items-center justify-center w-fit mx-auto"
        >
          {e.status}
        </Badge>
      )
    },
    {
      key: 'actions',
      label: '',
      sortable: false,
      align: 'right',
      render: (exhibition) => (
        <button
          onClick={(ev) => { ev.stopPropagation(); setSelectedExhibition(exhibition); setIsDetailOpen(true); }}
          className="p-1.5 hover:bg-slate-100 rounded-lg transition-colors text-slate-300 hover:text-slate-600 opacity-0 group-hover:opacity-100"
        >
          <Eye size={14} />
        </button>
      )
    }
  ];

  return (
    <PageLayout
      title="AMC & Exhibitions"
      description="Track maintenance contracts and material sent to trade shows."
    >
      <div className="flex gap-2 mb-4">
        <button
          onClick={() => setActiveView('amc')}
          className={`px-4 py-2.5 text-xs font-bold rounded-xl transition-all ${
            activeView === 'amc' ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/20' : 'bg-white text-slate-500 border border-slate-200'
          }`}
        >
          <CalendarCheck size={14} className="inline mr-2" />
          AMC Contracts ({INITIAL_AMCS.length})
        </button>
        <button
          onClick={() => setActiveView('exhibition')}
          className={`px-4 py-2.5 text-xs font-bold rounded-xl transition-all ${
            activeView === 'exhibition' ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/20' : 'bg-white text-slate-500 border border-slate-200'
          }`}
        >
          <Package size={14} className="inline mr-2" />
          Exhibition Material ({INITIAL_EXHIBITIONS.length})
        </button>
      </div>

      {activeView === 'amc' && (
        <>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <StatCard stat={{ label: 'Active Contracts', value: String(amcStats.active), change: 'Currently active', trend: 'up', icon: CheckCircle }} />
            <StatCard stat={{ label: 'Expiring Soon', value: String(amcStats.expiringSoon), change: 'Within 30 days', trend: 'down', icon: Clock }} />
            <StatCard stat={{ label: 'Expired', value: String(amcStats.expired), change: 'Needs renewal', trend: 'down', icon: AlertTriangle }} />
            <StatCard stat={{ label: 'Total Annual', value: `₹${(amcStats.totalValue / 100000).toFixed(1)}L`, change: 'Active contracts', trend: 'neutral', icon: CalendarCheck }} />
          </div>

          <Card noPadding className="overflow-hidden">
            <div className="p-4 border-b border-slate-100 flex flex-wrap gap-4 items-center justify-between bg-white">
              <Input
                variant="white"
                inputSize="sm"
                className="max-w-md rounded-full shadow-sm"
                placeholder="Search AMC contracts by equipment or vendor..."
                value={globalSearch}
                onChange={(e) => setGlobalSearch(e.target.value)}
                icon={<Search size={14} className="text-slate-400" strokeWidth={2.5} />}
              />
              <Button size="sm" onClick={() => setIsCreateAMCOpen(true)} leftIcon={<Plus size={14} strokeWidth={3} />}>
                New AMC
              </Button>
            </div>
            <DataTable data={INITIAL_AMCS} columns={amcColumns} rowKey={(a) => a.id} onRowClick={(a) => { setSelectedAMC(a); setIsDetailOpen(true); }} />
          </Card>
        </>
      )}

      {activeView === 'exhibition' && (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <StatCard stat={{ label: 'Total Items', value: String(exhibitionStats.total), change: 'All tracked', trend: 'neutral', icon: Package }} />
            <StatCard stat={{ label: 'Deployed', value: String(exhibitionStats.deployed), change: 'At events', trend: 'up', icon: Send }} />
            <StatCard stat={{ label: 'Returned', value: String(exhibitionStats.returned), change: 'Back in stock', trend: 'up', icon: CheckCircle }} />
            <StatCard stat={{ label: 'Lost', value: String(exhibitionStats.lost), change: 'Under investigation', trend: 'down', icon: AlertTriangle }} />
          </div>

          <Card noPadding className="overflow-hidden">
            <div className="p-4 border-b border-slate-100 flex flex-wrap gap-4 items-center justify-between bg-white">
              <Input
                variant="white"
                inputSize="sm"
                className="max-w-md rounded-full shadow-sm"
                placeholder="Search exhibition items..."
                value={globalSearch}
                onChange={(e) => setGlobalSearch(e.target.value)}
                icon={<Search size={14} className="text-slate-400" strokeWidth={2.5} />}
              />
              <Button size="sm" onClick={() => setIsCreateExhibitionOpen(true)} leftIcon={<Plus size={14} strokeWidth={3} />}>
                Send for Exhibition
              </Button>
            </div>
            <DataTable data={INITIAL_EXHIBITIONS} columns={exhibitionColumns} rowKey={(e) => e.id} onRowClick={(e) => { setSelectedExhibition(e); setIsDetailOpen(true); }} />
          </Card>
        </>
      )}

      {/* AMC Detail Modal */}
      {activeView === 'amc' && (
        <Modal
          isOpen={isDetailOpen && !!selectedAMC}
          onClose={() => { setIsDetailOpen(false); setSelectedAMC(null); }}
          title={selectedAMC ? `${selectedAMC.contractNumber} — Detail` : 'AMC Detail'}
          contentClassName="max-w-2xl"
          footer={
            <>
              <Button variant="ghost" size="sm" onClick={() => { setIsDetailOpen(false); setSelectedAMC(null); }}>Close</Button>
              {selectedAMC?.status === 'Expired' && (
                <Button size="sm" onClick={() => { showToast('AMC renewal initiated', 'success'); setIsDetailOpen(false); setSelectedAMC(null); }} leftIcon={<RotateCcw size={14} />}>
                  Renew Contract
                </Button>
              )}
              <Button variant="outline" size="sm" onClick={() => showToast('Downloading contract PDF...', 'info')} leftIcon={<Download size={14} />}>
                Export
              </Button>
            </>
          }
        >
          {selectedAMC && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                <div className="bg-slate-50 rounded-xl p-3 text-center">
                  <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1">Status</p>
                  <Badge variant={selectedAMC.status === 'Active' ? 'success' : 'error'}>{selectedAMC.status}</Badge>
                </div>
                <div className="bg-slate-50 rounded-xl p-3 text-center">
                  <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1">Annual Value</p>
                  <p className="text-xs font-bold text-slate-900 tabular-nums">₹{selectedAMC.annualValue.toLocaleString('en-IN')}</p>
                </div>
                <div className="bg-slate-50 rounded-xl p-3 text-center">
                  <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1">Next Service</p>
                  <p className="text-xs font-bold text-slate-900">{selectedAMC.nextService}</p>
                </div>
                <div className="bg-slate-50 rounded-xl p-3 text-center">
                  <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1">Frequency</p>
                  <p className="text-xs font-bold text-slate-900">{selectedAMC.serviceFrequency}</p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 text-xs">
                <div className="space-y-2">
                  <div><span className="text-slate-400">Equipment:</span> <span className="font-bold text-slate-800 ml-1">{selectedAMC.equipment}</span></div>
                  <div><span className="text-slate-400">Equipment ID:</span> <span className="font-bold text-slate-800 ml-1 font-mono">{selectedAMC.equipmentId}</span></div>
                  <div><span className="text-slate-400">Scope:</span> <span className="font-bold text-slate-800 ml-1">{selectedAMC.scope}</span></div>
                </div>
                <div className="space-y-2">
                  <div><span className="text-slate-400">Vendor:</span> <span className="font-bold text-slate-800 ml-1">{selectedAMC.vendor}</span></div>
                  <div className="flex items-center gap-1"><span className="text-slate-400">Contact:</span> <Phone size={10} className="text-slate-400" /> <span className="font-bold text-slate-800 ml-1">{selectedAMC.vendorContact}</span></div>
                  <div><span className="text-slate-400">Start:</span> <span className="font-bold text-slate-800 ml-1">{selectedAMC.startDate}</span></div>
                  <div><span className="text-slate-400">End:</span> <span className="font-bold text-slate-800 ml-1">{selectedAMC.endDate}</span></div>
                  <div><span className="text-slate-400">Last Service:</span> <span className="font-bold text-slate-800 ml-1">{selectedAMC.lastService}</span></div>
                </div>
              </div>

              {selectedAMC.remarks && (
                <div className="bg-blue-50 border border-blue-100 rounded-xl p-3 text-xs text-blue-700 font-medium">
                  {selectedAMC.remarks}
                </div>
              )}

              <div className="flex gap-2">
                <Button variant="outline" size="sm" onClick={() => { showToast(`Calling ${selectedAMC.vendor}...`, 'info'); }} leftIcon={<Phone size={14} />}>
                  Contact Vendor
                </Button>
                <Button variant="outline" size="sm" onClick={() => { showToast(`Reminder set for ${selectedAMC.nextService}`, 'success'); }} leftIcon={<CalendarCheck size={14} />}>
                  Set Reminder
                </Button>
              </div>
            </div>
          )}
        </Modal>
      )}

      {/* Exhibition Detail Modal */}
      {activeView === 'exhibition' && (
        <Modal
          isOpen={isDetailOpen && !!selectedExhibition}
          onClose={() => { setIsDetailOpen(false); setSelectedExhibition(null); }}
          title={selectedExhibition ? `${selectedExhibition.serialNo} — Detail` : 'Exhibition Detail'}
          contentClassName="max-w-2xl"
          footer={
            <>
              <Button variant="ghost" size="sm" onClick={() => { setIsDetailOpen(false); setSelectedExhibition(null); }}>Close</Button>
              {selectedExhibition?.status === 'Deployed' && (
                <Button size="sm" onClick={() => { showToast('Return confirmed — item logged back to stock', 'success'); setIsDetailOpen(false); setSelectedExhibition(null); }} leftIcon={<RotateCcw size={14} />}>
                  Confirm Return
                </Button>
              )}
            </>
          }
        >
          {selectedExhibition && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                <div className="bg-slate-50 rounded-xl p-3 text-center">
                  <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1">Status</p>
                  <Badge variant={selectedExhibition.status === 'Returned' ? 'success' : selectedExhibition.status === 'Deployed' ? 'default' : 'error'}>
                    {selectedExhibition.status}
                  </Badge>
                </div>
                <div className="bg-slate-50 rounded-xl p-3 text-center">
                  <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1">Item</p>
                  <p className="text-xs font-bold text-slate-900">{selectedExhibition.itemName}</p>
                </div>
                <div className="bg-slate-50 rounded-xl p-3 text-center">
                  <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1">Condition</p>
                  <p className="text-xs font-bold text-slate-900">{selectedExhibition.condition}</p>
                </div>
                <div className="bg-slate-50 rounded-xl p-3 text-center">
                  <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1">Serial No</p>
                  <p className="text-xs font-bold text-slate-900 font-mono">{selectedExhibition.serialNo}</p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 text-xs">
                <div className="space-y-2">
                  <div><span className="text-slate-400">Event:</span> <span className="font-bold text-slate-800 ml-1">{selectedExhibition.event}</span></div>
                  <div><span className="text-slate-400">Venue:</span> <span className="font-bold text-slate-800 ml-1">{selectedExhibition.eventVenue}</span></div>
                  <div><span className="text-slate-400">Deployed:</span> <span className="font-bold text-slate-800 ml-1">{selectedExhibition.deployedDate}</span></div>
                  <div><span className="text-slate-400">Expected Return:</span> <span className="font-bold text-slate-800 ml-1">{selectedExhibition.expectedReturn}</span></div>
                </div>
                <div className="space-y-2">
                  <div><span className="text-slate-400">Responsible:</span> <span className="font-bold text-slate-800 ml-1">{selectedExhibition.assignedTo}</span></div>
                  <div className="flex items-center gap-1"><span className="text-slate-400">Location:</span> <MapPin size={10} className="text-slate-400" /> <span className="font-bold text-slate-800 ml-1">{selectedExhibition.currentLocation}</span></div>
                  {selectedExhibition.actualReturn && (
                    <div><span className="text-slate-400">Actual Return:</span> <span className="font-bold text-slate-800 ml-1">{selectedExhibition.actualReturn}</span></div>
                  )}
                </div>
              </div>

              {selectedExhibition.remarks && (
                <div className={`rounded-xl p-3 text-xs font-medium ${selectedExhibition.status === 'Lost' ? 'bg-rose-50 border border-rose-200 text-rose-700' : 'bg-blue-50 border border-blue-100 text-blue-700'}`}>
                  {selectedExhibition.remarks}
                </div>
              )}
            </div>
          )}
        </Modal>
      )}

      {/* Create AMC Modal */}
      <Modal
        isOpen={isCreateAMCOpen}
        onClose={() => setIsCreateAMCOpen(false)}
        title="Create AMC Contract"
        contentClassName="max-w-2xl"
        footer={
          <>
            <Button variant="ghost" size="sm" onClick={() => setIsCreateAMCOpen(false)}>Cancel</Button>
            <Button size="sm" onClick={() => { showToast('AMC contract created successfully', 'success'); setIsCreateAMCOpen(false); }}>Create Contract</Button>
          </>
        }
      >
        <div className="space-y-4">
          <Input label="Contract Number" required placeholder="e.g. AMC-2024-005" />
          <Input label="Equipment Name" required placeholder="e.g. CNC Machine — Haas VF2" />
          <Input label="Equipment ID" placeholder="e.g. CNC-001" />
          <div className="grid grid-cols-2 gap-4">
            <Select
              label="Service Vendor"
              onChange={() => {}}
              options={[
                { value: 'haas', label: 'Haas Service India' },
                { value: 'atlas', label: 'Atlas Copco Service' },
                { value: 'power', label: 'Power Solutions Ltd' },
                { value: 'cooltech', label: 'CoolTech Services' },
              ]}
              placeholder="Select vendor"
            />
            <Input label="Vendor Contact" placeholder="e.g. +91 98123 45678" />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <Input label="Contract Start" type="date" required />
            <Input label="Contract End" type="date" required />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <Input label="Annual Value (₹)" type="number" required placeholder="e.g. 180000" />
            <Select
              label="Service Frequency"
              onChange={() => {}}
              options={[
                { value: 'monthly', label: 'Monthly' },
                { value: 'bimonthly', label: 'Bi-Monthly' },
                { value: 'quarterly', label: 'Quarterly' },
                { value: 'halfyearly', label: 'Half-Yearly' },
                { value: 'yearly', label: 'Yearly' },
              ]}
              placeholder="Select frequency"
            />
          </div>
          <Input label="Service Scope" placeholder="e.g. Preventive maintenance + breakdown repair" />
          <Input label="Remarks" placeholder="e.g. Includes spindle calibration and coolant change" />
        </div>
      </Modal>

      {/* Create Exhibition Modal */}
      <Modal
        isOpen={isCreateExhibitionOpen}
        onClose={() => setIsCreateExhibitionOpen(false)}
        title="Send Material for Exhibition"
        contentClassName="max-w-2xl"
        footer={
          <>
            <Button variant="ghost" size="sm" onClick={() => setIsCreateExhibitionOpen(false)}>Cancel</Button>
            <Button size="sm" onClick={() => { showToast('Exhibition material dispatched — tracking enabled', 'success'); setIsCreateExhibitionOpen(false); }}>Dispatch Material</Button>
          </>
        }
      >
        <div className="space-y-4">
          <div className="bg-amber-50 border border-amber-100 rounded-xl p-3 text-xs text-amber-700 font-medium">
            Exhibition items are tracked separately and will show as "Deployed" until returned. A return reminder will be sent 2 days before expected return date.
          </div>
          <Input label="Item Name" required placeholder="e.g. PLC Demo Kit" />
          <Input label="Serial Number" required placeholder="e.g. DEMO-005" />
          <Input label="Event Name" required placeholder="e.g. Automation Expo 2024" />
          <Input label="Event Venue" required placeholder="e.g. BEC Mumbai" />
          <div className="grid grid-cols-2 gap-4">
            <Input label="Dispatch Date" type="date" required />
            <Input label="Expected Return" type="date" required />
          </div>
          <Select
            label="Responsible Person"
            onChange={() => {}}
            options={[
              { value: 'vikram', label: 'Vikram Singh — R&D' },
              { value: 'rajesh', label: 'Rajesh Verma — Quality' },
              { value: 'neha', label: 'Neha Gupta — Production' },
            ]}
            placeholder="Select person"
          />
          <Input label="Remarks" placeholder="e.g. Main demo unit — high priority return" />
        </div>
      </Modal>
    </PageLayout>
  );
};

export default AmcPage;
