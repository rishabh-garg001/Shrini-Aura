import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Trash2, AlertTriangle, X, Package, TrendingUp, ShoppingBag, Eye } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import api from '../../lib/api';
import { Spinner, Badge } from '../../components/ui';
import toast from 'react-hot-toast';

const STATUS_COLORS = { Pending: 'gold', Processing: 'gold', Shipped: 'blue', Delivered: 'green', Cancelled: 'red' };

function DeleteModal({ user, onConfirm, onCancel, loading }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 10 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 10 }}
        transition={{ duration: 0.15 }}
        className="bg-white dark:bg-[#1c1c1e] rounded-2xl p-6 w-full max-w-sm shadow-2xl border border-gray-100 dark:border-gray-800">
        <div className="w-12 h-12 bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
          <AlertTriangle size={22} className="text-red-500" />
        </div>
        <h2 className="font-serif text-xl font-bold text-[#111111] dark:text-[#f0ece4] text-center mb-2">Delete User</h2>
        <p className="text-sm text-gray-500 dark:text-gray-400 text-center mb-1">Are you sure you want to delete</p>
        <p className="text-sm font-semibold text-[#111111] dark:text-[#f0ece4] text-center mb-1">{user.name}</p>
        <p className="text-xs text-gray-400 text-center mb-6">{user.email}</p>
        <p className="text-xs text-red-500 text-center mb-6 bg-red-50 dark:bg-red-900/20 rounded-xl py-2 px-3">
          ⚠️ This action cannot be undone.
        </p>
        <div className="flex gap-3">
          <button onClick={onCancel}
            className="flex-1 py-2.5 rounded-xl border-2 border-gray-200 dark:border-gray-700 text-sm font-semibold text-gray-600 dark:text-gray-300 hover:border-gray-300 transition-colors">
            Cancel
          </button>
          <button onClick={onConfirm} disabled={loading}
            className="flex-1 py-2.5 rounded-xl bg-red-500 hover:bg-red-600 text-white text-sm font-semibold transition-colors disabled:opacity-60 flex items-center justify-center gap-2">
            {loading ? <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <Trash2 size={15} />}
            Delete
          </button>
        </div>
      </motion.div>
    </div>
  );
}

function UserDetailPanel({ userId, onClose }) {
  const { data, isLoading } = useQuery({
    queryKey: ['admin-user-detail', userId],
    queryFn: () => api.get(`/admin/users/${userId}`).then(r => r.data),
    enabled: !!userId,
  });

  return (
    <motion.div
      initial={{ x: '100%' }} animate={{ x: 0 }} exit={{ x: '100%' }}
      transition={{ type: 'spring', damping: 25, stiffness: 200 }}
      className="fixed right-0 top-0 h-full w-full max-w-md bg-white dark:bg-[#1c1c1e] shadow-2xl z-50 flex flex-col border-l border-gray-100 dark:border-gray-800">

      {/* Header */}
      <div className="flex items-center justify-between p-6 border-b border-gray-100 dark:border-gray-800">
        <h2 className="font-serif text-xl font-bold text-[#111111] dark:text-[#f0ece4]">User Details</h2>
        <button onClick={onClose}
          className="p-2 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors">
          <X size={18} className="text-gray-500" />
        </button>
      </div>

      {isLoading ? (
        <div className="flex-1 flex items-center justify-center"><Spinner /></div>
      ) : (
        <div className="flex-1 overflow-y-auto p-6 space-y-6">

          {/* User Info */}
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 bg-gold rounded-full flex items-center justify-center text-white text-xl font-bold shrink-0">
              {data?.user?.name?.[0]?.toUpperCase()}
            </div>
            <div>
              <p className="font-bold text-lg text-[#111111] dark:text-[#f0ece4]">{data?.user?.name}</p>
              <p className="text-sm text-gray-500 dark:text-gray-400">{data?.user?.email}</p>
              <p className="text-xs text-gray-400 mt-0.5">
                Joined {new Date(data?.user?.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })}
              </p>
            </div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-3 gap-3">
            {[
              { icon: ShoppingBag, label: 'Total Orders', value: data?.totalOrders || 0, color: 'text-blue-500', bg: 'bg-blue-50 dark:bg-blue-900/20' },
              { icon: Package, label: 'Paid Orders', value: data?.paidOrders || 0, color: 'text-emerald-500', bg: 'bg-emerald-50 dark:bg-emerald-900/20' },
              { icon: TrendingUp, label: 'Total Spent', value: `₹${(data?.totalSpent || 0).toLocaleString('en-IN')}`, color: 'text-gold', bg: 'bg-gold/10' },
            ].map(({ icon: Icon, label, value, color, bg }) => (
              <div key={label} className={`${bg} rounded-2xl p-4 text-center`}>
                <Icon size={18} className={`${color} mx-auto mb-2`} />
                <p className="font-bold text-sm text-[#111111] dark:text-[#f0ece4]">{value}</p>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">{label}</p>
              </div>
            ))}
          </div>

          {/* Orders List */}
          <div>
            <h3 className="font-bold text-sm text-[#111111] dark:text-[#f0ece4] uppercase tracking-wider mb-3">
              Order History
            </h3>
            {data?.orders?.length === 0 ? (
              <div className="text-center py-8 bg-gray-50 dark:bg-[#2c2c2e] rounded-2xl">
                <p className="text-gray-400 text-sm">No orders placed yet</p>
              </div>
            ) : (
              <div className="space-y-3">
                {data?.orders?.map(order => (
                  <div key={order._id}
                    className="bg-gray-50 dark:bg-[#2c2c2e] rounded-2xl p-4 border border-gray-100 dark:border-gray-700">
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-mono text-xs font-bold text-[#111111] dark:text-[#f0ece4]">
                        #{order._id.slice(-8).toUpperCase()}
                      </span>
                      <Badge color={STATUS_COLORS[order.orderStatus]}>{order.orderStatus}</Badge>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-500 dark:text-gray-400">
                        {new Date(order.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                      </span>
                      <span className="font-bold text-[#111111] dark:text-[#f0ece4]">₹{order.totalPrice}</span>
                    </div>
                    <div className="flex items-center justify-between mt-2">
                      <span className="text-xs text-gray-400">{order.orderItems?.length} item{order.orderItems?.length !== 1 ? 's' : ''}</span>
                      <Badge color={order.isPaid ? 'green' : 'red'}>{order.isPaid ? 'Paid' : 'Unpaid'}</Badge>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </motion.div>
  );
}

export default function AdminUsers() {
  const [deleteUser, setDeleteUser] = useState(null);
  const [viewUserId, setViewUserId] = useState(null);
  const queryClient = useQueryClient();

  const { data: users, isLoading } = useQuery({
    queryKey: ['admin-users'],
    queryFn: () => api.get('/users').then(r => r.data),
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => api.delete(`/users/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries(['admin-users']);
      toast.success('User deleted successfully');
      setDeleteUser(null);
    },
    onError: () => toast.error('Failed to delete user'),
  });

  if (isLoading) return <Spinner />;

  return (
    <div>
      <div className="mb-6">
        <h1 className="font-serif text-2xl font-bold text-[#111111] dark:text-[#f0ece4]">
          Users <span className="text-gray-400 font-normal text-lg">({users?.filter(u => u.role !== 'admin').length})</span>
        </h1>
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Click on a user to view their details and orders</p>
      </div>

      <div className="bg-white dark:bg-[#1c1c1e] rounded-2xl overflow-hidden border border-gray-100 dark:border-gray-800">
        <div className="overflow-x-auto">
        <table className="w-full text-sm min-w-[500px]">
          <thead>
            <tr className="text-left text-gray-500 dark:text-gray-400 border-b border-gray-100 dark:border-gray-800 bg-gray-50 dark:bg-[#2c2c2e]">
              <th className="px-5 py-3.5 text-xs font-bold uppercase tracking-wider">Name</th>
              <th className="px-5 py-3.5 text-xs font-bold uppercase tracking-wider">Email</th>
              <th className="px-5 py-3.5 text-xs font-bold uppercase tracking-wider">Joined</th>
              <th className="px-5 py-3.5 text-xs font-bold uppercase tracking-wider">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50 dark:divide-gray-800">
            {users?.filter(u => u.role !== 'admin').map(u => (
              <tr key={u._id}
                onClick={() => setViewUserId(u._id)}
                className="hover:bg-gray-50 dark:hover:bg-[#2c2c2e] transition-colors cursor-pointer">
                <td className="px-5 py-4">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-gold/10 rounded-full flex items-center justify-center text-gold font-bold text-sm shrink-0">
                      {u.name?.[0]?.toUpperCase()}
                    </div>
                    <span className="font-medium text-[#111111] dark:text-[#f0ece4]">{u.name}</span>
                  </div>
                </td>
                <td className="px-5 py-4 text-gray-500 dark:text-gray-400">{u.email}</td>
                <td className="px-5 py-4 text-gray-400 text-xs">
                  {new Date(u.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                </td>
                <td className="px-5 py-4">
                  <div className="flex items-center gap-2" onClick={e => e.stopPropagation()}>
                    <button onClick={() => setViewUserId(u._id)}
                      className="p-2 rounded-lg text-gray-400 hover:text-gold hover:bg-gold/10 transition-all">
                      <Eye size={15} />
                    </button>
                    <button onClick={() => setDeleteUser(u)}
                      className="p-2 rounded-lg text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 transition-all">
                      <Trash2 size={15} />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
            {users?.filter(u => u.role !== 'admin').length === 0 && (
              <tr>
                <td colSpan={4} className="px-5 py-12 text-center text-gray-400 text-sm">No users found</td>
              </tr>
            )}
          </tbody>
        </table>
        </div>
      </div>

      {/* User Detail Side Panel */}
      <AnimatePresence>
        {viewUserId && (
          <>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/30 z-40"
              onClick={() => setViewUserId(null)} />
            <UserDetailPanel userId={viewUserId} onClose={() => setViewUserId(null)} />
          </>
        )}
      </AnimatePresence>

      {/* Delete Modal */}
      <AnimatePresence>
        {deleteUser && (
          <DeleteModal
            user={deleteUser}
            loading={deleteMutation.isPending}
            onConfirm={() => deleteMutation.mutate(deleteUser._id)}
            onCancel={() => setDeleteUser(null)}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
