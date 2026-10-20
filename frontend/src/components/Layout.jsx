import { useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard, Activity, Users, BarChart3, Settings, LogOut,
  Menu, X, RefreshCw, User, Bell, Home, Wallet, Smartphone, CalendarDays, FileText
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const navItems = [
  { to: '/', icon: LayoutDashboard, label: 'Dashboard', end: true },
  { to: '/patients', icon: Users, label: 'Patients', roles: ['admin', 'manager', 'chw'] },
  { to: '/medical-records', icon: FileText, label: 'Medical Records', roles: ['admin', 'manager', 'chw'] },
  { to: '/appointments', icon: CalendarDays, label: 'Appointments', roles: ['admin', 'manager'] },
  { to: '/payments', icon: Wallet, label: 'Payments', roles: ['admin', 'manager', 'chw'] },
  { to: '/households', icon: Home, label: 'Households', roles: ['admin', 'manager', 'chw'] },
  { to: '/patient-portal', icon: Smartphone, label: 'Patient Portal' },
  { to: '/sync', icon: RefreshCw, label: 'Sync Status', roles: ['admin', 'manager'] },
  { to: '/analytics', icon: BarChart3, label: 'Analytics', roles: ['admin', 'manager'] },
  { to: '/settings', icon: Settings, label: 'Settings', roles: ['admin'] },
];

export default function Layout({ children }) {
  const { user, logout, hasRole } = useAuth();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  return (
    <div className="flex h-screen overflow-hidden bg-primary-50">
      <aside
        className={`fixed inset-y-0 left-0 z-30 w-64 bg-primary-900 transform transition-transform duration-200 ease-in-out lg:translate-x-0 lg:static lg:inset-auto ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="flex items-center gap-3 px-6 h-16 border-b border-primary-800">
          <div className="w-8 h-8 bg-white/20 rounded-lg flex items-center justify-center">
            <Activity className="w-5 h-5 text-white" />
          </div>
          <div>
            <h1 className="text-lg font-bold text-white">CHWS</h1>
            <p className="text-xs text-primary-300">Dashboard v1.0</p>
          </div>
        </div>

        <nav className="px-3 py-4 space-y-1">
          {navItems.map(
            (item) =>
              (!item.roles || hasRole(...item.roles)) && (
                <NavLink
                  key={item.to}
                  to={item.to}
                  end={item.end}
                  onClick={() => setSidebarOpen(false)}
                  className={({ isActive }) =>
                    `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                      isActive
                        ? 'bg-white/15 text-white'
                        : 'text-primary-200 hover:bg-white/10 hover:text-white'
                    }`
                  }
                >
                  <item.icon className="w-5 h-5" />
                  {item.label}
                </NavLink>
              )
          )}
        </nav>

        <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-primary-800">
          <button
            onClick={handleLogout}
            className="flex items-center gap-3 px-3 py-2.5 w-full rounded-lg text-sm font-medium text-primary-300 hover:bg-white/10 hover:text-white transition-colors"
          >
            <LogOut className="w-5 h-5" />
            Sign Out
          </button>
        </div>
      </aside>

      {sidebarOpen && (
        <div
          className="fixed inset-0 z-20 bg-black/50 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      <div className="flex-1 flex flex-col min-w-0">
        <header className="h-16 bg-white border-b border-primary-100 flex items-center justify-between px-4 lg:px-6">
          <button
            className="lg:hidden p-2 rounded-md text-primary-600 hover:bg-primary-50"
            onClick={() => setSidebarOpen(true)}
          >
            {sidebarOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>

          <div className="flex items-center gap-4 ml-auto">
            <button className="p-2 rounded-lg text-primary-400 hover:text-primary-600 hover:bg-primary-50 relative">
              <Bell className="w-5 h-5" />
              <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-primary-500 rounded-full" />
            </button>
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-primary-100 rounded-full flex items-center justify-center">
                <User className="w-4 h-4 text-primary-600" />
              </div>
              <div className="hidden sm:block">
                <p className="text-sm font-medium text-gray-900">
                  {user?.firstName} {user?.lastName}
                </p>
                <p className="text-xs text-primary-500 capitalize">{user?.role}</p>
              </div>
            </div>
          </div>
        </header>

        <main className="flex-1 overflow-y-auto p-4 lg:p-6">{children}</main>
      </div>
    </div>
  );
}
