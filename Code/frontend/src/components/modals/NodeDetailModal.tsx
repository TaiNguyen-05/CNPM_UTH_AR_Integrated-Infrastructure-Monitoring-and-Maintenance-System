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
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-3 sm:p-4 animate-in fade-in duration-150 font-mono text-white">
      <div className="bg-[#080b0e] text-slate-200 border border-[#222c37] shadow-2xl w-full max-w-2xl overflow-hidden flex flex-col max-h-[92vh]">
        
        {/* Modal Header */}
        <div className="px-6 py-4 bg-[#11161b] border-b border-[#222c37] flex justify-between items-center">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-[#38bdf8] flex items-center justify-center text-[#080b0e] shadow-lg">
              <Server className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-bold text-base text-white font-mono">{asset.name}</h3>
                {isHealthy ? (
                  <span className="inline-flex items-center gap-1 text-emerald-300 bg-emerald-950/60 border border-emerald-500/40 px-2 py-0.5 text-[10px] font-bold uppercase">
                    <CheckCircle2 className="w-3 h-3" /> Hoạt Động (Healthy)
                  </span>
                ) : isWarning ? (
                  <span className="inline-flex items-center gap-1 text-rose-300 bg-rose-950/60 border border-rose-500/40 px-2 py-0.5 text-[10px] font-bold uppercase">
                    <AlertTriangle className="w-3 h-3" /> Cảnh Báo (Warning)
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1 text-slate-400 bg-[#161d24] border border-[#222c37] px-2 py-0.5 text-[10px] font-bold uppercase">
                    <Clock className="w-3 h-3" /> Chờ Cấu Hình
                  </span>
                )}
              </div>
              <p className="text-xs text-slate-400 font-light">{asset.model} • {asset.manufacturer}</p>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="p-1.5 text-slate-500 hover:text-white hover:bg-[#161d24] transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto space-y-5 bg-[#0c1015]">
          
          {/* AR Anchor Identification Badge */}
          <div className="bg-[#11161b] border border-[#222c37] p-4 flex flex-col sm:flex-row items-center justify-between gap-4 shadow-lg">
            <div className="flex items-center gap-3">
              <div className="p-2.5 bg-[#38bdf8]/10 border border-[#38bdf8]/40 text-[#38bdf8]">
                <Barcode className="w-5 h-5" />
              </div>
              <div>
                <div className="text-[10px] font-bold text-[#ffb03a] uppercase tracking-wider">ĐIỂM NEO AR & MÃ GUID</div>
                <div className="font-mono text-sm font-bold text-white">{asset.guid}</div>
                <div className="text-xs text-slate-400">Số Serial: <span className="font-mono text-slate-200">{asset.serialNumber}</span></div>
              </div>
            </div>

            <div className="flex items-center gap-2 w-full sm:w-auto">
              <button
                onClick={handleCopyLink}
                className="flex-1 sm:flex-none px-3.5 py-2 bg-[#161d24] border border-[#222c37] text-slate-300 hover:text-white text-xs font-mono font-bold uppercase flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
              >
                {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5 text-slate-400" />}
                {copied ? 'Đã sao chép' : 'Sao chép QR'}
              </button>
              <button
                onClick={() => onOpenPrintModal(asset)}
                className="px-3.5 py-2 bg-[#38bdf8] hover:bg-[#00f0ff] text-[#080b0e] text-xs font-mono font-bold uppercase flex items-center justify-center gap-1.5 transition-colors cursor-pointer active:scale-95"
              >
                <Printer className="w-3.5 h-3.5" />
                In Thẻ QR
              </button>
            </div>
          </div>

          {/* Quick Metrics Grid */}
          <div>
            <h4 className="text-[10px] font-bold text-[#ffb03a] uppercase tracking-wider mb-2.5 font-mono">Chỉ Số Vận Hành Trực Tuyến</h4>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div className="bg-[#11161b] p-3.5 border border-[#222c37]">
                <div className="flex items-center justify-between text-slate-400 mb-1">
                  <span className="text-[10px] uppercase">CPU Load</span>
                  <Cpu className="w-4 h-4 text-[#38bdf8]" />
                </div>
                <div className="text-2xl font-bold text-white">48%</div>
                <div className="text-[10px] text-emerald-400 font-semibold mt-0.5">● Ổn định</div>
              </div>

              <div className="bg-[#11161b] p-3.5 border border-[#222c37]">
                <div className="flex items-center justify-between text-slate-400 mb-1">
                  <span className="text-[10px] uppercase">Nhiệt Độ</span>
                  <Thermometer className="w-4 h-4 text-rose-400" />
                </div>
                <div className="text-2xl font-bold text-white">41°C</div>
                <div className="text-[10px] text-emerald-400 font-semibold mt-0.5">● An toàn</div>
              </div>

              <div className="bg-[#11161b] p-3.5 border border-[#222c37]">
                <div className="flex items-center justify-between text-slate-400 mb-1">
                  <span className="text-[10px] uppercase">Công Suất</span>
                  <Zap className="w-4 h-4 text-[#ffb03a]" />
                </div>
                <div className="text-2xl font-bold text-white">{asset.powerDraw || '450W'}</div>
                <div className="text-[10px] text-slate-500 font-medium mt-0.5">Mức TB</div>
              </div>

              <div className="bg-[#11161b] p-3.5 border border-[#222c37]">
                <div className="flex items-center justify-between text-slate-400 mb-1">
                  <span className="text-[10px] uppercase">Vị Trí Rack</span>
                  <MapPin className="w-4 h-4 text-[#38bdf8]" />
                </div>
                <div className="text-xs font-bold text-white truncate">{asset.uPosition}</div>
                <div className="text-[10px] text-[#38bdf8] font-bold mt-0.5">{asset.rack}</div>
              </div>
            </div>
          </div>

          {/* Network & Specs Details */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="bg-[#11161b] p-4 border border-[#222c37]">
              <h5 className="text-[10px] font-bold text-[#ffb03a] uppercase mb-2.5 font-mono">Giao Diện Mạng (IP/MAC)</h5>
              <div className="space-y-2">
                {asset.networkInterfaces?.map((nic, idx) => (
                  <div key={idx} className="flex items-center justify-between text-xs py-1 border-b border-[#222c37]/60 last:border-0">
                    <span className="font-mono text-slate-400 font-semibold">{nic.split(':')[0]}</span>
                    <span className="font-mono font-bold text-white bg-[#161d24] px-2 py-0.5 border border-[#222c37]">{nic.split(':')[1]}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-[#11161b] p-4 border border-[#222c37]">
              <h5 className="text-[10px] font-bold text-[#ffb03a] uppercase mb-2.5 font-mono">Thông Tin Triển Khai</h5>
              <div className="space-y-2 text-xs">
                <div className="flex justify-between py-1 border-b border-[#222c37]/60">
                  <span className="text-slate-400">Ngày lắp đặt:</span>
                  <span className="font-bold text-white">{asset.installDate}</span>
                </div>
                <div className="flex justify-between py-1 border-b border-[#222c37]/60">
                  <span className="text-slate-400">Chu kỳ bảo trì:</span>
                  <span className="font-bold text-white">6 tháng / lần</span>
                </div>
                <div className="flex justify-between py-1">
                  <span className="text-slate-400">Trạng thái tem AR:</span>
                  <span className="font-bold text-emerald-400">Đã kích hoạt</span>
                </div>
              </div>
            </div>
          </div>

          {/* Live Action Buttons */}
          <div className="bg-[#11161b] border border-[#222c37] p-4 flex flex-col sm:flex-row items-center justify-between gap-3 shadow-lg">
            <div>
              <div className="font-bold text-sm text-white font-mono">Thao Tác Điều Khiển Từ Xa</div>
              <div className="text-xs text-slate-400">Gửi lệnh IPMI ACPI hoặc định vị trên sơ đồ số</div>
            </div>

            <div className="flex items-center gap-2 w-full sm:w-auto">
              <button
                onClick={handleIpmiReboot}
                disabled={isRebooting}
                className="flex-1 sm:flex-none px-4 py-2 bg-rose-950/40 border border-rose-500/50 hover:bg-rose-900/60 text-rose-300 text-xs font-mono font-bold uppercase transition-colors flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-50"
              >
                <RotateCw className={`w-3.5 h-3.5 ${isRebooting ? 'animate-spin' : ''}`} />
                {isRebooting ? 'Đang gửi...' : rebootSuccess ? '✓ Đã khởi động' : 'Khởi Động Lại IPMI'}
              </button>

              {onNavigateToDigitalTwin && (
                <button
                  onClick={() => {
                    onClose();
                    onNavigateToDigitalTwin(asset.rack);
                  }}
                  className="flex-1 sm:flex-none px-4 py-2 bg-[#38bdf8] hover:bg-[#00f0ff] text-[#080b0e] text-xs font-mono font-bold uppercase transition-colors flex items-center justify-center gap-1.5 cursor-pointer active:scale-95"
                >
                  <Layers className="w-3.5 h-3.5" />
                  Định Vị Tủ Rack
                </button>
              )}
            </div>
          </div>

        </div>

        {/* Modal Footer */}
        <div className="px-6 py-3.5 bg-[#11161b] border-t border-[#222c37] flex justify-end">
          <button
            onClick={onClose}
            className="px-5 py-2 bg-[#161d24] border border-[#222c37] hover:border-slate-500 text-white text-xs font-mono font-bold uppercase transition-colors cursor-pointer"
          >
            Đóng
          </button>
        </div>

      </div>
    </div>
  );
};
