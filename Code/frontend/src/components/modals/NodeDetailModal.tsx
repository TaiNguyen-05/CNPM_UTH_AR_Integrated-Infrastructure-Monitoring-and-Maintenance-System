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
import { arImmsApi } from '../../services/api';

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
  const [isSimulatingAlert, setIsSimulatingAlert] = useState(false);
  const [simulateSuccess, setSimulateSuccess] = useState(false);

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

  const handleSimulateAlert = async () => {
    setIsSimulatingAlert(true);
    try {
      await arImmsApi.updateTelemetry(asset.id, {
        disk_temp_c: 88.5,
        cpu_usage: 95.0,
        ram_usage: 92.0
      });
      setSimulateSuccess(true);
      setTimeout(() => setSimulateSuccess(false), 3000);
    } catch (err) {
      console.error('Lỗi bắn tín hiệu test alert:', err);
    } finally {
      setIsSimulatingAlert(false);
    }
  };

  // Status mapping
  const isHealthy = asset.qrStatus === 'Active';
  const isWarning = asset.qrStatus === 'Mismatch';

  return (
    <div className="modal-overlay">
      <div className="modal-box max-w-2xl">
        
        {/* Modal Header */}
        <div className="modal-header">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-[#38bdf8] flex items-center justify-center text-[#080b0e] shadow-lg">
              <Server className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-bold text-base text-white font-mono">{asset.name}</h3>
                {isHealthy ? (
                  <span className="badge-tech text-[10px]">
                    <CheckCircle2 className="w-3 h-3" /> Hoạt Động (Healthy)
                  </span>
                ) : isWarning ? (
                  <span className="badge-danger text-[10px]">
                    <AlertTriangle className="w-3 h-3" /> Cảnh Báo (Warning)
                  </span>
                ) : (
                  <span className="badge-user text-[10px]">
                    <Clock className="w-3 h-3" /> Chờ Cấu Hình
                  </span>
                )}
              </div>
              <p className="text-xs text-slate-400 font-light">{asset.model} • {asset.manufacturer}</p>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="modal-close-btn"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto space-y-5 bg-[#0c1015]">
          
          {/* AR Anchor Identification Badge */}
          <div className="card-surface p-4 flex flex-col sm:flex-row items-center justify-between gap-4">
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
                className="btn-secondary flex-1 sm:flex-none py-2 text-xs"
              >
                {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5 text-slate-400" />}
                {copied ? 'Đã sao chép' : 'Sao chép QR'}
              </button>
              <button
                onClick={() => onOpenPrintModal(asset)}
                className="btn-primary py-2 text-xs"
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
            <div className="card-surface p-4">
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

            <div className="card-surface p-4">
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
          <div className="card-surface p-4 flex flex-col sm:flex-row items-center justify-between gap-3">
            <div>
              <div className="font-bold text-sm text-white font-mono">Thao Tác Điều Khiển Từ Xa</div>
              <div className="text-xs text-slate-400">Gửi lệnh IPMI, kiểm tra telemetry hoặc kích hoạt test cảnh báo</div>
            </div>

            <div className="flex items-center gap-2 w-full sm:w-auto flex-wrap">
              <button
                onClick={handleSimulateAlert}
                disabled={isSimulatingAlert}
                className="px-3 py-2 bg-rose-500/10 border border-rose-500/40 text-rose-300 hover:bg-rose-500/20 text-xs font-bold rounded-lg transition-all flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
              >
                <AlertTriangle className={`w-3.5 h-3.5 ${isSimulatingAlert ? 'animate-pulse' : ''}`} />
                {isSimulatingAlert ? 'Đang gửi...' : simulateSuccess ? '✓ Đã kích hoạt' : 'Test Cảnh Báo Quá Tải'}
              </button>

              <button
                onClick={handleIpmiReboot}
                disabled={isRebooting}
                className="btn-danger flex-1 sm:flex-none py-2 text-xs disabled:opacity-50"
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
                  className="btn-primary flex-1 sm:flex-none py-2 text-xs"
                >
                  <Layers className="w-3.5 h-3.5" />
                  Định Vị Tủ Rack
                </button>
              )}
            </div>
          </div>

        </div>

        {/* Modal Footer */}
        <div className="modal-footer">
          <button
            onClick={onClose}
            className="btn-secondary py-2 text-xs"
          >
            Đóng
          </button>
        </div>

      </div>
    </div>
  );
};
