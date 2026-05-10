import { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useForm } from 'react-hook-form';
import { Eye, EyeOff, ArrowRight } from 'lucide-react';
import { useAuthStore } from '../store/authStore';
import { Button } from '../components/ui';
import api from '../lib/api';
import toast from 'react-hot-toast';

function AuthForm({ mode }) {
  const { register, handleSubmit, formState: { errors } } = useForm();
  const [loading, setLoading] = useState(false);
  const [showPass, setShowPass] = useState(false);
  const { login, register: signup } = useAuthStore();
  const navigate = useNavigate();

  const onSubmit = async (data) => {
    setLoading(true);
    try {
      if (mode === 'login') {
        await login(data);
        toast.success('Welcome back! 🕯️', {
          style: { background: '#111', color: '#f0ece4', border: '1px solid #c9a96e33' },
        });
        navigate('/');
      } else {
        const res = await signup(data);
        toast.success('OTP sent to your email!');
        navigate('/verify-email', { state: { email: data.email } });
      }
    } catch (err) {
      const errData = err.response?.data;
      if (errData?.needsVerification) {
        toast.error('Please verify your email first');
        navigate('/verify-email', { state: { email: errData.email } });
        return;
      }
      toast.error(errData?.message || 'Something went wrong');
    } finally { setLoading(false); }
  };

  return (
    <div className="min-h-screen bg-[#faf7f2] dark:bg-[#0a0a0a] flex">
      {/* Left Panel */}
      <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden">
        <img
          src="https://ik.imagekit.io/rishaabh/shrini%20Photos/Screenshot%202026-05-09%20233907.png"
          alt="luxury candle"
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent" />
        <div className="absolute bottom-0 left-0 right-0 p-12">
          <div className="flex items-center gap-2 mb-4">
            <div className="w-8 h-8 bg-gold rounded-full flex items-center justify-center">
              <span className="text-white text-xs font-bold">S</span>
            </div>
            <span className="font-serif text-xl font-bold text-white">ShriniAura</span>
          </div>
          <h2 className="font-serif text-3xl font-bold text-white mb-3 leading-tight">
            Premium Handcrafted<br />Scented Candles
          </h2>
          <p className="text-gray-300 text-sm leading-relaxed">
            Transform your space into a sanctuary of calm and luxury.
          </p>
          <div className="flex gap-6 mt-8">
            {[['2000+', 'Customers'], ['5★', 'Rating'], ['100%', 'Natural']].map(([n, l]) => (
              <div key={l}>
                <p className="text-gold font-bold text-lg font-serif">{n}</p>
                <p className="text-gray-400 text-xs">{l}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Right Panel */}
      <div className="flex-1 flex items-center justify-center px-6 py-12">
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5 }}
          className="w-full max-w-md">

          <div className="lg:hidden flex items-center gap-2 mb-8">
            <div className="w-8 h-8 bg-gold rounded-full flex items-center justify-center">
              <span className="text-white text-xs font-bold">S</span>
            </div>
            <Link to="/" className="font-serif text-xl font-bold text-gold">ShriniAura</Link>
          </div>

          <div className="mb-8">
            <h1 className="font-serif text-3xl font-bold text-[#111111] dark:text-[#f0ece4] mb-2">
              {mode === 'login' ? 'Welcome back' : 'Create account'}
            </h1>
            <p className="text-gray-500 dark:text-gray-400">
              {mode === 'login' ? 'Sign in to your ShriniAura account' : 'Join the ShriniAura family today'}
            </p>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
            {mode === 'register' && (
              <div>
                <label className="block text-sm font-semibold text-[#111111] dark:text-[#f0ece4] mb-1.5">Full Name</label>
                <input
                  {...register('name', { required: 'Name is required' })}
                  placeholder="Your full name"
                  className={`w-full border-2 ${errors.name ? 'border-red-400' : 'border-gray-200 dark:border-gray-700'} rounded-xl px-4 py-3 text-sm bg-white dark:bg-[#1c1c1e] text-[#111111] dark:text-[#f0ece4] placeholder-gray-400 outline-none focus:border-gold transition-colors`}
                />
                {errors.name && <p className="text-red-500 text-xs mt-1 font-medium">{errors.name.message}</p>}
              </div>
            )}

            <div>
              <label className="block text-sm font-semibold text-[#111111] dark:text-[#f0ece4] mb-1.5">Email Address</label>
              <input
                {...register('email', { required: 'Email is required', pattern: { value: /^\S+@\S+$/i, message: 'Invalid email' } })}
                placeholder="you@example.com"
                type="email"
                className={`w-full border-2 ${errors.email ? 'border-red-400' : 'border-gray-200 dark:border-gray-700'} rounded-xl px-4 py-3 text-sm bg-white dark:bg-[#1c1c1e] text-[#111111] dark:text-[#f0ece4] placeholder-gray-400 outline-none focus:border-gold transition-colors`}
              />
              {errors.email && <p className="text-red-500 text-xs mt-1 font-medium">{errors.email.message}</p>}
            </div>

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="block text-sm font-semibold text-[#111111] dark:text-[#f0ece4]">Password</label>
                {mode === 'login' && (
                  <Link to="/forgot-password" className="text-xs text-gold hover:underline font-medium">
                    Forgot password?
                  </Link>
                )}
              </div>
              <div className="relative">
                <input
                  {...register('password', { required: 'Password is required', minLength: { value: 6, message: 'Min 6 characters' } })}
                  placeholder="••••••••"
                  type={showPass ? 'text' : 'password'}
                  className={`w-full border-2 ${errors.password ? 'border-red-400' : 'border-gray-200 dark:border-gray-700'} rounded-xl px-4 py-3 pr-12 text-sm bg-white dark:bg-[#1c1c1e] text-[#111111] dark:text-[#f0ece4] placeholder-gray-400 outline-none focus:border-gold transition-colors`}
                />
                <button type="button" onClick={() => setShowPass(!showPass)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gold transition-colors">
                  {showPass ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
              {errors.password && <p className="text-red-500 text-xs mt-1 font-medium">{errors.password.message}</p>}
            </div>

            <Button type="submit" loading={loading} className="w-full" size="lg">
              {mode === 'login' ? 'Sign In' : 'Create Account'} <ArrowRight size={16} />
            </Button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-sm text-gray-500 dark:text-gray-400">
              {mode === 'login' ? "Don't have an account? " : 'Already have an account? '}
              <Link to={mode === 'login' ? '/register' : '/login'} className="text-gold font-semibold hover:underline">
                {mode === 'login' ? 'Sign Up' : 'Sign In'}
              </Link>
            </p>
          </div>

          <div className="mt-8 pt-6 border-t border-gray-200 dark:border-gray-800">
            <p className="text-xs text-center text-gray-400">
              By continuing, you agree to our{' '}
              <a href="#" className="text-gold hover:underline">Terms of Service</a>
              {' '}and{' '}
              <a href="#" className="text-gold hover:underline">Privacy Policy</a>
            </p>
          </div>
        </motion.div>
      </div>
    </div>
  );
}

export function Login() { return <AuthForm mode="login" />; }
export function Register() { return <AuthForm mode="register" />; }

export function VerifyEmail() {
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [loading, setLoading] = useState(false);
  const [resending, setResending] = useState(false);
  const { verifyEmail } = useAuthStore();
  const navigate = useNavigate();
  const location = useLocation();
  const email = location.state?.email || '';

  const handleChange = (val, idx) => {
    if (!/^\d*$/.test(val)) return;
    const next = [...otp];
    next[idx] = val.slice(-1);
    setOtp(next);
    if (val && idx < 5) document.getElementById(`otp-${idx + 1}`)?.focus();
  };

  const handleKeyDown = (e, idx) => {
    if (e.key === 'Backspace' && !otp[idx] && idx > 0) {
      document.getElementById(`otp-${idx - 1}`)?.focus();
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const code = otp.join('');
    if (code.length !== 6) return toast.error('Enter all 6 digits');
    setLoading(true);
    try {
      await verifyEmail({ email, otp: code });
      toast.success('Email verified! Welcome to ShriniAura 🕯️');
      navigate('/');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Invalid OTP');
    } finally { setLoading(false); }
  };

  const handleResend = async () => {
    setResending(true);
    try {
      await api.post('/auth/resend-otp', { email });
      toast.success('OTP resent!');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to resend');
    } finally { setResending(false); }
  };

  return (
    <div className="min-h-screen bg-[#faf7f2] dark:bg-[#0a0a0a] flex items-center justify-center px-4">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md bg-white dark:bg-[#1c1c1e] rounded-2xl shadow-xl p-8 border border-gray-100 dark:border-gray-800">
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-gold/10 rounded-full flex items-center justify-center mx-auto mb-4">
            <span className="text-3xl">📧</span>
          </div>
          <h1 className="font-serif text-2xl font-bold text-[#111111] dark:text-[#f0ece4] mb-2">Verify Your Email</h1>
          <p className="text-gray-500 dark:text-gray-400 text-sm">
            We sent a 6-digit OTP to<br />
            <span className="font-semibold text-gold">{email}</span>
          </p>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="flex gap-3 justify-center mb-6">
            {otp.map((digit, idx) => (
              <input
                key={idx}
                id={`otp-${idx}`}
                type="text"
                inputMode="numeric"
                maxLength={1}
                value={digit}
                onChange={e => handleChange(e.target.value, idx)}
                onKeyDown={e => handleKeyDown(e, idx)}
                className="w-12 h-12 text-center text-xl font-bold border-2 border-gray-200 dark:border-gray-700 rounded-xl bg-white dark:bg-[#2c2c2e] text-[#111111] dark:text-[#f0ece4] outline-none focus:border-gold transition-colors"
              />
            ))}
          </div>

          <Button type="submit" loading={loading} className="w-full" size="lg">
            Verify Email <ArrowRight size={16} />
          </Button>
        </form>

        <div className="mt-6 text-center">
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Didn't receive the OTP?{' '}
            <button onClick={handleResend} disabled={resending}
              className="text-gold font-semibold hover:underline disabled:opacity-50">
              {resending ? 'Sending...' : 'Resend OTP'}
            </button>
          </p>
        </div>

        <div className="mt-4 text-center">
          <Link to="/register" className="text-xs text-gray-400 hover:text-gold transition-colors">
            ← Back to Register
          </Link>
        </div>
      </motion.div>
    </div>
  );
}

