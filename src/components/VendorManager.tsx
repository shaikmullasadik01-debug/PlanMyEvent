import React, { useState, useMemo } from 'react';
import {
  Store,
  Plus,
  Search,
  Filter,
  CheckCircle2,
  Clock,
  ExternalLink,
  Phone,
  Mail,
  MapPin,
  Trash2,
  Edit2,
  DollarSign,
  X,
  ShieldCheck,
  Star,
} from 'lucide-react';
import { FullEventData, Vendor, VendorCategory, BookingStatus, ContractStatus, PaymentStatus } from '../types/index.ts';
import { formatCurrency, formatDate } from '../utils/formatters.ts';
import { api } from '../services/api.ts';

interface VendorManagerProps {
  eventData: FullEventData;
  onRefresh: () => void;
}

export const VendorManager: React.FC<VendorManagerProps> = ({ eventData, onRefresh }) => {
  const { event, vendors, categories } = eventData;

  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedStatus, setSelectedStatus] = useState<string>('all');
  const [onlyShortlisted, setOnlyShortlisted] = useState<boolean>(false);
  const [isAddVendorOpen, setIsAddVendorOpen] = useState<boolean>(false);

  // New Vendor Form
  const [vendorForm, setVendorForm] = useState({
    name: '',
    category: 'venue' as VendorCategory,
    location: '',
    contactName: '',
    email: '',
    phone: '',
    website: '',
    quotedPrice: '',
    contractStatus: 'draft' as ContractStatus,
    paymentStatus: 'unpaid' as PaymentStatus,
    bookingStatus: 'researching' as BookingStatus,
    notes: '',
  });

  const categoriesList: { id: VendorCategory; label: string }[] = [
    { id: 'venue', label: 'Venues' },
    { id: 'catering', label: 'Caterers & Food' },
    { id: 'photography', label: 'Photographers & Film' },
    { id: 'decor', label: 'Decor & Florals' },
    { id: 'entertainment', label: 'Music & Entertainment' },
    { id: 'makeup', label: 'Styling & Makeup' },
    { id: 'transport', label: 'Transport & Logistics' },
    { id: 'rentals', label: 'Equipment Rentals' },
    { id: 'coordinator', label: 'Event Coordinators' },
    { id: 'other', label: 'Other Services' },
  ];

  // Stats
  const confirmedVendors = vendors.filter(v => v.bookingStatus === 'confirmed');
  const totalQuoted = vendors.reduce((s, v) => s + (v.quotedPrice || 0), 0);
  const totalConfirmedSpend = confirmedVendors.reduce((s, v) => s + (v.quotedPrice || 0), 0);

  // Filtered vendors
  const filteredVendors = useMemo(() => {
    return vendors.filter(v => {
      const matchesSearch =
        v.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        v.contactName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        v.location.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesCategory = selectedCategory === 'all' || v.category === selectedCategory;
      const matchesStatus = selectedStatus === 'all' || v.bookingStatus === selectedStatus;
      const matchesShortlist = !onlyShortlisted || v.bookingStatus === 'shortlisted' || v.bookingStatus === 'confirmed';
      return matchesSearch && matchesCategory && matchesStatus && matchesShortlist;
    });
  }, [vendors, searchTerm, selectedCategory, selectedStatus, onlyShortlisted]);

  // Handlers
  const handleCreateVendor = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!vendorForm.name) return;

    try {
      await api.addVendor(event.id, {
        name: vendorForm.name,
        category: vendorForm.category,
        location: vendorForm.location,
        contactName: vendorForm.contactName,
        email: vendorForm.email,
        phone: vendorForm.phone,
        website: vendorForm.website,
        quotedPrice: Number(vendorForm.quotedPrice || 0),
        contractStatus: vendorForm.contractStatus,
        paymentStatus: vendorForm.paymentStatus,
        bookingStatus: vendorForm.bookingStatus,
        notes: vendorForm.notes,
      });
      setIsAddVendorOpen(false);
      setVendorForm({
        name: '',
        category: 'venue',
        location: '',
        contactName: '',
        email: '',
        phone: '',
        website: '',
        quotedPrice: '',
        contractStatus: 'draft',
        paymentStatus: 'unpaid',
        bookingStatus: 'researching',
        notes: '',
      });
      onRefresh();
    } catch (err) {
      console.error(err);
    }
  };

  const handleUpdateStatus = async (vendor: Vendor, newStatus: BookingStatus) => {
    try {
      await api.updateVendor(event.id, vendor.id, { bookingStatus: newStatus });
      onRefresh();
    } catch (err) {
      console.error(err);
    }
  };

  const handleDeleteVendor = async (vId: string) => {
    if (!window.confirm('Delete this vendor record?')) return;
    try {
      await api.deleteVendor(event.id, vId);
      onRefresh();
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-[#E8E2D8]">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-[#C5A859]">
            <span>Vendor Coordination</span>
            <span>·</span>
            <span>Quotes & Contracts</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold font-serif text-[#1B3B2B]">
            Vendor Discovery & Comparison
          </h1>
        </div>

        <button
          onClick={() => setIsAddVendorOpen(true)}
          className="px-4 py-2 text-xs font-semibold text-white bg-[#1B3B2B] hover:bg-[#142B20] rounded-lg shadow-sm transition-all flex items-center gap-1.5 self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>Add Vendor</span>
        </button>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-xl border border-[#E8E2D8] space-y-1">
          <p className="text-[11px] font-semibold text-[#6B7D73] uppercase tracking-wider">
            Total Vendors
          </p>
          <p className="text-2xl font-bold font-mono text-[#1B3B2B] tabular-nums">
            {vendors.length}
          </p>
          <p className="text-[11px] text-[#6B7D73]">Under evaluation</p>
        </div>

        <div className="bg-white p-4 rounded-xl border border-[#E8E2D8] space-y-1">
          <p className="text-[11px] font-semibold text-[#6B7D73] uppercase tracking-wider">
            Confirmed Bookings
          </p>
          <p className="text-2xl font-bold font-mono text-emerald-700 tabular-nums">
            {confirmedVendors.length}
          </p>
          <p className="text-[11px] text-[#6B7D73]">Contracts signed</p>
        </div>

        <div className="bg-white p-4 rounded-xl border border-[#E8E2D8] space-y-1">
          <p className="text-[11px] font-semibold text-[#6B7D73] uppercase tracking-wider">
            Confirmed Commitments
          </p>
          <p className="text-2xl font-bold font-mono text-[#1B3B2B] tabular-nums">
            {formatCurrency(totalConfirmedSpend, event.currency)}
          </p>
          <p className="text-[11px] text-[#6B7D73]">Secured vendor spend</p>
        </div>

        <div className="bg-white p-4 rounded-xl border border-[#E8E2D8] space-y-1">
          <p className="text-[11px] font-semibold text-[#6B7D73] uppercase tracking-wider">
            Shortlist Ratio
          </p>
          <p className="text-2xl font-bold font-mono text-[#1B3B2B] tabular-nums">
            {vendors.filter(v => v.bookingStatus === 'shortlisted').length} / {vendors.length}
          </p>
          <p className="text-[11px] text-[#6B7D73]">Top evaluated candidates</p>
        </div>
      </div>

      {/* Comparison Table Card */}
      <div className="bg-white rounded-2xl border border-[#E8E2D8] shadow-sm p-6 space-y-4">
        {/* Filter bar */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <h3 className="text-base font-bold font-serif text-[#1B3B2B]">
            Vendor Comparison Matrix ({filteredVendors.length})
          </h3>

          <div className="flex flex-wrap items-center gap-2">
            <div className="relative">
              <Search className="w-3.5 h-3.5 text-[#8C9B92] absolute left-2.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search vendor name, contact..."
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
                className="pl-8 pr-3 py-1.5 text-xs bg-[#FAF8F5] border border-[#DDD5C7] rounded-lg text-[#1B3B2B] focus:outline-none focus:ring-1 focus:ring-[#1B3B2B] w-48 sm:w-56"
              />
            </div>

            <select
              value={selectedCategory}
              onChange={e => setSelectedCategory(e.target.value)}
              className="px-2.5 py-1.5 text-xs bg-[#FAF8F5] border border-[#DDD5C7] rounded-lg text-[#1B3B2B]"
            >
              <option value="all">All Categories</option>
              {categoriesList.map(c => (
                <option key={c.id} value={c.id}>
                  {c.label}
                </option>
              ))}
            </select>

            <select
              value={selectedStatus}
              onChange={e => setSelectedStatus(e.target.value)}
              className="px-2.5 py-1.5 text-xs bg-[#FAF8F5] border border-[#DDD5C7] rounded-lg text-[#1B3B2B]"
            >
              <option value="all">All Booking Statuses</option>
              <option value="researching">Researching</option>
              <option value="contacted">Contacted</option>
              <option value="shortlisted">Shortlisted</option>
              <option value="confirmed">Confirmed</option>
              <option value="rejected">Rejected</option>
            </select>

            <button
              onClick={() => setOnlyShortlisted(!onlyShortlisted)}
              className={`px-3 py-1.5 text-xs font-medium rounded-lg border transition-colors ${
                onlyShortlisted
                  ? 'bg-[#1B3B2B] text-white border-[#1B3B2B]'
                  : 'bg-[#FAF8F5] text-[#4A5750] border-[#DDD5C7]'
              }`}
            >
              ★ Shortlist Only
            </button>
          </div>
        </div>

        {/* Comparison Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-[#FAF8F5] border-y border-[#E8E2D8] text-[#6B7D73] font-semibold">
              <tr>
                <th className="py-2.5 px-3">Vendor / Service</th>
                <th className="py-2.5 px-3">Category</th>
                <th className="py-2.5 px-3">Contact Person & Info</th>
                <th className="py-2.5 px-3 text-right">Quoted Price</th>
                <th className="py-2.5 px-3">Contract</th>
                <th className="py-2.5 px-3">Payment</th>
                <th className="py-2.5 px-3">Booking Status</th>
                <th className="py-2.5 px-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#F0EBE3]">
              {filteredVendors.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-8 text-center text-[#8C9B92]">
                    No vendors listed. Click "Add Vendor" to start comparing partners.
                  </td>
                </tr>
              ) : (
                filteredVendors.map(vendor => (
                  <tr key={vendor.id} className="hover:bg-[#FAF8F5] transition-colors">
                    <td className="py-3 px-3 font-medium text-[#1B3B2B]">
                      <div className="flex items-center gap-1.5">
                        <span className="font-semibold text-sm">{vendor.name}</span>
                        {vendor.bookingStatus === 'confirmed' && (
                          <span title="Confirmed Booking">
                            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                          </span>
                        )}
                      </div>
                      {vendor.location && (
                        <p className="text-[10px] text-[#6B7D73] flex items-center gap-1 mt-0.5">
                          <MapPin className="w-3 h-3 text-[#8C9B92]" />
                          <span>{vendor.location}</span>
                        </p>
                      )}
                      {vendor.notes && (
                        <p className="text-[10px] text-[#52635A] mt-1 line-clamp-1 italic">
                          "{vendor.notes}"
                        </p>
                      )}
                    </td>

                    <td className="py-3 px-3 capitalize text-[#52635A]">
                      {vendor.category}
                    </td>

                    <td className="py-3 px-3 text-[#52635A] space-y-0.5">
                      <p className="font-medium text-[#1B3B2B]">{vendor.contactName || '—'}</p>
                      <div className="flex items-center gap-2 text-[10px] text-[#6B7D73]">
                        {vendor.phone && (
                          <span className="flex items-center gap-0.5">
                            <Phone className="w-2.5 h-2.5" />
                            <span>{vendor.phone}</span>
                          </span>
                        )}
                        {vendor.email && (
                          <span className="flex items-center gap-0.5">
                            <Mail className="w-2.5 h-2.5" />
                            <span>{vendor.email}</span>
                          </span>
                        )}
                      </div>
                    </td>

                    <td className="py-3 px-3 text-right font-mono font-bold tabular-nums text-[#1B3B2B]">
                      {formatCurrency(vendor.quotedPrice, event.currency)}
                    </td>

                    <td className="py-3 px-3">
                      <span
                        className={`text-[11px] font-medium capitalize ${
                          vendor.contractStatus === 'signed'
                            ? 'text-emerald-700'
                            : vendor.contractStatus === 'under_review'
                            ? 'text-amber-700'
                            : 'text-[#6B7D73]'
                        }`}
                      >
                        {vendor.contractStatus.replace('_', ' ')}
                      </span>
                    </td>

                    <td className="py-3 px-3">
                      <span
                        className={`text-[11px] font-medium capitalize ${
                          vendor.paymentStatus === 'paid'
                            ? 'text-emerald-700'
                            : vendor.paymentStatus === 'deposit_paid'
                            ? 'text-amber-700'
                            : 'text-[#6B7D73]'
                        }`}
                      >
                        {vendor.paymentStatus.replace('_', ' ')}
                      </span>
                    </td>

                    <td className="py-3 px-3">
                      <select
                        value={vendor.bookingStatus}
                        onChange={e => handleUpdateStatus(vendor, e.target.value as BookingStatus)}
                        className={`px-2 py-1 text-[11px] font-semibold rounded-md border text-left ${
                          vendor.bookingStatus === 'confirmed'
                            ? 'bg-emerald-50 text-emerald-800 border-emerald-300'
                            : vendor.bookingStatus === 'shortlisted'
                            ? 'bg-amber-50 text-amber-800 border-amber-300'
                            : 'bg-white text-[#4A5750] border-[#DDD5C7]'
                        }`}
                      >
                        <option value="researching">Researching</option>
                        <option value="contacted">Contacted</option>
                        <option value="shortlisted">Shortlisted</option>
                        <option value="confirmed">Confirmed</option>
                        <option value="rejected">Rejected</option>
                      </select>
                    </td>

                    <td className="py-3 px-3 text-right">
                      <button
                        onClick={() => handleDeleteVendor(vendor.id)}
                        className="p-1 text-[#8C9B92] hover:text-red-600 transition-colors"
                        title="Delete vendor"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add Vendor Modal */}
      {isAddVendorOpen && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#FAF8F5] rounded-2xl border border-[#E8E2D8] shadow-xl w-full max-w-lg overflow-hidden p-6 space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-[#E8E2D8]">
              <h3 className="text-base font-bold font-serif text-[#1B3B2B]">Add Vendor Partner</h3>
              <button onClick={() => setIsAddVendorOpen(false)} className="text-[#8C9B92] hover:text-[#1B3B2B]">
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCreateVendor} className="space-y-3 text-xs">
              <div>
                <label className="block font-semibold text-[#1B3B2B] mb-1">Company / Vendor Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Royal Cuisines Catering"
                  value={vendorForm.name}
                  onChange={e => setVendorForm({ ...vendorForm, name: e.target.value })}
                  className="w-full bg-white border border-[#DDD5C7] rounded-lg px-3 py-2 text-xs text-[#1E2522]"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-[#1B3B2B] mb-1">Category</label>
                  <select
                    value={vendorForm.category}
                    onChange={e => setVendorForm({ ...vendorForm, category: e.target.value as VendorCategory })}
                    className="w-full bg-white border border-[#DDD5C7] rounded-lg px-2.5 py-2 text-xs text-[#1E2522]"
                  >
                    {categoriesList.map(c => (
                      <option key={c.id} value={c.id}>
                        {c.label}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block font-semibold text-[#1B3B2B] mb-1">Location / City</label>
                  <input
                    type="text"
                    placeholder="e.g. Jaipur, Rajasthan"
                    value={vendorForm.location}
                    onChange={e => setVendorForm({ ...vendorForm, location: e.target.value })}
                    className="w-full bg-white border border-[#DDD5C7] rounded-lg px-3 py-2 text-xs text-[#1E2522]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block font-semibold text-[#1B3B2B] mb-1">Contact Name</label>
                  <input
                    type="text"
                    placeholder="e.g. Harishwar"
                    value={vendorForm.contactName}
                    onChange={e => setVendorForm({ ...vendorForm, contactName: e.target.value })}
                    className="w-full bg-white border border-[#DDD5C7] rounded-lg px-3 py-2 text-xs text-[#1E2522]"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-[#1B3B2B] mb-1">Phone</label>
                  <input
                    type="text"
                    placeholder="+91..."
                    value={vendorForm.phone}
                    onChange={e => setVendorForm({ ...vendorForm, phone: e.target.value })}
                    className="w-full bg-white border border-[#DDD5C7] rounded-lg px-3 py-2 text-xs text-[#1E2522]"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-[#1B3B2B] mb-1">Email</label>
                  <input
                    type="email"
                    placeholder="contact@..."
                    value={vendorForm.email}
                    onChange={e => setVendorForm({ ...vendorForm, email: e.target.value })}
                    className="w-full bg-white border border-[#DDD5C7] rounded-lg px-3 py-2 text-xs text-[#1E2522]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-[#1B3B2B] mb-1">Quoted Price ({event.currency})</label>
                  <input
                    type="number"
                    min="0"
                    placeholder="0"
                    value={vendorForm.quotedPrice}
                    onChange={e => setVendorForm({ ...vendorForm, quotedPrice: e.target.value })}
                    className="w-full bg-white border border-[#DDD5C7] rounded-lg px-3 py-2 text-xs font-mono font-bold text-[#1B3B2B]"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-[#1B3B2B] mb-1">Initial Booking Status</label>
                  <select
                    value={vendorForm.bookingStatus}
                    onChange={e => setVendorForm({ ...vendorForm, bookingStatus: e.target.value as BookingStatus })}
                    className="w-full bg-white border border-[#DDD5C7] rounded-lg px-2.5 py-2 text-xs text-[#1E2522]"
                  >
                    <option value="researching">Researching</option>
                    <option value="contacted">Contacted</option>
                    <option value="shortlisted">Shortlisted</option>
                    <option value="confirmed">Confirmed</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-semibold text-[#1B3B2B] mb-1">Contract Scope & Deliverables</label>
                <textarea
                  rows={2}
                  placeholder="Included items, live counters, hours of service, overtime rates..."
                  value={vendorForm.notes}
                  onChange={e => setVendorForm({ ...vendorForm, notes: e.target.value })}
                  className="w-full bg-white border border-[#DDD5C7] rounded-lg p-2.5 text-xs text-[#1E2522]"
                />
              </div>

              <div className="pt-3 flex justify-end gap-2 border-t border-[#E8E2D8]">
                <button
                  type="button"
                  onClick={() => setIsAddVendorOpen(false)}
                  className="px-3 py-1.5 text-xs text-[#4A5750] hover:bg-[#F2EDE4] rounded-lg"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 text-xs font-semibold text-white bg-[#1B3B2B] hover:bg-[#142B20] rounded-lg shadow-sm"
                >
                  Save Vendor
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
