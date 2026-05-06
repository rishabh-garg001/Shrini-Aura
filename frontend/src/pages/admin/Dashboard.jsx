import { useQuery } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend } from 'recharts';
import { ShoppingBag, Users, Package, TrendingUp, ArrowUpRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import api from '../../lib/api';
import { Spinner, Badge } from '../../components/ui';

const COLORS = ['#c9a96e', '#a07840', '#e8d5b0', '#6b7280', '#374151'];
const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
const STATUS_COLORS = { Pending: 'gold', Processing: 'gold', Shipped: 'blue', Delivered: 'green', Cancelled: 'red' };

const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload?.length) return (
    <div className="bg-[#1c1c1e] border border-gray-700 rounded-xl px-4 py-3 shadow-xl">
      <p className="text-gray-400 text-xs mb-1">{label}</p>
      <p className="text-white font-bold">₹{payload[0]?.value?.toLocaleString('en-IN')}</p>
    </div>
  );
  return null;
};

export default function AdminDashboard() {
  const { data, isLoading } = useQuery({
    queryKey: ['admin-dashboard'],
    queryFn: () => api.get('/admin/dashboard').then(r => r.data),
  });

  if (isLoading) return <Spinner />;

  const stats = [
    { label: 'Total Revenue', value: `₹${(data?.totalRevenue || 0).toLocaleString('en-IN')}`, icon: TrendingUp, color: 'text-emerald-400', bg: 'bg-emerald-400/10', trend: '+12%' },
    { label: 'Total Orders', value: data?.totalOrders || 0, icon: ShoppingBag, color: 'text-blue-400', bg: 'bg-blue-400/10', trend: '+8%' },
    { label: 'Total Users', value: data?.totalUsers || 0, icon: Users, color: 'text-purple-400', bg: 'bg-purple-400/10', trend: '+24%' },
    { label: 'Products', value: data?.totalProducts || 0, icon: Package, color: 'text-gold', bg: 'bg-gold/10', trend: 'Active' },
  ];

  const chartData = data?.monthlySales?.map(m => ({
    name: MONTHS[m._id.month - 1],
    revenue: m.revenue,
    orders: m.orders,
  }));

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-serif text-2xl font-bold text-[#111111] dark:text-[#f0ece4]">Dashboard</h1>
          <p className="text-gray-500 dark:text-gray-400 text-sm mt-0.5">Welcome back! Here's what's happening.</p>
        </div>
        <div className="text-xs text-gray-400 bg-white dark:bg-[#1c1c1e] border border-gray-200 dark:border-gray-700 px-3 py-1.5 rounded-full">
          {new Date().toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'long' })}
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map(({ label, value, icon: Icon, color, bg, trend }, i) => (
          <motion.div key={label}
            initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.08 }}
            className="bg-white dark:bg-[#1c1c1e] rounded-2xl p-5 border border-gray-100 dark:border-gray-800 hover:border-gold/20 transition-colors">
            <div className="flex items-center justify-between mb-4">
              <div className={`w-10 h-10 ${bg} rounded-xl flex items-center justify-center`}>
                <Icon size={18} className={color} />
              </div>
              <span className="text-xs font-semibold text-emerald-500 bg-emerald-50 dark:bg-emerald-900/20 px-2 py-0.5 rounded-full">
                {trend}
              </span>
            </div>
            <p className="text-2xl font-bold text-[#111111] dark:text-[#f0ece4] mb-1">{value}</p>
            <p className="text-xs text-gray-500 dark:text-gray-400 font-medium">{label}</p>
          </motion.div>
        ))}
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* Revenue Chart */}
        <div className="lg:col-span-2 bg-white dark:bg-[#1c1c1e] rounded-2xl p-6 border border-gray-100 dark:border-gray-800">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="font-bold text-[#111111] dark:text-[#f0ece4]">Monthly Revenue</h2>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">Last 6 months performance</p>
            </div>
          </div>
          {chartData?.length > 0 ? (
            <ResponsiveContainer width="100%" height={240}>
              <BarChart data={chartData} barSize={28}>
                <XAxis dataKey="name" tick={{ fontSize: 11, fill: '#9ca3af' }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 11, fill: '#9ca3af' }} axisLine={false} tickLine={false} tickFormatter={v => `₹${v >= 1000 ? `${v/1000}k` : v}`} />
                <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(201,169,110,0.05)', radius: 8 }} />
                <Bar dataKey="revenue" fill="#c9a96e" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-60 flex items-center justify-center text-gray-400 text-sm">No sales data yet</div>
          )}
        </div>

        {/* Category Pie */}
        <div className="bg-white dark:bg-[#1c1c1e] rounded-2xl p-6 border border-gray-100 dark:border-gray-800">
          <h2 className="font-bold text-[#111111] dark:text-[#f0ece4] mb-1">Sales by Category</h2>
          <p className="text-xs text-gray-500 dark:text-gray-400 mb-4">Revenue distribution</p>
          {data?.categorySales?.length > 0 ? (
            <>
              <ResponsiveContainer width="100%" height={180}>
                <PieChart>
                  <Pie data={data.categorySales} dataKey="total" nameKey="_id" cx="50%" cy="50%" outerRadius={75} innerRadius={40}>
                    {data.categorySales.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                  </Pie>
                  <Tooltip formatter={(v) => [`₹${v.toLocaleString('en-IN')}`, '']} />
                </PieChart>
              </ResponsiveContainer>
              <div className="space-y-2 mt-2">
                {data.categorySales.map((c, i) => (
                  <div key={c._id} className="flex items-center justify-between text-xs">
                    <div className="flex items-center gap-2">
                      <div className="w-2.5 h-2.5 rounded-full shrink-0" style={{ background: COLORS[i % COLORS.length] }} />
                      <span className="text-gray-600 dark:text-gray-400 truncate max-w-[100px]">{c._id}</span>
                    </div>
                    <span className="font-semibold text-[#111111] dark:text-[#f0ece4]">₹{c.total?.toLocaleString('en-IN')}</span>
                  </div>
                ))}
              </div>
            </>
          ) : (
            <div className="h-40 flex items-center justify-center text-gray-400 text-sm">No data yet</div>
          )}
        </div>
      </div>

      {/* Recent Orders */}
      <div className="bg-white dark:bg-[#1c1c1e] rounded-2xl border border-gray-100 dark:border-gray-800 overflow-hidden">
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 dark:border-gray-800">
          <h2 className="font-bold text-[#111111] dark:text-[#f0ece4]">Recent Orders</h2>
          <Link to="/admin/orders" className="text-xs text-gold font-semibold hover:underline flex items-center gap-1">
            View all <ArrowUpRight size={12} />
          </Link>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left border-b border-gray-100 dark:border-gray-800 bg-gray-50 dark:bg-[#2c2c2e]">
                {['Order ID', 'Customer', 'Amount', 'Status', 'Date'].map(h => (
                  <th key={h} className="px-6 py-3 text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50 dark:divide-gray-800">
              {data?.recentOrders?.map(o => (
                <tr key={o._id} className="hover:bg-gray-50 dark:hover:bg-[#2c2c2e] transition-colors">
                  <td className="px-6 py-4 font-mono text-xs font-bold text-[#111111] dark:text-[#f0ece4]">
                    #{o._id.slice(-8).toUpperCase()}
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <div className="w-7 h-7 bg-gold/10 rounded-full flex items-center justify-center text-gold text-xs font-bold">
                        {o.user?.name?.[0]?.toUpperCase()}
                      </div>
                      <span className="font-medium text-[#111111] dark:text-[#f0ece4]">{o.user?.name}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 font-bold text-[#111111] dark:text-[#f0ece4]">₹{o.totalPrice}</td>
                  <td className="px-6 py-4">
                    <Badge color={STATUS_COLORS[o.orderStatus]}>{o.orderStatus}</Badge>
                  </td>
                  <td className="px-6 py-4 text-gray-500 dark:text-gray-400 text-xs">
                    {new Date(o.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}
                  </td>
                </tr>
              ))}
              {!data?.recentOrders?.length && (
                <tr><td colSpan={5} className="px-6 py-12 text-center text-gray-400 text-sm">No orders yet</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
