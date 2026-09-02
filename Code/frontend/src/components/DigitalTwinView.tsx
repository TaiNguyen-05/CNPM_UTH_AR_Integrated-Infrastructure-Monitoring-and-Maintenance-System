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
  X
} from 'lucide-react';
import { Rack, RackUnit } from '../types';

interface DigitalTwinViewProps {
  racks: Rack[];
  onSelectTab: (tab: string) => void;
  onOpenAROverlay: () => void;
}

export const DigitalTwinView: React.FC<DigitalTwinViewProps> = ({
  racks,
  onSelectTab,
  onOpenAROverlay
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

  const [zoomLevel, setZoomLevel] = useState<number>(1);
  const [viewFilter, setViewFilter] = useState<'all' | 'thermal' | 'workload'>('all');
  const [isRestarting, setIsRestarting] = useState<boolean>(false);
  const [restartMessage, setRestartMessage] = useState<string | null>(null);

  const selectedRack = racks.find(r => r.id === selectedRackId) || racks[1];

  const handleRestartNode = () => {
    setIsRestarting(true);
    setRestartMessage('Đang thực hiện khởi động lại IPMI ACPI trên A2 - Unit 03...');
    setTimeout(() => {
      setSelectedUnit(prev => ({
        ...prev,
        status: 'healthy',
        temp: 42,
        cpu: 18,
        ram: 34
      }));
      setIsRestarting(false);
      setRestartMessage('Node đã khởi động lại thành công. Nhiệt độ ổn định ở 42°C.');
      setTimeout(() => setRestartMessage(null), 4000);
    }, 2000);
  };

  const handleUnitClick = (unit: RackUnit, rack: Rack) => {
    setSelectedRackId(rack.id);
    setSelectedUnit(unit);
  };

  return (
    <div className="p-4 md:p-6 max-w-[1600px] mx-auto flex flex-col gap-6">
      {/* Top Action Pill Bar */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
        <div className="flex items-center gap-2">
          <button
            onClick={onOpenAROverlay}
            className="px-4 py-2 rounded-full bg-gradient-to-r from-[#0058be] to-[#2170e4] text-white text-xs font-bold shadow-sm flex items-center gap-2 hover:opacity-90 transition-all active:scale-95 cursor-pointer"
          >
            <Camera className="w-4 h-4" />
            Kích hoạt Lớp phủ AR
          </button>

          <div className="relative">
            <select
              value={viewFilter}
              onChange={(e) => setViewFilter(e.target.value as any)}
              className="px-3.5 py-2 rounded-full bg-white border border-[#c2c6d6] text-[#424754] text-xs font-bold hover:bg-[#f2f4f6] transition-colors appearance-none pr-8 cursor-pointer outline-none focus:border-[#0058be]"
            >
              <option value="all">Bộ lọc: Tất cả chế độ xem</option>
              <option value="thermal">Bộ lọc: Bản đồ nhiệt (Heatmap)</option>
              <option value="workload">Bộ lọc: Tải công việc cao (&gt;70%)</option>
            </select>
            <Sliders className="w-3.5 h-3.5 text-[#727785] absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
          </div>
        </div>

        <div className="flex items-center gap-2 text-xs font-semibold text-[#424754] bg-[#ffffff] border border-[#c2c6d6] px-3.5 py-1.5 rounded-full shadow-xs">
          <span className="w-2.5 h-2.5 rounded-full bg-[#00855b] animate-pulse" />
          <span>Lưới Trung tâm Dữ liệu Alpha: Trực tuyến</span>
        </div>
      </div>

      {/* KPI Section */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Active Racks */}
        <div className="bg-white rounded-xl border border-[#c2c6d6] p-4 shadow-xs flex flex-col justify-between hover:shadow-md transition-shadow">
          <div className="flex justify-between items-start mb-2">
            <span className="text-xs font-bold text-[#424754] uppercase tracking-wider">Tủ Rack Hoạt Động</span>
            <Server className="w-5 h-5 text-[#727785]" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl lg:text-3xl font-bold text-[#191c1e]">12</span>
            <span className="text-xs font-medium text-[#006947] bg-[#d0e1fb]/60 px-2 py-0.5 rounded">/ 14 Tổng cộng</span>
          </div>
        </div>

        {/* Workloads */}
        <div className="bg-white rounded-xl border border-[#c2c6d6] p-4 shadow-xs flex flex-col justify-between hover:shadow-md transition-shadow">
          <div className="flex justify-between items-start mb-2">
            <span className="text-xs font-bold text-[#424754] uppercase tracking-wider">Tác Vụ Xử Lý</span>
            <Layers className="w-5 h-5 text-[#727785]" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl lg:text-3xl font-bold text-[#191c1e]">1,492</span>
            <span className="text-xs font-bold text-[#00855b] flex items-center">↑ 2.4%</span>
          </div>
        </div>

        {/* Global CPU */}
        <div className="bg-white rounded-xl border border-[#c2c6d6] p-4 shadow-xs flex flex-col justify-between hover:shadow-md transition-shadow">
          <div className="flex justify-between items-start mb-2">
            <span className="text-xs font-bold text-[#424754] uppercase tracking-wider">CPU Toàn Cục</span>
            <Cpu className="w-5 h-5 text-[#727785]" />
          </div>
          <div className="flex items-center justify-between">
            <span className="text-2xl lg:text-3xl font-bold text-[#191c1e]">68%</span>
            <div className="w-20 h-7">
              <svg className="w-full h-full stroke-[#0058be] fill-[#0058be]/10" viewBox="0 0 100 30">
                <path d="M0 25 L20 15 L40 20 L60 5 L80 10 L100 2 V30 H0 Z" stroke="none" />
                <path d="M0 25 L20 15 L40 20 L60 5 L80 10 L100 2" fill="none" strokeWidth="2.5" />
              </svg>
            </div>
          </div>
        </div>

        {/* Open Tickets */}
        <div 
          onClick={() => onSelectTab('alerts')}
          className="bg-white rounded-xl border border-[#ffdad6] p-4 shadow-xs flex flex-col justify-between bg-[#ffdad6]/20 hover:bg-[#ffdad6]/30 transition-all cursor-pointer group"
        >
          <div className="flex justify-between items-start mb-2">
            <span className="text-xs font-bold text-[#ba1a1a] uppercase tracking-wider">Phiếu Sự Cố Đang Mở</span>
            <Ticket className="w-5 h-5 text-[#ba1a1a]" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl lg:text-3xl font-bold text-[#ba1a1a]">3</span>
            <span className="text-xs font-semibold text-[#93000a] bg-[#ffdad6] px-2 py-0.5 rounded">1 Nghiêm trọng</span>
          </div>
        </div>
      </div>

      {/* Main Digital Twin Interactive Bento Canvas */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Datacenter Floor Alpha 2D/3D Interactive Canvas (Spans 8 cols) */}
        <div className="lg:col-span-8 bg-white rounded-xl border border-[#c2c6d6] shadow-xs p-4 flex flex-col min-h-[480px] relative overflow-hidden">
          <div className="flex justify-between items-center mb-4 z-10">
            <div>
              <h2 className="text-lg font-bold text-[#191c1e]">Mặt Bằng Trung Tâm Dữ Liệu Alpha</h2>
              <p className="text-xs text-[#727785]">Sơ đồ không gian 2D tương tác với neo cảm biến thời gian thực</p>
            </div>
            <div className="flex items-center gap-1 bg-[#f2f4f6] rounded-lg p-1 border border-[#c2c6d6]">
              <button 
                onClick={() => setZoomLevel(prev => Math.min(prev + 0.15, 1.4))}
                title="Phóng to"
                className="p-1 rounded hover:bg-white text-[#424754] transition-colors cursor-pointer"
              >
                <ZoomIn className="w-4 h-4" />
              </button>
              <button 
                onClick={() => setZoomLevel(prev => Math.max(prev - 0.15, 0.75))}
                title="Thu nhỏ"
                className="p-1 rounded hover:bg-white text-[#424754] transition-colors cursor-pointer"
              >
                <ZoomOut className="w-4 h-4" />
              </button>
              <button 
                onClick={() => setZoomLevel(1)}
                title="Đặt lại mức thu phóng"
                className="p-1 rounded hover:bg-white text-[#424754] transition-colors cursor-pointer"
              >
                <RotateCcw className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Abstract Grid Canvas */}
          <div className="flex-1 bg-[#f8fafc] border border-[#e0e3e5] rounded-lg relative overflow-hidden flex items-center justify-center p-6 min-h-[380px]">
            {/* Grid Dots */}
            <div 
              className="absolute inset-0 opacity-40" 
              style={{
                backgroundImage: 'radial-gradient(#727785 1px, transparent 1px)',
                backgroundSize: '24px 24px'
              }}
            />

            {/* Transformable Floor Plan */}
            <div 
              className="relative z-10 w-full max-w-2xl flex items-center justify-around gap-6 transition-transform duration-200"
              style={{ transform: `scale(${zoomLevel})` }}
            >
              {/* Rack A1 */}
              <div 
                onClick={() => {
                  setSelectedRackId('rack-a1');
                  setSelectedUnit(racks[0].units[3]);
                }}
                className={`flex flex-col items-center gap-2 cursor-pointer group transition-transform ${selectedRackId === 'rack-a1' ? 'scale-105' : ''}`}
              >
                <span className={`text-xs font-bold ${selectedRackId === 'rack-a1' ? 'text-[#0058be]' : 'text-[#424754] group-hover:text-[#0058be]'}`}>
                  A1
                </span>
                <div className={`
                  w-28 h-64 bg-white border-2 rounded-lg shadow-sm relative flex flex-col justify-end p-1.5 transition-all
                  ${selectedRackId === 'rack-a1' ? 'border-[#0058be] ring-4 ring-[#0058be]/10' : 'border-[#c2c6d6] hover:border-[#0058be]'}
                `}>
                  <div className="absolute top-2 right-2 w-2 h-2 rounded-full bg-[#00855b]" />
                  {/* Units */}
                  {racks[0].units.map((unit) => (
                    <div
                      key={unit.u}
                      onClick={(e) => {
                        e.stopPropagation();
                        handleUnitClick(unit, racks[0]);
                      }}
                      className={`
                        w-full rounded-xs mb-1 flex items-center justify-between px-1.5 text-[10px] font-mono transition-all
                        ${unit.u >= 4 ? 'h-7' : 'h-5'}
                        ${selectedUnit.name === unit.name ? 'bg-[#d0e1fb] border border-[#0058be]' : 'bg-[#e6e8ea] hover:bg-[#d0e1fb]/60'}
                      `}
                    >
                      <span className="truncate">{unit.name}</span>
                      <div className="w-1.5 h-1.5 rounded-full bg-[#00855b]" />
                    </div>
                  ))}
                </div>
              </div>

              {/* Rack A2 (Selected/Active with warning) */}
              <div 
                onClick={() => {
                  setSelectedRackId('rack-a2');
                  setSelectedUnit(racks[1].units[2]);
                }}
                className="flex flex-col items-center gap-2 cursor-pointer relative"
              >
                <span className="text-xs font-bold text-[#0058be] flex items-center gap-1">
                  A2 <span className="text-[10px] text-[#ba1a1a] bg-[#ffdad6] px-1 rounded">Cảnh báo</span>
                </span>
                <div className="w-32 h-72 bg-white border-2 border-[#0058be] rounded-lg shadow-md relative flex flex-col justify-end p-2 z-20 ring-4 ring-[#0058be]/15">
                  <div className="absolute -top-3 -right-3 w-6 h-6 bg-[#0058be] text-white rounded-full flex items-center justify-center text-[10px] shadow">
                    <Search className="w-3.5 h-3.5" />
                  </div>
                  <div className="absolute top-2 right-2 w-2.5 h-2.5 rounded-full bg-[#ba1a1a] pulse-critical" />

                  {/* Units */}
                  {racks[1].units.map((unit) => {
                    const isSelected = selectedUnit.name === unit.name;
                    const isCrit = unit.status === 'critical';
                    return (
                      <div
                        key={unit.u}
                        onClick={(e) => {
                          e.stopPropagation();
                          handleUnitClick(unit, racks[1]);
                        }}
                        className={`
                          w-full rounded-xs mb-1 flex items-center justify-between px-1.5 text-[10px] font-mono transition-all
                          ${unit.u === 3 ? 'h-8' : unit.u >= 4 ? 'h-6' : 'h-4'}
                          ${isSelected 
                            ? 'bg-[#d0e1fb] border-2 border-[#0058be] text-[#004395] font-bold' 
                            : isCrit 
                            ? 'bg-[#ffdad6] text-[#93000a] border border-[#ba1a1a]' 
                            : 'bg-[#e6e8ea] hover:bg-[#d0e1fb]/60 text-[#191c1e]'}
                        `}
                      >
                        <span className="truncate">{unit.name}</span>
                        <div className={`w-1.5 h-1.5 rounded-full ${isCrit ? 'bg-[#ba1a1a] pulse-critical' : 'bg-[#00855b]'}`} />
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Rack B1 */}
              <div 
                onClick={() => {
                  setSelectedRackId('rack-b1');
                  setSelectedUnit(racks[2].units[0]);
                }}
                className={`flex flex-col items-center gap-2 cursor-pointer group mt-6 transition-transform ${selectedRackId === 'rack-b1' ? 'scale-105' : ''}`}
              >
                <span className={`text-xs font-bold ${selectedRackId === 'rack-b1' ? 'text-[#0058be]' : 'text-[#424754] group-hover:text-[#0058be]'}`}>
                  B1
                </span>
                <div className={`
                  w-28 h-56 bg-white border-2 rounded-lg shadow-sm relative flex flex-col justify-end p-1.5 transition-all
                  ${selectedRackId === 'rack-b1' ? 'border-[#0058be] ring-4 ring-[#0058be]/10' : 'border-[#c2c6d6] hover:border-[#0058be]'}
                `}>
                  <div className="absolute top-2 right-2 w-2 h-2 rounded-full bg-[#00855b]" />
                  {/* Units */}
                  {racks[2].units.map((unit) => (
                    <div
                      key={unit.u}
                      onClick={(e) => {
                        e.stopPropagation();
                        handleUnitClick(unit, racks[2]);
                      }}
                      className={`
                        w-full rounded-xs mb-1 flex items-center justify-between px-1.5 text-[10px] font-mono transition-all
                        ${unit.u >= 3 ? 'h-8' : 'h-5'}
                        ${selectedUnit.name === unit.name ? 'bg-[#d0e1fb] border border-[#0058be]' : 'bg-[#e6e8ea] hover:bg-[#d0e1fb]/60'}
                      `}
                    >
                      <span className="truncate">{unit.name}</span>
                      <div className="w-1.5 h-1.5 rounded-full bg-[#00855b]" />
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Node Inspection Panel (Spans 4 cols) */}
        <div className="lg:col-span-4 bg-white rounded-xl border-l-4 border-l-[#0058be] border border-[#c2c6d6] shadow-xs p-5 flex flex-col justify-between relative">
          <div>
            <div className="flex justify-between items-start mb-4">
              <div>
                <div className="text-xs font-bold text-[#0058be] uppercase tracking-wider mb-1">
                  Chi Tiết Node Máy Chủ
                </div>
                <h3 className="text-xl font-black text-[#191c1e]">{selectedUnit.name}</h3>
                <p className="text-xs text-[#727785] mt-0.5">Model: {selectedUnit.model}</p>
              </div>
              <span className={`px-2 py-1 rounded text-xs font-bold ${
                selectedUnit.status === 'critical' ? 'bg-[#ffdad6] text-[#93000a]' : 'bg-[#d0e1fb] text-[#004395]'
              }`}>
                Tủ Rack {selectedRack.name}
              </span>
            </div>

            {/* Thermal Alert Banner if critical */}
            {selectedUnit.status === 'critical' ? (
              <div className="bg-[#ffdad6]/40 border border-[#ffdad6] rounded-lg p-3.5 mb-5 flex items-start gap-3">
                <AlertTriangle className="w-5 h-5 text-[#ba1a1a] shrink-0 mt-0.5" />
                <div>
                  <span className="text-xs font-bold text-[#ba1a1a] block">Vượt Ngưỡng Nhiệt Độ Cho Phép</span>
                  <span className="text-xs text-[#424754]">Nhiệt độ lõi ghi nhận ở mức {selectedUnit.temp}°C trong &gt; 5 phút. Quạt tản nhiệt bị nghẽn.</span>
                </div>
              </div>
            ) : (
              <div className="bg-[#f5fff6] border border-[#00855b]/20 rounded-lg p-3 mb-5 flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-[#00855b]" />
                <span className="text-xs font-semibold text-[#006947]">Đang hoạt động trong ngưỡng an toàn ({selectedUnit.temp}°C).</span>
              </div>
            )}

            {/* Restart notice banner if executing */}
            {restartMessage && (
              <div className="mb-4 p-3 bg-blue-50 border border-blue-200 text-blue-900 rounded-lg text-xs animate-in fade-in">
                {restartMessage}
              </div>
            )}

            {/* Circular KPI Gauges */}
            <div className="grid grid-cols-2 gap-3 mb-6">
              {/* CPU Gauge */}
              <div className="flex flex-col items-center justify-center p-3 bg-[#f8fafc] rounded-lg border border-[#e0e3e5]">
                <div className="relative w-16 h-16 flex items-center justify-center mb-1.5">
                  <svg className="w-full h-full transform -rotate-90" viewBox="0 0 36 36">
                    <path
                      className="text-[#e0e3e5]"
                      d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="3.5"
                    />
                    <path
                      className={selectedUnit.cpu > 80 ? 'text-[#ba1a1a] stroke-current' : 'text-[#0058be] stroke-current'}
                      d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                      fill="none"
                      strokeDasharray={`${selectedUnit.cpu}, 100`}
                      strokeWidth="3.5"
                      strokeLinecap="round"
                    />
                  </svg>
                  <span className="absolute text-xs font-bold text-[#191c1e]">{selectedUnit.cpu}%</span>
                </div>
                <span className="text-xs font-semibold text-[#727785]">Tải CPU</span>
              </div>

              {/* RAM Gauge */}
              <div className="flex flex-col items-center justify-center p-3 bg-[#f8fafc] rounded-lg border border-[#e0e3e5]">
                <div className="relative w-16 h-16 flex items-center justify-center mb-1.5">
                  <svg className="w-full h-full transform -rotate-90" viewBox="0 0 36 36">
                    <path
                      className="text-[#e0e3e5]"
                      d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="3.5"
                    />
                    <path
                      className="text-[#0058be] stroke-current"
                      d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                      fill="none"
                      strokeDasharray={`${selectedUnit.ram}, 100`}
                      strokeWidth="3.5"
                      strokeLinecap="round"
                    />
                  </svg>
                  <span className="absolute text-xs font-bold text-[#191c1e]">{selectedUnit.ram}%</span>
                </div>
                <span className="text-xs font-semibold text-[#727785]">Bộ nhớ RAM</span>
              </div>

              {/* Disk Gauge */}
              <div className="flex flex-col items-center justify-center p-3 bg-[#f8fafc] rounded-lg border border-[#e0e3e5]">
                <div className="relative w-16 h-16 flex items-center justify-center mb-1.5">
                  <svg className="w-full h-full transform -rotate-90" viewBox="0 0 36 36">
                    <path
                      className="text-[#e0e3e5]"
                      d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="3.5"
                    />
                    <path
                      className="text-[#00855b] stroke-current"
                      d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                      fill="none"
                      strokeDasharray={`${selectedUnit.disk}, 100`}
                      strokeWidth="3.5"
                      strokeLinecap="round"
                    />
                  </svg>
                  <span className="absolute text-xs font-bold text-[#191c1e]">{selectedUnit.disk}%</span>
                </div>
                <span className="text-xs font-semibold text-[#727785]">Ổ đĩa I/O</span>
              </div>

              {/* Net Gauge */}
              <div className="flex flex-col items-center justify-center p-3 bg-[#f8fafc] rounded-lg border border-[#e0e3e5]">
                <div className="relative w-16 h-16 flex items-center justify-center mb-1.5">
                  <svg className="w-full h-full transform -rotate-90" viewBox="0 0 36 36">
                    <path
                      className="text-[#e0e3e5]"
                      d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="3.5"
                    />
                    <path
                      className="text-[#00855b] stroke-current"
                      d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                      fill="none"
                      strokeDasharray={`${selectedUnit.net}, 100`}
                      strokeWidth="3.5"
                      strokeLinecap="round"
                    />
                  </svg>
                  <span className="absolute text-xs font-bold text-[#191c1e]">{selectedUnit.net}%</span>
                </div>
                <span className="text-xs font-semibold text-[#727785]">Băng thông Mạng</span>
              </div>
            </div>
          </div>

          {/* Action Footer */}
          <div className="pt-4 border-t border-[#c2c6d6] flex gap-3">
            <button
              onClick={handleRestartNode}
              disabled={isRestarting}
              className="flex-1 py-2.5 px-3 bg-white border border-[#c2c6d6] rounded-lg text-[#191c1e] text-xs font-bold hover:bg-[#f2f4f6] transition-colors flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-50"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isRestarting ? 'animate-spin text-[#0058be]' : ''}`} />
              {isRestarting ? 'Đang khởi động...' : 'Khởi Động Lại Node'}
            </button>
            <button
              onClick={() => onSelectTab('telemetry')}
              className="flex-1 py-2.5 px-3 bg-[#0058be] text-white rounded-lg text-xs font-bold hover:bg-[#2170e4] transition-colors shadow-xs flex items-center justify-center gap-1.5 cursor-pointer"
            >
              <FileText className="w-3.5 h-3.5" />
              Xem Toàn Bộ Nhật Ký
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
