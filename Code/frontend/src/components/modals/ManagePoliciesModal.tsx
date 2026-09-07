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
    <div className="modal-overlay">
      <div className="modal-box max-w-lg">
        <div className="modal-header">
          <div className="modal-title">
            <Shield className="w-5 h-5 text-[#38bdf8]" />
            <h3>Chính Sách Bảo Mật & Kiểm Soát Truy Cập</h3>
          </div>
          <button onClick={onClose} className="modal-close-btn">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 space-y-4">
          <div className="flex items-center justify-between p-3 rounded-lg border border-[#222c37] bg-[#11161b]">
            <div>
              <div className="text-xs font-bold text-white">Bắt Buộc Xác Thực Hai Yếu Tố (MFA)</div>
              <div className="text-[11px] text-slate-400">Yêu cầu FIDO2 / WebAuthn cho tất cả các đăng nhập quản trị viên.</div>
            </div>
            <input
              type="checkbox"
              checked={policies.enforceMfa}
              onChange={(e) => setPolicies(prev => ({ ...prev, enforceMfa: e.target.checked }))}
              className="w-4 h-4 accent-[#38bdf8] rounded cursor-pointer"
            />
          </div>

          <div className="flex items-center justify-between p-3 rounded-lg border border-[#222c37] bg-[#11161b]">
            <div>
              <div className="text-xs font-bold text-white">Yêu Cầu Hiệu Chuẩn Điểm Neo AR Không Gian</div>
              <div className="text-[11px] text-slate-400">Kỹ thuật viên phải quét mã QR vật lý trước khi mở tủ Rack.</div>
            </div>
            <input
              type="checkbox"
              checked={policies.requireArCalibration}
              onChange={(e) => setPolicies(prev => ({ ...prev, requireArCalibration: e.target.checked }))}
              className="w-4 h-4 accent-[#38bdf8] rounded cursor-pointer"
            />
          </div>

          <div className="flex items-center justify-between p-3 rounded-lg border border-[#222c37] bg-[#11161b]">
            <div>
              <div className="text-xs font-bold text-white">Tự Động Khóa Khi Phát Hiện Bất Thường Dữ Liệu</div>
              <div className="text-[11px] text-slate-400">Tạm thời vô hiệu hóa truy cập shell từ xa trên các node vượt 90°C.</div>
            </div>
            <input
              type="checkbox"
              checked={policies.autoLockOnAnomaly}
              onChange={(e) => setPolicies(prev => ({ ...prev, autoLockOnAnomaly: e.target.checked }))}
              className="w-4 h-4 accent-[#38bdf8] rounded cursor-pointer"
            />
          </div>

          <div className="pt-2">
            <label className="form-label">Thời Gian Chờ Hết Hạn Phiên (Session Timeout)</label>
            <select
              value={policies.sessionTimeoutMins}
              onChange={(e) => setPolicies(prev => ({ ...prev, sessionTimeoutMins: Number(e.target.value) }))}
              className="form-select"
            >
              <option value={15} className="bg-[#11161b]">15 Phút</option>
              <option value={30} className="bg-[#11161b]">30 Phút (Khuyến nghị)</option>
              <option value={60} className="bg-[#11161b]">60 Phút</option>
              <option value={120} className="bg-[#11161b]">2 Tiếng</option>
            </select>
          </div>

          <div className="modal-footer">
            <button
              onClick={onClose}
              className="btn-secondary"
            >
              Hủy Bỏ
            </button>
            <button
              onClick={handleSave}
              className="btn-primary"
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
