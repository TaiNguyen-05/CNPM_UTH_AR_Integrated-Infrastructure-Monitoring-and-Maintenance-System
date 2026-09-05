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
  Settings,
  UserPlus,
  Edit,
  Trash2,
  CheckCircle2,
  XCircle,
  KeyRound
} from 'lucide-react';
import { UserItem } from '../types';

interface UsersViewProps {
  users: UserItem[];
  onApproveUser: (userId: string) => void;
  onDenyUser: (userId: string) => void;
  onToggleLockUser: (userId: string) => void;
  onInviteUser: () => void;
  onEditUser?: (user: UserItem) => void;
  onDeleteUser?: (userId: string) => void;
  onUpdateUserRole?: (userId: string, newRole: 'Admin' | 'Technician' | 'Viewer') => void;
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
  onEditUser,
  onDeleteUser,
  onUpdateUserRole,
  onManagePolicies,
  searchQuery,
  onSearchChange
}) => {
  const [roleFilter, setRoleFilter] = useState<string>('All Roles');
  const [activeTab, setActiveTab] = useState<'users' | 'rbac-matrix'>('users');

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

  const rbacPermissions = [
    { module: 'Sơ Đồ 3D Digital Twin & Mặt Bằng', admin: true, tech: true, viewer: true, desc: 'Xem bố trí máy chủ và không gian phòng máy' },
    { module: 'Luồng Đo Telemetry Thời Gian Thực', admin: true, tech: true, viewer: true, desc: 'Xem biểu đồ nhiệt độ, CPU, RAM của toàn bộ Node' },
    { module: 'Quản Trị CRUD Thiết Bị Phần Cứng', admin: true, tech: true, viewer: false, desc: 'Thêm, sửa, xóa thông số máy chủ & in mã QR AR' },
    { module: 'Quản Trị CRUD Tủ Rack Server', admin: true, tech: true, viewer: false, desc: 'Cấu hình sức chứa, điện năng và vị trí tủ Rack' },
    { module: 'Tiếp Nhận & Điều Phối Sự Cố (Tickets)', admin: true, tech: true, viewer: false, desc: 'Tạo phiếu sửa chữa, chỉ định nhân sự & hiệu chuẩn AR' },
    { module: 'Quản Lý Người Dùng & Phân Quyền (RBAC)', admin: true, tech: false, viewer: false, desc: 'Thêm tài khoản, đổi vai trò, khóa hoặc xóa user' },
    { module: 'Nhật Ký Kiểm Toán (Audit Logs) & An Ninh', admin: true, tech: false, viewer: false, desc: 'Xem lịch sử thao tác hệ thống và cấu hình MFA/IPMI' }
  ];

  return (
    <div className="p-4 md:p-6 max-w-[1600px] mx-auto flex flex-col gap-6 text-slate-100">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl md:text-2xl lg:text-3xl font-black text-white tracking-tight font-mono">
              Quản Lý Người Dùng & Phân Quyền (RBAC)
            </h1>
            <span className="px-2 py-0.5 rounded-md text-[10px] font-mono font-bold bg-sky-500/10 text-sky-400 border border-sky-500/20">
              Access Control
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-0.5">
            Quản trị danh sách nhân sự, phân quyền vai trò và phê duyệt chính sách truy cập hệ thống.
          </p>
        </div>

        {/* Tab & Action Buttons */}
        <div className="w-full md:w-auto flex flex-wrap items-center gap-3">
          {/* Sub Tab Switcher */}
          <div className="flex bg-[#11161b] p-1 rounded-xl border border-[#222c37]">
            <button
              onClick={() => setActiveTab('users')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                activeTab === 'users'
                  ? 'bg-[#38bdf8] text-[#080b0e] shadow-sm'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <Users className="w-3.5 h-3.5" />
              <span>Người Dùng ({users.length})</span>
            </button>
            <button
              onClick={() => setActiveTab('rbac-matrix')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                activeTab === 'rbac-matrix'
                  ? 'bg-[#38bdf8] text-[#080b0e] shadow-sm'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <KeyRound className="w-3.5 h-3.5" />
              <span>Ma Trận Quyền Hạn</span>
            </button>
          </div>

          {activeTab === 'users' && (
            <div className="flex items-center bg-[#11161b] rounded-xl px-3 py-1.5 border border-[#222c37] hover:border-[#38bdf8] transition-colors">
              <Filter className="w-3.5 h-3.5 text-slate-400 mr-2 shrink-0" />
              <select
                value={roleFilter}
                onChange={(e) => setRoleFilter(e.target.value)}
                className="bg-transparent border-none focus:outline-none text-xs font-semibold text-slate-200 cursor-pointer outline-none"
              >
                <option value="All Roles" className="bg-[#11161b]">Tất cả vai trò</option>
                <option value="Admin" className="bg-[#11161b]">Quản trị viên (Admin)</option>
                <option value="Technician" className="bg-[#11161b]">Kỹ thuật viên (Technician)</option>
                <option value="Viewer" className="bg-[#11161b]">Người xem (Viewer)</option>
              </select>
            </div>
          )}

          <button
            onClick={onInviteUser}
            className="bg-[#38bdf8] hover:bg-[#7dd3fc] text-[#080b0e] px-4 py-2 rounded-xl text-xs font-bold font-mono flex items-center justify-center gap-1.5 transition-all shadow-md cursor-pointer active:scale-95"
          >
            <UserPlus className="w-4 h-4" />
            <span>Thêm / Mời Người Dùng</span>
          </button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {/* Active Personnel */}
        <div className="bg-[#0c1015] border border-[#222c37] rounded-2xl p-4.5 flex flex-col justify-between shadow-lg">
          <div className="flex justify-between items-start mb-2">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider font-mono">Nhân Sự Hoạt Động</span>
            <div className="p-2 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400">
              <Users className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl lg:text-3xl font-black text-white font-mono">{activeCount}</span>
            <span className="text-xs font-semibold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-md font-mono">
              Đã xác thực
            </span>
          </div>
        </div>

        {/* Pending Requests */}
        <div className="bg-[#0c1015] border border-[#222c37] rounded-2xl p-4.5 flex flex-col justify-between shadow-lg">
          <div className="flex justify-between items-start mb-2">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider font-mono">Yêu Cầu Chờ Duyệt</span>
            <div className="p-2 rounded-xl bg-sky-500/10 border border-sky-500/20 text-sky-400">
              <UserCheck className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl lg:text-3xl font-black text-[#38bdf8] font-mono">{pendingCount}</span>
            <span className="text-xs font-semibold text-sky-300 bg-sky-500/15 px-2 py-0.5 rounded-md font-mono">
              Chờ phê duyệt
            </span>
          </div>
        </div>

        {/* Locked Accounts */}
        <div className="bg-[#0c1015] border border-[#222c37] rounded-2xl p-4.5 flex flex-col justify-between shadow-lg">
          <div className="flex justify-between items-start mb-2">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider font-mono">Tài Khoản Đã Khóa</span>
            <div className="p-2 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-400">
              <ShieldAlert className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl lg:text-3xl font-black text-rose-400 font-mono">{lockedCount}</span>
            <span className="text-xs font-semibold text-rose-300 bg-rose-500/15 px-2 py-0.5 rounded-md font-mono">
              Vô hiệu hóa
            </span>
          </div>
        </div>
      </div>

      {activeTab === 'users' ? (
        /* Users Table */
        <div className="bg-[#0c1015] border border-[#222c37] rounded-2xl overflow-hidden flex flex-col shadow-lg">
          <div className="px-5 py-3.5 border-b border-[#222c37] flex justify-between items-center bg-[#11161b]">
            <h2 className="text-xs font-bold text-white flex items-center gap-2 font-mono uppercase tracking-wider">
              <Shield className="w-4 h-4 text-[#38bdf8]" />
              Danh Sách Người Dùng & Phân Quyền
            </h2>
            <span className="text-xs font-mono font-bold bg-sky-500/15 text-sky-300 border border-sky-500/30 px-2.5 py-0.5 rounded-md">
              {filteredUsers.length} Users
            </span>
          </div>

          <div className="overflow-x-auto p-2">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-[#222c37] text-[11px] font-bold text-slate-400 bg-[#11161b]">
                  <th className="p-3">Họ và Tên</th>
                  <th className="p-3">Email Liên Hệ</th>
                  <th className="p-3">Vai Trò (Role)</th>
                  <th className="p-3">Trạng Thái</th>
                  <th className="p-3">Đăng Nhập Gần Nhất</th>
                  <th className="p-3 text-right">Thao Tác Quản Trị</th>
                </tr>
              </thead>
              <tbody className="text-xs divide-y divide-[#1e2733]">
                {filteredUsers.map((user) => {
                  const isPending = user.status === 'Pending';
                  const isLocked = user.status === 'Locked';
                  const isAdmin = user.role === 'Admin';
                  const isTechnician = user.role === 'Technician';

                  return (
                    <tr key={user.id} className="hover:bg-[#161d24] transition-colors">
                      <td className="p-3">
                        <div className="flex items-center gap-2.5">
                          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-sky-600 to-indigo-600 text-white font-bold text-xs flex items-center justify-center shrink-0 font-mono">
                            {user.initials}
                          </div>
                          <div>
                            <span className="font-bold text-white block">{user.name}</span>
                            <span className="text-[10px] font-mono text-slate-400">{user.userId}</span>
                          </div>
                        </div>
                      </td>
                      <td className="p-3 text-slate-300 font-mono text-[11px]">{user.email}</td>
                      <td className="p-3">
                        {onUpdateUserRole ? (
                          <select
                            value={user.role}
                            onChange={(e) => onUpdateUserRole(user.id, e.target.value as any)}
                            className={`px-2 py-1 rounded-md text-[10px] font-bold font-mono border cursor-pointer bg-[#11161b] outline-none ${
                              isAdmin 
                                ? 'text-indigo-300 border-indigo-500/40 hover:border-indigo-400' 
                                : isTechnician 
                                ? 'text-sky-300 border-sky-500/40 hover:border-sky-400' 
                                : 'text-slate-300 border-slate-700 hover:border-slate-500'
                            }`}
                          >
                            <option value="Admin" className="bg-[#11161b]">👑 Admin</option>
                            <option value="Technician" className="bg-[#11161b]">🛠️ Technician</option>
                            <option value="Viewer" className="bg-[#11161b]">👁️ Viewer</option>
                          </select>
                        ) : (
                          <span className={`inline-block px-2 py-0.5 rounded-md text-[10px] font-bold border ${
                            isAdmin 
                              ? 'bg-indigo-500/20 text-indigo-300 border-indigo-500/30' 
                              : isTechnician 
                              ? 'bg-sky-500/20 text-sky-300 border-sky-500/30' 
                              : 'bg-slate-800 text-slate-300 border-slate-700'
                          }`}>
                            {user.role}
                          </span>
                        )}
                      </td>
                      <td className="p-3">
                        {isPending ? (
                          <span className="inline-flex items-center gap-1 text-amber-300 bg-amber-500/10 border border-amber-500/20 px-2 py-0.5 rounded-md text-[10px] font-bold">
                            <Clock className="w-3 h-3" /> Chờ duyệt
                          </span>
                        ) : isLocked ? (
                          <span className="inline-flex items-center gap-1 text-rose-300 bg-rose-500/10 border border-rose-500/20 px-2 py-0.5 rounded-md text-[10px] font-bold">
                            <Lock className="w-3 h-3" /> Đã khóa
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 text-emerald-300 bg-emerald-500/10 border border-emerald-500/20 px-2 py-0.5 rounded-md text-[10px] font-bold">
                            <Check className="w-3 h-3" /> Hoạt động
                          </span>
                        )}
                      </td>
                      <td className="p-3 text-slate-400 text-[11px] font-mono">{user.lastAuth}</td>
                      <td className="p-3 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          {isPending ? (
                            <>
                              <button
                                onClick={() => onApproveUser(user.id)}
                                className="p-1.5 rounded-lg bg-emerald-500/20 text-emerald-300 hover:bg-emerald-500/30 border border-emerald-500/30 transition-colors cursor-pointer"
                                title="Phê duyệt quyền truy cập"
                              >
                                <Check className="w-3.5 h-3.5" />
                              </button>
                              <button
                                onClick={() => onDenyUser(user.id)}
                                className="p-1.5 rounded-lg bg-rose-500/20 text-rose-300 hover:bg-rose-500/30 border border-rose-500/30 transition-colors cursor-pointer"
                                title="Từ chối yêu cầu"
                              >
                                <X className="w-3.5 h-3.5" />
                              </button>
                            </>
                          ) : (
                            <>
                              <button
                                onClick={() => onToggleLockUser(user.id)}
                                className={`p-1.5 rounded-lg border transition-colors cursor-pointer ${
                                  isLocked 
                                    ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30 hover:bg-emerald-500/30' 
                                    : 'bg-[#161d24] text-slate-400 border-[#222c37] hover:text-rose-400 hover:bg-rose-500/10'
                                }`}
                                title={isLocked ? 'Mở khóa tài khoản' : 'Khóa tài khoản'}
                              >
                                {isLocked ? <Unlock className="w-3.5 h-3.5" /> : <Lock className="w-3.5 h-3.5" />}
                              </button>

                              {onEditUser && (
                                <button
                                  onClick={() => onEditUser(user)}
                                  className="p-1.5 rounded-lg bg-[#161d24] text-slate-400 border border-[#222c37] hover:text-amber-400 hover:bg-amber-500/10 transition-colors cursor-pointer"
                                  title="Chỉnh sửa phân quyền"
                                >
                                  <Edit className="w-3.5 h-3.5" />
                                </button>
                              )}

                              {onDeleteUser && !user.isSelf && (
                                <button
                                  onClick={() => {
                                    if (window.confirm(`Xác nhận xóa tài khoản: ${user.name}?`)) {
                                      onDeleteUser(user.id);
                                    }
                                  }}
                                  className="p-1.5 rounded-lg bg-[#161d24] text-slate-400 border border-[#222c37] hover:text-rose-400 hover:bg-rose-500/10 transition-colors cursor-pointer"
                                  title="Xóa người dùng"
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                </button>
                              )}
                            </>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        /* RBAC Permission Matrix */
        <div className="bg-[#0c1015] border border-[#222c37] rounded-2xl overflow-hidden flex flex-col shadow-lg">
          <div className="px-5 py-3.5 border-b border-[#222c37] flex justify-between items-center bg-[#11161b]">
            <h2 className="text-xs font-bold text-white flex items-center gap-2 font-mono uppercase tracking-wider">
              <KeyRound className="w-4 h-4 text-[#38bdf8]" />
              Ma Trận Phân Quyền Vai Trò (Role-Based Access Control)
            </h2>
            <button
              onClick={onManagePolicies}
              className="text-xs text-[#38bdf8] hover:underline font-mono cursor-pointer"
            >
              Chính Sách An Ninh &rarr;
            </button>
          </div>

          <div className="overflow-x-auto p-4">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-[#222c37] text-[11px] font-bold text-slate-400 bg-[#11161b]">
                  <th className="p-3">Tính Năng / Phân Hệ</th>
                  <th className="p-3">Mô Tả Quyền Hạn</th>
                  <th className="p-3 text-center">Admin (Quản Trị)</th>
                  <th className="p-3 text-center">Technician (Kỹ Thuật)</th>
                  <th className="p-3 text-center">Viewer (Người Xem)</th>
                </tr>
              </thead>
              <tbody className="text-xs divide-y divide-[#1e2733]">
                {rbacPermissions.map((perm, idx) => (
                  <tr key={idx} className="hover:bg-[#161d24] transition-colors">
                    <td className="p-3 font-bold text-white font-mono">{perm.module}</td>
                    <td className="p-3 text-slate-400">{perm.desc}</td>
                    <td className="p-3 text-center">
                      {perm.admin ? (
                        <span className="inline-flex items-center gap-1 text-emerald-400 font-bold font-mono text-[11px]">
                          <CheckCircle2 className="w-4 h-4 text-emerald-400" /> Toàn quyền
                        </span>
                      ) : (
                        <XCircle className="w-4 h-4 text-slate-600 inline" />
                      )}
                    </td>
                    <td className="p-3 text-center">
                      {perm.tech ? (
                        <span className="inline-flex items-center gap-1 text-sky-400 font-bold font-mono text-[11px]">
                          <CheckCircle2 className="w-4 h-4 text-sky-400" /> Đọc & Ghi
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-slate-500 font-mono text-[11px]">
                          <XCircle className="w-4 h-4 text-slate-600" /> Không
                        </span>
                      )}
                    </td>
                    <td className="p-3 text-center">
                      {perm.viewer ? (
                        <span className="inline-flex items-center gap-1 text-slate-300 font-mono text-[11px]">
                          <Check className="w-4 h-4 text-slate-400" /> Chỉ đọc
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-slate-500 font-mono text-[11px]">
                          <XCircle className="w-4 h-4 text-slate-600" /> Không
                        </span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};
