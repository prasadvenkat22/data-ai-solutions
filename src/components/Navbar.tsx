import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import {
  Menu,
  X,
  ChevronDown,
  Database,
  BrainCircuit,
  Users,
  Building2,
  CalendarCheck,
  LayoutDashboard,
  Cpu,
  ArrowLeftRight,
  FileText,
  Package,
  Shield,
  Wrench,
  Layers,
} from 'lucide-react';
import clsx from 'clsx';
import { useAuth } from './AuthProvider';
import { LogIn, LogOut, CandlestickChart, Bot, Mail, TrendingUp, Bell as BellIcon, UserCircle2 } from 'lucide-react';

// `roles` gates a whole menu: a visitor sees Home, Consulting and Contact;
// a trader adds Trading; an admin sees everything. The API enforces the same
// split (CRUD and AI are admin-only, /trading is admin or trader), so this is
// about not showing a regular user a menu of pages that would 403 -- the
// operator's "adding products and services should be disabled" for them.
type NavLink = {
  label: string;
  href: string;
  icon: typeof LayoutDashboard;
  roles?: string[];
  children?: { label: string; href: string }[];
};

const navLinks: NavLink[] = [
  { label: 'Home', href: '/', icon: LayoutDashboard },
  {
    label: 'Consulting',
    href: '/services',
    icon: BrainCircuit,
    children: [
      { label: 'Cloud Platforms', href: '/services#cloud' },
      { label: 'AI & ML Solutions', href: '/services#ai' },
      { label: 'Data Analytics', href: '/services#analytics' },
      { label: 'Custom Implementations', href: '/services#custom' },
      { label: 'Service Catalog', href: '/services#catalog' },
    ],
  },
  // Public: the featured product, on the home page. The signed-in desk is
  // the 'Trading desk' menu below; visitors should still be able to find
  // what the product is from the top bar.
  { label: 'Auto-Trader', href: '/#auto-trader', icon: TrendingUp },
  { label: 'Contact', href: '/contact', icon: Mail },
  // Product updates: a mailing list, not an account. Sign-in stays for
  // investors' accounts, which an admin creates.
  { label: 'Get updates', href: '/updates', icon: BellIcon },
  {
    label: 'Data',
    href: '/customers',
    icon: Layers,
    roles: ['admin'],
    children: [
      { label: 'Customers', href: '/customers' },
      { label: 'Users', href: '/users' },
      { label: 'Devices', href: '/devices' },
      { label: 'Products', href: '/products' },
      { label: 'Services', href: '/services#catalog' },
      { label: 'Registrations', href: '/registrations' },
      { label: 'Updates subscribers', href: '/subscribers' },
    ],
  },
  {
    label: 'Operations',
    href: '/service-requests',
    icon: Wrench,
    roles: ['admin'],
    children: [
      { label: 'Service Requests', href: '/service-requests' },
      { label: 'Transactions', href: '/transactions' },
      { label: 'Invoices', href: '/invoices' },
    ],
  },
  {
    label: 'Config',
    href: '/roles',
    icon: Shield,
    roles: ['admin'],
    children: [
      { label: 'Roles', href: '/roles' },
      { label: 'Demos', href: '/registrations' },
    ],
  },
  {
    label: 'Trading desk',
    href: '/desk',
    icon: CandlestickChart,
    roles: ['admin', 'trader'],
    children: [
      { label: 'Positions', href: '/desk' },
      { label: 'Closed trades', href: '/desk/history' },
      { label: 'Screener board', href: '/desk/board' },
      { label: 'Engine controls', href: '/desk/controls' },
    ],
  },
  { label: 'AI Lab', href: '/ai', icon: Bot, roles: ['admin'] },
];

export default function Navbar() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [openDropdown, setOpenDropdown] = useState<string | null>(null);
  const router = useRouter();
  const { user, logout, hasRole } = useAuth();
  const links = navLinks.filter((l) => !l.roles || hasRole(...l.roles));

  const isActive = (href: string) => {
    const base = href.split('#')[0];
    // '/#section' links never highlight; only the bare Home entry owns '/'.
    if (base === '/') return href === '/' && router.pathname === '/';
    return router.pathname.startsWith(base);
  };

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-slate-900/95 backdrop-blur-md border-b border-slate-700/50 shadow-lg">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2 group">
            <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center shadow-lg group-hover:shadow-indigo-500/40 transition-shadow">
              <Database className="w-5 h-5 text-white" />
            </div>
            <div className="hidden sm:block">
              <span className="text-white font-bold text-lg leading-tight">Data AI</span>
              <span className="text-indigo-400 font-bold text-lg leading-tight"> Systems</span>
            </div>
          </Link>

          {/* Desktop Nav */}
          <div className="hidden md:flex items-center gap-1">
            {links.map((link) => (
              <div
                key={link.href}
                className="relative"
                onMouseEnter={() => link.children && setOpenDropdown(link.label)}
                onMouseLeave={() => setOpenDropdown(null)}
              >
                <Link
                  href={link.href}
                  className={clsx(
                    'flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium transition-all',
                    isActive(link.href)
                      ? 'bg-indigo-600 text-white'
                      : 'text-slate-300 hover:text-white hover:bg-slate-800'
                  )}
                >
                  <link.icon className="w-4 h-4" />
                  {link.label}
                  {link.children && <ChevronDown className="w-3.5 h-3.5 ml-0.5" />}
                </Link>

                {link.children && openDropdown === link.label && (
                  <div className="absolute top-full left-0 pt-2 w-52 z-50">
                    <div className="bg-slate-800 border border-slate-700 rounded-xl shadow-xl py-1">
                      {link.children.map((child) => (
                        <Link
                          key={child.href}
                          href={child.href}
                          className="block px-4 py-2.5 text-sm text-slate-300 hover:text-white hover:bg-slate-700 transition-colors"
                        >
                          {child.label}
                        </Link>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* CTA / session */}
          <div className="hidden md:flex items-center gap-2">
            {user ? (
              <>
                {/* The email is the way to /account (change password). */}
                <Link
                  href="/account"
                  title="Your account"
                  className={clsx(
                    'inline-flex items-center gap-1.5 px-2 py-2 text-xs rounded-lg hover:bg-slate-800',
                    router.pathname === '/account' ? 'text-white' : 'text-slate-400 hover:text-white'
                  )}
                >
                  <UserCircle2 className="w-4 h-4" />
                  {user.email}{user.role ? ` · ${user.role}` : ''}
                </Link>
                <button
                  onClick={() => { logout(); void router.push('/'); }}
                  className="inline-flex items-center gap-1.5 px-3 py-2 text-sm font-medium text-slate-300 hover:text-white rounded-lg hover:bg-slate-800"
                >
                  <LogOut className="w-4 h-4" /> Sign out
                </button>
              </>
            ) : (
              <Link
                href="/login"
                className="inline-flex items-center gap-1.5 px-4 py-2 text-sm font-semibold bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-lg hover:from-indigo-500 hover:to-purple-500 transition-all shadow-lg hover:shadow-indigo-500/30"
              >
                <LogIn className="w-4 h-4" /> Sign in
              </Link>
            )}
          </div>

          {/* Mobile toggle */}
          <button
            onClick={() => setMobileOpen(!mobileOpen)}
            className="md:hidden p-2 text-slate-300 hover:text-white rounded-lg hover:bg-slate-800 transition-colors"
          >
            {mobileOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      {mobileOpen && (
        <div className="md:hidden bg-slate-900 border-t border-slate-800 px-4 py-3 space-y-1">
          {links.map((link) => (
            <div key={link.href}>
              <Link
                href={link.href}
                onClick={() => setMobileOpen(false)}
                className={clsx(
                  'flex items-center gap-2 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors',
                  isActive(link.href)
                    ? 'bg-indigo-600 text-white'
                    : 'text-slate-300 hover:text-white hover:bg-slate-800'
                )}
              >
                <link.icon className="w-4 h-4" />
                {link.label}
              </Link>
              {link.children && (
                <div className="ml-6 mt-1 space-y-1">
                  {link.children.map((child) => (
                    <Link
                      key={child.href}
                      href={child.href}
                      onClick={() => setMobileOpen(false)}
                      className="block px-3 py-2 text-sm text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors"
                    >
                      {child.label}
                    </Link>
                  ))}
                </div>
              )}
            </div>
          ))}
          <div className="pt-2 border-t border-slate-800 space-y-1">
            {user ? (
              <>
                <Link
                  href="/account"
                  onClick={() => setMobileOpen(false)}
                  className="flex items-center gap-2 px-3 py-2.5 rounded-lg text-sm font-medium text-slate-300 hover:text-white hover:bg-slate-800"
                >
                  <UserCircle2 className="w-4 h-4" /> Your account
                </Link>
                <button
                  onClick={() => { setMobileOpen(false); logout(); void router.push('/'); }}
                  className="block w-full text-center px-4 py-2.5 text-sm font-semibold bg-slate-800 text-white rounded-lg"
                >
                  Sign out ({user.email})
                </button>
              </>
            ) : (
              <Link
                href="/login"
                onClick={() => setMobileOpen(false)}
                className="block w-full text-center px-4 py-2.5 text-sm font-semibold bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-lg"
              >
                Sign in
              </Link>
            )}
          </div>
        </div>
      )}
    </nav>
  );
}
