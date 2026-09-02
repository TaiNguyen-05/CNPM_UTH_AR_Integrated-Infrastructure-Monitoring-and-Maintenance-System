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
  Check
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
    <div className="p-4 md:p-6 max-w-[1600px] mx-auto flex flex-col gap-6">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-2xl lg:text-3xl font-bold text-[#191c1e] tracking-tight">Nhật Ký Kiểm Toán & Hệ Thống</h1>
          <p className="text-xs text-[#727785] mt-0.5">Lưu vết hoạt động bất biến và lịch sử bảo mật toàn hệ thống.</p>
        </div>

        {/* Filters & Export */}
        <div className="w-full md:w-auto flex flex-col sm:flex-row gap-3">
          <div className="flex items-center bg-white rounded-lg px-3 py-2 border border-[#c2c6d6] hover:border-[#0058be] transition-colors shadow-xs">
            <Filter className="w-4 h-4 text-[#727785] mr-2 shrink-0" />
            <select
              value={actionFilter}
              onChange={(e) => setActionFilter(e.target.value)}
              className="bg-transparent border-none focus:outline-none text-xs font-semibold text-[#191c1e] cursor-pointer outline-none"
            >
              <option value="All Actions">Tất cả hành động</option>
              <option value="Alert">Cảnh báo (Alerts)</option>
              <option value="Deleted">Xóa bỏ (Deletions)</option>
              <option value="Updated">Chỉnh sửa (Modifications)</option>
              <option value="Login">Xác thực đăng nhập (Auth)</option>
            </select>
          </div>

          <div className="flex items-center bg-white rounded-lg px-3 py-2 border border-[#c2c6d6] hover:border-[#0058be] transition-colors shadow-xs">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="bg-transparent border-none focus:outline-none text-xs font-semibold text-[#191c1e] cursor-pointer outline-none"
            >
              <option value="All Statuses">Tất cả trạng thái</option>
              <option value="Success">Thành công (Success)</option>
              <option value="Critical">Nghiêm trọng (Critical)</option>
              <option value="Warning">Cảnh báo (Warning)</option>
            </select>
          </div>

          <button
            onClick={handleExportCSV}
            className="bg-[#0058be] text-white px-4 py-2 rounded-full text-xs font-bold flex items-center justify-center gap-2 hover:bg-[#2170e4] transition-colors shadow-xs cursor-pointer active:scale-95"
          >
            {downloadSuccess ? (
              <>
                <Check className="w-4 h-4" />
                Đã Xuất File!
              </>
            ) : (
              <>
                <Download className="w-4 h-4" />
                Xuất CSV
              </>
            )}
          </button>
        </div>
      </div>

      {/* Main Audit Table */}
      <div className="bg-white rounded-xl border border-[#c2c6d6] shadow-xs overflow-hidden flex flex-col min-h-[500px]">
        <div className="px-4 py-3.5 border-b border-[#c2c6d6] flex justify-between items-center bg-[#f8fafc]">
          <h2 className="text-sm font-bold text-[#191c1e]">Lịch Sử Sự Kiện & Bảo Mật</h2>
          <span className="text-xs font-bold bg-[#d0e1fb] text-[#004395] px-2.5 py-0.5 rounded-full">
            {filteredLogs.length} Sự kiện
          </span>
        </div>

        <div className="overflow-x-auto flex-1 p-2">
          <table className="w-full text-left border-collapse">
            <thead className="sticky top-0 bg-white z-10 border-b border-[#c2c6d6] shadow-2xs">
              <tr>
                <th className="p-3 text-xs font-bold text-[#424754]">Thời Gian</th>
                <th className="p-3 text-xs font-bold text-[#424754]">Người Thực Hiện / Tác Tử</th>
                <th className="p-3 text-xs font-bold text-[#424754]">Hành Động</th>
                <th className="p-3 text-xs font-bold text-[#424754]">Mục Tiêu</th>
                <th className="p-3 text-xs font-bold text-[#424754]">Địa Chỉ IP</th>
                <th className="p-3 text-xs font-bold text-[#424754]">Trạng Thái</th>
                <th className="p-3 text-xs font-bold text-[#424754] text-right">Chi Tiết Payload</th>
              </tr>
            </thead>
            <tbody className="text-xs divide-y divide-[#c2c6d6]/60">
              {filteredLogs.map((log) => {
                const isSuccess = log.status === 'Success';
                const isCrit = log.status === 'Critical';

                return (
                  <tr key={log.id} className="hover:bg-[#f2f4f6] transition-colors">
                    {/* Timestamp */}
                    <td className="p-3 font-mono text-[#424754] whitespace-nowrap">{log.timestamp}</td>

                    {/* Actor */}
                    <td className="p-3 whitespace-nowrap">
                      <div className="flex items-center gap-2">
                        {log.userType === 'system' ? (
                          <div className="w-6 h-6 rounded-full bg-[#1e293b] text-white flex items-center justify-center">
                            <Bot className="w-3.5 h-3.5" />
                          </div>
                        ) : log.userType === 'unknown' ? (
                          <div className="w-6 h-6 rounded-full bg-[#ffdad6] text-[#ba1a1a] flex items-center justify-center font-bold text-[10px]">
                            ?
                          </div>
                        ) : (
                          <div className="w-6 h-6 rounded-full bg-[#d0e1fb] text-[#004395] flex items-center justify-center font-bold text-[10px]">
                            {log.initials || 'U'}
                          </div>
                        )}
                        <span className="font-semibold text-[#191c1e]">{log.user}</span>
                      </div>
                    </td>

                    {/* Action */}
                    <td className="p-3 font-semibold text-[#191c1e]">{log.action}</td>

                    {/* Target */}
                    <td className="p-3 font-mono text-[#0058be]">
                      {log.target ? (
                        <span className="bg-[#f0f4f9] px-1.5 py-0.5 rounded border border-[#c2c6d6]">
                          {log.target}
                        </span>
                      ) : (
                        <span className="text-[#727785] italic">--</span>
                      )}
                    </td>

                    {/* IP */}
                    <td className="p-3 font-mono text-[#727785]">{log.ipAddress}</td>

                    {/* Status */}
                    <td className="p-3">
                      {isSuccess ? (
                        <span className="inline-flex items-center gap-1 text-[#006947] bg-[#6ffbbe]/40 px-2 py-0.5 rounded text-[11px] font-bold">
                          <CheckCircle2 className="w-3.5 h-3.5" /> Thành công
                        </span>
                      ) : isCrit ? (
                        <span className="inline-flex items-center gap-1 text-[#93000a] bg-[#ffdad6] px-2 py-0.5 rounded text-[11px] font-bold">
                          <AlertCircle className="w-3.5 h-3.5" /> Nghiêm trọng
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-yellow-800 bg-yellow-100 px-2 py-0.5 rounded text-[11px] font-bold">
                          Cảnh báo
                        </span>
                      )}
                    </td>

                    {/* Payload inspect */}
                    <td className="p-3 text-right">
                      <button
                        onClick={() => setSelectedLogForJson(log)}
                        className="p-1 rounded text-[#424754] hover:text-[#0058be] hover:bg-[#d8e2ff] transition-colors cursor-pointer"
                        title="Xem Dữ Liệu JSON"
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

        {/* Pagination Bar */}
        <div className="p-3 border-t border-[#c2c6d6] bg-[#f8fafc] flex justify-between items-center text-xs text-[#424754]">
          <span>Hiển thị 1 đến {filteredLogs.length} trên tổng {filteredLogs.length} bản ghi</span>
          <div className="flex items-center gap-1">
            <button 
              disabled={currentPage === 1}
              onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
              className="p-1.5 rounded border border-[#c2c6d6] hover:bg-white disabled:opacity-40"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <span className="px-2 font-bold text-[#191c1e]">Trang {currentPage} / 1</span>
            <button 
              disabled={true}
              className="p-1.5 rounded border border-[#c2c6d6] hover:bg-white disabled:opacity-40"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* JSON Inspection Modal */}
      {selectedLogForJson && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl border border-[#c2c6d6] shadow-xl p-6 max-w-lg w-full animate-in fade-in">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-base font-bold text-[#191c1e]">Payload Nhật Ký Bất Biến</h3>
              <button 
                onClick={() => setSelectedLogForJson(null)}
                className="text-[#727785] hover:text-[#191c1e] text-xs font-bold cursor-pointer"
              >
                Đóng
              </button>
            </div>

            <div className="bg-[#1e293b] p-4 rounded-lg overflow-x-auto text-xs font-mono text-[#f8fafc] max-h-72">
              <pre>{JSON.stringify(selectedLogForJson, null, 2)}</pre>
            </div>

            <div className="mt-4 flex justify-end">
              <button
                onClick={() => setSelectedLogForJson(null)}
                className="px-4 py-2 bg-[#0058be] text-white rounded-lg text-xs font-bold hover:bg-[#2170e4] cursor-pointer"
              >
                Hoàn Tất
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
