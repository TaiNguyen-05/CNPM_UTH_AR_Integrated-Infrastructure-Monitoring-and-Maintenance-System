import React, { useState } from 'react';
import { 
  AlertTriangle, 
  CheckCircle2, 
  MapPin, 
  User, 
  Clock, 
  Wrench, 
  ShieldAlert, 
  PlusCircle, 
  Check, 
  ExternalLink, 
  ArrowUp, 
  Layers, 
  Activity,
  Box,
  Share2,
  Cpu,
  Flame
} from 'lucide-react';
import { AlertItem } from '../types';
import { MOCK_RACK_ISOMETRIC } from '../data/mockData';

interface AlertsViewProps {
  alerts: AlertItem[];
  onAcknowledgeAlert?: (alertId: string) => void;
  onAcknowledge?: (alertId: string) => void;
  onResolveAlert?: (alertId: string) => void;
  onResolve?: (alertId: string) => void;
  onCreateTicket?: (alert: AlertItem) => void;
  onLaunchARView?: (alert: AlertItem) => void;
  onOpenAR?: (alert: AlertItem) => void;
  onOpenDigitalTwin?: () => void;
}

export const AlertsView: React.FC<AlertsViewProps> = ({
  alerts = [],
  onAcknowledgeAlert,
  onAcknowledge,
  onResolveAlert,
  onResolve,
  onCreateTicket,
  onLaunchARView,
  onOpenAR,
  onOpenDigitalTwin
}) => {
  const [selectedAlertId, setSelectedAlertId] = useState<string>(alerts[0]?.id || 'alt-1');
  const [filterMode, setFilterMode] = useState<'all' | 'critical' | 'unacknowledged'>('all');

  const fallbackAlert: AlertItem = {
    id: 'alt-default',
    alertCode: 'ALT-SYS-01',
    severity: 'Info',
    title: 'Hệ thống Enclave đang vận hành ổn định',
    description: 'Tất cả các thông số nhiệt độ, điện năng và tốc độ quạt IPMI đang ở ngưỡng an toàn.',
    time: 'Vừa xong',
    loggedTimeUtc: new Date().toISOString(),
    location: 'Toàn bộ Rack',
    assignedTo: 'Chưa chỉ định',
    zone: 'Zone Alpha',
    acknowledged: true,
    resolved: false,
    snapshot: {
      rackTemp: '32.5°C',
      tempRate: '0.0°C/10m',
      fanSpeed: '3,800 RPM',
      fanStatus: 'Ổn định',
      powerDraw: '4.8 kW',
      powerStatus: 'Bình thường',
      tempTrend: [30, 31, 32, 32.5]
    },
    maintenanceLogs: []
  };

  const selectedAlert = (alerts && alerts.length > 0)
    ? (alerts.find(a => a.id === selectedAlertId) || alerts[0] || fallbackAlert)
    : fallbackAlert;

  const criticalCount = alerts.filter(a => a.severity === 'Critical' && !a.resolved).length;
  const warningCount = alerts.filter(a => a.severity === 'Warning' && !a.resolved).length;

  const filteredAlerts = alerts.filter(a => {
    if (a.resolved) return false;
    if (filterMode === 'critical') return a.severity === 'Critical';
    if (filterMode === 'unacknowledged') return !a.acknowledged;
    return true;
  });

  return (
    <div className="flex-1 flex flex-col lg:flex-row h-[calc(100vh-4rem)] overflow-hidden bg-[#090d16] text-slate-100">
      {/* Left Pane: Alert List (1/3 on lg) */}
      <div className="w-full lg:w-1/3 border-r border-slate-800/80 flex flex-col bg-[#0b101d] h-full shrink-0">
        <div className="p-4 border-b border-slate-800/80 flex justify-between items-center bg-slate-900/60">
          <div className="flex items-center gap-2">
            <h2 className="text-sm md:text-base font-black text-white tracking-tight">Cảnh Báo Đang Hoạt Động</h2>
          </div>
          <div className="flex gap-1.5">
            <span className="bg-rose-500/20 text-rose-300 border border-rose-500/30 px-2 py-0.5 rounded-md text-[11px] font-bold">
              {criticalCount} Nghiêm trọng
            </span>
            <span className="bg-amber-500/20 text-amber-300 border border-amber-500/30 px-2 py-0.5 rounded-md text-[11px] font-bold">
              {warningCount} Cảnh báo
            </span>
          </div>
        </div>

        {/* Filter Pills */}
        <div className="px-4 py-2.5 border-b border-slate-800/80 flex gap-2 bg-slate-950/40 overflow-x-auto">
          <button
            onClick={() => setFilterMode('all')}
            className={`px-3 py-1 rounded-xl text-xs font-bold whitespace-nowrap transition-all cursor-pointer ${
              filterMode === 'all'
                ? 'bg-sky-500/20 text-sky-300 border border-sky-500/40 shadow-sm'
                : 'bg-slate-900/60 border border-slate-800 text-slate-400 hover:text-slate-200'
            }`}
          >
            Tất cả
          </button>
          <button
            onClick={() => setFilterMode('critical')}
            className={`px-3 py-1 rounded-xl text-xs font-bold whitespace-nowrap transition-all cursor-pointer ${
              filterMode === 'critical'
                ? 'bg-rose-500/20 text-rose-300 border border-rose-500/40 shadow-sm'
                : 'bg-slate-900/60 border border-slate-800 text-rose-400/80 hover:text-rose-300'
            }`}
          >
            Chỉ Nghiêm Trọng
          </button>
          <button
            onClick={() => setFilterMode('unacknowledged')}
            className={`px-3 py-1 rounded-xl text-xs font-bold whitespace-nowrap transition-all cursor-pointer ${
              filterMode === 'unacknowledged'
                ? 'bg-sky-500/20 text-sky-300 border border-sky-500/40 shadow-sm'
                : 'bg-slate-900/60 border border-slate-800 text-slate-400 hover:text-slate-200'
            }`}
          >
            Chưa Tiếp Nhận
          </button>
        </div>

        {/* Alert List Items */}
        <div className="flex-1 overflow-y-auto p-3 space-y-2.5">
          {filteredAlerts.length === 0 ? (
            <div className="py-12 text-center text-xs text-slate-500 flex flex-col items-center gap-2">
              <CheckCircle2 className="w-8 h-8 text-emerald-500/60" />
              <span>Không có cảnh báo nào phù hợp với bộ lọc đã chọn.</span>
            </div>
          ) : (
            filteredAlerts.map((alert) => {
              const isSelected = alert.id === selectedAlertId;
              const isCritical = alert.severity === 'Critical';

              return (
                <div
                  key={alert.id}
                  onClick={() => setSelectedAlertId(alert.id)}
                  className={`
                    border rounded-xl p-3.5 cursor-pointer transition-all relative
                    ${isSelected 
                      ? 'border-sky-500 bg-slate-900/90 ring-2 ring-sky-500/25 shadow-lg shadow-sky-950/40' 
                      : 'border-slate-800/80 bg-slate-900/40 hover:bg-slate-900/70'}
                  `}
                >
                  {/* Status strip */}
                  <div className={`absolute left-0 top-0 bottom-0 w-1 rounded-l-xl ${
                    isCritical ? 'bg-rose-500 shadow-[0_0_8px_rgba(244,63,94,0.6)]' : 'bg-amber-400 shadow-[0_0_8px_rgba(251,191,36,0.5)]'
                  }`} />

                  <div className="flex justify-between items-start mb-1.5 pl-2">
                    <div className="flex items-center gap-1.5">
                      <div className={`w-2 h-2 rounded-full ${
                        isCritical ? 'bg-rose-500 pulse-critical' : 'bg-amber-400 pulse-warning'
                      }`} />
                      <span className={`text-[11px] font-black uppercase tracking-wider ${
                        isCritical ? 'text-rose-400' : 'text-amber-400'
                      }`}>
                        {isCritical ? 'Nghiêm trọng' : 'Cảnh báo'}
                      </span>
                    </div>
                    <span className="text-[10px] font-mono text-slate-400">{alert.time}</span>
                  </div>

                  <h3 className="text-xs md:text-sm font-bold text-slate-100 mb-1 pl-2">{alert.title}</h3>
                  <p className="text-xs text-slate-400 line-clamp-2 pl-2 mb-2.5">{alert.description}</p>

                  <div className="flex items-center gap-2 pl-2 flex-wrap">
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-slate-800/80 rounded-md text-[10px] font-medium text-slate-300 border border-slate-700/60">
                      <Box className="w-3 h-3 text-slate-400" /> {alert.zone}
                    </span>
                    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-mono font-bold ${
                      isCritical ? 'bg-rose-500/20 text-rose-300 border border-rose-500/30' : 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                    }`}>
                      {alert.alertCode}
                    </span>
                    {alert.acknowledged && (
                      <span className="text-[10px] text-emerald-400 font-bold ml-auto flex items-center gap-0.5">
                        <Check className="w-3 h-3" /> Đã tiếp nhận
                      </span>
                    )}
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* Right Pane: Ticket Workflow & Details (2/3 on lg) */}
      <div className="flex-1 flex flex-col bg-[#090d16] h-full overflow-hidden">
        {/* Ticket Header */}
        <div className="p-4 md:p-6 border-b border-slate-800/80 bg-slate-900/60 backdrop-blur-md flex flex-col sm:flex-row justify-between items-start gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1.5">
              <span className={`px-2 py-0.5 rounded-md text-xs font-mono font-bold ${
                selectedAlert.severity === 'Critical' ? 'bg-rose-500/20 text-rose-300 border border-rose-500/30' : 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
              }`}>
                {selectedAlert.alertCode}
              </span>
              <span className="text-xs font-mono text-slate-400">Ghi nhận: {selectedAlert.loggedTimeUtc}</span>
            </div>

            <h2 className="text-lg md:text-2xl font-black text-white tracking-tight">{selectedAlert.title}</h2>

            <div className="text-xs text-slate-400 mt-2 flex flex-wrap items-center gap-4">
              <span className="flex items-center gap-1.5 font-medium text-slate-300">
                <MapPin className="w-4 h-4 text-sky-400" /> {selectedAlert.location}
              </span>
              <span className="flex items-center gap-1.5 font-medium text-slate-300">
                <User className="w-4 h-4 text-slate-400" /> Kỹ thuật viên: <strong className="text-sky-300">{selectedAlert.assignedTo}</strong>
              </span>
            </div>
          </div>

          <div className="flex gap-2 w-full sm:w-auto">
            <button
              onClick={() => onAcknowledgeAlert(selectedAlert.id)}
              disabled={selectedAlert.acknowledged}
              className="flex-1 sm:flex-none px-4 py-2 border border-slate-700 bg-slate-800/80 text-slate-200 font-bold text-xs rounded-xl hover:bg-slate-700 transition-colors shadow-sm cursor-pointer disabled:opacity-50"
            >
              {selectedAlert.acknowledged ? 'Đã Tiếp Nhận' : 'Tiếp Nhận Cảnh Báo'}
            </button>

            <button
              onClick={() => onCreateTicket(selectedAlert)}
              className="flex-1 sm:flex-none px-4 py-2 bg-gradient-to-r from-sky-500 to-blue-600 hover:from-sky-400 hover:to-blue-500 text-white font-bold text-xs rounded-xl transition-all shadow-md shadow-sky-500/25 flex items-center justify-center gap-1.5 cursor-pointer active:scale-95"
            >
              <PlusCircle className="w-4 h-4" />
              Tạo Phiếu Xử Lý
            </button>
          </div>
        </div>

        {/* Ticket Content Canvas */}
        <div className="flex-1 overflow-y-auto p-4 md:p-6 grid grid-cols-1 xl:grid-cols-12 gap-5">
          {/* Telemetry Snapshot at Alert Time (Spans 8 cols) */}
          <div className="xl:col-span-8 glass-card rounded-2xl p-5">
            <h3 className="text-sm font-bold text-slate-100 mb-3 flex items-center gap-2">
              <Activity className="w-4 h-4 text-sky-400" />
              Dữ Liệu Snapshot Tại Thời Điểm Cảnh Báo
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-4">
              <div className="p-3.5 bg-rose-950/30 rounded-xl border border-rose-500/30">
                <div className="text-[11px] font-bold text-rose-300 mb-1">Nhiệt Độ Tủ Rack</div>
                <div className="text-2xl font-black text-rose-400 font-mono">{selectedAlert.snapshot.rackTemp}</div>
                <div className="text-[11px] font-bold text-rose-300 flex items-center gap-1 mt-1">
                  <ArrowUp className="w-3.5 h-3.5" /> {selectedAlert.snapshot.tempRate}
                </div>
              </div>

              <div className="p-3.5 bg-slate-900/80 rounded-xl border border-slate-800">
                <div className="text-[11px] font-bold text-slate-400 mb-1">Tốc Độ Quạt Tản Nhiệt</div>
                <div className="text-2xl font-black text-slate-100 font-mono">{selectedAlert.snapshot.fanSpeed}</div>
                <div className="text-[11px] font-bold text-amber-400 flex items-center gap-1 mt-1">
                  <AlertTriangle className="w-3.5 h-3.5" /> {selectedAlert.snapshot.fanStatus}
                </div>
              </div>

              <div className="p-3.5 bg-slate-900/80 rounded-xl border border-slate-800">
                <div className="text-[11px] font-bold text-slate-400 mb-1">Công Suất Tiêu Thụ</div>
                <div className="text-2xl font-black text-slate-100 font-mono">{selectedAlert.snapshot.powerDraw}</div>
                <div className="text-[11px] font-bold text-emerald-400 mt-1">{selectedAlert.snapshot.powerStatus}</div>
              </div>
            </div>

            {/* Live Temp Trend Graph */}
            <div className="h-32 w-full bg-[#060911] rounded-xl border border-slate-800 relative overflow-hidden flex items-end">
              <div className="absolute bottom-0 w-full h-full bg-gradient-to-t from-rose-500/20 to-transparent opacity-60" />
              <svg className="w-full h-full absolute inset-0" preserveAspectRatio="none" viewBox="0 0 100 100">
                <polyline
                  fill="none"
                  points="0,80 20,78 40,82 60,75 80,40 100,10"
                  stroke="#f43f5e"
                  strokeWidth="2.5"
                />
              </svg>
              <div className="absolute right-3 top-3 bg-slate-900/90 px-2.5 py-1 rounded-lg text-[11px] font-mono font-semibold text-rose-300 border border-rose-500/30 backdrop-blur-md">
                Xu Hướng Nhiệt Độ Trực Tiếp
              </div>
            </div>
          </div>

          {/* Spatial Context Card (Spans 4 cols) */}
          <div className="xl:col-span-4 glass-card rounded-2xl p-5 flex flex-col justify-between">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <Box className="w-4 h-4 text-sky-400" />
                <h3 className="text-sm font-bold text-white">Định Vị Không Gian Số</h3>
              </div>
              <p className="text-xs text-slate-400 mb-3">
                Xem thiết bị trong mô hình Digital Twin không gian để điều hướng kỹ thuật viên thực tế với AR HUD.
              </p>
            </div>

            <div 
              onClick={() => onLaunchARView(selectedAlert)}
              className="w-full h-32 rounded-xl bg-slate-950 border border-slate-800 mb-3 relative overflow-hidden group cursor-pointer"
            >
              <img 
                src={MOCK_RACK_ISOMETRIC} 
                alt="Digital Twin Isometric Render"
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300 opacity-80"
              />
              <div className="absolute inset-0 bg-black/40 group-hover:bg-black/20 transition-colors flex items-center justify-center">
                <div className="w-10 h-10 rounded-xl bg-sky-500/90 text-white flex items-center justify-center shadow-lg shadow-sky-500/30">
                  <ExternalLink className="w-5 h-5" />
                </div>
              </div>
            </div>

            <button
              onClick={() => onLaunchARView(selectedAlert)}
              className="w-full py-2.5 border border-sky-500/40 bg-sky-500/10 text-sky-300 font-bold text-xs rounded-xl hover:bg-sky-500/20 transition-colors cursor-pointer"
            >
              Khởi Chạy Chế Độ AR
            </button>
          </div>

          {/* Maintenance History Logs (Spans 12 cols) */}
          <div className="xl:col-span-12 glass-card rounded-2xl overflow-hidden">
            <div className="p-4 border-b border-slate-800/80 bg-slate-900/60 flex items-center justify-between">
              <h3 className="text-sm font-bold text-slate-200 flex items-center gap-2">
                <Wrench className="w-4 h-4 text-sky-400" />
                Lịch Sử Xử Lý & Can Thiệp Bảo Trì
              </h3>
              <button
                onClick={() => onResolveAlert(selectedAlert.id)}
                disabled={selectedAlert.resolved}
                className="px-3 py-1.5 rounded-lg bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-xs font-bold hover:bg-emerald-500/30 transition-colors cursor-pointer disabled:opacity-50"
              >
                {selectedAlert.resolved ? 'Đã Đóng Ticket' : 'Đánh Dấu Hoàn Tất Sửa Chữa'}
              </button>
            </div>

            <div className="p-4 space-y-3">
              {selectedAlert.maintenanceLogs && selectedAlert.maintenanceLogs.length > 0 ? (
                selectedAlert.maintenanceLogs.map((log: any, index: number) => (
                  <div key={index} className="p-3 bg-slate-900/80 rounded-xl border border-slate-800 text-xs text-slate-300 flex items-start justify-between">
                    <div>
                      <span className="font-bold text-white block">{log.action || 'Bảo trì linh kiện'}</span>
                      <span className="text-slate-400">{log.notes || 'Đã kiểm tra đầu nối và luồng khí tản nhiệt.'}</span>
                    </div>
                    <span className="text-slate-500 font-mono text-[10px]">{log.time || '10 phút trước'}</span>
                  </div>
                ))
              ) : (
                <div className="py-6 text-center text-xs text-slate-500">
                  Chưa có lịch sử bảo trì trước đó trên node này.
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
