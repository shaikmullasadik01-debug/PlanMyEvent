import React, { useState, useMemo } from 'react';
import {
  DollarSign,
  Plus,
  Sparkles,
  TrendingDown,
  AlertTriangle,
  Download,
  Search,
  Filter,
  CheckCircle2,
  Trash2,
  Edit2,
  PieChart as PieIcon,
  BarChart2,
  X,
  Loader2,
} from 'lucide-react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from 'recharts';
import { FullEventData, BudgetCategory, Expense } from '../types/index.ts';
import { formatCurrency } from '../utils/formatters.ts';
import { api } from '../services/api.ts';

interface BudgetManagerProps {
  eventData: FullEventData;
  onRefresh: () => void;
}

export const BudgetManager: React.FC<BudgetManagerProps> = ({ eventData, onRefresh }) => {
  const { event, categories, expenses } = eventData;

  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategoryFilter, setSelectedCategoryFilter] = useState('all');
  const [selectedStatusFilter, setSelectedStatusFilter] = useState('all');
  const [isAddExpenseOpen, setIsAddExpenseOpen] = useState(false);
  const [isAddCategoryOpen, setIsAddCategoryOpen] = useState(false);
  const [isOptimizerOpen, setIsOptimizerOpen] = useState(false);
  const [isOptimizing, setIsOptimizing] = useState(false);
  const [optimizationResult, setOptimizationResult] = useState<any>(null);

  // New Expense Form State
  const [expenseForm, setExpenseForm] = useState({
    title: '',
    categoryId: categories[0]?.id || '',
    amount: '',
    paidAmount: '',
    status: 'planned',
    dueDate: new Date().toISOString().split('T')[0],
    vendorName: '',
    notes: '',
  });

  // New Category Form State
  const [categoryForm, setCategoryForm] = useState({
    name: '',
    allocated: '',
    notes: '',
  });

  // Strict verified arithmetic calculations
  const totalBudget = Number(event.totalBudget) || 0;
  const totalAllocated = useMemo(() => {
    return categories.reduce((sum, c) => sum + (Number(c.allocated) || 0), 0);
  }, [categories]);

  const totalSpent = useMemo(() => {
    return expenses.reduce((sum, e) => sum + (Number(e.amount) || 0), 0);
  }, [expenses]);

  const totalPaid = useMemo(() => {
    return expenses.reduce((sum, e) => sum + (Number(e.paidAmount) || 0), 0);
  }, [expenses]);

  const remainingBudget = totalBudget - totalSpent;
  const pendingPayments = totalSpent - totalPaid;
  const perGuestCost = event.guestCount > 0 ? totalSpent / event.guestCount : 0;
  const allocationDelta = totalBudget - totalAllocated;

  // Chart Data preparation
  const chartData = useMemo(() => {
    return categories.map(cat => {
      const catExpenses = expenses.filter(e => e.categoryId === cat.id);
      const actual = catExpenses.reduce((s, e) => s + e.amount, 0);
      const paid = catExpenses.reduce((s, e) => s + e.paidAmount, 0);
      return {
        name: cat.name.length > 15 ? cat.name.slice(0, 13) + '..' : cat.name,
        fullName: cat.name,
        Allocated: cat.allocated,
        Actual: actual,
        Paid: paid,
      };
    });
  }, [categories, expenses]);

  const pieColors = ['#1B3B2B', '#C5A859', '#3D6B52', '#D88A34', '#8C3D2B', '#5A7566', '#B39C69', '#2E523F'];

  // Filtered expenses
  const filteredExpenses = useMemo(() => {
    return expenses.filter(exp => {
      const matchesSearch =
        exp.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (exp.vendorName && exp.vendorName.toLowerCase().includes(searchTerm.toLowerCase()));
      const matchesCategory = selectedCategoryFilter === 'all' || exp.categoryId === selectedCategoryFilter;
      const matchesStatus = selectedStatusFilter === 'all' || exp.status === selectedStatusFilter;
      return matchesSearch && matchesCategory && matchesStatus;
    });
  }, [expenses, searchTerm, selectedCategoryFilter, selectedStatusFilter]);

  // Handlers
  const handleCreateExpense = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!expenseForm.title || !expenseForm.amount) return;

    try {
      await api.addExpense(event.id, {
        categoryId: expenseForm.categoryId || categories[0]?.id,
        title: expenseForm.title,
        amount: Number(expenseForm.amount),
        paidAmount: Number(expenseForm.paidAmount || 0),
        status: expenseForm.status as any,
        dueDate: expenseForm.dueDate,
        vendorName: expenseForm.vendorName,
        notes: expenseForm.notes,
      });
      setIsAddExpenseOpen(false);
      setExpenseForm({
        title: '',
        categoryId: categories[0]?.id || '',
        amount: '',
        paidAmount: '',
        status: 'planned',
        dueDate: new Date().toISOString().split('T')[0],
        vendorName: '',
        notes: '',
      });
      onRefresh();
    } catch (err) {
      console.error(err);
    }
  };

  const handleCreateCategory = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!categoryForm.name || !categoryForm.allocated) return;

    try {
      await api.addCategory(event.id, {
        name: categoryForm.name,
        allocated: Number(categoryForm.allocated),
        notes: categoryForm.notes,
      });
      setIsAddCategoryOpen(false);
      setCategoryForm({ name: '', allocated: '', notes: '' });
      onRefresh();
    } catch (err) {
      console.error(err);
    }
  };

  const handleDeleteExpense = async (expId: string) => {
    if (!window.confirm('Are you sure you want to delete this expense?')) return;
    try {
      await api.deleteExpense(event.id, expId);
      onRefresh();
    } catch (err) {
      console.error(err);
    }
  };

  const handleRunOptimizer = async () => {
    setIsOptimizing(true);
    try {
      const result = await api.optimizeBudget(event.id, 15);
      setOptimizationResult(result);
    } catch (err) {
      console.error(err);
    } finally {
      setIsOptimizing(false);
    }
  };

  const handleExportCSV = () => {
    const headers = ['Category', 'Expense Title', 'Vendor', 'Amount', 'Paid Amount', 'Status', 'Due Date', 'Notes'];
    const rows = expenses.map(e => [
      `"${e.categoryName}"`,
      `"${e.title}"`,
      `"${e.vendorName || ''}"`,
      e.amount,
      e.paidAmount,
      e.status,
      e.dueDate,
      `"${e.notes || ''}"`,
    ]);
    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `${event.name.replace(/\s+/g, '_')}_budget_ledger.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-8">
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-[#E8E2D8]">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-[#C5A859]">
            <span>Financial Command Center</span>
            <span>·</span>
            <span>{event.currency}</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold font-serif text-[#1B3B2B]">
            Smart Budget & Expense Manager
          </h1>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <button
            onClick={() => {
              setIsOptimizerOpen(true);
              if (!optimizationResult) handleRunOptimizer();
            }}
            className="px-3.5 py-2 text-xs font-semibold text-[#1B3B2B] bg-[#F2EDE4] hover:bg-[#EAE4D7] border border-[#DDD5C7] rounded-lg transition-colors flex items-center gap-1.5"
          >
            <Sparkles className="w-3.5 h-3.5 text-[#C5A859]" />
            <span>AI Budget Optimizer</span>
          </button>

          <button
            onClick={handleExportCSV}
            className="px-3.5 py-2 text-xs font-semibold text-[#4A5750] bg-white hover:bg-[#FAF8F5] border border-[#DDD5C7] rounded-lg transition-colors flex items-center gap-1.5"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Export CSV</span>
          </button>

          <button
            onClick={() => setIsAddExpenseOpen(true)}
            className="px-4 py-2 text-xs font-semibold text-white bg-[#1B3B2B] hover:bg-[#142B20] rounded-lg shadow-sm transition-all flex items-center gap-1.5"
          >
            <Plus className="w-4 h-4" />
            <span>Add Expense</span>
          </button>
        </div>
      </div>

      {/* Warnings & Alerts */}
      {remainingBudget < 0 && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-xl flex items-start gap-3 text-xs text-red-900">
          <AlertTriangle className="w-5 h-5 text-red-600 shrink-0 mt-0.5" />
          <div>
            <p className="font-bold">Budget Exceeded Warning</p>
            <p className="mt-0.5 text-red-800">
              Total expenses ({formatCurrency(totalSpent, event.currency)}) have exceeded your target budget ({formatCurrency(totalBudget, event.currency)}) by{' '}
              <span className="font-mono font-bold">{formatCurrency(Math.abs(remainingBudget), event.currency)}</span>. Use the AI Budget Optimizer to locate high-impact savings.
            </p>
          </div>
        </div>
      )}

      {allocationDelta !== 0 && (
        <div className="p-3 bg-[#FAF4EB] border border-[#E5DAC8] rounded-xl flex items-center justify-between text-xs text-[#6B5635]">
          <div className="flex items-center gap-2">
            <span className="font-semibold">Category Allocation Status:</span>
            <span>
              {allocationDelta > 0
                ? `${formatCurrency(allocationDelta, event.currency)} unallocated reserve remaining`
                : `${formatCurrency(Math.abs(allocationDelta), event.currency)} over-allocated across categories`}
            </span>
          </div>
          <button
            onClick={() => setIsAddCategoryOpen(true)}
            className="text-[11px] font-semibold text-[#1B3B2B] hover:underline"
          >
            + Add / Adjust Category
          </button>
        </div>
      )}

      {/* Top Metric Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-xl border border-[#E8E2D8] shadow-sm space-y-1">
          <p className="text-[11px] font-semibold text-[#6B7D73] uppercase tracking-wider">
            Total Budget
          </p>
          <p className="text-2xl font-bold font-mono text-[#1B3B2B] tabular-nums">
            {formatCurrency(totalBudget, event.currency)}
          </p>
          <p className="text-[11px] text-[#6B7D73]">
            Target ceiling set in wizard
          </p>
        </div>

        <div className="bg-white p-5 rounded-xl border border-[#E8E2D8] shadow-sm space-y-1">
          <p className="text-[11px] font-semibold text-[#6B7D73] uppercase tracking-wider">
            Actual Spent
          </p>
          <p className="text-2xl font-bold font-mono text-[#1B3B2B] tabular-nums">
            {formatCurrency(totalSpent, event.currency)}
          </p>
          <div className="w-full bg-[#EAE4D7] h-1.5 rounded-full mt-2 overflow-hidden">
            <div
              className={`h-full ${totalSpent > totalBudget ? 'bg-red-500' : 'bg-[#1B3B2B]'}`}
              style={{ width: `${Math.min(100, (totalSpent / (totalBudget || 1)) * 100)}%` }}
            />
          </div>
        </div>

        <div className="bg-white p-5 rounded-xl border border-[#E8E2D8] shadow-sm space-y-1">
          <p className="text-[11px] font-semibold text-[#6B7D73] uppercase tracking-wider">
            Remaining Funds
          </p>
          <p className={`text-2xl font-bold font-mono tabular-nums ${remainingBudget < 0 ? 'text-red-600' : 'text-emerald-700'}`}>
            {formatCurrency(remainingBudget, event.currency)}
          </p>
          <p className="text-[11px] text-[#6B7D73]">
            {Math.max(0, Math.round((remainingBudget / (totalBudget || 1)) * 100))}% cushion left
          </p>
        </div>

        <div className="bg-white p-5 rounded-xl border border-[#E8E2D8] shadow-sm space-y-1">
          <p className="text-[11px] font-semibold text-[#6B7D73] uppercase tracking-wider">
            Per-Guest Spend
          </p>
          <p className="text-2xl font-bold font-mono text-[#1B3B2B] tabular-nums">
            {formatCurrency(perGuestCost, event.currency)}
          </p>
          <p className="text-[11px] text-[#6B7D73]">
            Across {event.guestCount} projected guests
          </p>
        </div>
      </div>

      {/* Analytics Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Bar Chart: Planned vs Actual by Category */}
        <div className="lg:col-span-8 bg-white p-6 rounded-2xl border border-[#E8E2D8] shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-base font-bold font-serif text-[#1B3B2B]">
                Planned vs. Actual Spend by Category
              </h3>
              <p className="text-xs text-[#6B7D73]">
                Compare allocated baseline against real booked expenses
              </p>
            </div>
            <div className="flex items-center gap-3 text-xs text-[#6B7D73]">
              <span className="flex items-center gap-1">
                <span className="w-2.5 h-2.5 rounded-sm bg-[#1B3B2B] inline-block" />
                <span>Allocated</span>
              </span>
              <span className="flex items-center gap-1">
                <span className="w-2.5 h-2.5 rounded-sm bg-[#C5A859] inline-block" />
                <span>Actual</span>
              </span>
            </div>
          </div>

          <div className="h-72 w-full pt-4">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData} margin={{ top: 10, right: 10, left: 0, bottom: 25 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#F0EBE3" />
                <XAxis dataKey="name" angle={-25} textAnchor="end" interval={0} tick={{ fontSize: 11, fill: '#6B7D73' }} />
                <YAxis tick={{ fontSize: 11, fill: '#6B7D73' }} />
                <Tooltip
                  formatter={(val: any) => [formatCurrency(Number(val), event.currency), '']}
                  labelFormatter={(lbl, items) => items[0]?.payload?.fullName || lbl}
                  contentStyle={{ backgroundColor: '#FAF8F5', borderColor: '#E8E2D8', borderRadius: 8, fontSize: 12 }}
                />
                <Bar dataKey="Allocated" fill="#1B3B2B" radius={[4, 4, 0, 0]} />
                <Bar dataKey="Actual" fill="#C5A859" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Pie Chart: Category Distribution */}
        <div className="lg:col-span-4 bg-white p-6 rounded-2xl border border-[#E8E2D8] shadow-sm space-y-4 flex flex-col justify-between">
          <div>
            <h3 className="text-base font-bold font-serif text-[#1B3B2B]">
              Allocation Breakdown
            </h3>
            <p className="text-xs text-[#6B7D73]">
              Budget share by department
            </p>
          </div>

          <div className="h-56 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={categories}
                  dataKey="allocated"
                  nameKey="name"
                  cx="50%"
                  cy="50%"
                  outerRadius={75}
                  innerRadius={45}
                  paddingAngle={2}
                >
                  {categories.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={pieColors[index % pieColors.length]} />
                  ))}
                </Pie>
                <Tooltip
                  formatter={(val: any) => [formatCurrency(Number(val), event.currency), 'Allocated']}
                  contentStyle={{ backgroundColor: '#FAF8F5', borderColor: '#E8E2D8', borderRadius: 8, fontSize: 12 }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>

          <div className="space-y-1 text-xs max-h-36 overflow-y-auto pr-1">
            {categories.slice(0, 5).map((cat, idx) => (
              <div key={cat.id} className="flex items-center justify-between text-[#4A5750]">
                <div className="flex items-center gap-1.5 truncate">
                  <span className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: pieColors[idx % pieColors.length] }} />
                  <span className="truncate">{cat.name}</span>
                </div>
                <span className="font-mono tabular-nums text-[#1B3B2B]">
                  {Math.round((cat.allocated / (totalAllocated || 1)) * 100)}%
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Expense Ledger Table */}
      <div className="bg-white rounded-2xl border border-[#E8E2D8] shadow-sm overflow-hidden space-y-4 p-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h3 className="text-base font-bold font-serif text-[#1B3B2B]">
              Expense Ledger & Payment Tracking
            </h3>
            <p className="text-xs text-[#6B7D73]">
              {expenses.length} recorded items · {filteredExpenses.length} matching filters
            </p>
          </div>

          {/* Search & Filters */}
          <div className="flex flex-wrap items-center gap-2">
            <div className="relative">
              <Search className="w-3.5 h-3.5 text-[#8C9B92] absolute left-2.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search expense or vendor..."
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
                className="pl-8 pr-3 py-1.5 text-xs bg-[#FAF8F5] border border-[#DDD5C7] rounded-lg text-[#1B3B2B] focus:outline-none focus:ring-1 focus:ring-[#1B3B2B] w-48 sm:w-56"
              />
            </div>

            <select
              value={selectedCategoryFilter}
              onChange={e => setSelectedCategoryFilter(e.target.value)}
              className="px-2.5 py-1.5 text-xs bg-[#FAF8F5] border border-[#DDD5C7] rounded-lg text-[#1B3B2B]"
            >
              <option value="all">All Categories</option>
              {categories.map(c => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>

            <select
              value={selectedStatusFilter}
              onChange={e => setSelectedStatusFilter(e.target.value)}
              className="px-2.5 py-1.5 text-xs bg-[#FAF8F5] border border-[#DDD5C7] rounded-lg text-[#1B3B2B]"
            >
              <option value="all">All Statuses</option>
              <option value="planned">Planned</option>
              <option value="deposit_paid">Deposit Paid</option>
              <option value="paid_in_full">Paid in Full</option>
              <option value="pending">Pending</option>
            </select>
          </div>
        </div>

        {/* High-density Data Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-[#FAF8F5] border-y border-[#E8E2D8] text-[#6B7D73] font-semibold">
              <tr>
                <th className="py-2.5 px-3">Expense Item</th>
                <th className="py-2.5 px-3">Category</th>
                <th className="py-2.5 px-3">Vendor</th>
                <th className="py-2.5 px-3 text-right">Quoted Amount</th>
                <th className="py-2.5 px-3 text-right">Paid to Date</th>
                <th className="py-2.5 px-3">Status</th>
                <th className="py-2.5 px-3">Due Date</th>
                <th className="py-2.5 px-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#F0EBE3]">
              {filteredExpenses.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-8 text-center text-[#8C9B92]">
                    No expenses match your filters. Click "Add Expense" to record line items.
                  </td>
                </tr>
              ) : (
                filteredExpenses.map(exp => (
                  <tr key={exp.id} className="hover:bg-[#FAF8F5] transition-colors">
                    <td className="py-3 px-3 font-medium text-[#1B3B2B]">
                      <p>{exp.title}</p>
                      {exp.notes && <p className="text-[10px] text-[#8C9B92]">{exp.notes}</p>}
                    </td>
                    <td className="py-3 px-3 text-[#52635A]">{exp.categoryName}</td>
                    <td className="py-3 px-3 text-[#52635A]">{exp.vendorName || '—'}</td>
                    <td className="py-3 px-3 text-right font-mono font-semibold tabular-nums text-[#1B3B2B]">
                      {formatCurrency(exp.amount, event.currency)}
                    </td>
                    <td className="py-3 px-3 text-right font-mono tabular-nums text-[#52635A]">
                      {formatCurrency(exp.paidAmount, event.currency)}
                    </td>
                    <td className="py-3 px-3">
                      <span
                        className={`text-[11px] font-medium ${
                          exp.status === 'paid_in_full'
                            ? 'text-emerald-700'
                            : exp.status === 'deposit_paid'
                            ? 'text-amber-700'
                            : 'text-[#6B7D73]'
                        }`}
                      >
                        {exp.status.replace('_', ' ')}
                      </span>
                    </td>
                    <td className="py-3 px-3 text-[#52635A]">{exp.dueDate}</td>
                    <td className="py-3 px-3 text-right">
                      <button
                        onClick={() => handleDeleteExpense(exp.id)}
                        className="p-1 text-[#8C9B92] hover:text-red-600 transition-colors"
                        title="Delete expense"
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

      {/* Add Expense Modal */}
      {isAddExpenseOpen && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#FAF8F5] rounded-2xl border border-[#E8E2D8] shadow-xl w-full max-w-md overflow-hidden p-6 space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-[#E8E2D8]">
              <h3 className="text-base font-bold font-serif text-[#1B3B2B]">Add New Expense</h3>
              <button onClick={() => setIsAddExpenseOpen(false)} className="text-[#8C9B92] hover:text-[#1B3B2B]">
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCreateExpense} className="space-y-3 text-xs">
              <div>
                <label className="block font-semibold text-[#1B3B2B] mb-1">Expense Title</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Venue Second Deposit"
                  value={expenseForm.title}
                  onChange={e => setExpenseForm({ ...expenseForm, title: e.target.value })}
                  className="w-full bg-white border border-[#DDD5C7] rounded-lg px-3 py-2 text-xs text-[#1E2522]"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-[#1B3B2B] mb-1">Category</label>
                  <select
                    value={expenseForm.categoryId}
                    onChange={e => setExpenseForm({ ...expenseForm, categoryId: e.target.value })}
                    className="w-full bg-white border border-[#DDD5C7] rounded-lg px-2.5 py-2 text-xs text-[#1E2522]"
                  >
                    {categories.map(c => (
                      <option key={c.id} value={c.id}>
                        {c.name}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block font-semibold text-[#1B3B2B] mb-1">Vendor / Payee</label>
                  <input
                    type="text"
                    placeholder="e.g. Palace Trust"
                    value={expenseForm.vendorName}
                    onChange={e => setExpenseForm({ ...expenseForm, vendorName: e.target.value })}
                    className="w-full bg-white border border-[#DDD5C7] rounded-lg px-3 py-2 text-xs text-[#1E2522]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-[#1B3B2B] mb-1">Total Amount ({event.currency})</label>
                  <input
                    type="number"
                    min="0"
                    required
                    placeholder="0"
                    value={expenseForm.amount}
                    onChange={e => setExpenseForm({ ...expenseForm, amount: e.target.value })}
                    className="w-full bg-white border border-[#DDD5C7] rounded-lg px-3 py-2 text-xs font-mono font-bold text-[#1B3B2B]"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-[#1B3B2B] mb-1">Paid to Date ({event.currency})</label>
                  <input
                    type="number"
                    min="0"
                    placeholder="0"
                    value={expenseForm.paidAmount}
                    onChange={e => setExpenseForm({ ...expenseForm, paidAmount: e.target.value })}
                    className="w-full bg-white border border-[#DDD5C7] rounded-lg px-3 py-2 text-xs font-mono text-[#1B3B2B]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-[#1B3B2B] mb-1">Status</label>
                  <select
                    value={expenseForm.status}
                    onChange={e => setExpenseForm({ ...expenseForm, status: e.target.value })}
                    className="w-full bg-white border border-[#DDD5C7] rounded-lg px-2.5 py-2 text-xs text-[#1E2522]"
                  >
                    <option value="planned">Planned</option>
                    <option value="deposit_paid">Deposit Paid</option>
                    <option value="paid_in_full">Paid in Full</option>
                    <option value="pending">Pending</option>
                  </select>
                </div>
                <div>
                  <label className="block font-semibold text-[#1B3B2B] mb-1">Due Date</label>
                  <input
                    type="date"
                    value={expenseForm.dueDate}
                    onChange={e => setExpenseForm({ ...expenseForm, dueDate: e.target.value })}
                    className="w-full bg-white border border-[#DDD5C7] rounded-lg px-3 py-2 text-xs text-[#1E2522]"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-[#1B3B2B] mb-1">Notes / Terms</label>
                <input
                  type="text"
                  placeholder="e.g. Includes security deposit, refundable"
                  value={expenseForm.notes}
                  onChange={e => setExpenseForm({ ...expenseForm, notes: e.target.value })}
                  className="w-full bg-white border border-[#DDD5C7] rounded-lg px-3 py-2 text-xs text-[#1E2522]"
                />
              </div>

              <div className="pt-3 flex justify-end gap-2 border-t border-[#E8E2D8]">
                <button
                  type="button"
                  onClick={() => setIsAddExpenseOpen(false)}
                  className="px-3 py-1.5 text-xs text-[#4A5750] hover:bg-[#F2EDE4] rounded-lg"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 text-xs font-semibold text-white bg-[#1B3B2B] hover:bg-[#142B20] rounded-lg shadow-sm"
                >
                  Save Expense
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* AI Budget Optimizer Modal */}
      {isOptimizerOpen && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#FAF8F5] rounded-2xl border border-[#E8E2D8] shadow-2xl w-full max-w-2xl overflow-hidden p-6 space-y-4 max-h-[85vh] flex flex-col">
            <div className="flex items-center justify-between pb-3 border-b border-[#E8E2D8]">
              <div className="flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-[#C5A859]" />
                <h3 className="text-base font-bold font-serif text-[#1B3B2B]">
                  AI Spending Optimization Blueprint
                </h3>
              </div>
              <button onClick={() => setIsOptimizerOpen(false)} className="text-[#8C9B92] hover:text-[#1B3B2B]">
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="overflow-y-auto flex-1 space-y-4 text-xs">
              {isOptimizing ? (
                <div className="py-12 text-center space-y-3">
                  <Loader2 className="w-8 h-8 animate-spin text-[#1B3B2B] mx-auto" />
                  <p className="font-medium text-[#1B3B2B]">
                    Analyzing category allocations and vendor quotes with Gemini...
                  </p>
                  <p className="text-[11px] text-[#6B7D73]">
                    Calculating 15% reduction tactics with zero sacrifice in guest experience.
                  </p>
                </div>
              ) : optimizationResult ? (
                <div className="space-y-4">
                  <div className="p-4 bg-white rounded-xl border border-[#E8E2D8] space-y-1">
                    <p className="font-bold text-[#1B3B2B] text-sm">Optimization Strategy</p>
                    <p className="text-[#52635A] leading-relaxed">{optimizationResult.summary}</p>
                    <p className="font-mono text-emerald-800 font-semibold pt-1">
                      Projected Potential Savings: {formatCurrency(optimizationResult.projectedSavings || 0, event.currency)}
                    </p>
                  </div>

                  {/* Recommendations */}
                  <div className="space-y-2">
                    <p className="font-bold uppercase tracking-wider text-[#1B3B2B] text-[11px]">
                      Specific Category Adjustments
                    </p>
                    <div className="space-y-2">
                      {optimizationResult.categoryRecommendations?.map((rec: any, idx: number) => (
                        <div key={idx} className="p-3 bg-white rounded-lg border border-[#E8E2D8] space-y-1">
                          <div className="flex items-center justify-between">
                            <span className="font-semibold text-[#1B3B2B]">{rec.categoryName}</span>
                            <span className="font-mono text-emerald-700 font-bold">
                              Save {formatCurrency(rec.savingsAmount, event.currency)}
                            </span>
                          </div>
                          <p className="text-[11px] text-[#6B7D73] leading-relaxed">{rec.rationale}</p>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Top Tactics */}
                  {optimizationResult.topSavingsTactics && (
                    <div className="p-4 bg-[#F2EDE4] rounded-xl border border-[#DDD5C7] space-y-2">
                      <p className="font-bold text-[#1B3B2B]">Key Negotiation & Substitution Tactics</p>
                      <ul className="space-y-1 text-[#4A5750]">
                        {optimizationResult.topSavingsTactics.map((tactic: string, idx: number) => (
                          <li key={idx} className="flex items-start gap-2">
                            <span className="text-[#C5A859] font-bold">·</span>
                            <span>{tactic}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              ) : null}
            </div>

            <div className="pt-3 border-t border-[#E8E2D8] flex justify-between items-center">
              <button
                onClick={handleRunOptimizer}
                disabled={isOptimizing}
                className="px-3 py-1.5 text-xs font-semibold text-[#1B3B2B] hover:bg-[#F2EDE4] rounded-lg transition-colors flex items-center gap-1.5"
              >
                <Sparkles className="w-3.5 h-3.5 text-[#C5A859]" />
                <span>Re-run Optimization</span>
              </button>
              <button
                onClick={() => setIsOptimizerOpen(false)}
                className="px-4 py-1.5 text-xs font-semibold text-white bg-[#1B3B2B] hover:bg-[#142B20] rounded-lg"
              >
                Done
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Add Category Modal */}
      {isAddCategoryOpen && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#FAF8F5] rounded-2xl border border-[#E8E2D8] shadow-xl w-full max-w-sm overflow-hidden p-6 space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-[#E8E2D8]">
              <h3 className="text-base font-bold font-serif text-[#1B3B2B]">Add Budget Category</h3>
              <button onClick={() => setIsAddCategoryOpen(false)} className="text-[#8C9B92] hover:text-[#1B3B2B]">
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCreateCategory} className="space-y-3 text-xs">
              <div>
                <label className="block font-semibold text-[#1B3B2B] mb-1">Category Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Lighting & Pyrotechnics"
                  value={categoryForm.name}
                  onChange={e => setCategoryForm({ ...categoryForm, name: e.target.value })}
                  className="w-full bg-white border border-[#DDD5C7] rounded-lg px-3 py-2 text-xs text-[#1E2522]"
                />
              </div>

              <div>
                <label className="block font-semibold text-[#1B3B2B] mb-1">Target Allocation ({event.currency})</label>
                <input
                  type="number"
                  min="0"
                  required
                  placeholder="0"
                  value={categoryForm.allocated}
                  onChange={e => setCategoryForm({ ...categoryForm, allocated: e.target.value })}
                  className="w-full bg-white border border-[#DDD5C7] rounded-lg px-3 py-2 text-xs font-mono font-bold text-[#1B3B2B]"
                />
              </div>

              <div>
                <label className="block font-semibold text-[#1B3B2B] mb-1">Strategic Notes (Optional)</label>
                <input
                  type="text"
                  placeholder="e.g. Priority area per host preference"
                  value={categoryForm.notes}
                  onChange={e => setCategoryForm({ ...categoryForm, notes: e.target.value })}
                  className="w-full bg-white border border-[#DDD5C7] rounded-lg px-3 py-2 text-xs text-[#1E2522]"
                />
              </div>

              <div className="pt-3 flex justify-end gap-2 border-t border-[#E8E2D8]">
                <button
                  type="button"
                  onClick={() => setIsAddCategoryOpen(false)}
                  className="px-3 py-1.5 text-xs text-[#4A5750] hover:bg-[#F2EDE4] rounded-lg"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 text-xs font-semibold text-white bg-[#1B3B2B] hover:bg-[#142B20] rounded-lg shadow-sm"
                >
                  Create Category
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
