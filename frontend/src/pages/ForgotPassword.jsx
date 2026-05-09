import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowRight, ArrowLeft, Eye, EyeOff, KeyRound } from 'lucide-react';
import api from '../lib/api';
import { Button } from '../components/ui';
import toast from 'react-hot-toast';

const STEPS = ['Email', 'Verify OTP', 'New Password'];

export default function ForgotPassword() {
  const [step, setStep] = useState(0);
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleOtpChange = (val, idx) => {
    if (!/^\d*$/.test(val)) return;
    const next = [...otp];
    next[idx] = val.slice(-1);
    setOtp(next);
    if (val && idx < 5) document.getElementById(`rotp-${idx + 1}`)?.focus();
  };

  const handleOtpKeyDown = (e, idx) => {
    if (e.key === 'Backspace' && !otp[idx] && idx > 0) {
      document.getElementById(`rotp-${idx - 1}`)?.focus();
    }
  };

  const handleSendOtp = async (e) => {
    e.preventDefault();
    if (!email) return toast.error('Enter your email');
    setLoading(true);
    try {
      await api.post('/auth/forgot-password', { email });
      toast.success('OTP sent to your email!');
      setStep(1);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to send OTP');
    } finally { setLoading(false); }
  };

  const handleVerifyOtp = async (e) => {
    e.preventDefault();
    const code = otp.join('');
    if (code.length !== 6) return toast.error('Enter all 6 digits');
    setLoading(true);
    try {
      await api.post('/auth/verify-reset-otp', { email, otp: code });
      toast.success('OTP verified!');
      setStep(2);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Invalid OTP');
    } finally { setLoading(false); }
  };

  const handleResetPassword = async (e) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) return toast.error('Passwords do not match');
    if (newPassword.length < 6) return toast.error('Min 6 characters');
    setLoading(true);
    try {
      await api.post('/auth/reset-password', { email, otp: otp.join(''), newPassword });
      toast.success('Password reset successfully!');
      navigate('/login');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to reset password');
    } finally { setLoading(false); }
  };

  return (
    <div className="min-h-screen bg-[#faf7f2] dark:bg-[#0a0a0a] flex items-center justify-center px-4">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="w-full max-w-md">

        {/* Logo + Steps */}
        <div className="text-center mb-8">
          <Link to="/" className="inline-flex items-center gap-2 mb-6">
            <div className="w-8 h-8 bg-gold rounded-full flex items-center justify-center">
              <span className="text-white text-xs font-bold">S</span>
            </div>
            <span className="font-serif text-xl font-bold text-gold">ShriniAura</span>
          </Link>
          <div className="flex items-center justify-center gap-2">
            {STEPS.map((s, i) => (
              <div key={s} className="flex items-center gap-2">
                <div className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold transition-all ${
                  i === step ? 'bg-gold text-white' :
                  i < step ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400' :
                  'bg-gray-100 dark:bg-gray-800 text-gray-400'
                }`}>
                  <span className="w-4 h-4 rounded-full flex items-center justify-center text-[10px] font-bold">
                    {i < step ? '✓' : i + 1}
                  </span>
                  {s}
                </div>
                {i < STEPS.length - 1 && <div className="w-4 h-px bg-gray-200 dark:bg-gray-700" />}
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white dark:bg-[#1c1c1e] rounded-2xl shadow-xl p-8 border border-gray-100 dark:border-gray-800">
          <AnimatePresence mode="wait">

            {/* Step 0 — Email */}
            {step === 0 && (
              <motion.div key="email" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
                <div className="text-center mb-6">
                  <div className="w-14 h-14 bg-gold/10 rounded-full flex items-center justify-center mx-auto mb-3">
                    <KeyRound size={24} className="text-gold" />
                  </div>
                  <h2 className="font-serif text-2xl font-bold text-[#111111] dark:text-[#f0ece4]">Forgot Password?</h2>
                  <p className="text-gray-500 dark:text-gray-400 text-sm mt-1">Enter your email to receive a reset OTP</p>
                </div>
                <form onSubmit={handleSendOtp} className="space-y-4">
                  <div>
                    <label className="block text-sm font-semibold text-[#111111] dark:text-[#f0ece4] mb-1.5">Email Address</label>
                    <input type="email" value={email} onChange={e => setEmail(e.target.value)}
                      placeholder="you@example.com" required
                      className="w-full border-2 border-gray-200 dark:border-gray-700 rounded-xl px-4 py-3 text-sm bg-white dark:bg-[#2c2c2e] text-[#111111] dark:text-[#f0ece4] placeholder-gray-400 outline-none focus:border-gold transition-colors" />
                  </div>
                  <Button type="submit" loading={loading} className="w-full" size="lg">
                    Send OTP <ArrowRight size={16} />
                  </Button>
                </form>
              </motion.div>
            )}

            {/* Step 1 — OTP */}
            {step === 1 && (
              <motion.div key="otp" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
                <div className="text-center mb-6">
                  <div className="w-14 h-14 bg-gold/10 rounded-full flex items-center justify-center mx-auto mb-3">
                    <span className="text-2xl">📧</span>
                  </div>
                  <h2 className="font-serif text-2xl font-bold text-[#111111] dark:text-[#f0ece4]">Enter OTP</h2>
                  <p className="text-gray-500 dark:text-gray-400 text-sm mt-1">
                    Sent to <span className="text-gold font-semibold">{email}</span>
                  </p>
                </div>
                <form onSubmit={handleVerifyOtp}>
                  <div className="flex gap-3 justify-center mb-6">
                    {otp.map((digit, idx) => (
                      <input key={idx} id={`rotp-${idx}`} type="text" inputMode="numeric"
                        maxLength={1} value={digit}
                        onChange={e => handleOtpChange(e.target.value, idx)}
                        onKeyDown={e => handleOtpKeyDown(e, idx)}
                        className="w-12 h-12 text-center text-xl font-bold border-2 border-gray-200 dark:border-gray-700 rounded-xl bg-white dark:bg-[#2c2c2e] text-[#111111] dark:text-[#f0ece4] outline-none focus:border-gold transition-colors" />
                    ))}
                  </div>
                  <Button type="submit" loading={loading} className="w-full" size="lg">
                    Verify OTP <ArrowRight size={16} />
                  </Button>
                </form>
                <div className="mt-4 text-center">
                  <button onClick={() => setStep(0)} className="text-xs text-gray-400 hover:text-gold transition-colors flex items-center gap-1 mx-auto">
                    <ArrowLeft size={12} /> Change email
                  </button>
                </div>
              </motion.div>
            )}

            {/* Step 2 — New Password */}
            {step === 2 && (
              <motion.div key="pass" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
                <div className="text-center mb-6">
                  <div className="w-14 h-14 bg-emerald-100 dark:bg-emerald-900/30 rounded-full flex items-center justify-center mx-auto mb-3">
                    <span className="text-2xl">🔐</span>
                  </div>
                  <h2 className="font-serif text-2xl font-bold text-[#111111] dark:text-[#f0ece4]">New Password</h2>
                  <p className="text-gray-500 dark:text-gray-400 text-sm mt-1">Set a strong new password</p>
                </div>
                <form onSubmit={handleResetPassword} className="space-y-4">
                  <div>
                    <label className="block text-sm font-semibold text-[#111111] dark:text-[#f0ece4] mb-1.5">New Password</label>
                    <div className="relative">
                      <input type={showPass ? 'text' : 'password'} value={newPassword}
                        onChange={e => setNewPassword(e.target.value)} placeholder="••••••••" required minLength={6}
                        className="w-full border-2 border-gray-200 dark:border-gray-700 rounded-xl px-4 py-3 pr-12 text-sm bg-white dark:bg-[#2c2c2e] text-[#111111] dark:text-[#f0ece4] placeholder-gray-400 outline-none focus:border-gold transition-colors" />
                      <button type="button" onClick={() => setShowPass(!showPass)}
                        className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gold">
                        {showPass ? <EyeOff size={16} /> : <Eye size={16} />}
                      </button>
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-[#111111] dark:text-[#f0ece4] mb-1.5">Confirm Password</label>
                    <input type="password" value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)}
                      placeholder="••••••••" required
                      className="w-full border-2 border-gray-200 dark:border-gray-700 rounded-xl px-4 py-3 text-sm bg-white dark:bg-[#2c2c2e] text-[#111111] dark:text-[#f0ece4] placeholder-gray-400 outline-none focus:border-gold transition-colors" />
                  </div>
                  <Button type="submit" loading={loading} className="w-full" size="lg">
                    Reset Password <ArrowRight size={16} />
                  </Button>
                </form>
              </motion.div>
            )}
          </AnimatePresence>

          <div className="mt-6 text-center">
            <Link to="/login" className="text-sm text-gray-500 dark:text-gray-400 hover:text-gold transition-colors flex items-center gap-1 justify-center">
              <ArrowLeft size={14} /> Back to Login
            </Link>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
