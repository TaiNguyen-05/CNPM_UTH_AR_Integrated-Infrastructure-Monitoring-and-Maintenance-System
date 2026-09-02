import React, { useState } from 'react';
import { 
  Users, 
  UserCheck, 
  ShieldAlert, 
  Search, 
  Filter, 
  Plus, 
  Lock, 
  Unlock, 
  Check, 
  X, 
  MoreVertical, 
  Shield, 
  ExternalLink,
  Clock,
  Eye,
  Settings
} from 'lucide-react';
import { UserItem } from '../types';

interface UsersViewProps {
  users: UserItem[];
  onApproveUser: (userId: string) => void;
  onDenyUser: (userId: string) => void;
  onToggleLockUser: (userId: string) => void;
  onInviteUser: () => void;
  onManagePolicies: () => void;
  searchQuery: string;
  onSearchChange: (q: string) => void;
}

export const UsersView: React.FC<UsersViewProps> = ({
  users,
  onApproveUser,
  onDenyUser,
  onToggleLockUser,
  onInviteUser,
  onManagePolicies,
  searchQuery,
  onSearchChange
}) => {
  const [roleFilter, setRoleFilter] = useState<string>('All Roles');

  const pendingCount = users.filter(u => u.status === 'Pending').length;
  const lockedCount = users.filter(u => u.status === 'Locked').length;
  const activeCount = users.filter(u => u.status === 'Active').length;

  const filteredUsers = users.filter(user => {
    const matchesRole = roleFilter === 'All Roles' || user.role === roleFilter;
    const matchesSearch = !searchQuery || 
      user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.userId.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesRole && matchesSearch;
  });

  return (
    <div className="p-4 md:p-6 max-w-[1600px] mx-auto flex flex-col gap-6">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-2xl lg:text-3xl font-bold text-[#191c1e] tracking-tight">Phê Duyệt Người Dùng & Phân Quyền RBAC</h1>
          <p className="text-xs text-[#727785] mt-0.5">Quản lý định danh nhân sự, yêu cầu cấp quyền và chính sách bảo mật vai trò.</p>
        </div>

        {/* Search, Filter, Action */}
        <div className="w-full md:w-auto flex flex-col sm:flex-row gap-3">
          <div className="flex items-center bg-white rounded-lg px-3 py-2 border border-[#c2c6d6] hover:border-[#0058be] transition-colors shadow-xs">
            <Filter className="w-4 h-4 text-[#727785] mr-2 shrink-0" />
            <select
              value={roleFilter}
              onChange={(e) => setRoleFilter(e.target.value)}
              className="bg-transparent border-none focus:outline-none text-xs font-semibold text-[#191c1e] cursor-pointer outline-none"
            >
              <option value="All Roles">Tất cả vai trò</option>
              <option value="Admin">Quản trị viên (Admin)</option>
              <option value="Technician">Kỹ thuật viên (Technician)</option>
              <option value="Viewer">Người xem (Viewer)</option>
            </select>
          </div>

          <button
            onClick={onInviteUser}
            className="bg-[#0058be] text-white px-4 py-2 rounded-full text-xs font-bold flex items-center justify-center gap-2 hover:bg-[#2170e4] transition-colors shadow-xs cursor-pointer active:scale-95"
          >
            <Plus className="w-4 h-4" />
            Mời Thành Viên
          </button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {/* Active Personnel */}
        <div className="bg-white rounded-xl border border-[#c2c6d6] p-4 shadow-xs flex flex-col justify-between hover:shadow-md transition-shadow">
          <div className="flex justify-between items-start mb-2">
            <span className="text-xs font-bold text-[#424754] uppercase tracking-wider">Tổng Nhân Sự Đang Hoạt Động</span>
            <Users className="w-5 h-5 text-[#727785]" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl lg:text-3xl font-bold text-[#191c1e]">142</span>
            <span className="text-xs font-bold text-[#00855b]">+3 tuần này</span>
          </div>
        </div>

        {/* Pending Approvals */}
        <div className="bg-white rounded-xl border border-[#c2c6d6] p-4 shadow-xs flex flex-col justify-between hover:shadow-md transition-shadow">
          <div className="flex justify-between items-start mb-2">
            <span className="text-xs font-bold text-[#424754] uppercase tracking-wider">Chờ Phê Duyệt</span>
            <Clock className="w-5 h-5 text-[#0058be]" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl lg:text-3xl font-bold text-[#0058be]">{pendingCount}</span>
            <span className="text-xs font-semibold text-[#004395] bg-[#d0e1fb] px-2 py-0.5 rounded">
              Cần kiểm duyệt
            </span>
          </div>
        </div>

        {/* Security Alerts */}
        <div className="bg-white rounded-xl border border-[#c2c6d6] p-4 shadow-xs flex flex-col justify-between hover:shadow-md transition-shadow">
          <div className="flex justify-between items-start mb-2">
            <span className="text-xs font-bold text-[#424754] uppercase tracking-wider">Cảnh Báo An Ninh</span>
            <ShieldAlert className="w-5 h-5 text-[#ba1a1a]" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl lg:text-3xl font-bold text-[#ba1a1a]">{lockedCount}</span>
            <span className="text-xs font-semibold text-[#93000a] bg-[#ffdad6] px-2 py-0.5 rounded">
              Hoạt động khả nghi
            </span>
          </div>
        </div>
      </div>

      {/* Bento Grid */}
      <div className="grid grid-cols-1 xl:grid-cols-12 gap-6">
        {/* Personnel Directory Table (Spans 8 cols) */}
        <div className="xl:col-span-8 bg-white rounded-xl border border-[#c2c6d6] shadow-xs overflow-hidden flex flex-col h-[520px]">
          <div className="px-4 py-3.5 border-b border-[#c2c6d6] flex justify-between items-center bg-[#f8fafc]">
            <h2 className="text-sm font-bold text-[#191c1e]">Danh Bạ Nhân Sự</h2>
            <span className="text-xs font-bold bg-[#d0e1fb] text-[#004395] px-2.5 py-0.5 rounded-full">
              {filteredUsers.length} Người
            </span>
          </div>

          <div className="overflow-y-auto flex-1 p-2">
            <table className="w-full text-left border-collapse">
              <thead className="sticky top-0 bg-white z-10 border-b border-[#c2c6d6] shadow-2xs">
                <tr>
                  <th className="p-3 text-xs font-bold text-[#424754]">Nhân Viên</th>
                  <th className="p-3 text-xs font-bold text-[#424754]">Vai Trò</th>
                  <th className="p-3 text-xs font-bold text-[#424754]">Trạng Thái</th>
                  <th className="p-3 text-xs font-bold text-[#424754]">Xác Thực Lần Cuối</th>
                  <th className="p-3 text-xs font-bold text-[#424754] text-right">Thao Tác</th>
                </tr>
              </thead>
              <tbody className="text-xs divide-y divide-[#c2c6d6]/60">
                {filteredUsers.map((user) => {
                  const isPending = user.status === 'Pending';
                  const isLocked = user.status === 'Locked';
                  const isActive = user.status === 'Active';

                  return (
                    <tr key={user.id} className="hover:bg-[#f2f4f6] transition-colors">
                      {/* Avatar & User Info */}
                      <td className="p-3">
                        <div className="flex items-center gap-3">
                          {user.avatarUrl ? (
                            <img
                              src={user.avatarUrl}
                              alt={user.name}
                              className="w-8 h-8 rounded-full object-cover border border-[#c2c6d6]"
                            />
                          ) : (
                            <div className="w-8 h-8 rounded-full bg-[#d0e1fb] text-[#004395] font-bold flex items-center justify-center text-xs">
                              {user.initials}
                            </div>
                          )}
                          <div>
                            <div className="font-bold text-[#191c1e] flex items-center gap-1.5">
                              {user.name}
                              {user.isSelf && (
                                <span className="text-[10px] bg-[#d0e1fb] text-[#004395] px-1.5 py-0.2 rounded font-bold">Bạn</span>
                              )}
                            </div>
                            <div className="text-[11px] text-[#727785] font-mono">{user.email} • {user.userId}</div>
                          </div>
                        </div>
                      </td>

                      {/* Role Pill */}
                      <td className="p-3">
                        <span className={`px-2 py-0.5 rounded text-[11px] font-bold ${
                          user.role === 'Admin'
                            ? 'bg-[#d0e1fb] text-[#004395]'
                            : user.role === 'Technician'
                            ? 'bg-[#e0e3e5] text-[#191c1e]'
                            : 'bg-[#f2f4f6] text-[#727785]'
                        }`}>
                          {user.role}
                        </span>
                      </td>

                      {/* Status */}
                      <td className="p-3">
                        {isPending ? (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-bold bg-[#d0e1fb] text-[#004395]">
                            <Clock className="w-3 h-3" /> Chờ duyệt
                          </span>
                        ) : isLocked ? (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-bold bg-[#ffdad6] text-[#93000a]">
                            <Lock className="w-3 h-3" /> Bị khóa
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-bold bg-[#6ffbbe]/40 text-[#006947]">
                            <Check className="w-3 h-3" /> Đang hoạt động
                          </span>
                        )}
                      </td>

                      {/* Last Auth */}
                      <td className="p-3 text-[#424754] font-mono text-[11px]">{user.lastAuth}</td>

                      {/* Row Actions */}
                      <td className="p-3 text-right">
                        {isPending ? (
                          <div className="flex items-center justify-end gap-1.5">
                            <button
                              onClick={() => onApproveUser(user.id)}
                              className="px-2.5 py-1 bg-[#00855b] text-white rounded text-xs font-bold hover:bg-[#006947] transition-colors flex items-center gap-1 cursor-pointer"
                              title="Duyệt quyền truy cập"
                            >
                              <Check className="w-3.5 h-3.5" /> Phê Duyệt
                            </button>
                            <button
                              onClick={() => onDenyUser(user.id)}
                              className="px-2.5 py-1 bg-white border border-[#ba1a1a] text-[#ba1a1a] rounded text-xs font-bold hover:bg-[#ffdad6]/30 transition-colors flex items-center gap-1 cursor-pointer"
                              title="Từ chối yêu cầu"
                            >
                              <X className="w-3.5 h-3.5" /> Từ Chối
                            </button>
                          </div>
                        ) : (
                          <div className="flex items-center justify-end gap-1.5">
                            <button
                              onClick={() => onToggleLockUser(user.id)}
                              className={`p-1.5 rounded transition-colors cursor-pointer ${
                                isLocked 
                                   ? 'text-[#00855b] hover:bg-[#f5fff6]' 
                                  : 'text-[#ba1a1a] hover:bg-[#ffdad6]/40'
                              }`}
                              title={isLocked ? 'Mở Khóa Tài Khoản' : 'Khóa Tài Khoản'}
                            >
                              {isLocked ? <Unlock className="w-4 h-4" /> : <Lock className="w-4 h-4" />}
                            </button>
                          </div>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        {/* Sidebar Cards (Spans 4 cols) */}
        <div className="xl:col-span-4 flex flex-col gap-6">
          {/* Role Matrix Card */}
          <div className="bg-white rounded-xl border border-[#c2c6d6] shadow-xs p-4 flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-3 border-b border-[#c2c6d6] pb-2">
                <div className="flex items-center gap-2">
                  <Shield className="w-4 h-4 text-[#0058be]" />
                  <h3 className="text-xs font-bold text-[#191c1e] uppercase tracking-wider">Ma Trận Quyền Hạn (RBAC)</h3>
                </div>
              </div>

              <div className="space-y-3 text-xs">
                <div className="p-2.5 bg-[#f8fafc] rounded-lg border border-[#e0e3e5]">
                  <div className="font-bold text-[#004395] mb-0.5">Vai Trò Quản Trị Viên (Admin)</div>
                  <div className="text-[#424754] text-[11px]">Toàn quyền CRUD đối với tủ Rack, mã AR, cấu hình ngưỡng Telemetry và phê duyệt tài khoản.</div>
                </div>

                <div className="p-2.5 bg-[#f8fafc] rounded-lg border border-[#e0e3e5]">
                  <div className="font-bold text-[#191c1e] mb-0.5">Vai Trò Kỹ Thuật Viên (Technician)</div>
                  <div className="text-[#424754] text-[11px]">Quyền Xem & Cập nhật tại các khu vực được phân công, hướng dẫn sửa chữa AR và ghi nhật ký bảo trì.</div>
                </div>

                <div className="p-2.5 bg-[#f8fafc] rounded-lg border border-[#e0e3e5]">
                  <div className="font-bold text-[#727785] mb-0.5">Vai Trò Người Xem (Viewer)</div>
                  <div className="text-[#424754] text-[11px]">Quyền chỉ xem bảng điều khiển Digital Twin không gian, biểu đồ KPI và nhật ký kiểm toán.</div>
                </div>
              </div>
            </div>

            <button
              onClick={onManagePolicies}
              className="mt-4 w-full py-2 bg-white border border-[#0058be] text-[#0058be] font-bold text-xs rounded-lg hover:bg-[#d8e2ff]/30 transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
            >
              <Settings className="w-3.5 h-3.5" />
              Quản Lý Chính Sách Bảo Mật
            </button>
          </div>

          {/* Security Log Feed */}
          <div className="bg-white rounded-xl border border-[#c2c6d6] shadow-xs p-4 flex-1">
            <h3 className="text-xs font-bold text-[#191c1e] uppercase tracking-wider mb-3 border-b border-[#c2c6d6] pb-2">
              Sự Kiện An Ninh Gần Đây
            </h3>

            <div className="space-y-2.5 text-xs">
              <div className="flex items-start gap-2">
                <span className="w-2 h-2 rounded-full bg-[#ba1a1a] mt-1.5 shrink-0" />
                <div>
                  <span className="font-bold text-[#191c1e]">Hệ thống cảnh báo Michael Chen</span>
                  <p className="text-[11px] text-[#727785]">Quét liên tục các điểm neo AR chưa xác thực tại Khu B.</p>
                </div>
              </div>

              <div className="flex items-start gap-2">
                <span className="w-2 h-2 rounded-full bg-[#00855b] mt-1.5 shrink-0" />
                <div>
                  <span className="font-bold text-[#191c1e]">Sarah Jenkins cấp quyền Tech-04</span>
                  <p className="text-[11px] text-[#727785]">Đã cấp quyền nâng cao phục vụ sửa chữa khẩn cấp Tủ Rack A2.</p>
                </div>
              </div>

              <div className="flex items-start gap-2">
                <span className="w-2 h-2 rounded-full bg-[#0058be] mt-1.5 shrink-0" />
                <div>
                  <span className="font-bold text-[#191c1e]">Robert King đã kết nối</span>
                  <p className="text-[11px] text-[#727785]">Phiên làm việc xác thực qua kính thực tế không gian tại Khu A.</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
