import React, { useState } from 'react';
import { 
  X, 
  Server, 
  Cpu, 
  Activity, 
  Thermometer, 
  Zap, 
  RotateCw, 
  Printer, 
  Layers, 
  Copy,
  Check,
  MapPin,
  Barcode
} from 'lucide-react';
import { AssetItem } from '../../types';

interface NodeDetailModalProps {
  asset: AssetItem;
  onClose: () => void;
  onOpenPrintModal: (asset: AssetItem) => void;
  onNavigateToDigitalTwin?: (rackName: string) => void;
}

export const NodeDetailModal: React.FC<NodeDetailModalProps> = ({
  asset,
  onClose,
  onOpenPrintModal,
  onNavigateToDigitalTwin
}) => {
  const [copied, setCopied] = useState(false);
  const [isRebooting, setIsRebooting] = useState(false);
  const [rebootSuccess, setRebootSuccess] = useState(false);

  // Generate real shareable QR link
  const directLink = typeof window !== 'undefined' 
    ? `${window.location.origin}/?node=${asset.id}` 
    : `http://localhost:9999/?node=${asset.id}`;

  const handleCopyLink = () => {
    navigator.clipboard.writeText(directLink);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleIpmiReboot = () => {
    setIsRebooting(true);
    setTimeout(() => {
      setIsRebooting(false);
      setRebootSuccess(true);
      setTimeout(() => setRebootSuccess(false), 3000);
    }, 1500);
  };

  // Status mapping
  const isHealthy = asset.qrStatus === 'Active';
  const isWarning = asset.qrStatus === 'Mismatch';

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-md z-50 flex items-center justify-center p-3 sm:p-4 animate-in fade-in duration-200">
      <div className="bg-[#0f172a] text-white rounded-2xl border border-[#334155] shadow-2xl w-full max-w-2xl overflow-hidden flex flex-col max-h-[92vh]">
        
        {/* Modal Header */}
        <div className="px-6 py-4 bg-[#1e293b] border-b border-[#334155] flex justify-between items-center">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#0058be] flex items-center justify-center text-white shadow-md">
              <Server className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-bold text-lg text-white">{asset.name}</h3>
                <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold border ${
                  isHealthy 
                    ? 'bg-[#00855b]/20 text-[#4edea3] border-[#00855b]/40' 
                    : isWarning 
                    ? 'bg-[#e26d00]/20 text-[#ffb68c] border-[#e26d00]/40' 
                    : 'bg-[#ba1a1a]/20 text-[#ffb4ab] border-[#ba1a1a]/40'
                }`}>
                  {isHealthy ? '● Đang Hoạt Động (Healthy)' : isWarning ? '▲ Cảnh Báo (Warning)' : '■ Bảo Trì (Pending)'}
                </span>
              </div>
              <p className="text-xs text-[#94a3b8]">{asset.model} • {asset.manufacturer}</p>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="p-1.5 rounded-full text-[#94a3b8] hover:text-white hover:bg-[#334155] transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto space-y-6">
          
          {/* AR Anchor Identification Badge */}
          <div className="bg-[#1e293b]/60 border border-[#0058be]/40 rounded-xl p-4 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-[#0058be]/20 text-[#0058be]">
                <Barcode className="w-6 h-6" />
              </div>
              <div>
                <div className="text-xs font-bold text-[#0058be] uppercase tracking-wider">ĐIỂM NEO AR & MÃ GUID</div>
                <div className="font-mono text-sm font-bold text-white">{asset.guid}</div>
                <div className="text-[11px] text-[#94a3b8]">Số Serial: <span className="font-mono text-white">{asset.serialNumber}</span></div>
              </div>
            </div>

            <div className="flex items-center gap-2 w-full sm:w-auto">
              <button
                onClick={handleCopyLink}
                className="flex-1 sm:flex-none px-3 py-1.5 rounded-lg bg-[#334155] hover:bg-[#475569] text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
              >
                {copied ? <Check className="w-3.5 h-3.5 text-[#4edea3]" /> : <Copy className="w-3.5 h-3.5" />}
                {copied ? 'Đã sao chép' : 'Sao chép Link QR'}
              </button>
              <button
                onClick={() => onOpenPrintModal(asset)}
                className="px-3 py-1.5 rounded-lg bg-[#0058be] hover:bg-[#2170e4] text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors cursor-pointer text-white"
              >
                <Printer className="w-3.5 h-3.5" />
                In Thẻ QR
              </button>
            </div>
          </div>

          {/* Quick Metrics Grid */}
          <div>
            <h4 className="text-xs font-bold text-[#94a3b8] uppercase tracking-wider mb-3">Chỉ Số Vận Hành Trực Tuyến</h4>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div className="bg-[#1e293b] p-3 rounded-xl border border-[#334155]">
                <div className="flex items-center justify-between text-[#94a3b8] mb-1">
                  <span className="text-xs">CPU Load</span>
                  <Cpu className="w-4 h-4 text-[#0058be]" />
                </div>
                <div className="text-xl font-bold text-white">48%</div>
                <div className="text-[10px] text-[#4edea3]">Ổn định</div>
              </div>

              <div className="bg-[#1e293b] p-3 rounded-xl border border-[#334155]">
                <div className="flex items-center justify-between text-[#94a3b8] mb-1">
                  <span className="text-xs">Nhiệt Độ</span>
                  <Thermometer className="w-4 h-4 text-[#ba1a1a]" />
                </div>
                <div className="text-xl font-bold text-white">41°C</div>
                <div className="text-[10px] text-[#4edea3]">Ngưỡng an toàn</div>
              </div>

              <div className="bg-[#1e293b] p-3 rounded-xl border border-[#334155]">
                <div className="flex items-center justify-between text-[#94a3b8] mb-1">
                  <span className="text-xs">Công Suất</span>
                  <Zap className="w-4 h-4 text-[#ffb68c]" />
                </div>
                <div className="text-xl font-bold text-white">{asset.powerDraw || '420W'}</div>
                <div className="text-[10px] text-[#94a3b8]">Trung bình</div>
              </div>

              <div className="bg-[#1e293b] p-3 rounded-xl border border-[#334155]">
                <div className="flex items-center justify-between text-[#94a3b8] mb-1">
                  <span className="text-xs">Vị Trí Rack</span>
                  <MapPin className="w-4 h-4 text-[#4edea3]" />
                </div>
                <div className="text-sm font-bold text-white truncate">{asset.uPosition}</div>
                <div className="text-[10px] text-[#0058be] font-semibold">{asset.rack}</div>
              </div>
            </div>
          </div>

          {/* Network & Specs Details */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="bg-[#1e293b] p-4 rounded-xl border border-[#334155]">
              <h5 className="text-xs font-bold text-[#94a3b8] uppercase mb-2">Giao Diện Mạng (IP/MAC)</h5>
              <div className="space-y-1.5">
                {asset.networkInterfaces?.map((nic, idx) => (
                  <div key={idx} className="flex items-center justify-between text-xs py-1 border-b border-[#334155]/50 last:border-0">
                    <span className="font-mono text-[#94a3b8]">{nic.split(':')[0]}</span>
                    <span className="font-mono font-bold text-white">{nic.split(':')[1]}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-[#1e293b] p-4 rounded-xl border border-[#334155]">
              <h5 className="text-xs font-bold text-[#94a3b8] uppercase mb-2">Thông Tin Triển Khai</h5>
              <div className="space-y-1.5 text-xs">
                <div className="flex justify-between py-1 border-b border-[#334155]/50">
                  <span className="text-[#94a3b8]">Ngày lắp đặt:</span>
                  <span className="font-semibold text-white">{asset.installDate}</span>
                </div>
                <div className="flex justify-between py-1 border-b border-[#334155]/50">
                  <span className="text-[#94a3b8]">Chu kỳ bảo trì:</span>
                  <span className="font-semibold text-white">6 tháng / lần</span>
                </div>
                <div className="flex justify-between py-1">
                  <span className="text-[#94a3b8]">Trạng thái tem AR:</span>
                  <span className="font-semibold text-[#4edea3]">Đã kích hoạt</span>
                </div>
              </div>
            </div>
          </div>

          {/* Live Action Buttons */}
          <div className="bg-[#1e293b]/40 border border-[#334155] rounded-xl p-4 flex flex-col sm:flex-row items-center justify-between gap-3">
            <div>
              <div className="font-bold text-sm text-white">Thao Tác Điều Khiển Từ Xa</div>
              <div className="text-xs text-[#94a3b8]">Thực hiện điều khiển IPMI ACPI hoặc định vị trên sơ đồ số</div>
            </div>

            <div className="flex items-center gap-2 w-full sm:w-auto">
              <button
                onClick={handleIpmiReboot}
                disabled={isRebooting}
                className="flex-1 sm:flex-none px-3.5 py-2 bg-[#ba1a1a] hover:bg-[#de3730] text-white text-xs font-bold rounded-lg transition-colors flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-50"
              >
                <RotateCw className={`w-3.5 h-3.5 ${isRebooting ? 'animate-spin' : ''}`} />
                {isRebooting ? 'Đang gửi tín hiệu...' : rebootSuccess ? '✓ Đã khởi động' : 'Khởi Động Lại IPMI'}
              </button>

              {onNavigateToDigitalTwin && (
                <button
                  onClick={() => {
                    onClose();
                    onNavigateToDigitalTwin(asset.rack);
                  }}
                  className="flex-1 sm:flex-none px-3.5 py-2 bg-[#0058be] hover:bg-[#2170e4] text-white text-xs font-bold rounded-lg transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  <Layers className="w-3.5 h-3.5" />
                  Định Vị Tủ Rack
                </button>
              )}
            </div>
          </div>

        </div>

        {/* Modal Footer */}
        <div className="px-6 py-3 bg-[#1e293b] border-t border-[#334155] flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-[#334155] hover:bg-[#475569] text-white text-xs font-bold rounded-lg transition-colors cursor-pointer"
          >
            Đóng
          </button>
        </div>

      </div>
    </div>
  );
};
