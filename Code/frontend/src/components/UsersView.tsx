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
  KeyRound,
  Mail,
  AlertTriangle,
  LogIn
} from 'lucide-react';
import { arImmsApi } from '../services/api';
import { UserItem } from '../types';

interface UsersViewProps {
  users: UserItem[];
  currentUser?: UserItem | null;
  onRequireLogin?: () => void;
  onApproveUser: (userId: string) => void;
  onDenyUser: (userId: string) => void;
  onToggleLockUser: (userId: string) => void;
  onInviteUser: () => void;
  onEditUser?: (user: UserItem) => void;
  onDeleteUser?: (userId: string) => void;
  onUpdateUserRole?: (userId: string, newRole: 'Admin' | 'Technician') => void;
  onManagePolicies: () => void;
  searchQuery: string;
  onSearchChange: (q: string) => void;
}

export const UsersView: React.FC<UsersViewProps> = ({
  users,
  currentUser,
  onRequireLogin,
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
  const [isSendingEmail, setIsSendingEmail] = useState(false);
  const [emailNotice, setEmailNotice] = useState<string | null>(null);

  const isCurrentAdmin = (currentUser?.role || '').toUpperCase() === 'ADMIN';
  const isLoggedIn = !!currentUser;

  const handleTestSendEmail = async () => {
    if (!isCurrentAdmin) {
      if (onRequireLogin) onRequireLogin();
      return;
    }
    setIsSendingEmail(true);
    setEmailNotice(null);
    try {
      const res = await arImmsApi.testSendAlertEmail();
      setEmailNotice(res.message || 'Đã gửi email cảnh báo sự cố thử nghiệm thành công!');
    } catch (err: any) {
      setEmailNotice('Lỗi khi gửi email: ' + (err.message || 'Kiểm tra cấu hình SMTP'));
    } finally {
      setIsSendingEmail(false);
      setTimeout(() => setEmailNotice(null), 6000);
    }
  };

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
    { module: 'Digital Twin & 3D WebGL', desc: 'Xem mô hình 3D, nhiệt độ, telemetry thời gian thực', admin: true, tech: true },
    { module: 'Điều Khiển Thiết Bị (Fan/Reboot)', desc: 'Gửi lệnh hạ nhiệt, khởi động lại Node qua MQTT', admin: true, tech: true },
    { module: 'Tủ Rack & Quản Lý Thiết Bị', desc: 'Thêm, xóa, chỉnh sửa thông số phần cứng Rack/Node/Sensor', admin: true, tech: false },
    { module: 'Phiếu Bảo Trì (Work Orders)', desc: 'Tạo phiếu, nhận việc AR, cập nhật tiến độ, nghiệm thu', admin: true, tech: true },
    { module: 'QR Code & AR Marker', desc: 'Tạo và in mã QR phục vụ quét định vị AR tại Data Center', admin: true, tech: true },
    { module: 'Quản Lý Người Dùng & Phân Quyền', desc: 'Phê duyệt tài khoản, cấp đổi Role, khóa/mở khóa, xóa', admin: true, tech: false },
    { module: 'Chính Sách & Cảnh Báo Email/SMS', desc: 'Cấu hình ngưỡng nhiệt độ, SMTP cảnh báo khẩn cấp', admin: true, tech: false },
  ];

  return (
    <div className="flex-1 overflow-y-auto p-4 lg:p-6 space-y-5 bg-[#080b0e] text-slate-100">
      {/* Top Banner / Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-[#222c37] pb-5">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-xl lg:text-2xl font-black text-white tracking-tight flex items-center gap-2">
              Quản Lý Người Dùng & Phân Quyền (RBAC)
            </h1>
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold font-mono tracking-wider uppercase bg-sky-500/10 text-sky-400 border border-sky-500/20">
              Access Control
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Quản trị danh sách nhân sự (Admin & Technician), phân vai trò và phê duyệt quyền truy cập hệ thống.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          {/* Tab buttons */}
          <div className="flex items-center bg-[#11161b] p-1 rounded-xl border border-[#222c37]">
            <button
              onClick={() => setActiveTab('users')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                activeTab === 'users'
                  ? 'bg-[#38bdf8] text-slate-950 shadow-md'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <Users className="w-3.5 h-3.5" />
              Người Dùng ({users.length})
            </button>
            <button
              onClick={() => setActiveTab('rbac-matrix')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                activeTab === 'rbac-matrix'
                  ? 'bg-[#38bdf8] text-slate-950 shadow-md'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <KeyRound className="w-3.5 h-3.5" />
              Ma Trận Quyền Hạn
            </button>
          </div>

          {/* Role Filter */}
          <div className="relative">
            <select
              value={roleFilter}
              onChange={(e) => setRoleFilter(e.target.value)}
              className="bg-[#11161b] border border-[#222c37] text-slate-300 text-xs rounded-xl px-3 py-2 pr-8 appearance-none focus:outline-none focus:border-[#38bdf8]"
            >
              <option value="All Roles">Tất cả vai trò</option>
              <option value="Admin">👑 Admin</option>
              <option value="Technician">🛠️ Technician</option>
            </select>
            <Filter className="w-3.5 h-3.5 text-slate-500 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
          </div>

          {/* Email Test Button */}
          <button
            onClick={handleTestSendEmail}
            disabled={isSendingEmail}
            className="flex items-center gap-1.5 bg-[#11161b] hover:bg-[#1a222a] text-slate-300 hover:text-white text-xs font-bold px-3 py-2 rounded-xl border border-[#222c37] transition-all disabled:opacity-50"
            title="Gửi email cảnh báo thử nghiệm tới quản trị viên"
          >
            <Mail className="w-3.5 h-3.5 text-amber-400" />
            {isSendingEmail ? 'Đang gửi...' : 'Gửi Email Test Cảnh Báo'}
          </button>

          {/* Add user button */}
          <button
            onClick={() => {
              if (!isCurrentAdmin && onRequireLogin) {
                onRequireLogin();
                return;
              }
              onInviteUser();
            }}
            className="flex items-center gap-1.5 bg-[#38bdf8] hover:bg-[#0284c7] text-slate-950 text-xs font-bold px-3 py-2 rounded-xl transition-all shadow-md"
          >
            <UserPlus className="w-3.5 h-3.5" />
            Thêm / Mời Người Dùng
          </button>
        </div>
      </div>

      {/* RBAC Status Banner */}
      {!isLoggedIn ? (
        <div className="bg-amber-500/10 border border-amber-500/30 rounded-2xl p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-amber-500/20 text-amber-400">
              <AlertTriangle className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-xs font-bold text-amber-300 font-mono uppercase tracking-wider">
                Yêu Cầu Đăng Nhập
              </h4>
              <p className="text-xs text-slate-300 mt-0.5">
                Vui lòng đăng nhập với tài khoản <strong className="text-amber-200">Admin</strong> hoặc <strong className="text-amber-200">Technician</strong> để truy cập và vận hành hệ thống.
              </p>
            </div>
          </div>
          {onRequireLogin && (
            <button
              onClick={onRequireLogin}
              className="px-3.5 py-1.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-bold flex items-center gap-1.5 shrink-0 transition-all font-mono"
            >
              <LogIn className="w-3.5 h-3.5" /> Đăng Nhập Hệ Thống
            </button>
          )}
        </div>
      ) : !isCurrentAdmin ? (
        <div className="bg-sky-500/10 border border-sky-500/30 rounded-2xl p-4 flex items-center gap-3">
          <div className="p-2 rounded-xl bg-sky-500/20 text-sky-400">
            <Shield className="w-5 h-5" />
          </div>
          <div>
            <h4 className="text-xs font-bold text-sky-300 font-mono uppercase tracking-wider">
              Đang Đăng Nhập: {currentUser?.name} (🛠️ Technician)
            </h4>
            <p className="text-xs text-slate-300 mt-0.5">
              Bạn có quyền thực thi công việc kỹ thuật, quét AR và xử lý phiếu bảo trì. Chức năng quản trị người dùng yêu cầu quyền <strong className="text-sky-200">Admin</strong>.
            </p>
          </div>
        </div>
      ) : (
        <div className="bg-emerald-500/10 border border-emerald-500/30 rounded-2xl p-3.5 flex items-center gap-3">
          <div className="p-2 rounded-xl bg-emerald-500/20 text-emerald-400">
            <CheckCircle2 className="w-5 h-5" />
          </div>
          <div>
            <h4 className="text-xs font-bold text-emerald-300 font-mono uppercase tracking-wider">
              Quyền Quản Trị Viên (Admin) Đã Kích Hoạt
            </h4>
            <p className="text-xs text-slate-300 mt-0.5">
              Bạn có toàn quyền thay đổi Vai trò (Role), Phê duyệt yêu cầu mới, Khóa/Mở khóa và Xóa tài khoản người dùng trên toàn hệ thống.
            </p>
          </div>
        </div>
      )}

      {/* Email Notice message */}
      {emailNotice && (
        <div className="p-3 bg-[#11161b] border border-[#38bdf8]/40 rounded-xl text-xs text-[#38bdf8] flex items-center gap-2">
          <Mail className="w-4 h-4 text-[#38bdf8] shrink-0" />
          <span>{emailNotice}</span>
        </div>
      )}

      {/* KPI Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <div className="bg-[#0c1015] border border-[#222c37] p-4 rounded-2xl flex flex-col justify-between relative overflow-hidden shadow-md">
          <div className="flex justify-between items-center mb-2">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider font-mono">Nhân Sự Hoạt Động</span>
            <div className="p-2 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
              <UserCheck className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl lg:text-3xl font-black text-white font-mono">{activeCount}</span>
            <span className="text-xs font-semibold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-md font-mono">
              Đã xác thực
            </span>
          </div>
        </div>

        <div className="bg-[#0c1015] border border-[#222c37] p-4 rounded-2xl flex flex-col justify-between relative overflow-hidden shadow-md">
          <div className="flex justify-between items-center mb-2">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider font-mono">Yêu Cầu Chờ Duyệt</span>
            <div className="p-2 rounded-xl bg-sky-500/10 text-sky-400 border border-sky-500/20">
              <Clock className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl lg:text-3xl font-black text-white font-mono">{pendingCount}</span>
            <span className="text-xs font-semibold text-sky-400 bg-sky-500/10 px-2 py-0.5 rounded-md font-mono">
              Chờ phê duyệt
            </span>
          </div>
        </div>

        <div className="bg-[#0c1015] border border-[#222c37] p-4 rounded-2xl flex flex-col justify-between relative overflow-hidden shadow-md">
          <div className="flex justify-between items-center mb-2">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider font-mono">Tài Khoản Đã Khóa</span>
            <div className="p-2 rounded-xl bg-rose-500/10 text-rose-400 border border-rose-500/20">
              <ShieldAlert className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl lg:text-3xl font-black text-white font-mono">{lockedCount}</span>
            <span className="text-xs font-semibold text-rose-400 bg-rose-500/10 px-2 py-0.5 rounded-md font-mono">
              Vô hiệu hóa
            </span>
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      {activeTab === 'users' ? (
        <div className="bg-[#0c1015] border border-[#222c37] rounded-2xl overflow-hidden flex flex-col shadow-lg">
          <div className="px-5 py-3.5 border-b border-[#222c37] flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 bg-[#11161b]">
            <h2 className="text-xs font-bold text-white flex items-center gap-2 font-mono uppercase tracking-wider">
              <Shield className="w-4 h-4 text-[#38bdf8]" />
              Danh Sách Người Dùng & Phân Quyền
            </h2>
            <div className="flex items-center gap-2">
              <div className="relative">
                <input
                  type="text"
                  placeholder="Tìm kiếm người dùng..."
                  value={searchQuery}
                  onChange={(e) => onSearchChange(e.target.value)}
                  className="bg-[#161d24] border border-[#222c37] text-xs text-slate-200 rounded-lg pl-8 pr-3 py-1.5 focus:outline-none focus:border-[#38bdf8] w-48 sm:w-60 font-mono"
                />
                <Search className="w-3.5 h-3.5 text-slate-500 absolute left-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
              </div>
              <span className="text-xs text-slate-400 font-mono bg-[#161d24] px-2.5 py-1 rounded-lg border border-[#222c37]">
                {filteredUsers.length} Users
              </span>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-[#222c37] bg-[#0c1015] text-[11px] text-slate-400 font-mono uppercase">
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
                        {isCurrentAdmin && onUpdateUserRole ? (
                          <select
                            value={user.role}
                            onChange={(e) => onUpdateUserRole(user.id, e.target.value as any)}
                            className={`px-2 py-1 rounded-md text-[10px] font-bold font-mono border cursor-pointer bg-[#11161b] outline-none transition-all ${
                              isAdmin 
                                ? 'text-indigo-300 border-indigo-500/40 hover:border-indigo-400' 
                                : 'text-sky-300 border-sky-500/40 hover:border-sky-400'
                            }`}
                          >
                            <option value="Admin" className="bg-[#11161b] text-indigo-300">👑 Admin</option>
                            <option value="Technician" className="bg-[#11161b] text-sky-300">🛠️ Technician</option>
                          </select>
                        ) : (
                          <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-[10px] font-bold border font-mono ${
                            isAdmin 
                              ? 'bg-indigo-500/20 text-indigo-300 border-indigo-500/30' 
                              : 'bg-sky-500/20 text-sky-300 border-sky-500/30'
                          }`}>
                            {isAdmin ? '👑 Admin' : '🛠️ Technician'}
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
                          {isCurrentAdmin ? (
                            <>
                              {isPending ? (
                                <>
                                  <button
                                    onClick={() => onApproveUser(user.id)}
                                    className="p-1.5 rounded-lg bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-400 border border-emerald-500/30 transition-all"
                                    title="Phê duyệt tài khoản này"
                                  >
                                    <Check className="w-3.5 h-3.5" />
                                  </button>
                                  <button
                                    onClick={() => onDenyUser(user.id)}
                                    className="p-1.5 rounded-lg bg-rose-500/20 hover:bg-rose-500/30 text-rose-400 border border-rose-500/30 transition-all"
                                    title="Từ chối yêu cầu"
                                  >
                                    <X className="w-3.5 h-3.5" />
                                  </button>
                                </>
                              ) : (
                                <>
                                  <button
                                    onClick={() => onToggleLockUser(user.id)}
                                    className={`p-1.5 rounded-lg border transition-all ${
                                      isLocked
                                        ? 'bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-400 border-emerald-500/30'
                                        : 'bg-amber-500/20 hover:bg-amber-500/30 text-amber-400 border-amber-500/30'
                                    }`}
                                    title={isLocked ? 'Mở khóa tài khoản' : 'Khóa tài khoản này'}
                                  >
                                    {isLocked ? <Unlock className="w-3.5 h-3.5" /> : <Lock className="w-3.5 h-3.5" />}
                                  </button>
                                  {onEditUser && (
                                    <button
                                      onClick={() => onEditUser(user)}
                                      className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 transition-all"
                                      title="Chỉnh sửa thông tin"
                                    >
                                      <Edit className="w-3.5 h-3.5" />
                                    </button>
                                  )}
                                  {onDeleteUser && (
                                    <button
                                      onClick={() => {
                                        if (window.confirm(`Bạn có chắc muốn xóa tài khoản ${user.name} (${user.email})?`)) {
                                          onDeleteUser(user.id);
                                        }
                                      }}
                                      className="p-1.5 rounded-lg bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border border-rose-500/20 transition-all"
                                      title="Xóa người dùng"
                                    >
                                      <Trash2 className="w-3.5 h-3.5" />
                                    </button>
                                  )}
                                </>
                              )}
                            </>
                          ) : (
                            <button
                              onClick={() => {
                                if (onRequireLogin) onRequireLogin();
                              }}
                              className="px-2 py-1 rounded-md bg-slate-900 border border-slate-800 text-slate-500 text-[10px] font-mono hover:text-slate-300 hover:border-slate-700 transition-all flex items-center gap-1"
                              title="Yêu cầu quyền Admin để thao tác"
                            >
                              <Lock className="w-2.5 h-2.5 text-slate-600" /> Chỉ Admin
                            </button>
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
