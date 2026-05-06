import { NavLink, Outlet, Navigate } from 'react-router-dom';
import { LayoutDashboard, Package, ShoppingBag, Users, LogOut, ExternalLink } from 'lucide-react';
import { useAuthStore } from '../../store/authStore';
import { Link } from 'react-router-dom';

const NAV = [
  { to: '/admin', icon: LayoutDashboard, label: 'Dashboard', end: true },
  { to: '/admin/products', icon: Package, label: 'Products' },
  { to: '/admin/orders', icon: ShoppingBag, label: 'Orders' },
  { to: '/admin/users', icon: Users, label: 'Users' },
];

export default function AdminLayout() {
  const { user, logout } = useAuthStore();
  if (!user || user.role !== 'admin') return <Navigate to="/" />;

  return (
    <div className="min-h-screen bg-[#f5f5f5] dark:bg-[#0a0a0a] flex">
      {/* Sidebar */}
      <aside className="w-64 bg-[#111111] flex flex-col shrink-0 sticky top-0 h-screen">
        {/* Logo */}
        <div className="p-6 border-b border-white/5">
          <div className="flex items-center gap-2.5 mb-1">
            <div className="w-8 h-8 bg-gold rounded-full flex items-center justify-center">
              <span className="text-white text-xs font-bold">S</span>
            </div>
            <span className="font-serif text-lg font-bold text-white">ShriniAura</span>
          </div>
          <span className="text-xs text-gray-500 font-medium ml-10">Admin Panel</span>
        </div>

        {/* Nav */}
        <nav className="flex-1 p-4 space-y-1">
          {NAV.map(({ to, icon: Icon, label, end }) => (
            <NavLink key={to} to={to} end={end}
              className={({ isActive }) =>
                `flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all ${
                  isActive
                    ? 'bg-gold text-white shadow-lg shadow-gold/20'
                    : 'text-gray-400 hover:text-white hover:bg-white/5'
                }`
              }>
              <Icon size={17} /> {label}
            </NavLink>
          ))}
        </nav>

        {/* Bottom */}
        <div className="p-4 border-t border-white/5 space-y-1">
          <Link to="/" target="_blank"
            className="flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm text-gray-400 hover:text-white hover:bg-white/5 transition-all">
            <ExternalLink size={16} /> View Store
          </Link>
          <button onClick={logout}
            className="flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm text-red-400 hover:text-red-300 hover:bg-red-500/10 w-full transition-all">
            <LogOut size={16} /> Sign Out
          </button>
          <div className="px-4 pt-3 flex items-center gap-3">
            <div className="w-8 h-8 bg-gold rounded-full flex items-center justify-center text-white text-xs font-bold shrink-0">
              {user.name?.[0]?.toUpperCase()}
            </div>
            <div className="min-w-0">
              <p className="text-white text-xs font-semibold truncate">{user.name}</p>
              <p className="text-gray-500 text-xs truncate">{user.email}</p>
            </div>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-auto">
        <div className="p-8">
          <Outlet />
        </div>
      </main>
    </div>
  );
}
