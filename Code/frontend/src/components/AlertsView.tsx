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
  Share2
} from 'lucide-react';
import { AlertItem } from '../types';
import { MOCK_RACK_ISOMETRIC } from '../data/mockData';

interface AlertsViewProps {
  alerts: AlertItem[];
  onAcknowledgeAlert: (alertId: string) => void;
  onResolveAlert: (alertId: string) => void;
  onCreateTicket: (alert: AlertItem) => void;
  onLaunchARView: (alert: AlertItem) => void;
  onOpenDigitalTwin: () => void;
}

export const AlertsView: React.FC<AlertsViewProps> = ({
  alerts,
  onAcknowledgeAlert,
  onResolveAlert,
  onCreateTicket,
  onLaunchARView,
  onOpenDigitalTwin
}) => {
  const [selectedAlertId, setSelectedAlertId] = useState<string>(alerts[0]?.id || 'alt-1');
  const [filterMode, setFilterMode] = useState<'all' | 'critical' | 'unacknowledged'>('all');

  const selectedAlert = alerts.find(a => a.id === selectedAlertId) || alerts[0];

  const criticalCount = alerts.filter(a => a.severity === 'Critical' && !a.resolved).length;
  const warningCount = alerts.filter(a => a.severity === 'Warning' && !a.resolved).length;

  const filteredAlerts = alerts.filter(a => {
    if (a.resolved) return false;
    if (filterMode === 'critical') return a.severity === 'Critical';
    if (filterMode === 'unacknowledged') return !a.acknowledged;
    return true;
  });

  return (
    <div className="flex-1 flex flex-col lg:flex-row h-[calc(100vh-4rem)] overflow-hidden bg-[#f7f9fb]">
      {/* Left Pane: Alert List (1/3 on lg) */}
      <div className="w-full lg:w-1/3 border-r border-[#c2c6d6] flex flex-col bg-white h-full shrink-0">
        <div className="p-4 border-b border-[#c2c6d6] flex justify-between items-center bg-white">
          <h2 className="text-base font-bold text-[#191c1e]">Cảnh Báo Đang Hoạt Động</h2>
          <div className="flex gap-2">
            <span className="bg-[#ffdad6] text-[#93000a] px-2 py-0.5 rounded text-xs font-bold">
              {criticalCount} Nghiêm trọng
            </span>
            <span className="bg-[#d0e1fb] text-[#004395] px-2 py-0.5 rounded text-xs font-bold">
              {warningCount} Cảnh báo
            </span>
          </div>
        </div>

        {/* Filter Pills */}
        <div className="px-4 py-2 border-b border-[#c2c6d6] flex gap-2 bg-[#f8fafc] overflow-x-auto">
          <button
            onClick={() => setFilterMode('all')}
            className={`px-3 py-1 rounded-full text-xs font-bold whitespace-nowrap transition-colors cursor-pointer ${
              filterMode === 'all'
                ? 'bg-[#d0e1fb] text-[#004395] border border-[#0058be]'
                : 'bg-white border border-[#c2c6d6] text-[#424754] hover:bg-[#f2f4f6]'
            }`}
          >
            Tất cả
          </button>
          <button
            onClick={() => setFilterMode('critical')}
            className={`px-3 py-1 rounded-full text-xs font-bold whitespace-nowrap transition-colors cursor-pointer ${
              filterMode === 'critical'
                ? 'bg-[#ffdad6] text-[#ba1a1a] border border-[#ba1a1a]'
                : 'bg-white border border-[#c2c6d6] text-[#ba1a1a] hover:bg-[#ffdad6]/40'
            }`}
          >
            Chỉ Nghiêm Trọng
          </button>
          <button
            onClick={() => setFilterMode('unacknowledged')}
            className={`px-3 py-1 rounded-full text-xs font-bold whitespace-nowrap transition-colors cursor-pointer ${
              filterMode === 'unacknowledged'
                ? 'bg-[#d0e1fb] text-[#004395] border border-[#0058be]'
                : 'bg-white border border-[#c2c6d6] text-[#424754] hover:bg-[#f2f4f6]'
            }`}
          >
            Chưa Tiếp Nhận
          </button>
        </div>

        {/* Alert List Items */}
        <div className="flex-1 overflow-y-auto p-3 space-y-2.5">
          {filteredAlerts.length === 0 ? (
            <div className="p-8 text-center text-xs text-[#727785]">
              Không có cảnh báo nào phù hợp với bộ lọc đã chọn.
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
                    border rounded-lg p-3.5 cursor-pointer transition-all relative shadow-xs
                    ${isSelected 
                      ? 'border-[#0058be] bg-white ring-2 ring-[#0058be]/20' 
                      : 'border-[#c2c6d6] bg-[#ffffff] hover:bg-[#f2f4f6]'}
                  `}
                >
                  {/* Status strip */}
                  <div className={`absolute left-0 top-0 bottom-0 w-1.5 rounded-l-lg ${
                    isCritical ? 'bg-[#ba1a1a]' : 'bg-[#eab308]'
                  }`} />

                  <div className="flex justify-between items-start mb-1.5 pl-2">
                    <div className="flex items-center gap-1.5">
                      <div className={`w-2 h-2 rounded-full ${
                        isCritical ? 'bg-[#ba1a1a] pulse-critical' : 'bg-[#eab308] pulse-warning'
                      }`} />
                      <span className={`text-xs font-bold uppercase tracking-wider ${
                        isCritical ? 'text-[#ba1a1a]' : 'text-yellow-700'
                      }`}>
                        {isCritical ? 'Nghiêm trọng' : 'Cảnh báo'}
                      </span>
                    </div>
                    <span className="text-[11px] font-mono text-[#727785]">{alert.time}</span>
                  </div>

                  <h3 className="text-sm font-bold text-[#191c1e] mb-1 pl-2">{alert.title}</h3>
                  <p className="text-xs text-[#424754] line-clamp-2 pl-2 mb-2.5">{alert.description}</p>

                  <div className="flex items-center gap-2 pl-2">
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-[#eceef0] rounded text-[11px] font-semibold text-[#424754]">
                      <Box className="w-3 h-3 text-[#727785]" /> {alert.zone}
                    </span>
                    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-bold ${
                      isCritical ? 'bg-[#ffdad6] text-[#93000a]' : 'bg-yellow-100 text-yellow-800'
                    }`}>
                      {alert.alertCode}
                    </span>
                    {alert.acknowledged && (
                      <span className="text-[10px] text-[#00855b] font-bold ml-auto flex items-center gap-0.5">
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
      <div className="flex-1 flex flex-col bg-[#f7f9fb] h-full overflow-hidden">
        {/* Ticket Header */}
        <div className="p-4 md:p-6 border-b border-[#c2c6d6] bg-white flex flex-col sm:flex-row justify-between items-start gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className={`px-2 py-0.5 rounded text-xs font-bold ${
                selectedAlert.severity === 'Critical' ? 'bg-[#ffdad6] text-[#93000a]' : 'bg-yellow-100 text-yellow-800'
              }`}>
                {selectedAlert.alertCode}
              </span>
              <span className="text-xs font-mono text-[#727785]">Thời gian ghi nhận: {selectedAlert.loggedTimeUtc}</span>
            </div>

            <h2 className="text-xl md:text-2xl font-bold text-[#191c1e] tracking-tight">{selectedAlert.title}</h2>

            <div className="text-xs text-[#424754] mt-2 flex flex-wrap items-center gap-4">
              <span className="flex items-center gap-1.5 font-medium">
                <MapPin className="w-4 h-4 text-[#0058be]" /> {selectedAlert.location}
              </span>
              <span className="flex items-center gap-1.5 font-medium">
                <User className="w-4 h-4 text-[#727785]" /> Kỹ thuật viên phụ trách: {selectedAlert.assignedTo}
              </span>
            </div>
          </div>

          <div className="flex gap-2 w-full sm:w-auto">
            <button
              onClick={() => onAcknowledgeAlert(selectedAlert.id)}
              disabled={selectedAlert.acknowledged}
              className="flex-1 sm:flex-none px-4 py-2 border border-[#c2c6d6] text-[#191c1e] font-bold text-xs rounded-lg hover:bg-[#f2f4f6] transition-colors shadow-2xs cursor-pointer disabled:opacity-50"
            >
              {selectedAlert.acknowledged ? 'Đã Tiếp Nhận' : 'Tiếp Nhận Cảnh Báo'}
            </button>

            <button
              onClick={() => onCreateTicket(selectedAlert)}
              className="flex-1 sm:flex-none px-4 py-2 bg-[#0058be] text-white font-bold text-xs rounded-lg hover:bg-[#2170e4] transition-colors shadow-xs flex items-center justify-center gap-1.5 cursor-pointer active:scale-95"
            >
              <PlusCircle className="w-4 h-4" />
              Tạo Phiếu Xử Lý
            </button>
          </div>
        </div>

        {/* Ticket Content Canvas */}
        <div className="flex-1 overflow-y-auto p-4 md:p-6 grid grid-cols-1 xl:grid-cols-12 gap-6">
          {/* Telemetry Snapshot at Alert Time (Spans 8 cols) */}
          <div className="xl:col-span-8 bg-white border border-[#c2c6d6] rounded-xl p-4 shadow-xs">
            <h3 className="text-sm font-bold text-[#191c1e] mb-3">Dữ Liệu Snapshot Tại Thời Điểm Cảnh Báo</h3>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-4">
              <div className="p-3 bg-[#ffdad6]/30 rounded-lg border border-[#ffdad6]">
                <div className="text-[11px] font-bold text-[#ba1a1a] mb-1">Nhiệt Độ Tủ Rack</div>
                <div className="text-2xl font-black text-[#ba1a1a]">{selectedAlert.snapshot.rackTemp}</div>
                <div className="text-[11px] font-bold text-[#ba1a1a] flex items-center gap-1 mt-1">
                  <ArrowUp className="w-3.5 h-3.5" /> {selectedAlert.snapshot.tempRate}
                </div>
              </div>

              <div className="p-3 bg-[#f8fafc] rounded-lg border border-[#c2c6d6]">
                <div className="text-[11px] font-bold text-[#727785] mb-1">Tốc Độ Quạt Tản Nhiệt</div>
                <div className="text-2xl font-black text-[#191c1e]">{selectedAlert.snapshot.fanSpeed}</div>
                <div className="text-[11px] font-bold text-[#ba1a1a] flex items-center gap-1 mt-1">
                  <AlertTriangle className="w-3.5 h-3.5" /> {selectedAlert.snapshot.fanStatus}
                </div>
              </div>

              <div className="p-3 bg-[#f8fafc] rounded-lg border border-[#c2c6d6]">
                <div className="text-[11px] font-bold text-[#727785] mb-1">Công Suất Tiêu Thụ</div>
                <div className="text-2xl font-black text-[#191c1e]">{selectedAlert.snapshot.powerDraw}</div>
                <div className="text-[11px] font-bold text-[#00855b] mt-1">{selectedAlert.snapshot.powerStatus}</div>
              </div>
            </div>

            {/* Live Temp Trend Graph */}
            <div className="h-32 w-full bg-[#f8fafc] rounded-lg border border-[#c2c6d6] relative overflow-hidden flex items-end">
              <div className="absolute bottom-0 w-full h-full bg-gradient-to-t from-[#ffdad6]/40 to-transparent opacity-60" />
              <svg className="w-full h-full absolute inset-0" preserveAspectRatio="none" viewBox="0 0 100 100">
                <polyline
                  fill="none"
                  points="0,80 20,78 40,82 60,75 80,40 100,10"
                  stroke="#ba1a1a"
                  strokeWidth="2.5"
                />
              </svg>
              <div className="absolute right-2 top-2 bg-white/90 px-2 py-1 rounded text-xs font-mono font-semibold border border-[#c2c6d6] backdrop-blur-xs">
                Xu Hướng Nhiệt Độ Trực Tiếp
              </div>
            </div>
          </div>

          {/* Spatial Context Card (Spans 4 cols) */}
          <div className="xl:col-span-4 bg-white border border-[#c2c6d6] rounded-xl p-4 shadow-xs flex flex-col justify-between">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <Box className="w-4 h-4 text-[#0058be]" />
                <h3 className="text-sm font-bold text-[#191c1e]">Định Vị Không Gian Số</h3>
              </div>
              <p className="text-xs text-[#727785] mb-3">
                Xem thiết bị bị ảnh hưởng trong mô hình Digital Twin không gian để điều hướng kỹ thuật viên thực tế.
              </p>
            </div>

            <div 
              onClick={() => onLaunchARView(selectedAlert)}
              className="w-full h-32 rounded-lg bg-[#eceef0] border border-[#c2c6d6] mb-3 relative overflow-hidden group cursor-pointer"
            >
              <img 
                src={MOCK_RACK_ISOMETRIC} 
                alt="Digital Twin Isometric Render"
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
              />
              <div className="absolute inset-0 bg-black/20 group-hover:bg-black/10 transition-colors flex items-center justify-center">
                <div className="w-10 h-10 rounded-full bg-white/90 text-[#0058be] flex items-center justify-center shadow-md">
                  <ExternalLink className="w-5 h-5" />
                </div>
              </div>
            </div>

            <button
              onClick={() => onLaunchARView(selectedAlert)}
              className="w-full py-2 border border-[#0058be] text-[#0058be] font-bold text-xs rounded-lg hover:bg-[#d8e2ff]/30 transition-colors cursor-pointer"
            >
              Khởi Chạy Chế Độ AR
            </button>
          </div>

          {/* Maintenance History Logs (Spans 12 cols) */}
          <div className="xl:col-span-12 bg-white border border-[#c2c6d6] rounded-xl shadow-xs overflow-hidden">
            <div className="p-3.5 border-b border-[#c2c6d6] bg-[#f8fafc]">
              <h3 className="text-xs font-bold text-[#191c1e] uppercase tracking-wider">
                Nhật Ký Bảo Trì Hỗ Trợ Bởi AR
              </h3>
            </div>

            <div className="divide-y divide-[#c2c6d6]">
              {selectedAlert.maintenanceLogs.map((log) => (
                <div key={log.id} className="p-4 hover:bg-[#f8fafc] transition-colors">
                  <div className="flex items-start gap-3">
                    <div className="w-8 h-8 rounded-full bg-[#d8e2ff] text-[#004395] flex items-center justify-center shrink-0">
                      <Wrench className="w-4 h-4" />
                    </div>

                    <div className="flex-1">
                      <div className="flex justify-between items-start mb-1">
                        <span className="text-xs font-bold text-[#191c1e]">{log.title}</span>
                        <span className="text-xs font-mono text-[#727785]">{log.timestamp}</span>
                      </div>

                      <p className="text-xs text-[#424754] mb-2">{log.description}</p>

                      <div className="flex gap-2">
                        {log.verified && (
                          <span className="bg-[#f5fff6] text-[#006947] border border-[#00855b]/20 px-2 py-0.5 rounded text-[11px] font-bold flex items-center gap-1">
                            <CheckCircle2 className="w-3 h-3" /> Đã xác thực
                          </span>
                        )}
                        {log.duration && (
                          <span className="bg-[#eceef0] text-[#424754] border border-[#c2c6d6] px-2 py-0.5 rounded text-[11px] font-medium flex items-center gap-1">
                            <Clock className="w-3 h-3 text-[#727785]" /> Thời lượng: {log.duration}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="p-4 border-t border-[#c2c6d6] bg-white flex justify-end gap-3">
          <button
            onClick={() => {
              onCreateTicket(selectedAlert);
            }}
            className="px-5 py-2.5 border border-[#c2c6d6] text-[#191c1e] font-bold text-xs rounded-lg hover:bg-[#f2f4f6] transition-colors cursor-pointer"
          >
            Chuyển Giao Phiếu
          </button>
          <button
            onClick={() => onResolveAlert(selectedAlert.id)}
            className="px-5 py-2.5 bg-[#00855b] text-white font-bold text-xs rounded-lg hover:bg-[#006947] transition-colors shadow-xs flex items-center gap-1.5 cursor-pointer active:scale-95"
          >
            <Check className="w-4 h-4" />
            Đánh Dấu Đã Xử Lý
          </button>
        </div>
      </div>
    </div>
  );
};
