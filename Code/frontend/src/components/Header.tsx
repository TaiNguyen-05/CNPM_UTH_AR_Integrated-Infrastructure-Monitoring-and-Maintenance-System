import React, { useState } from 'react';
import { 
  Search, 
  PlusSquare, 
  Settings, 
  Bell, 
  Menu, 
  X, 
  CheckCircle, 
  AlertTriangle,
  Layers,
  Shield,
  Activity,
  LogOut,
  HelpCircle,
  Cpu,
  Sparkles,
  Terminal,
  Box,
  QrCode,
  Users,
  FileText,
  Camera
} from 'lucide-react';
import { TabType, AlertItem, UserItem } from '../types';
import { MOCK_AVATAR_ADMIN } from '../data/mockData';

interface HeaderProps {
  currentTab: TabType;
  onSelectTab: (tab: TabType) => void;
  alerts: AlertItem[];
  currentUser?: UserItem | null;
  onSignOut: () => void;
  onOpenNewAsset: () => void;
  onOpenSettings: () => void;
  onOpenSupport: () => void;
  onMobileMenuToggle: () => void;
  searchQuery: string;
  onSearchChange: (query: string) => void;
}

export const Header: React.FC<HeaderProps> = ({
  currentTab,
  onSelectTab,
  alerts,
  currentUser,
  onSignOut,
  onOpenNewAsset,
  onOpenSettings,
  onOpenSupport,
  onMobileMenuToggle,
  searchQuery,
  onSearchChange
}) => {
  const [showNotifications, setShowNotifications] = useState(false);
  const [showProfileMenu, setShowProfileMenu] = useState(false);

  const unreadAlerts = alerts.filter(a => !a.acknowledged && !a.resolved);
  const userName = currentUser?.name || 'Sarah Jenkins';
  const userEmail = currentUser?.email || 'sjenkins@ar-imms.corp';
  const userRole = currentUser?.role || 'Admin';
  const userInitials = currentUser?.initials || 'SJ';
  const userAvatar = currentUser?.avatarUrl || (currentUser?.role === 'Admin' ? MOCK_AVATAR_ADMIN : undefined);

  const navLinks = [
    { id: 'digital-twin' as TabType, label: '3D Twin // Floor' },
    { id: 'telemetry' as TabType, label: 'Console // Stream' },
    { id: 'assets-qr' as TabType, label: 'Hardware // AR' },
    { id: 'alerts' as TabType, label: 'Incidents // Alerts', badge: unreadAlerts.length > 0 ? unreadAlerts.length : null },
    { id: 'users' as TabType, label: 'Enclave // RBAC' },
    { id: 'audit-logs' as TabType, label: 'Logs // Audit' },
  ];

  return (
    <header className="fixed top-0 left-0 w-full z-50 flex items-center h-16 bg-[#080b0e]/90 backdrop-blur-xl border-b border-[#222c37] transition-all duration-300">
      <div className="w-full max-w-7xl mx-auto px-4 md:px-6 flex items-center justify-between">
        {/* Brand Logo & Ping indicator */}
        <div className="flex items-center gap-3">
          <button 
            onClick={onMobileMenuToggle}
            className="lg:hidden text-slate-400 hover:text-white cursor-pointer p-1.5 rounded-lg border border-[#222c37] bg-[#11161b]"
            aria-label="Toggle Menu"
          >
            <Menu className="w-4 h-4" />
          </button>

          <a 
            onClick={() => onSelectTab('digital-twin')}
            className="flex items-center gap-2.5 font-mono text-sm sm:text-base font-bold tracking-wider text-white cursor-pointer group select-none"
          >
            <span className="relative flex h-2 w-2">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-[#00f0ff] opacity-75" />
              <span className="relative inline-flex h-2 w-2 rounded-full bg-[#00f0ff]" />
            </span>
            <span className="text-white group-hover:text-[#00f0ff] transition-colors">
              CORE // AR-IMMS
            </span>
          </a>
        </div>

        {/* Center Cyber Navigation Links (Desktop) */}
        <nav className="hidden lg:flex items-center gap-6 font-mono text-xs uppercase tracking-widest text-slate-400">
          {navLinks.map((link) => {
            const isActive = currentTab === link.id;
            return (
              <button
                key={link.id}
                onClick={() => onSelectTab(link.id)}
                className={`transition-colors cursor-pointer relative py-1 flex items-center gap-1.5 ${
                  isActive 
                    ? 'text-[#00f0ff] font-bold border-b border-[#00f0ff]' 
                    : 'hover:text-slate-200'
                }`}
              >
                <span>{link.label}</span>
                {link.badge && (
                  <span className="h-4 px-1 rounded-sm bg-rose-500/20 text-rose-400 border border-rose-500/40 text-[9px] font-mono flex items-center justify-center">
                    {link.badge}
                  </span>
                )}
              </button>
            );
          })}
        </nav>

        {/* Right Actions */}
        <div className="flex items-center gap-2.5 sm:gap-3">
          {/* LNKS // SECURE Badge */}
          <span className="hidden sm:inline-block border border-[#222c37] bg-[#11161b] px-2.5 py-1 font-mono text-[10px] text-[#ffb03a] tracking-wider">
            LNKS // SECURE
          </span>

          {/* Quick Action: New Asset */}
          <button
            onClick={onOpenNewAsset}
            title="Thêm thiết bị mới"
            className="border border-[#222c37] bg-[#11161b] hover:border-[#38bdf8] text-slate-300 hover:text-white p-2 transition-all cursor-pointer"
          >
            <PlusSquare className="w-4 h-4" />
          </button>

          {/* Notifications Popover */}
          <div className="relative">
            <button
              onClick={() => setShowNotifications(prev => !prev)}
              title="Cảnh báo hệ thống"
              className="relative border border-[#222c37] bg-[#11161b] hover:border-[#ffb03a] text-slate-300 hover:text-white p-2 transition-all cursor-pointer"
            >
              <Bell className="w-4 h-4" />
              {unreadAlerts.length > 0 && (
                <span className="absolute -top-1 -right-1 w-2 h-2 rounded-full bg-rose-500 animate-ping" />
              )}
            </button>

            {showNotifications && (
              <div className="absolute right-0 mt-3 w-80 sm:w-96 bg-[#080b0e] border border-[#222c37] shadow-2xl p-4 z-50 font-mono text-xs">
                <div className="flex justify-between items-center pb-2.5 border-b border-[#222c37] text-slate-300">
                  <span className="font-bold uppercase text-[#00f0ff]">INCIDENT LOGS</span>
                  <button onClick={() => setShowNotifications(false)} className="text-slate-500 hover:text-white">✕</button>
                </div>

                <div className="mt-2.5 max-h-64 overflow-y-auto space-y-2 pr-1">
                  {unreadAlerts.length === 0 ? (
                    <div className="py-6 text-center text-slate-500 text-[11px]">
                      [ OK ] All systems nominal. 0 pending alerts.
                    </div>
                  ) : (
                    unreadAlerts.map(alert => (
                      <div 
                        key={alert.id}
                        onClick={() => {
                          setShowNotifications(false);
                          onSelectTab('alerts');
                        }}
                        className="p-2.5 border border-[#222c37] bg-[#11161b] hover:border-[#ffb03a] transition-colors cursor-pointer"
                      >
                        <div className="flex justify-between text-[10px] text-[#ffb03a] mb-1">
                          <span>{alert.alertCode}</span>
                          <span>{alert.time}</span>
                        </div>
                        <div className="text-white font-sans font-bold text-xs">{alert.title}</div>
                        <div className="text-slate-400 text-[10px]">{alert.location}</div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}
          </div>

          {/* User Profile Pill */}
          <div className="relative">
            <button
              onClick={() => setShowProfileMenu(prev => !prev)}
              className="flex items-center gap-2 border border-[#222c37] bg-[#11161b] hover:border-[#38bdf8] px-2.5 py-1.5 transition-all cursor-pointer font-mono text-xs"
            >
              <div className="w-5 h-5 bg-[#38bdf8] text-[#080b0e] font-bold text-[10px] flex items-center justify-center font-mono">
                {userInitials}
              </div>
              <span className="hidden md:inline-block text-slate-200 text-[11px] truncate max-w-[90px]">{userName}</span>
            </button>

            {showProfileMenu && (
              <div className="absolute right-0 mt-3 w-56 bg-[#080b0e] border border-[#222c37] shadow-2xl p-2 z-50 font-mono text-xs">
                <div className="px-3 py-2 border-b border-[#222c37] mb-1">
                  <div className="text-white font-bold">{userName}</div>
                  <div className="text-[10px] text-slate-400 truncate">{userEmail}</div>
                  <div className="text-[9px] text-[#00f0ff] uppercase mt-1">Role: {userRole}</div>
                </div>

                <button
                  onClick={() => {
                    setShowProfileMenu(false);
                    onOpenSettings();
                  }}
                  className="w-full flex items-center gap-2 px-3 py-2 text-slate-300 hover:text-white hover:bg-[#161d24] transition-colors text-left"
                >
                  <Settings className="w-3.5 h-3.5" />
                  System Config
                </button>

                <button
                  onClick={() => {
                    setShowProfileMenu(false);
                    onOpenSupport();
                  }}
                  className="w-full flex items-center gap-2 px-3 py-2 text-slate-300 hover:text-white hover:bg-[#161d24] transition-colors text-left"
                >
                  <HelpCircle className="w-3.5 h-3.5" />
                  Documentation
                </button>

                <div className="my-1 border-t border-[#222c37]" />

                <button
                  onClick={() => {
                    setShowProfileMenu(false);
                    onSignOut();
                  }}
                  className="w-full flex items-center gap-2 px-3 py-2 text-rose-400 hover:bg-rose-950/40 transition-colors text-left"
                >
                  <LogOut className="w-3.5 h-3.5" />
                  Terminate Session
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};
