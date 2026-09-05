import React, { useState } from 'react';
import { 
  FileText, 
  Download, 
  Filter, 
  Search, 
  CheckCircle2, 
  AlertCircle, 
  Bot, 
  User, 
  ChevronLeft, 
  ChevronRight,
  Code,
  Shield,
  Eye,
  Check,
  Activity
} from 'lucide-react';
import { AuditLogItem } from '../types';

interface AuditLogsViewProps {
  logs: AuditLogItem[];
  searchQuery: string;
  onSearchChange: (q: string) => void;
}

export const AuditLogsView: React.FC<AuditLogsViewProps> = ({
  logs,
  searchQuery,
  onSearchChange
}) => {
  const [actionFilter, setActionFilter] = useState<string>('All Actions');
  const [statusFilter, setStatusFilter] = useState<string>('All Statuses');
  const [selectedLogForJson, setSelectedLogForJson] = useState<AuditLogItem | null>(null);
  const [downloadSuccess, setDownloadSuccess] = useState<boolean>(false);
  const [currentPage, setCurrentPage] = useState<number>(1);

  const filteredLogs = logs.filter(log => {
    const matchesAction = actionFilter === 'All Actions' || log.action.toLowerCase().includes(actionFilter.toLowerCase());
    const matchesStatus = statusFilter === 'All Statuses' || log.status === statusFilter;
    const matchesSearch = !searchQuery ||
      log.user.toLowerCase().includes(searchQuery.toLowerCase()) ||
      log.action.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (log.target && log.target.toLowerCase().includes(searchQuery.toLowerCase())) ||
      log.ipAddress.toLowerCase().includes(searchQuery.toLowerCase());

    return matchesAction && matchesStatus && matchesSearch;
  });

  const handleExportCSV = () => {
    const headers = ['ID', 'Timestamp', 'User', 'Action', 'Target', 'IP Address', 'Status'];
    const rows = filteredLogs.map(l => [
      l.id,
      `"${l.timestamp}"`,
      `"${l.user}"`,
      `"${l.action}"`,
      `"${l.target || 'N/A'}"`,
      `"${l.ipAddress}"`,
      `"${l.status}"`
    ]);

    const csvContent = [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `AR_IMMS_AUDIT_LOGS_${new Date().toISOString().slice(0, 10)}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);

    setDownloadSuccess(true);
    setTimeout(() => setDownloadSuccess(false), 2500);
  };

  return (
    <div className="p-4 md:p-6 max-w-[1600px] mx-auto flex flex-col gap-6 text-slate-100">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl md:text-2xl lg:text-3xl font-black text-white tracking-tight">Nhật Ký Kiểm Toán & Hệ Thống</h1>
            <span className="px-2 py-0.5 rounded-md text-[10px] font-mono font-bold bg-sky-500/10 text-sky-400 border border-sky-500/20">
              Audit Trail
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-0.5">Lưu vết hoạt động bất biến, nhật ký truy cập và lịch sử bảo mật toàn hệ thống.</p>
        </div>

        {/* Filters & Export */}
        <div className="w-full md:w-auto flex flex-col sm:flex-row gap-3">
          <div className="flex items-center bg-slate-900/90 rounded-xl px-3 py-2 border border-slate-700/80 hover:border-sky-500 transition-colors shadow-inner">
            <Filter className="w-4 h-4 text-slate-400 mr-2 shrink-0" />
            <select
              value={actionFilter}
              onChange={(e) => setActionFilter(e.target.value)}
              className="bg-transparent border-none focus:outline-none text-xs font-semibold text-slate-200 cursor-pointer outline-none"
            >
              <option value="All Actions">Tất cả hành động</option>
              <option value="Alert">Cảnh báo (Alerts)</option>
              <option value="Deleted">Xóa bỏ (Deletions)</option>
              <option value="Updated">Chỉnh sửa (Modifications)</option>
              <option value="Login">Xác thực đăng nhập (Auth)</option>
            </select>
          </div>

          <button
            onClick={handleExportCSV}
            className="bg-slate-800/80 hover:bg-slate-800 border border-slate-700 text-slate-200 px-4 py-2 rounded-xl text-xs font-bold flex items-center justify-center gap-2 transition-all cursor-pointer"
          >
            {downloadSuccess ? (
              <>
                <Check className="w-4 h-4 text-emerald-400" />
                <span className="text-emerald-300">Đã Xuất CSV!</span>
              </>
            ) : (
              <>
                <Download className="w-4 h-4 text-slate-400" />
                <span>Xuất Báo Cáo CSV</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Audit Log Table Container */}
      <div className="glass-card rounded-2xl overflow-hidden flex flex-col">
        <div className="px-5 py-3.5 border-b border-slate-800/80 flex justify-between items-center bg-slate-900/60">
          <h2 className="text-sm font-bold text-white flex items-center gap-2">
            <Activity className="w-4 h-4 text-sky-400" />
            Bản Ghi Sự Kiện Bảo Mật
          </h2>
          <span className="text-xs font-mono font-bold bg-sky-500/15 text-sky-300 border border-sky-500/30 px-2.5 py-0.5 rounded-md">
            {filteredLogs.length} Records
          </span>
        </div>

        <div className="overflow-x-auto p-2">
          <table className="w-full text-left border-collapse font-mono text-xs">
            <thead>
              <tr className="border-b border-slate-800 text-[11px] font-bold text-slate-400 font-sans">
                <th className="p-3">Thời Gian (UTC+7)</th>
                <th className="p-3">Người Dùng Thực Hiện</th>
                <th className="p-3">Hành Động / Sự Kiện</th>
                <th className="p-3">Mục Tiêu (Target)</th>
                <th className="p-3">Địa Chỉ IP</th>
                <th className="p-3">Trạng Thái</th>
                <th className="p-3 text-right">Raw JSON</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {filteredLogs.map((log) => {
                const isSuccess = log.status === 'Success';
                const isWarning = log.status === 'Warning';
                const isSystem = log.userType === 'system';

                return (
                  <tr key={log.id} className="hover:bg-slate-800/40 transition-colors">
                    <td className="p-3 text-slate-400 text-[11px] whitespace-nowrap">{log.timestamp}</td>
                    <td className="p-3">
                      <div className="flex items-center gap-2 font-sans">
                        {isSystem ? (
                          <div className="w-6 h-6 rounded-md bg-purple-500/20 text-purple-400 flex items-center justify-center text-[10px]">
                            <Bot className="w-3.5 h-3.5" />
                          </div>
                        ) : (
                          <div className="w-6 h-6 rounded-md bg-sky-500/20 text-sky-400 flex items-center justify-center text-[10px] font-bold">
                            {log.initials || 'U'}
                          </div>
                        )}
                        <span className="font-bold text-slate-200 text-xs">{log.user}</span>
                      </div>
                    </td>
                    <td className="p-3 text-slate-200 font-sans font-medium">{log.action}</td>
                    <td className="p-3 text-sky-400">{log.target || '—'}</td>
                    <td className="p-3 text-slate-400 text-[11px]">{log.ipAddress}</td>
                    <td className="p-3">
                      <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-sans font-bold ${
                        isSuccess 
                          ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30' 
                          : isWarning 
                          ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30' 
                          : 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                      }`}>
                        {log.status}
                      </span>
                    </td>
                    <td className="p-3 text-right">
                      <button
                        onClick={() => setSelectedLogForJson(log)}
                        className="p-1 rounded text-slate-400 hover:text-sky-300 hover:bg-sky-500/20 transition-colors"
                        title="Xem chi tiết JSON payload"
                      >
                        <Code className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* JSON Payload Modal */}
      {selectedLogForJson && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="glass-card rounded-2xl max-w-lg w-full p-5 border border-slate-700 shadow-2xl animate-in fade-in zoom-in-95">
            <div className="flex justify-between items-center pb-3 border-b border-slate-800 mb-4">
              <span className="text-sm font-bold text-white flex items-center gap-2">
                <Code className="w-4 h-4 text-sky-400" />
                Raw Event Payload
              </span>
              <button 
                onClick={() => setSelectedLogForJson(null)}
                className="text-slate-400 hover:text-white"
              >
                ✕
              </button>
            </div>
            <pre className="bg-[#060911] p-4 rounded-xl border border-slate-800 text-[11px] text-sky-300 font-mono overflow-x-auto max-h-80">
              {JSON.stringify(selectedLogForJson, null, 2)}
            </pre>
          </div>
        </div>
      )}
    </div>
  );
};
