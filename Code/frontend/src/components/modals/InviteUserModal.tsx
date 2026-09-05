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
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-[#080b0e] rounded-xl border border-[#222c37] shadow-2xl w-full max-w-md overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        <div className="px-6 py-4 bg-[#11161b] border-b border-[#222c37] flex justify-between items-center">
          <div className="flex items-center gap-2">
            <UserPlus className="w-5 h-5 text-[#38bdf8]" />
            <h3 className="font-bold text-base text-white tracking-wide">Mời Nhân Sự Trung Tâm Dữ Liệu</h3>
          </div>
          <button 
            onClick={onClose}
            className="p-1 rounded-md text-slate-400 hover:text-white hover:bg-[#161d24] cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Họ Và Tên</label>
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
            <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Email Công Việc</label>
            <input
              type="email"
              required
              placeholder="an.nguyen@ar-imms.corp"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-3 py-2 bg-[#161d24] border border-[#222c37] text-white rounded-lg text-sm focus:outline-none focus:border-[#38bdf8] font-mono"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Vai Trò Phân Quyền</label>
            <select
              value={role}
              onChange={(e) => setRole(e.target.value as any)}
              className="w-full px-3 py-2 bg-[#161d24] border border-[#222c37] text-white rounded-lg text-sm cursor-pointer focus:border-[#38bdf8]"
            >
              <option value="Technician" className="bg-[#11161b]">Kỹ thuật viên (Đọc/Cập nhật khu vực phần cứng)</option>
              <option value="Admin" className="bg-[#11161b]">Quản trị viên (Toàn quyền quản trị CRUD)</option>
              <option value="Viewer" className="bg-[#11161b]">Người xem (Chỉ xem dữ liệu Telemetry)</option>
            </select>
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
              <Mail className="w-4 h-4" />
              Gửi Lời Mời
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
