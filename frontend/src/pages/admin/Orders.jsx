import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Search, Download } from 'lucide-react';
import api from '../../lib/api';
import { Spinner, Badge } from '../../components/ui';
import toast from 'react-hot-toast';

const STATUSES = ['Pending', 'Processing', 'Shipped', 'Delivered', 'Cancelled'];
const STATUS_COLORS = { Pending: 'gold', Processing: 'gold', Shipped: 'blue', Delivered: 'green', Cancelled: 'red' };

function exportCSV(orders) {
  const headers = ['Order ID', 'Customer', 'Email', 'Amount', 'Status', 'Payment', 'Date'];
  const rows = orders.map(o => [
    o._id.slice(-8).toUpperCase(),
    o.user?.name || '',
    o.user?.email || '',
    o.totalPrice,
    o.orderStatus,
    o.isPaid ? 'Paid' : 'Pending',
    new Date(o.createdAt).toLocaleDateString('en-IN'),
  ]);
  const csv = [headers, ...rows].map(r => r.join(',')).join('\n');
  const blob = new Blob([csv], { type: 'text/csv' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url; a.download = `ShriniAura-Orders-${Date.now()}.csv`; a.click();
  URL.revokeObjectURL(url);
  toast.success('Orders exported!');
}

export default function AdminOrders() {
  const [page, setPage] = useState(1);
  const [statusFilter, setStatusFilter] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const queryClient = useQueryClient();

  const { data, isLoading } = useQuery({
    queryKey: ['admin-orders', page, statusFilter],
    queryFn: () => api.get('/orders', { params: { page, limit: 20, status: statusFilter } }).then(r => r.data),
  });

  const updateStatus = useMutation({
    mutationFn: ({ id, orderStatus }) => api.put(`/orders/${id}/status`, { orderStatus }),
    onSuccess: () => { queryClient.invalidateQueries(['admin-orders']); toast.success('Status updated!'); },
  });

  // Client-side search filter
  const filtered = data?.orders?.filter(o => {
    if (!searchQuery) return true;
    const q = searchQuery.toLowerCase();
    return o._id.toLowerCase().includes(q) ||
      o.user?.name?.toLowerCase().includes(q) ||
      o.user?.email?.toLowerCase().includes(q);
  });

  if (isLoading) return <Spinner />;

  return (
    <div>
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
        <h1 className="font-serif text-2xl font-bold text-[#111111] dark:text-[#f0ece4]">Orders ({data?.total})</h1>
        <div className="flex items-center gap-3">
          {/* Export CSV */}
          <button onClick={() => exportCSV(data?.orders || [])}
            className="flex items-center gap-2 px-3 py-2 text-sm font-semibold border border-gray-200 dark:border-gray-700 rounded-xl bg-white dark:bg-[#1c1c1e] text-[#111111] dark:text-[#f0ece4] hover:border-gold hover:text-gold transition-all">
            <Download size={14} /> Export CSV
          </button>
          {/* Search */}
          <div className="relative">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input value={searchQuery} onChange={e => setSearchQuery(e.target.value)}
              placeholder="Search by name, email, ID..."
              className="pl-9 pr-4 py-2 text-sm border border-gray-200 dark:border-gray-700 rounded-xl bg-white dark:bg-[#1c1c1e] text-[#111111] dark:text-[#f0ece4] outline-none focus:border-gold w-56 transition-colors" />
          </div>
          {/* Status Filter */}
          <select value={statusFilter} onChange={e => { setStatusFilter(e.target.value); setPage(1); }}
            className="text-sm border border-gray-200 dark:border-gray-700 rounded-xl px-3 py-2 bg-white dark:bg-[#1c1c1e] text-[#111111] dark:text-[#f0ece4] outline-none focus:border-gold">
            <option value="">All Status</option>
            {STATUSES.map(s => <option key={s} value={s}>{s}</option>)}
          </select>
        </div>
      </div>

      <div className="bg-white dark:bg-[#1c1c1e] rounded-2xl overflow-hidden border border-gray-100 dark:border-gray-800">
        <table className="w-full text-sm">
          <thead>
            <tr className="text-left text-gray-500 dark:text-gray-400 border-b border-gray-100 dark:border-gray-800 bg-gray-50 dark:bg-[#2c2c2e]">
              <th className="px-4 py-3 text-xs font-bold uppercase tracking-wider">Order ID</th>
              <th className="px-4 py-3 text-xs font-bold uppercase tracking-wider">Customer</th>
              <th className="px-4 py-3 text-xs font-bold uppercase tracking-wider">Amount</th>
              <th className="px-4 py-3 text-xs font-bold uppercase tracking-wider">Payment</th>
              <th className="px-4 py-3 text-xs font-bold uppercase tracking-wider">Status</th>
              <th className="px-4 py-3 text-xs font-bold uppercase tracking-wider">Update</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50 dark:divide-gray-800">
            {filtered?.map(o => (
              <tr key={o._id} className="hover:bg-gray-50 dark:hover:bg-[#2c2c2e] transition-colors">
                <td className="px-4 py-3 font-mono text-xs font-bold text-[#111111] dark:text-[#f0ece4]">
                  #{o._id.slice(-8).toUpperCase()}
                </td>
                <td className="px-4 py-3">
                  <p className="font-medium text-[#111111] dark:text-[#f0ece4]">{o.user?.name}</p>
                  <p className="text-xs text-gray-400">{o.user?.email}</p>
                </td>
                <td className="px-4 py-3 font-bold text-[#111111] dark:text-[#f0ece4]">₹{o.totalPrice}</td>
                <td className="px-4 py-3"><Badge color={o.isPaid ? 'green' : 'red'}>{o.isPaid ? 'Paid' : 'Pending'}</Badge></td>
                <td className="px-4 py-3"><Badge color={STATUS_COLORS[o.orderStatus]}>{o.orderStatus}</Badge></td>
                <td className="px-4 py-3">
                  <select value={o.orderStatus}
                    onChange={e => updateStatus.mutate({ id: o._id, orderStatus: e.target.value })}
                    className="text-xs border border-gray-200 dark:border-gray-700 rounded-lg px-2 py-1.5 bg-white dark:bg-[#1c1c1e] text-[#111111] dark:text-[#f0ece4] outline-none focus:border-gold">
                    {STATUSES.map(s => <option key={s} value={s}>{s}</option>)}
                  </select>
                </td>
              </tr>
            ))}
            {filtered?.length === 0 && (
              <tr><td colSpan={6} className="px-4 py-12 text-center text-gray-400 text-sm">No orders found</td></tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {data?.total > 20 && (
        <div className="flex justify-center gap-2 mt-6">
          {[...Array(Math.ceil(data.total / 20))].map((_, i) => (
            <button key={i} onClick={() => setPage(i + 1)}
              className={`w-9 h-9 rounded-full text-sm font-bold transition-all ${page === i + 1 ? 'bg-gold text-white' : 'bg-white dark:bg-[#1c1c1e] border border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-400 hover:border-gold'}`}>
              {i + 1}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
