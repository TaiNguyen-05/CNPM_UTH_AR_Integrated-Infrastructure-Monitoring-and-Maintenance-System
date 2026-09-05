import React, { useState, useEffect, useRef } from 'react';
import { 
  Play, 
  Pause, 
  Filter, 
  Radio, 
  Activity, 
  Server, 
  Zap, 
  TrendingUp, 
  CheckCircle2, 
  AlertCircle,
  Sliders
} from 'lucide-react';
import { TelemetryLogEntry } from '../types';
import { socketService } from '../services/socketService';

export const TelemetryView: React.FC = () => {
  const [isStreaming, setIsStreaming] = useState<boolean>(true);
  const [activeNodes, setActiveNodes] = useState({
    'Node-01': true,
    'Node-02': true,
    'Node-03': true,
    'Node-04': false
  });

  const [filterModalOpen, setFilterModalOpen] = useState<boolean>(false);
  const [samplingRate, setSamplingRate] = useState<number>(1000);

  // Time series datasets
  const [cpuData, setCpuData] = useState<{ node1: number[]; node2: number[]; node3: number[] }>({
    node1: [25, 28, 26, 24, 22, 23, 25, 27, 26, 28, 29, 30],
    node2: [48, 52, 50, 47, 49, 53, 51, 54, 52, 50, 52, 53],
    node3: [14, 15, 14, 18, 16, 17, 19, 21, 20, 19, 22, 24]
  });

  const [ramData, setRamData] = useState<{ node1: number[]; node2: number[]; node3: number[] }>({
    node1: [42, 44, 43, 45, 42, 43, 44, 46, 45, 44, 43, 45],
    node2: [62, 64, 63, 61, 60, 59, 61, 62, 60, 61, 62, 60],
    node3: [88, 86, 92, 94, 91, 89, 95, 96, 92, 94, 98, 95]
  });

  const [tempData, setTempData] = useState<{ node1: number[]; node2: number[]; node3: number[] }>({
    node1: [45, 46, 44, 45, 48, 46, 45, 47, 49, 48, 47, 48],
    node2: [54, 53, 55, 52, 56, 54, 55, 58, 56, 57, 56, 58],
    node3: [78, 77, 79, 81, 76, 75, 78, 79, 76, 78, 82, 80]
  });

  const [logs, setLogs] = useState<TelemetryLogEntry[]>([
    { id: '1', timeStr: '22:54:19.538', type: 'CRIT', node: 'Node-02', message: 'Nhiệt độ đọc bất thường. Đang tự động tăng tốc quạt tản nhiệt.' },
    { id: '2', timeStr: '22:54:19.474', type: 'SYNC', node: 'Node-03', message: 'Đồng bộ cơ sở dữ liệu hoàn tất.' },
    { id: '3', timeStr: '22:54:19.406', type: 'INFO', node: 'Node-01', message: 'Phát hiện tăng nhẹ độ trễ gói tin trên eth0.' },
    { id: '4', timeStr: '22:54:19.185', type: 'WARN', node: 'Node-03', message: 'Ngưỡng bộ nhớ RAM vượt quá 90% trên phân vùng worker.' },
    { id: '5', timeStr: '22:54:18.902', type: 'INFO', node: 'Node-01', message: 'Xác nhận phản hồi tín hiệu nhịp tim Heartbeat (2.1ms).' },
    { id: '6', timeStr: '22:54:18.420', type: 'SYNC', node: 'Node-02', message: 'Đã tiếp nhận gói tin sao lưu 0x8892.' }
  ]);

  const logContainerRef = useRef<HTMLDivElement>(null);

  // Live real-time WebSocket stream via Flask-SocketIO
  useEffect(() => {
    if (!isStreaming) return;

    // Lắng nghe stream Telemetry thời gian thực từ Flask Backend
    const unsubTelemetry = socketService.onTelemetryStream((payload: any) => {
      const nodeId = (payload.node_id || '').toUpperCase();
      const cpu = parseFloat(payload.cpu || 0);
      const ram = parseFloat(payload.ram || 0);
      const temp = parseFloat(payload.temp || 0);

      const targetKey = nodeId.includes('01') ? 'node1' : nodeId.includes('02') ? 'node2' : 'node3';

      setCpuData(prev => ({
        ...prev,
        [targetKey]: [...prev[targetKey as keyof typeof prev].slice(1), cpu]
      }));

      setRamData(prev => ({
        ...prev,
        [targetKey]: [...prev[targetKey as keyof typeof prev].slice(1), ram]
      }));

      setTempData(prev => ({
        ...prev,
        [targetKey]: [...prev[targetKey as keyof typeof prev].slice(1), temp]
      }));

      // Thêm log từ payload thực tế
      const now = new Date();
      const timeStr = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}:${now.getSeconds().toString().padStart(2, '0')}.${now.getMilliseconds().toString().padStart(3, '0')}`;
      
      let type: 'INFO' | 'WARN' | 'CRIT' | 'SYNC' = 'INFO';
      if (cpu > 90 || ram > 90 || temp > 80) type = 'CRIT';
      else if (cpu > 75 || ram > 80 || temp > 65) type = 'WARN';
      else type = 'SYNC';

      const streamLog: TelemetryLogEntry = {
        id: `${Date.now()}-${Math.random()}`,
        timeStr,
        type,
        node: payload.node_id || 'SRV-NODE',
        message: `CPU: ${cpu}% | RAM: ${ram}% | Temp: ${temp}°C | In/Out: ${payload.network_in_kbps || 0}/${payload.network_out_kbps || 0} KB/s`
      };

      setLogs(prev => [streamLog, ...prev.slice(0, 40)]);
    });

    // Lắng nghe sự kiện trạng thái máy chủ (như OFFLINE > 90s)
    const unsubStatus = socketService.onServerStatusChanged((data: any) => {
      const now = new Date();
      const timeStr = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}:${now.getSeconds().toString().padStart(2, '0')}`;
      const statusLog: TelemetryLogEntry = {
        id: `${Date.now()}-status`,
        timeStr,
        type: 'CRIT',
        node: data.node_id || 'SERVER',
        message: `🚨 [STATUS CHANGED] Server chuyển sang ${data.status}: ${data.reason || 'Mất kết nối Heartbeat (>90s)'}`
      };
      setLogs(prev => [statusLog, ...prev.slice(0, 40)]);
    });

    return () => {
      unsubTelemetry();
      unsubStatus();
    };
  }, [isStreaming]);

  // Helper to render responsive SVG spark/line charts
  const renderChart = (
    data: { node1: number[]; node2: number[]; node3: number[] },
    min: number,
    max: number,
    unit: string,
    showWarningZone = false
  ) => {
    const pointsCount = data.node1.length;
    const width = 600;
    const height = 150;
    const padding = 20;

    const scaleX = (index: number) => padding + (index / (pointsCount - 1)) * (width - 2 * padding);
    const scaleY = (val: number) => height - padding - ((val - min) / (max - min)) * (height - 2 * padding);

    const makePath = (arr: number[]) => {
      return arr.map((val, idx) => `${idx === 0 ? 'M' : 'L'} ${scaleX(idx)} ${scaleY(val)}`).join(' ');
    };

    const makeArea = (arr: number[]) => {
      const line = arr.map((val, idx) => `${idx === 0 ? 'M' : 'L'} ${scaleX(idx)} ${scaleY(val)}`).join(' ');
      return `${line} L ${scaleX(arr.length - 1)} ${scaleY(min)} L ${scaleX(0)} ${scaleY(min)} Z`;
    };

    return (
      <div className="w-full h-40 relative">
        <svg className="w-full h-full" viewBox={`0 0 ${width} ${height}`} preserveAspectRatio="none">
          {/* Horizontal grid lines */}
          {[0.25, 0.5, 0.75, 1].map((p, idx) => {
            const y = height - padding - p * (height - 2 * padding);
            return (
              <line 
                key={idx} 
                x1={padding} 
                y1={y} 
                x2={width - padding} 
                y2={y} 
                stroke="#222c37" 
                strokeDasharray="3,3" 
              />
            );
          })}

          {/* Area fill for Node-03 if warning */}
          {activeNodes['Node-03'] && showWarningZone && (
            <path d={makeArea(data.node3)} fill="rgba(244, 63, 94, 0.15)" />
          )}

          {/* Node 1 Line (Cyan) */}
          {activeNodes['Node-01'] && (
            <path
              d={makePath(data.node1)}
              fill="none"
              stroke="#38bdf8"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          )}

          {/* Node 2 Line (Emerald) */}
          {activeNodes['Node-02'] && (
            <path
              d={makePath(data.node2)}
              fill="none"
              stroke="#10b981"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          )}

          {/* Node 3 Line (Rose/Amber) */}
          {activeNodes['Node-03'] && (
            <path
              d={makePath(data.node3)}
              fill="none"
              stroke={showWarningZone ? "#f43f5e" : "#64748b"}
              strokeWidth={showWarningZone ? "2.5" : "2"}
              strokeDasharray={showWarningZone ? undefined : "4,4"}
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          )}
        </svg>
      </div>
    );
  };

  return (
    <div className="p-2 md:p-4 max-w-[1600px] mx-auto flex flex-col gap-6 text-slate-200">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
        <div>
          <h1 className="text-xl md:text-2xl font-bold text-white tracking-tight font-mono">Luồng Đo Từ Xa (Telemetry Stream)</h1>
          <p className="text-xs text-slate-400 mt-0.5 font-light">Giám sát thời gian thực các node máy chủ trong cụm trung tâm qua WebSocket.</p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setFilterModalOpen(true)}
            className="px-4 py-2 bg-[#161d24] border border-[#222c37] text-slate-300 hover:text-white hover:border-[#38bdf8] text-xs font-mono font-bold transition-all flex items-center gap-1.5 cursor-pointer"
          >
            <Filter className="w-3.5 h-3.5 text-slate-400" />
            Bộ lọc
          </button>

          <button
            onClick={() => setIsStreaming(!isStreaming)}
            className={`
              px-4 py-2 text-xs font-mono font-bold transition-all flex items-center gap-2 cursor-pointer border
              ${isStreaming 
                ? 'bg-[#38bdf8]/10 border-[#38bdf8] text-[#38bdf8] hover:bg-[#38bdf8] hover:text-[#080b0e]' 
                : 'bg-[#161d24] border-[#222c37] text-slate-400 hover:text-white'}
            `}
          >
            {isStreaming ? (
              <>
                <span className="w-2 h-2 rounded-full bg-[#38bdf8] animate-pulse" />
                Luồng Trực Tiếp
              </>
            ) : (
              <>
                <Play className="w-3.5 h-3.5" />
                Đã Tạm Dừng
              </>
            )}
          </button>
        </div>
      </div>

      {/* Main Bento Grid for Telemetry */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Main Charts Area (Spans 9 cols) */}
        <div className="lg:col-span-9 flex flex-col gap-5">
          {/* CPU Utilization Chart Card */}
          <div className="bg-[#0f141a] border border-[#222c37] p-4 flex flex-col">
            <div className="flex justify-between items-center mb-2">
              <h3 className="text-xs font-bold text-white font-mono uppercase tracking-wider">Hiệu Suất Sử Dụng CPU</h3>
              <div className="flex items-center gap-1.5 text-xs text-emerald-400 font-medium">
                <span className="w-2 h-2 rounded-full bg-emerald-400" />
                <span className="font-mono">Ổn định (TB: 38%)</span>
              </div>
            </div>
            {renderChart(cpuData, 0, 100, '%', false)}
          </div>

          {/* RAM Usage Chart Card */}
          <div className="bg-[#0f141a] border border-[#222c37] p-4 flex flex-col">
            <div className="flex justify-between items-center mb-2">
              <h3 className="text-xs font-bold text-white font-mono uppercase tracking-wider">Phân Bổ Bộ Nhớ RAM</h3>
              <div className="flex items-center gap-1.5 text-xs text-rose-400 font-medium">
                <span className="w-2 h-2 rounded-full bg-rose-400 animate-pulse" />
                <span className="font-mono font-bold">Cảnh báo: Node-03 (95%)</span>
              </div>
            </div>
            {renderChart(ramData, 0, 100, '%', true)}
          </div>

          {/* Thermal Chart Card */}
          <div className="bg-[#0f141a] border border-[#222c37] p-4 flex flex-col">
            <div className="flex justify-between items-center mb-2">
              <h3 className="text-xs font-bold text-white font-mono uppercase tracking-wider">Tải Nhiệt Độ (°C)</h3>
              <div className="flex items-center gap-1.5 text-xs text-emerald-400 font-medium">
                <span className="w-2 h-2 rounded-full bg-emerald-400" />
                <span className="font-mono">Bình thường (TB: 54°C)</span>
              </div>
            </div>
            {renderChart(tempData, 20, 100, '°C', false)}
          </div>
        </div>

        {/* Sidebar Filters & Summary (Spans 3 cols) */}
        <div className="lg:col-span-3 flex flex-col gap-5">
          {/* Node Selector Card */}
          <div className="bg-[#0f141a] border border-[#222c37] p-4">
            <h3 className="text-xs font-bold text-[#ffb03a] uppercase tracking-wider mb-3 font-mono">Danh Sách Node Hoạt Động</h3>
            <div className="space-y-2">
              {/* Node 1 */}
              <label className="flex items-center justify-between p-2.5 bg-[#161d24] hover:bg-[#1c252e] cursor-pointer border border-[#222c37] transition-all">
                <div className="flex items-center gap-2.5">
                  <input
                    type="checkbox"
                    checked={activeNodes['Node-01']}
                    onChange={(e) => setActiveNodes(prev => ({ ...prev, 'Node-01': e.target.checked }))}
                    className="accent-[#38bdf8] w-4 h-4 cursor-pointer"
                  />
                  <span className="text-xs font-mono font-semibold text-white">Node-01 (Chính)</span>
                </div>
                <span className="w-2 h-2 rounded-full bg-[#38bdf8]" />
              </label>

              {/* Node 2 */}
              <label className="flex items-center justify-between p-2.5 bg-[#38bdf8]/10 hover:bg-[#38bdf8]/20 cursor-pointer border border-[#38bdf8]/60 transition-all">
                <div className="flex items-center gap-2.5">
                  <input
                    type="checkbox"
                    checked={activeNodes['Node-02']}
                    onChange={(e) => setActiveNodes(prev => ({ ...prev, 'Node-02': e.target.checked }))}
                    className="accent-[#38bdf8] w-4 h-4 cursor-pointer"
                  />
                  <span className="text-xs font-mono font-bold text-[#38bdf8]">Node-02 (Cơ sở dữ liệu)</span>
                </div>
                <span className="w-2 h-2 rounded-full bg-emerald-400" />
              </label>

              {/* Node 3 */}
              <label className="flex items-center justify-between p-2.5 bg-rose-950/20 hover:bg-rose-950/40 cursor-pointer border border-rose-500/40 transition-all">
                <div className="flex items-center gap-2.5">
                  <input
                    type="checkbox"
                    checked={activeNodes['Node-03']}
                    onChange={(e) => setActiveNodes(prev => ({ ...prev, 'Node-03': e.target.checked }))}
                    className="accent-rose-500 w-4 h-4 cursor-pointer"
                  />
                  <span className="text-xs font-mono font-semibold text-rose-300">Node-03 (Xử lý Worker)</span>
                </div>
                <span className="w-2 h-2 rounded-full bg-rose-400 animate-pulse" />
              </label>

              {/* Node 4 (Offline) */}
              <label className="flex items-center justify-between p-2.5 bg-[#161d24] hover:bg-[#1c252e] cursor-pointer border border-[#222c37] opacity-60 transition-all">
                <div className="flex items-center gap-2.5">
                  <input
                    type="checkbox"
                    checked={activeNodes['Node-04']}
                    onChange={(e) => setActiveNodes(prev => ({ ...prev, 'Node-04': e.target.checked }))}
                    className="accent-slate-500 w-4 h-4 cursor-pointer"
                  />
                  <span className="text-xs font-mono font-medium text-slate-500">Node-04 (Ngoại tuyến)</span>
                </div>
                <span className="w-2 h-2 rounded-full bg-slate-600" />
              </label>
            </div>
          </div>

          {/* Quick Stats */}
          <div className="bg-[#0f141a] border border-[#222c37] p-4 grid grid-cols-2 gap-3 font-mono">
            <div>
              <p className="text-[10px] uppercase font-bold text-slate-400">Tải Toàn Cục</p>
              <p className="text-2xl font-bold text-white mt-1">42<span className="text-xs text-slate-500 font-normal ml-0.5">%</span></p>
            </div>
            <div>
              <p className="text-[10px] uppercase font-bold text-slate-400">Lưu Lượng Mạng</p>
              <p className="text-2xl font-bold text-[#38bdf8] mt-1">1.2<span className="text-xs text-slate-500 font-normal ml-0.5">Gbps</span></p>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Live Telemetry Event Log Terminal */}
      <div className="h-44 bg-[#080b0e] border border-[#222c37] overflow-hidden flex flex-col shrink-0 text-white font-mono">
        <div className="px-4 py-2 bg-[#11161b] border-b border-[#222c37] flex justify-between items-center">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-[#38bdf8] animate-pulse" />
            <span className="text-xs font-bold font-mono tracking-wider uppercase text-slate-300">Nhật Ký Sự Kiện Telemetry Trực Tiếp</span>
          </div>
          <span className="text-xs font-mono text-slate-500">Tự động cuộn • Bộ đệm: {logs.length}</span>
        </div>

        <div ref={logContainerRef} className="flex-1 p-3 overflow-y-auto font-mono text-xs space-y-1">
          <table className="w-full text-left border-collapse">
            <tbody className="divide-y divide-[#222c37]/40">
              {logs.map((log) => {
                let typeColor = 'text-emerald-400';
                if (log.type === 'WARN') typeColor = 'text-yellow-400 font-bold';
                if (log.type === 'CRIT') typeColor = 'text-rose-300 font-bold bg-rose-950/60 px-1';
                if (log.type === 'SYNC') typeColor = 'text-[#38bdf8]';

                return (
                  <tr key={log.id} className="hover:bg-[#161d24]/50 transition-colors">
                    <td className="py-1 px-2 text-slate-500 w-28 align-top whitespace-nowrap">[{log.timeStr}]</td>
                    <td className={`py-1 px-2 w-16 align-top whitespace-nowrap ${typeColor}`}>{log.type}</td>
                    <td className="py-1 px-2 text-slate-300 font-semibold w-24 align-top whitespace-nowrap">{log.node}</td>
                    <td className="py-1 px-2 text-slate-400 align-top">{log.message}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Filter Modal */}
      {filterModalOpen && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-[#0c1015] border border-[#222c37] shadow-2xl p-6 max-w-md w-full animate-in fade-in font-mono text-xs">
            <h3 className="text-base font-bold text-white mb-1 font-sans">Bộ Lọc & Ngưỡng Telemetry</h3>
            <p className="text-xs text-slate-400 mb-4 font-light">Điều chỉnh tần số lấy mẫu thời gian thực và ngưỡng cảnh báo.</p>

            <div className="space-y-4">
              <div>
                <label className="block text-slate-400 mb-1 uppercase text-[10px]">Tần Suất Lấy Mẫu</label>
                <select 
                  value={samplingRate}
                  onChange={(e) => setSamplingRate(Number(e.target.value))}
                  className="w-full p-2.5 bg-[#161d24] border border-[#222c37] text-white outline-none focus:border-[#38bdf8]"
                >
                  <option value={500}>Nhanh (500ms - Độ chính xác cao)</option>
                  <option value={1000}>Bình thường (1000ms - Cân bằng)</option>
                  <option value={2000}>Tiết kiệm (2000ms - Tiết kiệm CPU)</option>
                </select>
              </div>

              <div>
                <label className="block text-slate-400 mb-1 uppercase text-[10px]">Ngưỡng Cảnh Báo Bộ Nhớ</label>
                <input type="range" min="70" max="95" defaultValue="90" className="w-full accent-[#38bdf8]" />
                <div className="flex justify-between text-[11px] text-slate-500 mt-1">
                  <span>70%</span>
                  <span className="font-bold text-[#38bdf8]">Kích hoạt ở 90%</span>
                  <span>95%</span>
                </div>
              </div>
            </div>

            <div className="mt-6 flex justify-end gap-2">
              <button
                onClick={() => setFilterModalOpen(false)}
                className="px-4 py-2 bg-[#38bdf8] text-[#080b0e] font-mono text-xs font-bold uppercase tracking-wider hover:bg-[#00f0ff] transition-colors cursor-pointer"
              >
                Áp Dụng Thay Đổi
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
