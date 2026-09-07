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
  const [role, setRole] = useState<'Admin' | 'Technician'>(userToEdit?.role || 'Technician');
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
    <div className="modal-overlay">
      <div className="modal-box max-w-md">
        <div className="modal-header">
          <div className="modal-title">
            <UserCheck className="w-5 h-5 text-[#38bdf8]" />
            <h3>
              {userToEdit ? `Quản Lý Phân Quyền: ${userToEdit.name}` : 'Thêm Người Dùng Mới'}
            </h3>
          </div>
          <button onClick={onClose} className="modal-close-btn">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4 text-xs">
          <div>
            <label className="form-label">Họ Và Tên</label>
            <input
              type="text"
              required
              placeholder="VD: Nguyễn Văn An"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="form-input"
            />
          </div>

          <div>
            <label className="form-label">Email Tài Khoản</label>
            <input
              type="email"
              required
              placeholder="an.nguyen@ar-imms.corp"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="form-input font-mono"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="form-label">Vai Trò (Role)</label>
              <select
                value={role}
                onChange={(e) => setRole(e.target.value as any)}
                className="form-select"
              >
                <option value="Admin" className="bg-[#11161b]">👑 Quản trị viên (Admin)</option>
                <option value="Technician" className="bg-[#11161b]">🛠️ Kỹ thuật viên (Technician)</option>
              </select>
            </div>
            <div>
              <label className="form-label">Trạng Thái</label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value as any)}
                className="form-select"
              >
                <option value="Active" className="bg-[#11161b]">🟢 Đang hoạt động (Active)</option>
                <option value="Pending" className="bg-[#11161b]">🟡 Chờ duyệt (Pending)</option>
                <option value="Locked" className="bg-[#11161b]">🔴 Đã khóa (Locked)</option>
              </select>
            </div>
          </div>

          {/* Role summary preview */}
          <div className="panel-subtle">
            <div className="text-[11px] font-bold text-slate-300 mb-1 flex items-center gap-1.5 font-mono">
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
            </ul>
          </div>

          <div className="modal-footer">
            <button
              type="button"
              onClick={onClose}
              className="btn-secondary"
            >
              Hủy Bỏ
            </button>
            <button
              type="submit"
              className="btn-primary"
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
