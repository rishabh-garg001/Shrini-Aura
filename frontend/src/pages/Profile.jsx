import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { motion, AnimatePresence } from 'framer-motion';
import { Trash2, User, Phone, Mail, Heart, ArrowRight, Lock, Eye, EyeOff } from 'lucide-react';
import { Link } from 'react-router-dom';
import api from '../lib/api';
import { useAuthStore } from '../store/authStore';
import { Button, Spinner } from '../components/ui';
import ProductCard from '../components/product/ProductCard';
import toast from 'react-hot-toast';

export function Profile() {
  const { user, setUser } = useAuthStore();
  const [showPassForm, setShowPassForm] = useState(false);
  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const { register, handleSubmit, reset } = useForm({ defaultValues: { name: user?.name, phone: user?.phone } });
  const { register: regPass, handleSubmit: handlePass, formState: { errors: passErrors }, reset: resetPass } = useForm();

  const onSubmit = async (data) => {
    try {
      const res = await api.put('/users/profile', data);
      setUser(res.data);
      toast.success('Profile updated!');
    } catch { toast.error('Update failed'); }
  };

  const onChangePassword = async (data) => {
    if (data.newPassword !== data.confirmPassword) return toast.error('Passwords do not match');
    try {
      await api.put('/users/password', { currentPassword: data.currentPassword, newPassword: data.newPassword });
      toast.success('Password changed successfully!');
      resetPass();
      setShowPassForm(false);
    } catch (err) { toast.error(err.response?.data?.message || 'Failed to change password'); }
  };

  return (
    <div className="min-h-screen bg-[#faf7f2] dark:bg-[#0a0a0a] ">
      <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="mb-8">
          <p className="text-xs font-bold text-gold uppercase tracking-widest mb-1">Account</p>
          <h1 className="font-serif text-3xl font-bold text-[#111111] dark:text-[#f0ece4]">My Profile</h1>
        </div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
          className="bg-white dark:bg-[#1c1c1e] rounded-2xl border border-gray-100 dark:border-gray-800 overflow-hidden">

          {/* Profile Header */}
          <div className="bg-gradient-to-r from-gold/20 via-gold/10 to-transparent dark:from-gold/10 p-8 border-b border-gray-100 dark:border-gray-800">
            <div className="flex items-center gap-5">
              <div className="w-20 h-20 bg-gold rounded-full flex items-center justify-center text-3xl font-bold text-white shadow-xl shadow-gold/30">
                {user?.name?.[0]?.toUpperCase()}
              </div>
              <div>
                <h2 className="font-serif text-2xl font-bold text-[#111111] dark:text-[#f0ece4]">{user?.name}</h2>
                <div className="flex items-center gap-1.5 mt-1">
                  <Mail size={13} className="text-gray-400" />
                  <p className="text-gray-500 dark:text-gray-400 text-sm">{user?.email}</p>
                </div>
                <div className="mt-2">
                  <span className="inline-flex items-center gap-1 text-xs bg-gold/10 text-gold border border-gold/20 px-2.5 py-0.5 rounded-full font-semibold capitalize">
                    {user?.role}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Edit Info Form */}
          <div className="p-8 border-b border-gray-100 dark:border-gray-800">
            <h3 className="font-bold text-[#111111] dark:text-[#f0ece4] mb-5 flex items-center gap-2">
              <User size={16} className="text-gold" /> Edit Information
            </h3>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-[#111111] dark:text-[#f0ece4] mb-1.5">Full Name</label>
                <input {...register('name')}
                  className="w-full border-2 border-gray-200 dark:border-gray-700 rounded-xl px-4 py-3 text-sm bg-white dark:bg-[#2c2c2e] text-[#111111] dark:text-[#f0ece4] outline-none focus:border-gold transition-colors" />
              </div>
              <div>
                <label className="block text-sm font-semibold text-[#111111] dark:text-[#f0ece4] mb-1.5">
                  <span className="flex items-center gap-1.5"><Phone size={13} /> Phone Number</span>
                </label>
                <input {...register('phone')} placeholder="+91 9876543210"
                  className="w-full border-2 border-gray-200 dark:border-gray-700 rounded-xl px-4 py-3 text-sm bg-white dark:bg-[#2c2c2e] text-[#111111] dark:text-[#f0ece4] placeholder-gray-400 outline-none focus:border-gold transition-colors" />
              </div>
              <Button type="submit" className="w-full" size="lg">Save Changes</Button>
            </form>
          </div>

          {/* Change Password */}
          <div className="p-8">
            <button onClick={() => setShowPassForm(!showPassForm)}
              className="flex items-center justify-between w-full group">
              <h3 className="font-bold text-[#111111] dark:text-[#f0ece4] flex items-center gap-2">
                <Lock size={16} className="text-gold" /> Change Password
              </h3>
              <span className="text-xs text-gold font-semibold">{showPassForm ? 'Cancel' : 'Change'}</span>
            </button>

            <AnimatePresence>
              {showPassForm && (
                <motion.form initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }} onSubmit={handlePass(onChangePassword)}
                  className="space-y-4 mt-5 overflow-hidden">
                  {/* Current Password */}
                  <div>
                    <label className="block text-sm font-semibold text-[#111111] dark:text-[#f0ece4] mb-1.5">Current Password</label>
                    <div className="relative">
                      <input {...regPass('currentPassword', { required: 'Required' })}
                        type={showCurrent ? 'text' : 'password'} placeholder="••••••••"
                        className="w-full border-2 border-gray-200 dark:border-gray-700 rounded-xl px-4 py-3 pr-12 text-sm bg-white dark:bg-[#2c2c2e] text-[#111111] dark:text-[#f0ece4] placeholder-gray-400 outline-none focus:border-gold transition-colors" />
                      <button type="button" onClick={() => setShowCurrent(!showCurrent)}
                        className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gold">
                        {showCurrent ? <EyeOff size={16} /> : <Eye size={16} />}
                      </button>
                    </div>
                    {passErrors.currentPassword && <p className="text-red-500 text-xs mt-1">{passErrors.currentPassword.message}</p>}
                  </div>
                  {/* New Password */}
                  <div>
                    <label className="block text-sm font-semibold text-[#111111] dark:text-[#f0ece4] mb-1.5">New Password</label>
                    <div className="relative">
                      <input {...regPass('newPassword', { required: 'Required', minLength: { value: 6, message: 'Min 6 characters' } })}
                        type={showNew ? 'text' : 'password'} placeholder="••••••••"
                        className="w-full border-2 border-gray-200 dark:border-gray-700 rounded-xl px-4 py-3 pr-12 text-sm bg-white dark:bg-[#2c2c2e] text-[#111111] dark:text-[#f0ece4] placeholder-gray-400 outline-none focus:border-gold transition-colors" />
                      <button type="button" onClick={() => setShowNew(!showNew)}
                        className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gold">
                        {showNew ? <EyeOff size={16} /> : <Eye size={16} />}
                      </button>
                    </div>
                    {passErrors.newPassword && <p className="text-red-500 text-xs mt-1">{passErrors.newPassword.message}</p>}
                  </div>
                  {/* Confirm Password */}
                  <div>
                    <label className="block text-sm font-semibold text-[#111111] dark:text-[#f0ece4] mb-1.5">Confirm New Password</label>
                    <input {...regPass('confirmPassword', { required: 'Required' })}
                      type="password" placeholder="••••••••"
                      className="w-full border-2 border-gray-200 dark:border-gray-700 rounded-xl px-4 py-3 text-sm bg-white dark:bg-[#2c2c2e] text-[#111111] dark:text-[#f0ece4] placeholder-gray-400 outline-none focus:border-gold transition-colors" />
                    {passErrors.confirmPassword && <p className="text-red-500 text-xs mt-1">{passErrors.confirmPassword.message}</p>}
                  </div>
                  <Button type="submit" className="w-full" size="lg">Update Password</Button>
                </motion.form>
              )}
            </AnimatePresence>
          </div>
        </motion.div>

        {/* Quick Links */}
        <div className="grid grid-cols-2 gap-4 mt-5">
          {[
            { to: '/orders', label: 'My Orders', sub: 'View order history', icon: '📦' },
            { to: '/wishlist', label: 'Wishlist', sub: 'Saved items', icon: '❤️' },
          ].map(({ to, label, sub, icon }) => (
            <Link key={to} to={to}
              className="bg-white dark:bg-[#1c1c1e] rounded-2xl p-5 border border-gray-100 dark:border-gray-800 hover:border-gold/30 transition-colors flex items-center justify-between group">
              <div>
                <span className="text-2xl block mb-1">{icon}</span>
                <p className="font-semibold text-sm text-[#111111] dark:text-[#f0ece4]">{label}</p>
                <p className="text-xs text-gray-500 dark:text-gray-400">{sub}</p>
              </div>
              <ArrowRight size={16} className="text-gray-300 group-hover:text-gold transition-colors" />
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}

export function Wishlist() {
  const queryClient = useQueryClient();
  const { data: wishlist, isLoading } = useQuery({
    queryKey: ['wishlist'],
    queryFn: () => api.get('/users/wishlist').then(r => r.data),
  });

  const remove = useMutation({
    mutationFn: (id) => api.put(`/users/wishlist/${id}`),
    onSuccess: () => { queryClient.invalidateQueries(['wishlist']); toast.success('Removed from wishlist'); },
  });

  if (isLoading) return <div className=""><Spinner /></div>;

  return (
    <div className="min-h-screen bg-[#faf7f2] dark:bg-[#0a0a0a] ">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="mb-8">
          <p className="text-xs font-bold text-gold uppercase tracking-widest mb-1">Account</p>
          <h1 className="font-serif text-3xl font-bold text-[#111111] dark:text-[#f0ece4]">
            My Wishlist <span className="text-gold">({wishlist?.length || 0})</span>
          </h1>
        </div>
        {wishlist?.length === 0 ? (
          <div className="text-center py-24">
            <div className="w-20 h-20 bg-red-50 dark:bg-red-900/20 rounded-full flex items-center justify-center mx-auto mb-4">
              <Heart size={36} className="text-red-400" />
            </div>
            <h3 className="font-serif text-xl font-bold text-[#111111] dark:text-[#f0ece4] mb-2">Your wishlist is empty</h3>
            <p className="text-gray-500 dark:text-gray-400 text-sm mb-6">Save candles you love for later</p>
            <Link to="/products"><Button size="lg">Explore Candles <ArrowRight size={14} /></Button></Link>
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
            {wishlist?.map(p => (
              <div key={p._id} className="relative">
                <ProductCard product={p} />
                <button onClick={() => remove.mutate(p._id)}
                  className="absolute top-3 left-3 z-20 w-8 h-8 bg-red-500 hover:bg-red-600 text-white rounded-full flex items-center justify-center shadow-lg transition-colors">
                  <Trash2 size={13} />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
