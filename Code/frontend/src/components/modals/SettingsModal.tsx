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
    <div className="fixed inset-0 bg-black/40 backdrop-blur-xs z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl border border-[#c2c6d6] shadow-2xl w-full max-w-lg overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        <div className="px-6 py-4 bg-[#f8fafc] border-b border-[#c2c6d6] flex justify-between items-center">
          <div className="flex items-center gap-2">
            <Settings className="w-5 h-5 text-[#0058be]" />
            <h3 className="font-bold text-base text-[#191c1e]">Cấu Hình Hệ Thống</h3>
          </div>
          <button 
            onClick={onClose}
            className="p-1 rounded-full text-[#727785] hover:text-[#191c1e] hover:bg-[#e0e3e5] cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="flex border-b border-[#c2c6d6] px-6 bg-white">
          <button
            onClick={() => setActiveTab('general')}
            className={`py-3 px-4 text-xs font-bold border-b-2 transition-colors cursor-pointer ${
              activeTab === 'general' ? 'border-[#0058be] text-[#0058be]' : 'border-transparent text-[#727785] hover:text-[#191c1e]'
            }`}
          >
            Tổng Quan
          </button>
          <button
            onClick={() => setActiveTab('telemetry')}
            className={`py-3 px-4 text-xs font-bold border-b-2 transition-colors cursor-pointer ${
              activeTab === 'telemetry' ? 'border-[#0058be] text-[#0058be]' : 'border-transparent text-[#727785] hover:text-[#191c1e]'
            }`}
          >
            Dữ Liệu Đo & Cảnh Báo
          </button>
          <button
            onClick={() => setActiveTab('ar')}
            className={`py-3 px-4 text-xs font-bold border-b-2 transition-colors cursor-pointer ${
              activeTab === 'ar' ? 'border-[#0058be] text-[#0058be]' : 'border-transparent text-[#727785] hover:text-[#191c1e]'
            }`}
          >
            Luồng Cảm Biến AR
          </button>
        </div>

        <div className="p-6 space-y-4 text-xs">
          {activeTab === 'general' && (
            <>
              <div>
                <label className="block font-bold text-[#424754] uppercase mb-1">Tên Khu Vực / Tòa Nhà</label>
                <input
                  type="text"
                  defaultValue="Khu Vực Alpha - Trung Tâm Dữ Liệu Chính"
                  className="w-full px-3 py-2 border border-[#c2c6d6] rounded-lg text-sm"
                />
              </div>
              <div>
                <label className="block font-bold text-[#424754] uppercase mb-1">Đơn Vị Đo Nhiệt Độ Mặc Định</label>
                <select className="w-full px-3 py-2 border border-[#c2c6d6] rounded-lg text-sm bg-white cursor-pointer">
                  <option value="C">Độ C (°C - Celsius)</option>
                  <option value="F">Độ F (°F - Fahrenheit)</option>
                </select>
              </div>
            </>
          )}

          {activeTab === 'telemetry' && (
            <>
              <div>
                <label className="block font-bold text-[#424754] uppercase mb-1">Ngưỡng Nhiệt Độ Nguy Hiểm (°C)</label>
                <input
                  type="number"
                  defaultValue={85}
                  className="w-full px-3 py-2 border border-[#c2c6d6] rounded-lg text-sm"
                />
              </div>
              <div className="flex items-center justify-between p-3 rounded-lg border border-[#e0e3e5] bg-[#f8fafc]">
                <div>
                  <div className="font-bold text-[#191c1e]">Phát Âm Thanh Báo Động Khi Có Sự Cố P1 Nguy Cấp</div>
                  <div className="text-[11px] text-[#727785]">Phát chuông cảnh báo âm thanh khi vượt ngưỡng nhiệt an toàn.</div>
                </div>
                <input type="checkbox" defaultChecked className="w-4 h-4 text-[#0058be] cursor-pointer" />
              </div>
            </>
          )}

          {activeTab === 'ar' && (
            <>
              <div>
                <label className="block font-bold text-[#424754] uppercase mb-1">Chế Độ Tương Phản Mã QR DataMatrix</label>
                <select className="w-full px-3 py-2 border border-[#c2c6d6] rounded-lg text-sm bg-white cursor-pointer">
                  <option value="high">Tương Phản Cao (Lọc Phản Quang Công Nghiệp)</option>
                  <option value="standard">Tiêu Chuẩn ISO/IEC 16022</option>
                </select>
              </div>
              <div className="flex items-center justify-between p-3 rounded-lg border border-[#e0e3e5] bg-[#f8fafc]">
                <div>
                  <div className="font-bold text-[#191c1e]">Tự Động Đồng Bộ Điểm Neo Không Gian</div>
                  <div className="text-[11px] text-[#727785]">Truyền tọa độ 3D thời gian thực đến tất cả kính thông minh kết nối.</div>
                </div>
                <input type="checkbox" defaultChecked className="w-4 h-4 text-[#0058be] cursor-pointer" />
              </div>
            </>
          )}

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
              {saved ? <Check className="w-4 h-4" /> : <Check className="w-4 h-4" />}
              {saved ? 'Đã Lưu' : 'Lưu Thay Đổi'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
