import React, { useState, useEffect, useMemo, useRef } from 'react';
import { Icon } from '@iconify/react';
import { 
  Camera, Terminal as TerminalIcon, Box, Activity, Server, AlertTriangle, 
  Users as UsersIcon, FileText, CheckCircle2, ShieldAlert, Cpu, 
  ExternalLink, QrCode, RefreshCw, Zap, Shield, Sparkles, LogIn, LogOut, ChevronRight
} from 'lucide-react';
import { TabType, AssetItem, AlertItem, UserItem, AuditLogItem, Rack, TelemetryPoint } from './types';
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
import { UsersView } from './components/UsersView';
import { AuditLogsView } from './components/AuditLogsView';

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
import { arImmsApi } from './services/api';
import { socketService } from './services/socketService';

type RevealId = "architecture" | "console" | "modules" | "hardware" | "operations" | "subscribe";

export const App: React.FC = () => {
  const [scrolled, setScrolled] = useState<boolean>(false);
  const [revealed, setRevealed] = useState<Set<RevealId>>(
    new Set(["architecture", "console", "modules", "hardware", "operations", "subscribe"])
  );
  const heroVideoRef = useRef<HTMLVideoElement | null>(null);
  const typewriterRef = useRef<HTMLSpanElement | null>(null);

  // Core Datasets
  const [racks, setRacks] = useState<Rack[]>(INITIAL_RACKS);
  const [assets, setAssets] = useState<AssetItem[]>(INITIAL_ASSETS);
  const [alerts, setAlerts] = useState<AlertItem[]>(INITIAL_ALERTS);
  const [users, setUsers] = useState<UserItem[]>(INITIAL_USERS);
  const [auditLogs, setAuditLogs] = useState<AuditLogItem[]>(INITIAL_AUDIT_LOGS);

  // Active User / Auth State
  const [currentUser, setCurrentUser] = useState<UserItem | null>(INITIAL_USERS[0]);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState<boolean>(false);

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
  const [activeViewSection, setActiveViewSection] = useState<'twin' | 'telemetry' | 'assets' | 'alerts' | 'users' | 'audit'>('twin');

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

        if (nodesRes.status === 'fulfilled' && nodesRes.value?.data && nodesRes.value.data.length > 0) {
          const mappedAssets: AssetItem[] = nodesRes.value.data.map(n => ({
            id: n.id,
            name: n.name,
            model: n.model,
            rack: `Rack ${n.rack_id?.toUpperCase().replace('RACK-', '') || 'A1'}`,
            uPosition: `Rack ${n.rack_id?.toUpperCase().replace('RACK-', '') || 'A1'}, U${String(n.u_start).padStart(2, '0')}-${String(n.u_start + (n.u_size || 1) - 1).padStart(2, '0')}`,
            qrStatus: n.status === 'healthy' ? 'Active' : n.status === 'warning' ? 'Mismatch' : 'Pending',
            guid: n.qr_code || `guid-${n.id}`,
            manufacturer: n.model?.split(' ')[0] || 'Enterprise OEM',
            serialNumber: `CN-0X${n.id.slice(-4).toUpperCase()}`,
            installDate: '2024-01-15',
            powerDraw: '450W (Avg)',
            networkInterfaces: [`eth0: ${n.ip_address || '10.0.1.20'}`]
          }));
          setAssets(mappedAssets);
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

        if (racksRes.status === 'fulfilled' && racksRes.value?.data && racksRes.value.data.length > 0) {
          const mappedRacks: Rack[] = racksRes.value.data.map((r: any, idx: number) => {
            const initial = INITIAL_RACKS[idx] || INITIAL_RACKS[0];
            return {
              ...initial,
              ...r,
              id: r.id || initial.id,
              name: r.name || initial.name,
              status: r.status || initial.status,
              temperature: typeof r.temperature === 'number' ? r.temperature : initial.temperature,
              powerDrawKw: typeof r.power_draw_kw === 'number' ? r.power_draw_kw : (r.powerDrawKw || initial.powerDrawKw),
              units: (Array.isArray(r.units) && r.units.length > 0) ? r.units : initial.units
            };
          });
          setRacks(mappedRacks);
        }
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

  // --- CRUD HANDLERS: RACKS ---
  const handleSaveRack = (savedRack: Rack) => {
    setRacks(prev => {
      const exists = prev.some(r => r.id === savedRack.id);
      if (exists) {
        return prev.map(r => r.id === savedRack.id ? savedRack : r);
      }
      return [...prev, savedRack];
    });
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
    setRacks(prev => prev.filter(r => r.id !== rackId));
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

  // --- CRUD HANDLERS: ASSETS / DEVICES ---
  const handleSaveAsset = (savedAsset: AssetItem) => {
    setAssets(prev => {
      const exists = prev.some(a => a.id === savedAsset.id);
      if (exists) {
        return prev.map(a => a.id === savedAsset.id ? savedAsset : a);
      }
      return [savedAsset, ...prev];
    });
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
    setAssets(prev => prev.filter(a => a.id !== assetId));
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
      const exists = prev.some(u => u.id === savedUser.id);
      if (exists) {
        return prev.map(u => u.id === savedUser.id ? savedUser : u);
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

  const handleDeleteUser = (userId: string) => {
    setUsers(prev => prev.filter(u => u.id !== userId));
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

  const handleUpdateUserRole = (userId: string, newRole: 'Admin' | 'Technician' | 'Viewer') => {
    setUsers(prev => prev.map(u => u.id === userId ? { ...u, role: newRole } : u));
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

  const handleApproveUser = (userId: string) => {
    setUsers(prev => prev.map(u => u.id === userId ? { ...u, status: 'Active' } : u));
    setAuditLogs(prev => [
      {
        id: `audit-${Date.now()}`,
        timestamp: new Date().toISOString().replace('T', ' ').slice(0, 19),
        user: currentUser?.email || 'admin@ar-imms.corp',
        userType: 'user',
        initials: currentUser?.initials || 'AD',
        action: 'Phê Duyệt Tài Khoản',
        target: userId,
        ipAddress: '192.168.1.100',
        status: 'Success'
      },
      ...prev
    ]);
  };

  const handleDenyUser = (userId: string) => {
    setUsers(prev => prev.filter(u => u.id !== userId));
  };

  const handleToggleLockUser = (userId: string) => {
    setUsers(prev => prev.map(u => {
      if (u.id === userId) {
        const nextStatus = u.status === 'Locked' ? 'Active' : 'Locked';
        return { ...u, status: nextStatus };
      }
      return u;
    }));
  };

  const handleAcknowledgeAlert = (id: string) => {
    setAlerts(prev => prev.map(a => a.id === id ? { ...a, acknowledged: true } : a));
  };

  const handleResolveAlert = (id: string) => {
    setAlerts(prev => prev.map(a => a.id === id ? { ...a, resolved: true, acknowledged: true } : a));
  };

  const revealClass = (id: RevealId) => (revealed.has(id) ? "code-reveal active" : "code-reveal");

  return (
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
          <div className="hidden items-center gap-8 text-xs uppercase tracking-widest text-slate-400 md:flex font-mono">
            <a href="#architecture" className="transition-colors hover:text-[#00f0ff]">
              Kiến Trúc
            </a>
            <a href="#console" className="transition-colors hover:text-[#00f0ff]">
              Bảng Lệnh
            </a>
            <a href="#modules" className="transition-colors hover:text-[#00f0ff]">
              Modules
            </a>
            <a href="#hardware" className="transition-colors hover:text-[#00f0ff]">
              Phần Cứng
            </a>
            <a href="#operations" className="transition-colors hover:text-[#ffb03a] flex items-center gap-1.5">
              <Activity className="w-3.5 h-3.5 text-[#ffb03a]" />
              Vận Hành
            </a>
          </div>

          {/* Actions & Profile */}
          <div className="flex items-center gap-4">
            <span className="hidden border border-[#222c37] bg-[#11161b] px-3 py-1 font-mono text-[10px] text-[#ffb03a] sm:inline-block">
              KẾT NỐI // BẢO MẬT
            </span>

            {/* Launch AR Button */}
            <button
              onClick={() => {
                setArTargetAlert(null);
                setIsARModalOpen(true);
              }}
              className="hidden sm:inline-flex items-center gap-1.5 border border-[#38bdf8]/40 bg-[#38bdf8]/10 px-3.5 py-2 font-mono text-xs uppercase tracking-widest text-[#38bdf8] hover:bg-[#38bdf8]/20 transition-all"
            >
              <Camera className="w-3.5 h-3.5" />
              Kính AR
            </button>

            {/* Compile Space / Main Action */}
            <button 
              onClick={() => {
                if (!currentUser) {
                  setIsAuthModalOpen(true);
                } else {
                  const el = document.getElementById('operations');
                  if (el) el.scrollIntoView({ behavior: 'smooth' });
                }
              }}
              className="keycap-glow border border-[#38bdf8]/40 bg-[#11161b] px-5 py-2.5 font-mono text-xs uppercase tracking-widest text-white transition-all hover:border-[#00f0ff]"
            >
              {currentUser ? "Bảng Điều Khiển" : "Đăng Nhập // Truy Cập"}
            </button>

            {/* User Profile Badge / Sign Out */}
            {currentUser && (
              <div className="hidden lg:flex items-center gap-2 border-l border-[#222c37] pl-4">
                <span className="w-7 h-7 rounded bg-gradient-to-tr from-[#38bdf8] to-[#f59e0b] flex items-center justify-center font-bold text-xs text-[#080b0e]">
                  {currentUser.name.charAt(0)}
                </span>
                <button
                  onClick={() => setCurrentUser(null)}
                  title="Đăng xuất"
                  className="text-slate-500 hover:text-red-400 p-1 transition-colors"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            )}
          </div>
        </div>
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
              <a
                href="#console"
                className="keycap-glow rounded-none bg-[#38bdf8] px-8 py-4 text-center font-mono text-xs font-bold uppercase tracking-widest text-[#080b0e] transition-all hover:bg-[#00f0ff]"
              >
                Khởi Tạo Bảng Lệnh
              </a>
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

          {/* Interactive Server Racks Grid */}
          <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-6">
            {racks.map((rack) => (
              <div key={rack.id} className="border border-[#222c37] bg-[#0f141a] p-6 space-y-4 relative overflow-hidden group">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 font-mono text-sm text-white font-bold">
                    <Server className="w-4 h-4 text-[#38bdf8]" />
                    {rack.name}
                  </div>
                  <span className={`px-2 py-0.5 text-[10px] font-mono uppercase rounded ${
                    rack.status === 'healthy' ? 'bg-emerald-500/20 text-emerald-400' : 'bg-amber-500/20 text-amber-400'
                  }`}>
                    {rack.status === 'healthy' ? 'Hoạt Động Tốt' : 'Cần Chú Ý'}
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-3 font-mono text-xs py-2 border-y border-[#222c37]">
                  <div>
                    <span className="text-slate-500 text-[10px]">NHIỆT ĐỘ</span>
                    <div className="text-white font-bold">{(rack.temperature ?? 32.5).toFixed(1)}°C</div>
                  </div>
                  <div>
                    <span className="text-slate-500 text-[10px]">CÔNG SUẤT</span>
                    <div className="text-white font-bold">{(rack.powerDrawKw ?? 4.8).toFixed(2)} kW</div>
                  </div>
                  <div>
                    <span className="text-slate-500 text-[10px]">TỐC ĐỘ QUẠT</span>
                    <div className="text-[#38bdf8] font-bold">{(rack.fanSpeedRpm ?? 3800).toLocaleString()} RPM</div>
                  </div>
                  <div>
                    <span className="text-slate-500 text-[10px]">MÁY CHỦ</span>
                    <div className="text-white font-bold">{rack.nodesCount ?? 6} Node</div>
                  </div>
                </div>

                <div className="flex items-center gap-2 pt-2">
                  <button
                    onClick={() => handleFanBoost(rack.id)}
                    className="flex-1 py-1.5 bg-[#38bdf8]/10 border border-[#38bdf8]/30 hover:bg-[#38bdf8] hover:text-[#080b0e] text-[#38bdf8] font-mono text-[10px] uppercase font-bold transition-all"
                  >
                    Quạt 100%
                  </button>
                  <button
                    onClick={() => handleRackReboot(rack.id)}
                    className="flex-1 py-1.5 bg-[#161d24] border border-[#222c37] hover:border-red-400 hover:text-red-400 text-slate-300 font-mono text-[10px] uppercase transition-all"
                  >
                    Khởi Động Lại
                  </button>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Section 4: Hardware & AR Tactile Interface */}
        <section
          id="hardware"
          data-reveal-id="hardware"
          className={`${revealClass("hardware")} border-t border-[#222c37] bg-[#161d24]/30 py-32`}
        >
          <div className="mx-auto grid max-w-7xl items-center gap-16 px-6 lg:grid-cols-12">
            <div className="relative order-2 lg:col-span-6 lg:order-1">
              <div className="pointer-events-none absolute inset-0 rounded-full bg-[#38bdf8]/5 blur-[100px]" />
              <div className="relative z-10 space-y-4 border border-[#222c37] bg-[#080b0e] p-8 font-mono text-xs">
                <div className="flex justify-between border-b border-[#222c37]/40 pb-3 text-slate-500">
                  <span>MA TRẬN LINH KIỆN</span>
                  <span>THÔNG SỐ ALPHA</span>
                </div>
                <div className="flex justify-between border-b border-[#222c37]/40 pb-2">
                  <span className="text-slate-400">Kiểu Phím (Profile)</span>
                  <span className="text-white">OEM / Trong Suốt Quang Học</span>
                </div>
                <div className="flex justify-between border-b border-[#222c37]/40 pb-2">
                  <span className="text-slate-400">Vật Liệu Khung Vỏ</span>
                  <span className="text-white">Polycarbonate Đúc Dày Cao Cấp</span>
                </div>
                <div className="flex justify-between border-b border-[#222c37]/40 pb-2">
                  <span className="text-slate-400">Lõi Bàn Máy Chủ</span>
                  <span className="text-white">Veneer Gỗ Óc Chó Nguyên Khối</span>
                </div>
                <div className="flex justify-between pb-1">
                  <span className="text-slate-400">Hệ Thống Đèn LED</span>
                  <span className="text-[#ffb03a]">Mô Phỏng Sợi Đốt Neon SMD</span>
                </div>
              </div>

              {/* AR Marker & QR Hardware Trigger */}
              <div className="mt-6 flex gap-4">
                <button
                  onClick={() => {
                    setSelectedNodeDetail(assets[0]);
                  }}
                  className="flex-1 inline-flex items-center justify-center gap-2 border border-[#38bdf8] bg-[#38bdf8]/10 px-4 py-3 font-mono text-xs uppercase font-bold text-[#38bdf8] hover:bg-[#38bdf8] hover:text-[#080b0e] transition-all cursor-pointer"
                >
                  <QrCode className="w-4 h-4" />
                  Xem Mã QR & Chỉ Số AR
                </button>
                <button
                  onClick={() => {
                    setSelectedPrintAsset(assets[0]);
                    setIsPrintLabelModalOpen(true);
                  }}
                  className="flex-1 inline-flex items-center justify-center gap-2 border border-[#222c37] bg-[#11161b] px-4 py-3 font-mono text-xs uppercase text-slate-300 hover:border-slate-400 hover:text-white transition-all cursor-pointer"
                >
                  <ExternalLink className="w-4 h-4" />
                  In Tem Nhãn QR
                </button>
              </div>
            </div>

            <div className="space-y-6 order-1 lg:col-span-6 lg:order-2">
              <span className="block text-xs uppercase tracking-widest text-[#38bdf8] font-mono">
                Giao Diện Xúc Giác & Phần Cứng
              </span>
              <h2 className="text-4xl font-bold leading-tight tracking-tight text-white sm:text-5xl">
                Khung vỏ gia công cơ khí chính xác cho người vận hành.
              </h2>
              <p className="leading-relaxed text-slate-400 font-light">
                Mỗi khung vỏ được đúc từ nhựa polycarbonate trong suốt như pha lê, tán sắc hoàn hảo ánh sáng từ bo mạch chủ. Làm chủ không gian phần cứng khép kín tối ưu cho hiệu năng và độ ổn định cao.
              </p>
              <div className="pt-2">
                <button 
                  onClick={() => {
                    setArTargetAlert(null);
                    setIsARModalOpen(true);
                  }}
                  className="bg-white px-8 py-4 font-mono text-xs font-bold uppercase tracking-widest text-[#080b0e] transition-colors hover:bg-[#f59e0b] cursor-pointer"
                >
                  Mở Lớp Phủ Thực Tế Ảo (AR)
                </button>
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
              <span className="text-xs uppercase tracking-widest text-[#ffb03a] font-mono">
                Trung Tâm Chỉ Huy // Vận Hành
              </span>
              <h2 className="text-3xl font-bold tracking-tight text-white mt-1 font-mono">
                Giám Sát & Quản Trị Hệ Thống Trực Tiếp
              </h2>
            </div>
            
            {/* View Switcher Tabs */}
            <div className="flex flex-wrap gap-2 font-mono text-xs">
              <button
                onClick={() => setActiveViewSection('twin')}
                className={`px-3 py-1.5 border transition-all cursor-pointer ${
                  activeViewSection === 'twin'
                    ? 'border-[#38bdf8] bg-[#38bdf8]/10 text-[#38bdf8]'
                    : 'border-[#222c37] bg-[#11161b] text-slate-400 hover:text-white'
                }`}
              >
                Đo Đạc Telemetry
              </button>
              <button
                onClick={() => setActiveViewSection('alerts')}
                className={`px-3 py-1.5 border transition-all cursor-pointer flex items-center gap-1.5 ${
                  activeViewSection === 'alerts'
                    ? 'border-red-500 bg-red-500/10 text-red-400'
                    : 'border-[#222c37] bg-[#11161b] text-slate-400 hover:text-white'
                }`}
              >
                <AlertTriangle className="w-3.5 h-3.5" />
                Cảnh Báo Sự Cố ({alerts.filter(a => !a.resolved).length})
              </button>
              <button
                onClick={() => setActiveViewSection('assets')}
                className={`px-3 py-1.5 border transition-all cursor-pointer flex items-center gap-1.5 ${
                  activeViewSection === 'assets'
                    ? 'border-[#ffb03a] bg-[#ffb03a]/10 text-[#ffb03a]'
                    : 'border-[#222c37] bg-[#11161b] text-slate-400 hover:text-white'
                }`}
              >
                <Server className="w-3.5 h-3.5" />
                Quản Trị Rack & Thiết Bị ({assets.length})
              </button>
              <button
                onClick={() => setActiveViewSection('users')}
                className={`px-3 py-1.5 border transition-all cursor-pointer flex items-center gap-1.5 ${
                  activeViewSection === 'users'
                    ? 'border-indigo-500 bg-indigo-500/10 text-indigo-300'
                    : 'border-[#222c37] bg-[#11161b] text-slate-400 hover:text-white'
                }`}
              >
                <UsersIcon className="w-3.5 h-3.5" />
                Người Dùng & RBAC ({users.length})
              </button>
              <button
                onClick={() => setActiveViewSection('audit')}
                className={`px-3 py-1.5 border transition-all cursor-pointer ${
                  activeViewSection === 'audit'
                    ? 'border-emerald-500 bg-emerald-500/10 text-emerald-400'
                    : 'border-[#222c37] bg-[#11161b] text-slate-400 hover:text-white'
                }`}
              >
                Nhật Ký Kiểm Toán
              </button>
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

            {activeViewSection === 'users' && (
              <UsersView
                users={users}
                onApproveUser={handleApproveUser}
                onDenyUser={handleDenyUser}
                onToggleLockUser={handleToggleLockUser}
                onInviteUser={() => {
                  setUserToEdit(null);
                  setIsEditUserModalOpen(true);
                }}
                onEditUser={(user) => {
                  setUserToEdit(user);
                  setIsEditUserModalOpen(true);
                }}
                onDeleteUser={handleDeleteUser}
                onUpdateUserRole={handleUpdateUserRole}
                onManagePolicies={() => setIsManagePoliciesModalOpen(true)}
                searchQuery=""
                onSearchChange={() => {}}
              />
            )}

            {activeViewSection === 'audit' && (
              <AuditLogsView auditLogs={auditLogs} />
            )}
          </div>
        </section>

        {/* Section 6: Subscribe to Core Logs */}
        <section
          id="subscribe"
          data-reveal-id="subscribe"
          className={`${revealClass("subscribe")} relative mx-auto max-w-4xl overflow-hidden px-6 py-20 text-center`}
        >
          <div className="pointer-events-none absolute inset-0 rounded-full bg-[#ffb03a]/5 blur-3xl" />
          <div className="relative z-10 space-y-8">
            <Icon icon="ph:fingerprint-light" className="animate-pulse text-4xl text-[#38bdf8] mx-auto" />
            <h2 className="text-3xl font-bold tracking-tight text-white sm:text-5xl">
              Đăng Ký Nhận Nhật Ký Hệ Thống
            </h2>
            <p className="mx-auto max-w-xl text-sm font-light leading-relaxed text-slate-400 sm:text-base">
              Nhận cập nhật đo đạc telemetry mới nhất về môi trường máy chủ, các bản firmware nâng cấp và tài liệu kỹ thuật chuyên sâu.
            </p>
            <div className="mx-auto flex max-w-md flex-col items-center gap-4 sm:flex-row">
              <input
                type="email"
                placeholder="nguoivanhang@domain.com"
                className="w-full border border-[#222c37] bg-[#161d24] px-5 py-4 font-mono text-xs text-white placeholder:text-slate-600 focus:border-[#38bdf8] focus:outline-none transition-colors"
              />
              <button className="w-full whitespace-nowrap bg-[#38bdf8] px-8 py-4 font-mono text-xs font-bold uppercase tracking-widest text-[#080b0e] transition-colors hover:bg-[#00f0ff] sm:w-auto">
                Kết Nối Node
              </button>
            </div>
          </div>
        </section>

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
              setCurrentUser(newUser);
              setIsAuthModalOpen(false);
            }}
            registeredUsers={users}
            onClose={() => setIsAuthModalOpen(false)}
          />
        </div>
      )}
    </div>
  );
};

export default App;

