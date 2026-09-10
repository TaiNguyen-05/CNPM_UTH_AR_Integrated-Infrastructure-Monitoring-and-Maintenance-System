import React, { useState, useEffect, useMemo, useRef, useCallback } from 'react';
import { Icon } from '@iconify/react';
import { 
  Camera, Terminal as TerminalIcon, Box, Activity, Server, AlertTriangle, 
  Users as UsersIcon, FileText, CheckCircle2, ShieldAlert, Cpu, 
  ExternalLink, QrCode, RefreshCw, Zap, Shield, Sparkles, LogIn, LogOut, ChevronRight,
  Plus, Trash2, Edit, Layers, TrendingUp, Wrench, Menu, X, Smartphone
} from 'lucide-react';
import { TabType, AssetItem, AlertItem, UserItem, AuditLogItem, Rack, RackUnit, TelemetryPoint, TicketItem, TicketPriority, TicketStatus } from './types';
import { 
  INITIAL_ASSETS, 
  INITIAL_ALERTS, 
  INITIAL_USERS, 
  INITIAL_AUDIT_LOGS, 
  INITIAL_RACKS 
} from './data/mockData';

// Interactive Components
import { DigitalTwinView } from './components/DigitalTwinView';
import { TelemetryView } from './components/TelemetryView';
import { AssetsView } from './components/AssetsView';
import { AlertsView } from './components/AlertsView';
import { TicketsView } from './components/TicketsView';
import { UsersView } from './components/UsersView';
import { AuditLogsView } from './components/AuditLogsView';
import { AnalyticsView } from './components/AnalyticsView';

// Modals
import { AROverlayModal } from './components/modals/AROverlayModal';
import { NewAssetModal } from './components/modals/NewAssetModal';
import { PrintLabelModal } from './components/modals/PrintLabelModal';
import { CreateTicketModal } from './components/modals/CreateTicketModal';
import { InviteUserModal } from './components/modals/InviteUserModal';
import { ManagePoliciesModal } from './components/modals/ManagePoliciesModal';
import { SupportModal } from './components/modals/SupportModal';
import { SettingsModal } from './components/modals/SettingsModal';
import { NodeDetailModal } from './components/modals/NodeDetailModal';
import { RackModal } from './components/modals/RackModal';
import { EditUserModal } from './components/modals/EditUserModal';
import { AuthView } from './components/AuthView';
import { LiveSystemLogsSection, SystemLogEntry } from './components/LiveSystemLogsSection';
import { arImmsApi } from './services/api';
import { socketService } from './services/socketService';
import { DeviceViewportSimulator } from './components/DeviceViewportSimulator';

type RevealId = "architecture" | "console" | "modules" | "operations" | "subscribe";

export const App: React.FC = () => {
  const [scrolled, setScrolled] = useState<boolean>(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState<boolean>(false);
  const [revealed, setRevealed] = useState<Set<RevealId>>(
    new Set(["architecture", "console", "modules", "operations", "subscribe"])
  );
  const heroVideoRef = useRef<HTMLVideoElement | null>(null);
  const typewriterRef = useRef<HTMLSpanElement | null>(null);

  // Core Datasets
  const [racks, setRacks] = useState<Rack[]>(INITIAL_RACKS);
  const [assets, setAssets] = useState<AssetItem[]>(INITIAL_ASSETS);
  const [alerts, setAlerts] = useState<AlertItem[]>(INITIAL_ALERTS);
  const [users, setUsers] = useState<UserItem[]>(INITIAL_USERS);
  const [tickets, setTickets] = useState<TicketItem[]>([]);
  const [auditLogs, setAuditLogs] = useState<AuditLogItem[]>(INITIAL_AUDIT_LOGS);
  const [liveSystemLogs, setLiveSystemLogs] = useState<SystemLogEntry[]>([]);

  const addLiveLog = useCallback((entry: Omit<SystemLogEntry, 'id' | 'timestamp'>) => {
    const newLog: SystemLogEntry = {
      id: `log-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      timestamp: new Date().toLocaleTimeString(),
      ...entry
    };
    setLiveSystemLogs(prev => [...prev, newLog]);
  }, []);

  // Tải danh sách Người dùng thực tế từ Database
  const fetchDbUsers = useCallback(async () => {
    try {
      const res = await arImmsApi.getUsers();
      if (res && res.data && res.data.length > 0) {
        const mapped: UserItem[] = res.data.map((u: any) => {
          const roleNormalized: 'Admin' | 'Technician' = 
            (u.role || '').toUpperCase() === 'ADMIN' ? 'Admin' : 'Technician';
          
          const statusNormalized: 'Active' | 'Pending' | 'Locked' = 
            (u.status || '').toUpperCase() === 'APPROVED' ? 'Active' :
            (u.status || '').toUpperCase() === 'PENDING_APPROVAL' ? 'Pending' : 'Locked';

          const name = u.full_name || u.email.split('@')[0];
          const initials = name.split(' ').map((n: string) => n[0]).join('').slice(0, 2).toUpperCase();

          return {
            id: u.id,
            userId: u.id,
            name: name,
            email: u.email,
            role: roleNormalized,
            status: statusNormalized,
            department: u.department || 'Data Hall Alpha - Zone 1',
            phone: u.phone_number || '--',
            lastAuth: u.updated_at ? new Date(u.updated_at).toLocaleString() : 'System Record',
            initials: initials,
            avatarUrl: u.avatar || undefined
          };
        });

        setUsers(mapped);
      }
    } catch (err) {
      console.warn('Lỗi tải người dùng từ Database:', err);
    }
  }, []);

  // Tải danh sách Phiếu Bảo Trì (Tickets) từ Database
  const fetchTickets = useCallback(async () => {
    try {
      const res = await arImmsApi.getTickets();
      if (res && res.data) {
        const mapped: TicketItem[] = res.data.map((t: any) => {
          let arLogs: any[] = [];
          if (Array.isArray(t.ar_session_logs)) {
            arLogs = t.ar_session_logs;
          } else if (Array.isArray(t.ar_action_logs_json)) {
            arLogs = t.ar_action_logs_json;
          } else if (typeof t.ar_action_logs_json === 'string') {
            try { arLogs = JSON.parse(t.ar_action_logs_json); } catch {}
          }
          return {
            id: t.id,
            serverNodeId: t.server_node_id,
            serverNodeName: t.server_node_name || t.server_node_id,
            rackId: t.rack_id,
            title: t.title,
            description: t.description || '',
            priority: (t.priority || 'MEDIUM').toUpperCase() as TicketPriority,
            status: (t.status || 'CREATED').toUpperCase() as TicketStatus,
            alertId: t.alert_id,
            assignedTechnicianId: t.assigned_technician_id,
            assignedTechnicianName: t.assigned_technician_name,
            createdAt: t.created_at,
            updatedAt: t.updated_at,
            resolvedAt: t.resolved_at,
            closedAt: t.closed_at,
            resolutionNotes: t.resolution_notes,
            arLogs: arLogs
          };
        });
        setTickets(mapped);
      }
    } catch (err) {
      console.warn('Lỗi tải danh sách tickets:', err);
    }
  }, []);

  // Tải danh sách Cảnh Báo (Alerts) thời gian thực từ Database
  const fetchAlerts = useCallback(async () => {
    try {
      const res = await arImmsApi.getAlerts();
      if (res && res.data && res.data.length > 0) {
        const mapped: AlertItem[] = res.data.map((a: any) => ({
          id: a.id,
          alertCode: a.id,
          severity: (a.severity === 'critical' ? 'Critical' : a.severity === 'warning' ? 'Warning' : 'Info') as any,
          title: a.title || a.message || `Cảnh báo trên ${a.node_id || a.server_node_id}`,
          description: a.message || a.title || 'Phát hiện bất thường vượt ngưỡng an toàn.',
          time: 'Vừa xong',
          loggedTimeUtc: a.created_at || new Date().toISOString(),
          location: a.node_id || a.server_node_id ? `Node ${a.node_id || a.server_node_id}` : 'Rack Alpha',
          assignedTo: 'Kỹ thuật viên hiện trường',
          zone: 'Zone Alpha',
          acknowledged: a.status === 'acknowledged' || a.status === 'resolved',
          resolved: a.status === 'resolved',
          snapshot: {
            rackTemp: `${a.metric_value || 42}°C`,
            tempRate: '+1.2°C/10m',
            fanSpeed: '4,800 RPM',
            fanStatus: 'Tăng tốc khẩn cấp',
            powerDraw: '4.8 kW',
            powerStatus: 'Bình thường',
            tempTrend: [35, 42, 58, a.metric_value || 75]
          },
          maintenanceLogs: []
        }));
        setAlerts(mapped);
      }
    } catch (err) {
      console.warn('Lỗi tải danh sách alerts:', err);
    }
  }, []);

  useEffect(() => {
    fetchDbUsers();
    fetchTickets();
    fetchAlerts();

    // Socket.io Real-time ticket updates
    const unsubCreated = socketService.on('ticket_created', (data: any) => {
      fetchTickets();
      if (data) {
        addLiveLog({
          source: 'mobile',
          level: 'info',
          message: `App Mobile: Tạo phiếu bảo trì mới [${data.id || 'TCK'}]: "${data.title || 'Sửa chữa sự cố'}"`,
          details: `Kỹ thuật viên: ${data.assigned_technician_name || 'Đang điều phối'} • Node: ${data.node_id || data.server_node_id || 'N/A'}`
        });
      }
    });

    const unsubAssigned = socketService.on('ticket_assigned', (data: any) => {
      fetchTickets();
      if (data) {
        addLiveLog({
          source: 'mobile',
          level: 'info',
          message: `Điều phối phiếu [${data.id || data.ticket_id}]: Giao cho ${data.technician_name || 'Kỹ thuật viên'}`,
          details: `Ghi chú điều phối: ${data.notes || 'Chuyển phiếu từ Web/App'}`
        });
      }
    });

    const unsubResolved = socketService.on('ticket_resolved', (data: any) => {
      fetchTickets();
      if (data) {
        addLiveLog({
          source: 'mobile',
          level: 'success',
          message: `Kỹ thuật viên đã xử lý xong phiếu [${data.id || data.ticket_id}] -> RESOLVED`,
          details: `Nghiệm thu: ${data.resolution_notes || 'Khắc phục hoàn tất sự cố tại hiện trường'}`
        });
      }
    });

    const unsubClosed = socketService.on('ticket_closed', (data: any) => {
      fetchTickets();
      if (data) {
        addLiveLog({
          source: 'mobile',
          level: 'success',
          message: `Nghiệm thu & Đóng phiếu bảo trì [${data.id || data.ticket_id}] -> CLOSED`,
          details: 'Hoàn tất quy trình bảo trì hạ tầng'
        });
      }
    });

    const unsubLog = socketService.on('ticket_ar_log_added', (data: any) => {
      fetchTickets();
      if (data) {
        addLiveLog({
          source: 'mobile',
          level: 'info',
          message: `AR Tracking: Nhật ký thao tác AR mới trên phiếu [${data.ticket_id || 'TCK'}]`,
          details: `Hành động: ${data.action || 'Quét máy chủ / Nháy LED / Ghi nhận bảo trì'}`
        });
      }
    });

    // Socket.io Real-time alert updates
    const unsubAlertCreated = socketService.on('alert_created', (data: any) => {
      fetchAlerts();
      if (data) {
        addLiveLog({
          source: 'alert',
          level: 'critical',
          message: `Cảnh báo mới [${data.id || 'ALT'}]: ${data.title || data.message || 'Phát hiện vượt ngưỡng'}`,
          details: `Mức độ: ${data.severity || 'CRITICAL'} • Thiết bị: ${data.node_id || data.server_node_id || 'DC Alpha'}`,
          nodeId: data.node_id || data.server_node_id
        });
      }
    });

    const unsubAlertUpdated = socketService.on('alert_updated', (data: any) => {
      fetchAlerts();
    });

    const unsubAlertResolved = socketService.on('alert_resolved', (data: any) => {
      fetchAlerts();
      if (data) {
        addLiveLog({
          source: 'alert',
          level: 'success',
          message: `Cảnh báo [${data.id || data.alert_id}] đã được giải quyết an toàn`,
          details: data.message || 'Hạ nhiệt độ về ngưỡng cho phép'
        });
      }
    });

    const unsubAlertDeleted = socketService.on('alert_deleted', () => fetchAlerts());
    const unsubStats = socketService.on('stats_updated', () => {
      fetchAlerts();
      fetchTickets();
    });

    // Socket.io Real-time user lifecycle updates
    const unsubUserCreated = socketService.on('user_created', (data: any) => {
      fetchDbUsers();
      if (data) {
        addLiveLog({
          source: 'auth',
          level: 'info',
          message: `Đăng ký tài khoản mới: ${data.full_name || data.name || data.email} (${data.role || 'TECHNICIAN'})`,
          details: `Email: ${data.email} • Trạng thái: ${data.status || 'PENDING_APPROVAL'}`
        });
      }
    });

    const unsubUserUpdated = socketService.on('user_updated', () => fetchDbUsers());

    const unsubUserApproved = socketService.on('user_approved', (data: any) => {
      fetchDbUsers();
      if (data) {
        addLiveLog({
          source: 'web',
          level: 'success',
          message: `Quản trị viên đã phê duyệt tài khoản: ${data.full_name || data.name || data.email}`,
          details: `Quyền: ${data.role || 'TECHNICIAN'} • Trạng thái: APPROVED`
        });
      }
    });

    const unsubUserDeleted = socketService.on('user_deleted', () => fetchDbUsers());

    return () => {
      unsubCreated();
      unsubAssigned();
      unsubResolved();
      unsubClosed();
      unsubLog();
      unsubAlertCreated();
      unsubAlertUpdated();
      unsubAlertResolved();
      unsubAlertDeleted();
      unsubStats();
      unsubUserCreated();
      unsubUserUpdated();
      unsubUserApproved();
      unsubUserDeleted();
    };
  }, [fetchDbUsers, fetchTickets, fetchAlerts]);

  // Alert Handlers
  const handleAcknowledgeAlert = async (alertId: string) => {
    try {
      await arImmsApi.acknowledgeAlert(alertId, currentUser?.id || 'OPERATOR');
      await fetchAlerts();
    } catch (err) {
      console.error('Lỗi tiếp nhận alert:', err);
    }
  };

  const handleResolveAlert = async (alertId: string) => {
    try {
      await arImmsApi.resolveAlert(alertId, 'Đã xử lý xong từ Web Dashboard');
      await fetchAlerts();
    } catch (err) {
      console.error('Lỗi giải quyết alert:', err);
    }
  };

  // Ticket CRUD Handlers
  const handleCreateTicket = async (ticketData: {
    server_node_id: string;
    title: string;
    description: string;
    priority: TicketPriority;
    assigned_technician_id?: string;
    assigned_technician_name?: string;
  }) => {
    try {
      await arImmsApi.createTicket(ticketData);
      await fetchTickets();
      setActiveViewSection('tickets');
    } catch (err) {
      console.error('Lỗi tạo ticket:', err);
    }
  };

  const handleAssignTicket = async (ticketId: string, technicianId: string, technicianName?: string) => {
    try {
      await arImmsApi.assignTicket(ticketId, technicianId, technicianName);
      await fetchTickets();
    } catch (err) {
      console.error('Lỗi phân công ticket:', err);
    }
  };

  const handleAddArLog = async (ticketId: string, action: string, details?: Record<string, any>) => {
    try {
      await arImmsApi.addArLog(ticketId, action, details);
      await fetchTickets();
    } catch (err) {
      console.error('Lỗi ghi log AR:', err);
    }
  };

  const handleResolveTicket = async (ticketId: string, notes?: string) => {
    try {
      await arImmsApi.resolveTicket(ticketId, notes);
      await fetchTickets();
    } catch (err) {
      console.error('Lỗi hoàn tất ticket:', err);
    }
  };

  const handleCloseTicket = async (ticketId: string) => {
    try {
      await arImmsApi.closeTicket(ticketId);
      await fetchTickets();
    } catch (err) {
      console.error('Lỗi đóng ticket:', err);
    }
  };

  const handleDeleteTicket = async (ticketId: string) => {
    try {
      await arImmsApi.deleteTicket(ticketId);
      await fetchTickets();
    } catch (err) {
      console.error('Lỗi xóa ticket:', err);
    }
  };

  // Active User / Auth State (Không tự động đăng nhập - khôi phục phiên nếu có)
  const [currentUser, setCurrentUser] = useState<UserItem | null>(() => {
    try {
      const saved = localStorage.getItem('ar_imms_user');
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });
  const [isAuthModalOpen, setIsAuthModalOpen] = useState<boolean>(false);

  // Đồng bộ phiên người dùng vào localStorage
  useEffect(() => {
    if (currentUser) {
      localStorage.setItem('ar_imms_user', JSON.stringify(currentUser));
    } else {
      localStorage.removeItem('ar_imms_user');
    }
  }, [currentUser]);

  // Modals & CRUD State
  const [isARModalOpen, setIsARModalOpen] = useState<boolean>(false);
  const [isNewAssetModalOpen, setIsNewAssetModalOpen] = useState<boolean>(false);
  const [assetToEdit, setAssetToEdit] = useState<AssetItem | null>(null);
  const [isRackModalOpen, setIsRackModalOpen] = useState<boolean>(false);
  const [rackToEdit, setRackToEdit] = useState<Rack | null>(null);
  const [isEditUserModalOpen, setIsEditUserModalOpen] = useState<boolean>(false);
  const [userToEdit, setUserToEdit] = useState<UserItem | null>(null);
  const [isPrintLabelModalOpen, setIsPrintLabelModalOpen] = useState<boolean>(false);
  const [isCreateTicketModalOpen, setIsCreateTicketModalOpen] = useState<boolean>(false);
  const [isInviteUserModalOpen, setIsInviteUserModalOpen] = useState<boolean>(false);
  const [isManagePoliciesModalOpen, setIsManagePoliciesModalOpen] = useState<boolean>(false);
  const [isSupportModalOpen, setIsSupportModalOpen] = useState<boolean>(false);
  const [isSettingsModalOpen, setIsSettingsModalOpen] = useState<boolean>(false);
  const [selectedNodeDetail, setSelectedNodeDetail] = useState<AssetItem | null>(null);
  const [selectedPrintAsset, setSelectedPrintAsset] = useState<AssetItem | null>(null);
  const [arTargetAlert, setArTargetAlert] = useState<AlertItem | null>(null);

  // Interactive Terminal State
  const [terminalInput, setTerminalInput] = useState<string>('');
  const [terminalLogs, setTerminalLogs] = useState<Array<{ text: string; type?: 'info' | 'success' | 'warn' | 'cmd' }>>([
    { text: "Mounting miniature physical storage matrix...", type: 'success' },
    { text: "Aligning overhead incandescent ambient illumination arrays...", type: 'success' },
    { text: "Calibrating 16x16 macro switch layout profiles...", type: 'success' },
    { text: "Socket.IO real-time stream established on enclave_v4", type: 'info' }
  ]);

  // Telemetry status
  const [activeTelemetry, setActiveTelemetry] = useState<TelemetryPoint | null>(null);
  const [activeViewSection, setActiveViewSection] = useState<'twin' | 'telemetry' | 'assets' | 'alerts' | 'tickets' | 'users' | 'audit' | 'analytics'>('twin');
  const [userSearchQuery, setUserSearchQuery] = useState<string>('');

  const isAdmin = (currentUser?.role || '').toUpperCase() === 'ADMIN';
  const isTechnician = (currentUser?.role || '').toUpperCase() === 'TECHNICIAN';

  // Chặn Technician truy cập khu vực Quản trị Người dùng & RBAC
  useEffect(() => {
    if (!isAdmin && activeViewSection === 'users') {
      setActiveViewSection('tickets');
    }
  }, [isAdmin, activeViewSection]);

  // Particles config
  const particles = useMemo(
    () => [
      { left: "14%", size: 3, duration: "4.5s", delay: "0s" },
      { left: "39%", size: 2, duration: "3.8s", delay: "1.2s" },
      { left: "67%", size: 4, duration: "5.2s", delay: "2.4s" },
      { left: "83%", size: 2.5, duration: "4.2s", delay: "0.7s" },
      { left: "58%", size: 2, duration: "4.9s", delay: "3.1s" },
    ],
    []
  );

  // Parallax Scroll Effect optimized with requestAnimationFrame
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      const tabParam = params.get('tab');
      const unitParam = params.get('unit');
      const actionParam = params.get('action');
      if (tabParam === 'alerts' || actionParam === 'repair' || unitParam) {
        setActiveViewSection('alerts');
        setTimeout(() => {
          const element = document.getElementById('modules');
          if (element) {
            element.scrollIntoView({ behavior: 'smooth' });
          }
        }, 500);
      }
    }
  }, []);

  useEffect(() => {
    let ticking = false;
    let lastScrollY = window.scrollY;

    const updateParallax = () => {
      if (heroVideoRef.current) {
        heroVideoRef.current.style.transform = `translate3d(0, ${lastScrollY * 0.25}px, 0)`;
      }
      ticking = false;
    };

    const onScroll = () => {
      lastScrollY = window.scrollY;
      const isScrolled = lastScrollY > 60;
      setScrolled((prev) => (prev !== isScrolled ? isScrolled : prev));

      if (!ticking) {
        window.requestAnimationFrame(updateParallax);
        ticking = true;
      }
    };

    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // Intersection Observer for Reveal animations
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        setRevealed((prev) => {
          const next = new Set(prev);
          entries.forEach((entry) => {
            if (entry.isIntersecting) {
              const id = entry.target.getAttribute("data-reveal-id") as RevealId | null;
              if (id) next.add(id);
              observer.unobserve(entry.target);
            }
          });
          return next;
        });
      },
      { threshold: 0.1, rootMargin: "0px 0px -40px 0px" }
    );

    document.querySelectorAll("[data-reveal-id]").forEach((node) => observer.observe(node));
    return () => observer.disconnect();
  }, []);

  // Typewriter effect in Hero / Console
  useEffect(() => {
    const sequences = [
      "init --datacenter=alpha_zone_1a",
      "stream_telemetry --realtime --socketio",
      "sync_digital_twin --threejs-3d",
      "detect_hotspots --threshold=80C",
      "compile_all --speed=max"
    ];
    let sequenceIndex = 0;
    let characterIndex = 0;
    let deleting = false;
    let timeout: number | undefined;

    const tick = () => {
      const el = typewriterRef.current;
      if (!el) return;

      const current = sequences[sequenceIndex];

      if (!deleting) {
        characterIndex += 1;
        el.textContent = current.slice(0, characterIndex);
        if (characterIndex >= current.length) {
          deleting = true;
          timeout = window.setTimeout(tick, 1800);
          return;
        }
        timeout = window.setTimeout(tick, 80);
      } else {
        characterIndex -= 1;
        el.textContent = current.slice(0, Math.max(characterIndex, 0));
        if (characterIndex <= 0) {
          deleting = false;
          sequenceIndex = (sequenceIndex + 1) % sequences.length;
        }
        timeout = window.setTimeout(tick, deleting ? 35 : 100);
      }
    };

    timeout = window.setTimeout(tick, 600);
    return () => {
      if (timeout) window.clearTimeout(timeout);
    };
  }, []);

  // Real-time Socket.IO and backend API fetch
  useEffect(() => {
    const syncBackendData = async () => {
      try {
        const [nodesRes, alertsRes, racksRes] = await Promise.allSettled([
          arImmsApi.getNodes(),
          arImmsApi.getAlerts(),
          arImmsApi.getRacks()
        ]);

        let mappedAssets: AssetItem[] = [];
        if (nodesRes.status === 'fulfilled' && nodesRes.value?.data && nodesRes.value.data.length > 0) {
          mappedAssets = nodesRes.value.data.map(n => ({
            id: n.id,
            name: n.name,
            model: n.model,
            rack: n.rack_id ? (n.rack_id.toUpperCase().includes('RACK') ? n.rack_id.toUpperCase() : `Rack ${n.rack_id.toUpperCase().replace('RACK-', '')}`) : 'Rack A1',
            uPosition: `Rack ${n.rack_id?.toUpperCase().replace('RACK-', '') || 'A1'}, U${String(n.u_start || 1).padStart(2, '0')}-${String((n.u_start || 1) + (n.u_size || 2) - 1).padStart(2, '0')}`,
            qrStatus: (String(n.status).toLowerCase() === 'healthy') ? 'Active' : (String(n.status).toLowerCase() === 'warning') ? 'Mismatch' : 'Pending',
            guid: n.qr_code || `guid-${n.id}`,
            manufacturer: n.model?.split(' ')[0] || 'Enterprise OEM',
            serialNumber: `CN-0X${n.id.slice(-4).toUpperCase()}`,
            installDate: '2024-01-15',
            powerDraw: '450W (Avg)',
            networkInterfaces: [`eth0: ${n.ip_address || '10.0.1.20'}`]
          }));
          setAssets(mappedAssets);
        } else {
          mappedAssets = INITIAL_ASSETS;
          setAssets(INITIAL_ASSETS);
        }

        if (alertsRes.status === 'fulfilled' && alertsRes.value?.data && alertsRes.value.data.length > 0) {
          const mappedAlerts: AlertItem[] = alertsRes.value.data.map(a => ({
            id: a.id,
            alertCode: `ALT-${a.id.slice(-4).toUpperCase()}`,
            severity: a.severity === 'critical' ? 'Critical' : a.severity === 'warning' ? 'Warning' : 'Info',
            title: a.message,
            description: a.message,
            time: '14:20:00',
            loggedTimeUtc: a.created_at || new Date().toISOString(),
            location: `Rack ${a.node_id?.toUpperCase() || 'A2'}`,
            assignedTo: 'Sarah Jenkins',
            zone: 'Alpha Enclave Suite',
            acknowledged: a.status !== 'active',
            resolved: a.status === 'resolved',
            snapshot: {
              rackTemp: '42.8°C',
              tempRate: '+1.2°C/10m',
              fanSpeed: '4,200 RPM',
              fanStatus: 'Cảnh báo quạt',
              powerDraw: '4.8 kW',
              powerStatus: 'Ổn định',
              tempTrend: [38, 39, 40, 41, 42.8]
            },
            maintenanceLogs: []
          }));
          setAlerts(mappedAlerts);
        }

        let baseRacks = INITIAL_RACKS;
        if (racksRes.status === 'fulfilled' && racksRes.value?.data && racksRes.value.data.length > 0) {
          baseRacks = racksRes.value.data.map((r: any, idx: number) => {
            const initial = INITIAL_RACKS[idx] || INITIAL_RACKS[0];
            return {
              ...initial,
              ...r,
              id: r.id || initial.id,
              name: r.name ? (r.name.includes('Rack') || r.name.includes('Tủ') ? r.name : `Rack ${r.name}`) : initial.name,
              status: r.status ? (r.status.toLowerCase() as ('healthy' | 'warning' | 'critical')) : initial.status,
              temperature: typeof r.temperature === 'number' ? r.temperature : initial.temperature,
              powerDrawKw: typeof r.power_draw_kw === 'number' ? r.power_draw_kw : (r.powerDrawKw || initial.powerDrawKw),
            };
          });
        }

        // Đồng bộ 100% các unit bên trong tủ rack theo đúng danh sách thiết bị
        const syncedRacks = baseRacks.map(rack => {
          const rackKey = rack.name.replace('Tủ ', '').replace('Rack ', '').trim().toLowerCase();
          const rackIdKey = rack.id.replace('rack-', '').trim().toLowerCase();

          const matchedAssets = mappedAssets.filter(a => {
            const aRack = a.rack.replace('Tủ ', '').replace('Rack ', '').trim().toLowerCase();
            return aRack === rackKey || aRack === rackIdKey || a.rack.toLowerCase().includes(rackKey);
          });

          if (matchedAssets.length > 0) {
            const rackUnits: RackUnit[] = matchedAssets.map((asset, uIdx) => {
              const uMatch = asset.uPosition.match(/U(\d+)/i);
              const uNum = uMatch ? parseInt(uMatch[1], 10) : (uIdx + 1);
              const unitStatus: 'healthy' | 'warning' | 'critical' | 'offline' = 
                asset.qrStatus === 'Mismatch' ? 'warning' : asset.qrStatus === 'Pending' ? 'critical' : 'healthy';
              return {
                u: uNum,
                name: asset.name,
                model: asset.model || 'Blade Node',
                status: unitStatus,
                temp: 30 + (uIdx * 6) % 25,
                cpu: 35 + (uIdx * 12) % 55,
                ram: 45 + (uIdx * 10) % 45,
                disk: 30 + (uIdx * 8) % 50,
                net: 20 + (uIdx * 9) % 65
              };
            }).sort((a, b) => a.u - b.u);

            return {
              ...rack,
              units: rackUnits,
              nodesCount: rackUnits.length
            };
          }
          return rack;
        });

        setRacks(syncedRacks);
      } catch (err) {
        console.warn("Backend sync notice:", err);
      }
    };

    syncBackendData();

    socketService.connect();
    const handleTelemetry = (data: any) => {
      if (data?.point) {
        setActiveTelemetry(data.point);
      }
    };
    const handleAlertEvent = (data: any) => {
      if (data?.alert) {
        setTerminalLogs(prev => [
          { text: `[ALERT] ${data.alert.severity?.toUpperCase()}: ${data.alert.message || 'Telemetry threshold exceeded'}`, type: 'warn' },
          ...prev.slice(0, 15)
        ]);
      }
    };

    socketService.onTelemetry(handleTelemetry);
    socketService.onAlert(handleAlertEvent);

    return () => {
      socketService.offTelemetry(handleTelemetry);
      socketService.offAlert(handleAlertEvent);
    };
  }, []);

  const handleTerminalSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!terminalInput.trim()) return;

    const cmd = terminalInput.trim().toLowerCase();
    const newLogs = [...terminalLogs, { text: `quan_tri@nexus:~$ ${cmd}`, type: 'cmd' as const }];

    if (cmd === 'help' || cmd === 'trogiup' || cmd === 'tro giup' || cmd === 'lenh') {
      newLogs.push({ text: "Các lệnh khả dụng: status, racks, assets, users, launch_ar, digital_twin, boost_fan, reboot, compile, clear", type: 'info' });
    } else if (cmd === 'status' || cmd === 'trangthai' || cmd === 'trang thai') {
      newLogs.push({ text: `[HỆ THỐNG] Tủ Rack: ${racks.length} | Thiết bị (Nodes): ${assets.length} | Người dùng: ${users.length} | Cảnh báo chưa xử lý: ${alerts.filter(a => !a.resolved).length}`, type: 'success' });
    } else if (cmd === 'racks' || cmd === 'tu_rack') {
      setActiveViewSection('assets');
      newLogs.push({ text: `[HÀNH ĐỘNG] Đang mở danh mục quản lý ${racks.length} tủ Rack máy chủ...`, type: 'info' });
    } else if (cmd === 'assets' || cmd === 'thiet_bi') {
      setActiveViewSection('assets');
      newLogs.push({ text: `[HÀNH ĐỘNG] Đang hiển thị ${assets.length} thiết bị phần cứng và mã AR...`, type: 'info' });
    } else if (cmd === 'users' || cmd === 'rbac' || cmd === 'nguoi_dung') {
      setActiveViewSection('users');
      newLogs.push({ text: `[HÀNH ĐỘNG] Đang mở phân hệ Quản lý & Phân quyền người dùng RBAC (${users.length} tài khoản)...`, type: 'info' });
    } else if (cmd === 'launch_ar' || cmd === 'ar' || cmd === 'kinh_ar') {
      setArTargetAlert(null);
      setIsARModalOpen(true);
      newLogs.push({ text: "[HÀNH ĐỘNG] Đang khởi chạy không gian thực tế tăng cường WebXR...", type: 'success' });
    } else if (cmd === 'digital_twin' || cmd === 'twin' || cmd === '3d') {
      const archEl = document.getElementById('architecture');
      if (archEl) archEl.scrollIntoView({ behavior: 'smooth' });
      newLogs.push({ text: "[HÀNH ĐỘNG] Đang kích hoạt giao diện Bản sao số 3D WebGL...", type: 'success' });
    } else if (cmd === 'boost_fan' || cmd === 'fan' || cmd === 'quat') {
      handleFanBoost('RACK-A1');
      newLogs.push({ text: "[IPMI] Đã tăng tốc độ quạt lên 100% (6,200 RPM) cho Tủ Rack Alpha 01", type: 'success' });
    } else if (cmd === 'reboot' || cmd === 'reset' || cmd === 'khoi_dong') {
      handleRackReboot('RACK-A2');
      newLogs.push({ text: "[IPMI] Đang gửi tín hiệu khởi động lại an toàn cho Tủ Rack Alpha 02...", type: 'warn' });
    } else if (cmd === 'clear' || cmd === 'cls' || cmd === 'xoa') {
      setTerminalLogs([]);
      setTerminalInput('');
      return;
    } else if (cmd === 'compile' || cmd === 'build') {
      newLogs.push({ text: "[OK] Quá trình biên dịch không gian Sandbox hoàn tất trong 1.1ms", type: 'success' });
    } else {
      newLogs.push({ text: `Lệnh không hợp lệ: '${cmd}'. Gõ 'help' để xem danh sách lệnh điều khiển.`, type: 'warn' });
    }

    setTerminalLogs(newLogs.slice(-20));
    setTerminalInput('');
  };

  const handleFanBoost = (rackId: string) => {
    setRacks(prev => prev.map(r => {
      if (r.id === rackId || r.name.toLowerCase().includes(rackId.toLowerCase())) {
        return {
          ...r,
          coolingStatus: 'Tối đa 100%',
          fanSpeedRpm: 6200,
          temperature: Math.max(22, (r.temperature || 28) - 3.5)
        };
      }
      return r;
    }));
  };

  const handleRackReboot = (rackId: string) => {
    setRacks(prev => prev.map(r => {
      if (r.id === rackId || r.name.toLowerCase().includes(rackId.toLowerCase())) {
        return { ...r, status: 'warning', temperature: 24.5 };
      }
      return r;
    }));
    setTimeout(() => {
      setRacks(prev => prev.map(r => {
        if (r.id === rackId || r.name.toLowerCase().includes(rackId.toLowerCase())) {
          return { ...r, status: 'healthy', temperature: 27.0 };
        }
        return r;
      }));
    }, 2500);
  };

  // --- CRUD HANDLERS: RACKS (DATABASE PERSISTENCE) ---
  const handleSaveRack = (savedRack: Rack) => {
    if ((currentUser?.role || '').toUpperCase() !== 'ADMIN') {
      alert('Yêu cầu quyền Admin: Bạn cần đăng nhập với tài khoản Quản trị viên (Admin) để lưu hoặc thay đổi cấu hình Tủ Rack!');
      setIsAuthModalOpen(true);
      return;
    }

    setRacks(prev => {
      const exists = prev.some(r => r.id === savedRack.id);
      if (exists) {
        return prev.map(r => r.id === savedRack.id ? savedRack : r);
      }
      return [...prev, savedRack];
    });

    // Lưu trực tiếp vào Database thông qua Backend REST API
    try {
      const rackDto = {
        id: savedRack.id,
        name: savedRack.name,
        code: savedRack.id.toUpperCase(),
        room_name: savedRack.location || savedRack.zone || 'Server Room 01',
        total_u: 42,
        power_limit_kw: savedRack.powerDrawKw || 15.0
      };
      if (rackToEdit) {
        arImmsApi.updateRack(savedRack.id, rackDto).catch(e => console.warn('Backend updateRack fallback:', e));
      } else {
        arImmsApi.createRack(rackDto).catch(e => console.warn('Backend createRack fallback:', e));
      }
    } catch (err) {
      console.warn('Rack API persistence error:', err);
    }

    setAuditLogs(prev => [
      {
        id: `audit-${Date.now()}`,
        timestamp: new Date().toISOString().replace('T', ' ').slice(0, 19),
        user: currentUser?.email || 'admin@ar-imms.corp',
        userType: 'user',
        initials: currentUser?.initials || 'AD',
        action: rackToEdit ? 'Chỉnh Sửa Tủ Rack' : 'Tạo Tủ Rack Mới',
        target: savedRack.name,
        ipAddress: '192.168.1.100',
        status: 'Success'
      },
      ...prev
    ]);
  };

  const handleDeleteRack = (rackId: string) => {
    if ((currentUser?.role || '').toUpperCase() !== 'ADMIN') {
      alert('Yêu cầu quyền Admin: Bạn cần đăng nhập với tài khoản Quản trị viên (Admin) để xóa Tủ Rack!');
      setIsAuthModalOpen(true);
      return;
    }

    setRacks(prev => prev.filter(r => r.id !== rackId));

    // Xóa khỏi Database thông qua Backend REST API
    try {
      arImmsApi.deleteRack(rackId).catch(e => console.warn('Backend deleteRack fallback:', e));
    } catch (err) {
      console.warn('Rack API delete error:', err);
    }

    setAuditLogs(prev => [
      {
        id: `audit-${Date.now()}`,
        timestamp: new Date().toISOString().replace('T', ' ').slice(0, 19),
        user: currentUser?.email || 'admin@ar-imms.corp',
        userType: 'user',
        initials: currentUser?.initials || 'AD',
        action: 'Xóa Tủ Rack',
        target: rackId,
        ipAddress: '192.168.1.100',
        status: 'Warning'
      },
      ...prev
    ]);
  };

  // --- CRUD HANDLERS: ASSETS / DEVICES (DATABASE PERSISTENCE) ---
  const handleSaveAsset = (savedAsset: AssetItem) => {
    if ((currentUser?.role || '').toUpperCase() !== 'ADMIN') {
      alert('Yêu cầu quyền Admin: Bạn cần đăng nhập với tài khoản Quản trị viên (Admin) để đăng ký hoặc chỉnh sửa Thiết bị!');
      setIsAuthModalOpen(true);
      return;
    }

    let nextAssets: AssetItem[] = [];
    setAssets(prev => {
      const exists = prev.some(a => a.id === savedAsset.id);
      nextAssets = exists
        ? prev.map(a => a.id === savedAsset.id ? savedAsset : a)
        : [savedAsset, ...prev];
      return nextAssets;
    });

    // Đồng bộ lập tức vào các Rack Units
    setRacks(prevRacks => prevRacks.map(rack => {
      const rackKey = rack.name.replace('Tủ ', '').replace('Rack ', '').trim().toLowerCase();
      const rackIdKey = rack.id.replace('rack-', '').trim().toLowerCase();

      const matchedAssets = (nextAssets.length > 0 ? nextAssets : [savedAsset, ...assets]).filter(a => {
        const aRack = a.rack.replace('Tủ ', '').replace('Rack ', '').trim().toLowerCase();
        return aRack === rackKey || aRack === rackIdKey || a.rack.toLowerCase().includes(rackKey);
      });

      if (matchedAssets.length > 0) {
        const rackUnits: RackUnit[] = matchedAssets.map((asset, uIdx) => {
          const uMatch = asset.uPosition.match(/U(\d+)/i);
          const uNum = uMatch ? parseInt(uMatch[1], 10) : (uIdx + 1);
          const unitStatus: 'healthy' | 'warning' | 'critical' | 'offline' = 
            asset.qrStatus === 'Mismatch' ? 'warning' : asset.qrStatus === 'Pending' ? 'critical' : 'healthy';
          return {
            u: uNum,
            name: asset.name,
            model: asset.model || 'Blade Node',
            status: unitStatus,
            temp: 30 + (uIdx * 6) % 25,
            cpu: 35 + (uIdx * 12) % 55,
            ram: 45 + (uIdx * 10) % 45,
            disk: 30 + (uIdx * 8) % 50,
            net: 20 + (uIdx * 9) % 65
          };
        }).sort((a, b) => a.u - b.u);

        return {
          ...rack,
          units: rackUnits,
          nodesCount: rackUnits.length
        };
      }
      return rack;
    }));

    // Lưu trực tiếp thiết bị vào Database thông qua Backend REST API
    try {
      const uMatch = savedAsset.uPosition.match(/U(\d+)/i);
      const uStart = uMatch ? parseInt(uMatch[1], 10) : 1;
      const rackId = savedAsset.rack.toLowerCase().replace(' ', '-').replace('tủ-', 'rack-');
      const nodeDto = {
        id: savedAsset.id,
        name: savedAsset.name,
        model: savedAsset.model,
        rack_id: rackId.startsWith('rack-') ? rackId : `rack-${rackId}`,
        u_start: uStart,
        u_size: 2,
        status: (savedAsset.qrStatus === 'Mismatch' ? 'warning' : savedAsset.qrStatus === 'Pending' ? 'critical' : 'healthy') as any,
        qr_code: savedAsset.guid || `ar-imms://node/${savedAsset.id}`,
        ip_address: '192.168.1.100'
      };
      if (assetToEdit) {
        arImmsApi.updateNode(savedAsset.id, nodeDto).catch(e => console.warn('Backend updateNode fallback:', e));
      } else {
        arImmsApi.createNode(nodeDto).catch(e => console.warn('Backend createNode fallback:', e));
      }
    } catch (err) {
      console.warn('Node API persistence error:', err);
    }

    setAuditLogs(prev => [
      {
        id: `audit-${Date.now()}`,
        timestamp: new Date().toISOString().replace('T', ' ').slice(0, 19),
        user: currentUser?.email || 'admin@ar-imms.corp',
        userType: 'user',
        initials: currentUser?.initials || 'AD',
        action: assetToEdit ? 'Chỉnh Sửa Thiết Bị' : 'Đăng Ký Thiết Bị Mới',
        target: savedAsset.name,
        ipAddress: '192.168.1.100',
        status: 'Success'
      },
      ...prev
    ]);
  };

  const handleDeleteAsset = (assetId: string) => {
    if ((currentUser?.role || '').toUpperCase() !== 'ADMIN') {
      alert('Yêu cầu quyền Admin: Bạn cần đăng nhập với tài khoản Quản trị viên (Admin) để xóa Thiết bị Node!');
      setIsAuthModalOpen(true);
      return;
    }

    let targetName = '';
    setAssets(prev => {
      const target = prev.find(a => a.id === assetId);
      if (target) targetName = target.name;
      return prev.filter(a => a.id !== assetId);
    });

    setRacks(prevRacks => prevRacks.map(rack => {
      const filteredUnits = rack.units.filter(u => u.name !== targetName);
      return {
        ...rack,
        units: filteredUnits,
        nodesCount: filteredUnits.length
      };
    }));

    // Xóa Node khỏi Database thông qua Backend REST API
    try {
      arImmsApi.deleteNode(assetId).catch(e => console.warn('Backend deleteNode fallback:', e));
    } catch (err) {
      console.warn('Node API delete error:', err);
    }

    setAuditLogs(prev => [
      {
        id: `audit-${Date.now()}`,
        timestamp: new Date().toISOString().replace('T', ' ').slice(0, 19),
        user: currentUser?.email || 'admin@ar-imms.corp',
        userType: 'user',
        initials: currentUser?.initials || 'AD',
        action: 'Xóa Thiết Bị',
        target: assetId,
        ipAddress: '192.168.1.100',
        status: 'Warning'
      },
      ...prev
    ]);
  };

  // --- CRUD HANDLERS: USERS & RBAC ---
  const handleSaveUser = (savedUser: UserItem) => {
    setUsers(prev => {
      const exists = prev.some(u => u.id === savedUser.id || (u.email && u.email.toLowerCase() === savedUser.email.toLowerCase()));
      if (exists) {
        return prev.map(u => (u.id === savedUser.id || (u.email && u.email.toLowerCase() === savedUser.email.toLowerCase())) ? savedUser : u);
      }
      return [...prev, savedUser];
    });
    setAuditLogs(prev => [
      {
        id: `audit-${Date.now()}`,
        timestamp: new Date().toISOString().replace('T', ' ').slice(0, 19),
        user: currentUser?.email || 'admin@ar-imms.corp',
        userType: 'user',
        initials: currentUser?.initials || 'AD',
        action: userToEdit ? 'Cập Nhật Quyền Người Dùng' : 'Thêm Người Dùng Mới',
        target: savedUser.email,
        ipAddress: '192.168.1.100',
        status: 'Success'
      },
      ...prev
    ]);
  };

  const handleDeleteUser = async (userId: string) => {
    const targetUser = users.find(u => u.id === userId || u.userId === userId || u.email === userId);
    const identifier = targetUser?.id || targetUser?.email || userId;

    setUsers(prev => prev.filter(u => u.id !== userId && u.userId !== userId && u.email !== userId));
    try {
      await arImmsApi.deleteUser(identifier);
      await fetchDbUsers();
    } catch (err) {
      console.warn('Backend deleteUser fallback:', err);
    }
    setAuditLogs(prev => [
      {
        id: `audit-${Date.now()}`,
        timestamp: new Date().toISOString().replace('T', ' ').slice(0, 19),
        user: currentUser?.email || 'admin@ar-imms.corp',
        userType: 'user',
        initials: currentUser?.initials || 'AD',
        action: 'Xóa Tài Khoản Người Dùng',
        target: userId,
        ipAddress: '192.168.1.100',
        status: 'Critical'
      },
      ...prev
    ]);
  };

  const handleUpdateUserRole = async (userId: string, newRole: 'Admin' | 'Technician') => {
    const targetUser = users.find(u => u.id === userId || u.userId === userId || u.email === userId);
    const identifier = targetUser?.id || targetUser?.email || userId;

    setUsers(prev => prev.map(u => (u.id === userId || u.userId === userId || u.email === userId) ? { ...u, role: newRole } : u));
    try {
      await arImmsApi.updateUserRole(identifier, newRole);
      await fetchDbUsers();
    } catch (err) {
      console.warn('Backend updateUserRole fallback:', err);
    }
    setAuditLogs(prev => [
      {
        id: `audit-${Date.now()}`,
        timestamp: new Date().toISOString().replace('T', ' ').slice(0, 19),
        user: currentUser?.email || 'admin@ar-imms.corp',
        userType: 'user',
        initials: currentUser?.initials || 'AD',
        action: `Thay Đổi Vai Trò Người Dùng -> ${newRole}`,
        target: userId,
        ipAddress: '192.168.1.100',
        status: 'Success'
      },
      ...prev
    ]);
  };

  const handleApproveUser = async (userId: string) => {
    const targetUser = users.find(u => u.id === userId || u.userId === userId || u.email === userId);
    const identifier = targetUser?.id || targetUser?.email || userId;

    setUsers(prev => prev.map(u => (u.id === userId || u.userId === userId || u.email === userId) ? { ...u, status: 'Active' } : u));
    try {
      await arImmsApi.approveUser(identifier);
      await fetchDbUsers();
    } catch (err) {
      console.warn('Backend approveUser sync fallback:', err);
    }

    setAuditLogs(prev => [
      {
        id: `audit-${Date.now()}`,
        timestamp: new Date().toISOString().replace('T', ' ').slice(0, 19),
        user: currentUser?.email || 'admin@ar-imms.corp',
        userType: 'user',
        initials: currentUser?.initials || 'AD',
        action: 'Phê Duyệt Tài Khoản (Gửi Email Chào Mừng)',
        target: userId,
        ipAddress: '192.168.1.100',
        status: 'Success'
      },
      ...prev
    ]);
  };

  const handleDenyUser = async (userId: string) => {
    const targetUser = users.find(u => u.id === userId || u.userId === userId || u.email === userId);
    const identifier = targetUser?.id || targetUser?.email || userId;

    setUsers(prev => prev.filter(u => u.id !== userId && u.userId !== userId && u.email !== userId));
    try {
      await arImmsApi.deleteUser(identifier);
      await fetchDbUsers();
    } catch (err) {
      console.warn('Backend denyUser fallback:', err);
    }
  };

  const handleToggleLockUser = async (userId: string) => {
    const targetUser = users.find(u => u.id === userId || u.userId === userId || u.email === userId);
    const identifier = targetUser?.id || targetUser?.email || userId;
    const willLock = targetUser ? targetUser.status !== 'Locked' : true;
    
    setUsers(prev => prev.map(u => (u.id === userId || u.userId === userId || u.email === userId) ? { ...u, status: willLock ? 'Locked' : 'Active' } : u));
    try {
      if (willLock) {
        await arImmsApi.lockUser(identifier);
      } else {
        await arImmsApi.unlockUser(identifier);
      }
      await fetchDbUsers();
    } catch (err) {
      console.warn('Backend lock/unlock fallback:', err);
    }

    setAuditLogs(prev => [
      {
        id: `audit-${Date.now()}`,
        timestamp: new Date().toISOString().replace('T', ' ').slice(0, 19),
        user: currentUser?.email || 'admin@ar-imms.corp',
        userType: 'user',
        initials: currentUser?.initials || 'AD',
        action: willLock ? 'Khóa Tài Khoản Người Dùng' : 'Mở Khóa Tài Khoản Người Dùng',
        target: userId,
        ipAddress: '192.168.1.100',
        status: 'Warning'
      },
      ...prev
    ]);
  };

  const revealClass = (id: RevealId) => (revealed.has(id) ? "code-reveal active" : "code-reveal");

  // Nếu chưa đăng nhập: Bắt buộc hiển thị màn hình Đăng Nhập / Xác Thực (AuthView)
  if (!currentUser) {
    return (
      <div className="min-h-screen bg-[#080b0e] text-slate-100 flex flex-col justify-center">
        <AuthView
          onLoginSuccess={(user) => {
            setCurrentUser(user);
          }}
          onRegisterUser={(newUser) => {
            handleSaveUser(newUser);
            if (newUser.status === 'Active') {
              setCurrentUser(newUser);
            }
          }}
          registeredUsers={users}
        />
      </div>
    );
  }

  return (
    <DeviceViewportSimulator>
      <div className="min-h-screen overflow-x-hidden bg-[#080b0e] text-slate-200 antialiased selection:bg-[#f59e0b] selection:text-[#080b0e] font-sans">
      {/* Background Atmosphere Matrix */}
      <div className="pointer-events-none fixed inset-0 z-0 overflow-hidden">
        <div className="absolute inset-0 terminal-grid opacity-60" />
        <div className="absolute left-[10%] top-[20%] h-[50vw] w-[50vw] rounded-full blur-3xl ambient-lamp" />
        <div className="absolute bottom-[10%] right-[-5%] h-[40vw] w-[40vw] rounded-full bg-[#38bdf8]/5 blur-[120px]" />
        {particles.map((p, i) => (
          <div
            key={i}
            className="particle"
            style={{
              left: p.left,
              width: `${p.size}px`,
              height: `${p.size}px`,
              animationDuration: p.duration,
              animationDelay: p.delay,
            }}
          />
        ))}
      </div>

      {/* Top Fixed Header Navbar */}
      <nav
        id="top-nav"
        className={`fixed left-0 top-0 z-50 flex w-full items-center border-b transition-all duration-300 ${
          scrolled 
            ? "h-16 bg-[#080b0e]/90 backdrop-blur-md border-[#222c37]" 
            : "h-20 bg-transparent border-transparent"
        }`}
      >
        <div className="mx-auto flex w-full max-w-7xl items-center justify-between px-6">
          {/* Brand Logo */}
          <a href="#" className="flex items-center gap-3 font-mono text-base font-bold tracking-wider text-white">
            <span className="relative flex h-2.5 w-2.5">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-[#00f0ff] opacity-75" />
              <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-[#00f0ff]" />
            </span>
            CORE // HỆ THỐNG
          </a>

          {/* Navigation Links */}
          <div className="hidden items-center gap-6 text-xs uppercase tracking-widest text-slate-400 md:flex font-mono">
            <a href="#architecture" className="transition-colors hover:text-[#00f0ff]">
              Kiến Trúc
            </a>
            {isAdmin && (
              <button
                onClick={() => {
                  setActiveViewSection('users');
                  const el = document.getElementById('operations');
                  if (el) el.scrollIntoView({ behavior: 'smooth' });
                }}
                className="transition-colors hover:text-[#00f0ff] flex items-center gap-1.5 cursor-pointer uppercase tracking-widest text-slate-400 font-mono"
              >
                <Shield className="w-3.5 h-3.5 text-[#00f0ff]" />
                Trang Quản Trị
              </button>
            )}
            <a href="#modules" className="transition-colors hover:text-[#00f0ff]">
              Modules
            </a>
            <button
              onClick={() => {
                setActiveViewSection('assets');
                const el = document.getElementById('operations');
                if (el) el.scrollIntoView({ behavior: 'smooth' });
              }}
              className="transition-colors hover:text-[#38bdf8] flex items-center gap-1.5 cursor-pointer uppercase tracking-widest text-slate-400"
            >
              <Server className="w-3.5 h-3.5 text-[#38bdf8]" />
              Tủ Rack & Thiết Bị
            </button>
            <a href="#operations" className="transition-colors hover:text-[#ffb03a] flex items-center gap-1.5">
              <Activity className="w-3.5 h-3.5 text-[#ffb03a]" />
              Vận Hành
            </a>
          </div>

          {/* Actions & Profile */}
          <div className="flex items-center gap-3">
            {/* Admin Portal Direct Button */}
            {isAdmin && (
              <button 
                onClick={() => {
                  setActiveViewSection('users');
                  const el = document.getElementById('operations');
                  if (el) el.scrollIntoView({ behavior: 'smooth' });
                }}
                className="keycap-glow flex items-center gap-1.5 border border-[#38bdf8]/50 bg-[#11161b] px-3.5 py-1.5 font-mono text-xs uppercase tracking-widest text-[#38bdf8] hover:text-white transition-all hover:border-[#00f0ff] hover:bg-[#38bdf8]/10 cursor-pointer shadow-sm font-bold"
                title="Mở Trang Quản Trị Hệ Thống & Phân Quyền"
              >
                <Shield className="w-3.5 h-3.5 text-[#38bdf8]" />
                Trang Quản Trị
              </button>
            )}

            {!currentUser ? (
              <button
                onClick={() => setIsAuthModalOpen(true)}
                className="flex items-center gap-1.5 border border-[#ffb03a]/50 bg-[#ffb03a]/10 hover:bg-[#ffb03a] hover:text-[#080b0e] px-3.5 py-1.5 font-mono text-[11px] uppercase tracking-wider text-[#ffb03a] transition-all cursor-pointer font-bold shadow-sm"
              >
                <LogIn className="w-3.5 h-3.5" />
                Đăng Nhập / Đăng Ký
              </button>
            ) : (
              <div className="flex items-center gap-2.5 border border-[#222c37] bg-[#11161b] px-3 py-1.5 font-mono shadow-sm">
                <span className="w-6 h-6 rounded-none bg-gradient-to-tr from-[#38bdf8] to-[#f59e0b] flex items-center justify-center font-bold text-[11px] text-[#080b0e]">
                  {currentUser.initials || currentUser.name.charAt(0)}
                </span>
                <div className="flex flex-col text-left">
                  <span className="text-[11px] font-bold text-white leading-none truncate max-w-[120px]">
                    {currentUser.name}
                  </span>
                  <span className={`text-[9px] font-bold leading-tight ${currentUser.role === 'Admin' ? 'text-indigo-300' : 'text-sky-400'}`}>
                    {currentUser.role === 'Admin' ? '👑 Admin' : '🛠️ Technician'}
                  </span>
                </div>
                <button
                  onClick={() => {
                    setCurrentUser(null);
                    localStorage.removeItem('ar_imms_user');
                  }}
                  title="Đăng xuất khỏi hệ thống"
                  className="ml-2 flex items-center gap-1 text-[10px] font-bold text-rose-400 hover:text-white bg-rose-500/10 hover:bg-rose-500/30 border border-rose-500/30 px-2 py-1 transition-all cursor-pointer font-mono"
                >
                  <LogOut className="w-3 h-3" />
                  <span>Đăng Xuất</span>
                </button>
              </div>
            )}

            {/* Mobile Hamburger Menu Toggle */}
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="flex md:hidden items-center justify-center w-8 h-8 sm:w-9 sm:h-9 rounded-xl bg-[#161d24] border border-[#222c37] text-slate-200 hover:text-[#00f0ff] hover:border-[#38bdf8]/40 transition-all cursor-pointer"
              title="Mở thanh điều hướng di động"
            >
              {isMobileMenuOpen ? <X className="w-4 h-4" /> : <Menu className="w-4 h-4" />}
            </button>
          </div>
        </div>

        {/* Mobile Navigation Drawer */}
        {isMobileMenuOpen && (
          <div className="fixed inset-0 top-16 z-40 md:hidden bg-black/90 backdrop-blur-xl animate-in fade-in duration-200 p-5 flex flex-col justify-between font-mono border-b border-[#222c37]">
            <div className="flex flex-col gap-3 overflow-y-auto max-h-[calc(100vh-160px)] pr-1">
              <div className="text-[11px] font-bold text-[#38bdf8] uppercase tracking-widest border-b border-[#222c37] pb-1.5 flex items-center justify-between">
                <span>MENU ĐIỀU HƯỚNG</span>
                <span className="text-[10px] text-slate-500">AR-IMMS MOBILE</span>
              </div>

              <a
                href="#architecture"
                onClick={() => setIsMobileMenuOpen(false)}
                className="flex items-center gap-3 p-2.5 rounded-xl bg-[#11161b] border border-[#222c37] text-xs font-bold text-slate-200 hover:text-[#00f0ff] hover:border-[#00f0ff]/40 transition-all"
              >
                <Cpu className="w-4 h-4 text-[#00f0ff]" />
                <span>Kiến Trúc Hệ Thống</span>
              </a>

              <a
                href="#modules"
                onClick={() => setIsMobileMenuOpen(false)}
                className="flex items-center gap-3 p-2.5 rounded-xl bg-[#11161b] border border-[#222c37] text-xs font-bold text-slate-200 hover:text-[#00f0ff] hover:border-[#00f0ff]/40 transition-all"
              >
                <Box className="w-4 h-4 text-[#00f0ff]" />
                <span>Các Modules Cốt Lõi</span>
              </a>

              <a
                href="#operations"
                onClick={() => {
                  setIsMobileMenuOpen(false);
                  const el = document.getElementById('operations');
                  if (el) el.scrollIntoView({ behavior: 'smooth' });
                }}
                className="flex items-center gap-3 p-2.5 rounded-xl bg-[#11161b] border border-[#222c37] text-xs font-bold text-slate-200 hover:text-[#ffb03a] hover:border-[#ffb03a]/40 transition-all"
              >
                <Activity className="w-4 h-4 text-[#ffb03a]" />
                <span>Khu Vực Vận Hành & Quản Trị</span>
              </a>

              <div className="text-[11px] font-bold text-slate-400 uppercase tracking-widest border-b border-[#222c37] pb-1.5 mt-2">
                TRUY CẬP NHANH PHÂN HỆ
              </div>

              <div className="grid grid-cols-2 gap-2">
                <button
                  onClick={() => {
                    setActiveViewSection('twin');
                    setIsMobileMenuOpen(false);
                    const el = document.getElementById('operations');
                    if (el) el.scrollIntoView({ behavior: 'smooth' });
                  }}
                  className={`p-2 rounded-xl border text-left text-[11px] font-bold transition-all flex items-center gap-2 ${
                    activeViewSection === 'twin' ? 'bg-[#38bdf8]/15 border-[#38bdf8] text-[#38bdf8]' : 'bg-[#11161b] border-[#222c37] text-slate-300'
                  }`}
                >
                  <Activity className="w-3.5 h-3.5 text-[#38bdf8]" />
                  <span>Telemetry</span>
                </button>

                <button
                  onClick={() => {
                    setActiveViewSection('alerts');
                    setIsMobileMenuOpen(false);
                    const el = document.getElementById('operations');
                    if (el) el.scrollIntoView({ behavior: 'smooth' });
                  }}
                  className={`p-2 rounded-xl border text-left text-[11px] font-bold transition-all flex items-center gap-2 ${
                    activeViewSection === 'alerts' ? 'bg-red-500/15 border-red-500 text-red-400' : 'bg-[#11161b] border-[#222c37] text-slate-300'
                  }`}
                >
                  <AlertTriangle className="w-3.5 h-3.5 text-red-400" />
                  <span>Cảnh Báo ({alerts.filter(a => !a.resolved).length})</span>
                </button>

                <button
                  onClick={() => {
                    setActiveViewSection('tickets');
                    setIsMobileMenuOpen(false);
                    const el = document.getElementById('operations');
                    if (el) el.scrollIntoView({ behavior: 'smooth' });
                  }}
                  className={`p-2 rounded-xl border text-left text-[11px] font-bold transition-all flex items-center gap-2 ${
                    activeViewSection === 'tickets' ? 'bg-sky-500/15 border-sky-500 text-sky-300' : 'bg-[#11161b] border-[#222c37] text-slate-300'
                  }`}
                >
                  <Wrench className="w-3.5 h-3.5 text-sky-400" />
                  <span>Bảo Trì & AR</span>
                </button>

                <button
                  onClick={() => {
                    setActiveViewSection('assets');
                    setIsMobileMenuOpen(false);
                    const el = document.getElementById('operations');
                    if (el) el.scrollIntoView({ behavior: 'smooth' });
                  }}
                  className={`p-2 rounded-xl border text-left text-[11px] font-bold transition-all flex items-center gap-2 ${
                    activeViewSection === 'assets' ? 'bg-[#ffb03a]/15 border-[#ffb03a] text-[#ffb03a]' : 'bg-[#11161b] border-[#222c37] text-slate-300'
                  }`}
                >
                  <Server className="w-3.5 h-3.5 text-[#ffb03a]" />
                  <span>Tủ Rack ({racks.length})</span>
                </button>

                {isAdmin && (
                  <button
                    onClick={() => {
                      setActiveViewSection('users');
                      setIsMobileMenuOpen(false);
                      const el = document.getElementById('operations');
                      if (el) el.scrollIntoView({ behavior: 'smooth' });
                    }}
                    className={`p-2 rounded-xl border text-left text-[11px] font-bold transition-all flex items-center gap-2 ${
                      activeViewSection === 'users' ? 'bg-indigo-500/15 border-indigo-500 text-indigo-300' : 'bg-[#11161b] border-[#222c37] text-slate-300'
                    }`}
                  >
                    <UsersIcon className="w-3.5 h-3.5 text-indigo-400" />
                    <span>Người Dùng</span>
                  </button>
                )}

                <button
                  onClick={() => {
                    setActiveViewSection('analytics');
                    setIsMobileMenuOpen(false);
                    const el = document.getElementById('operations');
                    if (el) el.scrollIntoView({ behavior: 'smooth' });
                  }}
                  className={`p-2 rounded-xl border text-left text-[11px] font-bold transition-all flex items-center gap-2 ${
                    activeViewSection === 'analytics' ? 'bg-teal-500/15 border-teal-500 text-teal-300' : 'bg-[#11161b] border-[#222c37] text-slate-300'
                  }`}
                >
                  <TrendingUp className="w-3.5 h-3.5 text-teal-400" />
                  <span>Báo Cáo PUE</span>
                </button>
              </div>
            </div>

            <div className="pt-3 border-t border-[#222c37] flex items-center justify-between">
              {currentUser ? (
                <div className="flex items-center justify-between w-full">
                  <div className="flex items-center gap-2">
                    <span className="w-7 h-7 rounded bg-gradient-to-tr from-[#38bdf8] to-[#f59e0b] flex items-center justify-center font-bold text-xs text-[#080b0e]">
                      {currentUser.initials || currentUser.name.charAt(0)}
                    </span>
                    <div>
                      <div className="text-xs font-bold text-white leading-none">{currentUser.name}</div>
                      <div className="text-[10px] text-sky-400">{currentUser.role}</div>
                    </div>
                  </div>
                  <button
                    onClick={() => {
                      setCurrentUser(null);
                      localStorage.removeItem('ar_imms_user');
                      setIsMobileMenuOpen(false);
                    }}
                    className="px-2.5 py-1.5 bg-rose-500/15 border border-rose-500/30 text-rose-300 text-xs font-bold rounded-lg flex items-center gap-1 cursor-pointer"
                  >
                    <LogOut className="w-3.5 h-3.5" />
                    <span>Đăng Xuất</span>
                  </button>
                </div>
              ) : (
                <button
                  onClick={() => {
                    setIsMobileMenuOpen(false);
                    setIsAuthModalOpen(true);
                  }}
                  className="w-full py-2 bg-[#38bdf8] hover:bg-[#7dd3fc] text-[#080b0e] rounded-xl text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-2 cursor-pointer"
                >
                  <LogIn className="w-4 h-4" />
                  <span>Đăng Nhập / Đăng Ký</span>
                </button>
              )}
            </div>
          </div>
        )}
      </nav>

      {/* Hero Header Section */}
      <header className="relative flex min-h-screen items-center justify-center overflow-hidden pt-20">
        {/* Parallax Video Container */}
        <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none">
          <video
            ref={heroVideoRef}
            autoPlay
            loop
            muted
            playsInline
            preload="auto"
            disablePictureInPicture
            disableRemotePlayback
            className="h-full w-full object-cover opacity-50 contrast-125 brightness-90"
            style={{ 
              willChange: "transform",
              transform: "translate3d(0, 0, 0)",
              backfaceVisibility: "hidden"
            }}
          >
            <source src="/video.mp4" type="video/mp4" />
          </video>
          <div className="absolute inset-0 bg-gradient-to-t from-[#080b0e] via-[#080b0e]/40 to-transparent" />
          <div className="absolute inset-0 bg-gradient-to-r from-[#080b0e]/90 via-transparent to-[#080b0e]/90" />
        </div>

        {/* Hero Content */}
        <div className="relative z-10 mx-auto grid w-full max-w-7xl gap-12 px-6 py-12 lg:grid-cols-12">
          <div className="space-y-8 text-left lg:col-span-7">
            {/* Tag Badge */}
            <div className="inline-flex items-center gap-3 border border-[#222c37] bg-[#11161b]/80 px-4 py-1.5">
              <Icon icon="radix-icons:dot-filled" className="animate-spin text-[#ffb03a] text-lg" />
              <span className="font-mono text-xs uppercase tracking-widest text-slate-300">
                Môi Trường Cô Lập // Sandbox An Toàn
              </span>
            </div>

            {/* Headline */}
            <h1 className="text-5xl font-bold leading-[1.1] tracking-tight text-white sm:text-6xl md:text-7xl">
              Giám Sát Chuyên Sâu <br />
              <span className="bg-gradient-to-r from-[#38bdf8] via-[#ffb03a] to-[#f59e0b] bg-clip-text text-transparent font-mono">
                Ma Trận Trung Tâm Dữ Liệu.
              </span>
            </h1>

            {/* Subtitle */}
            <p className="max-w-xl text-base font-light leading-relaxed text-slate-400 sm:text-lg">
              Không gian điều hành thông minh với bản sao số 3D thời gian thực, định vị lỗi linh kiện qua thực tế tăng cường AR và hệ thống cảnh báo nhiệt độ tức thì.
            </p>

            {/* Call to Actions */}
            <div className="flex flex-col items-stretch gap-4 sm:flex-row sm:items-center">
              <button
                onClick={() => {
                  setActiveViewSection(isAdmin ? 'users' : 'tickets');
                  const el = document.getElementById('operations');
                  if (el) el.scrollIntoView({ behavior: 'smooth' });
                }}
                className="keycap-glow flex items-center justify-center gap-2 rounded-none bg-[#38bdf8] px-8 py-4 text-center font-mono text-xs font-bold uppercase tracking-widest text-[#080b0e] transition-all hover:bg-[#00f0ff] cursor-pointer"
              >
                {isAdmin ? <Shield className="w-4 h-4" /> : <Wrench className="w-4 h-4" />}
                {isAdmin ? 'Vào Trang Quản Trị' : 'Vào Phiếu Kỹ Thuật & Bảo Trì'}
              </button>
              <a
                href="#architecture"
                className="rounded-none border border-[#222c37] bg-[#11161b]/40 px-8 py-4 text-center font-mono text-xs font-light uppercase tracking-widest text-slate-300 transition-all hover:border-slate-400 hover:text-white"
              >
                Xem Bản Vẽ Kiến Trúc
              </a>
            </div>
          </div>
        </div>
      </header>

      {/* Main Body Sections */}
      <main className="relative z-10 space-y-32">
        {/* Section 1: Architecture */}
        <section
          id="architecture"
          data-reveal-id="architecture"
          className={`${revealClass("architecture")} mx-auto max-w-7xl px-6 pt-16`}
        >
          <div className="grid items-center gap-12 lg:grid-cols-12">
            <div className="space-y-6 lg:col-span-5">
              <span className="block text-xs uppercase tracking-widest text-[#ffb03a] font-mono">
                Đặc Tả Môi Trường
              </span>
              <h2 className="text-4xl font-bold tracking-tight text-white sm:text-5xl">
                Kiến Trúc Hạ Tầng Enclave
              </h2>
              <p className="leading-relaxed text-slate-400 font-light">
                Bằng cách phân lập các mô-đun máy chủ thành các đơn vị không gian độc lập, toàn bộ hệ thống được bảo vệ vững chắc khỏi sự cố lan truyền. Nâng cao tối đa độ tin cậy và hiệu suất vận hành.
              </p>
              <div className="grid grid-cols-2 gap-4 pt-4">
                <div className="border-l-2 border-[#38bdf8] pl-4">
                  <div className="font-mono text-xl font-bold text-white">99.98%</div>
                  <div className="text-xs uppercase tracking-wider text-slate-500">Độ Sẵn Sàng Vận Hành</div>
                </div>
                <div className="border-l-2 border-[#ffb03a] pl-4">
                  <div className="font-mono text-xl font-bold text-white">&lt; 1.2ms</div>
                  <div className="text-xs uppercase tracking-wider text-slate-500">Độ Trễ Socket IO</div>
                </div>
              </div>
            </div>

            <div className="grid gap-6 sm:grid-cols-2 lg:col-span-7">
              <div className="isometric-card border border-[#222c37] bg-[#161d24] p-8 space-y-4">
                <Icon icon="ph:terminal-window-light" className="text-3xl text-[#38bdf8]" />
                <h3 className="text-xl font-semibold text-white">Vỏ Bọc Cô Lập</h3>
                <p className="text-sm leading-relaxed text-slate-400 font-light">
                  Chạy các phân vùng hệ thống hoàn toàn độc lập, không bị ảnh hưởng bởi tải xử lý toàn cục.
                </p>
              </div>

              <div className="isometric-card border border-[#222c37] bg-[#161d24] p-8 space-y-4">
                <Icon icon="ph:lightbulb-filament-light" className="text-3xl text-[#ffb03a]" />
                <h3 className="text-xl font-semibold text-white">Quang Phổ Chiếu Sáng</h3>
                <p className="text-sm leading-relaxed text-slate-400 font-light">
                  Hiệu chỉnh đèn báo 2700K và LED trạng thái tối ưu cho các phiên trực ca đêm.
                </p>
              </div>

              <div className="isometric-card border border-[#222c37] bg-[#161d24] p-8 space-y-4">
                <Icon icon="ph:layout-light" className="text-3xl text-slate-400" />
                <h3 className="text-xl font-semibold text-white">Liên Kết Phím Ma Trận</h3>
                <p className="text-sm leading-relaxed text-slate-400 font-light">
                  Ánh xạ trực tiếp lệnh IPMI và macro điều khiển quạt/nguồn tức thời.
                </p>
              </div>

              <div className="isometric-card border border-[#222c37] bg-[#161d24] p-8 space-y-4">
                <Icon icon="ph:shield-warning-light" className="text-3xl text-[#00f0ff]" />
                <h3 className="text-xl font-semibold text-white">Hộp Cát Vật Lý</h3>
                <p className="text-sm leading-relaxed text-slate-400 font-light">
                  Tường lửa phần cứng ngăn chặn sự cố phát tán ra mạng lưới bên ngoài.
                </p>
              </div>
            </div>
          </div>

          {/* Embedded 3D Digital Twin Viewer */}
          <div className="mt-16 border border-[#222c37] bg-[#080b0e] p-6 shadow-2xl">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between border-b border-[#222c37] pb-4 mb-6 gap-4">
              <div>
                <span className="font-mono text-xs uppercase tracking-widest text-[#38bdf8] flex items-center gap-2">
                  <Box className="w-4 h-4" />
                  Sơ Đồ Kỹ Thuật Số // Không Gian Quản Trị
                </span>
                <h3 className="text-xl font-bold text-white mt-1">Mặt Cắt Kỹ Thuật Số Tủ Rack &amp; Thiết Bị (Digital Twin)</h3>
              </div>
              <button
                onClick={() => {
                  setArTargetAlert(null);
                  setIsARModalOpen(true);
                }}
                className="keycap-glow inline-flex items-center gap-2 bg-[#38bdf8]/20 border border-[#38bdf8] px-4 py-2 font-mono text-xs text-[#38bdf8] hover:bg-[#38bdf8] hover:text-[#080b0e] transition-all cursor-pointer"
              >
                <Camera className="w-4 h-4" />
                Kích Hoạt Không Gian AR
              </button>
            </div>

            <div className="w-full relative">
              <DigitalTwinView
                racks={racks}
                onSelectTab={(tab) => {
                  setActiveViewSection(tab as any);
                  const el = document.getElementById('modules');
                  if (el) {
                    el.scrollIntoView({ behavior: 'smooth' });
                  }
                }}
                onSelectRack={(rack) => {
                  setTerminalLogs(prev => [
                    { text: `[TWIN] Đã kiểm tra ${rack.name} (${rack.zone || 'Zone Alpha'}) - Nhiệt độ: ${rack.temperature}°C, Tải: ${rack.powerDrawKw} kW`, type: 'info' },
                    ...prev.slice(0, 15)
                  ]);
                }}
                onOpenAR={() => {
                  setArTargetAlert(null);
                  setIsARModalOpen(true);
                }}
              />
            </div>
          </div>
        </section>

        {/* Section 2: Command Console */}
        <section
          id="console"
          data-reveal-id="console"
          className={`${revealClass("console")} border-y border-[#222c37] bg-[#11161b]/50 py-32`}
        >
          <div className="mx-auto max-w-7xl px-6">
            <div className="mx-auto mb-16 max-w-2xl text-center">
              <span className="mb-3 block text-xs uppercase tracking-widest text-[#38bdf8] font-mono">
                Ghi Đè Lệnh Điều Khiển
              </span>
              <h2 className="text-3xl font-bold tracking-tight text-white sm:text-5xl">
                Ma Trận Bảng Lệnh TTY Tương Tác
              </h2>
            </div>

            <div className="mx-auto w-full max-w-4xl overflow-hidden border border-[#222c37] bg-[#080b0e] shadow-2xl">
              {/* Window Header */}
              <div className="flex select-none items-center justify-between border-b border-[#222c37] bg-[#11161b] px-4 py-3">
                <div className="flex items-center gap-2">
                  <span className="h-2.5 w-2.5 rounded-full bg-red-500/80 cursor-pointer" onClick={() => setTerminalLogs([])} />
                  <span className="h-2.5 w-2.5 rounded-full bg-yellow-500/80 cursor-pointer" />
                  <span className="h-2.5 w-2.5 rounded-full bg-green-500/80 cursor-pointer" />
                  <span className="ml-2 font-mono text-xs text-slate-400">enclave_kernel_v4.sh</span>
                </div>
                <div className="flex items-center gap-4">
                  <span className="font-mono text-[10px] text-[#38bdf8] animate-pulse">● LUỒNG SOCKET THỜI GIAN THỰC</span>
                  <span className="font-mono text-[10px] text-slate-600">TTY // 1</span>
                </div>
              </div>

              {/* Terminal Logs & Content */}
              <div className="min-h-[360px] max-h-[460px] overflow-y-auto space-y-3 bg-gradient-to-b from-[#080b0e] to-[#11161b]/20 p-6 font-mono text-xs sm:text-sm">
                <div className="flex items-start gap-2">
                  <span className="text-[#38bdf8]">quan_tri@nexus:~$</span>
                  <span className="text-slate-300">init --container=enter_keycap</span>
                </div>

                <div className="space-y-1.5 text-slate-400">
                  {terminalLogs.map((log, idx) => (
                    <div 
                      key={idx} 
                      className={
                        log.type === 'warn' 
                          ? 'text-yellow-400' 
                          : log.type === 'success' 
                            ? 'text-[#38bdf8]' 
                            : log.type === 'cmd' 
                              ? 'text-white font-bold' 
                              : 'text-slate-400'
                      }
                    >
                      {log.type === 'success' && '[ THÀNH CÔNG ] '}
                      {log.text}
                    </div>
                  ))}
                </div>

                <div className="border border-[#222c37]/60 bg-[#161d24]/50 p-4 leading-relaxed text-[#ffb03a] my-3">
                  &quot;Các ứng dụng vĩ đại không sinh ra trên những hệ thống cồng kềnh, mà được viết bên trong những không gian làm việc rõ ràng và chính xác tuyệt đối. Làm chủ hạ tầng, làm chủ tương lai.&quot;
                </div>

                {/* Interactive Prompt */}
                <form onSubmit={handleTerminalSubmit} className="flex items-center gap-2 pt-2 border-t border-[#222c37]/40">
                  <span className="text-[#38bdf8] whitespace-nowrap">quan_tri@nexus:~$</span>
                  <input
                    type="text"
                    value={terminalInput}
                    onChange={(e) => setTerminalInput(e.target.value)}
                    placeholder="Nhập 'help', 'status', 'scan_qr', 'boost_fan', hoặc 'clear'..."
                    className="flex-1 bg-transparent text-white font-mono text-xs sm:text-sm outline-none placeholder:text-slate-600"
                  />
                  <button type="submit" className="text-[10px] uppercase font-mono text-[#38bdf8] hover:text-white px-2 py-1 border border-[#38bdf8]/30">
                    Gửi Lệnh
                  </button>
                </form>
              </div>
            </div>
          </div>
        </section>

        {/* Section 3: Workspace Controls & Configured Nodes */}
        <section
          id="modules"
          data-reveal-id="modules"
          className={`${revealClass("modules")} mx-auto max-w-7xl px-6`}
        >
          <div className="mb-16 flex flex-col items-start justify-between gap-6 md:flex-row md:items-end">
            <div>
              <span className="mb-3 block text-xs uppercase tracking-widest text-[#ffb03a] font-mono">
                Cấu Hình Module & Không Gian
              </span>
              <h2 className="text-4xl font-bold tracking-tight text-white">
                Tủ Rack Máy Chủ & Khối Xử Lý
              </h2>
            </div>
            <p className="max-w-xs text-sm font-light text-slate-400">
              Tùy chỉnh thông số vận hành chuyên sâu và tương tác trực tiếp với các tủ rack máy chủ vật lý theo thời gian thực.
            </p>
          </div>

          {/* 3 Node Config Cards */}
          <div className="grid gap-8 md:grid-cols-3">
            <div className="group flex h-80 flex-col justify-between border border-[#222c37] bg-[#161d24] p-8 transition-colors hover:border-[#38bdf8]/40">
              <div>
                <div className="mb-6 flex items-start justify-between">
                  <div className="flex h-12 w-12 items-center justify-center border border-[#38bdf8]/20 bg-[#38bdf8]/10 text-xl text-[#38bdf8]">
                    <Icon icon="ph:cube-light" />
                  </div>
                  <span className="font-mono text-xs text-slate-600">01 / NODE</span>
                </div>
                <h3 className="mb-2 text-xl font-bold text-white transition-colors group-hover:text-[#38bdf8]">
                  Đóng Gói Cô Lập
                </h3>
                <p className="text-sm leading-relaxed text-slate-400 font-light">
                  Phân tách hoàn toàn các thông số hệ thống, đảm bảo môi trường kiểm thử độc lập tuyệt đối trong từng chu kỳ hoạt động.
                </p>
              </div>
              <div className="text-[11px] uppercase tracking-widest text-slate-500 font-mono">
                Trạng thái: Cô Lập Tích Cực
              </div>
            </div>

            <div className="group flex h-80 flex-col justify-between border border-[#222c37] bg-[#161d24] p-8 transition-colors hover:border-[#ffb03a]/40">
              <div>
                <div className="mb-6 flex items-start justify-between">
                  <div className="flex h-12 w-12 items-center justify-center border border-[#ffb03a]/20 bg-[#ffb03a]/10 text-xl text-[#ffb03a]">
                    <Icon icon="ph:sliders-horizontal-light" />
                  </div>
                  <span className="font-mono text-xs text-slate-600">02 / NODE</span>
                </div>
                <h3 className="mb-2 text-xl font-bold text-white transition-colors group-hover:text-[#ffb03a]">
                  Điều Biến Ánh Sáng
                </h3>
                <p className="text-sm leading-relaxed text-slate-400 font-light">
                  Kiểm soát quang thông tại chỗ. Chuyển đổi linh hoạt từ chế độ sáng ban ngày sang dải màu hổ phách dịu mắt.
                </p>
              </div>
              <div className="text-[11px] uppercase tracking-widest text-slate-500 font-mono">
                Trạng thái: Chuẩn 2700K Đã Hiệu Chuẩn
              </div>
            </div>

            <div className="group flex h-80 flex-col justify-between border border-[#222c37] bg-[#161d24] p-8 transition-colors hover:border-[#00f0ff]/40">
              <div>
                <div className="mb-6 flex items-start justify-between">
                  <div className="flex h-12 w-12 items-center justify-center border border-[#00f0ff]/20 bg-[#00f0ff]/10 text-xl text-[#00f0ff]">
                    <Icon icon="ph:command-light" />
                  </div>
                  <span className="font-mono text-xs text-slate-600">03 / NODE</span>
                </div>
                <h3 className="mb-2 text-xl font-bold text-white transition-colors group-hover:text-[#00f0ff]">
                  Macro Phím Tắt
                </h3>
                <p className="text-sm leading-relaxed text-slate-400 font-light">
                  Gán cấu hình phần mềm toàn diện vào các phím bấm vật lý chuyên dụng ngay trên bệ làm việc.
                </p>
              </div>
              <div className="text-[11px] uppercase tracking-widest text-slate-500 font-mono">
                Trạng thái: Đã Gán Lớp Layer 2
              </div>
            </div>
          </div>
        </section>



        {/* Section 5: Live Datacenter Operations & Incidents */}
        <section
          id="operations"
          data-reveal-id="operations"
          className={`${revealClass("operations")} mx-auto max-w-7xl px-6`}
        >
          <div className="mb-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 border-b border-[#222c37] pb-6">
            <div>
              <span className="text-xs uppercase tracking-widest text-[#38bdf8] font-mono flex items-center gap-1.5 font-bold">
                {isAdmin ? <Shield className="w-3.5 h-3.5 text-[#38bdf8]" /> : <Wrench className="w-3.5 h-3.5 text-[#38bdf8]" />}
                {isAdmin ? 'TRANG QUẢN TRỊ // VẬN HÀNH & GIÁM SÁT' : 'KHU VỰC VẬN HÀNH // GIÁM SÁT & BẢO TRÌ'}
              </span>
              <h2 className="text-3xl font-bold tracking-tight text-white mt-1 font-mono">
                {isAdmin ? 'Trung Tâm Quản Trị & Vận Hành Hệ Thống' : 'Trung Tâm Vận Hành & Giám Sát Kỹ Thuật'}
              </h2>
            </div>
            
            {/* View Switcher Tabs */}
            <div className="w-full xl:w-auto">
              {/* Mobile Quick Dropdown */}
              <div className="block lg:hidden mb-3">
                <select
                  value={activeViewSection}
                  onChange={(e) => setActiveViewSection(e.target.value as any)}
                  className="w-full bg-[#11161b] border border-[#38bdf8]/50 text-sky-300 text-xs font-bold font-mono py-2.5 px-3 rounded-xl focus:outline-none focus:ring-1 focus:ring-[#38bdf8] cursor-pointer"
                >
                  <option value="twin">📊 Đo Đạc Telemetry</option>
                  <option value="alerts">🚨 Cảnh Báo Sự Cố ({alerts.filter(a => !a.resolved).length})</option>
                  <option value="tickets">🔧 Phiếu Bảo Trì & AR ({tickets.filter(t => t.status !== 'CLOSED').length})</option>
                  <option value="assets">🖥️ Quản Trị Tủ Rack & Thiết Bị ({assets.length})</option>
                  {isAdmin && (
                    <option value="users">👥 Quản Trị Người Dùng & RBAC ({users.length})</option>
                  )}
                  <option value="audit">📜 Nhật Ký Kiểm Toán (Audit Logs)</option>
                  <option value="analytics">📈 Báo Cáo, Chỉ Số MTTR & PUE</option>
                </select>
              </div>

              {/* Scrollable Tabs Bar */}
              <div className="flex overflow-x-auto no-scrollbar py-1 gap-1.5 sm:gap-2 font-mono text-xs scroll-smooth max-w-full">
                <button
                  onClick={() => setActiveViewSection('twin')}
                  className={`px-3 py-1.5 border transition-all cursor-pointer shrink-0 ${
                    activeViewSection === 'twin'
                      ? 'border-[#38bdf8] bg-[#38bdf8]/10 text-[#38bdf8]'
                      : 'border-[#222c37] bg-[#11161b] text-slate-400 hover:text-white'
                  }`}
                >
                  Đo Đạc Telemetry
                </button>
              <button
                onClick={() => setActiveViewSection('alerts')}
                className={`px-3 py-1.5 border transition-all cursor-pointer shrink-0 flex items-center gap-1.5 ${
                  activeViewSection === 'alerts'
                    ? 'border-red-500 bg-red-500/10 text-red-400'
                    : 'border-[#222c37] bg-[#11161b] text-slate-400 hover:text-white'
                }`}
              >
                <AlertTriangle className="w-3.5 h-3.5" />
                Cảnh Báo Sự Cố ({alerts.filter(a => !a.resolved).length})
              </button>
              <button
                onClick={() => setActiveViewSection('tickets')}
                className={`px-3 py-1.5 border transition-all cursor-pointer shrink-0 flex items-center gap-1.5 ${
                  activeViewSection === 'tickets'
                    ? 'border-sky-500 bg-sky-500/10 text-sky-300 font-bold shadow-sm'
                    : 'border-[#222c37] bg-[#11161b] text-slate-400 hover:text-white'
                }`}
              >
                <Wrench className="w-3.5 h-3.5 text-sky-400" />
                Phiếu Bảo Trì & AR ({tickets.filter(t => t.status !== 'CLOSED').length})
              </button>
              <button
                onClick={() => setActiveViewSection('assets')}
                className={`px-3 py-1.5 border transition-all cursor-pointer shrink-0 flex items-center gap-1.5 ${
                  activeViewSection === 'assets'
                    ? 'border-[#ffb03a] bg-[#ffb03a]/10 text-[#ffb03a]'
                    : 'border-[#222c37] bg-[#11161b] text-slate-400 hover:text-white'
                }`}
              >
                <Server className="w-3.5 h-3.5" />
                Quản Trị Rack & Thiết Bị ({assets.length})
              </button>
              {isAdmin && (
                <button
                  onClick={() => setActiveViewSection('users')}
                  className={`px-3 py-1.5 border transition-all cursor-pointer shrink-0 flex items-center gap-1.5 ${
                    activeViewSection === 'users'
                      ? 'border-indigo-500 bg-indigo-500/10 text-indigo-300'
                      : 'border-[#222c37] bg-[#11161b] text-slate-400 hover:text-white'
                  }`}
                >
                  <UsersIcon className="w-3.5 h-3.5" />
                  Người Dùng & RBAC ({users.length})
                </button>
              )}
              <button
                onClick={() => setActiveViewSection('audit')}
                className={`px-3 py-1.5 border transition-all cursor-pointer shrink-0 ${
                  activeViewSection === 'audit'
                    ? 'border-emerald-500 bg-emerald-500/10 text-emerald-400'
                    : 'border-[#222c37] bg-[#11161b] text-slate-400 hover:text-white'
                }`}
              >
                Nhật Ký Kiểm Toán
              </button>
              <button
                onClick={() => setActiveViewSection('analytics')}
                className={`px-3 py-1.5 border transition-all cursor-pointer shrink-0 flex items-center gap-1.5 ${
                  activeViewSection === 'analytics'
                    ? 'border-teal-400 bg-teal-400/10 text-teal-300'
                    : 'border-[#222c37] bg-[#11161b] text-slate-400 hover:text-white'
                }`}
              >
                <TrendingUp className="w-3.5 h-3.5" />
                Báo Cáo & PUE / Quy Hoạch
              </button>
            </div>
            </div>
          </div>

          {/* Dynamic Section Render */}
          <div className="border border-[#222c37] bg-[#0c1015] p-6 rounded-none">
            {activeViewSection === 'twin' && (
              <TelemetryView
                racks={racks}
                onSelectRack={(rack) => {
                  setTerminalLogs(prev => [
                    { text: `[METRIC] Đã chọn tủ rack ${rack.name} để phân tích telemetry thời gian thực`, type: 'info' },
                    ...prev.slice(0, 15)
                  ]);
                }}
              />
            )}

            {activeViewSection === 'alerts' && (
              <AlertsView
                alerts={alerts}
                onAcknowledge={handleAcknowledgeAlert}
                onResolve={handleResolveAlert}
                onCreateTicket={(alert) => {
                  setArTargetAlert(alert);
                  setIsCreateTicketModalOpen(true);
                }}
                onOpenAR={(alert) => {
                  setArTargetAlert(alert);
                  setIsARModalOpen(true);
                }}
              />
            )}

            {activeViewSection === 'tickets' && (
              <TicketsView
                tickets={tickets}
                technicians={users.filter(u => u.role === 'Technician' || u.role === 'Admin')}
                nodes={assets.map(a => ({ id: a.id, name: a.name, rack_id: a.rack }))}
                currentUser={currentUser ? { id: currentUser.id, name: currentUser.name, role: currentUser.role } : null}
                onCreateTicket={handleCreateTicket}
                onAssignTicket={handleAssignTicket}
                onAddArLog={handleAddArLog}
                onResolveTicket={handleResolveTicket}
                onCloseTicket={handleCloseTicket}
                onDeleteTicket={handleDeleteTicket}
                onLaunchARView={(nodeId) => {
                  const foundAlert = alerts.find(a => a.id.includes(nodeId) || (a as any).node_id === nodeId) || alerts[0];
                  setArTargetAlert(foundAlert || null);
                  setIsARModalOpen(true);
                }}
              />
            )}

            {activeViewSection === 'assets' && (
              <AssetsView
                assets={assets}
                racks={racks}
                onOpenNewAsset={() => {
                  setAssetToEdit(null);
                  setIsNewAssetModalOpen(true);
                }}
                onEditAsset={(asset) => {
                  setAssetToEdit(asset);
                  setIsNewAssetModalOpen(true);
                }}
                onDeleteAsset={handleDeleteAsset}
                onOpenNewRack={() => {
                  setRackToEdit(null);
                  setIsRackModalOpen(true);
                }}
                onEditRack={(rack) => {
                  setRackToEdit(rack);
                  setIsRackModalOpen(true);
                }}
                onDeleteRack={handleDeleteRack}
                onOpenPrintModal={(asset) => {
                  setSelectedPrintAsset(asset);
                  setIsPrintLabelModalOpen(true);
                }}
                onSelectAsset={(asset) => setSelectedNodeDetail(asset)}
                onOpenNodeDetail={(asset) => setSelectedNodeDetail(asset)}
              />
            )}

            {activeViewSection === 'users' && isAdmin && (
              <UsersView
                users={users}
                currentUser={currentUser}
                onRequireLogin={() => setIsAuthModalOpen(true)}
                onApproveUser={handleApproveUser}
                onDenyUser={handleDenyUser}
                onToggleLockUser={handleToggleLockUser}
                onInviteUser={() => {
                  if ((currentUser?.role || '').toUpperCase() !== 'ADMIN') {
                    setIsAuthModalOpen(true);
                    return;
                  }
                  setUserToEdit(null);
                  setIsEditUserModalOpen(true);
                }}
                onEditUser={(user) => {
                  if ((currentUser?.role || '').toUpperCase() !== 'ADMIN') {
                    setIsAuthModalOpen(true);
                    return;
                  }
                  setUserToEdit(user);
                  setIsEditUserModalOpen(true);
                }}
                onDeleteUser={handleDeleteUser}
                onUpdateUserRole={handleUpdateUserRole}
                onManagePolicies={() => setIsManagePoliciesModalOpen(true)}
                searchQuery={userSearchQuery}
                onSearchChange={setUserSearchQuery}
              />
            )}

            {activeViewSection === 'audit' && (
              <AuditLogsView auditLogs={auditLogs} />
            )}

            {activeViewSection === 'analytics' && (
              <AnalyticsView racks={racks} assets={assets} />
            )}
          </div>
        </section>

        {/* Section 6: Unified Real-Time System Log Feed (Web & Mobile AR) */}
        <LiveSystemLogsSection externalLogs={liveSystemLogs} />

        {/* Footer */}
        <footer className="relative overflow-hidden border-t border-[#222c37]/40 bg-[#11161b] px-6 pb-12 pt-20">
          <div className="mx-auto mb-16 grid max-w-7xl items-start gap-16 lg:grid-cols-12">
            <div className="space-y-6 lg:col-span-5">
              <a href="#" className="font-mono text-lg font-bold tracking-wider text-white">
                CORE // HỆ THỐNG AR-IMMS
              </a>
              <p className="max-w-sm text-sm font-light leading-relaxed text-slate-500">
                Kiến tạo các không gian vận hành hạ tầng cô lập, kết hợp cơ khí chính xác, vi chiếu sáng quang học và kiến trúc code logic thuần túy.
              </p>
            </div>

            <div className="grid w-full gap-12 md:grid-cols-3 lg:col-span-7">
              <div>
                <h4 className="mb-6 text-xs font-bold uppercase tracking-widest text-[#ffb03a] font-mono">
                  Hạ Tầng
                </h4>
                <ul className="space-y-4 font-mono text-xs text-slate-400">
                  <li><a href="#" className="transition-colors hover:text-white">Hệ Điều Hành Sandbox</a></li>
                  <li><a href="#" className="transition-colors hover:text-white">Module Nhân Kernel</a></li>
                  <li><a href="#" className="transition-colors hover:text-white">Vi Chiếu Sáng</a></li>
                  <li><a href="#" className="transition-colors hover:text-white">Macro Phím Tắt</a></li>
                </ul>
              </div>
              <div>
                <h4 className="mb-6 text-xs font-bold uppercase tracking-widest text-[#ffb03a] font-mono">
                  Khung Vỏ Phần Cứng
                </h4>
                <ul className="space-y-4 font-mono text-xs text-slate-400">
                  <li><a href="#" className="transition-colors hover:text-white">Nhựa Polycarbonate</a></li>
                  <li><a href="#" className="transition-colors hover:text-white">Ốp Gỗ Óc Chó</a></li>
                  <li><a href="#" className="transition-colors hover:text-white">Công Cụ Tùy Biến</a></li>
                  <li><a href="#" className="transition-colors hover:text-white">Thư Viện Mẫu Dựng</a></li>
                </ul>
              </div>
              <div className="col-span-2 md:col-span-1">
                <h4 className="mb-6 text-xs font-bold uppercase tracking-widest text-[#ffb03a] font-mono">
                  Đo Đạc Telemetry
                </h4>
                <div className="flex gap-4 text-xl text-slate-500">
                  <a href="#" className="transition-colors hover:text-white">
                    <Icon icon="ph:github-logo-light" />
                  </a>
                  <a href="#" className="transition-colors hover:text-white">
                    <Icon icon="ph:terminal-light" />
                  </a>
                  <a href="#" className="transition-colors hover:text-white">
                    <Icon icon="ph:cpu-light" />
                  </a>
                </div>
              </div>
            </div>
          </div>

          <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-4 border-t border-[#222c37]/40 pt-8 text-[10px] uppercase tracking-widest text-slate-600 sm:flex-row font-mono">
            <p>© 2026 CORE // HỆ THỐNG AR-IMMS. ĐÃ XÁC THỰC SANDBOX.</p>
            <div className="flex gap-8">
              <a href="#" className="transition-colors hover:text-white">
                Quy Chuẩn Cô Lập
              </a>
              <a href="#" className="transition-colors hover:text-white">
                Giao Thức Firmware
              </a>
            </div>
          </div>
        </footer>
      </main>

      {/* Operational Modals */}
      {isARModalOpen && (
        <AROverlayModal
          isOpen={isARModalOpen}
          onClose={() => {
            setIsARModalOpen(false);
            setArTargetAlert(null);
          }}
          targetAlert={arTargetAlert}
          assets={assets}
        />
      )}

      {isNewAssetModalOpen && (
        <NewAssetModal
          assetToEdit={assetToEdit}
          onClose={() => {
            setIsNewAssetModalOpen(false);
            setAssetToEdit(null);
          }}
          onSave={(newAsset) => {
            handleSaveAsset(newAsset);
            setIsNewAssetModalOpen(false);
            setAssetToEdit(null);
          }}
        />
      )}

      {isRackModalOpen && (
        <RackModal
          rackToEdit={rackToEdit}
          onClose={() => {
            setIsRackModalOpen(false);
            setRackToEdit(null);
          }}
          onSave={(savedRack) => {
            handleSaveRack(savedRack);
            setIsRackModalOpen(false);
            setRackToEdit(null);
          }}
        />
      )}

      {isEditUserModalOpen && (
        <EditUserModal
          userToEdit={userToEdit}
          onClose={() => {
            setIsEditUserModalOpen(false);
            setUserToEdit(null);
          }}
          onSave={(savedUser) => {
            handleSaveUser(savedUser);
            setIsEditUserModalOpen(false);
            setUserToEdit(null);
          }}
        />
      )}

      {isPrintLabelModalOpen && selectedPrintAsset && (
        <PrintLabelModal
          asset={selectedPrintAsset}
          onClose={() => {
            setIsPrintLabelModalOpen(false);
            setSelectedPrintAsset(null);
          }}
        />
      )}

      {isCreateTicketModalOpen && (
        <CreateTicketModal
          alert={arTargetAlert || alerts[0]}
          onClose={() => {
            setIsCreateTicketModalOpen(false);
            setArTargetAlert(null);
          }}
          onAssignTicket={(alertId, assignee, notes) => {
            const target = arTargetAlert || alerts.find(a => a.id === alertId) || alerts[0];
            const techUser = users.find(u => u.name.includes(assignee) || u.email.includes(assignee));
            handleCreateTicket({
              server_node_id: (target as any)?.node_id || (target as any)?.nodeId || target?.location?.replace('Node ', '') || 'SRV-NODE-01',
              title: `[ĐIỀU PHỐI] Xử lý ${target.title}`,
              description: notes,
              priority: (target.severity === 'Critical' ? 'CRITICAL' : 'HIGH') as TicketPriority,
              assigned_technician_id: techUser?.id || 'USR-002',
              assigned_technician_name: techUser?.name || assignee
            });
            setIsCreateTicketModalOpen(false);
            setArTargetAlert(null);
          }}
        />
      )}

      {isInviteUserModalOpen && (
        <InviteUserModal
          onClose={() => setIsInviteUserModalOpen(false)}
          onInvite={(newUser) => {
            handleSaveUser(newUser);
            setIsInviteUserModalOpen(false);
          }}
        />
      )}

      {isManagePoliciesModalOpen && (
        <ManagePoliciesModal
          onClose={() => setIsManagePoliciesModalOpen(false)}
        />
      )}

      {isSupportModalOpen && (
        <SupportModal
          onClose={() => setIsSupportModalOpen(false)}
        />
      )}

      {isSettingsModalOpen && (
        <SettingsModal
          onClose={() => setIsSettingsModalOpen(false)}
        />
      )}

      {selectedNodeDetail && (
        <NodeDetailModal
          isOpen={!!selectedNodeDetail}
          onClose={() => setSelectedNodeDetail(null)}
          asset={selectedNodeDetail}
          onOpenAR={(asset) => {
            setSelectedNodeDetail(null);
            setIsARModalOpen(true);
          }}
          onPrintLabel={(asset) => {
            setSelectedPrintAsset(asset);
            setIsPrintLabelModalOpen(true);
          }}
        />
      )}

      {/* Auth Full Screen View if user is signing in */}
      {isAuthModalOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-[#080b0e] animate-in fade-in duration-200">
          <AuthView
            onLoginSuccess={(user) => {
              setCurrentUser(user);
              setIsAuthModalOpen(false);
            }}
            onRegisterUser={(newUser) => {
              handleSaveUser(newUser);
              if (newUser.status === 'Active') {
                setCurrentUser(newUser);
                setIsAuthModalOpen(false);
              }
            }}
            registeredUsers={users}
            onClose={() => setIsAuthModalOpen(false)}
          />
        </div>
      )}
      </div>
    </DeviceViewportSimulator>
  );
};

export default App;

