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
  const [role, setRole] = useState<'Admin' | 'Technician' | 'Viewer'>('Technician');

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
    <div className="fixed inset-0 bg-black/40 backdrop-blur-xs z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl border border-[#c2c6d6] shadow-2xl w-full max-w-md overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        <div className="px-6 py-4 bg-[#f8fafc] border-b border-[#c2c6d6] flex justify-between items-center">
          <div className="flex items-center gap-2">
            <UserPlus className="w-5 h-5 text-[#0058be]" />
            <h3 className="font-bold text-base text-[#191c1e]">Mời Nhân Sự Trung Tâm Dữ Liệu</h3>
          </div>
          <button 
            onClick={onClose}
            className="p-1 rounded-full text-[#727785] hover:text-[#191c1e] hover:bg-[#e0e3e5] cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="block text-xs font-bold text-[#424754] uppercase mb-1">Họ Và Tên</label>
            <input
              type="text"
              required
              placeholder="VD: Nguyễn Văn An"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-3 py-2 border border-[#c2c6d6] rounded-lg text-sm focus:outline-none focus:border-[#0058be]"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-[#424754] uppercase mb-1">Email Công Việc</label>
            <input
              type="email"
              required
              placeholder="an.nguyen@ar-imms.corp"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-3 py-2 border border-[#c2c6d6] rounded-lg text-sm focus:outline-none focus:border-[#0058be]"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-[#424754] uppercase mb-1">Vai Trò Phân Quyền</label>
            <select
              value={role}
              onChange={(e) => setRole(e.target.value as any)}
              className="w-full px-3 py-2 border border-[#c2c6d6] rounded-lg text-sm bg-white cursor-pointer"
            >
              <option value="Technician">Kỹ thuật viên (Đọc/Cập nhật khu vực phần cứng)</option>
              <option value="Admin">Quản trị viên (Toàn quyền quản trị CRUD)</option>
              <option value="Viewer">Người xem (Chỉ xem dữ liệu Telemetry)</option>
            </select>
          </div>

          <div className="pt-4 border-t border-[#c2c6d6] flex justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border border-[#c2c6d6] text-[#424754] font-bold text-xs rounded-lg hover:bg-[#f2f4f6] cursor-pointer"
            >
              Hủy Bỏ
            </button>
            <button
              type="submit"
              className="px-5 py-2 bg-[#0058be] text-white font-bold text-xs rounded-lg hover:bg-[#2170e4] flex items-center gap-1.5 shadow-xs cursor-pointer active:scale-95"
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
