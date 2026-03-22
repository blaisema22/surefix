import React, { useState, useEffect, useCallback } from 'react';
import { NavLink, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import {
  LayoutDashboard, Calendar, Smartphone, Search, Bell, Users,
  Wrench, Store, Settings, LogOut, X, ChevronDown, User,
  CalendarPlus,
} from 'lucide-react';

/* ── Nav items per role ── */
const CUSTOMER_NAV = [
  {
    group: 'Overview',
    items: [
      { path: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
      { path: '/find-repair', label: 'Book Repair', icon: Search },
      { path: '/appointments', label: 'My Bookings', icon: CalendarPlus },
    ],
  },
  {
    group: 'Personal',
    items: [
      { path: '/devices', label: 'My Hardware', icon: Smartphone },
      { path: '/notifications', label: 'Repair Updates', icon: Bell },
      { path: '/settings', label: 'Settings', icon: Settings },
    ],
  },
];

const SHOP_NAV = [
  {
    group: 'Business',
    items: [
      { path: '/shop/dashboard', label: 'Dashboard', icon: LayoutDashboard },
      { path: '/shop/appointments', label: 'Repair Queue', icon: Calendar },
      { path: '/shop/customers', label: 'Client List', icon: Users },
      { path: '/notifications', label: 'Alerts', icon: Bell },
    ],
  },
  {
    group: 'Configuration',
    items: [
      { path: '/shop/services', label: 'Services', icon: Wrench },
      { path: '/shop/profile', label: 'Shop Profile', icon: Store },
    ],
  },
];

const ADMIN_NAV = [
  {
    group: 'Administration',
    items: [
      { path: '/admin/dashboard', label: 'Stats', icon: LayoutDashboard },
      { path: '/admin/users', label: 'Users', icon: Users },
      { path: '/admin/centres', label: 'Centres', icon: Store },
    ],
  },
];

const sidebarStyles = `
  @import url('https://fonts.googleapis.com/css2?family=Outfit:wght@400;500;600;700&display=swap');

  .sf-sidebar * { font-family: 'Outfit', sans-serif; box-sizing: border-box; }

  .sf-sidebar {
    background: #0a0f1a;
    border-right: 1px solid rgba(255,255,255,0.06);
    position: relative;
  }

  .sf-sidebar::before {
    content: '';
    position: absolute;
    top: 0; left: 0; right: 0;
    height: 320px;
    background: radial-gradient(ellipse 180% 80% at 50% -20%, rgba(249,115,22,0.12) 0%, transparent 70%);
    pointer-events: none;
    z-index: 0;
  }

  .sf-sidebar > * { position: relative; z-index: 1; }

  /* scrollbar */
  .sf-scroll::-webkit-scrollbar { width: 3px; }
  .sf-scroll::-webkit-scrollbar-track { background: transparent; }
  .sf-scroll::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.08); border-radius: 4px; }
  .sf-scroll::-webkit-scrollbar-thumb:hover { background: rgba(249,115,22,0.3); }

  /* Search input */
  .sf-search-wrap {
    display: flex; align-items: center; gap: 10px;
    background: rgba(255,255,255,0.04);
    border: 1px solid rgba(255,255,255,0.07);
    border-radius: 12px; padding: 10px 14px;
    transition: border-color 0.2s, background 0.2s;
  }
  .sf-search-wrap:focus-within {
    border-color: rgba(249,115,22,0.4);
    background: rgba(249,115,22,0.05);
  }
  .sf-search-wrap input {
    background: none; border: none; outline: none;
    font-size: 13px; color: rgba(255,255,255,0.75);
    width: 100%; font-family: 'Outfit', sans-serif;
  }
  .sf-search-wrap input::placeholder { color: rgba(255,255,255,0.25); }

  /* Group label */
  .sf-group-label {
    font-size: 10px; font-weight: 600; letter-spacing: 1.2px;
    text-transform: uppercase; color: rgba(255,255,255,0.2);
    padding: 0 12px; margin-bottom: 4px; margin-top: 6px;
    display: flex; align-items: center; justify-content: space-between;
    cursor: pointer; user-select: none;
    transition: color 0.2s;
  }
  .sf-group-label:hover { color: rgba(255,255,255,0.45); }

  /* Nav item */
  .sf-nav-item {
    display: flex; align-items: center; gap: 12px;
    padding: 10px 14px; border-radius: 11px;
    font-size: 13.5px; font-weight: 500;
    color: rgba(255,255,255,0.45);
    text-decoration: none; cursor: pointer;
    transition: all 0.18s ease;
    position: relative; overflow: hidden;
    border: 1px solid transparent;
    margin-bottom: 2px;
  }
  .sf-nav-item:hover {
    color: rgba(255,255,255,0.85);
    background: rgba(255,255,255,0.05);
    border-color: rgba(255,255,255,0.06);
    transform: translateX(2px);
  }
  .sf-nav-item.active {
    color: #fff;
    background: linear-gradient(135deg, rgba(249,115,22,0.18) 0%, rgba(234,88,12,0.10) 100%);
    border-color: rgba(249,115,22,0.25);
    box-shadow: 0 2px 16px rgba(249,115,22,0.08);
  }
  .sf-nav-item.active .sf-nav-icon {
    color: #f97316;
  }
  .sf-nav-item.active::before {
    content: '';
    position: absolute; left: 0; top: 20%; bottom: 20%;
    width: 3px; border-radius: 0 3px 3px 0;
    background: linear-gradient(180deg, #f97316, #ea580c);
  }

  /* badge */
  .sf-badge {
    font-size: 10px; font-weight: 700;
    background: #ef4444; color: #fff;
    padding: 1px 6px; border-radius: 20px;
    margin-left: auto; line-height: 16px;
    animation: sf-pulse 2s infinite;
  }
  @keyframes sf-pulse {
    0%, 100% { opacity: 1; }
    50% { opacity: 0.65; }
  }

  /* footer */
  .sf-footer-btn {
    display: flex; align-items: center; gap: 12px;
    padding: 12px 14px; border-radius: 14px;
    border: 1px solid rgba(255,255,255,0.07);
    background: rgba(255,255,255,0.03);
    cursor: pointer; width: 100%; text-align: left;
    transition: all 0.2s;
  }
  .sf-footer-btn:hover {
    background: rgba(255,255,255,0.07);
    border-color: rgba(249,115,22,0.3);
  }

  .sf-logout-btn {
    display: flex; align-items: center; gap: 10px;
    padding: 10px 14px; border-radius: 11px;
    border: 1px solid rgba(239,68,68,0.18);
    background: rgba(239,68,68,0.06);
    cursor: pointer; width: 100%; text-align: left;
    color: rgba(239,68,68,0.7);
    font-size: 13px; font-weight: 500;
    font-family: 'Outfit', sans-serif;
    transition: all 0.2s;
    margin-top: 8px;
  }
  .sf-logout-btn:hover {
    background: rgba(239,68,68,0.14);
    border-color: rgba(239,68,68,0.35);
    color: #fca5a5;
  }

  /* chevron transition */
  .sf-chevron { transition: transform 0.22s ease; }
  .sf-chevron.open { transform: rotate(180deg); }

  /* group items slide */
  .sf-group-items {
    overflow: hidden;
    transition: max-height 0.28s ease, opacity 0.22s ease;
  }
  .sf-group-items.collapsed { max-height: 0 !important; opacity: 0; }
`;

export default function Sidebar({ isOpen, onClose }) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const role = user?.role ?? 'customer';
  const navGroups = role === 'repairer' ? SHOP_NAV : role === 'admin' ? ADMIN_NAV : CUSTOMER_NAV;
  const initials = user?.name?.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase() ?? 'U';
  const roleLabels = { customer: 'Customer', repairer: 'Shop Owner', admin: 'Administrator' };
  const roleLabel = roleLabels[role] || 'User';

  const [openGroups, setOpenGroups] = useState(() =>
    Object.fromEntries(navGroups.map(g => [g.group, true]))
  );
  const [searchQuery, setSearchQuery] = useState('');
  const unreadNotifications = 3;

  const toggleGroup = useCallback((group) => {
    setOpenGroups(prev => ({ ...prev, [group]: !prev[group] }));
  }, []);

  const filteredGroups = navGroups.map(group => ({
    ...group,
    items: group.items.filter(item =>
      item.label.toLowerCase().includes(searchQuery.toLowerCase())
    ),
  })).filter(g => g.items.length > 0);

  useEffect(() => {
    const handleKey = (e) => { if (e.key === 'Escape') onClose(); };
    if (isOpen) document.addEventListener('keydown', handleKey);
    return () => document.removeEventListener('keydown', handleKey);
  }, [isOpen, onClose]);

  return (
    <>
      <style>{sidebarStyles}</style>

      {/* Mobile overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 lg:hidden"
          onClick={onClose}
        />
      )}

      <aside
        className={`sf-sidebar fixed lg:relative inset-y-0 left-0 flex flex-col h-screen z-50 transition-transform duration-300 ease-in-out
          ${isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
          w-[270px]`}
      >
        {/* Mobile close */}
        <button
          onClick={onClose}
          className="absolute top-5 right-4 p-1.5 rounded-lg text-white/30 hover:text-white/70 hover:bg-white/5 transition-all lg:hidden z-10"
          aria-label="Close sidebar"
        >
          <X size={18} strokeWidth={2} />
        </button>

        {/* ── Logo ── */}
        <div className="flex items-center gap-4 px-5 py-7 flex-shrink-0">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-orange-500 to-orange-700 flex items-center justify-center shadow-xl shadow-orange-900/50 flex-shrink-0">
            <span className="text-white font-bold text-base tracking-wide">SF</span>
          </div>
          <div>
            <span className="text-[22px] font-bold text-white tracking-tight leading-none">SureFix</span>
            <div className="text-[10px] font-semibold text-orange-400/70 tracking-[1.5px] uppercase mt-1">{roleLabel}</div>
          </div>
        </div>

        {/* ── Search ── */}
        <div className="px-4 mb-3 flex-shrink-0">
          <div className="sf-search-wrap">
            <Search size={15} className="text-white/25 flex-shrink-0" />
            <input
              type="text"
              placeholder="Search menu..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              autoComplete="off"
            />
          </div>
        </div>

        {/* ── Nav ── */}
        <nav className="sf-scroll flex-1 overflow-y-auto px-3 pb-2" aria-label="Main navigation">
          {filteredGroups.map(({ group, items }) => (
            <div key={group} className="mb-3">
              <div className="sf-group-label" onClick={() => toggleGroup(group)}>
                <span>{group}</span>
                <ChevronDown
                  size={13}
                  className={`sf-chevron ${openGroups[group] ? 'open' : ''}`}
                  style={{ color: 'rgba(255,255,255,0.2)' }}
                />
              </div>

              <div
                className={`sf-group-items ${openGroups[group] === false ? 'collapsed' : ''}`}
                style={{ maxHeight: openGroups[group] === false ? '0' : `${items.length * 56}px` }}
              >
                {items.map(item => {
                  const Icon = item.icon;
                  const isActive = location.pathname === item.path;
                  const hasNotif = item.path.includes('notification') && unreadNotifications > 0;
                  return (
                    <NavLink
                      key={item.path}
                      to={item.path}
                      onClick={onClose}
                      className={({ isActive: a }) => `sf-nav-item ${a ? 'active' : ''}`}
                    >
                      <Icon
                        size={17}
                        strokeWidth={2}
                        className="sf-nav-icon flex-shrink-0"
                        style={{ color: isActive ? '#f97316' : 'rgba(255,255,255,0.35)' }}
                      />
                      <span className="flex-1 truncate">{item.label}</span>
                      {hasNotif && (
                        <span className="sf-badge">{unreadNotifications}</span>
                      )}
                    </NavLink>
                  );
                })}
              </div>
            </div>
          ))}
        </nav>

        {/* ── Footer ── */}
        <div className="px-4 pb-5 pt-3 flex-shrink-0 border-t border-white/[0.05]">
          <button className="sf-footer-btn" onClick={() => navigate('/profile')}>
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-orange-500 to-orange-700 flex items-center justify-center text-white text-sm font-bold shadow-md flex-shrink-0">
              {initials}
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-sm font-semibold text-white/90 truncate leading-snug">
                {user?.name || 'User'}
              </div>
              <div className="text-xs text-white/30 capitalize">{roleLabel}</div>
            </div>
            <Settings size={15} className="text-white/20 flex-shrink-0" />
          </button>

          <button className="sf-logout-btn" onClick={() => logout()}>
            <LogOut size={16} strokeWidth={2} />
            <span>Sign out</span>
          </button>
        </div>
      </aside>
    </>
  );
}