import { Outlet, Link, useLocation } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { LayoutDashboard, Package, ArrowRightLeft, Bell, LogOut, Hash, Globe, Users, ShoppingCart } from 'lucide-react';

export const Layout = () => {
  const { logout, user } = useAuth();
  const location = useLocation();

  const baseNavigation = [
    { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
    { name: 'Stock', href: '/stock', icon: Package },
    { name: 'Movimientos', href: '/movements', icon: ArrowRightLeft },
    { name: 'Lotes', href: '/batches', icon: Package },
    { name: 'Series', href: '/serial-numbers', icon: Hash },
    { name: 'Alertas', href: '/alerts', icon: Bell },
    { name: 'Proveedores', href: '/suppliers', icon: Users },
    { name: 'Compras', href: '/purchase-orders', icon: ShoppingCart },
  ];

  const navigation = user?.role === 'ADMIN' 
    ? [...baseNavigation, { name: 'Webhooks', href: '/webhooks', icon: Globe }]
    : baseNavigation;

  return (
    <div className="flex h-screen overflow-hidden bg-slate-50 dark:bg-slate-950">
      {/* Sidebar Desktop (Static for MVP) */}
      <aside className="hidden w-64 flex-col border-r border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-950 md:flex">
        <div className="flex h-16 items-center px-6 border-b border-slate-200 dark:border-slate-800">
          <div className="flex items-center gap-2 font-bold text-xl tracking-tight text-slate-900 dark:text-slate-50">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-slate-900 dark:bg-slate-50">
              <Package className="h-5 w-5 text-slate-50 dark:text-slate-900" />
            </div>
            StockFlow
          </div>
        </div>

        <div className="flex flex-1 flex-col overflow-y-auto pt-4">
          <nav className="flex-1 space-y-1 px-3">
            {navigation.map((item) => {
              const isActive = location.pathname.startsWith(item.href);
              return (
                <Link
                  key={item.name}
                  to={item.href}
                  className={`group flex items-center rounded-md px-3 py-2 text-sm font-medium transition-colors ${
                    isActive
                      ? 'bg-slate-100 text-slate-900 dark:bg-slate-800 dark:text-slate-50'
                      : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900 dark:text-slate-400 dark:hover:bg-slate-800/50 dark:hover:text-slate-50'
                  }`}
                >
                  <item.icon
                    className={`mr-3 h-5 w-5 flex-shrink-0 ${
                      isActive ? 'text-slate-900 dark:text-slate-50' : 'text-slate-400 group-hover:text-slate-500'
                    }`}
                  />
                  {item.name}
                </Link>
              );
            })}
          </nav>
        </div>

        <div className="border-t border-slate-200 p-4 dark:border-slate-800">
          <div className="mb-4 px-2 text-sm text-slate-500">
            {user?.name || 'Operador'}
            <div className="text-xs opacity-70">{user?.role || 'OPERATOR'}</div>
          </div>
          <button
            onClick={logout}
            className="flex w-full items-center gap-3 rounded-md px-3 py-2 text-sm font-medium text-slate-600 transition-colors hover:bg-slate-100 hover:text-slate-900 dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-slate-50"
          >
            <LogOut className="h-5 w-5 text-slate-400" />
            Cerrar Sesión
          </button>
        </div>
      </aside>

      {/* Main content */}
      <main className="flex-1 overflow-y-auto overflow-x-hidden">
        <div className="mx-auto max-w-7xl p-4 md:p-8">
          <Outlet />
        </div>
      </main>
    </div>
  );
};
