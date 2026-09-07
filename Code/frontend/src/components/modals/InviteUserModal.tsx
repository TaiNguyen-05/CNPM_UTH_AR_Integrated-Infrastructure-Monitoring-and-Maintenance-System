import React, { useState } from 'react';
import { X, UserPlus, Shield, Mail } from 'lucide-react';
import { UserItem } from '../../types';

interface InviteUserModalProps {
  onClose: () => void;
  onInvite: (newUser: UserItem) => void;
}

export const InviteUserModal: React.FC<InviteUserModalProps> = ({ onClose, onInvite }) => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [role, setRole] = useState<'Admin' | 'Technician'>('Technician');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !email) return;

    const initials = name
      .split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase()
      .substring(0, 2);

    const user: UserItem = {
      id: `usr-${Date.now()}`,
      userId: `TECH-${Math.floor(1000 + Math.random() * 9000)}`,
      name,
      email,
      role,
      status: 'Pending',
      lastAuth: '--',
      initials
    };

    onInvite(user);
    onClose();
  };

  return (
    <div className="modal-overlay">
      <div className="modal-box max-w-md">
        <div className="modal-header">
          <div className="modal-title">
            <UserPlus className="w-5 h-5 text-[#38bdf8]" />
            <h3>Mời Nhân Sự Trung Tâm Dữ Liệu</h3>
          </div>
          <button onClick={onClose} className="modal-close-btn">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
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
            <label className="form-label">Email Công Việc</label>
            <input
              type="email"
              required
              placeholder="an.nguyen@ar-imms.corp"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="form-input font-mono"
            />
          </div>

          <div>
            <label className="form-label">Vai Trò Phân Quyền</label>
            <select
              value={role}
              onChange={(e) => setRole(e.target.value as any)}
              className="form-select"
            >
              <option value="Technician" className="bg-[#11161b]">🛠️ Kỹ thuật viên (Đọc/Cập nhật khu vực phần cứng, AR)</option>
              <option value="Admin" className="bg-[#11161b]">👑 Quản trị viên (Toàn quyền quản trị CRUD & Phân quyền)</option>
            </select>
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
              <Mail className="w-4 h-4" />
              Gửi Lời Mời
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
