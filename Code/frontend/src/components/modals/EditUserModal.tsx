import React, { useState } from 'react';
import { X, UserCheck, Shield, Mail, Check, UserPlus } from 'lucide-react';
import { UserItem } from '../../types';

interface EditUserModalProps {
  userToEdit?: UserItem | null;
  onClose: () => void;
  onSave: (user: UserItem) => void;
}

export const EditUserModal: React.FC<EditUserModalProps> = ({ userToEdit, onClose, onSave }) => {
  const [name, setName] = useState(userToEdit?.name || '');
  const [email, setEmail] = useState(userToEdit?.email || '');
  const [role, setRole] = useState<'Admin' | 'Technician' | 'Viewer'>(userToEdit?.role || 'Technician');
  const [status, setStatus] = useState<'Active' | 'Pending' | 'Locked'>(userToEdit?.status || 'Active');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !email) return;

    const initials = name
      .split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase()
      .substring(0, 2);

    const savedUser: UserItem = {
      id: userToEdit ? userToEdit.id : `usr-${Date.now()}`,
      userId: userToEdit ? userToEdit.userId : `USR-${Math.floor(1000 + Math.random() * 9000)}`,
      name,
      email,
      role,
      status,
      lastAuth: userToEdit ? userToEdit.lastAuth : 'Chưa đăng nhập',
      initials: initials || 'US',
      avatarUrl: userToEdit?.avatarUrl,
      isSelf: userToEdit?.isSelf
    };

    onSave(savedUser);
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-[#080b0e] rounded-xl border border-[#222c37] shadow-2xl w-full max-w-md overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        <div className="px-6 py-4 bg-[#11161b] border-b border-[#222c37] flex justify-between items-center">
          <div className="flex items-center gap-2">
            <UserCheck className="w-5 h-5 text-[#38bdf8]" />
            <h3 className="font-bold text-base text-white tracking-wide">
              {userToEdit ? `Quản Lý Phân Quyền: ${userToEdit.name}` : 'Thêm Người Dùng Mới'}
            </h3>
          </div>
          <button 
            onClick={onClose}
            className="p-1 rounded-md text-slate-400 hover:text-white hover:bg-[#161d24] cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4 text-xs">
          <div>
            <label className="block font-bold text-slate-400 uppercase tracking-wider mb-1">Họ Và Tên</label>
            <input
              type="text"
              required
              placeholder="VD: Nguyễn Văn An"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-3 py-2 bg-[#161d24] border border-[#222c37] text-white rounded-lg text-sm focus:outline-none focus:border-[#38bdf8]"
            />
          </div>

          <div>
            <label className="block font-bold text-slate-400 uppercase tracking-wider mb-1">Email Tài Khoản</label>
            <input
              type="email"
              required
              placeholder="an.nguyen@ar-imms.corp"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-3 py-2 bg-[#161d24] border border-[#222c37] text-white rounded-lg text-sm focus:outline-none focus:border-[#38bdf8] font-mono"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block font-bold text-slate-400 uppercase tracking-wider mb-1">Vai Trò (Role)</label>
              <select
                value={role}
                onChange={(e) => setRole(e.target.value as any)}
                className="w-full px-3 py-2 bg-[#161d24] border border-[#222c37] text-white rounded-lg text-sm cursor-pointer focus:border-[#38bdf8]"
              >
                <option value="Admin" className="bg-[#11161b]">👑 Quản trị viên (Admin)</option>
                <option value="Technician" className="bg-[#11161b]">🛠️ Kỹ thuật viên (Technician)</option>
                <option value="Viewer" className="bg-[#11161b]">👁️ Người xem (Viewer)</option>
              </select>
            </div>
            <div>
              <label className="block font-bold text-slate-400 uppercase tracking-wider mb-1">Trạng Thái</label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value as any)}
                className="w-full px-3 py-2 bg-[#161d24] border border-[#222c37] text-white rounded-lg text-sm cursor-pointer focus:border-[#38bdf8]"
              >
                <option value="Active" className="bg-[#11161b]">🟢 Đang hoạt động (Active)</option>
                <option value="Pending" className="bg-[#11161b]">🟡 Chờ duyệt (Pending)</option>
                <option value="Locked" className="bg-[#11161b]">🔴 Đã khóa (Locked)</option>
              </select>
            </div>
          </div>

          {/* Role summary preview */}
          <div className="p-3 bg-[#11161b] border border-[#222c37] rounded-lg">
            <div className="text-[11px] font-bold text-slate-300 mb-1 flex items-center gap-1.5">
              <Shield className="w-3.5 h-3.5 text-[#38bdf8]" />
              Quyền hạn áp dụng cho vai trò:
            </div>
            <ul className="text-[11px] text-slate-400 space-y-0.5 list-disc list-inside">
              {role === 'Admin' && (
                <>
                  <li className="text-emerald-400">Toàn quyền CRUD Thiết bị & Tủ Rack</li>
                  <li className="text-emerald-400">Quản lý và phân quyền người dùng (RBAC)</li>
                  <li className="text-emerald-400">Cấu hình an ninh, chính sách & xem nhật ký Audit</li>
                </>
              )}
              {role === 'Technician' && (
                <>
                  <li className="text-sky-400">Đọc/Ghi dữ liệu thiết bị, in mã AR QR</li>
                  <li className="text-sky-400">Xử lý phiếu sự cố kỹ thuật & điểm neo AR</li>
                  <li className="text-slate-500">Chỉ xem danh sách người dùng (Không xóa/phân quyền)</li>
                </>
              )}
              {role === 'Viewer' && (
                <>
                  <li className="text-slate-400">Xem luồng Telemetry thời gian thực</li>
                  <li className="text-slate-400">Xem sơ đồ 3D Digital Twin & danh mục thiết bị</li>
                  <li className="text-rose-400">Không có quyền thêm/sửa/xóa dữ liệu hệ thống</li>
                </>
              )}
            </ul>
          </div>

          <div className="pt-4 border-t border-[#222c37] flex justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border border-[#222c37] text-slate-400 font-bold text-xs rounded-lg hover:bg-[#161d24] hover:text-white cursor-pointer"
            >
              Hủy Bỏ
            </button>
            <button
              type="submit"
              className="px-5 py-2 bg-[#38bdf8] text-[#080b0e] font-bold text-xs rounded-lg hover:bg-[#7dd3fc] flex items-center gap-1.5 shadow-xs cursor-pointer active:scale-95 transition-colors"
            >
              {userToEdit ? <Check className="w-4 h-4" /> : <UserPlus className="w-4 h-4" />}
              {userToEdit ? 'Lưu Phân Quyền' : 'Tạo Tài Khoản'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
