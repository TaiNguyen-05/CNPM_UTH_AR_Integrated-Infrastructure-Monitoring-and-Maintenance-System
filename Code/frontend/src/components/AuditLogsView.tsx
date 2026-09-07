import React, { useState, useMemo } from 'react';
import { 
  Download, 
  Filter, 
  Bot, 
  Code, 
  Check, 
  Activity,
  Search,
  ShieldCheck,
  Clock
} from 'lucide-react';
import { AuditLogItem } from '../types';

interface AuditLogsViewProps {
  logs?: AuditLogItem[];
  auditLogs?: AuditLogItem[];
  searchQuery?: string;
  onSearchChange?: (q: string) => void;
}

export const AuditLogsView: React.FC<AuditLogsViewProps> = ({
  logs,
  auditLogs,
  searchQuery: externalSearchQuery,
  onSearchChange
}) => {
  const [localSearch, setLocalSearch] = useState<string>('');
  const [actionFilter, setActionFilter] = useState<string>('All Actions');
  const [statusFilter, setStatusFilter] = useState<string>('All Statuses');
  const [selectedLogForJson, setSelectedLogForJson] = useState<AuditLogItem | null>(null);
  const [downloadSuccess, setDownloadSuccess] = useState<boolean>(false);

  const activeSearch = externalSearchQuery !== undefined ? externalSearchQuery : localSearch;
  const handleSearch = (val: string) => {
    if (onSearchChange) onSearchChange(val);
    setLocalSearch(val);
  };

  const rawLogs = useMemo(() => {
    if (Array.isArray(logs)) return logs;
    if (Array.isArray(auditLogs)) return auditLogs;
    return [];
  }, [logs, auditLogs]);

  const filteredLogs = useMemo(() => {
    return rawLogs.filter(log => {
      if (!log) return false;
      const matchesAction = actionFilter === 'All Actions' || (log.action && log.action.toLowerCase().includes(actionFilter.toLowerCase()));
      const matchesStatus = statusFilter === 'All Statuses' || log.status === statusFilter;
      const matchesSearch = !activeSearch ||
        (log.user && log.user.toLowerCase().includes(activeSearch.toLowerCase())) ||
        (log.action && log.action.toLowerCase().includes(activeSearch.toLowerCase())) ||
        (log.target && log.target.toLowerCase().includes(activeSearch.toLowerCase())) ||
        (log.ipAddress && log.ipAddress.toLowerCase().includes(activeSearch.toLowerCase()));

      return matchesAction && matchesStatus && matchesSearch;
    });
  }, [rawLogs, actionFilter, statusFilter, activeSearch]);

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
    <div className="max-container">
      {/* Page Header */}
      <div className="view-header">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="view-title">Nhật Ký Kiểm Toán & Hệ Thống</h1>
            <span className="badge-pill">
              Audit Trail
            </span>
          </div>
          <p className="view-subtitle">Lưu vết hoạt động bất biến, nhật ký truy cập và lịch sử bảo mật toàn hệ thống.</p>
        </div>

        {/* Filters & Export */}
        <div className="w-full md:w-auto flex flex-col sm:flex-row items-center gap-3">
          {/* Search bar */}
          <div className="search-wrapper w-full sm:w-64">
            <Search className="w-4 h-4 text-slate-400 mr-2 shrink-0" />
            <input
              type="text"
              placeholder="Tìm user, IP, hành động..."
              value={activeSearch}
              onChange={(e) => handleSearch(e.target.value)}
              className="bg-transparent border-none text-xs text-slate-200 placeholder-slate-500 focus:outline-none w-full font-mono"
            />
          </div>

          <div className="flex items-center bg-[#11161b] rounded-xl px-3 py-2 border border-[#222c37] w-full sm:w-auto">
            <Filter className="w-4 h-4 text-slate-400 mr-2 shrink-0" />
            <select
              value={actionFilter}
              onChange={(e) => setActionFilter(e.target.value)}
              className="bg-transparent border-none focus:outline-none text-xs font-semibold text-slate-200 cursor-pointer outline-none w-full sm:w-auto"
            >
              <option value="All Actions" className="bg-[#11161b]">Tất cả hành động</option>
              <option value="Alert" className="bg-[#11161b]">Cảnh báo (Alerts)</option>
              <option value="Deleted" className="bg-[#11161b]">Xóa bỏ (Deletions)</option>
              <option value="Updated" className="bg-[#11161b]">Chỉnh sửa (Modifications)</option>
              <option value="Login" className="bg-[#11161b]">Xác thực đăng nhập (Auth)</option>
            </select>
          </div>

          <button
            onClick={handleExportCSV}
            className="btn-secondary py-2 px-4 text-xs whitespace-nowrap w-full sm:w-auto"
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
      <div className="card-surface">
        <div className="card-header">
          <h2 className="section-title">
            <Activity className="w-4 h-4 text-[#38bdf8]" />
            Bản Ghi Sự Kiện Bảo Mật
          </h2>
          <span className="badge-pill">
            {filteredLogs.length} Records
          </span>
        </div>

        <div className="table-wrapper">
          <table className="table-main font-mono text-xs">
            <thead>
              <tr className="table-head-tr">
                <th className="table-cell">Thời Gian (UTC+7)</th>
                <th className="table-cell">Người Dùng Thực Hiện</th>
                <th className="table-cell">Hành Động / Sự Kiện</th>
                <th className="table-cell">Mục Tiêu (Target)</th>
                <th className="table-cell">Địa Chỉ IP</th>
                <th className="table-cell">Trạng Thái</th>
                <th className="table-cell text-right">Raw JSON</th>
              </tr>
            </thead>
            <tbody className="table-body">
              {filteredLogs.length === 0 ? (
                <tr>
                  <td colSpan={7} className="p-8 text-center text-slate-400 font-sans">
                    Không tìm thấy bản ghi nhật ký phù hợp với bộ lọc.
                  </td>
                </tr>
              ) : (
                filteredLogs.map((log) => {
                  const isSuccess = log.status === 'Success';
                  const isWarning = log.status === 'Warning';
                  const isSystem = log.userType === 'system';

                  return (
                    <tr key={log.id} className="table-row">
                      <td className="table-cell text-slate-400 text-[11px] whitespace-nowrap">{log.timestamp}</td>
                      <td className="table-cell">
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
                      <td className="table-cell text-slate-200 font-sans font-medium">{log.action}</td>
                      <td className="table-cell text-[#38bdf8]">{log.target || '—'}</td>
                      <td className="table-cell text-slate-400 text-[11px]">{log.ipAddress}</td>
                      <td className="table-cell">
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
                      <td className="table-cell text-right">
                        <button
                          onClick={() => setSelectedLogForJson(log)}
                          className="p-1 rounded text-slate-400 hover:text-sky-300 hover:bg-sky-500/20 transition-colors cursor-pointer"
                          title="Xem chi tiết JSON payload"
                        >
                          <Code className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* JSON Payload Modal */}
      {selectedLogForJson && (
        <div className="modal-overlay">
          <div className="modal-box max-w-lg p-5">
            <div className="flex justify-between items-center pb-3 border-b border-[#222c37] mb-4">
              <span className="text-sm font-bold text-white flex items-center gap-2 font-mono">
                <Code className="w-4 h-4 text-[#38bdf8]" />
                Raw Event Payload
              </span>
              <button 
                onClick={() => setSelectedLogForJson(null)}
                className="modal-close-btn"
              >
                ✕
              </button>
            </div>
            <pre className="bg-[#0c1015] p-4 rounded-xl border border-[#222c37] text-[11px] text-[#38bdf8] font-mono overflow-x-auto max-h-80">
              {JSON.stringify(selectedLogForJson, null, 2)}
            </pre>
          </div>
        </div>
      )}
    </div>
  );
};
