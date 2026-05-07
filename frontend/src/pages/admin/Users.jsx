import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Trash2, AlertTriangle, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import api from '../../lib/api';
import { Spinner } from '../../components/ui';
import toast from 'react-hot-toast';

function DeleteModal({ user, onConfirm, onCancel, loading }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 10 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 10 }}
        transition={{ duration: 0.15 }}
        className="bg-white dark:bg-[#1c1c1e] rounded-2xl p-6 w-full max-w-sm shadow-2xl border border-gray-100 dark:border-gray-800">

        {/* Icon */}
        <div className="w-12 h-12 bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
          <AlertTriangle size={22} className="text-red-500" />
        </div>

        {/* Content */}
        <h2 className="font-serif text-xl font-bold text-[#111111] dark:text-[#f0ece4] text-center mb-2">
          Delete User
        </h2>
        <p className="text-sm text-gray-500 dark:text-gray-400 text-center mb-1">
          Are you sure you want to delete
        </p>
        <p className="text-sm font-semibold text-[#111111] dark:text-[#f0ece4] text-center mb-1">
          {user.name}
        </p>
        <p className="text-xs text-gray-400 text-center mb-6">{user.email}</p>
        <p className="text-xs text-red-500 text-center mb-6 bg-red-50 dark:bg-red-900/20 rounded-xl py-2 px-3">
          ⚠️ This action cannot be undone.
        </p>

        {/* Buttons */}
        <div className="flex gap-3">
          <button
            onClick={onCancel}
            className="flex-1 py-2.5 rounded-xl border-2 border-gray-200 dark:border-gray-700 text-sm font-semibold text-gray-600 dark:text-gray-300 hover:border-gray-300 transition-colors">
            Cancel
          </button>
          <button
            onClick={onConfirm}
            disabled={loading}
            className="flex-1 py-2.5 rounded-xl bg-red-500 hover:bg-red-600 text-white text-sm font-semibold transition-colors disabled:opacity-60 flex items-center justify-center gap-2">
            {loading ? <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <Trash2 size={15} />}
            Delete
          </button>
        </div>
      </motion.div>
    </div>
  );
}

export default function AdminUsers() {
  const [selectedUser, setSelectedUser] = useState(null);
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
      setSelectedUser(null);
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
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Manage registered customers</p>
      </div>

      <div className="bg-white dark:bg-[#1c1c1e] rounded-2xl overflow-hidden border border-gray-100 dark:border-gray-800">
        <table className="w-full text-sm">
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
              <tr key={u._id} className="hover:bg-gray-50 dark:hover:bg-[#2c2c2e] transition-colors">
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
                  <button
                    onClick={() => setSelectedUser(u)}
                    className="p-2 rounded-lg text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 transition-all">
                    <Trash2 size={15} />
                  </button>
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

      {/* Delete Confirmation Modal */}
      <AnimatePresence>
        {selectedUser && (
          <DeleteModal
            user={selectedUser}
            loading={deleteMutation.isPending}
            onConfirm={() => deleteMutation.mutate(selectedUser._id)}
            onCancel={() => setSelectedUser(null)}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
