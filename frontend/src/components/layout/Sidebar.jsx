import { Link, useLocation } from 'react-router-dom';
import { LayoutDashboard, Users, FileBarChart2, Settings, LogOut, Upload, BarChart3, Crown } from 'lucide-react';
import { cn } from '../../utils/cn';
import { useAuthStore } from '../../store/authStore';
import { useModalStore } from '../../store/modalStore';



export function Sidebar() {
  const location = useLocation();
  const { logout, user } = useAuthStore();
  const { openModal } = useModalStore();

  const navItems = [
    { name: 'Dashboard',    href: '/dashboard',    icon: LayoutDashboard },
    { name: 'Clients',      href: '/clients',      icon: Users },
    { name: 'Reports',      href: '/reports',      icon: FileBarChart2 },
    { name: 'Upload Data',  href: '/upload',       icon: Upload },
    { name: 'Settings',     href: '/settings',     icon: Settings },
    
  ];
  return (
    <div className="flex h-screen w-64 flex-col border-r border-slate-200 bg-white">
      {/* Logo */}
      <div className="flex h-16 shrink-0 items-center px-6 border-b border-slate-100">
        <Link to="/" className="flex items-center gap-2.5">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-violet-200 text-violet-800 font-bold text-sm shadow-sm">
            R <span className="text-white ">C</span>
          </div>
          <span className="text-xl font-bold tracking-tight text-violet-800">RepoChart</span>
        </Link>
      </div>

      {/* Navigation */}
      <nav className="flex-1 space-y-0.5 px-3 py-4 overflow-y-auto">
        {/* Main section */}
        <p className="px-3 py-2 text-[11px] font-semibold text-slate-400 uppercase tracking-wider">Main</p>
        {navItems.slice(0, 4).map((item) => {
          const isActive = location.pathname === item.href || (item.href !== '/' && location.pathname.startsWith(item.href));
          return (
            <Link
              key={item.name}
              to={item.href}
              className={cn(
                'group flex items-center rounded-xl px-3 py-2.5 text-sm font-medium transition-all',
                isActive
                  ? 'bg-primary/10 text-primary'
                  : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
              )}
            >
              <item.icon
                className={cn(
                  'mr-3 h-4 w-4 flex-shrink-0 transition-colors',
                  isActive ? 'text-primary' : 'text-slate-400 group-hover:text-slate-600'
                )}
                aria-hidden="true"
              />
              {item.name}
            </Link>
          );
        })}

        <p className="px-3 py-2 mt-4 text-[11px] font-semibold text-slate-400 uppercase tracking-wider">Subscription</p>
        <button type="button" onClick={() => openModal()} className="w-full flex items-center rounded-xl px-3 py-2.5 text-sm font-medium text-slate-600 hover:bg-slate-50 hover:text-slate-900">
          
            <Crown className="mr-3 h-4 w-4 text-slate-400 group-hover:text-slate-600" />
          Subscription Service
            
        </button>
      </nav>

      {/* User & Logout */}
      <div className="p-4 border-t border-slate-100 space-y-2">
        {user?.role === 'admin' && (
          <Link
            to="/admin"
            className="group flex w-full items-center rounded-xl px-3 py-2.5 text-sm font-medium text-violet-700 bg-violet-50 transition-all hover:bg-violet-100"
          >
            <Settings className="mr-3 h-4 w-4 text-violet-600" />
            Admin Panel
          </Link>
        )}
        
        {user && (
          <div className="flex items-center gap-3 px-3 py-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10 text-primary font-bold text-sm shrink-0">
              {user.name?.charAt(0).toUpperCase()}
            </div>
            <div className="min-w-0">
              <p className="text-sm font-semibold text-slate-900 truncate">{user.name}</p>
              <p className="text-xs text-slate-400 capitalize">{user.plan || 'free'} plan</p>
            </div>
          </div>
        )}
        <button
          onClick={() => logout()}
          className="group flex w-full items-center rounded-xl px-3 py-2.5 text-sm font-medium text-white transition-all bg-violet-500 cursor-pointer hover:bg-violet-700 hover:text-white"
        >
          <LogOut className="mr-3 h-4 w-4 text-white group-hover:text-red-500" />
          Log out
        </button>
      </div>
    </div>
  );
}
