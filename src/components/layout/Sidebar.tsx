import { Link, useLocation } from 'react-router-dom';
import { LayoutDashboard, Building2, User, Calculator, FileText, PieChart, Settings, Bell, FileUp, StickyNote } from 'lucide-react';
import { cn } from '../../lib/utils';

const navigation = [
  { name: 'Dashboard', href: '/', icon: LayoutDashboard },
  { name: 'Perusahaan', href: '/companies', icon: Building2 },
  { name: 'Pajak Pribadi', href: '/personal-tax', icon: User },
  { name: 'Unggah SPT', href: '/spt-repository', icon: FileUp },
  { name: 'Catatan Pribadi', href: '/personal-notes', icon: StickyNote },
  { name: 'Pencatatan', href: '/tax-recording', icon: FileText },
  { name: 'Rumus Pajak', href: '/tax-formulas', icon: Calculator },
  { name: 'Laporan', href: '/reports', icon: FileText },
  { name: 'Tax Planner', href: '/tax-planner', icon: PieChart },
  { name: 'Pengaturan', href: '/settings', icon: Settings },
];

export function Sidebar() {
  const location = useLocation();

  return (
    <div className="flex h-full w-64 flex-col bg-white border-r border-slate-200">
      <div className="flex h-16 items-center px-6 border-b border-slate-200">
        <span className="text-xl font-bold text-primary">TaxPlanner</span>
      </div>
      <nav className="flex-1 space-y-1 px-3 py-4">
        {navigation.map((item) => {
          const isActive = location.pathname === item.href;
          return (
            <Link
              key={item.name}
              to={item.href}
              className={cn(
                'group flex items-center px-3 py-2 text-sm font-medium rounded-md transition-colors',
                isActive
                  ? 'bg-primary/10 text-primary'
                  : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
              )}
            >
              <item.icon
                className={cn(
                  'mr-3 h-5 w-5 flex-shrink-0',
                  isActive ? 'text-primary' : 'text-slate-400 group-hover:text-slate-500'
                )}
              />
              {item.name}
            </Link>
          );
        })}
      </nav>
      <div className="border-t border-slate-200 p-4">
        <Link
          to="/notifications"
          className="group flex items-center px-3 py-2 text-sm font-medium text-slate-600 rounded-md hover:bg-slate-50 hover:text-slate-900"
        >
          <Bell className="mr-3 h-5 w-5 text-slate-400 group-hover:text-slate-500" />
          Notifikasi
        </Link>
      </div>
    </div>
  );
}
