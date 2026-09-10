import React, { useState, useMemo } from 'react';
import { 
  Users, 
  UserCheck, 
  ShieldAlert, 
  Filter, 
  Lock, 
  Unlock, 
  Check, 
  X, 
  Shield, 
  Clock,
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
import { UI_STYLES, cn } from '../styles/theme';
import { UiKpiCard, UiSearchInput } from './common';

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

  const pendingCount = useMemo(() => users.filter(u => u.status === 'Pending').length, [users]);
  const lockedCount = useMemo(() => users.filter(u => u.status === 'Locked').length, [users]);
  const activeCount = useMemo(() => users.filter(u => u.status === 'Active').length, [users]);

  const filteredUsers = useMemo(() => {
    return users.filter(user => {
      const matchesRole = roleFilter === 'All Roles' || user.role === roleFilter;
      const matchesSearch = !searchQuery || 
        user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        user.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
        user.userId.toLowerCase().includes(searchQuery.toLowerCase());
      return matchesRole && matchesSearch;
    });
  }, [users, roleFilter, searchQuery]);

  const rbacPermissions = [
    { module: 'Digital Twin & 3D WebGL', desc: 'Xem mô hình 3D, nhiệt độ, telemetry thời gian thực', admin: true, tech: true },
    { module: 'Điều Khiển Thiết Bị (Fan/Reboot)', desc: 'Gửi lệnh hạ nhiệt, khởi động lại Node qua MQTT', admin: true, tech: true },
    { module: 'Tủ Rack & Quản Lý Thiết Bị', desc: 'Thêm, xóa, chỉnh sửa thông số phần cứng Rack/Node/Sensor', admin: true, tech: false },
    { module: 'Phiếu Bảo Trì (Work Orders)', desc: 'Tạo phiếu, nhận việc AR, cập nhật tiến độ, nghiệm thu', admin: true, tech: true },
    { module: 'QR Code & AR Marker', desc: 'Tạo và in mã QR phục vụ quét định vị AR tại Data Center', admin: true, tech: true },
    { module: 'Quản Lý Người Dùng & Phân Quyền', desc: 'Phê duyệt tài khoản, cấp đổi Role, khóa/mở khóa, xóa', admin: true, tech: false },
    { module: 'Chính Sách & Cảnh Báo Email/SMS', desc: 'Cấu hình ngưỡng nhiệt độ, SMTP cảnh báo khẩn cấp', admin: true, tech: false },
  ];

  if (!isCurrentAdmin) {
    return (
      <div className="flex flex-col items-center justify-center p-12 text-center bg-[#0c1015] border border-red-500/30 rounded-2xl my-6">
        <div className="w-16 h-16 rounded-2xl bg-red-500/10 border border-red-500/30 flex items-center justify-center text-red-400 mb-4 shadow-lg shadow-red-500/10">
          <Shield className="w-8 h-8" />
        </div>
        <h3 className="text-xl font-bold text-white font-mono uppercase tracking-wider mb-2">
          Truy Cập Bị Giới Hạn (403 Forbidden)
        </h3>
        <p className="text-sm text-slate-400 max-w-md mb-6 leading-relaxed">
          Khu vực Quản Trị Người Dùng & Phân Quyền (RBAC) chỉ dành riêng cho tài khoản <span className="text-amber-300 font-bold">Admin</span>. Bạn đang đăng nhập với vai trò <span className="text-sky-300 font-bold">{currentUser?.name ? `${currentUser.name} (${currentUser.role})` : 'Chưa đăng nhập'}</span>.
        </p>
      </div>
    );
  }

  return (
    <div className={UI_STYLES.surfaces.pageContainer}>
      {/* Top Banner / Header */}
      <div className={UI_STYLES.headers.viewHeader}>
        <div>
          <div className="flex items-center gap-3">
            <h1 className={UI_STYLES.headers.title}>
              Quản Lý Người Dùng & Phân Quyền (RBAC)
            </h1>
            <span className={UI_STYLES.badges.pill}>
              Access Control
            </span>
          </div>
          <p className={UI_STYLES.headers.subtitle}>
            Quản trị danh sách nhân sự (Admin & Technician), phân vai trò và phê duyệt quyền truy cập hệ thống.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          {/* Tab buttons */}
          <div className={UI_STYLES.buttons.tabWrapper}>
            <button
              onClick={() => setActiveTab('users')}
              className={activeTab === 'users' ? UI_STYLES.buttons.tabActive : UI_STYLES.buttons.tabInactive}
            >
              <Users className="w-3.5 h-3.5" />
              Người Dùng ({users.length})
            </button>
            <button
              onClick={() => setActiveTab('rbac-matrix')}
              className={activeTab === 'rbac-matrix' ? UI_STYLES.buttons.tabActive : UI_STYLES.buttons.tabInactive}
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
              className={UI_STYLES.forms.select}
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
            className={UI_STYLES.buttons.secondary}
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
            className={UI_STYLES.buttons.primary}
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
              className="px-3.5 py-1.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-bold flex items-center gap-1.5 shrink-0 transition-all font-mono cursor-pointer"
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
        <UiKpiCard
          label="Nhân Sự Hoạt Động"
          value={activeCount}
          tagText="Đã xác thực"
          variant="success"
          icon={<UserCheck className="w-4 h-4" />}
        />
        <UiKpiCard
          label="Yêu Cầu Chờ Duyệt"
          value={pendingCount}
          tagText="Chờ phê duyệt"
          variant="info"
          icon={<Clock className="w-4 h-4" />}
        />
        <UiKpiCard
          label="Tài Khoản Đã Khóa"
          value={lockedCount}
          tagText="Vô hiệu hóa"
          variant="danger"
          icon={<ShieldAlert className="w-4 h-4" />}
        />
      </div>

      {/* Main Content Area */}
      {activeTab === 'users' ? (
        <div className={UI_STYLES.surfaces.cardSurface}>
          <div className={UI_STYLES.headers.cardHeader}>
            <h2 className={UI_STYLES.headers.sectionTitle}>
              <Shield className="w-4 h-4 text-[#38bdf8]" />
              Danh Sách Người Dùng & Phân Quyền
            </h2>
            <div className="flex items-center gap-2">
              <UiSearchInput
                placeholder="Tìm kiếm người dùng..."
                value={searchQuery}
                onChange={onSearchChange}
                inputClassName="w-48 sm:w-60"
              />
              <span className="text-xs text-slate-400 font-mono bg-[#161d24] px-2.5 py-1 rounded-lg border border-[#222c37]">
                {filteredUsers.length} Users
              </span>
            </div>
          </div>

          <div className={UI_STYLES.tables.wrapper}>
            <table className={UI_STYLES.tables.table}>
              <thead>
                <tr className={UI_STYLES.tables.headTr}>
                  <th className={UI_STYLES.tables.cell}>Họ và Tên</th>
                  <th className={UI_STYLES.tables.cell}>Email Liên Hệ</th>
                  <th className={UI_STYLES.tables.cell}>Vai Trò (Role)</th>
                  <th className={UI_STYLES.tables.cell}>Trạng Thái</th>
                  <th className={UI_STYLES.tables.cell}>Đăng Nhập Gần Nhất</th>
                  <th className={cn(UI_STYLES.tables.cell, "text-right")}>Thao Tác Quản Trị</th>
                </tr>
              </thead>
              <tbody className={UI_STYLES.tables.body}>
                {filteredUsers.map((user) => {
                  const isPending = user.status === 'Pending';
                  const isLocked = user.status === 'Locked';
                  const isAdmin = user.role === 'Admin';
                  const isTechnician = user.role === 'Technician';

                  return (
                    <tr key={user.id} className={UI_STYLES.tables.row}>
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
        <div className={UI_STYLES.surfaces.cardSurface}>
          <div className={UI_STYLES.headers.cardHeader}>
            <h2 className={UI_STYLES.headers.sectionTitle}>
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
            <table className={UI_STYLES.tables.table}>
              <thead>
                <tr className="border-b border-[#222c37] text-[11px] font-bold text-slate-400 bg-[#11161b]">
                  <th className={UI_STYLES.tables.cell}>Tính Năng / Phân Hệ</th>
                  <th className={UI_STYLES.tables.cell}>Mô Tả Quyền Hạn</th>
                  <th className={cn(UI_STYLES.tables.cell, "text-center")}>Admin (Quản Trị)</th>
                  <th className={cn(UI_STYLES.tables.cell, "text-center")}>Technician (Kỹ Thuật)</th>
                </tr>
              </thead>
              <tbody className={UI_STYLES.tables.body}>
                {rbacPermissions.map((perm, idx) => (
                  <tr key={idx} className={UI_STYLES.tables.row}>
                    <td className={cn(UI_STYLES.tables.cell, "font-bold text-white font-mono")}>{perm.module}</td>
                    <td className={cn(UI_STYLES.tables.cell, "text-slate-400")}>{perm.desc}</td>
                    <td className={cn(UI_STYLES.tables.cell, "text-center")}>
                      {perm.admin ? (
                        <span className="inline-flex items-center gap-1 text-emerald-400 font-bold font-mono text-[11px]">
                          <CheckCircle2 className="w-4 h-4 text-emerald-400" /> Toàn quyền
                        </span>
                      ) : (
                        <XCircle className="w-4 h-4 text-slate-600 inline" />
                      )}
                    </td>
                    <td className={cn(UI_STYLES.tables.cell, "text-center")}>
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
