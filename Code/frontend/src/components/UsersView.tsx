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
  UserPlus
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
    <div className="p-4 md:p-6 max-w-[1600px] mx-auto flex flex-col gap-6 text-slate-100">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl md:text-2xl lg:text-3xl font-black text-white tracking-tight">Phân Quyền & Quản Trị RBAC</h1>
            <span className="px-2 py-0.5 rounded-md text-[10px] font-mono font-bold bg-sky-500/10 text-sky-400 border border-sky-500/20">
              Access Control
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-0.5">Quản lý định danh nhân sự, phê duyệt tài khoản và chính sách bảo mật vai trò.</p>
        </div>

        {/* Search, Filter, Action */}
        <div className="w-full md:w-auto flex flex-col sm:flex-row gap-3">
          <div className="flex items-center bg-slate-900/90 rounded-xl px-3 py-2 border border-slate-700/80 hover:border-sky-500 transition-colors shadow-inner">
            <Filter className="w-4 h-4 text-slate-400 mr-2 shrink-0" />
            <select
              value={roleFilter}
              onChange={(e) => setRoleFilter(e.target.value)}
              className="bg-transparent border-none focus:outline-none text-xs font-semibold text-slate-200 cursor-pointer outline-none"
            >
              <option value="All Roles">Tất cả vai trò</option>
              <option value="Admin">Quản trị viên (Admin)</option>
              <option value="Technician">Kỹ thuật viên (Technician)</option>
              <option value="Viewer">Người xem (Viewer)</option>
            </select>
          </div>

          <button
            onClick={onInviteUser}
            className="bg-gradient-to-r from-sky-500 to-blue-600 hover:from-sky-400 hover:to-blue-500 text-white px-4 py-2 rounded-xl text-xs font-bold flex items-center justify-center gap-2 transition-all shadow-md shadow-sky-500/20 cursor-pointer active:scale-95"
          >
            <UserPlus className="w-4 h-4" />
            <span>Mời Thành Viên</span>
          </button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {/* Active Personnel */}
        <div className="glass-card rounded-2xl p-4.5 flex flex-col justify-between">
          <div className="flex justify-between items-start mb-2">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Nhân Sự Đang Hoạt Động</span>
            <div className="p-2 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400">
              <Users className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl lg:text-3xl font-black text-white">{activeCount}</span>
            <span className="text-xs font-semibold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-md">
              Đã xác thực
            </span>
          </div>
        </div>

        {/* Pending Requests */}
        <div className="glass-card rounded-2xl p-4.5 flex flex-col justify-between">
          <div className="flex justify-between items-start mb-2">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Yêu Cầu Chờ Duyệt</span>
            <div className="p-2 rounded-xl bg-sky-500/10 border border-sky-500/20 text-sky-400">
              <UserCheck className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl lg:text-3xl font-black text-sky-400">{pendingCount}</span>
            <span className="text-xs font-semibold text-sky-300 bg-sky-500/15 px-2 py-0.5 rounded-md">
              Chờ phê duyệt
            </span>
          </div>
        </div>

        {/* Locked / Revoked Accounts */}
        <div className="glass-card rounded-2xl p-4.5 flex flex-col justify-between">
          <div className="flex justify-between items-start mb-2">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Tài Khoản Đã Khóa</span>
            <div className="p-2 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-400">
              <ShieldAlert className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl lg:text-3xl font-black text-rose-400">{lockedCount}</span>
            <span className="text-xs font-semibold text-rose-300 bg-rose-500/15 px-2 py-0.5 rounded-md">
              Vô hiệu hóa
            </span>
          </div>
        </div>
      </div>

      {/* Users Table */}
      <div className="glass-card rounded-2xl overflow-hidden flex flex-col">
        <div className="px-5 py-3.5 border-b border-slate-800/80 flex justify-between items-center bg-slate-900/60">
          <h2 className="text-sm font-bold text-white flex items-center gap-2">
            <Shield className="w-4 h-4 text-sky-400" />
            Danh Sách Người Dùng & Vai Trò
          </h2>
          <span className="text-xs font-mono font-bold bg-sky-500/15 text-sky-300 border border-sky-500/30 px-2.5 py-0.5 rounded-md">
            {filteredUsers.length} Users
          </span>
        </div>

        <div className="overflow-x-auto p-2">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-800 text-[11px] font-bold text-slate-400">
                <th className="p-3">Họ và Tên</th>
                <th className="p-3">Email Liên Hệ</th>
                <th className="p-3">Vai Trò (Role)</th>
                <th className="p-3">Trạng Thái</th>
                <th className="p-3">Đăng Nhập Gần Nhất</th>
                <th className="p-3 text-right">Thao Tác</th>
              </tr>
            </thead>
            <tbody className="text-xs divide-y divide-slate-800/60">
              {filteredUsers.map((user) => {
                const isPending = user.status === 'Pending';
                const isLocked = user.status === 'Locked';
                const isAdmin = user.role === 'Admin';
                const isTechnician = user.role === 'Technician';

                return (
                  <tr key={user.id} className="hover:bg-slate-800/40 transition-colors">
                    <td className="p-3">
                      <div className="flex items-center gap-2.5">
                        <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-sky-600 to-indigo-600 text-white font-bold text-xs flex items-center justify-center shrink-0">
                          {user.initials}
                        </div>
                        <span className="font-bold text-slate-100">{user.name}</span>
                      </div>
                    </td>
                    <td className="p-3 text-slate-400 font-mono text-[11px]">{user.email}</td>
                    <td className="p-3">
                      <span className={`inline-block px-2 py-0.5 rounded-md text-[10px] font-bold border ${
                        isAdmin 
                          ? 'bg-indigo-500/20 text-indigo-300 border-indigo-500/30' 
                          : isTechnician 
                          ? 'bg-sky-500/20 text-sky-300 border-sky-500/30' 
                          : 'bg-slate-800 text-slate-300 border-slate-700'
                      }`}>
                        {user.role}
                      </span>
                    </td>
                    <td className="p-3">
                      {isPending ? (
                        <span className="inline-flex items-center gap-1 text-amber-300 bg-amber-500/20 border border-amber-500/30 px-2 py-0.5 rounded-md text-[10px] font-bold">
                          <Clock className="w-3 h-3" /> Chờ duyệt
                        </span>
                      ) : isLocked ? (
                        <span className="inline-flex items-center gap-1 text-rose-300 bg-rose-500/20 border border-rose-500/30 px-2 py-0.5 rounded-md text-[10px] font-bold">
                          <Lock className="w-3 h-3" /> Đã khóa
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-emerald-300 bg-emerald-500/20 border border-emerald-500/30 px-2 py-0.5 rounded-md text-[10px] font-bold">
                          <Check className="w-3 h-3" /> Hoạt động
                        </span>
                      )}
                    </td>
                    <td className="p-3 text-slate-400 text-[11px]">{user.lastAuth}</td>
                    <td className="p-3 text-right">
                      {isPending ? (
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            onClick={() => onApproveUser(user.id)}
                            className="p-1.5 rounded-lg bg-emerald-500/20 text-emerald-300 hover:bg-emerald-500/30 border border-emerald-500/30 transition-colors"
                            title="Phê duyệt quyền truy cập"
                          >
                            <Check className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => onDenyUser(user.id)}
                            className="p-1.5 rounded-lg bg-rose-500/20 text-rose-300 hover:bg-rose-500/30 border border-rose-500/30 transition-colors"
                            title="Từ chối yêu cầu"
                          >
                            <X className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      ) : (
                        <button
                          onClick={() => onToggleLockUser(user.id)}
                          className={`p-1.5 rounded-lg border transition-colors ${
                            isLocked 
                              ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30 hover:bg-emerald-500/30' 
                              : 'bg-slate-800 text-slate-400 border-slate-700 hover:text-rose-400 hover:bg-rose-500/10'
                          }`}
                          title={isLocked ? 'Mở khóa tài khoản' : 'Khóa tài khoản'}
                        >
                          {isLocked ? <Unlock className="w-3.5 h-3.5" /> : <Lock className="w-3.5 h-3.5" />}
                        </button>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
