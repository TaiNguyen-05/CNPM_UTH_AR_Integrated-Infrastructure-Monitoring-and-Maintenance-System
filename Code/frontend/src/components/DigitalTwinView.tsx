import React, { useState } from 'react';
import { 
  Server, 
  Layers, 
  Cpu, 
  Ticket, 
  FileText, 
  Sliders, 
  RefreshCw,
  X,
  Flame,
  Activity,
  ShieldCheck,
  HardDrive,
  Wifi,
  Fan,
  QrCode,
  Copy,
  Check,
  ExternalLink,
  AlertTriangle
} from 'lucide-react';
import { Rack, RackUnit } from '../types';
import { RackElevationView } from './RackElevationView';

interface DigitalTwinViewProps {
  racks: Rack[];
  onSelectTab?: (tab: string) => void;
  onOpenAROverlay?: () => void;
  onSelectRack?: (rack: Rack) => void;
  onOpenAR?: () => void;
}

export const DigitalTwinView: React.FC<DigitalTwinViewProps> = ({
  racks,
  onSelectTab,
  onOpenAROverlay,
  onSelectRack,
  onOpenAR
}) => {
  const [selectedRackId, setSelectedRackId] = useState<string>('rack-a2');
  const [selectedUnit, setSelectedUnit] = useState<RackUnit>({
    u: 3,
    name: 'A2 - Unit 03',
    model: 'XR-9000 Compute Blade',
    status: 'critical',
    temp: 92,
    cpu: 95,
    ram: 62,
    disk: 28,
    net: 14
  });

  const [viewFilter, setViewFilter] = useState<'normal' | 'thermal' | 'workload'>('normal');
  const [isRestarting, setIsRestarting] = useState<boolean>(false);
  const [fanBoostActive, setFanBoostActive] = useState<boolean>(false);
  const [isTicketQRModalOpen, setIsTicketQRModalOpen] = useState<boolean>(false);
  const [copiedTicketUrl, setCopiedTicketUrl] = useState<boolean>(false);
  const [restartMessage, setRestartMessage] = useState<string | null>(null);

  const fallbackRack: Rack = {
    id: 'rack-a1',
    name: 'Tủ Rack Alpha 01',
    zone: 'Hàng Máy Chủ Alpha (Rack A)',
    status: 'healthy',
    temperature: 32.5,
    powerDrawKw: 4.8,
    coolingStatus: 'Bình thường (45%)',
    fanSpeedRpm: 3800,
    networkBandwidthGbps: 40,
    nodesCount: 6,
    activeAlertsCount: 0,
    units: [
      { u: 1, name: 'A1 - Unit 01', model: 'XR-9000 Compute Blade', status: 'healthy', temp: 38, cpu: 20, ram: 30, disk: 20, net: 10 },
      { u: 2, name: 'A1 - Unit 02', model: 'XR-9000 Compute Blade', status: 'healthy', temp: 40, cpu: 25, ram: 35, disk: 22, net: 12 },
      { u: 3, name: 'A1 - Unit 03', model: 'XR-9000 Compute Blade', status: 'healthy', temp: 42, cpu: 30, ram: 40, disk: 25, net: 15 }
    ]
  };

  const selectedRack = (racks && racks.length > 0)
    ? (racks.find(r => r.id === selectedRackId) || racks[0] || fallbackRack)
    : fallbackRack;

  const handleRestartNode = () => {
    setIsRestarting(true);
    setRestartMessage('Đang gửi tín hiệu IPMI ACPI Graceful Reset...');
    setTimeout(() => {
      setSelectedUnit(prev => ({
        ...prev,
        status: 'healthy',
        temp: 42,
        cpu: 18,
        ram: 34
      }));
      setIsRestarting(false);
      setRestartMessage('Node đã khởi động lại hoàn tất. Nhiệt độ hạ về mức 42°C an toàn.');
      setTimeout(() => setRestartMessage(null), 4000);
    }, 2000);
  };

  const handleToggleFanBoost = () => {
    setFanBoostActive(prev => !prev);
    if (!fanBoostActive) {
      setSelectedUnit(prev => ({
        ...prev,
        temp: Math.max(prev.temp - 12, 38)
      }));
      setRestartMessage('Đã kích hoạt chế độ Max Fan RPM (6,500 RPM). Đang tản nhiệt cấp tốc.');
      setTimeout(() => setRestartMessage(null), 3500);
    }
  };

  const handleUnitClick = (unit: RackUnit, rack: Rack) => {
    setSelectedRackId(rack.id);
    setSelectedUnit(unit);
    if (onSelectRack) {
      onSelectRack(rack);
    }
  };

  // Direct Ticket repair URL for QR code and technician mobile access
  const ticketDirectUrl = typeof window !== 'undefined'
    ? `${window.location.origin}/?tab=alerts&unit=${encodeURIComponent(selectedUnit.name)}&rack=${encodeURIComponent(selectedRack.name)}&action=repair`
    : `https://cnpm-uth-ar-integrated-infrastructu.vercel.app/?tab=alerts`;

  const qrImageUrl = `https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${encodeURIComponent(ticketDirectUrl)}&margin=10`;

  return (
    <div className="w-full flex flex-col gap-6 text-slate-100">
      {/* Section Header & View Controls Bar */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 pb-2 border-b border-[#222c37]">
        <div>
          <span className="block text-xs uppercase tracking-widest text-[#ffb03a] font-mono mb-1">
            SƠ ĐỒ MẶT CẮT KỸ THUẬT SỐ // ZONE ALPHA
          </span>
          <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-white flex items-center gap-2">
            <Server className="w-6 h-6 text-[#38bdf8]" />
            Mặt Cắt Kỹ Thuật Số Tủ Rack 42U
          </h2>
        </div>

        <div className="flex items-center gap-3 flex-wrap">
          {/* Filter Dropdown */}
          <div className="relative">
            <select
              value={viewFilter}
              onChange={(e) => setViewFilter(e.target.value as any)}
              className="px-3.5 py-1.5 bg-[#11161b] border border-[#222c37] text-slate-300 font-mono text-xs appearance-none pr-8 cursor-pointer outline-none focus:border-[#38bdf8]"
            >
              <option value="normal">CHẾ ĐỘ XEM: TIÊU CHUẨN</option>
              <option value="thermal">CHẾ ĐỘ XEM: BẢN ĐỒ NHIỆT</option>
              <option value="workload">CHẾ ĐỘ XEM: TẢI CAO (&gt;70%)</option>
            </select>
            <Sliders className="w-3 h-3 text-slate-400 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
          </div>
        </div>
      </div>

      {/* KPI Cards Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Active Racks */}
        <div className="glass-card rounded-2xl p-4.5 flex flex-col justify-between group">
          <div className="flex justify-between items-start mb-2">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Tủ Rack Hoạt Động</span>
            <div className="p-2 rounded-xl bg-sky-500/10 border border-sky-500/20 text-sky-400 group-hover:scale-110 transition-transform">
              <Server className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl lg:text-3xl font-black text-white tracking-tight">12</span>
            <span className="text-xs font-semibold text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2 py-0.5 rounded-md">
              / 14 Tổng cộng
            </span>
          </div>
        </div>

        {/* Workloads */}
        <div className="glass-card rounded-2xl p-4.5 flex flex-col justify-between group">
          <div className="flex justify-between items-start mb-2">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Tác Vụ Xử Lý</span>
            <div className="p-2 rounded-xl bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 group-hover:scale-110 transition-transform">
              <Layers className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl lg:text-3xl font-black text-white tracking-tight">1,492</span>
            <span className="text-xs font-bold text-emerald-400 flex items-center gap-0.5">
              ↑ 2.4%
            </span>
          </div>
        </div>

        {/* Global CPU */}
        <div className="glass-card rounded-2xl p-4.5 flex flex-col justify-between group">
          <div className="flex justify-between items-start mb-2">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">CPU Toàn Cục</span>
            <div className="p-2 rounded-xl bg-sky-500/10 border border-sky-500/20 text-sky-400 group-hover:scale-110 transition-transform">
              <Cpu className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-2xl lg:text-3xl font-black text-white tracking-tight">68%</span>
            <div className="w-24 h-8">
              <svg className="w-full h-full stroke-sky-400 fill-sky-400/15" viewBox="0 0 100 30">
                <path d="M0 25 L20 15 L40 20 L60 8 L80 12 L100 4 V30 H0 Z" stroke="none" />
                <path d="M0 25 L20 15 L40 20 L60 8 L80 12 L100 4" fill="none" strokeWidth="2.5" strokeLinecap="round" />
              </svg>
            </div>
          </div>
        </div>

        {/* Open Tickets */}
        <div 
          onClick={() => onSelectTab && onSelectTab('alerts')}
          className="rounded-2xl p-4.5 flex flex-col justify-between bg-gradient-to-br from-rose-950/40 to-slate-900/90 border border-rose-500/30 hover:border-rose-500/60 shadow-lg shadow-rose-950/20 transition-all cursor-pointer group"
        >
          <div className="flex justify-between items-start mb-2">
            <span className="text-[11px] font-bold text-rose-300 uppercase tracking-wider">Phiếu Sự Cố Đang Mở</span>
            <div className="p-2 rounded-xl bg-rose-500/15 border border-rose-500/30 text-rose-400 group-hover:scale-110 transition-transform">
              <Ticket className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl lg:text-3xl font-black text-rose-400 tracking-tight">3</span>
            <span className="text-xs font-bold text-rose-200 bg-rose-500/25 border border-rose-500/40 px-2 py-0.5 rounded-md">
              1 Nghiêm trọng
            </span>
          </div>
        </div>
      </div>

      {/* Main Digital Twin Interactive Bento Canvas */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        {/* Dynamic Digital Twin Viewport (Spans 8 cols) */}
        <div className="lg:col-span-8 glass-card rounded-2xl p-4 md:p-5 flex flex-col min-h-[520px]">
          <div className="flex justify-between items-center mb-3">
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base font-black text-white tracking-tight">
                  Mặt Cắt Chi Tiết Tủ Rack 42U
                </h2>
                <span className="px-2 py-0.5 rounded-md text-[10px] font-mono font-bold bg-sky-500/10 text-sky-400 border border-sky-500/20">
                  Zone 1-A
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-0.5">
                Sơ đồ mặt cắt kỹ thuật số các phiến blade máy chủ và cổng kết nối phần cứng thời gian thực
              </p>
            </div>
          </div>

          {/* 2D Elevation View */}
          <div className="flex-1 rounded-xl overflow-hidden">
            <RackElevationView
              racks={racks}
              selectedRackId={selectedRackId}
              selectedUnit={selectedUnit}
              onSelectRack={setSelectedRackId}
              onSelectUnit={handleUnitClick}
              viewMode={viewFilter}
            />
          </div>
        </div>

        {/* Node Inspection Panel (Spans 4 cols) */}
        <div className="lg:col-span-4 glass-card rounded-2xl p-5 flex flex-col justify-between border-l-4 border-l-sky-500">
          <div>
            {/* Header */}
            <div className="flex justify-between items-start mb-4">
              <div>
                <div className="text-[10px] font-extrabold text-sky-400 uppercase tracking-widest mb-1 flex items-center gap-1.5 font-mono">
                  <Activity className="w-3.5 h-3.5" />
                  Telemetry Inspector
                </div>
                <h3 className="text-lg md:text-xl font-black text-white tracking-tight">{selectedUnit.name}</h3>
                <p className="text-xs text-slate-400 mt-0.5">Model: {selectedUnit.model}</p>
              </div>
              <span className={`px-2.5 py-1 rounded-lg text-xs font-bold border ${
                selectedUnit.status === 'critical' ? 'bg-rose-500/20 text-rose-400 border-rose-500/30 animate-pulse' :
                selectedUnit.status === 'warning' ? 'bg-amber-500/20 text-amber-400 border-amber-500/30' :
                'bg-emerald-500/20 text-emerald-400 border-emerald-500/30'
              }`}>
                {selectedRack.name.split(' ')[0] || 'Rack'}
              </span>
            </div>

            {/* Alert / Status Banner */}
            {selectedUnit.temp > 80 && (
              <div className="p-3 bg-rose-950/40 border border-rose-500/30 rounded-xl mb-4 text-xs text-rose-200 flex items-start gap-2">
                <AlertTriangle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
                <div>
                  <div className="font-bold text-rose-300">Vượt Ngưỡng Nhiệt Độ Cho Phép</div>
                  <div className="text-[11px] text-slate-300 mt-0.5">
                    Nhiệt độ lõi ghi nhận ở mức <span className="font-bold text-rose-400">{selectedUnit.temp}°C</span> (&gt;80°C). Cần kích hoạt quạt tối đa hoặc tiếp nhận ticket sửa chữa.
                  </div>
                </div>
              </div>
            )}

            {restartMessage && (
              <div className="p-3 bg-sky-950/50 border border-sky-500/30 rounded-xl mb-4 text-xs text-sky-200 flex items-center gap-2 animate-in fade-in duration-200">
                <Check className="w-4 h-4 text-sky-400 shrink-0" />
                <span>{restartMessage}</span>
              </div>
            )}

            {/* Gauges Grid */}
            <div className="grid grid-cols-2 gap-3 mb-5">
              {/* CPU Gauge */}
              <div className="flex flex-col items-center justify-center p-3 bg-slate-900/80 rounded-xl border border-slate-800">
                <div className="relative w-16 h-16 flex items-center justify-center mb-1">
                  <svg className="w-full h-full transform -rotate-90" viewBox="0 0 36 36">
                    <path
                      className="text-slate-800"
                      d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="3.5"
                    />
                    <path
                      className={selectedUnit.cpu > 80 ? 'text-rose-500 stroke-current' : 'text-sky-400 stroke-current'}
                      d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                      fill="none"
                      strokeDasharray={`${selectedUnit.cpu}, 100`}
                      strokeWidth="3.5"
                      strokeLinecap="round"
                    />
                  </svg>
                  <span className="absolute text-xs font-bold text-white font-mono">{selectedUnit.cpu}%</span>
                </div>
                <span className="text-xs font-medium text-slate-400">Tải CPU</span>
              </div>

              {/* RAM Gauge */}
              <div className="flex flex-col items-center justify-center p-3 bg-slate-900/80 rounded-xl border border-slate-800">
                <div className="relative w-16 h-16 flex items-center justify-center mb-1">
                  <svg className="w-full h-full transform -rotate-90" viewBox="0 0 36 36">
                    <path
                      className="text-slate-800"
                      d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="3.5"
                    />
                    <path
                      className="text-indigo-400 stroke-current"
                      d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                      fill="none"
                      strokeDasharray={`${selectedUnit.ram}, 100`}
                      strokeWidth="3.5"
                      strokeLinecap="round"
                    />
                  </svg>
                  <span className="absolute text-xs font-bold text-white font-mono">{selectedUnit.ram}%</span>
                </div>
                <span className="text-xs font-medium text-slate-400">Bộ nhớ RAM</span>
              </div>

              {/* Thermal Gauge */}
              <div className="flex flex-col items-center justify-center p-3 bg-slate-900/80 rounded-xl border border-slate-800">
                <div className="relative w-16 h-16 flex items-center justify-center mb-1">
                  <svg className="w-full h-full transform -rotate-90" viewBox="0 0 36 36">
                    <path
                      className="text-slate-800"
                      d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="3.5"
                    />
                    <path
                      className={selectedUnit.temp > 80 ? 'text-rose-500 stroke-current' : 'text-emerald-400 stroke-current'}
                      d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                      fill="none"
                      strokeDasharray={`${Math.min(selectedUnit.temp, 100)}, 100`}
                      strokeWidth="3.5"
                      strokeLinecap="round"
                    />
                  </svg>
                  <span className="absolute text-xs font-bold text-white font-mono">{selectedUnit.temp}°C</span>
                </div>
                <span className="text-xs font-medium text-slate-400">Nhiệt Độ Lõi</span>
              </div>

              {/* Network / Disk */}
              <div className="flex flex-col items-center justify-center p-3 bg-slate-900/80 rounded-xl border border-slate-800">
                <div className="relative w-16 h-16 flex items-center justify-center mb-1">
                  <svg className="w-full h-full transform -rotate-90" viewBox="0 0 36 36">
                    <path
                      className="text-slate-800"
                      d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="3.5"
                    />
                    <path
                      className="text-emerald-400 stroke-current"
                      d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                      fill="none"
                      strokeDasharray={`${selectedUnit.disk}, 100`}
                      strokeWidth="3.5"
                      strokeLinecap="round"
                    />
                  </svg>
                  <span className="absolute text-xs font-bold text-white font-mono">{selectedUnit.disk}%</span>
                </div>
                <span className="text-xs font-medium text-slate-400">Ổ đĩa I/O</span>
              </div>
            </div>

            {/* Hardware Quick Actions */}
            <div className="grid grid-cols-2 gap-2 mb-4">
              <button
                onClick={handleToggleFanBoost}
                className={`py-2 px-2.5 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-all cursor-pointer border ${
                  fanBoostActive 
                    ? 'bg-amber-500/20 text-amber-300 border-amber-500/40 shadow-md shadow-amber-500/20' 
                    : 'bg-slate-900/80 text-slate-300 border-slate-800 hover:bg-slate-800'
                }`}
              >
                <Fan className={`w-3.5 h-3.5 ${fanBoostActive ? 'animate-spin text-amber-400' : ''}`} />
                <span>{fanBoostActive ? 'Quạt: 100% MAX' : 'Tăng Tốc Quạt'}</span>
              </button>

              {/* QR Code Ticket Trigger */}
              <button
                onClick={() => setIsTicketQRModalOpen(true)}
                className="py-2 px-2.5 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-all cursor-pointer border bg-emerald-500/10 text-emerald-400 border-emerald-500/30 hover:bg-emerald-500/20 shadow-md shadow-emerald-500/10 active:scale-95"
              >
                <QrCode className="w-3.5 h-3.5 text-emerald-400" />
                <span>Mã QR Sửa Chữa</span>
              </button>
            </div>
          </div>

          {/* Action Footer */}
          <div className="pt-3 border-t border-slate-800 flex gap-2">
            <button
              onClick={handleRestartNode}
              disabled={isRestarting}
              className="flex-1 py-2.5 px-3 bg-slate-800/80 hover:bg-slate-800 border border-slate-700/80 rounded-xl text-slate-200 text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-50 active:scale-95"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isRestarting ? 'animate-spin text-sky-400' : ''}`} />
              <span>{isRestarting ? 'Đang khởi động...' : 'Khởi Động Lại'}</span>
            </button>
            <button
              onClick={() => onSelectTab && onSelectTab('alerts')}
              className="flex-1 py-2.5 px-3 bg-gradient-to-r from-sky-500 to-blue-600 hover:from-sky-400 hover:to-blue-500 text-white rounded-xl text-xs font-bold transition-all shadow-md shadow-sky-500/20 flex items-center justify-center gap-1.5 cursor-pointer active:scale-95"
            >
              <FileText className="w-3.5 h-3.5" />
              <span>Nhật Ký Chi Tiết</span>
            </button>
          </div>
        </div>
      </div>

      {/* Ticket QR Modal */}
      {isTicketQRModalOpen && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-[#080b0e] border border-[#222c37] shadow-2xl w-full max-w-md overflow-hidden animate-in fade-in zoom-in-95 duration-150 font-mono text-white rounded-xl">
            {/* Header */}
            <div className="px-5 py-4 bg-[#11161b] border-b border-[#222c37] flex justify-between items-center">
              <div className="flex items-center gap-2">
                <QrCode className="w-5 h-5 text-emerald-400" />
                <div>
                  <h3 className="font-bold text-sm text-white font-mono uppercase">Mã QR Phiếu Sửa Chữa</h3>
                  <div className="text-[11px] text-slate-400">AR-IMMS Incident &amp; Repair Dispatch</div>
                </div>
              </div>
              <button 
                onClick={() => setIsTicketQRModalOpen(false)}
                className="p-1 text-slate-500 hover:text-white cursor-pointer transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Body */}
            <div className="p-6 flex flex-col items-center bg-[#0c1015]">
              {/* Sticker Template */}
              <div className="w-full border-2 border-dashed border-emerald-500/50 p-4 bg-[#11161b] flex flex-col items-center text-center shadow-xl mb-4 rounded-lg">
                <div className="w-full bg-emerald-500 text-[#080b0e] py-1 text-xs font-bold font-mono uppercase tracking-wider mb-3 rounded">
                  PHIẾU SỬA CHỮA / TICKET AR-IMMS
                </div>

                <div className="bg-white p-2.5 border border-slate-700 mb-3 rounded shadow-inner">
                  <img
                    src={qrImageUrl}
                    alt={`Mã QR Sửa Chữa ${selectedUnit.name}`}
                    className="w-40 h-40 object-contain"
                  />
                </div>

                <div className="font-bold text-base text-white font-mono">{selectedUnit.name}</div>
                <div className="text-xs font-mono text-[#38bdf8] font-bold mt-0.5">{selectedRack.name} • U{selectedUnit.u}</div>
                <div className="text-xs text-slate-400 mt-0.5">{selectedUnit.model}</div>

                <div className="mt-3 pt-2 border-t border-[#222c37] w-full flex justify-around text-xs font-mono">
                  <span className={`${selectedUnit.temp > 80 ? 'text-rose-400 font-bold' : 'text-emerald-400'}`}>
                    Nhiệt: {selectedUnit.temp}°C
                  </span>
                  <span className="text-sky-400">CPU: {selectedUnit.cpu}%</span>
                  <span className="text-indigo-400">RAM: {selectedUnit.ram}%</span>
                </div>
              </div>

              <div className="text-xs text-slate-300 text-center mb-5 leading-relaxed bg-[#11161b] p-3 rounded-lg border border-[#222c37] w-full">
                📱 <span className="font-bold text-white">Hướng dẫn:</span> Quét mã QR bằng điện thoại để kỹ thuật viên mở trực tiếp <span className="text-emerald-400 font-bold">Phiếu Xử Lý Sự Cố (Ticket)</span> trên Web App.
              </div>

              {/* Action Buttons */}
              <div className="flex flex-col gap-2 w-full">
                <button
                  onClick={() => {
                    setIsTicketQRModalOpen(false);
                    if (onSelectTab) {
                      onSelectTab('alerts');
                      const element = document.getElementById('modules');
                      if (element) {
                        element.scrollIntoView({ behavior: 'smooth' });
                      }
                    }
                  }}
                  className="w-full py-2.5 px-4 bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 text-white font-bold text-xs rounded-xl shadow-lg shadow-emerald-500/25 flex items-center justify-center gap-2 cursor-pointer transition-all active:scale-95"
                >
                  <Ticket className="w-4 h-4" />
                  <span>Mở Trực Tiếp Phiếu Sửa Chữa (Ticket)</span>
                </button>

                <button
                  onClick={() => {
                    navigator.clipboard.writeText(ticketDirectUrl);
                    setCopiedTicketUrl(true);
                    setTimeout(() => setCopiedTicketUrl(false), 2500);
                  }}
                  className="w-full py-2 px-4 bg-[#161d24] hover:bg-[#222c37] border border-[#222c37] text-slate-300 font-mono text-xs rounded-xl flex items-center justify-center gap-2 cursor-pointer transition-all"
                >
                  {copiedTicketUrl ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copiedTicketUrl ? '✓ Đã Sao Chép Liên Kết' : 'Sao Chép Link Ticket'}</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
