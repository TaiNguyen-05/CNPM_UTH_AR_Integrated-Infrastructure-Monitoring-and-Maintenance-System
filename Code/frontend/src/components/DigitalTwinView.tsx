import React, { useState } from 'react';
import { 
  Server, 
  Layers, 
  Cpu, 
  Ticket, 
  ZoomIn, 
  ZoomOut, 
  RotateCcw, 
  Search, 
  AlertTriangle, 
  CheckCircle2, 
  Eye, 
  FileText, 
  Sliders, 
  RefreshCw,
  Sparkles,
  Camera,
  X,
  Flame,
  Activity,
  ShieldCheck,
  HardDrive,
  Wifi,
  CornerDownRight,
  Box,
  Radio,
  Zap,
  Fan,
  Compass
} from 'lucide-react';
import { Rack, RackUnit } from '../types';
import { Datacenter3DView } from './Datacenter3DView';
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

  const [activeTabMode, setActiveTabMode] = useState<'3d' | 'elevation'>('3d');
  const [viewFilter, setViewFilter] = useState<'normal' | 'thermal' | 'workload'>('normal');
  const [isRestarting, setIsRestarting] = useState<boolean>(false);
  const [fanBoostActive, setFanBoostActive] = useState<boolean>(false);
  const [beaconActive, setBeaconActive] = useState<boolean>(false);
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

  const handleToggleBeacon = () => {
    setBeaconActive(prev => !prev);
  };

  const handleUnitClick = (unit: RackUnit, rack: Rack) => {
    setSelectedRackId(rack.id);
    setSelectedUnit(unit);
  };

  return (
    <div className="w-full flex flex-col gap-6 text-slate-100">
      {/* Section Header & View Controls Bar */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 pb-2 border-b border-[#222c37]">
        <div>
          <span className="block text-xs uppercase tracking-widest text-[#ffb03a] font-mono mb-1">
            Environment Specification // Zone Alpha
          </span>
          <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-white">
            Datacenter 3D Digital Twin
          </h2>
        </div>

        <div className="flex items-center gap-3 flex-wrap">
          {/* Mode Switcher: 3D Twin vs 2D Elevation */}
          <div className="flex items-center bg-[#11161b] p-1 border border-[#222c37]">
            <button
              onClick={() => setActiveTabMode('3d')}
              className={`px-3 py-1.5 text-xs font-mono font-bold uppercase tracking-wider transition-all cursor-pointer flex items-center gap-1.5 ${
                activeTabMode === '3d'
                  ? 'bg-[#38bdf8] text-[#080b0e]'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <Compass className="w-3.5 h-3.5" />
              <span>3D Matrix</span>
            </button>
            <button
              onClick={() => setActiveTabMode('elevation')}
              className={`px-3 py-1.5 text-xs font-mono font-bold uppercase tracking-wider transition-all cursor-pointer flex items-center gap-1.5 ${
                activeTabMode === 'elevation'
                  ? 'bg-[#38bdf8] text-[#080b0e]'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <Server className="w-3.5 h-3.5" />
              <span>42U Chassis</span>
            </button>
          </div>

          {/* Filter Dropdown */}
          <div className="relative">
            <select
              value={viewFilter}
              onChange={(e) => setViewFilter(e.target.value as any)}
              className="px-3.5 py-1.5 bg-[#11161b] border border-[#222c37] text-slate-300 font-mono text-xs appearance-none pr-8 cursor-pointer outline-none focus:border-[#38bdf8]"
            >
              <option value="normal">VIEW: DEFAULT</option>
              <option value="thermal">VIEW: HEATMAP (THERMAL)</option>
              <option value="workload">VIEW: HIGH LOAD (&gt;70%)</option>
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
          onClick={() => onSelectTab('alerts')}
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
                  {activeTabMode === '3d' ? 'Không Gian Số 3D (Datacenter Digital Twin)' : 'Mặt Cắt Chi Tiết Tủ Rack 42U'}
                </h2>
                <span className="px-2 py-0.5 rounded-md text-[10px] font-mono font-bold bg-sky-500/10 text-sky-400 border border-sky-500/20">
                  Zone 1-A
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-0.5">
                {activeTabMode === '3d' 
                  ? 'Mô hình không gian tương tác 360° với luồng telemetry cảm biến thời gian thực' 
                  : 'Sơ đồ mặt cắt kỹ thuật số các phiến blade máy chủ và cổng kết nối phần cứng'}
              </p>
            </div>
          </div>

          {/* Dynamic Component Render (3D or Elevation) */}
          <div className="flex-1 rounded-xl overflow-hidden">
            {activeTabMode === '3d' ? (
              <Datacenter3DView
                racks={racks}
                selectedRackId={selectedRackId}
                selectedUnit={selectedUnit}
                onSelectRack={setSelectedRackId}
                onSelectUnit={handleUnitClick}
                viewMode={viewFilter}
              />
            ) : (
              <RackElevationView
                racks={racks}
                selectedRackId={selectedRackId}
                selectedUnit={selectedUnit}
                onSelectRack={setSelectedRackId}
                onSelectUnit={handleUnitClick}
                viewMode={viewFilter}
              />
            )}
          </div>
        </div>

        {/* Node Inspection Panel (Spans 4 cols) */}
        <div className="lg:col-span-4 glass-card rounded-2xl p-5 flex flex-col justify-between border-l-4 border-l-sky-500">
          <div>
            {/* Header */}
            <div className="flex justify-between items-start mb-4">
              <div>
                <div className="text-[10px] font-extrabold text-sky-400 uppercase tracking-widest mb-1 flex items-center gap-1.5">
                  <Activity className="w-3.5 h-3.5" />
                  Telemetry Inspector
                </div>
                <h3 className="text-lg md:text-xl font-black text-white tracking-tight">{selectedUnit.name}</h3>
                <p className="text-xs text-slate-400 mt-0.5">Model: {selectedUnit.model}</p>
              </div>
              <span className={`px-2.5 py-1 rounded-lg text-xs font-bold border ${
                selectedUnit.status === 'critical' 
                  ? 'bg-rose-500/20 text-rose-300 border-rose-500/30' 
                  : 'bg-sky-500/20 text-sky-300 border-sky-500/30'
              }`}>
                {selectedRack.name}
              </span>
            </div>

            {/* Thermal Alert Banner if critical */}
            {selectedUnit.status === 'critical' ? (
              <div className="bg-rose-950/40 border border-rose-500/40 rounded-xl p-3.5 mb-4 flex items-start gap-3 shadow-inner">
                <AlertTriangle className="w-5 h-5 text-rose-400 shrink-0 mt-0.5" />
                <div>
                  <span className="text-xs font-bold text-rose-300 block">Vượt Ngưỡng Nhiệt Độ Cho Phép</span>
                  <span className="text-xs text-slate-300">
                    Nhiệt độ lõi ghi nhận ở mức <strong className="text-rose-400">{selectedUnit.temp}°C</strong> (&gt;80°C). Cần kích hoạt quạt tối đa hoặc tiếp nhận ticket.
                  </span>
                </div>
              </div>
            ) : (
              <div className="bg-emerald-950/30 border border-emerald-500/30 rounded-xl p-3 mb-4 flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                <span className="text-xs font-semibold text-emerald-300">
                  Đang hoạt động trong ngưỡng an toàn ({selectedUnit.temp}°C).
                </span>
              </div>
            )}

            {/* Live Message feedback */}
            {restartMessage && (
              <div className="mb-4 p-3 bg-sky-950/70 border border-sky-500/40 text-sky-200 rounded-xl text-xs animate-in fade-in">
                {restartMessage}
              </div>
            )}

            {/* Circular KPI Gauges */}
            <div className="grid grid-cols-2 gap-3 mb-4">
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
                      className="text-sky-400 stroke-current"
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

              <button
                onClick={handleToggleBeacon}
                className={`py-2 px-2.5 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-all cursor-pointer border ${
                  beaconActive 
                    ? 'bg-sky-500/20 text-sky-300 border-sky-500/40 shadow-md shadow-sky-500/20' 
                    : 'bg-slate-900/80 text-slate-300 border-slate-800 hover:bg-slate-800'
                }`}
              >
                <Radio className={`w-3.5 h-3.5 ${beaconActive ? 'animate-pulse text-sky-400' : ''}`} />
                <span>{beaconActive ? 'AR Beacon: BẬT' : 'Đèn Định Vị AR'}</span>
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
              onClick={() => onSelectTab('telemetry')}
              className="flex-1 py-2.5 px-3 bg-gradient-to-r from-sky-500 to-blue-600 hover:from-sky-400 hover:to-blue-500 text-white rounded-xl text-xs font-bold transition-all shadow-md shadow-sky-500/20 flex items-center justify-center gap-1.5 cursor-pointer active:scale-95"
            >
              <FileText className="w-3.5 h-3.5" />
              <span>Nhật Ký Chi Tiết</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
