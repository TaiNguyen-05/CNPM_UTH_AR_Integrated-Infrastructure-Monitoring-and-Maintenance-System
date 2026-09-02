import React from 'react';
import { X, HelpCircle, BookOpen, ExternalLink, Cpu, ShieldCheck } from 'lucide-react';

interface SupportModalProps {
  onClose: () => void;
}

export const SupportModal: React.FC<SupportModalProps> = ({ onClose }) => {
  return (
    <div className="fixed inset-0 bg-black/40 backdrop-blur-xs z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl border border-[#c2c6d6] shadow-2xl w-full max-w-lg overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        <div className="px-6 py-4 bg-[#f8fafc] border-b border-[#c2c6d6] flex justify-between items-center">
          <div className="flex items-center gap-2">
            <HelpCircle className="w-5 h-5 text-[#0058be]" />
            <h3 className="font-bold text-base text-[#191c1e]">Trung Tâm Hỗ Trợ & Tài Liệu AR-IMMS</h3>
          </div>
          <button 
            onClick={onClose}
            className="p-1 rounded-full text-[#727785] hover:text-[#191c1e] hover:bg-[#e0e3e5] cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 space-y-4">
          <div className="p-4 rounded-xl bg-[#d0e1fb]/30 border border-[#0058be]/20 flex items-start gap-3">
            <Cpu className="w-6 h-6 text-[#0058be] shrink-0 mt-0.5" />
            <div>
              <div className="text-sm font-bold text-[#004395]">Bản Sao Số Hạ Tầng Kỹ Thuật Số Thế Hệ Mới</div>
              <p className="text-xs text-[#424754] mt-1">
                AR-IMMS kết nối trực tiếp các tủ rack trung tâm dữ liệu với luồng dữ liệu đo lường thời gian thực, định vị không gian 6-DoF và mã đánh dấu AR DataMatrix giúp chẩn đoán sự cố rảnh tay tức thì.
              </p>
            </div>
          </div>

          <div className="space-y-2 text-xs">
            <div className="p-3 border border-[#c2c6d6] rounded-lg hover:bg-[#f8fafc] transition-colors flex items-center justify-between cursor-pointer">
              <div className="flex items-center gap-2 font-semibold text-[#191c1e]">
                <BookOpen className="w-4 h-4 text-[#0058be]" />
                Hướng Dẫn Hiệu Chuẩn Không Gian & Kính Thông Minh AR
              </div>
              <ExternalLink className="w-3.5 h-3.5 text-[#727785]" />
            </div>

            <div className="p-3 border border-[#c2c6d6] rounded-lg hover:bg-[#f8fafc] transition-colors flex items-center justify-between cursor-pointer">
              <div className="flex items-center gap-2 font-semibold text-[#191c1e]">
                <ShieldCheck className="w-4 h-4 text-[#00855b]" />
                Đặc Tả Phân Quyền Bảo Mật RBAC & Nhật Ký Kiểm Toán
              </div>
              <ExternalLink className="w-3.5 h-3.5 text-[#727785]" />
            </div>

            <div className="p-3 border border-[#c2c6d6] rounded-lg hover:bg-[#f8fafc] transition-colors flex items-center justify-between cursor-pointer">
              <div className="flex items-center gap-2 font-semibold text-[#191c1e]">
                <HelpCircle className="w-4 h-4 text-[#727785]" />
                Giao Thức Chẩn Đoán & Điều Khiển Từ Xa IPMI / ACPI
              </div>
              <ExternalLink className="w-3.5 h-3.5 text-[#727785]" />
            </div>
          </div>

          <div className="pt-3 border-t border-[#c2c6d6] flex justify-between items-center text-xs text-[#727785]">
            <span>Phiên Bản Hệ Thống: <strong className="text-[#191c1e] font-mono">v1.0-PROD (Build 8892)</strong></span>
            <button
              onClick={onClose}
              className="px-4 py-1.5 bg-[#0058be] text-white rounded-lg font-bold hover:bg-[#2170e4] cursor-pointer active:scale-95"
            >
              Đóng
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
