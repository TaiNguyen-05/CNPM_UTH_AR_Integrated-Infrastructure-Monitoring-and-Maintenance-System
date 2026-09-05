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
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-[#080b0e] rounded-xl border border-[#222c37] shadow-2xl w-full max-w-lg overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        <div className="px-6 py-4 bg-[#11161b] border-b border-[#222c37] flex justify-between items-center">
          <div className="flex items-center gap-2">
            <Settings className="w-5 h-5 text-[#38bdf8]" />
            <h3 className="font-bold text-base text-white tracking-wide">Cấu Hình Hệ Thống</h3>
          </div>
          <button 
            onClick={onClose}
            className="p-1 rounded-md text-slate-400 hover:text-white hover:bg-[#161d24] cursor-pointer"
          >
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
                <label className="block font-bold text-slate-400 uppercase tracking-wider mb-1">Tên Khu Vực / Tòa Nhà</label>
                <input
                  type="text"
                  defaultValue="Khu Vực Alpha - Trung Tâm Dữ Liệu Chính"
                  className="w-full px-3 py-2 bg-[#161d24] border border-[#222c37] text-white rounded-lg text-sm focus:outline-none focus:border-[#38bdf8]"
                />
              </div>
              <div>
                <label className="block font-bold text-slate-400 uppercase tracking-wider mb-1">Đơn Vị Đo Nhiệt Độ Mặc Định</label>
                <select className="w-full px-3 py-2 bg-[#161d24] border border-[#222c37] text-white rounded-lg text-sm cursor-pointer focus:border-[#38bdf8]">
                  <option value="C" className="bg-[#11161b]">Độ C (°C - Celsius)</option>
                  <option value="F" className="bg-[#11161b]">Độ F (°F - Fahrenheit)</option>
                </select>
              </div>
            </>
          )}

          {activeTab === 'telemetry' && (
            <>
              <div>
                <label className="block font-bold text-slate-400 uppercase tracking-wider mb-1">Ngưỡng Nhiệt Độ Nguy Hiểm (°C)</label>
                <input
                  type="number"
                  defaultValue={85}
                  className="w-full px-3 py-2 bg-[#161d24] border border-[#222c37] text-white rounded-lg text-sm focus:outline-none focus:border-[#38bdf8] font-mono"
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
                <label className="block font-bold text-slate-400 uppercase tracking-wider mb-1">Chế Độ Tương Phản Mã QR DataMatrix</label>
                <select className="w-full px-3 py-2 bg-[#161d24] border border-[#222c37] text-white rounded-lg text-sm cursor-pointer focus:border-[#38bdf8]">
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

          <div className="pt-4 border-t border-[#222c37] flex justify-end gap-3">
            <button
              onClick={onClose}
              className="px-4 py-2 border border-[#222c37] text-slate-400 font-bold text-xs rounded-lg hover:bg-[#161d24] hover:text-white cursor-pointer"
            >
              Hủy Bỏ
            </button>
            <button
              onClick={handleSave}
              className="px-5 py-2 bg-[#38bdf8] text-[#080b0e] font-bold text-xs rounded-lg hover:bg-[#7dd3fc] flex items-center gap-1.5 shadow-xs cursor-pointer active:scale-95 transition-colors"
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
