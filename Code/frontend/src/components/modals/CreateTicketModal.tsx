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
    <div className="modal-overlay">
      <div className="modal-box max-w-lg">
        <div className="modal-header">
          <div className="modal-title">
            <Ticket className="w-5 h-5 text-[#38bdf8]" />
            <div>
              <h3 className="font-bold text-base text-white tracking-wide">Tạo Phiếu Xử Lý Sự Cố Kỹ Thuật</h3>
              <div className="text-xs text-slate-400 font-mono">{alert.alertCode} • {alert.title}</div>
            </div>
          </div>
          <button onClick={onClose} className="modal-close-btn">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="form-label">Chỉ Định Kỹ Thuật Viên Phụ Trách</label>
            <select
              value={assignee}
              onChange={(e) => setAssignee(e.target.value)}
              className="form-select"
            >
              <option value="Sarah Jenkins" className="bg-[#11161b]">Sarah Jenkins (Quản trị viên hệ thống cấp cao)</option>
              <option value="Robert King" className="bg-[#11161b]">Robert King (Chuyên viên phần cứng)</option>
              <option value="Elena Rostova" className="bg-[#11161b]">Elena Rostova (Kỹ sư điện trung tâm dữ liệu)</option>
              <option value="John Doe" className="bg-[#11161b]">John Doe (Kỹ thuật viên Tier-2)</option>
            </select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="form-label">Mức Độ Ưu Tiên</label>
              <select
                value={priority}
                onChange={(e) => setPriority(e.target.value as any)}
                className="form-select"
              >
                <option value="Critical" className="bg-[#11161b]">P1 - Khẩn cấp (SLA tức thì)</option>
                <option value="Warning" className="bg-[#11161b]">P2 - Ưu tiên cao</option>
                <option value="Info" className="bg-[#11161b]">P3 - Bảo trì định kỳ</option>
              </select>
            </div>
            <div>
              <label className="form-label">Chế Độ Hiệu Chuẩn AR</label>
              <select className="form-select">
                <option value="required" className="bg-[#11161b]">Bắt buộc (Kính thông minh)</option>
                <option value="optional" className="bg-[#11161b]">Tùy chọn (Ứng dụng di động)</option>
              </select>
            </div>
          </div>

          <div>
            <label className="form-label">Hướng Dẫn & Ghi Chú Công Việc</label>
            <textarea
              rows={3}
              value={workOrderNotes}
              onChange={(e) => setWorkOrderNotes(e.target.value)}
              className="form-input"
            />
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
              <Send className="w-4 h-4" />
              Điều Phối Phiếu Xử Lý
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
