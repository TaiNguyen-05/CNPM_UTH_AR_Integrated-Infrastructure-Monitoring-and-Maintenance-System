import React, { useState, useMemo } from 'react';
import { 
  TrendingUp, 
  Zap, 
  BarChart3, 
  Download, 
  Calendar, 
  Filter, 
  Server, 
  Layers, 
  CheckCircle2, 
  AlertCircle 
} from 'lucide-react';
import { Rack, AssetItem } from '../types';
import { UI_STYLES, cn } from '../styles/theme';

interface AnalyticsViewProps {
  racks: Rack[];
  assets: AssetItem[];
}

export const AnalyticsView: React.FC<AnalyticsViewProps> = ({ racks, assets }) => {
  const [timeRange, setTimeRange] = useState<'24h' | '7d' | '30d'>('24h');
  const [selectedRackId, setSelectedRackId] = useState<string>('all');

  // Calculate dynamic capacity metrics based on live racks and assets
  const totalSlots = racks.length * 42;
  const totalOccupiedUnits = useMemo(() => {
    if (assets && assets.length > 0) {
      return assets.length;
    }
    return racks.reduce((acc, rack) => acc + (rack.units?.length || 0), 0);
  }, [racks, assets]);

  const spaceUtilizationPercent = totalSlots > 0 ? ((totalOccupiedUnits / totalSlots) * 100).toFixed(1) : '0';

  // Calculate total IT power draw in kW dynamically from live racks & assets
  const itPowerDrawKw = useMemo(() => {
    // Sum power from all registered hardware assets
    const assetPowerSumKw = assets.reduce((acc, asset) => {
      const match = asset.powerDraw?.match(/(\d+)/);
      const watts = match ? parseInt(match[0], 10) : 450;
      return acc + watts / 1000;
    }, 0);

    // If assets exist, use assetPowerSum + rack base switches/PDU (0.8 kW per rack)
    if (assets.length > 0) {
      const baseRackOverhead = racks.length * 0.8;
      return Number((assetPowerSumKw + baseRackOverhead).toFixed(2));
    }

    const fromRacks = racks.reduce((acc, r) => acc + (r.powerDrawKw || 4.2), 0);
    return Number(fromRacks.toFixed(2));
  }, [racks, assets]);

  // Cooling & infrastructure power overhead (~18% of IT load)
  const coolingPowerKw = Number((itPowerDrawKw * 0.18).toFixed(2));
  const totalFacilityPowerKw = Number((itPowerDrawKw + coolingPowerKw).toFixed(2));
  
  // Power Usage Effectiveness (PUE) = Total Facility Power / IT Equipment Power
  const currentPUE = itPowerDrawKw > 0 ? (totalFacilityPowerKw / itPowerDrawKw).toFixed(2) : '1.18';

  // Historical PUE data points based on time range
  const trendData = useMemo(() => {
    if (timeRange === '24h') {
      return [
        { time: '00:00', pue: 1.19, itKw: 11.2, totalKw: 13.3 },
        { time: '04:00', pue: 1.17, itKw: 10.8, totalKw: 12.6 },
        { time: '08:00', pue: 1.21, itKw: 13.5, totalKw: 16.3 },
        { time: '12:00', pue: 1.23, itKw: 14.8, totalKw: 18.2 },
        { time: '16:00', pue: 1.20, itKw: 14.2, totalKw: 17.0 },
        { time: '20:00', pue: 1.18, itKw: 12.6, totalKw: 14.8 },
        { time: 'Hiện tại', pue: Number(currentPUE), itKw: itPowerDrawKw, totalKw: totalFacilityPowerKw }
      ];
    } else if (timeRange === '7d') {
      return [
        { time: 'T2', pue: 1.18, itKw: 12.5, totalKw: 14.7 },
        { time: 'T3', pue: 1.19, itKw: 13.1, totalKw: 15.6 },
        { time: 'T4', pue: 1.22, itKw: 14.0, totalKw: 17.1 },
        { time: 'T5', pue: 1.20, itKw: 13.8, totalKw: 16.5 },
        { time: 'T6', pue: 1.21, itKw: 14.2, totalKw: 17.2 },
        { time: 'T7', pue: 1.17, itKw: 11.5, totalKw: 13.4 },
        { time: 'CN', pue: Number(currentPUE), itKw: itPowerDrawKw, totalKw: totalFacilityPowerKw }
      ];
    } else {
      return [
        { time: 'Tuần 1', pue: 1.19, itKw: 12.8, totalKw: 15.2 },
        { time: 'Tuần 2', pue: 1.21, itKw: 13.5, totalKw: 16.3 },
        { time: 'Tuần 3', pue: 1.18, itKw: 13.0, totalKw: 15.3 },
        { time: 'Tuần 4', pue: Number(currentPUE), itKw: itPowerDrawKw, totalKw: totalFacilityPowerKw }
      ];
    }
  }, [timeRange, currentPUE, itPowerDrawKw, totalFacilityPowerKw]);

  // Export CSV Handler
  const handleExportCSV = () => {
    const headers = ['Moc Thoi Gian', 'Chi So PUE', 'Cong Suat IT (kW)', 'Tong Cong Suat (kW)', 'Ghi Chu'];
    const rows = trendData.map(d => [
      d.time,
      d.pue.toFixed(2),
      d.itKw.toFixed(2),
      d.totalKw.toFixed(2),
      `Trang thai van hanh on dinh`
    ]);

    const rackRows = racks.map(r => [
      `Rack ${r.name}`,
      `N/A`,
      `${r.powerDrawKw || 4.2} kW`,
      `${((r.powerDrawKw || 4.2) * 1.18).toFixed(2)} kW`,
      `So node: ${r.units?.length || 0} / 42U (${r.status})`
    ]);

    const csvContent = [
      headers.join(','),
      ...rows.map(e => e.join(',')),
      '',
      '--- CHI TIET THEO TU RACK ---',
      ...rackRows.map(e => e.join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `AR_IMMS_PUE_Report_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Filtered Racks
  const displayRacks = useMemo(() => {
    if (selectedRackId === 'all') return racks;
    return racks.filter(r => r.id === selectedRackId);
  }, [racks, selectedRackId]);

  return (
    <div className="space-y-8 font-sans text-slate-200">
      
      {/* Header & Controls Bar */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 border-b border-[#222c37] pb-6">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-mono font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
              ISO 50001 / Green DC Standard
            </span>
          </div>
          <h2 className="text-2xl font-bold tracking-tight text-white font-mono flex items-center gap-2.5">
            <TrendingUp className="w-6 h-6 text-[#38bdf8]" />
            Báo Cáo Hiệu Quả Năng Lượng (PUE) & Quy Hoạch Dung Lượng
          </h2>
          <p className="text-xs text-slate-400 font-mono mt-1">
            Phân tích tự động hệ số PUE, tải công suất điện thực tế và dự báo điểm bão hòa không gian 42U.
          </p>
        </div>

        {/* Action Controls */}
        <div className="flex flex-wrap items-center gap-2.5">
          {/* Filter by Rack */}
          <div className="flex items-center gap-1.5 bg-[#11161b] border border-[#222c37] px-3 py-1.5 rounded-lg text-xs font-mono">
            <Filter className="w-3.5 h-3.5 text-slate-400" />
            <select
              value={selectedRackId}
              onChange={(e) => setSelectedRackId(e.target.value)}
              aria-label="Lọc theo Tủ Rack"
              className="bg-transparent text-slate-200 outline-none cursor-pointer"
            >
              <option value="all" className="bg-[#11161b]">Tất Cả Tủ Rack ({racks.length})</option>
              {racks.map(r => (
                <option key={r.id} value={r.id} className="bg-[#11161b]">
                  {r.name} ({r.units?.length || 0}U / 42U)
                </option>
              ))}
            </select>
          </div>

          {/* Time Range Selector */}
          <div className="flex items-center bg-[#11161b] border border-[#222c37] p-0.5 rounded-lg text-xs font-mono">
            {(['24h', '7d', '30d'] as const).map((r) => (
              <button
                key={r}
                onClick={() => setTimeRange(r)}
                className={`px-3 py-1 rounded transition-all cursor-pointer ${
                  timeRange === r 
                    ? 'bg-[#38bdf8]/20 text-[#38bdf8] font-bold border border-[#38bdf8]/40' 
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                {r === '24h' ? '24 Giờ' : r === '7d' ? '7 Ngày' : '30 Ngày'}
              </button>
            ))}
          </div>

          {/* Export CSV Button */}
          <button
            onClick={handleExportCSV}
            className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-[#38bdf8] hover:bg-[#38bdf8]/90 text-slate-950 font-bold text-xs font-mono transition-all shadow-md cursor-pointer"
          >
            <Download className="w-3.5 h-3.5" />
            Xuất Báo Cáo CSV
          </button>
        </div>
      </div>

      {/* Top 4 KPI Metrics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        
        {/* Metric 1: PUE Index */}
        <div className="p-5 bg-[#11161b] border border-[#222c37] rounded-xl relative overflow-hidden group hover:border-[#38bdf8]/40 transition-colors">
          <div className="absolute top-0 right-0 w-24 h-24 bg-[#38bdf8]/5 rounded-full blur-xl pointer-events-none"></div>
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-mono uppercase tracking-wider">Hệ Số PUE Trung Tâm</span>
            <span className="p-1.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
              <Zap className="w-4 h-4" />
            </span>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-bold font-mono text-emerald-400">{currentPUE}</span>
            <span className="text-xs text-slate-400 font-mono">/ Chuẩn: &lt; 1.25</span>
          </div>
          <div className="mt-3 flex items-center gap-1.5 text-[11px] text-emerald-400 font-mono">
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span>Đạt mức Tiết kiệm Năng lượng Xuất sắc</span>
          </div>
        </div>

        {/* Metric 2: Total Facility Power */}
        <div className="p-5 bg-[#11161b] border border-[#222c37] rounded-xl relative overflow-hidden group hover:border-[#ffb03a]/40 transition-colors">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-mono uppercase tracking-wider">Tổng Công Suất Tiêu Thụ</span>
            <span className="p-1.5 rounded bg-[#ffb03a]/10 text-[#ffb03a] border border-[#ffb03a]/20">
              <BarChart3 className="w-4 h-4" />
            </span>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-bold font-mono text-white">{totalFacilityPowerKw}</span>
            <span className="text-xs text-slate-400 font-mono">kW / Giờ</span>
          </div>
          <div className="mt-3 flex items-center justify-between text-[11px] text-slate-400 font-mono">
            <span>IT: {itPowerDrawKw} kW</span>
            <span>Làm mát: {coolingPowerKw} kW</span>
          </div>
        </div>

        {/* Metric 3: Rack U-Space Capacity */}
        <div className="p-5 bg-[#11161b] border border-[#222c37] rounded-xl relative overflow-hidden group hover:border-indigo-500/40 transition-colors">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-mono uppercase tracking-wider">Tỷ Lệ Lấp Đầy Tủ Rack</span>
            <span className="p-1.5 rounded bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
              <Layers className="w-4 h-4" />
            </span>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-bold font-mono text-indigo-300">{spaceUtilizationPercent}%</span>
            <span className="text-xs text-slate-400 font-mono">({totalOccupiedUnits}/{totalSlots} U)</span>
          </div>
          <div className="mt-3 w-full bg-slate-800 h-1.5 rounded-full overflow-hidden">
            <div 
              className="bg-indigo-400 h-full rounded-full transition-all duration-500"
              style={{ width: `${Math.min(Number(spaceUtilizationPercent), 100)}%` }}
            />
          </div>
        </div>

        {/* Metric 4: Capacity Runway */}
        <div className="p-5 bg-[#11161b] border border-[#222c37] rounded-xl relative overflow-hidden group hover:border-sky-500/40 transition-colors">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-mono uppercase tracking-wider">Dự Báo Bão Hòa Không Gian</span>
            <span className="p-1.5 rounded bg-sky-500/10 text-sky-400 border border-sky-500/20">
              <Calendar className="w-4 h-4" />
            </span>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-bold font-mono text-sky-300">~ 180</span>
            <span className="text-xs text-slate-400 font-mono">Ngày Còn Lại</span>
          </div>
          <div className="mt-3 flex items-center gap-1.5 text-[11px] text-sky-400 font-mono">
            <span>Còn trống {totalSlots - totalOccupiedUnits} U sẵn sàng lắp đặt</span>
          </div>
        </div>
      </div>

      {/* Main Analysis Visualizations (2 Columns) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left 2 Cols: PUE Trend Chart (SVG Line Chart) */}
        <div className="lg:col-span-2 p-6 bg-[#11161b] border border-[#222c37] rounded-xl flex flex-col justify-between">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-base font-bold text-white font-mono flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-[#38bdf8]" />
                Biểu Đồ Xu Hướng PUE Theo Thời Gian ({timeRange === '24h' ? '24 Giờ' : timeRange === '7d' ? '7 Ngày' : '30 Ngày'})
              </h3>
              <p className="text-xs text-slate-400 font-mono mt-0.5">
                Chỉ số tiệm cận 1.0 biểu thị 100% năng lượng được cấp thẳng cho thiết bị IT.
              </p>
            </div>
            <div className="flex items-center gap-4 text-xs font-mono">
              <div className="flex items-center gap-1.5">
                <div className="w-3 h-1 bg-emerald-400 rounded-full"></div>
                <span className="text-slate-400">PUE</span>
              </div>
              <div className="flex items-center gap-1.5">
                <div className="w-3 h-1 bg-[#38bdf8] rounded-full"></div>
                <span className="text-slate-400">Tải IT (kW)</span>
              </div>
            </div>
          </div>

          {/* Custom SVG Line Chart */}
          <div className="relative w-full h-56 mt-2">
            <svg className="w-full h-full overflow-visible" viewBox="0 0 700 200" preserveAspectRatio="none">
              <defs>
                <linearGradient id="pueGradient" x1="0%" y1="0%" x2="0%" y2="100%">
                  <stop offset="0%" stopColor="#34d399" stopOpacity="0.35" />
                  <stop offset="100%" stopColor="#34d399" stopOpacity="0.0" />
                </linearGradient>
                <linearGradient id="kwGradient" x1="0%" y1="0%" x2="0%" y2="100%">
                  <stop offset="0%" stopColor="#38bdf8" stopOpacity="0.2" />
                  <stop offset="100%" stopColor="#38bdf8" stopOpacity="0.0" />
                </linearGradient>
              </defs>

              {/* Horizontal Grid lines */}
              <line x1="0" y1="30" x2="700" y2="30" stroke="#1f2937" strokeDasharray="4 4" />
              <line x1="0" y1="80" x2="700" y2="80" stroke="#1f2937" strokeDasharray="4 4" />
              <line x1="0" y1="130" x2="700" y2="130" stroke="#1f2937" strokeDasharray="4 4" />
              <line x1="0" y1="180" x2="700" y2="180" stroke="#1f2937" />

              {/* Dynamic Path Calculation */}
              {(() => {
                const points = trendData.map((d, index) => {
                  const x = (index / (trendData.length - 1)) * 680 + 10;
                  // Normalize PUE (1.10 -> y=170, 1.30 -> y=20)
                  const normalizedPue = Math.max(1.10, Math.min(1.30, d.pue));
                  const y = 170 - ((normalizedPue - 1.10) / (1.30 - 1.10)) * 140;
                  return { x, y, d };
                });

                const pathString = points.reduce((acc, p, i) => `${acc} ${i === 0 ? 'M' : 'L'} ${p.x} ${p.y}`, '');
                const areaString = `${pathString} L ${points[points.length - 1].x} 180 L ${points[0].x} 180 Z`;

                return (
                  <>
                    <path d={areaString} fill="url(#pueGradient)" />
                    <path d={pathString} fill="none" stroke="#34d399" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
                    {points.map((p, i) => (
                      <g key={i} className="group cursor-pointer">
                        <circle cx={p.x} cy={p.y} r="5" fill="#11161b" stroke="#34d399" strokeWidth="2.5" />
                        <text
                          x={p.x}
                          y={p.y - 10}
                          textAnchor="middle"
                          fill="#a7f3d0"
                          fontSize="11"
                          fontFamily="monospace"
                          fontWeight="bold"
                        >
                          {p.d.pue.toFixed(2)}
                        </text>
                        <text
                          x={p.x}
                          y="196"
                          textAnchor="middle"
                          fill="#94a3b8"
                          fontSize="10"
                          fontFamily="monospace"
                        >
                          {p.d.time}
                        </text>
                      </g>
                    ))}
                  </>
                );
              })()}
            </svg>
          </div>

          <div className="mt-4 pt-4 border-t border-[#222c37] flex flex-wrap items-center justify-between text-xs font-mono text-slate-400">
            <span>Đỉnh tải cao nhất: 18.2 kW (12:00)</span>
            <span>Hiệu quả năng lượng trung bình: PUE {currentPUE}</span>
            <span className="text-emerald-400">Tiết kiệm ~14.2% so với Q3</span>
          </div>
        </div>

        {/* Right 1 Col: Power Distribution by Rack */}
        <div className="p-6 bg-[#11161b] border border-[#222c37] rounded-xl flex flex-col justify-between">
          <div>
            <h3 className="text-base font-bold text-white font-mono flex items-center gap-2 mb-1">
              <Zap className="w-4 h-4 text-[#ffb03a]" />
              Phân Bổ Công Suất Theo Tủ Rack
            </h3>
            <p className="text-xs text-slate-400 font-mono mb-5">
              Hạn mức thiết kế tối đa mỗi tủ: 8.0 kW
            </p>

            <div className="space-y-4">
              {racks.map(rack => {
                const rackKey = rack.name.replace('Tủ ', '').replace('Rack ', '').trim().toLowerCase();
                const rackIdKey = rack.id.replace('rack-', '').trim().toLowerCase();
                const matchedAssets = assets.filter(a => {
                  const aRack = a.rack.replace('Tủ ', '').replace('Rack ', '').trim().toLowerCase();
                  return aRack === rackKey || aRack === rackIdKey || a.rack.toLowerCase().includes(rackKey);
                });
                const rackWatts = matchedAssets.reduce((sum, a) => {
                  const m = a.powerDraw?.match(/(\d+)/);
                  return sum + (m ? parseInt(m[0], 10) : 450);
                }, 0);
                const kw = matchedAssets.length > 0 ? Number(((rackWatts / 1000) + 0.8).toFixed(1)) : (rack.powerDrawKw || 4.2);
                const maxBudget = 8.0;
                const percent = Math.min(100, Math.round((kw / maxBudget) * 100));
                return (
                  <div key={rack.id} className="space-y-1.5">
                    <div className="flex justify-between text-xs font-mono">
                      <span className="font-bold text-slate-200">{rack.name} ({rack.location || rack.zone || 'Zone A'})</span>
                      <span className="text-slate-400 font-bold">{kw.toFixed(1)} kW / {maxBudget} kW ({percent}%)</span>
                    </div>
                    <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden">
                      <div 
                        className={`h-full rounded-full transition-all duration-500 ${
                          percent > 85 ? 'bg-red-500' : percent > 65 ? 'bg-[#ffb03a]' : 'bg-[#38bdf8]'
                        }`}
                        style={{ width: `${percent}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="mt-6 pt-4 border-t border-[#222c37] bg-slate-900/40 p-3 rounded-lg border border-slate-800">
            <div className="flex items-center gap-2 text-xs font-mono text-[#ffb03a]">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>Khuyến nghị: Tải điện hạ tầng luôn dưới 80% định mức an toàn.</span>
            </div>
          </div>
        </div>
      </div>

      {/* Capacity Planning Matrix Table */}
      <div className="bg-[#11161b] border border-[#222c37] rounded-xl overflow-hidden">
        <div className="p-6 border-b border-[#222c37] flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h3 className="text-base font-bold text-white font-mono flex items-center gap-2">
              <Server className="w-4 h-4 text-indigo-400" />
              Ma Trận Quy Hoạch Dung Lượng & Dự Báo Mở Rộng (Capacity Planning)
            </h3>
            <p className="text-xs text-slate-400 font-mono mt-0.5">
              Chi tiết vị trí U còn trống, nhiệt độ trung bình và công suất dự phòng theo từng tủ rack.
            </p>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs font-mono">
            <thead className="bg-[#0c1015] border-b border-[#222c37] text-slate-400 uppercase tracking-wider">
              <tr>
                <th className="px-6 py-3.5">Tủ Rack</th>
                <th className="px-6 py-3.5">Vị Trí & Khu Vực</th>
                <th className="px-6 py-3.5">Số Node Lắp Đặt</th>
                <th className="px-6 py-3.5">Khe Trống 42U</th>
                <th className="px-6 py-3.5">Công Suất / Hạn Mức</th>
                <th className="px-6 py-3.5">Nhiệt Độ TB</th>
                <th className="px-6 py-3.5">Trạng Thái Dự Báo</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#222c37]">
              {displayRacks.map(rack => {
                const rackKey = rack.name.replace('Tủ ', '').replace('Rack ', '').trim().toLowerCase();
                const rackIdKey = rack.id.replace('rack-', '').trim().toLowerCase();
                const matchedAssets = assets.filter(a => {
                  const aRack = a.rack.replace('Tủ ', '').replace('Rack ', '').trim().toLowerCase();
                  return aRack === rackKey || aRack === rackIdKey || a.rack.toLowerCase().includes(rackKey);
                });
                const occupiedCount = matchedAssets.length > 0 ? matchedAssets.length : (rack.units?.length || 0);
                const freeU = 42 - occupiedCount;
                const rackWatts = matchedAssets.reduce((sum, a) => {
                  const m = a.powerDraw?.match(/(\d+)/);
                  return sum + (m ? parseInt(m[0], 10) : 450);
                }, 0);
                const kw = matchedAssets.length > 0 ? Number(((rackWatts / 1000) + 0.8).toFixed(1)) : (rack.powerDrawKw || 4.2);
                const temp = rack.temperature || 34;

                return (
                  <tr key={rack.id} className="hover:bg-slate-800/30 transition-colors">
                    <td className="px-6 py-4 font-bold text-white flex items-center gap-2">
                      <div className={`w-2 h-2 rounded-full ${rack.status === 'critical' ? 'bg-red-500' : rack.status === 'warning' ? 'bg-[#ffb03a]' : 'bg-emerald-400'}`}></div>
                      {rack.name}
                    </td>
                    <td className="px-6 py-4 text-slate-300">
                      {rack.location || rack.zone || 'Khu Vực Alpha'}
                    </td>
                    <td className="px-6 py-4 text-slate-300">
                      {occupiedCount} Thiết bị
                    </td>
                    <td className="px-6 py-4">
                      <span className="font-bold text-sky-400">{freeU} U trống</span>
                      <span className="text-slate-500 ml-1">/ 42U</span>
                    </td>
                    <td className="px-6 py-4 text-slate-300">
                      {kw.toFixed(1)} kW <span className="text-slate-500">/ 8.0 kW</span>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`${temp > 38 ? 'text-red-400' : temp > 35 ? 'text-[#ffb03a]' : 'text-emerald-400'} font-bold`}>
                        {temp}°C
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      {freeU > 20 ? (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-[10px]">
                          Sẵn sàng mở rộng
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-[#ffb03a]/10 text-[#ffb03a] border border-[#ffb03a]/20 text-[10px]">
                          Cần quy hoạch thêm
                        </span>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
};
