import React, { useState } from 'react';
import { 
  X, 
  Server, 
  Cpu, 
  Thermometer, 
  Zap, 
  RotateCw, 
  Printer, 
  Layers, 
  Copy,
  Check,
  MapPin,
  Barcode,
  Activity,
  CheckCircle2,
  AlertTriangle,
  Clock
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
    <div className="fixed inset-0 bg-black/40 backdrop-blur-xs z-50 flex items-center justify-center p-3 sm:p-4 animate-in fade-in duration-150">
      <div className="bg-white text-[#191c1e] rounded-2xl border border-[#c2c6d6] shadow-2xl w-full max-w-2xl overflow-hidden flex flex-col max-h-[92vh]">
        
        {/* Modal Header */}
        <div className="px-6 py-4 bg-[#f8fafc] border-b border-[#c2c6d6] flex justify-between items-center">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#0058be] flex items-center justify-center text-white shadow-xs">
              <Server className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-bold text-lg text-[#191c1e]">{asset.name}</h3>
                {isHealthy ? (
                  <span className="inline-flex items-center gap-1 text-[#006947] bg-[#6ffbbe]/40 border border-[#006947]/20 px-2.5 py-0.5 rounded-full text-xs font-bold">
                    <CheckCircle2 className="w-3.5 h-3.5" /> Đang Hoạt Động (Healthy)
                  </span>
                ) : isWarning ? (
                  <span className="inline-flex items-center gap-1 text-[#93000a] bg-[#ffdad6] border border-[#ba1a1a]/20 px-2.5 py-0.5 rounded-full text-xs font-bold">
                    <AlertTriangle className="w-3.5 h-3.5" /> Lệch Vị Trí (Warning)
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1 text-[#424754] bg-[#e0e3e5] border border-[#c2c6d6] px-2.5 py-0.5 rounded-full text-xs font-bold">
                    <Clock className="w-3.5 h-3.5" /> Chờ Cấu Hình
                  </span>
                )}
              </div>
              <p className="text-xs text-[#727785]">{asset.model} • {asset.manufacturer}</p>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="p-1.5 rounded-full text-[#727785] hover:text-[#191c1e] hover:bg-[#e0e3e5] transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto space-y-5 bg-white">
          
          {/* AR Anchor Identification Badge */}
          <div className="bg-[#f0f4fd] border border-[#d8e2ff] rounded-xl p-4 flex flex-col sm:flex-row items-center justify-between gap-4 shadow-2xs">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-lg bg-[#0058be] text-white shadow-2xs">
                <Barcode className="w-5 h-5" />
              </div>
              <div>
                <div className="text-[11px] font-bold text-[#0058be] uppercase tracking-wider">ĐIỂM NEO AR & MÃ GUID</div>
                <div className="font-mono text-sm font-bold text-[#191c1e]">{asset.guid}</div>
                <div className="text-xs text-[#727785]">Số Serial: <span className="font-mono font-semibold text-[#191c1e]">{asset.serialNumber}</span></div>
              </div>
            </div>

            <div className="flex items-center gap-2 w-full sm:w-auto">
              <button
                onClick={handleCopyLink}
                className="flex-1 sm:flex-none px-3.5 py-2 rounded-lg bg-white border border-[#c2c6d6] text-[#191c1e] hover:bg-[#f2f4f6] text-xs font-bold flex items-center justify-center gap-1.5 transition-colors cursor-pointer shadow-2xs"
              >
                {copied ? <Check className="w-3.5 h-3.5 text-[#00855b]" /> : <Copy className="w-3.5 h-3.5 text-[#727785]" />}
                {copied ? 'Đã sao chép' : 'Sao chép Link QR'}
              </button>
              <button
                onClick={() => onOpenPrintModal(asset)}
                className="px-3.5 py-2 rounded-lg bg-[#0058be] hover:bg-[#2170e4] text-xs font-bold flex items-center justify-center gap-1.5 transition-colors cursor-pointer text-white shadow-xs active:scale-95"
              >
                <Printer className="w-3.5 h-3.5" />
                In Thẻ QR
              </button>
            </div>
          </div>

          {/* Quick Metrics Grid */}
          <div>
            <h4 className="text-xs font-bold text-[#424754] uppercase tracking-wider mb-2.5">Chỉ Số Vận Hành Trực Tuyến</h4>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div className="bg-[#f8fafc] p-3.5 rounded-xl border border-[#c2c6d6] shadow-2xs">
                <div className="flex items-center justify-between text-[#727785] mb-1">
                  <span className="text-xs font-medium">CPU Load</span>
                  <Cpu className="w-4 h-4 text-[#0058be]" />
                </div>
                <div className="text-2xl font-bold text-[#191c1e]">48%</div>
                <div className="text-[11px] text-[#00855b] font-semibold mt-0.5">● Hoạt động ổn định</div>
              </div>

              <div className="bg-[#f8fafc] p-3.5 rounded-xl border border-[#c2c6d6] shadow-2xs">
                <div className="flex items-center justify-between text-[#727785] mb-1">
                  <span className="text-xs font-medium">Nhiệt Độ</span>
                  <Thermometer className="w-4 h-4 text-[#ba1a1a]" />
                </div>
                <div className="text-2xl font-bold text-[#191c1e]">41°C</div>
                <div className="text-[11px] text-[#00855b] font-semibold mt-0.5">● Ngưỡng an toàn</div>
              </div>

              <div className="bg-[#f8fafc] p-3.5 rounded-xl border border-[#c2c6d6] shadow-2xs">
                <div className="flex items-center justify-between text-[#727785] mb-1">
                  <span className="text-xs font-medium">Công Suất</span>
                  <Zap className="w-4 h-4 text-[#e26d00]" />
                </div>
                <div className="text-2xl font-bold text-[#191c1e]">{asset.powerDraw || '450W'}</div>
                <div className="text-[11px] text-[#727785] font-medium mt-0.5">Mức tiêu thụ TB</div>
              </div>

              <div className="bg-[#f8fafc] p-3.5 rounded-xl border border-[#c2c6d6] shadow-2xs">
                <div className="flex items-center justify-between text-[#727785] mb-1">
                  <span className="text-xs font-medium">Vị Trí Rack</span>
                  <MapPin className="w-4 h-4 text-[#0058be]" />
                </div>
                <div className="text-sm font-bold text-[#191c1e] truncate">{asset.uPosition}</div>
                <div className="text-[11px] text-[#0058be] font-bold mt-0.5">{asset.rack}</div>
              </div>
            </div>
          </div>

          {/* Network & Specs Details */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="bg-[#f8fafc] p-4 rounded-xl border border-[#c2c6d6] shadow-2xs">
              <h5 className="text-xs font-bold text-[#424754] uppercase mb-2.5">Giao Diện Mạng (IP/MAC)</h5>
              <div className="space-y-2">
                {asset.networkInterfaces?.map((nic, idx) => (
                  <div key={idx} className="flex items-center justify-between text-xs py-1 border-b border-[#e0e3e5] last:border-0">
                    <span className="font-mono text-[#727785] font-semibold">{nic.split(':')[0]}</span>
                    <span className="font-mono font-bold text-[#191c1e] bg-white px-2 py-0.5 rounded border border-[#c2c6d6]">{nic.split(':')[1]}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-[#f8fafc] p-4 rounded-xl border border-[#c2c6d6] shadow-2xs">
              <h5 className="text-xs font-bold text-[#424754] uppercase mb-2.5">Thông Tin Triển Khai</h5>
              <div className="space-y-2 text-xs">
                <div className="flex justify-between py-1 border-b border-[#e0e3e5]">
                  <span className="text-[#727785]">Ngày lắp đặt:</span>
                  <span className="font-bold text-[#191c1e]">{asset.installDate}</span>
                </div>
                <div className="flex justify-between py-1 border-b border-[#e0e3e5]">
                  <span className="text-[#727785]">Chu kỳ bảo trì:</span>
                  <span className="font-bold text-[#191c1e]">6 tháng / lần</span>
                </div>
                <div className="flex justify-between py-1">
                  <span className="text-[#727785]">Trạng thái tem AR:</span>
                  <span className="font-bold text-[#00855b]">Đã kích hoạt</span>
                </div>
              </div>
            </div>
          </div>

          {/* Live Action Buttons */}
          <div className="bg-[#f2f4f6] border border-[#c2c6d6] rounded-xl p-4 flex flex-col sm:flex-row items-center justify-between gap-3 shadow-2xs">
            <div>
              <div className="font-bold text-sm text-[#191c1e]">Thao Tác Điều Khiển Từ Xa</div>
              <div className="text-xs text-[#727785]">Gửi lệnh IPMI ACPI hoặc định vị trên sơ đồ số</div>
            </div>

            <div className="flex items-center gap-2 w-full sm:w-auto">
              <button
                onClick={handleIpmiReboot}
                disabled={isRebooting}
                className="flex-1 sm:flex-none px-4 py-2 bg-[#ba1a1a] hover:bg-[#de3730] text-white text-xs font-bold rounded-lg transition-colors flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-50 shadow-2xs"
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
                  className="flex-1 sm:flex-none px-4 py-2 bg-[#0058be] hover:bg-[#2170e4] text-white text-xs font-bold rounded-lg transition-colors flex items-center justify-center gap-1.5 cursor-pointer shadow-xs active:scale-95"
                >
                  <Layers className="w-3.5 h-3.5" />
                  Định Vị Tủ Rack
                </button>
              )}
            </div>
          </div>

        </div>

        {/* Modal Footer */}
        <div className="px-6 py-3.5 bg-[#f8fafc] border-t border-[#c2c6d6] flex justify-end">
          <button
            onClick={onClose}
            className="px-5 py-2 bg-white border border-[#c2c6d6] hover:bg-[#e0e3e5] text-[#191c1e] text-xs font-bold rounded-lg transition-colors cursor-pointer shadow-2xs"
          >
            Đóng
          </button>
        </div>

      </div>
    </div>
  );
};
