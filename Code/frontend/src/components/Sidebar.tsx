import React from 'react';
import { 
  Box, 
  Activity, 
  QrCode, 
  AlertTriangle, 
  Users, 
  FileText, 
  HelpCircle, 
  LogOut,
  Layers,
  Server,
  Radio
} from 'lucide-react';
import { TabType, UserItem } from '../types';

interface SidebarProps {
  currentTab: TabType;
  onSelectTab: (tab: TabType) => void;
  openMobileMenu: boolean;
  onCloseMobileMenu: () => void;
  alertCount: number;
  pendingUsersCount: number;
  currentUser?: UserItem | null;
  onOpenSupport: () => void;
  onSignOut: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  currentTab,
  onSelectTab,
  openMobileMenu,
  onCloseMobileMenu,
  alertCount,
  pendingUsersCount,
  currentUser,
  onOpenSupport,
  onSignOut
}) => {
  const navItems = [
    {
      id: 'digital-twin' as TabType,
      label: 'Mặt Bằng Digital Twin',
      icon: Box,
    },
    {
      id: 'telemetry' as TabType,
      label: 'Chỉ Số Đo Từ Xa',
      icon: Activity,
    },
    {
      id: 'assets-qr' as TabType,
      label: 'Tài Sản & Mã QR AR',
      icon: QrCode,
    },
    {
      id: 'alerts' as TabType,
      label: 'Cảnh Báo & Sự Cố',
      icon: AlertTriangle,
      badge: alertCount > 0 ? alertCount : null,
      badgeColor: 'bg-rose-500/20 text-rose-400 border border-rose-500/30'
    },
    {
      id: 'users' as TabType,
      label: 'Người Dùng & Phân Quyền',
      icon: Users,
      badge: pendingUsersCount > 0 ? pendingUsersCount : null,
      badgeColor: 'bg-sky-500/20 text-sky-400 border border-sky-500/30'
    },
    {
      id: 'audit-logs' as TabType,
      label: 'Nhật Ký Kiểm Toán',
      icon: FileText,
    }
  ];

  const handleNavClick = (tabId: TabType) => {
    onSelectTab(tabId);
    onCloseMobileMenu();
  };

  return (
    <>
      {/* Mobile Backdrop */}
      {openMobileMenu && (
        <div 
          onClick={onCloseMobileMenu}
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 md:hidden"
        />
      )}

      {/* Sidebar Container */}
      <nav className={`
        fixed left-0 top-16 h-[calc(100vh-4rem)] flex flex-col py-4 px-3 w-64 md:w-68
        bg-[#090d16] border-r border-slate-800/80 z-30 transition-transform duration-200 ease-in-out
        ${openMobileMenu ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}
      `}>
        
        {/* Navigation Category Label */}
        <div className="px-3 pb-2 text-[10px] font-extrabold text-slate-500 uppercase tracking-widest flex items-center justify-between">
          <span>Phân Hệ Điều Hành</span>
          <span className="flex items-center gap-1 text-[9px] text-emerald-400 normal-case font-mono">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
            Syncing
          </span>
        </div>

        {/* Navigation Items */}
        <div className="flex-1 flex flex-col gap-1.5 overflow-y-auto pr-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = currentTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => handleNavClick(item.id)}
                className={`
                  flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-semibold
                  transition-all duration-150 cursor-pointer text-left group relative
                  ${isActive 
                    ? 'bg-gradient-to-r from-sky-500/15 via-sky-500/10 to-transparent text-sky-400 border-l-2 border-sky-400 shadow-sm' 
                    : 'text-slate-400 hover:text-slate-100 hover:bg-slate-800/50'}
                `}
              >
                <div className="flex items-center gap-3 min-w-0">
                  <Icon className={`w-4 h-4 shrink-0 transition-colors ${
                    isActive ? 'text-sky-400' : 'text-slate-500 group-hover:text-slate-300'
                  }`} />
                  <span className="truncate">{item.label}</span>
                </div>
                {item.badge && (
                  <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold shrink-0 ml-2 shadow-sm ${item.badgeColor}`}>
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {/* System Node Telemetry Status Pill */}
        <div className="mx-1 my-3 p-3 rounded-xl bg-slate-900/60 border border-slate-800/80 flex flex-col gap-1.5">
          <div className="flex items-center justify-between text-[11px] font-medium text-slate-400">
            <span className="flex items-center gap-1.5">
              <Radio className="w-3.5 h-3.5 text-sky-400 animate-pulse" />
              WebSocket Engine
            </span>
            <span className="text-[10px] text-emerald-400 font-mono font-bold">100% OK</span>
          </div>
          <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden">
            <div className="bg-gradient-to-r from-sky-500 to-emerald-400 h-full w-[98%] rounded-full" />
          </div>
          <div className="flex justify-between text-[9px] text-slate-500 font-mono">
            <span>Room: Alpha-DC</span>
            <span>Latency: 12ms</span>
          </div>
        </div>

        {/* User Card & Footer Actions */}
        <div className="flex flex-col gap-1 pt-2 border-t border-slate-800/80">
          <button
            onClick={onOpenSupport}
            className="flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs font-medium text-slate-400 hover:text-slate-200 hover:bg-slate-800/50 transition-colors cursor-pointer text-left"
          >
            <HelpCircle className="w-4 h-4 text-slate-500" />
            <span>Tài Liệu & Trợ Giúp</span>
          </button>

          <button
            onClick={onSignOut}
            className="flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs font-medium text-rose-400/90 hover:text-rose-300 hover:bg-rose-500/10 transition-colors cursor-pointer text-left"
          >
            <LogOut className="w-4 h-4 text-rose-400/80" />
            <span>Đăng Xuất</span>
          </button>
        </div>
      </nav>
    </>
  );
};
