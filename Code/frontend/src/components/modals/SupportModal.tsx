import React from 'react';
import { X, HelpCircle, BookOpen, ExternalLink, Cpu, ShieldCheck } from 'lucide-react';

interface SupportModalProps {
  onClose: () => void;
}

export const SupportModal: React.FC<SupportModalProps> = ({ onClose }) => {
  return (
    <div className="modal-overlay">
      <div className="modal-box max-w-lg">
        <div className="modal-header">
          <div className="modal-title">
            <HelpCircle className="w-5 h-5 text-[#38bdf8]" />
            <h3>Trung Tâm Hỗ Trợ & Tài Liệu AR-IMMS</h3>
          </div>
          <button onClick={onClose} className="modal-close-btn">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 space-y-4">
          <div className="p-4 rounded-xl bg-[#38bdf8]/10 border border-[#38bdf8]/20 flex items-start gap-3">
            <Cpu className="w-6 h-6 text-[#38bdf8] shrink-0 mt-0.5" />
            <div>
              <div className="text-sm font-bold text-[#38bdf8]">Bản Sao Số Hạ Tầng Kỹ Thuật Số Thế Hệ Mới</div>
              <p className="text-xs text-slate-400 mt-1">
                AR-IMMS kết nối trực tiếp các tủ rack trung tâm dữ liệu với luồng dữ liệu đo lường thời gian thực, định vị không gian 6-DoF và mã đánh dấu AR DataMatrix giúp chẩn đoán sự cố rảnh tay tức thì.
              </p>
            </div>
          </div>

          <div className="space-y-2 text-xs">
            <div className="p-3 border border-[#222c37] rounded-lg bg-[#11161b] hover:bg-[#161d24] hover:border-[#38bdf8]/40 transition-colors flex items-center justify-between cursor-pointer">
              <div className="flex items-center gap-2 font-semibold text-white">
                <BookOpen className="w-4 h-4 text-[#38bdf8]" />
                Hướng Dẫn Hiệu Chuẩn Không Gian & Kính Thông Minh AR
              </div>
              <ExternalLink className="w-3.5 h-3.5 text-slate-400" />
            </div>

            <div className="p-3 border border-[#222c37] rounded-lg bg-[#11161b] hover:bg-[#161d24] hover:border-emerald-500/40 transition-colors flex items-center justify-between cursor-pointer">
              <div className="flex items-center gap-2 font-semibold text-white">
                <ShieldCheck className="w-4 h-4 text-emerald-400" />
                Đặc Tả Phân Quyền Bảo Mật RBAC & Nhật Ký Kiểm Toán
              </div>
              <ExternalLink className="w-3.5 h-3.5 text-slate-400" />
            </div>

            <div className="p-3 border border-[#222c37] rounded-lg bg-[#11161b] hover:bg-[#161d24] hover:border-[#ffb03a]/40 transition-colors flex items-center justify-between cursor-pointer">
              <div className="flex items-center gap-2 font-semibold text-white">
                <HelpCircle className="w-4 h-4 text-[#ffb03a]" />
                Giao Thức Chẩn Đoán & Điều Khiển Từ Xa IPMI / ACPI
              </div>
              <ExternalLink className="w-3.5 h-3.5 text-slate-400" />
            </div>
          </div>

          <div className="pt-3 border-t border-[#222c37] flex justify-between items-center text-xs text-slate-400">
            <span>Phiên Bản: <strong className="text-[#38bdf8] font-mono">v1.0-PROD</strong></span>
            <button
              onClick={onClose}
              className="btn-primary"
            >
              Đóng
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
