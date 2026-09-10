import React, { useState, useEffect, useRef } from 'react';
import { Terminal, Smartphone, Monitor, Activity, AlertTriangle, Shield, Pause, Play, Trash2, Download, Search, CheckCircle2, Zap } from 'lucide-react';

export interface SystemLogEntry {
  id: string;
  timestamp: string;
  source: 'mobile' | 'web' | 'telemetry' | 'alert' | 'auth';
  level: 'info' | 'warn' | 'critical' | 'success';
  message: string;
  details?: string;
  nodeId?: string;
}

interface LiveSystemLogsSectionProps {
  externalLogs?: SystemLogEntry[];
}

const INITIAL_DEMO_LOGS: SystemLogEntry[] = [
  {
    id: 'log-1',
    timestamp: new Date(Date.now() - 360000).toLocaleTimeString(),
    source: 'auth',
    level: 'success',
    message: 'Sarah Jenkins (Admin) đã đăng nhập vào hệ thống Web Admin Console qua SSO Gateway',
    details: 'IP: 192.168.1.100 • Session: jwt-session-9842',
  },
  {
    id: 'log-2',
    timestamp: new Date(Date.now() - 300000).toLocaleTimeString(),
    source: 'mobile',
    level: 'info',
    message: 'App Android: Kỹ thuật viên kết nối Camera AR quét Marker [ar-imms://node/SRV-NODE-01]',
    details: 'Thiết bị: Xiaomi / Galaxy S24 • CameraX HD 720p • Khóa vị trí: Rack A1 (U38-39)',
    nodeId: 'SRV-NODE-01'
  },
  {
    id: 'log-3',
    timestamp: new Date(Date.now() - 240000).toLocaleTimeString(),
    source: 'telemetry',
    level: 'warn',
    message: 'Telemetry Gateway: Node SRV-NODE-05 (Log Aggregator) nhiệt độ tăng lên 78.0°C (Ngưỡng 75°C)',
    details: 'CPU: 88% • Quạt: 6800 RPM • Điện áp: 420W • Tủ: Rack A2 (U20-22)',
    nodeId: 'SRV-NODE-05'
  },
  {
    id: 'log-4',
    timestamp: new Date(Date.now() - 180000).toLocaleTimeString(),
    source: 'alert',
    level: 'critical',
    message: 'Hệ thống tự động kích hoạt Cảnh Báo ALT-1: "Cooling System Thermal Alarm" trên Rack A2',
    details: 'Mã cảnh báo: ALT-1 • Mức độ: CRITICAL • Tự động gửi WebSocket Broadcast tới Web & Mobile App',
    nodeId: 'SRV-NODE-05'
  },
  {
    id: 'log-5',
    timestamp: new Date(Date.now() - 120000).toLocaleTimeString(),
    source: 'mobile',
    level: 'info',
    message: 'App Android: Chuyển phiếu bảo trì TCK-2026-001 cho Kỹ thuật viên Robert King (Field Tech)',
    details: 'Ưu tiên: EMERGENCY • Hạng mục: Kiểm tra quạt làm mát & thay thế mô-đun tản nhiệt',
  },
  {
    id: 'log-6',
    timestamp: new Date(Date.now() - 60000).toLocaleTimeString(),
    source: 'web',
    level: 'success',
    message: 'Web Admin: Đồng bộ hóa 6 Server Nodes & 3 Tủ Rack sang Supabase PostgreSQL thành công',
    details: '21 tài khoản người dùng hoạt động • Database latency: 18ms',
  },
  {
    id: 'log-7',
    timestamp: new Date().toLocaleTimeString(),
    source: 'telemetry',
    level: 'info',
    message: 'Heartbeat Check: Toàn bộ 6 nodes phản hồi Ping thời gian thực (< 2ms) trên mạng nội bộ DC',
    details: 'Mạng DC Saigon High-Tech Park • Trạng thái: 100% OPERATIONAL',
  }
];

export const LiveSystemLogsSection: React.FC<LiveSystemLogsSectionProps> = ({ externalLogs }) => {
  const [logs, setLogs] = useState<SystemLogEntry[]>(INITIAL_DEMO_LOGS);
  const [activeFilter, setActiveFilter] = useState<'all' | 'mobile' | 'web' | 'telemetry' | 'alert' | 'auth'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [isAutoScroll, setIsAutoScroll] = useState(true);
  const logContainerRef = useRef<HTMLDivElement>(null);

  // Merge external live logs if received from Socket.IO in App.tsx
  useEffect(() => {
    if (externalLogs && externalLogs.length > 0) {
      setLogs(prev => {
        const existingIds = new Set(prev.map(l => l.id));
        const newItems = externalLogs.filter(l => !existingIds.has(l.id));
        if (newItems.length === 0) return prev;
        return [...prev, ...newItems];
      });
    }
  }, [externalLogs]);

  // Auto-scroll to bottom when new logs arrive
  useEffect(() => {
    if (isAutoScroll && logContainerRef.current) {
      logContainerRef.current.scrollTop = logContainerRef.current.scrollHeight;
    }
  }, [logs, isAutoScroll]);

  const filteredLogs = logs.filter(entry => {
    const matchFilter = activeFilter === 'all' || entry.source === activeFilter;
    const matchSearch = searchQuery.trim() === '' ||
      entry.message.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (entry.details && entry.details.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (entry.nodeId && entry.nodeId.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchFilter && matchSearch;
  });

  const handleClearLogs = () => {
    setLogs([]);
  };

  const handleExportJSON = () => {
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(logs, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute("href", dataStr);
    downloadAnchor.setAttribute("download", `ar_imms_system_logs_${Date.now()}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  const getSourceBadge = (source: SystemLogEntry['source']) => {
    switch (source) {
      case 'mobile':
        return <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">📱 APP MOBILE</span>;
      case 'web':
        return <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-sky-500/10 text-sky-400 border border-sky-500/20">💻 WEB ADMIN</span>;
      case 'telemetry':
        return <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-amber-500/10 text-amber-400 border border-amber-500/20">⚡ TELEMETRY</span>;
      case 'alert':
        return <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-rose-500/10 text-rose-400 border border-rose-500/20">🚨 ALERTS & TICKET</span>;
      case 'auth':
        return <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-purple-500/10 text-purple-400 border border-purple-500/20">🔐 AUTH SSO</span>;
    }
  };

  const getLevelBadge = (level: SystemLogEntry['level']) => {
    switch (level) {
      case 'critical':
        return <span className="text-rose-400 font-bold font-mono text-[11px]">[CRITICAL]</span>;
      case 'warn':
        return <span className="text-amber-400 font-bold font-mono text-[11px]">[WARN]</span>;
      case 'success':
        return <span className="text-emerald-400 font-bold font-mono text-[11px]">[SUCCESS]</span>;
      case 'info':
      default:
        return <span className="text-sky-400 font-bold font-mono text-[11px]">[INFO]</span>;
    }
  };

  return (
    <section id="system-logs" className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-16">
      {/* Background glow effects */}
      <div className="pointer-events-none absolute -top-10 left-1/2 -translate-x-1/2 w-3/4 h-64 bg-sky-500/5 blur-[100px] rounded-full" />

      <div className="relative z-10 flex flex-col gap-6">
        {/* Header Title & Realtime Badge */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-[#222c37] pb-5">
          <div>
            <div className="flex items-center gap-2.5 mb-2">
              <span className="flex h-2.5 w-2.5 relative">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
              </span>
              <span className="font-mono text-xs uppercase tracking-widest text-[#38bdf8] font-bold">
                STREAM SOCKET.IO TRỰC TIẾP
              </span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-black text-white font-mono tracking-tight flex items-center gap-3">
              <Terminal className="w-7 h-7 text-[#38bdf8]" />
              Nhật Ký Vận Hành Hệ Thống (Web & Mobile AR)
            </h2>
            <p className="text-xs sm:text-sm text-slate-400 mt-1 max-w-2xl">
              Theo dõi đồng bộ toàn bộ luồng hoạt động thời gian thực từ ứng dụng di động AR, bảng quản trị Web, cảm biến telemetry và luồng phân phối phiếu bảo trì.
            </p>
          </div>

          <div className="flex items-center gap-2 font-mono text-xs">
            <div className="bg-[#11161b] border border-[#222c37] px-3 py-1.5 rounded-lg text-slate-300 flex items-center gap-2">
              <span className="text-slate-500">Tổng sự kiện:</span>
              <span className="text-emerald-400 font-bold">{logs.length}</span>
            </div>
          </div>
        </div>

        {/* Filter Controls & Search Toolbar */}
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 bg-[#11161b] border border-[#222c37] p-3 rounded-2xl">
          {/* Source Tabs */}
          <div className="flex flex-wrap items-center gap-1.5">
            {[
              { key: 'all', label: 'TẤT CẢ LOGS', count: logs.length },
              { key: 'mobile', label: '📱 MOBILE AR', count: logs.filter(l => l.source === 'mobile').length },
              { key: 'web', label: '💻 WEB ADMIN', count: logs.filter(l => l.source === 'web').length },
              { key: 'telemetry', label: '⚡ TELEMETRY', count: logs.filter(l => l.source === 'telemetry').length },
              { key: 'alert', label: '🚨 ALERTS & TICKET', count: logs.filter(l => l.source === 'alert').length },
              { key: 'auth', label: '🔐 AUTH SSO', count: logs.filter(l => l.source === 'auth').length },
            ].map(tab => (
              <button
                key={tab.key}
                onClick={() => setActiveFilter(tab.key as any)}
                className={`px-3 py-1.5 rounded-lg text-xs font-mono font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                  activeFilter === tab.key
                    ? 'bg-[#38bdf8] text-[#080b0e] shadow-md shadow-sky-500/20'
                    : 'bg-[#161d24] text-slate-400 hover:text-white hover:bg-[#222c37] border border-transparent'
                }`}
              >
                <span>{tab.label}</span>
                <span className={`text-[10px] px-1.5 py-0.2 rounded-full ${activeFilter === tab.key ? 'bg-black/20 text-black' : 'bg-black/40 text-slate-400'}`}>
                  {tab.count}
                </span>
              </button>
            ))}
          </div>

          {/* Search & Actions */}
          <div className="flex items-center gap-2">
            <div className="relative flex-1 sm:w-64">
              <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
              <input
                type="text"
                placeholder="Tìm nội dung log, Node ID..."
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                className="w-full bg-[#0c1015] border border-[#222c37] rounded-xl pl-9 pr-3 py-1.5 text-xs text-white placeholder:text-slate-600 font-mono focus:border-sky-500 focus:outline-none"
              />
            </div>

            <button
              onClick={() => setIsAutoScroll(!isAutoScroll)}
              title={isAutoScroll ? 'Tạm dừng cuộn tự động' : 'Bật cuộn tự động'}
              className={`p-2 rounded-xl border text-xs font-mono font-bold flex items-center gap-1.5 transition-colors cursor-pointer ${
                isAutoScroll
                  ? 'bg-[#161d24] border-[#222c37] text-emerald-400 hover:bg-[#222c37]'
                  : 'bg-amber-500/10 border-amber-500/30 text-amber-400'
              }`}
            >
              {isAutoScroll ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
              <span className="hidden sm:inline">{isAutoScroll ? 'Tự cuộn' : 'Tạm dừng'}</span>
            </button>

            <button
              onClick={handleExportJSON}
              title="Xuất file nhật ký JSON"
              className="p-2 rounded-xl bg-[#161d24] hover:bg-[#222c37] border border-[#222c37] text-slate-300 hover:text-white transition-colors cursor-pointer flex items-center gap-1.5 text-xs font-mono font-bold"
            >
              <Download className="w-3.5 h-3.5 text-sky-400" />
              <span className="hidden sm:inline">Xuất Log</span>
            </button>

            <button
              onClick={handleClearLogs}
              title="Xóa danh sách log trên màn hình"
              className="p-2 rounded-xl bg-[#161d24] hover:bg-rose-500/20 border border-[#222c37] hover:border-rose-500/30 text-slate-400 hover:text-rose-300 transition-colors cursor-pointer"
            >
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Terminal Screen Console */}
        <div className="bg-[#080b0e] border border-[#222c37] rounded-2xl overflow-hidden shadow-2xl relative font-mono text-xs flex flex-col">
          {/* Terminal Window Top Bar */}
          <div className="bg-[#11161b] px-4 py-2.5 border-b border-[#222c37] flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-2.5 h-2.5 rounded-full bg-rose-500/80" />
              <div className="w-2.5 h-2.5 rounded-full bg-amber-500/80" />
              <div className="w-2.5 h-2.5 rounded-full bg-emerald-500/80" />
              <span className="text-slate-400 text-[11px] ml-2 font-mono">
                ar_imms_unified_daemon_stdout.log — 80x24 (UTF-8)
              </span>
            </div>
            <div className="flex items-center gap-3 text-[11px] text-slate-500">
              <span>Đang hiển thị: <b className="text-slate-300">{filteredLogs.length}</b> mục</span>
            </div>
          </div>

          {/* Log Stream Body */}
          <div
            ref={logContainerRef}
            className="p-4 overflow-y-auto max-h-[380px] min-h-[260px] space-y-2.5 select-text"
            style={{ scrollBehavior: 'smooth' }}
          >
            {filteredLogs.length === 0 ? (
              <div className="text-center py-16 text-slate-600 font-mono">
                <Terminal className="w-8 h-8 mx-auto mb-2 opacity-30 text-sky-400" />
                <p>Không có sự kiện nhật ký nào phù hợp với bộ lọc.</p>
              </div>
            ) : (
              filteredLogs.map((log) => (
                <div
                  key={log.id}
                  className="group flex flex-col sm:flex-row sm:items-start gap-2 sm:gap-3 p-2 rounded-lg hover:bg-[#11161b]/80 border border-transparent hover:border-[#222c37] transition-all"
                >
                  {/* Timestamp & Source */}
                  <div className="flex items-center gap-2 shrink-0">
                    <span className="text-slate-500 text-[11px] font-mono select-none">
                      [{log.timestamp}]
                    </span>
                    {getSourceBadge(log.source)}
                    {getLevelBadge(log.level)}
                  </div>

                  {/* Message & Details */}
                  <div className="flex-1 min-w-0">
                    <div className="text-slate-200 leading-relaxed font-medium">
                      {log.message}
                    </div>
                    {log.details && (
                      <div className="text-slate-400 text-[11px] mt-0.5 font-mono text-slate-400/80 flex items-center gap-2">
                        <span>↳</span>
                        <span>{log.details}</span>
                      </div>
                    )}
                  </div>

                  {/* Quick Node Anchor Tag if present */}
                  {log.nodeId && (
                    <div className="shrink-0 self-start sm:self-center">
                      <span className="px-2 py-0.5 rounded bg-sky-500/10 text-sky-300 border border-sky-500/30 text-[10px] font-mono font-bold">
                        {log.nodeId}
                      </span>
                    </div>
                  )}
                </div>
              ))
            )}
          </div>

          {/* Terminal Footer Bar */}
          <div className="bg-[#0c1015] px-4 py-2 border-t border-[#222c37] flex items-center justify-between text-[11px] text-slate-500 font-mono">
            <div className="flex items-center gap-3">
              <span className="text-emerald-400 flex items-center gap-1.5">
                <CheckCircle2 className="w-3 h-3" /> WebSocket Kết Nối
              </span>
              <span>•</span>
              <span>Cổng: 9999 / TCP</span>
              <span>•</span>
              <span>Kênh: public:dc-events</span>
            </div>
            <div className="text-slate-400 hidden sm:block">
              Hạ Tầng Giám Sát AR-IMMS v2.4 (Enterprise)
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
