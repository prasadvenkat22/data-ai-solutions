import { useEffect, useRef, useState } from 'react';
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
import { useAuth, useSiteAuth } from './AuthProvider';
import { LogIn, LogOut, CandlestickChart, Bot, Mail, TrendingUp, Bell as BellIcon, UserCircle2, UserPlus } from 'lucide-react';

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
      { label: 'Engine settings', href: '/desk/settings' },
    ],
  },
  { label: 'AI Lab', href: '/ai', icon: Bot, roles: ['admin', 'trader'] },
];

export default function Navbar() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [openDropdown, setOpenDropdown] = useState<string | null>(null);
  const [accountOpen, setAccountOpen] = useState(false);
  const accountRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (!accountOpen) return;
    const close = (e: MouseEvent) => { if (!accountRef.current?.contains(e.target as Node)) setAccountOpen(false); };
    document.addEventListener('mousedown', close);
    return () => document.removeEventListener('mousedown', close);
  }, [accountOpen]);
  const router = useRouter();
  // Two independent sessions: `user` is the trading desk's (it gates the
  // desk/admin menus), `siteUser` is the general site's Sign in / Sign up.
  // Signing out of one never signs out of the other.
  const { user, logout, hasRole } = useAuth();
  const { user: siteUser, logout: siteLogout } = useSiteAuth();
  const links = navLinks.filter((l) => !l.roles || hasRole(...l.roles));

  const isActive = (href: string) => {
    const base = href.split('#')[0];
    // '/#section' links never highlight; only the bare Home entry owns '/'.
    if (base === '/') return href === '/' && router.pathname === '/';
    return router.pathname.startsWith(base);
  };

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-slate-900/95 backdrop-blur-md border-b border-slate-700/50 shadow-lg">
      <div className="max-w-screen-2xl mx-auto px-4 sm:px-6 lg:px-8">
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

          {/* Desktop Nav -- only when there is room for it (the menu button covers narrower screens) */}
          <div className="hidden 2xl:flex items-center gap-1">
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

          {/* Session: one compact account menu, so Sign out can never be pushed off-screen */}
          <div className="hidden md:flex items-center gap-2 ml-auto 2xl:ml-0">
            <div className="relative" ref={accountRef}>
              <button
                type="button"
                onClick={() => setAccountOpen((o) => !o)}
                aria-haspopup="menu"
                aria-expanded={accountOpen}
                className="inline-flex items-center gap-1.5 px-3 py-2 text-sm font-medium text-slate-200 hover:text-white rounded-lg border border-slate-700 hover:bg-slate-800 max-w-[16rem]"
              >
                <UserCircle2 className="w-4 h-4 shrink-0" />
                <span className="truncate">{user?.email || siteUser?.name || siteUser?.email || 'Account'}</span>
                <ChevronDown className="w-3.5 h-3.5 shrink-0" />
              </button>
              {accountOpen && (
                <div role="menu" className="absolute right-0 mt-2 w-72 bg-slate-900 border border-slate-700 rounded-xl shadow-xl p-2 space-y-1">
                  <div className="px-3 pt-1 text-[11px] uppercase tracking-wider text-slate-500">Site</div>
                  {siteUser ? (
                    <>
                      <div className="px-3 py-1 text-xs text-slate-400 truncate" title={siteUser.email}>{siteUser.name || siteUser.email}</div>
                      <button type="button" role="menuitem" onClick={() => { setAccountOpen(false); siteLogout(); }}
                        className="w-full flex items-center gap-2 px-3 py-2 text-sm text-slate-200 hover:bg-slate-800 rounded-lg">
                        <LogOut className="w-4 h-4" /> Sign out
                      </button>
                    </>
                  ) : (
                    <div className="grid grid-cols-2 gap-2 px-1">
                      <Link href="/signin" onClick={() => setAccountOpen(false)} className="flex items-center justify-center gap-1.5 px-3 py-2 text-sm text-slate-200 bg-slate-800 rounded-lg"><LogIn className="w-4 h-4" /> Sign in</Link>
                      <Link href="/signup" onClick={() => setAccountOpen(false)} className="flex items-center justify-center gap-1.5 px-3 py-2 text-sm text-slate-200 border border-slate-700 rounded-lg"><UserPlus className="w-4 h-4" /> Sign up</Link>
                    </div>
                  )}
                  <div className="my-1 border-t border-slate-800" />
                  <div className="px-3 text-[11px] uppercase tracking-wider text-slate-500">Trading desk</div>
                  {user ? (
                    <>
                      <Link href="/account" onClick={() => setAccountOpen(false)}
                        className="flex items-center gap-2 px-3 py-2 text-sm text-slate-300 hover:text-white hover:bg-slate-800 rounded-lg" title="Your trading account">
                        <CandlestickChart className="w-4 h-4" />
                        <span className="truncate">{user.email}{user.role ? ` · ${user.role}` : ''}</span>
                      </Link>
                      <button type="button" role="menuitem" onClick={() => { setAccountOpen(false); logout(); void router.push('/'); }}
                        className="w-full flex items-center gap-2 px-3 py-2 text-sm text-slate-200 hover:bg-slate-800 rounded-lg">
                        <LogOut className="w-4 h-4" /> Trading sign out
                      </button>
                    </>
                  ) : (
                    <Link href="/login" onClick={() => setAccountOpen(false)}
                      className="flex items-center justify-center gap-1.5 mx-1 px-3 py-2 text-sm font-semibold bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-lg">
                      <CandlestickChart className="w-4 h-4" /> Trading sign in
                    </Link>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Mobile toggle */}
          <button
            onClick={() => setMobileOpen(!mobileOpen)}
            aria-label={mobileOpen ? 'Close menu' : 'Open menu'}
            className="2xl:hidden p-2 text-slate-300 hover:text-white rounded-lg hover:bg-slate-800 transition-colors"
          >
            {mobileOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      {mobileOpen && (
        <div className="2xl:hidden bg-slate-900 border-t border-slate-800 px-4 py-3 space-y-1 max-h-[calc(100dvh-4rem)] overflow-y-auto overscroll-contain">
          <div className="pb-3 mb-2 border-b border-slate-800 space-y-1">
            {siteUser ? (
              <button
                onClick={() => { setMobileOpen(false); siteLogout(); }}
                className="block w-full text-center px-4 py-2.5 text-sm font-semibold bg-slate-800 text-white rounded-lg"
              >
                Sign out ({siteUser.email})
              </button>
            ) : (
              <div className="grid grid-cols-2 gap-2">
                <Link href="/signin" onClick={() => setMobileOpen(false)} className="text-center px-4 py-2.5 text-sm font-semibold bg-slate-800 text-white rounded-lg">Sign in</Link>
                <Link href="/signup" onClick={() => setMobileOpen(false)} className="text-center px-4 py-2.5 text-sm font-semibold border border-slate-700 text-white rounded-lg">Sign up</Link>
              </div>
            )}
            {user ? (
              <>
                <Link
                  href="/account"
                  onClick={() => setMobileOpen(false)}
                  className="flex items-center gap-2 px-3 py-2.5 rounded-lg text-sm font-medium text-slate-300 hover:text-white hover:bg-slate-800"
                >
                  <UserCircle2 className="w-4 h-4" /> Your trading account
                </Link>
                <button
                  onClick={() => { setMobileOpen(false); logout(); void router.push('/'); }}
                  className="block w-full text-center px-4 py-2.5 text-sm font-semibold bg-slate-800 text-white rounded-lg"
                >
                  Trading sign out ({user.email})
                </button>
              </>
            ) : (
              <Link
                href="/login"
                onClick={() => setMobileOpen(false)}
                className="block w-full text-center px-4 py-2.5 text-sm font-semibold bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-lg"
              >
                Trading sign in
              </Link>
            )}
          </div>
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
        </div>
      )}
    </nav>
  );
}
