import React, { useState } from 'react';
import { 
  Wrench, 
  CheckCircle2, 
  Clock, 
  AlertTriangle, 
  User, 
  PlusCircle, 
  Search, 
  Filter, 
  Check, 
  X, 
  QrCode, 
  Layers, 
  Cpu, 
  ShieldAlert, 
  ChevronRight, 
  MessageSquare, 
  Activity, 
  PlayCircle, 
  Archive, 
  RotateCcw,
  Sparkles,
  Zap,
  Server
} from 'lucide-react';
import { TicketItem, TicketStatus, TicketPriority, ARActionLog, UserItem } from '../types';

interface TicketsViewProps {
  tickets: TicketItem[];
  technicians?: UserItem[];
  nodes?: { id: string; name: string; rack_id?: string }[];
  currentUser?: { id: string; name: string; role: string } | null;
  onCreateTicket?: (ticket: {
    server_node_id: string;
    title: string;
    description: string;
    priority: TicketPriority;
    assigned_technician_id?: string;
    assigned_technician_name?: string;
  }) => Promise<void> | void;
  onAssignTicket?: (ticketId: string, technicianId: string, technicianName?: string) => Promise<void> | void;
  onAddArLog?: (ticketId: string, action: string, details?: Record<string, any>) => Promise<void> | void;
  onResolveTicket?: (ticketId: string, notes?: string) => Promise<void> | void;
  onCloseTicket?: (ticketId: string) => Promise<void> | void;
  onDeleteTicket?: (ticketId: string) => Promise<void> | void;
  onLaunchARView?: (nodeId: string) => void;
}

export const TicketsView: React.FC<TicketsViewProps> = ({
  tickets = [],
  technicians = [],
  nodes = [],
  currentUser,
  onCreateTicket,
  onAssignTicket,
  onAddArLog,
  onResolveTicket,
  onCloseTicket,
  onDeleteTicket,
  onLaunchARView
}) => {
  const [selectedTicketId, setSelectedTicketId] = useState<string | null>(tickets[0]?.id || null);
  const [filterStatus, setFilterStatus] = useState<string>('ALL');
  const [filterPriority, setFilterPriority] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState<string>('');

  // Modals state
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showAssignModal, setShowAssignModal] = useState(false);
  const [showArLogModal, setShowArLogModal] = useState(false);
  const [showResolveModal, setShowResolveModal] = useState(false);
  const [targetTicket, setTargetTicket] = useState<TicketItem | null>(null);

  // Form states
  const [newTitle, setNewTitle] = useState('');
  const [newNodeId, setNewNodeId] = useState(nodes[0]?.id || 'node-a1-1');
  const [newPriority, setNewPriority] = useState<TicketPriority>('MEDIUM');
  const [newDesc, setNewDesc] = useState('');
  const [newTechId, setNewTechId] = useState('');

  const [assignTechId, setAssignTechId] = useState('');
  const [arActionType, setArActionType] = useState('QR_SCAN_POSITION');
  const [arActionNotes, setArActionNotes] = useState('');
  const [resolutionNotes, setResolutionNotes] = useState('');

  // KPIs
  const totalCount = tickets.length;
  const inProgressCount = tickets.filter(t => t.status === 'IN_PROGRESS' || t.status === 'ASSIGNED').length;
  const resolvedCount = tickets.filter(t => t.status === 'RESOLVED').length;
  const closedCount = tickets.filter(t => t.status === 'CLOSED').length;
  const criticalCount = tickets.filter(t => t.priority === 'CRITICAL' && t.status !== 'CLOSED').length;

  const filteredTickets = tickets.filter(t => {
    if (filterStatus !== 'ALL' && t.status !== filterStatus) return false;
    if (filterPriority !== 'ALL' && t.priority !== filterPriority) return false;
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      return (
        t.title.toLowerCase().includes(q) ||
        t.id.toLowerCase().includes(q) ||
        (t.serverNodeName && t.serverNodeName.toLowerCase().includes(q)) ||
        (t.assignedTechnicianName && t.assignedTechnicianName.toLowerCase().includes(q))
      );
    }
    return true;
  });

  const selectedTicket = tickets.find(t => t.id === selectedTicketId) || filteredTickets[0] || tickets[0] || null;

  const getStatusBadge = (status: TicketStatus) => {
    switch (status) {
      case 'CREATED':
        return <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-sky-500/20 text-sky-300 border border-sky-500/40 flex items-center gap-1"><Clock className="w-3 h-3" /> Mới Tạo</span>;
      case 'ASSIGNED':
        return <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-indigo-500/20 text-indigo-300 border border-indigo-500/40 flex items-center gap-1"><User className="w-3 h-3" /> Đã Giao Việc</span>;
      case 'IN_PROGRESS':
        return <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-amber-500/20 text-amber-300 border border-amber-500/40 flex items-center gap-1"><Activity className="w-3 h-3 animate-pulse" /> Đang Xử Lý</span>;
      case 'RESOLVED':
        return <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 flex items-center gap-1"><CheckCircle2 className="w-3 h-3" /> Chờ Nghiệm Thu</span>;
      case 'CLOSED':
        return <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-slate-600/30 text-slate-400 border border-slate-600/40 flex items-center gap-1"><Archive className="w-3 h-3" /> Đã Đóng</span>;
      default:
        return <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-slate-700 text-slate-300">{status}</span>;
    }
  };

  const getPriorityBadge = (priority: TicketPriority) => {
    switch (priority) {
      case 'CRITICAL':
        return <span className="px-2 py-0.5 rounded text-[11px] font-bold bg-rose-500/20 text-rose-400 border border-rose-500/30">Khẩn cấp</span>;
      case 'HIGH':
        return <span className="px-2 py-0.5 rounded text-[11px] font-bold bg-orange-500/20 text-orange-400 border border-orange-500/30">Cao</span>;
      case 'MEDIUM':
        return <span className="px-2 py-0.5 rounded text-[11px] font-bold bg-yellow-500/20 text-yellow-400 border border-yellow-500/30">Trung bình</span>;
      case 'LOW':
        return <span className="px-2 py-0.5 rounded text-[11px] font-bold bg-cyan-500/20 text-cyan-400 border border-cyan-500/30">Thấp</span>;
      default:
        return <span className="px-2 py-0.5 rounded text-[11px] font-bold bg-slate-700 text-slate-300">{priority}</span>;
    }
  };

  const handleCreateSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim()) return;
    const tech = technicians.find(t => t.id === newTechId);
    if (onCreateTicket) {
      await onCreateTicket({
        server_node_id: newNodeId,
        title: newTitle.trim(),
        description: newDesc.trim(),
        priority: newPriority,
        assigned_technician_id: newTechId || undefined,
        assigned_technician_name: tech ? tech.name : undefined
      });
    }
    setShowCreateModal(false);
    setNewTitle('');
    setNewDesc('');
  };

  const handleAssignSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!targetTicket || !assignTechId) return;
    const tech = technicians.find(t => t.id === assignTechId);
    if (onAssignTicket) {
      await onAssignTicket(targetTicket.id, assignTechId, tech?.name || 'Kỹ thuật viên');
    }
    setShowAssignModal(false);
  };

  const handleArLogSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!targetTicket) return;
    if (onAddArLog) {
      await onAddArLog(targetTicket.id, arActionType, {
        notes: arActionNotes,
        operator: currentUser?.name || 'Technician',
        recordedAt: new Date().toISOString()
      });
    }
    setShowArLogModal(false);
    setArActionNotes('');
  };

  const handleResolveSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!targetTicket) return;
    if (onResolveTicket) {
      await onResolveTicket(targetTicket.id, resolutionNotes || 'Đã hoàn tất can thiệp và kiểm tra luồng nhiệt độ.');
    }
    setShowResolveModal(false);
    setResolutionNotes('');
  };

  return (
    <div className="flex-1 flex flex-col h-[calc(100vh-4rem)] overflow-hidden bg-[#090d16] text-slate-100">
      {/* Top Header & KPI summary */}
      <div className="p-4 md:px-6 border-b border-slate-800/80 bg-slate-900/40 flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-black text-white flex items-center gap-2.5">
            <Wrench className="w-5 h-5 text-sky-400" />
            Vòng Đời Phiếu Bảo Trì & Điều Phối AR
          </h1>
          <p className="text-xs text-slate-400 mt-0.5">
            Quản trị quy trình từ tiếp nhận cảnh báo, phân công kỹ thuật viên đến can thiệp AR tại hiện trường & nghiệm thu.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => setShowCreateModal(true)}
            className="px-4 py-2 bg-gradient-to-r from-sky-500 to-blue-600 hover:from-sky-400 hover:to-blue-500 text-white font-bold text-xs rounded-xl shadow-md shadow-sky-500/25 flex items-center gap-2 cursor-pointer transition-all active:scale-95"
          >
            <PlusCircle className="w-4 h-4" />
            Tạo Phiếu Bảo Trì Mới
          </button>
        </div>
      </div>

      {/* KPI Stats Bar */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 px-4 md:px-6 py-3 border-b border-slate-800/60 bg-[#0c1220]/60">
        <div className="flex items-center gap-3 bg-slate-900/60 p-3 rounded-xl border border-slate-800">
          <div className="w-10 h-10 rounded-lg bg-sky-500/10 text-sky-400 flex items-center justify-center font-bold">
            <Layers className="w-5 h-5" />
          </div>
          <div>
            <div className="text-[11px] text-slate-400 font-semibold">Tổng số phiếu</div>
            <div className="text-lg font-black text-white font-mono">{totalCount}</div>
          </div>
        </div>

        <div className="flex items-center gap-3 bg-slate-900/60 p-3 rounded-xl border border-slate-800">
          <div className="w-10 h-10 rounded-lg bg-amber-500/10 text-amber-400 flex items-center justify-center font-bold">
            <Activity className="w-5 h-5" />
          </div>
          <div>
            <div className="text-[11px] text-slate-400 font-semibold">Đang xử lý / Giao việc</div>
            <div className="text-lg font-black text-amber-400 font-mono">{inProgressCount}</div>
          </div>
        </div>

        <div className="flex items-center gap-3 bg-slate-900/60 p-3 rounded-xl border border-slate-800">
          <div className="w-10 h-10 rounded-lg bg-emerald-500/10 text-emerald-400 flex items-center justify-center font-bold">
            <CheckCircle2 className="w-5 h-5" />
          </div>
          <div>
            <div className="text-[11px] text-slate-400 font-semibold">Chờ nghiệm thu</div>
            <div className="text-lg font-black text-emerald-400 font-mono">{resolvedCount}</div>
          </div>
        </div>

        <div className="flex items-center gap-3 bg-slate-900/60 p-3 rounded-xl border border-slate-800">
          <div className="w-10 h-10 rounded-lg bg-rose-500/10 text-rose-400 flex items-center justify-center font-bold">
            <ShieldAlert className="w-5 h-5" />
          </div>
          <div>
            <div className="text-[11px] text-slate-400 font-semibold">Khẩn cấp</div>
            <div className="text-lg font-black text-rose-400 font-mono">{criticalCount}</div>
          </div>
        </div>
      </div>

      {/* Main Container: Left List & Right Detail Pane */}
      <div className="flex-1 flex flex-col lg:flex-row overflow-hidden">
        {/* Left Side: Ticket List */}
        <div className="w-full lg:w-5/12 border-r border-slate-800/80 flex flex-col bg-[#0b101d] h-full shrink-0">
          {/* Search & Filter Bar */}
          <div className="p-3 border-b border-slate-800/80 space-y-2.5 bg-slate-900/40">
            <div className="relative">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                placeholder="Tìm phiếu theo mã, tiêu đề, node..."
                className="w-full pl-9 pr-3 py-1.5 bg-slate-950/80 border border-slate-800 rounded-lg text-xs text-white placeholder-slate-500 focus:outline-none focus:border-sky-500 transition-colors"
              />
            </div>

            <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs">
              {['ALL', 'CREATED', 'ASSIGNED', 'IN_PROGRESS', 'RESOLVED', 'CLOSED'].map(st => (
                <button
                  key={st}
                  onClick={() => setFilterStatus(st)}
                  className={`px-2.5 py-1 rounded-md font-semibold whitespace-nowrap transition-colors cursor-pointer text-[11px] ${
                    filterStatus === st
                      ? 'bg-sky-500 text-white shadow-sm'
                      : 'bg-slate-800/60 text-slate-400 hover:text-slate-200 hover:bg-slate-800'
                  }`}
                >
                  {st === 'ALL' ? 'Tất cả' : st === 'CREATED' ? 'Mới tạo' : st === 'ASSIGNED' ? 'Đã giao' : st === 'IN_PROGRESS' ? 'Đang sửa' : st === 'RESOLVED' ? 'Chờ duyệt' : 'Đã đóng'}
                </button>
              ))}
            </div>
          </div>

          {/* Ticket Items List */}
          <div className="flex-1 overflow-y-auto divide-y divide-slate-800/60">
            {filteredTickets.length === 0 ? (
              <div className="p-8 text-center text-slate-500 text-xs">
                Không tìm thấy phiếu bảo trì nào phù hợp.
              </div>
            ) : (
              filteredTickets.map(ticket => {
                const isSelected = selectedTicket?.id === ticket.id;
                return (
                  <div
                    key={ticket.id}
                    onClick={() => setSelectedTicketId(ticket.id)}
                    className={`p-3.5 transition-all cursor-pointer ${
                      isSelected
                        ? 'bg-sky-950/30 border-l-4 border-l-sky-400 text-white'
                        : 'hover:bg-slate-900/50 text-slate-300'
                    }`}
                  >
                    <div className="flex items-center justify-between gap-2 mb-1.5">
                      <span className="font-mono font-bold text-xs text-sky-300">{ticket.id}</span>
                      <div className="flex items-center gap-1.5">
                        {getPriorityBadge(ticket.priority)}
                        {getStatusBadge(ticket.status)}
                      </div>
                    </div>

                    <h3 className="text-xs font-bold text-slate-100 line-clamp-1 mb-1">
                      {ticket.title}
                    </h3>

                    <div className="flex items-center justify-between text-[11px] text-slate-400 mt-2">
                      <span className="flex items-center gap-1 text-slate-300 font-mono">
                        <Server className="w-3 h-3 text-sky-400" />
                        {ticket.serverNodeName || ticket.serverNodeId}
                      </span>
                      <span className="flex items-center gap-1">
                        <User className="w-3 h-3 text-indigo-400" />
                        {ticket.assignedTechnicianName || 'Chưa phân công'}
                      </span>
                    </div>

                    {ticket.arLogs && ticket.arLogs.length > 0 && (
                      <div className="mt-2 text-[10px] bg-sky-950/40 text-sky-300 px-2 py-0.5 rounded border border-sky-800/40 flex items-center justify-between">
                        <span className="flex items-center gap-1">
                          <QrCode className="w-3 h-3 text-sky-400" />
                          {ticket.arLogs.length} thao tác AR đã ghi
                        </span>
                        <span className="text-slate-400">
                          {ticket.arLogs[ticket.arLogs.length - 1].action}
                        </span>
                      </div>
                    )}
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Right Side: Selected Ticket Detail & Action Center */}
        <div className="flex-1 flex flex-col bg-[#090d16] overflow-y-auto p-4 md:p-6">
          {selectedTicket ? (
            <div className="space-y-6 max-w-5xl">
              {/* Header Details Card */}
              <div className="glass-card rounded-2xl p-5 border border-slate-800/80 bg-slate-900/50">
                <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-800 pb-4 mb-4">
                  <div>
                    <div className="flex items-center gap-2 mb-1.5">
                      <span className="font-mono text-sm font-black text-sky-400">{selectedTicket.id}</span>
                      {getStatusBadge(selectedTicket.status)}
                      {getPriorityBadge(selectedTicket.priority)}
                    </div>
                    <h2 className="text-lg font-black text-white">{selectedTicket.title}</h2>
                  </div>

                  {/* Actions Header Bar */}
                  <div className="flex flex-wrap items-center gap-2">
                    {/* Assign Button */}
                    {selectedTicket.status !== 'CLOSED' && (
                      <button
                        onClick={() => {
                          setTargetTicket(selectedTicket);
                          setAssignTechId(selectedTicket.assignedTechnicianId || '');
                          setShowAssignModal(true);
                        }}
                        className="px-3 py-1.5 bg-indigo-500/20 text-indigo-300 border border-indigo-500/40 hover:bg-indigo-500/30 rounded-xl text-xs font-bold transition-colors cursor-pointer flex items-center gap-1.5"
                      >
                        <User className="w-3.5 h-3.5" />
                        {selectedTicket.assignedTechnicianId ? 'Đổi KTV' : 'Phân công KTV'}
                      </button>
                    )}

                    {/* Start Working Button */}
                    {selectedTicket.status === 'ASSIGNED' && (
                      <button
                        onClick={async () => {
                          if (onAddArLog) {
                            await onAddArLog(selectedTicket.id, 'TECHNICIAN_DISPATCHED', {
                              notes: 'Kỹ thuật viên đã tiếp nhận và bắt đầu di chuyển đến tủ rack.'
                            });
                          }
                        }}
                        className="px-3 py-1.5 bg-amber-500/20 text-amber-300 border border-amber-500/40 hover:bg-amber-500/30 rounded-xl text-xs font-bold transition-colors cursor-pointer flex items-center gap-1.5"
                      >
                        <PlayCircle className="w-3.5 h-3.5" />
                        Bắt Đầu Sửa Chữa
                      </button>
                    )}

                    {/* AR Log Button */}
                    {selectedTicket.status !== 'CLOSED' && (
                      <button
                        onClick={() => {
                          setTargetTicket(selectedTicket);
                          setShowArLogModal(true);
                        }}
                        className="px-3 py-1.5 bg-sky-500/20 text-sky-300 border border-sky-500/40 hover:bg-sky-500/30 rounded-xl text-xs font-bold transition-colors cursor-pointer flex items-center gap-1.5"
                      >
                        <QrCode className="w-3.5 h-3.5" />
                        Ghi Nhật Ký AR
                      </button>
                    )}

                    {/* Resolve Button */}
                    {selectedTicket.status !== 'RESOLVED' && selectedTicket.status !== 'CLOSED' && (
                      <button
                        onClick={() => {
                          setTargetTicket(selectedTicket);
                          setShowResolveModal(true);
                        }}
                        className="px-3 py-1.5 bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 hover:bg-emerald-500/30 rounded-xl text-xs font-bold transition-colors cursor-pointer flex items-center gap-1.5"
                      >
                        <Check className="w-3.5 h-3.5" />
                        Hoàn Tất Xử Lý
                      </button>
                    )}

                    {/* Close / Approve Button */}
                    {selectedTicket.status === 'RESOLVED' && (
                      <button
                        onClick={async () => {
                          if (onCloseTicket) {
                            await onCloseTicket(selectedTicket.id);
                          }
                        }}
                        className="px-4 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold transition-all shadow-md shadow-emerald-600/30 cursor-pointer flex items-center gap-1.5"
                      >
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        Nghiệm Thu & Đóng Phiếu
                      </button>
                    )}

                    {/* AR View launcher */}
                    {onLaunchARView && (
                      <button
                        onClick={() => onLaunchARView(selectedTicket.serverNodeId)}
                        className="px-3 py-1.5 bg-gradient-to-r from-cyan-500 to-sky-600 hover:from-cyan-400 hover:to-sky-500 text-white rounded-xl text-xs font-bold transition-all shadow-sm cursor-pointer flex items-center gap-1.5"
                      >
                        <Sparkles className="w-3.5 h-3.5" />
                        Mở AR HUD
                      </button>
                    )}
                  </div>
                </div>

                {/* Metadata Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                  <div className="p-3 bg-slate-950/60 rounded-xl border border-slate-800">
                    <span className="text-slate-400 block mb-1">Máy chủ / Thiết bị</span>
                    <span className="font-mono font-bold text-sky-300 flex items-center gap-1.5">
                      <Server className="w-3.5 h-3.5 text-sky-400" />
                      {selectedTicket.serverNodeName || selectedTicket.serverNodeId}
                    </span>
                  </div>

                  <div className="p-3 bg-slate-950/60 rounded-xl border border-slate-800">
                    <span className="text-slate-400 block mb-1">Kỹ thuật viên phụ trách</span>
                    <span className="font-bold text-indigo-300 flex items-center gap-1.5">
                      <User className="w-3.5 h-3.5 text-indigo-400" />
                      {selectedTicket.assignedTechnicianName || 'Chưa phân công'}
                    </span>
                  </div>

                  <div className="p-3 bg-slate-950/60 rounded-xl border border-slate-800">
                    <span className="text-slate-400 block mb-1">Thời gian tạo</span>
                    <span className="font-mono text-slate-300 flex items-center gap-1.5">
                      <Clock className="w-3.5 h-3.5 text-slate-400" />
                      {selectedTicket.createdAt ? new Date(selectedTicket.createdAt).toLocaleString('vi-VN') : 'Vừa xong'}
                    </span>
                  </div>
                </div>

                {/* Description */}
                {selectedTicket.description && (
                  <div className="mt-4 p-3.5 bg-slate-950/80 rounded-xl border border-slate-800/80 text-xs text-slate-300">
                    <span className="font-bold text-slate-400 block mb-1">Mô tả sự cố & yêu cầu kỹ thuật:</span>
                    <p className="leading-relaxed">{selectedTicket.description}</p>
                  </div>
                )}

                {/* Resolution Notes (if resolved) */}
                {selectedTicket.resolutionNotes && (
                  <div className="mt-3 p-3.5 bg-emerald-950/30 rounded-xl border border-emerald-500/30 text-xs text-emerald-200">
                    <span className="font-bold text-emerald-300 block mb-1 flex items-center gap-1.5">
                      <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                      Báo cáo xử lý & nghiệm thu:
                    </span>
                    <p className="leading-relaxed">{selectedTicket.resolutionNotes}</p>
                  </div>
                )}
              </div>

              {/* AR Action Timeline Card */}
              <div className="glass-card rounded-2xl p-5 border border-slate-800/80 bg-slate-900/50">
                <div className="flex items-center justify-between mb-4 border-b border-slate-800 pb-3">
                  <h3 className="text-sm font-bold text-white flex items-center gap-2">
                    <QrCode className="w-4 h-4 text-sky-400" />
                    Nhật Ký Thao Tác Kỹ Thuật Số & AR Timeline
                  </h3>
                  <button
                    onClick={() => {
                      setTargetTicket(selectedTicket);
                      setShowArLogModal(true);
                    }}
                    className="text-xs font-bold text-sky-400 hover:text-sky-300 flex items-center gap-1 cursor-pointer"
                  >
                    <PlusCircle className="w-3.5 h-3.5" /> Ghi thêm thao tác
                  </button>
                </div>

                {(!selectedTicket.arLogs || selectedTicket.arLogs.length === 0) ? (
                  <div className="py-8 text-center text-xs text-slate-500">
                    Chưa có nhật ký AR nào được ghi nhận cho phiếu này.
                  </div>
                ) : (
                  <div className="space-y-4 relative before:absolute before:left-3.5 before:top-2 before:bottom-2 before:w-0.5 before:bg-slate-800">
                    {selectedTicket.arLogs.map((log, index) => (
                      <div key={index} className="flex items-start gap-4 relative">
                        <div className="w-7 h-7 rounded-full bg-sky-500/20 border border-sky-400/40 text-sky-300 flex items-center justify-center shrink-0 z-10">
                          <Activity className="w-3.5 h-3.5" />
                        </div>
                        <div className="flex-1 bg-slate-950/70 p-3.5 rounded-xl border border-slate-800">
                          <div className="flex items-center justify-between gap-2 mb-1">
                            <span className="font-bold text-xs text-sky-200">{log.action}</span>
                            <span className="font-mono text-[10px] text-slate-400">
                              {log.timestamp ? new Date(log.timestamp).toLocaleTimeString('vi-VN') : ''}
                            </span>
                          </div>
                          {log.details && (
                            <div className="text-[11px] text-slate-300 space-y-1">
                              {log.details.notes && <div>{log.details.notes}</div>}
                              {log.details.operator && (
                                <div className="text-slate-400 text-[10px]">
                                  Thực hiện bởi: <span className="text-slate-300 font-semibold">{log.details.operator}</span>
                                </div>
                              )}
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center text-slate-500 p-8">
              <Wrench className="w-12 h-12 mb-3 text-slate-600" />
              <div className="text-sm font-bold text-slate-400">Chọn một phiếu bảo trì để xem chi tiết</div>
              <div className="text-xs text-slate-500 mt-1">Hoặc bấm "Tạo Phiếu Bảo Trì Mới" ở góc trên</div>
            </div>
          )}
        </div>
      </div>

      {/* CREATE TICKET MODAL */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-[#0e1424] border border-slate-700/80 rounded-2xl w-full max-w-lg shadow-2xl p-6">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800 mb-4">
              <h2 className="text-base font-black text-white flex items-center gap-2">
                <PlusCircle className="w-5 h-5 text-sky-400" />
                Tạo Phiếu Bảo Trì Mới
              </h2>
              <button
                onClick={() => setShowCreateModal(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateSubmit} className="space-y-4 text-xs">
              <div>
                <label className="block font-bold text-slate-300 mb-1">Tiêu đề phiếu</label>
                <input
                  type="text"
                  value={newTitle}
                  onChange={e => setNewTitle(e.target.value)}
                  placeholder="Vd: Thay quạt tản nhiệt Module B, kiểm tra nguồn phụ..."
                  required
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-white focus:outline-none focus:border-sky-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-300 mb-1">Máy chủ / Thiết bị</label>
                  <select
                    value={newNodeId}
                    onChange={e => setNewNodeId(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-white focus:outline-none focus:border-sky-500"
                  >
                    {nodes.map(n => (
                      <option key={n.id} value={n.id}>
                        {n.name} ({n.id})
                      </option>
                    ))}
                    {nodes.length === 0 && <option value="node-a1-1">Node A1-1 (Rack A1)</option>}
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-slate-300 mb-1">Mức độ ưu tiên</label>
                  <select
                    value={newPriority}
                    onChange={e => setNewPriority(e.target.value as TicketPriority)}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-white focus:outline-none focus:border-sky-500"
                  >
                    <option value="LOW">Thấp (Low)</option>
                    <option value="MEDIUM">Trung bình (Medium)</option>
                    <option value="HIGH">Cao (High)</option>
                    <option value="CRITICAL">Khẩn cấp (Critical)</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-300 mb-1">Phân công kỹ thuật viên (Tùy chọn)</label>
                <select
                  value={newTechId}
                  onChange={e => setNewTechId(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-white focus:outline-none focus:border-sky-500"
                >
                  <option value="">-- Chưa chỉ định --</option>
                  {technicians.map(t => (
                    <option key={t.id} value={t.id}>
                      {t.name} ({t.email})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block font-bold text-slate-300 mb-1">Mô tả chi tiết / Hướng dẫn can thiệp</label>
                <textarea
                  rows={3}
                  value={newDesc}
                  onChange={e => setNewDesc(e.target.value)}
                  placeholder="Mô tả nguyên nhân nghi vấn, vị trí khe cắm U, các bước kiểm tra cần làm..."
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-white focus:outline-none focus:border-sky-500"
                />
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold transition-colors cursor-pointer"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-sky-500 hover:bg-sky-400 text-white font-bold transition-all shadow-md shadow-sky-500/25 cursor-pointer"
                >
                  Tạo Phiếu
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ASSIGN TECHNICIAN MODAL */}
      {showAssignModal && targetTicket && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-[#0e1424] border border-slate-700/80 rounded-2xl w-full max-w-md shadow-2xl p-6">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800 mb-4">
              <h2 className="text-base font-black text-white flex items-center gap-2">
                <User className="w-5 h-5 text-indigo-400" />
                Phân Công Kỹ Thuật Viên
              </h2>
              <button
                onClick={() => setShowAssignModal(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleAssignSubmit} className="space-y-4 text-xs">
              <div>
                <span className="text-slate-400 block mb-1">Phiếu bảo trì:</span>
                <span className="font-bold text-white block">{targetTicket.title} ({targetTicket.id})</span>
              </div>

              <div>
                <label className="block font-bold text-slate-300 mb-1">Chọn kỹ thuật viên</label>
                <select
                  value={assignTechId}
                  onChange={e => setAssignTechId(e.target.value)}
                  required
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-white focus:outline-none focus:border-indigo-500"
                >
                  <option value="">-- Chọn kỹ thuật viên phụ trách --</option>
                  {technicians.map(t => (
                    <option key={t.id} value={t.id}>
                      {t.name} - {t.email} ({t.role})
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowAssignModal(false)}
                  className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold transition-colors cursor-pointer"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold transition-all shadow-md shadow-indigo-600/25 cursor-pointer"
                >
                  Lưu Phân Công
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* AR LOG MODAL */}
      {showArLogModal && targetTicket && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-[#0e1424] border border-slate-700/80 rounded-2xl w-full max-w-md shadow-2xl p-6">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800 mb-4">
              <h2 className="text-base font-black text-white flex items-center gap-2">
                <QrCode className="w-5 h-5 text-sky-400" />
                Ghi Thao Tác AR Hiện Trường
              </h2>
              <button
                onClick={() => setShowArLogModal(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleArLogSubmit} className="space-y-4 text-xs">
              <div>
                <label className="block font-bold text-slate-300 mb-1">Loại hành động AR</label>
                <select
                  value={arActionType}
                  onChange={e => setArActionType(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-white focus:outline-none focus:border-sky-500"
                >
                  <option value="QR_SCAN_VERIFIED">Quét QR khớp vị trí máy chủ</option>
                  <option value="DIAGNOSTIC_RUN">Chạy chẩn đoán cảm biến / Telemetry</option>
                  <option value="PART_REPLACED">Thay thế linh kiện (RAM / Nguồn / Fan)</option>
                  <option value="REMOTE_RESTART">Khởi động lại máy chủ từ xa</option>
                  <option value="THERMAL_CLEANED">Vệ sinh luồng khí tản nhiệt</option>
                  <option value="FIRMWARE_PATCHED">Cập nhật firmware vi điều khiển</option>
                </select>
              </div>

              <div>
                <label className="block font-bold text-slate-300 mb-1">Ghi chú chi tiết</label>
                <textarea
                  rows={3}
                  value={arActionNotes}
                  onChange={e => setArActionNotes(e.target.value)}
                  placeholder="Vd: Đã thay thế khay Fan 02, nhiệt độ giảm từ 68°C xuống 41°C..."
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-white focus:outline-none focus:border-sky-500"
                />
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowArLogModal(false)}
                  className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold transition-colors cursor-pointer"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-sky-500 hover:bg-sky-400 text-white font-bold transition-all shadow-md shadow-sky-500/25 cursor-pointer"
                >
                  Ghi Nhật Ký
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* RESOLVE TICKET MODAL */}
      {showResolveModal && targetTicket && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-[#0e1424] border border-slate-700/80 rounded-2xl w-full max-w-md shadow-2xl p-6">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800 mb-4">
              <h2 className="text-base font-black text-white flex items-center gap-2">
                <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                Hoàn Tất Xử Lý Phiếu Bảo Trì
              </h2>
              <button
                onClick={() => setShowResolveModal(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleResolveSubmit} className="space-y-4 text-xs">
              <div>
                <span className="text-slate-400 block mb-1">Phiếu:</span>
                <span className="font-bold text-white block">{targetTicket.title} ({targetTicket.id})</span>
              </div>

              <div>
                <label className="block font-bold text-slate-300 mb-1">Báo cáo kết quả sửa chữa</label>
                <textarea
                  rows={4}
                  value={resolutionNotes}
                  onChange={e => setResolutionNotes(e.target.value)}
                  placeholder="Ghi chú các linh kiện đã thay, thông số telemetry đo lại sau can thiệp, khuyến nghị bảo dưỡng tiếp theo..."
                  required
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-white focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowResolveModal(false)}
                  className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold transition-colors cursor-pointer"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold transition-all shadow-md shadow-emerald-600/25 cursor-pointer"
                >
                  Gửi Nghiệm Thu
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
