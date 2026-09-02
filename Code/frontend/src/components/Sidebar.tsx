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
  Server
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
      badgeColor: 'bg-[#ffdad6] text-[#93000a] border border-[#ba1a1a]/20'
    },
    {
      id: 'users' as TabType,
      label: 'Người Dùng & Phân Quyền',
      icon: Users,
      badge: pendingUsersCount > 0 ? pendingUsersCount : null,
      badgeColor: 'bg-[#d0e1fb] text-[#004395] border border-[#004395]/20'
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
          className="fixed inset-0 bg-black/40 backdrop-blur-xs z-40 md:hidden"
        />
      )}

      {/* Sidebar Container */}
      <nav className={`
        fixed left-0 top-16 h-[calc(100vh-4rem)] flex flex-col py-4 px-3 w-64 md:w-68
        bg-white border-r border-[#c2c6d6] z-30 transition-transform duration-200 ease-in-out shadow-2xs
        ${openMobileMenu ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}
      `}>
        
        {/* Navigation Category Label */}
        <div className="px-3 pb-2 text-[11px] font-bold text-[#727785] uppercase tracking-wider">
          Phân Hệ Điều Hành
        </div>

        {/* Navigation Items */}
        <div className="flex-1 flex flex-col gap-1 overflow-y-auto">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = currentTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => handleNavClick(item.id)}
                className={`
                  flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-bold
                  transition-all duration-150 cursor-pointer text-left group
                  ${isActive 
                    ? 'bg-[#d0e1fb] text-[#004395] shadow-2xs' 
                    : 'text-[#424754] hover:text-[#191c1e] hover:bg-[#f2f4f6]'}
                `}
              >
                <div className="flex items-center gap-3 min-w-0">
                  <Icon className={`w-4 h-4 shrink-0 transition-colors ${
                    isActive ? 'text-[#0058be]' : 'text-[#727785] group-hover:text-[#0058be]'
                  }`} />
                  <span className="truncate">{item.label}</span>
                </div>
                {item.badge && (
                  <span className={`px-2 py-0.5 rounded-full text-[11px] font-bold shrink-0 ml-2 shadow-2xs ${item.badgeColor}`}>
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {/* User Card & Footer actions */}
        <div className="mt-auto flex flex-col gap-1.5 pt-3 border-t border-[#e0e3e5]">
          {currentUser && (
            <div className="p-2.5 rounded-xl bg-[#f8fafc] border border-[#c2c6d6] mb-1 flex items-center gap-2.5 shadow-2xs">
              <div className="w-8 h-8 rounded-full bg-[#0058be] text-white font-bold text-xs flex items-center justify-center shrink-0 overflow-hidden shadow-2xs">
                {currentUser.avatarUrl ? (
                  <img src={currentUser.avatarUrl} alt={currentUser.name} className="w-full h-full object-cover" />
                ) : (
                  currentUser.initials || 'U'
                )}
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-xs font-bold text-[#191c1e] truncate">{currentUser.name}</div>
                <div className="text-[10px] text-[#0058be] font-semibold truncate">
                  {currentUser.role === 'Admin' ? 'Quản trị viên' : currentUser.role === 'Technician' ? 'Kỹ thuật viên' : 'Người xem'} • {currentUser.userId}
                </div>
              </div>
            </div>
          )}

          <button
            onClick={() => { onCloseMobileMenu(); onOpenSupport(); }}
            className="flex items-center gap-3 px-3 py-2 rounded-lg text-xs font-bold text-[#424754] hover:text-[#191c1e] hover:bg-[#f2f4f6] transition-colors text-left cursor-pointer"
          >
            <HelpCircle className="w-4 h-4 text-[#727785]" />
            <span>Tài liệu & Hỗ trợ</span>
          </button>
          <button
            onClick={() => { onCloseMobileMenu(); onSignOut(); }}
            className="flex items-center gap-3 px-3 py-2 rounded-lg text-xs font-bold text-[#ba1a1a] hover:bg-[#ffdad6]/50 transition-colors text-left cursor-pointer"
          >
            <LogOut className="w-4 h-4 text-[#ba1a1a]" />
            <span>Đăng xuất</span>
          </button>
        </div>
      </nav>
    </>
  );
};
