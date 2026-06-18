// src/app/(dashboard)/layout.tsx
'use client';

import { useClientAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { 
  LayoutDashboard, ArrowRightLeft, Clock, 
  User, LogOut, Building2 
} from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const { client, isAuthenticated, isLoading, logout } = useClientAuth();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push('/login');
    }
  }, [isLoading, isAuthenticated, router]);

  if (isLoading || !isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  const menuItems = [
    { href: '/dashboard', label: 'Accueil', icon: LayoutDashboard },
    { href: '/dashboard/transfert', label: 'Transfert', icon: ArrowRightLeft },
    { href: '/dashboard/transactions', label: 'Historique', icon: Clock },
    { href: '/dashboard/profile', label: 'Profil', icon: User },
  ];

  return (
    <div className="min-h-screen bg-gray-100 flex">
      {/* Sidebar mobile */}
      <div className="hidden lg:flex lg:flex-col lg:w-64 bg-gray-900 text-white">
        <div className="p-6 border-b border-gray-800">
          <div className="flex items-center gap-3">
            <Building2 className="h-8 w-8 text-blue-400" />
            <div>
              <h1 className="text-lg font-bold">Ma Banque</h1>
              <p className="text-xs text-gray-400">Espace Client</p>
            </div>
          </div>
        </div>

        <nav className="flex-1 py-4">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const active = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-3 px-6 py-3 text-sm transition-colors ${
                  active ? 'bg-blue-600 text-white' : 'text-gray-300 hover:bg-gray-800 hover:text-white'
                }`}
              >
                <Icon className="h-5 w-5" />
                {item.label}
              </Link>
            );
          })}
        </nav>

        <div className="p-4 border-t border-gray-800">
          <button
            onClick={logout}
            className="flex items-center gap-2 w-full text-gray-400 hover:text-white transition-colors"
          >
            <LogOut className="h-5 w-5" />
            Déconnexion
          </button>
        </div>
      </div>

      {/* Navigation mobile bottom */}
      <div className="lg:hidden fixed bottom-0 left-0 right-0 bg-white border-t z-50">
        <div className="flex justify-around py-2">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const active = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex flex-col items-center p-2 ${active ? 'text-blue-600' : 'text-gray-500'}`}
              >
                <Icon className="h-6 w-6" />
                <span className="text-xs mt-1">{item.label}</span>
              </Link>
            );
          })}
        </div>
      </div>

      {/* Contenu principal */}
      <div className="flex-1 lg:ml-0 pb-16 lg:pb-0">
        <main className="p-4 lg:p-8">
          {children}
        </main>
      </div>
    </div>
  );
}