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
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-[#080b0e] rounded-xl border border-[#222c37] shadow-2xl w-full max-w-lg overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        <div className="px-6 py-4 bg-[#11161b] border-b border-[#222c37] flex justify-between items-center">
          <div className="flex items-center gap-2">
            <Ticket className="w-5 h-5 text-[#38bdf8]" />
            <div>
              <h3 className="font-bold text-base text-white tracking-wide">Tạo Phiếu Xử Lý Sự Cố Kỹ Thuật</h3>
              <div className="text-xs text-slate-400">{alert.alertCode} • {alert.title}</div>
            </div>
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
            <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Chỉ Định Kỹ Thuật Viên Phụ Trách</label>
            <select
              value={assignee}
              onChange={(e) => setAssignee(e.target.value)}
              className="w-full px-3 py-2 bg-[#161d24] border border-[#222c37] text-white rounded-lg text-sm cursor-pointer focus:border-[#38bdf8]"
            >
              <option value="Sarah Jenkins" className="bg-[#11161b]">Sarah Jenkins (Quản trị viên hệ thống cấp cao)</option>
              <option value="Robert King" className="bg-[#11161b]">Robert King (Chuyên viên phần cứng)</option>
              <option value="Elena Rostova" className="bg-[#11161b]">Elena Rostova (Kỹ sư điện trung tâm dữ liệu)</option>
              <option value="John Doe" className="bg-[#11161b]">John Doe (Kỹ thuật viên Tier-2)</option>
            </select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Mức Độ Ưu Tiên</label>
              <select
                value={priority}
                onChange={(e) => setPriority(e.target.value as any)}
                className="w-full px-3 py-2 bg-[#161d24] border border-[#222c37] text-white rounded-lg text-sm cursor-pointer focus:border-[#38bdf8]"
              >
                <option value="Critical" className="bg-[#11161b]">P1 - Khẩn cấp (SLA tức thì)</option>
                <option value="Warning" className="bg-[#11161b]">P2 - Ưu tiên cao</option>
                <option value="Info" className="bg-[#11161b]">P3 - Bảo trì định kỳ</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Chế Độ Hiệu Chuẩn AR</label>
              <select className="w-full px-3 py-2 bg-[#161d24] border border-[#222c37] text-white rounded-lg text-sm cursor-pointer focus:border-[#38bdf8]">
                <option value="required" className="bg-[#11161b]">Bắt buộc (Kính thông minh)</option>
                <option value="optional" className="bg-[#11161b]">Tùy chọn (Ứng dụng di động)</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Hướng Dẫn & Ghi Chú Công Việc</label>
            <textarea
              rows={3}
              value={workOrderNotes}
              onChange={(e) => setWorkOrderNotes(e.target.value)}
              className="w-full px-3 py-2 bg-[#161d24] border border-[#222c37] text-white rounded-lg text-sm focus:outline-none focus:border-[#38bdf8]"
            />
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
              <Send className="w-4 h-4" />
              Điều Phối Phiếu Xử Lý
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
