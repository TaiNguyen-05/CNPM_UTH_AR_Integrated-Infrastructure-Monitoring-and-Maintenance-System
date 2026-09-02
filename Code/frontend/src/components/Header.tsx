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
  LogOut
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

  return (
    <header className="fixed top-0 left-0 w-full z-40 flex justify-between items-center px-4 md:px-6 h-16 bg-[#f7f9fb] border-b border-[#c2c6d6] shadow-xs">
      <div className="flex items-center gap-3">
        {/* Mobile menu toggle */}
        <button 
          onClick={onMobileMenuToggle}
          className="md:hidden text-[#0058be] cursor-pointer p-2 rounded-full hover:bg-[#e0e3e5] transition-colors active:scale-95"
          aria-label="Toggle Menu"
        >
          <Menu className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-2">
          <div className="text-xl font-bold text-[#0058be] tracking-tight">AR-IMMS</div>
          <div className="hidden sm:inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold bg-[#d8e2ff] text-[#004395]">
            v1.0-PROD
          </div>
        </div>
      </div>

      <div className="flex items-center gap-3 md:gap-4">
        {/* Search on Right (Desktop) */}
        <div className="hidden md:flex items-center bg-[#ffffff] rounded-full px-3.5 py-1.5 border border-[#c2c6d6] focus-within:border-[#0058be] focus-within:ring-2 focus-within:ring-[#0058be]/20 transition-all shadow-xs w-64 lg:w-72">
          <Search className="w-4 h-4 text-[#727785] mr-2 shrink-0" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder={
              currentTab === 'telemetry' 
                ? 'Tìm kiếm node, thông số đo...' 
                : currentTab === 'users' 
                ? 'Tìm người dùng, vai trò...' 
                : currentTab === 'audit-logs'
                ? 'Tìm nhật ký, địa chỉ IP...'
                : 'Tìm kiếm tài sản, tủ rack...'
            }
            className="bg-transparent border-none focus:outline-none text-sm w-full text-[#191c1e] placeholder:text-[#727785] p-0"
          />
          {searchQuery && (
            <button 
              onClick={() => onSearchChange('')}
              className="text-[#727785] hover:text-[#191c1e]"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        {/* Quick Action Button */}
        <button
          onClick={onOpenNewAsset}
          title="Thêm tài sản mới"
          className="text-[#424754] hover:text-[#0058be] hover:bg-[#e0e3e5] p-2 rounded-full transition-colors cursor-pointer active:scale-95 relative"
        >
          <PlusSquare className="w-5 h-5" />
        </button>

        {/* Settings button */}
        <button
          onClick={onOpenSettings}
          title="Cấu hình hệ thống"
          className="text-[#424754] hover:text-[#0058be] hover:bg-[#e0e3e5] p-2 rounded-full transition-colors cursor-pointer active:scale-95"
        >
          <Settings className="w-5 h-5" />
        </button>

        {/* Notifications button with badge */}
        <div className="relative">
          <button
            onClick={() => setShowNotifications(!showNotifications)}
            title="Thông báo & Cảnh báo hoạt động"
            className="text-[#424754] hover:text-[#0058be] hover:bg-[#e0e3e5] p-2 rounded-full transition-colors cursor-pointer active:scale-95 relative"
          >
            <Bell className="w-5 h-5" />
            {unreadAlerts.length > 0 && (
              <span className="absolute top-1.5 right-1.5 w-2.5 h-2.5 bg-[#ba1a1a] rounded-full ring-2 ring-[#f7f9fb] animate-pulse" />
            )}
          </button>

          {/* Notifications Dropdown */}
          {showNotifications && (
            <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-white rounded-xl border border-[#c2c6d6] shadow-xl z-50 overflow-hidden animate-in fade-in slide-in-from-top-2 duration-150">
              <div className="p-3 bg-[#f2f4f6] border-b border-[#c2c6d6] flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Bell className="w-4 h-4 text-[#0058be]" />
                  <span className="text-xs font-bold uppercase tracking-wider text-[#191c1e]">Cảnh báo đang mở ({unreadAlerts.length})</span>
                </div>
                <button
                  onClick={() => {
                    setShowNotifications(false);
                    onSelectTab('alerts');
                  }}
                  className="text-xs text-[#0058be] hover:underline font-semibold cursor-pointer"
                >
                  Xem tất cả
                </button>
              </div>
              <div className="max-h-72 overflow-y-auto divide-y divide-[#e0e3e5]">
                {unreadAlerts.length === 0 ? (
                  <div className="p-6 text-center text-[#727785] text-sm">
                    <CheckCircle className="w-8 h-8 text-[#00855b] mx-auto mb-2 opacity-80" />
                    Tất cả hệ thống hoạt động bình thường. Không có cảnh báo chưa xử lý.
                  </div>
                ) : (
                  unreadAlerts.map((alert) => (
                    <div 
                      key={alert.id}
                      onClick={() => {
                        setShowNotifications(false);
                        onSelectTab('alerts');
                      }}
                      className="p-3 hover:bg-[#f2f4f6] cursor-pointer transition-colors"
                    >
                      <div className="flex items-center justify-between mb-1">
                        <span className={`text-xs font-bold px-1.5 py-0.5 rounded ${
                          alert.severity === 'Critical' 
                            ? 'bg-[#ffdad6] text-[#93000a]' 
                            : 'bg-yellow-100 text-yellow-800'
                        }`}>
                          {alert.alertCode} • {alert.severity === 'Critical' ? 'Nghiêm trọng' : 'Cảnh báo'}
                        </span>
                        <span className="text-[11px] text-[#727785] font-mono">{alert.time}</span>
                      </div>
                      <h4 className="text-xs font-bold text-[#191c1e]">{alert.title}</h4>
                      <p className="text-xs text-[#424754] line-clamp-1 mt-0.5">{alert.description}</p>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}
        </div>

        {/* Profile Avatar & Dropdown */}
        <div className="relative ml-1">
          <button 
            onClick={() => setShowProfileMenu(!showProfileMenu)}
            className="w-8 h-8 rounded-full overflow-hidden border border-[#c2c6d6] hover:ring-2 hover:ring-[#0058be] transition-all cursor-pointer flex items-center justify-center bg-[#0058be] text-white font-bold text-xs flex-shrink-0"
          >
            {userAvatar ? (
              <img 
                src={userAvatar} 
                alt={`${userName} profile photo`} 
                className="w-full h-full object-cover"
              />
            ) : (
              <span>{userInitials}</span>
            )}
          </button>

          {showProfileMenu && (
            <div className="absolute right-0 mt-2 w-64 bg-white rounded-xl border border-[#c2c6d6] shadow-xl z-50 overflow-hidden py-1 animate-in fade-in zoom-in-95 duration-100">
              <div className="p-3 border-b border-[#e0e3e5] bg-[#f8fafc]">
                <div className="font-bold text-sm text-[#191c1e] truncate">{userName}</div>
                <div className="text-xs text-[#727785] truncate">{userEmail}</div>
                <span className={`inline-block mt-1 px-2 py-0.5 text-[10px] font-bold rounded ${
                  userRole === 'Admin' ? 'bg-[#d0e1fb] text-[#004395]' :
                  userRole === 'Technician' ? 'bg-[#e0f5ea] text-[#00855b]' :
                  'bg-[#f2f4f6] text-[#424754]'
                }`}>
                  {userRole} ({userRole === 'Admin' ? 'Toàn quyền CRUD' : userRole === 'Technician' ? 'Vận hành AR/Node' : 'Chỉ xem Telemetry'})
                </span>
              </div>

              <div className="py-1 text-sm">
                <button 
                  onClick={() => { setShowProfileMenu(false); onSelectTab('users'); }}
                  className="w-full px-3 py-2 text-left hover:bg-[#f2f4f6] flex items-center gap-2 text-[#424754] cursor-pointer text-xs font-semibold"
                >
                  <Shield className="w-4 h-4 text-[#0058be]" />
                  Quản lý quyền & Tài khoản
                </button>
                <button 
                  onClick={() => { setShowProfileMenu(false); onSelectTab('telemetry'); }}
                  className="w-full px-3 py-2 text-left hover:bg-[#f2f4f6] flex items-center gap-2 text-[#424754] cursor-pointer text-xs font-semibold"
                >
                  <Activity className="w-4 h-4 text-[#00855b]" />
                  Chỉ số Telemetry thời gian thực
                </button>
                <button 
                  onClick={() => { setShowProfileMenu(false); onOpenSettings(); }}
                  className="w-full px-3 py-2 text-left hover:bg-[#f2f4f6] flex items-center gap-2 text-[#424754] cursor-pointer text-xs font-semibold"
                >
                  <Settings className="w-4 h-4 text-[#727785]" />
                  Cấu hình hệ thống & Cảnh báo
                </button>
                <div className="border-t border-[#e0e3e5] my-1" />
                <button 
                  onClick={() => { setShowProfileMenu(false); onSignOut(); }}
                  className="w-full px-3 py-2 text-left hover:bg-[#ffdad6]/50 flex items-center gap-2 text-[#ba1a1a] cursor-pointer text-xs font-bold"
                >
                  <LogOut className="w-4 h-4 text-[#ba1a1a]" />
                  Đăng Xuất Phiên Làm Việc
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
