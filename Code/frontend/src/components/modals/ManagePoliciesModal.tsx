import React, { useState } from 'react';
import { X, Shield, Check, Lock } from 'lucide-react';

interface ManagePoliciesModalProps {
  onClose: () => void;
}

export const ManagePoliciesModal: React.FC<ManagePoliciesModalProps> = ({ onClose }) => {
  const [policies, setPolicies] = useState({
    enforceMfa: true,
    requireArCalibration: true,
    autoLockOnAnomaly: true,
    restrictIpRange: false,
    sessionTimeoutMins: 30
  });

  const [saved, setSaved] = useState(false);

  const handleSave = () => {
    setSaved(true);
    setTimeout(() => {
      setSaved(false);
      onClose();
    }, 1000);
  };

  return (
    <div className="fixed inset-0 bg-black/40 backdrop-blur-xs z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl border border-[#c2c6d6] shadow-2xl w-full max-w-lg overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        <div className="px-6 py-4 bg-[#f8fafc] border-b border-[#c2c6d6] flex justify-between items-center">
          <div className="flex items-center gap-2">
            <Shield className="w-5 h-5 text-[#0058be]" />
            <h3 className="font-bold text-base text-[#191c1e]">Chính Sách Bảo Mật & Kiểm Soát Truy Cập</h3>
          </div>
          <button 
            onClick={onClose}
            className="p-1 rounded-full text-[#727785] hover:text-[#191c1e] hover:bg-[#e0e3e5] cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 space-y-4">
          <div className="flex items-center justify-between p-3 rounded-lg border border-[#e0e3e5] bg-[#f8fafc]">
            <div>
              <div className="text-xs font-bold text-[#191c1e]">Bắt Buộc Xác Thực Hai Yếu Tố (MFA)</div>
              <div className="text-[11px] text-[#727785]">Yêu cầu FIDO2 / WebAuthn cho tất cả các đăng nhập quản trị viên.</div>
            </div>
            <input
              type="checkbox"
              checked={policies.enforceMfa}
              onChange={(e) => setPolicies(prev => ({ ...prev, enforceMfa: e.target.checked }))}
              className="w-4 h-4 text-[#0058be] rounded cursor-pointer"
            />
          </div>

          <div className="flex items-center justify-between p-3 rounded-lg border border-[#e0e3e5] bg-[#f8fafc]">
            <div>
              <div className="text-xs font-bold text-[#191c1e]">Yêu Cầu Hiệu Chuẩn Điểm Neo AR Không Gian</div>
              <div className="text-[11px] text-[#727785]">Kỹ thuật viên phải quét mã QR vật lý trước khi mở tủ Rack.</div>
            </div>
            <input
              type="checkbox"
              checked={policies.requireArCalibration}
              onChange={(e) => setPolicies(prev => ({ ...prev, requireArCalibration: e.target.checked }))}
              className="w-4 h-4 text-[#0058be] rounded cursor-pointer"
            />
          </div>

          <div className="flex items-center justify-between p-3 rounded-lg border border-[#e0e3e5] bg-[#f8fafc]">
            <div>
              <div className="text-xs font-bold text-[#191c1e]">Tự Động Khóa Khi Phát Hiện Bất Thường Dữ Liệu</div>
              <div className="text-[11px] text-[#727785]">Tạm thời vô hiệu hóa truy cập shell từ xa trên các node vượt 90°C.</div>
            </div>
            <input
              type="checkbox"
              checked={policies.autoLockOnAnomaly}
              onChange={(e) => setPolicies(prev => ({ ...prev, autoLockOnAnomaly: e.target.checked }))}
              className="w-4 h-4 text-[#0058be] rounded cursor-pointer"
            />
          </div>

          <div className="pt-2">
            <label className="block text-xs font-bold text-[#424754] uppercase mb-1">Thời Gian Chờ Hết Hạn Phiên (Session Timeout)</label>
            <select
              value={policies.sessionTimeoutMins}
              onChange={(e) => setPolicies(prev => ({ ...prev, sessionTimeoutMins: Number(e.target.value) }))}
              className="w-full px-3 py-2 border border-[#c2c6d6] rounded-lg text-sm bg-white cursor-pointer"
            >
              <option value={15}>15 Phút</option>
              <option value={30}>30 Phút (Khuyến nghị)</option>
              <option value={60}>60 Phút</option>
              <option value={120}>2 Tiếng</option>
            </select>
          </div>

          <div className="pt-4 border-t border-[#c2c6d6] flex justify-end gap-3">
            <button
              onClick={onClose}
              className="px-4 py-2 border border-[#c2c6d6] text-[#424754] font-bold text-xs rounded-lg hover:bg-[#f2f4f6] cursor-pointer"
            >
              Hủy Bỏ
            </button>
            <button
              onClick={handleSave}
              className="px-5 py-2 bg-[#0058be] text-white font-bold text-xs rounded-lg hover:bg-[#2170e4] flex items-center gap-1.5 shadow-xs cursor-pointer active:scale-95"
            >
              {saved ? <Check className="w-4 h-4" /> : <Shield className="w-4 h-4" />}
              {saved ? 'Đã Lưu Chính Sách' : 'Lưu Chính Sách'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
