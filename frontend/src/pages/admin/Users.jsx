import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Trash2 } from 'lucide-react';
import api from '../../lib/api';
import { Spinner, Badge } from '../../components/ui';
import toast from 'react-hot-toast';

export default function AdminUsers() {
  const queryClient = useQueryClient();
  const { data: users, isLoading } = useQuery({
    queryKey: ['admin-users'],
    queryFn: () => api.get('/users').then(r => r.data),
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => api.delete(`/users/${id}`),
    onSuccess: () => { queryClient.invalidateQueries(['admin-users']); toast.success('User deleted'); },
  });

  if (isLoading) return <Spinner />;

  return (
    <div>
      <h1 className="font-serif text-2xl font-bold mb-6">Users ({users?.length})</h1>
      <div className="bg-white dark:bg-gray-900 rounded-2xl overflow-hidden">
        <table className="w-full text-sm">
          <thead><tr className="text-left text-gray-500 border-b dark:border-gray-800 bg-gray-50 dark:bg-gray-800">
            <th className="px-4 py-3">Name</th><th className="px-4 py-3">Email</th>
            <th className="px-4 py-3">Role</th><th className="px-4 py-3">Joined</th><th className="px-4 py-3">Actions</th>
          </tr></thead>
          <tbody className="divide-y dark:divide-gray-800">
            {users?.map(u => (
              <tr key={u._id} className="hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
                <td className="px-4 py-3 font-medium">{u.name}</td>
                <td className="px-4 py-3 text-gray-500">{u.email}</td>
                <td className="px-4 py-3"><Badge color={u.role === 'admin' ? 'gold' : 'green'}>{u.role}</Badge></td>
                <td className="px-4 py-3 text-gray-400 text-xs">{new Date(u.createdAt).toLocaleDateString('en-IN')}</td>
                <td className="px-4 py-3">
                  {u.role !== 'admin' && (
                    <button onClick={() => { if (confirm('Delete user?')) deleteMutation.mutate(u._id); }}
                      className="p-1.5 hover:text-red-500 transition-colors"><Trash2 size={16} /></button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
