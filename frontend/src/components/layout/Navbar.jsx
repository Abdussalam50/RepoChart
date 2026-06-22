import { useAuthStore } from '../../store/authStore';
import { Bell } from 'lucide-react';

export function Navbar() {
  const { user } = useAuthStore();

  return (
    <header className="sticky top-0 z-10 flex h-16 flex-shrink-0 items-center justify-between border-b border-slate-200 bg-white/80 px-8 backdrop-blur-sm">
      <div className="flex flex-1">
        {/* Placeholder for Search if needed */}
      </div>
      <div className="flex items-center gap-6">
        <button className="text-slate-400 hover:text-slate-600 transition-colors">
          <span className="sr-only">View notifications</span>
          <Bell className="h-5 w-5" aria-hidden="true" />
        </button>
        <div className="flex items-center gap-3 border-l border-slate-200 pl-6">
          <div className="flex h-9 w-9 items-center justify-center rounded-full bg-secondary/20 text-secondary-foreground font-semibold shadow-sm">
            {user?.name?.charAt(0).toUpperCase() || 'U'}
          </div>
          <div className="hidden flex-col sm:flex">
            <span className="text-sm font-semibold text-slate-900 leading-tight">{user?.name || 'User'}</span>
            <span className="text-xs text-slate-500 leading-tight">{user?.plan || 'Free Plan'}</span>
          </div>
        </div>
      </div>
    </header>
  );
}
