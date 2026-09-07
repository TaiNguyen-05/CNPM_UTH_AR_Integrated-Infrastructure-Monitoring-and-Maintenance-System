import React, { useState } from 'react';
import { X, Settings, Check, Bell, Activity, Database, Key } from 'lucide-react';

interface SettingsModalProps {
  onClose: () => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({ onClose }) => {
  const [activeTab, setActiveTab] = useState<'general' | 'telemetry' | 'ar'>('general');
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
            <Settings className="w-5 h-5 text-[#38bdf8]" />
            <h3>Cấu Hình Hệ Thống</h3>
          </div>
          <button onClick={onClose} className="modal-close-btn">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="flex border-b border-[#222c37] px-6 bg-[#11161b]">
          <button
            onClick={() => setActiveTab('general')}
            className={`py-3 px-4 text-xs font-bold border-b-2 transition-colors cursor-pointer ${
              activeTab === 'general' ? 'border-[#38bdf8] text-[#38bdf8]' : 'border-transparent text-slate-400 hover:text-white'
            }`}
          >
            Tổng Quan
          </button>
          <button
            onClick={() => setActiveTab('telemetry')}
            className={`py-3 px-4 text-xs font-bold border-b-2 transition-colors cursor-pointer ${
              activeTab === 'telemetry' ? 'border-[#38bdf8] text-[#38bdf8]' : 'border-transparent text-slate-400 hover:text-white'
            }`}
          >
            Dữ Liệu Đo & Cảnh Báo
          </button>
          <button
            onClick={() => setActiveTab('ar')}
            className={`py-3 px-4 text-xs font-bold border-b-2 transition-colors cursor-pointer ${
              activeTab === 'ar' ? 'border-[#38bdf8] text-[#38bdf8]' : 'border-transparent text-slate-400 hover:text-white'
            }`}
          >
            Luồng Cảm Biến AR
          </button>
        </div>

        <div className="p-6 space-y-4 text-xs">
          {activeTab === 'general' && (
            <>
              <div>
                <label className="form-label">Tên Khu Vực / Tòa Nhà</label>
                <input
                  type="text"
                  defaultValue="Khu Vực Alpha - Trung Tâm Dữ Liệu Chính"
                  className="form-input"
                />
              </div>
              <div>
                <label className="form-label">Đơn Vị Đo Nhiệt Độ Mặc Định</label>
                <select className="form-select">
                  <option value="C" className="bg-[#11161b]">Độ C (°C - Celsius)</option>
                  <option value="F" className="bg-[#11161b]">Độ F (°F - Fahrenheit)</option>
                </select>
              </div>
            </>
          )}

          {activeTab === 'telemetry' && (
            <>
              <div>
                <label className="form-label">Ngưỡng Nhiệt Độ Nguy Hiểm (°C)</label>
                <input
                  type="number"
                  defaultValue={85}
                  className="form-input font-mono"
                />
              </div>
              <div className="flex items-center justify-between p-3 rounded-lg border border-[#222c37] bg-[#11161b]">
                <div>
                  <div className="font-bold text-white">Phát Âm Thanh Báo Động Khi Có Sự Cố P1 Nguy Cấp</div>
                  <div className="text-[11px] text-slate-400">Phát chuông cảnh báo âm thanh khi vượt ngưỡng nhiệt an toàn.</div>
                </div>
                <input type="checkbox" defaultChecked className="w-4 h-4 accent-[#38bdf8] cursor-pointer" />
              </div>
            </>
          )}

          {activeTab === 'ar' && (
            <>
              <div>
                <label className="form-label">Chế Độ Tương Phản Mã QR DataMatrix</label>
                <select className="form-select">
                  <option value="high" className="bg-[#11161b]">Tương Phản Cao (Lọc Phản Quang Công Nghiệp)</option>
                  <option value="standard" className="bg-[#11161b]">Tiêu Chuẩn ISO/IEC 16022</option>
                </select>
              </div>
              <div className="flex items-center justify-between p-3 rounded-lg border border-[#222c37] bg-[#11161b]">
                <div>
                  <div className="font-bold text-white">Tự Động Đồng Bộ Điểm Neo Không Gian</div>
                  <div className="text-[11px] text-slate-400">Truyền tọa độ 3D thời gian thực đến tất cả kính thông minh kết nối.</div>
                </div>
                <input type="checkbox" defaultChecked className="w-4 h-4 accent-[#38bdf8] cursor-pointer" />
              </div>
            </>
          )}

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
              <Check className="w-4 h-4" />
              {saved ? 'Đã Lưu' : 'Lưu Thay Đổi'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
