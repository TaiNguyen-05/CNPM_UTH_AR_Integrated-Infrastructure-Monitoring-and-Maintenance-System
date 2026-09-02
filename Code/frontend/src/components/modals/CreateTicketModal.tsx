import React, { useState } from 'react';
import { X, Ticket, User, AlertTriangle, Send } from 'lucide-react';
import { AlertItem } from '../../types';

interface CreateTicketModalProps {
  alert: AlertItem;
  onClose: () => void;
  onAssignTicket: (alertId: string, assignee: string, notes: string) => void;
}

export const CreateTicketModal: React.FC<CreateTicketModalProps> = ({
  alert,
  onClose,
  onAssignTicket
}) => {
  const [assignee, setAssignee] = useState('Sarah Jenkins');
  const [priority, setPriority] = useState(alert.severity);
  const [workOrderNotes, setWorkOrderNotes] = useState(
    `Điều phối xử lý khẩn cấp cho ${alert.title} tại vị trí ${alert.location}. Kiểm tra điểm neo AR và kiểm tra chân cắm cáp / quạt tản nhiệt.`
  );

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onAssignTicket(alert.id, assignee, workOrderNotes);
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/40 backdrop-blur-xs z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl border border-[#c2c6d6] shadow-2xl w-full max-w-lg overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        <div className="px-6 py-4 bg-[#f8fafc] border-b border-[#c2c6d6] flex justify-between items-center">
          <div className="flex items-center gap-2">
            <Ticket className="w-5 h-5 text-[#0058be]" />
            <div>
              <h3 className="font-bold text-base text-[#191c1e]">Tạo Phiếu Xử Lý Sự Cố Kỹ Thuật</h3>
              <div className="text-xs text-[#727785]">{alert.alertCode} • {alert.title}</div>
            </div>
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
            <label className="block text-xs font-bold text-[#424754] uppercase mb-1">Chỉ Định Kỹ Thuật Viên Phụ Trách</label>
            <select
              value={assignee}
              onChange={(e) => setAssignee(e.target.value)}
              className="w-full px-3 py-2 border border-[#c2c6d6] rounded-lg text-sm bg-white cursor-pointer"
            >
              <option value="Sarah Jenkins">Sarah Jenkins (Quản trị viên hệ thống cấp cao)</option>
              <option value="Robert King">Robert King (Chuyên viên phần cứng)</option>
              <option value="Elena Rostova">Elena Rostova (Kỹ sư điện trung tâm dữ liệu)</option>
              <option value="John Doe">John Doe (Kỹ thuật viên Tier-2)</option>
            </select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-[#424754] uppercase mb-1">Mức Độ Ưu Tiên</label>
              <select
                value={priority}
                onChange={(e) => setPriority(e.target.value as any)}
                className="w-full px-3 py-2 border border-[#c2c6d6] rounded-lg text-sm bg-white cursor-pointer"
              >
                <option value="Critical">P1 - Khẩn cấp (SLA tức thì)</option>
                <option value="Warning">P2 - Ưu tiên cao</option>
                <option value="Info">P3 - Bảo trì định kỳ</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-bold text-[#424754] uppercase mb-1">Chế Độ Hiệu Chuẩn AR</label>
              <select className="w-full px-3 py-2 border border-[#c2c6d6] rounded-lg text-sm bg-white cursor-pointer">
                <option value="required">Bắt buộc (Kính thông minh)</option>
                <option value="optional">Tùy chọn (Ứng dụng di động)</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-[#424754] uppercase mb-1">Hướng Dẫn & Ghi Chú Công Việc</label>
            <textarea
              rows={3}
              value={workOrderNotes}
              onChange={(e) => setWorkOrderNotes(e.target.value)}
              className="w-full px-3 py-2 border border-[#c2c6d6] rounded-lg text-sm focus:outline-none focus:border-[#0058be]"
            />
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
              <Send className="w-4 h-4" />
              Điều Phối Phiếu Xử Lý
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
