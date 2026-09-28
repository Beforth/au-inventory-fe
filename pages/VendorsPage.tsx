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
  Download,
  Plus,
  Edit,
  Trash2,
  Star,
  Users,
  CheckCircle,
  XCircle,
  Package,
  CreditCard
} from 'lucide-react';

interface Vendor {
  id: string;
  code: string;
  name: string;
  contactPerson: string;
  phone: string;
  email: string;
  category: string;
  rating: number;
  status: string;
  paymentTerms: string;
  yearStarted: number;
  certifications: string;
  gstNumber: string;
  pan: string;
  bankName: string;
  accountNumber: string;
  ifsc: string;
  address: string;
  employeeCount: string;
  customers: string;
  guidelines: string;
  suppliedItems: { name: string; category: string; lastDate: string; lastPrice: string }[];
  assessment: {
    quality: number;
    delivery: number;
    price: number;
    communication: number;
    deliveryAccuracy: string;
    defectRate: string;
    responseTime: string;
    notes: string;
    lastAssessed: string;
  };
}

const VENDOR_CATEGORIES = [
  { value: 'electrical', label: 'Electrical Supplies' },
  { value: 'chemical', label: 'Chemical Supplies' },
  { value: 'structural', label: 'Structural Materials' },
  { value: 'safety', label: 'Safety Equipment' },
  { value: 'electronics', label: 'Electronics & Spares' },
  { value: 'general', label: 'General Supplies' },
];

const INITIAL_VENDORS: Vendor[] = [
  {
    id: '1', code: 'VND-001', name: 'SteelCorp Industries', contactPerson: 'Rajesh Kumar', phone: '+91 98765 43210', email: 'rajesh@steelcorp.in',
    category: 'Structural Materials', rating: 4, status: 'Active', paymentTerms: '30 Days', yearStarted: 2005, certifications: 'ISO 9001, ISO 14001',
    gstNumber: '06AABCS1234F1Z5', pan: 'AABCS1234F', bankName: 'HDFC Bank', accountNumber: '50100012345678', ifsc: 'HDFC0001234',
    address: 'Plot 15, Phase 2, Faridabad, Haryana', employeeCount: '150', customers: 'Aureole PharmaTech, Tata Steel, JSW',
    guidelines: 'Must deliver with test certificates for all structural items.',
    suppliedItems: [
      { name: 'Steel Sheet 3mm', category: 'Structural', lastDate: 'Jul 18, 2024', lastPrice: '₹2,800/bundle' },
      { name: 'Aluminium Rod 10mm', category: 'Structural', lastDate: 'Jul 10, 2024', lastPrice: '₹200/m' },
    ],
    assessment: { quality: 4, delivery: 4, price: 3, communication: 5, deliveryAccuracy: '92%', defectRate: '1.2%', responseTime: '< 4 hours', notes: 'Consistent quality and delivery. Price slightly above market average but justified by certifications.', lastAssessed: 'Oct 15, 2023' },
  },
  {
    id: '2', code: 'VND-002', name: 'ElectroParts Pvt Ltd', contactPerson: 'Priya Sharma', phone: '+91 87654 32109', email: 'priya@electroparts.in',
    category: 'Electrical Supplies', rating: 5, status: 'Active', paymentTerms: '15 Days', yearStarted: 2010, certifications: 'ISO 9001, IATF 16949',
    gstNumber: '27AABCE5678G1Z3', pan: 'AABCE5678G', bankName: 'ICICI Bank', accountNumber: '12345678901234', ifsc: 'ICIC0001234',
    address: '42 MIDC, Pune, Maharashtra', employeeCount: '85', customers: 'Aureole PharmaTech, Siemens, ABB',
    guidelines: 'QC certificates required for all electronic components.',
    suppliedItems: [
      { name: 'PLC-XYZ Control Module', category: 'Electronics', lastDate: 'Jul 18, 2024', lastPrice: '₹8,500/pc' },
      { name: 'Copper Wire 2.5mm', category: 'Electrical', lastDate: 'Jul 18, 2024', lastPrice: '₹420/kg' },
      { name: 'Relay Switch 24V', category: 'Electronics', lastDate: 'Jul 12, 2024', lastPrice: '₹350/pc' },
    ],
    assessment: { quality: 5, delivery: 5, price: 4, communication: 5, deliveryAccuracy: '98%', defectRate: '0.3%', responseTime: '< 2 hours', notes: 'Excellent vendor. Best quality and delivery performance. Recommended for critical components.', lastAssessed: 'Nov 20, 2023' },
  },
  {
    id: '3', code: 'VND-003', name: 'ChemSource Solutions', contactPerson: 'Amit Patel', phone: '+91 76543 21098', email: 'amit@chemsource.in',
    category: 'Chemical Supplies', rating: 3, status: 'Active', paymentTerms: '45 Days', yearStarted: 2015, certifications: 'ISO 9001',
    gstNumber: '24AABCC9012H1Z1', pan: 'AABCC9012H', bankName: 'SBI', accountNumber: '34567890123456', ifsc: 'SBIN0001234',
    address: '67 GIDC, Ahmedabad, Gujarat', employeeCount: '45', customers: 'Aureole PharmaTech, Lupin Pharma',
    guidelines: 'MSDS sheets mandatory for all chemical deliveries.',
    suppliedItems: [
      { name: 'Chemical Powder X200', category: 'Chemical', lastDate: 'Jun 20, 2024', lastPrice: '₹1,500/kg' },
      { name: 'Cleaning Solvent 5L', category: 'Chemical', lastDate: 'Jul 10, 2024', lastPrice: '₹750/L' },
    ],
    assessment: { quality: 3, delivery: 3, price: 4, communication: 3, deliveryAccuracy: '85%', defectRate: '3.5%', responseTime: '< 8 hours', notes: 'Average performance. Delivery delays observed in last quarter. Needs improvement.', lastAssessed: 'Sep 10, 2023' },
  },
  {
    id: '4', code: 'VND-004', name: 'SafeGear Co.', contactPerson: 'Neha Gupta', phone: '+91 65432 10987', email: 'neha@safegear.in',
    category: 'Safety Equipment', rating: 4, status: 'Active', paymentTerms: '30 Days', yearStarted: 2012, certifications: 'ISO 45001, CE Certified',
    gstNumber: '09AABCS3456I1Z9', pan: 'AABCS3456I', bankName: 'Axis Bank', accountNumber: '98765432101234', ifsc: 'UTIB0001234',
    address: '23 Sector 62, Noida, UP', employeeCount: '60', customers: 'Aureole PharmaTech, L&T, Reliance',
    guidelines: 'All safety equipment must carry CE/ISI marks.',
    suppliedItems: [
      { name: 'Safety Gloves (Pack)', category: 'Safety', lastDate: 'Jul 15, 2024', lastPrice: '₹600/box' },
    ],
    assessment: { quality: 4, delivery: 4, price: 4, communication: 4, deliveryAccuracy: '90%', defectRate: '1.8%', responseTime: '< 6 hours', notes: 'Good quality safety equipment. Consistent supply with CE certification.', lastAssessed: 'Dec 05, 2023' },
  },
  {
    id: '5', code: 'VND-005', name: 'TechSpares Hub', contactPerson: 'Vikram Singh', phone: '+91 54321 09876', email: 'vikram@techspares.in',
    category: 'Electronics & Spares', rating: 2, status: 'Inactive', paymentTerms: '30 Days', yearStarted: 2018, certifications: 'ISO 9001',
    gstNumber: '06AABCT7890J1Z7', pan: 'AABCT7890J', bankName: 'Kotak Bank', accountNumber: '11223344556677', ifsc: 'KKBK0001234',
    address: '89 Udyog Vihar, Gurgaon, Haryana', employeeCount: '20', customers: 'Aureole PharmaTech',
    guidelines: 'Minimum order value ₹10,000.',
    suppliedItems: [
      { name: 'Digital Multimeter', category: 'Tools', lastDate: 'Jun 15, 2024', lastPrice: '₹12,000/pc' },
    ],
    assessment: { quality: 2, delivery: 2, price: 3, communication: 2, deliveryAccuracy: '70%', defectRate: '8.5%', responseTime: '< 24 hours', notes: 'Below average. Multiple quality issues reported. Consider alternative vendors.', lastAssessed: 'Aug 15, 2023' },
  },
];

const StarRating: React.FC<{ rating: number; size?: number; interactive?: boolean; onChange?: (r: number) => void }> = ({ rating, size = 12, interactive = false, onChange }) => (
  <div className="flex items-center gap-0.5">
    {[1, 2, 3, 4, 5].map(star => (
      <button
        key={star}
        type="button"
        disabled={!interactive}
        onClick={(e) => { e.stopPropagation(); if (interactive && onChange) onChange(star); }}
        className={`${interactive ? 'cursor-pointer hover:scale-110' : 'cursor-default'} transition-transform`}
      >
        <Star
          size={size}
          className={star <= rating ? 'text-amber-400 fill-amber-400' : 'text-slate-200'}
          strokeWidth={2}
        />
      </button>
    ))}
  </div>
);

export const VendorsPage: React.FC = () => {
  const { showToast, globalSearch, setGlobalSearch } = useApp();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [editingVendor, setEditingVendor] = useState<Vendor | null>(null);
  const [selectedVendor, setSelectedVendor] = useState<Vendor | null>(null);
  const [activeTab, setActiveTab] = useState<'details' | 'assessment' | 'items'>('details');
  const [detailTab, setDetailTab] = useState<'info' | 'assessment' | 'items' | 'bank'>('info');

  const [formData, setFormData] = useState({
    code: '', name: '', contactPerson: '', phone: '', email: '', category: '', paymentTerms: '', yearStarted: '', certifications: '',
    gstNumber: '', pan: '', bankName: '', accountNumber: '', ifsc: '', address: '', employeeCount: '', customers: '', guidelines: '',
  });

  const filteredVendors = useMemo(() => {
    return INITIAL_VENDORS.filter(v =>
      v.name.toLowerCase().includes(globalSearch.toLowerCase()) ||
      v.code.toLowerCase().includes(globalSearch.toLowerCase()) ||
      v.contactPerson.toLowerCase().includes(globalSearch.toLowerCase())
    );
  }, [globalSearch]);

  const stats = useMemo(() => {
    const total = INITIAL_VENDORS.length;
    const active = INITIAL_VENDORS.filter(v => v.status === 'Active').length;
    const inactive = total - active;
    const avgRating = (INITIAL_VENDORS.reduce((sum, v) => sum + v.rating, 0) / total).toFixed(1);
    return { total, active, inactive, avgRating };
  }, []);

  const openCreateModal = () => {
    setEditingVendor(null);
    setActiveTab('details');
    setFormData({ code: '', name: '', contactPerson: '', phone: '', email: '', category: '', paymentTerms: '', yearStarted: '', certifications: '', gstNumber: '', pan: '', bankName: '', accountNumber: '', ifsc: '', address: '', employeeCount: '', customers: '', guidelines: '' });
    setIsModalOpen(true);
  };

  const openEditModal = (vendor: Vendor) => {
    setEditingVendor(vendor);
    setActiveTab('details');
    setFormData({
      code: vendor.code, name: vendor.name, contactPerson: vendor.contactPerson, phone: vendor.phone, email: vendor.email,
      category: vendor.category, paymentTerms: vendor.paymentTerms, yearStarted: String(vendor.yearStarted), certifications: vendor.certifications,
      gstNumber: vendor.gstNumber, pan: vendor.pan, bankName: vendor.bankName, accountNumber: vendor.accountNumber, ifsc: vendor.ifsc,
      address: vendor.address, employeeCount: vendor.employeeCount, customers: vendor.customers, guidelines: vendor.guidelines,
    });
    setIsModalOpen(true);
  };

  const openDetailModal = (vendor: Vendor) => {
    setSelectedVendor(vendor);
    setDetailTab('info');
    setIsDetailOpen(true);
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    showToast(editingVendor ? 'Vendor updated successfully' : 'New vendor added to registry', 'success');
    setIsModalOpen(false);
  };

  const columns: Column<Vendor>[] = [
    {
      key: 'name',
      label: 'Vendor Details',
      render: (v) => (
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-blue-50 rounded-lg flex items-center justify-center text-blue-500 font-bold text-xs border border-blue-100">
            {v.name.charAt(0)}
          </div>
          <div className="flex flex-col">
            <span className="text-xs font-bold text-slate-800 leading-none">{v.name}</span>
            <span className="text-xs font-mono text-slate-400 mt-1">{v.code}</span>
          </div>
        </div>
      )
    },
    { key: 'contactPerson', label: 'Contact Person', cellClassName: 'text-xs font-semibold text-slate-600' },
    { key: 'category', label: 'Category', cellClassName: 'text-xs font-semibold text-slate-500' },
    { key: 'rating', label: 'Rating', align: 'center', render: (v) => <StarRating rating={v.rating} /> },
    { key: 'paymentTerms', label: 'Payment', cellClassName: 'text-xs font-semibold text-slate-500' },
    { key: 'status', label: 'Status', align: 'center', render: (v) => <Badge variant={v.status === 'Active' ? 'success' : 'error'} className="py-0 h-5 flex items-center justify-center w-fit mx-auto">{v.status}</Badge> },
    {
      key: 'actions', label: '', sortable: false, align: 'right',
      render: (v) => (
        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
          <button onClick={(e) => { e.stopPropagation(); openEditModal(v); }} className="p-1.5 hover:bg-blue-50 rounded-lg transition-colors text-slate-300 hover:text-blue-600"><Edit size={14} /></button>
          <button onClick={(e) => { e.stopPropagation(); showToast(`Vendor ${v.code} removed`, 'info'); }} className="p-1.5 hover:bg-rose-50 rounded-lg transition-colors text-slate-300 hover:text-rose-500"><Trash2 size={14} /></button>
        </div>
      )
    }
  ];

  const actions = (
    <>
      <Button variant="outline" size="sm" className="rounded-full" onClick={() => showToast('Exporting vendor list...', 'info')} leftIcon={<Download size={14} />}>Export</Button>
      <Button size="sm" onClick={openCreateModal} leftIcon={<Plus size={14} strokeWidth={3} />}>Add Vendor</Button>
    </>
  );

  return (
    <PageLayout title="Vendor Registry" description="Manage suppliers, contacts, and performance ratings." actions={actions}>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard stat={{ label: 'Total Vendors', value: String(stats.total), change: 'All registered', trend: 'neutral', icon: Users }} />
        <StatCard stat={{ label: 'Active', value: String(stats.active), change: 'Currently supplying', trend: 'up', icon: CheckCircle }} />
        <StatCard stat={{ label: 'Inactive', value: String(stats.inactive), change: 'Not ordering', trend: 'down', icon: XCircle }} />
        <StatCard stat={{ label: 'Avg Rating', value: stats.avgRating, change: 'Out of 5 stars', trend: 'up', icon: Star }} />
      </div>

      <Card noPadding className="overflow-hidden">
        <div className="p-4 border-b border-slate-100 flex flex-wrap gap-4 items-center justify-between bg-white">
          <Input variant="white" inputSize="sm" className="max-w-md rounded-full shadow-sm" placeholder="Search vendors by name, code or contact..." value={globalSearch} onChange={(e) => setGlobalSearch(e.target.value)} icon={<Search size={14} className="text-slate-400" strokeWidth={2.5} />} />
        </div>
        <DataTable data={filteredVendors} columns={columns} rowKey={(v) => v.id} onRowClick={(v) => openDetailModal(v)} />
        <div className="p-4 border-t border-slate-100 flex items-center justify-between text-xs font-semibold text-slate-400 bg-slate-50/30">
          <p>Showing {filteredVendors.length} of {INITIAL_VENDORS.length} vendors</p>
          <div className="flex gap-2">
            <Button variant="outline" size="xs" disabled>Prev</Button>
            <Button variant="outline" size="xs">Next</Button>
          </div>
        </div>
      </Card>

      {/* Create/Edit Modal */}
      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title={editingVendor ? `Edit Vendor — ${editingVendor.name}` : 'Add New Vendor'} contentClassName="max-w-2xl"
        footer={<>
          <Button variant="ghost" size="sm" type="button" onClick={() => setIsModalOpen(false)}>Cancel</Button>
          <Button size="sm" type="submit" form="vendor-form">{editingVendor ? 'Save Changes' : 'Add Vendor'}</Button>
        </>}
      >
        <div className="flex gap-1 mb-5 border-b border-slate-100">
          {(['details', 'assessment', 'items'] as const).map((tab) => (
            <button key={tab} onClick={() => setActiveTab(tab)} className={`px-4 py-2.5 text-xs font-bold transition-colors border-b-2 ${activeTab === tab ? 'border-blue-600 text-blue-600' : 'border-transparent text-slate-400 hover:text-slate-600'}`}>
              {tab === 'details' ? 'Contact Details' : tab === 'assessment' ? 'Assessment' : 'Items Supplied'}
            </button>
          ))}
        </div>

        {activeTab === 'details' && (
          <form id="vendor-form" className="space-y-5" onSubmit={handleSave}>
            <div className="grid grid-cols-2 gap-4">
              <Input label="Vendor Code" required placeholder="e.g. VND-006" value={formData.code} onChange={(e) => setFormData({ ...formData, code: e.target.value })} />
              <Input label="Company Name" required placeholder="e.g. SteelCorp Industries" value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} />
            </div>
            <Input label="Contact Person" required placeholder="e.g. Rajesh Kumar" value={formData.contactPerson} onChange={(e) => setFormData({ ...formData, contactPerson: e.target.value })} />
            <div className="grid grid-cols-2 gap-4">
              <Input label="Phone" required placeholder="+91 98765 43210" value={formData.phone} onChange={(e) => setFormData({ ...formData, phone: e.target.value })} />
              <Input label="Email" type="email" required placeholder="vendor@example.in" value={formData.email} onChange={(e) => setFormData({ ...formData, email: e.target.value })} />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <Select label="Category" options={VENDOR_CATEGORIES} value={formData.category} onChange={(val) => setFormData({ ...formData, category: val as string })} placeholder="Select category" />
              <Input label="Payment Terms" placeholder="e.g. 30 Days" value={formData.paymentTerms} onChange={(e) => setFormData({ ...formData, paymentTerms: e.target.value })} />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <Input label="Year Started" type="number" placeholder="e.g. 2010" value={formData.yearStarted} onChange={(e) => setFormData({ ...formData, yearStarted: e.target.value })} />
              <Input label="Certifications" placeholder="e.g. ISO 9001, CE" value={formData.certifications} onChange={(e) => setFormData({ ...formData, certifications: e.target.value })} />
            </div>
            <Input label="Address" placeholder="Full address" value={formData.address} onChange={(e) => setFormData({ ...formData, address: e.target.value })} />
            <div className="grid grid-cols-2 gap-4">
              <Input label="GST Registration No." placeholder="e.g. 06AABCS1234F1Z5" value={formData.gstNumber} onChange={(e) => setFormData({ ...formData, gstNumber: e.target.value })} />
              <Input label="PAN" placeholder="e.g. AABCS1234F" value={formData.pan} onChange={(e) => setFormData({ ...formData, pan: e.target.value })} />
            </div>
            <div className="grid grid-cols-3 gap-4">
              <Input label="Bank Name" placeholder="e.g. HDFC Bank" value={formData.bankName} onChange={(e) => setFormData({ ...formData, bankName: e.target.value })} />
              <Input label="Account No." placeholder="Account number" value={formData.accountNumber} onChange={(e) => setFormData({ ...formData, accountNumber: e.target.value })} />
              <Input label="IFSC Code" placeholder="e.g. HDFC0001234" value={formData.ifsc} onChange={(e) => setFormData({ ...formData, ifsc: e.target.value })} />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <Input label="No. of Employees" type="number" placeholder="e.g. 150" value={formData.employeeCount} onChange={(e) => setFormData({ ...formData, employeeCount: e.target.value })} />
              <Input label="Key Customers" placeholder="e.g. Tata Steel, JSW" value={formData.customers} onChange={(e) => setFormData({ ...formData, customers: e.target.value })} />
            </div>
            <Input label="Guidelines / Special Instructions" placeholder="e.g. Must deliver with test certificates" value={formData.guidelines} onChange={(e) => setFormData({ ...formData, guidelines: e.target.value })} />
          </form>
        )}

        {activeTab === 'assessment' && (
          <div className="space-y-5">
            {editingVendor ? (
              <>
                <div className="flex items-center justify-between p-4 bg-slate-50 rounded-xl border border-slate-100">
                  <div>
                    <p className="text-xs font-bold text-slate-900">Overall Rating</p>
                    <p className="text-xs font-medium text-slate-400 mt-0.5">Last assessed on {editingVendor.assessment.lastAssessed}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <StarRating rating={editingVendor.rating} size={16} interactive onChange={(r) => showToast(`Rating updated to ${r}/5`, 'success')} />
                    <span className="text-lg font-bold text-slate-900">{editingVendor.rating}/5</span>
                  </div>
                </div>
                <div className="space-y-3">
                  {[
                    { label: 'Quality of Material', key: 'quality' as const },
                    { label: 'Delivery Timeliness', key: 'delivery' as const },
                    { label: 'Price Competitiveness', key: 'price' as const },
                    { label: 'Communication', key: 'communication' as const },
                  ].map((criteria) => (
                    <div key={criteria.key} className="flex items-center justify-between">
                      <span className="text-xs font-semibold text-slate-600">{criteria.label}</span>
                      <StarRating rating={editingVendor.assessment[criteria.key]} interactive onChange={(r) => showToast(`${criteria.label} updated to ${r}/5`, 'success')} />
                    </div>
                  ))}
                </div>
                <div className="grid grid-cols-3 gap-3">
                  <div className="bg-slate-50 rounded-lg p-3 border border-slate-100 text-center">
                    <p className="text-lg font-bold text-slate-900">{editingVendor.assessment.deliveryAccuracy}</p>
                    <p className="text-[10px] font-bold text-slate-400 uppercase">Delivery Accuracy</p>
                  </div>
                  <div className="bg-slate-50 rounded-lg p-3 border border-slate-100 text-center">
                    <p className="text-lg font-bold text-slate-900">{editingVendor.assessment.defectRate}</p>
                    <p className="text-[10px] font-bold text-slate-400 uppercase">Defect Rate</p>
                  </div>
                  <div className="bg-slate-50 rounded-lg p-3 border border-slate-100 text-center">
                    <p className="text-lg font-bold text-slate-900">{editingVendor.assessment.responseTime}</p>
                    <p className="text-[10px] font-bold text-slate-400 uppercase">Response Time</p>
                  </div>
                </div>
                <div className="p-4 bg-amber-50 rounded-xl border border-amber-100">
                  <p className="text-xs font-bold text-amber-800">Assessment Notes</p>
                  <p className="text-xs text-amber-700 mt-1 leading-relaxed">{editingVendor.assessment.notes}</p>
                </div>
              </>
            ) : (
              <div className="text-center py-8 text-slate-400 text-xs">Save the vendor first, then come back to fill the assessment.</div>
            )}
          </div>
        )}

        {activeTab === 'items' && (
          <div className="space-y-3">
            {editingVendor ? (
              editingVendor.suppliedItems.length > 0 ? (
                editingVendor.suppliedItems.map((item, idx) => (
                  <div key={idx} className="flex items-center justify-between p-3 bg-slate-50 rounded-lg border border-slate-100">
                    <div className="flex items-center gap-3">
                      <Package size={14} className="text-slate-400" />
                      <div>
                        <p className="text-xs font-bold text-slate-700">{item.name}</p>
                        <p className="text-[10px] font-semibold text-slate-400">{item.category}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-xs font-bold text-slate-700">{item.lastPrice}</p>
                      <p className="text-[10px] font-medium text-slate-400">{item.lastDate}</p>
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-xs text-slate-400 text-center py-4">No items mapped to this vendor yet.</p>
              )
            ) : (
              <div className="text-center py-8 text-slate-400 text-xs">Save the vendor first, then come back to add items.</div>
            )}
          </div>
        )}
      </Modal>

      {/* Detail View Modal */}
      <Modal isOpen={isDetailOpen} onClose={() => setIsDetailOpen(false)} title={selectedVendor ? `${selectedVendor.name} — ${selectedVendor.code}` : 'Vendor Details'} contentClassName="max-w-2xl"
        footer={<Button variant="ghost" size="sm" onClick={() => setIsDetailOpen(false)}>Close</Button>}
      >
        {selectedVendor && (
          <div className="space-y-4">
            <div className="flex gap-1 border-b border-slate-100">
              {(['info', 'assessment', 'items', 'bank'] as const).map((tab) => (
                <button key={tab} onClick={() => setDetailTab(tab)} className={`px-4 py-2.5 text-xs font-bold transition-colors border-b-2 ${detailTab === tab ? 'border-blue-600 text-blue-600' : 'border-transparent text-slate-400 hover:text-slate-600'}`}>
                  {tab === 'info' ? 'Info' : tab === 'assessment' ? 'Assessment' : tab === 'items' ? 'Items' : 'Bank Details'}
                </button>
              ))}
            </div>
            {detailTab === 'info' && (
              <div className="grid grid-cols-2 gap-3">
                {[
                  { label: 'Contact Person', value: selectedVendor.contactPerson },
                  { label: 'Phone', value: selectedVendor.phone },
                  { label: 'Email', value: selectedVendor.email },
                  { label: 'Category', value: selectedVendor.category },
                  { label: 'Payment Terms', value: selectedVendor.paymentTerms },
                  { label: 'Year Started', value: String(selectedVendor.yearStarted) },
                  { label: 'Certifications', value: selectedVendor.certifications },
                  { label: 'No. of Employees', value: selectedVendor.employeeCount },
                  { label: 'Key Customers', value: selectedVendor.customers },
                  { label: 'GST', value: selectedVendor.gstNumber },
                  { label: 'PAN', value: selectedVendor.pan },
                  { label: 'Address', value: selectedVendor.address },
                ].map((f) => (
                  <div key={f.label} className="bg-slate-50 rounded-lg p-2.5 border border-slate-100">
                    <p className="text-[10px] font-bold text-slate-400 uppercase">{f.label}</p>
                    <p className="text-xs font-semibold text-slate-700 mt-0.5">{f.value}</p>
                  </div>
                ))}
              </div>
            )}
            {detailTab === 'assessment' && (
              <div className="space-y-3">
                <div className="flex items-center gap-2"><StarRating rating={selectedVendor.rating} size={16} /><span className="text-lg font-bold text-slate-900">{selectedVendor.rating}/5</span></div>
                {[
                  { label: 'Quality', val: selectedVendor.assessment.quality },
                  { label: 'Delivery', val: selectedVendor.assessment.delivery },
                  { label: 'Price', val: selectedVendor.assessment.price },
                  { label: 'Communication', val: selectedVendor.assessment.communication },
                ].map((c) => (
                  <div key={c.label} className="flex items-center justify-between"><span className="text-xs font-semibold text-slate-600">{c.label}</span><StarRating rating={c.val} /></div>
                ))}
                <div className="p-3 bg-slate-50 rounded-lg border border-slate-100"><p className="text-xs text-slate-600">{selectedVendor.assessment.notes}</p></div>
              </div>
            )}
            {detailTab === 'items' && (
              <div className="space-y-2">
                {selectedVendor.suppliedItems.map((item, idx) => (
                  <div key={idx} className="flex items-center justify-between p-3 bg-slate-50 rounded-lg border border-slate-100">
                    <div className="flex items-center gap-2"><Package size={12} className="text-slate-400" /><span className="text-xs font-bold text-slate-700">{item.name}</span></div>
                    <span className="text-xs font-bold text-slate-600">{item.lastPrice}</span>
                  </div>
                ))}
              </div>
            )}
            {detailTab === 'bank' && (
              <div className="grid grid-cols-2 gap-3">
                {[
                  { label: 'Bank Name', value: selectedVendor.bankName },
                  { label: 'Account Number', value: selectedVendor.accountNumber },
                  { label: 'IFSC Code', value: selectedVendor.ifsc },
                  { label: 'GST Number', value: selectedVendor.gstNumber },
                ].map((f) => (
                  <div key={f.label} className="bg-slate-50 rounded-lg p-2.5 border border-slate-100">
                    <p className="text-[10px] font-bold text-slate-400 uppercase">{f.label}</p>
                    <p className="text-xs font-semibold text-slate-700 mt-0.5 font-mono">{f.value}</p>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </Modal>
    </PageLayout>
  );
};

export default VendorsPage;
