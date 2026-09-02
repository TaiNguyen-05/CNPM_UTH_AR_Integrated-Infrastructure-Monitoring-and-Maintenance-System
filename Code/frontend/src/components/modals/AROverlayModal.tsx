import React, { useState } from 'react';
import { 
  X, 
  Camera, 
  Scan, 
  Layers, 
  Activity, 
  AlertTriangle, 
  CheckCircle, 
  Maximize2, 
  Target,
  Sparkles,
  Zap
} from 'lucide-react';
import { AlertItem } from '../../types';
import { MOCK_RACK_ISOMETRIC } from '../../data/mockData';

interface AROverlayModalProps {
  onClose: () => void;
  targetAlert?: AlertItem | null;
}

export const AROverlayModal: React.FC<AROverlayModalProps> = ({ onClose, targetAlert }) => {
  const [activeLayer, setActiveLayer] = useState<'thermal' | 'wireframe' | 'telemetry'>('thermal');
  const [trackingConfidence, setTrackingConfidence] = useState<number>(98.4);

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-2 sm:p-4">
      <div className="bg-[#0f172a] rounded-2xl border border-[#334155] shadow-2xl w-full max-w-5xl h-[85vh] flex flex-col overflow-hidden text-white relative animate-in fade-in zoom-in-95 duration-200">
        
        {/* AR Header */}
        <div className="px-6 py-3 bg-[#1e293b]/90 border-b border-[#334155] flex justify-between items-center z-20">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-[#0058be] flex items-center justify-center text-white">
              <Camera className="w-4 h-4" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-bold text-sm text-white">Chế Độ Giám Sát Không Gian Thực Tế Ảo (AR)</span>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-[#00855b]/30 text-[#4edea3] border border-[#00855b]/40">
                  Điểm Neo Đã Khóa ({trackingConfidence}%)
                </span>
              </div>
              <div className="text-xs text-[#94a3b8]">Mục tiêu: {targetAlert ? targetAlert.location : 'Tủ Rack A2 - Khu Máy Chủ 1'}</div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* Layer Toggles */}
            <div className="hidden sm:flex items-center bg-[#0f172a] rounded-lg p-1 border border-[#334155] text-xs">
              <button
                onClick={() => setActiveLayer('thermal')}
                className={`px-3 py-1 rounded font-semibold transition-colors cursor-pointer ${
                  activeLayer === 'thermal' ? 'bg-[#ba1a1a] text-white' : 'text-[#94a3b8] hover:text-white'
                }`}
              >
                Bản Đồ Nhiệt
              </button>
              <button
                onClick={() => setActiveLayer('wireframe')}
                className={`px-3 py-1 rounded font-semibold transition-colors cursor-pointer ${
                  activeLayer === 'wireframe' ? 'bg-[#0058be] text-white' : 'text-[#94a3b8] hover:text-white'
                }`}
              >
                Mô Hình CAD Khung Dây
              </button>
              <button
                onClick={() => setActiveLayer('telemetry')}
                className={`px-3 py-1 rounded font-semibold transition-colors cursor-pointer ${
                  activeLayer === 'telemetry' ? 'bg-[#00855b] text-white' : 'text-[#94a3b8] hover:text-white'
                }`}
              >
                Ghim Dữ Liệu Trực Tiếp
              </button>
            </div>

            <button
              onClick={onClose}
              className="p-2 rounded-full hover:bg-[#334155] text-[#94a3b8] hover:text-white transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Viewport Canvas with Spatial Holograms */}
        <div className="flex-1 relative bg-black overflow-hidden flex items-center justify-center">
          {/* Real-time background feed */}
          <img
            src={MOCK_RACK_ISOMETRIC}
            alt="AR Datacenter Hall Camera Stream"
            className="w-full h-full object-cover opacity-75 filter contrast-125"
          />

          {/* AR HUD Laser Overlay */}
          <div className="absolute inset-0 pointer-events-none">
            {/* Grid Horizon Lines */}
            <div 
              className="absolute inset-0 opacity-20"
              style={{
                backgroundImage: 'linear-gradient(to right, #0058be 1px, transparent 1px), linear-gradient(to bottom, #0058be 1px, transparent 1px)',
                backgroundSize: '40px 40px'
              }}
            />

            {/* Target Reticle in Center */}
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="w-72 h-72 border border-[#0058be]/40 rounded-full flex items-center justify-center relative animate-pulse">
                <div className="w-56 h-56 border border-dashed border-[#4edea3]/60 rounded-full" />
                <Target className="w-8 h-8 text-[#0058be] opacity-80" />
                {/* 4 corner brackets */}
                <div className="absolute -top-2 -left-2 w-6 h-6 border-t-2 border-l-2 border-[#4edea3]" />
                <div className="absolute -top-2 -right-2 w-6 h-6 border-t-2 border-r-2 border-[#4edea3]" />
                <div className="absolute -bottom-2 -left-2 w-6 h-6 border-b-2 border-l-2 border-[#4edea3]" />
                <div className="absolute -bottom-2 -right-2 w-6 h-6 border-b-2 border-r-2 border-[#4edea3]" />
              </div>
            </div>

            {/* Floating Holographic Telemetry Pin 1 (Critical Blade) */}
            <div className="absolute top-1/4 right-1/4 bg-[#1e293b]/90 border-2 border-[#ba1a1a] rounded-xl p-3 shadow-2xl backdrop-blur-md max-w-xs animate-in fade-in duration-300">
              <div className="flex items-center justify-between gap-2 mb-1">
                <span className="text-xs font-bold text-[#ffdad6] flex items-center gap-1">
                  <AlertTriangle className="w-3.5 h-3.5 text-[#ba1a1a] animate-bounce" />
                  Điểm Quá Nhiệt: 92°C
                </span>
                <span className="text-[10px] font-mono text-[#94a3b8]">Phiến U03</span>
              </div>
              <p className="text-[11px] text-[#cbd5e1] mb-2">Lưu lượng khí làm mát bị hạn chế. Khuyến nghị thay thế quạt tản nhiệt.</p>
              <div className="flex items-center gap-2">
                <span className="text-[10px] px-2 py-0.5 rounded bg-[#ba1a1a] text-white font-bold">Cần Xử Lý Ngay</span>
                <span className="text-[10px] font-mono text-[#94a3b8]">GUID: 8f7e-2a19</span>
              </div>
            </div>

            {/* Floating Holographic Telemetry Pin 2 (Healthy Rack) */}
            <div className="absolute bottom-1/4 left-1/4 bg-[#1e293b]/90 border-2 border-[#00855b] rounded-xl p-3 shadow-2xl backdrop-blur-md max-w-xs animate-in fade-in duration-300">
              <div className="flex items-center justify-between gap-2 mb-1">
                <span className="text-xs font-bold text-[#4edea3] flex items-center gap-1">
                  <CheckCircle className="w-3.5 h-3.5 text-[#00855b]" />
                  Tủ Rack A1: 24°C Chuẩn Định
                </span>
                <span className="text-[10px] font-mono text-[#94a3b8]">Trạng thái PDU Tốt</span>
              </div>
              <div className="text-[11px] text-[#cbd5e1]">Tải điện cân bằng giữa Pha 1 & 2.</div>
            </div>
          </div>

          {/* AR Bottom HUD Bar */}
          <div className="absolute bottom-4 left-4 right-4 bg-[#0f172a]/90 border border-[#334155] rounded-xl p-3 flex justify-between items-center backdrop-blur-md">
            <div className="flex items-center gap-4 text-xs font-mono text-[#94a3b8]">
              <div>FOV: <span className="text-white font-bold">78.4°</span></div>
              <div>ĐỘ TRỄ: <span className="text-[#4edea3] font-bold">12ms</span></div>
              <div>ĐỊNH VỊ NEO: <span className="text-[#38bdf8] font-bold">SLAM 6-DoF</span></div>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => setTrackingConfidence(prev => (prev === 98.4 ? 99.1 : 98.4))}
                className="px-3 py-1.5 bg-[#0058be] text-white rounded-lg text-xs font-bold hover:bg-[#2170e4] transition-colors cursor-pointer"
              >
                Hiệu Chỉnh Lại Điểm Neo
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
