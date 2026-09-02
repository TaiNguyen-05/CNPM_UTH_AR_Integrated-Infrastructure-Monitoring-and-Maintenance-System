import React, { useState } from 'react';
import { TabType, AssetItem, AlertItem, UserItem, AuditLogItem, Rack } from './types';
import { 
  INITIAL_ASSETS, 
  INITIAL_ALERTS, 
  INITIAL_USERS, 
  INITIAL_AUDIT_LOGS, 
  INITIAL_RACKS 
} from './data/mockData';
import { Header } from './components/Header';
import { Sidebar } from './components/Sidebar';
import { DigitalTwinView } from './components/DigitalTwinView';
import { TelemetryView } from './components/TelemetryView';
import { AssetsView } from './components/AssetsView';
import { AlertsView } from './components/AlertsView';
import { UsersView } from './components/UsersView';
import { AuditLogsView } from './components/AuditLogsView';
import { AuthView } from './components/AuthView';

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
import { QRScannerModal } from './components/modals/QRScannerModal';
import { arImmsApi } from './services/api';

export const App: React.FC = () => {
  const [currentTab, setCurrentTab] = useState<TabType>('digital-twin');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [mobileMenuOpen, setMobileMenuOpen] = useState<boolean>(false);

  // Core Datasets
  const [racks, setRacks] = useState<Rack[]>(INITIAL_RACKS);
  const [assets, setAssets] = useState<AssetItem[]>(INITIAL_ASSETS);
  const [alerts, setAlerts] = useState<AlertItem[]>(INITIAL_ALERTS);
  const [users, setUsers] = useState<UserItem[]>(INITIAL_USERS);
  const [auditLogs, setAuditLogs] = useState<AuditLogItem[]>(INITIAL_AUDIT_LOGS);

  // Live Database / Backend API Synchronization on startup
  React.useEffect(() => {
    const syncBackendData = async () => {
      try {
        const [nodesRes, alertsRes, racksRes, usersRes] = await Promise.allSettled([
          arImmsApi.getNodes(),
          arImmsApi.getAlerts(),
          arImmsApi.getRacks(),
          arImmsApi.getUsers()
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
            time: '14:20:00 (Hôm nay)',
            loggedTimeUtc: a.created_at || new Date().toISOString(),
            location: `Tủ Rack A2 (Node ${a.node_id})`,
            assignedTo: 'Sarah Jenkins',
            zone: 'Hàng Máy Chủ Alpha (Rack A)',
            acknowledged: a.status !== 'active',
            resolved: a.status === 'resolved',
            snapshot: {
              rackTemp: '42.8°C',
              tempRate: '+1.2°C/10m',
              fanSpeed: '4,200 RPM',
              fanStatus: 'Cảnh báo hiệu suất quạt',
              powerDraw: '4.8 kW',
              powerStatus: 'Ổn định',
              tempTrend: [38, 39, 40, 41, 42.8]
            },
            maintenanceLogs: []
          }));
          setAlerts(mappedAlerts);
        }

        if (usersRes.status === 'fulfilled' && usersRes.value?.data && usersRes.value.data.length > 0) {
          const mappedUsers: UserItem[] = usersRes.value.data.map(u => ({
            id: u.id,
            userId: u.id,
            name: u.full_name || u.email.split('@')[0],
            email: u.email,
            role: u.role === 'admin' ? 'Admin' : u.role === 'technician' ? 'Technician' : 'Viewer',
            status: u.status === 'active' ? 'Active' : u.status === 'pending' ? 'Pending' : 'Locked',
            lastAuth: 'Vừa xong',
            initials: (u.full_name || u.email.split('@')[0]).slice(0, 2).toUpperCase()
          }));
          setUsers(mappedUsers);
        }
      } catch (err) {
        console.warn('Backend offline or falling back to mock state:', err);
      }
    };

    syncBackendData();
  }, []);

  // QR Scanning & Direct Node Target from URL
  const [selectedNodeForDetail, setSelectedNodeForDetail] = useState<AssetItem | null>(null);
  const [isQRScannerOpen, setIsQRScannerOpen] = useState<boolean>(false);

  // Listen to URL query params (e.g. ?node=asset-1 or ?guid=8f7e...) when user scans QR
  React.useEffect(() => {
    const handleUrlParams = () => {
      const params = new URLSearchParams(window.location.search);
      const nodeParam = params.get('node') || params.get('asset') || params.get('guid') || params.get('id');
      if (nodeParam) {
        const queryLower = nodeParam.toLowerCase().trim();
        const matched = assets.find(a => 
          a.id.toLowerCase() === queryLower ||
          a.guid.toLowerCase() === queryLower ||
          a.name.toLowerCase() === queryLower ||
          a.serialNumber.toLowerCase() === queryLower
        );
        if (matched) {
          setSelectedNodeForDetail(matched);
        }
      }
    };

    handleUrlParams();
    window.addEventListener('popstate', handleUrlParams);
    return () => window.removeEventListener('popstate', handleUrlParams);
  }, [assets]);

  // Authentication State
  const [currentUser, setCurrentUser] = useState<UserItem | null>(() => {
    const saved = localStorage.getItem('ar_imms_current_user');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        // fallback
      }
    }
    return INITIAL_USERS[2]; // Default to Sarah Jenkins (Admin)
  });

  // Modal States
  const [isARModalOpen, setIsARModalOpen] = useState<boolean>(false);
  const [arTargetAlert, setArTargetAlert] = useState<AlertItem | null>(null);
  const [isNewAssetModalOpen, setIsNewAssetModalOpen] = useState<boolean>(false);
  const [printAssetTarget, setPrintAssetTarget] = useState<AssetItem | null>(null);
  const [ticketAlertTarget, setTicketAlertTarget] = useState<AlertItem | null>(null);
  const [isInviteUserModalOpen, setIsInviteUserModalOpen] = useState<boolean>(false);
  const [isManagePoliciesOpen, setIsManagePoliciesOpen] = useState<boolean>(false);
  const [isSupportModalOpen, setIsSupportModalOpen] = useState<boolean>(false);
  const [isSettingsModalOpen, setIsSettingsModalOpen] = useState<boolean>(false);

  // User Authentication Handlers
  const handleLoginSuccess = (user: UserItem) => {
    setCurrentUser(user);
    localStorage.setItem('ar_imms_current_user', JSON.stringify(user));

    const newLog: AuditLogItem = {
      id: `audit-${Date.now()}`,
      timestamp: new Date().toISOString().replace('T', ' ').slice(0, 19),
      user: user.email,
      userType: 'user',
      initials: user.initials,
      action: `User Authenticated (${user.role} Session Initiated)`,
      target: user.userId,
      ipAddress: '192.168.1.10',
      status: 'Success'
    };
    setAuditLogs(prev => [newLog, ...prev]);
  };

  const handleRegisterUser = (newUser: UserItem) => {
    setUsers(prev => [newUser, ...prev]);

    const newLog: AuditLogItem = {
      id: `audit-${Date.now()}`,
      timestamp: new Date().toISOString().replace('T', ' ').slice(0, 19),
      user: newUser.email,
      userType: 'user',
      initials: newUser.initials,
      action: `Registered New Account (${newUser.role})`,
      target: newUser.userId,
      ipAddress: '192.168.1.10',
      status: 'Success'
    };
    setAuditLogs(prev => [newLog, ...prev]);
  };

  const handleSignOut = () => {
    if (currentUser) {
      const newLog: AuditLogItem = {
        id: `audit-${Date.now()}`,
        timestamp: new Date().toISOString().replace('T', ' ').slice(0, 19),
        user: currentUser.email,
        userType: 'user',
        initials: currentUser.initials,
        action: 'User Signed Out of Datacenter Session',
        target: currentUser.userId,
        ipAddress: '192.168.1.10',
        status: 'Success'
      };
      setAuditLogs(prev => [newLog, ...prev]);
    }
    setCurrentUser(null);
    localStorage.removeItem('ar_imms_current_user');
  };

  // Handlers for Assets with backend persistence
  const handleSaveAsset = async (newAsset: AssetItem) => {
    setAssets(prev => [newAsset, ...prev]);
    try {
      await arImmsApi.createNode({
        id: newAsset.id,
        name: newAsset.name,
        model: newAsset.model,
        rack_id: newAsset.rack.toLowerCase().replace('rack ', 'rack-'),
        u_start: 1,
        u_size: 2,
        ip_address: '10.0.1.25',
        qr_code: newAsset.guid
      });
    } catch (e) {
      console.warn('Node persisted locally (backend offline):', e);
    }

    const newLog: AuditLogItem = {
      id: `audit-${Date.now()}`,
      timestamp: new Date().toISOString().replace('T', ' ').slice(0, 19),
      user: currentUser?.email || 'sjenkins@ar-imms.corp',
      userType: 'user',
      initials: currentUser?.initials || 'SJ',
      action: 'Created Asset & AR Marker',
      target: newAsset.name,
      ipAddress: '192.168.1.10',
      status: 'Success'
    };
    setAuditLogs(prev => [newLog, ...prev]);
  };

  const handleEditAsset = (asset: AssetItem) => {
    // Open print / edit modal
    setPrintAssetTarget(asset);
  };

  // Handlers for Alerts
  const handleAcknowledgeAlert = (alertId: string) => {
    setAlerts(prev => prev.map(a => a.id === alertId ? { ...a, acknowledged: true } : a));
    const target = alerts.find(a => a.id === alertId);
    const newLog: AuditLogItem = {
      id: `audit-${Date.now()}`,
      timestamp: new Date().toISOString().replace('T', ' ').slice(0, 19),
      user: 'sjenkins@ar-imms.corp',
      userType: 'user',
      initials: 'SJ',
      action: 'Acknowledged Alert',
      target: target ? target.alertCode : alertId,
      ipAddress: '192.168.1.10',
      status: 'Success'
    };
    setAuditLogs(prev => [newLog, ...prev]);
  };

  const handleResolveAlert = (alertId: string) => {
    setAlerts(prev => prev.map(a => a.id === alertId ? { ...a, resolved: true, acknowledged: true } : a));
    const target = alerts.find(a => a.id === alertId);
    const newLog: AuditLogItem = {
      id: `audit-${Date.now()}`,
      timestamp: new Date().toISOString().replace('T', ' ').slice(0, 19),
      user: 'sjenkins@ar-imms.corp',
      userType: 'user',
      initials: 'SJ',
      action: 'Resolved Alert & Closed Ticket',
      target: target ? target.alertCode : alertId,
      ipAddress: '192.168.1.10',
      status: 'Success'
    };
    setAuditLogs(prev => [newLog, ...prev]);
  };

  const handleAssignTicket = (alertId: string, assignee: string, notes: string) => {
    setAlerts(prev => prev.map(a => a.id === alertId ? { ...a, assignedTo: assignee, acknowledged: true } : a));
    const newLog: AuditLogItem = {
      id: `audit-${Date.now()}`,
      timestamp: new Date().toISOString().replace('T', ' ').slice(0, 19),
      user: 'sjenkins@ar-imms.corp',
      userType: 'user',
      initials: 'SJ',
      action: `Assigned Work Order to ${assignee}`,
      target: alertId,
      ipAddress: '192.168.1.10',
      status: 'Success'
    };
    setAuditLogs(prev => [newLog, ...prev]);
  };

  const handleLaunchARView = (alert: AlertItem) => {
    setArTargetAlert(alert);
    setIsARModalOpen(true);
  };

  // Handlers for Users
  const handleApproveUser = (userId: string) => {
    setUsers(prev => prev.map(u => u.id === userId ? { ...u, status: 'Active', lastAuth: 'Just now' } : u));
    const target = users.find(u => u.id === userId);
    const newLog: AuditLogItem = {
      id: `audit-${Date.now()}`,
      timestamp: new Date().toISOString().replace('T', ' ').slice(0, 19),
      user: 'sjenkins@ar-imms.corp',
      userType: 'user',
      initials: 'SJ',
      action: `Approved Access Request for ${target?.name || userId}`,
      target: target?.userId,
      ipAddress: '192.168.1.10',
      status: 'Success'
    };
    setAuditLogs(prev => [newLog, ...prev]);
  };

  const handleDenyUser = (userId: string) => {
    setUsers(prev => prev.filter(u => u.id !== userId));
    const newLog: AuditLogItem = {
      id: `audit-${Date.now()}`,
      timestamp: new Date().toISOString().replace('T', ' ').slice(0, 19),
      user: 'sjenkins@ar-imms.corp',
      userType: 'user',
      initials: 'SJ',
      action: `Denied User Access Request`,
      target: userId,
      ipAddress: '192.168.1.10',
      status: 'Warning'
    };
    setAuditLogs(prev => [newLog, ...prev]);
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

  const handleInviteUser = (newUser: UserItem) => {
    setUsers(prev => [newUser, ...prev]);
    const newLog: AuditLogItem = {
      id: `audit-${Date.now()}`,
      timestamp: new Date().toISOString().replace('T', ' ').slice(0, 19),
      user: 'sjenkins@ar-imms.corp',
      userType: 'user',
      initials: 'SJ',
      action: `Invited User ${newUser.email} (${newUser.role})`,
      target: newUser.userId,
      ipAddress: '192.168.1.10',
      status: 'Success'
    };
    setAuditLogs(prev => [newLog, ...prev]);
  };

  const unreadAlertsCount = alerts.filter(a => !a.acknowledged && !a.resolved).length;
  const pendingUsersCount = users.filter(u => u.status === 'Pending').length;

  // If user is not authenticated, show AuthView
  if (!currentUser) {
    return (
      <AuthView
        onLoginSuccess={handleLoginSuccess}
        onRegisterUser={handleRegisterUser}
        registeredUsers={users}
      />
    );
  }

  return (
    <div className="min-h-screen bg-[#f7f9fb] text-[#191c1e] flex flex-col font-sans selection:bg-[#d0e1fb] selection:text-[#004395]">
      {/* Top Fixed Header */}
      <Header
        currentTab={currentTab}
        onSelectTab={setCurrentTab}
        alerts={alerts}
        currentUser={currentUser}
        onSignOut={handleSignOut}
        onOpenNewAsset={() => setIsNewAssetModalOpen(true)}
        onOpenSettings={() => setIsSettingsModalOpen(true)}
        onOpenSupport={() => setIsSupportModalOpen(true)}
        onMobileMenuToggle={() => setMobileMenuOpen(prev => !prev)}
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
      />

      {/* Main Container Layout */}
      <div className="flex-1 flex pt-16">
        {/* Sidebar Dock */}
        <Sidebar
          currentTab={currentTab}
          onSelectTab={setCurrentTab}
          openMobileMenu={mobileMenuOpen}
          onCloseMobileMenu={() => setMobileMenuOpen(false)}
          alertCount={unreadAlertsCount}
          pendingUsersCount={pendingUsersCount}
          currentUser={currentUser}
          onOpenSupport={() => setIsSupportModalOpen(true)}
          onSignOut={handleSignOut}
        />

        {/* Dynamic Viewport (Offset by 64px on MD+ screens) */}
        <main className="flex-1 md:ml-64 min-h-[calc(100vh-4rem)] overflow-y-auto bg-[#f7f9fb]">
          {currentTab === 'digital-twin' && (
            <DigitalTwinView
              racks={racks}
              onSelectTab={setCurrentTab}
              onOpenAROverlay={() => {
                setArTargetAlert(null);
                setIsARModalOpen(true);
              }}
            />
          )}

          {currentTab === 'telemetry' && (
            <TelemetryView />
          )}

          {currentTab === 'assets-qr' && (
            <AssetsView
              assets={assets}
              onOpenNewAsset={() => setIsNewAssetModalOpen(true)}
              onOpenPrintModal={(asset) => setPrintAssetTarget(asset)}
              onEditAsset={handleEditAsset}
              onOpenNodeDetail={(asset) => setSelectedNodeForDetail(asset)}
              onOpenQRScanner={() => setIsQRScannerOpen(true)}
              searchQuery={searchQuery}
              onSearchChange={setSearchQuery}
            />
          )}

          {currentTab === 'alerts' && (
            <AlertsView
              alerts={alerts}
              onAcknowledgeAlert={handleAcknowledgeAlert}
              onResolveAlert={handleResolveAlert}
              onCreateTicket={(alert) => setTicketAlertTarget(alert)}
              onLaunchARView={handleLaunchARView}
              onOpenDigitalTwin={() => setCurrentTab('digital-twin')}
            />
          )}

          {currentTab === 'users' && (
            <UsersView
              users={users}
              onApproveUser={handleApproveUser}
              onDenyUser={handleDenyUser}
              onToggleLockUser={handleToggleLockUser}
              onInviteUser={() => setIsInviteUserModalOpen(true)}
              onManagePolicies={() => setIsManagePoliciesOpen(true)}
              searchQuery={searchQuery}
              onSearchChange={setSearchQuery}
            />
          )}

          {currentTab === 'audit-logs' && (
            <AuditLogsView
              logs={auditLogs}
              searchQuery={searchQuery}
              onSearchChange={setSearchQuery}
            />
          )}
        </main>
      </div>

      {/* Global Modals */}
      {isARModalOpen && (
        <AROverlayModal
          onClose={() => setIsARModalOpen(false)}
          targetAlert={arTargetAlert}
        />
      )}

      {isNewAssetModalOpen && (
        <NewAssetModal
          onClose={() => setIsNewAssetModalOpen(false)}
          onSave={handleSaveAsset}
        />
      )}

      {printAssetTarget && (
        <PrintLabelModal
          asset={printAssetTarget}
          onClose={() => setPrintAssetTarget(null)}
        />
      )}

      {ticketAlertTarget && (
        <CreateTicketModal
          alert={ticketAlertTarget}
          onClose={() => setTicketAlertTarget(null)}
          onAssignTicket={handleAssignTicket}
        />
      )}

      {isInviteUserModalOpen && (
        <InviteUserModal
          onClose={() => setIsInviteUserModalOpen(false)}
          onInvite={handleInviteUser}
        />
      )}

      {isManagePoliciesOpen && (
        <ManagePoliciesModal
          onClose={() => setIsManagePoliciesOpen(false)}
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

      {selectedNodeForDetail && (
        <NodeDetailModal
          asset={selectedNodeForDetail}
          onClose={() => {
            setSelectedNodeForDetail(null);
            // Clean URL query param cleanly without reloading
            if (window.location.search) {
              window.history.replaceState({}, document.title, window.location.pathname);
            }
          }}
          onOpenPrintModal={(asset) => {
            setSelectedNodeForDetail(null);
            setPrintAssetTarget(asset);
          }}
          onNavigateToDigitalTwin={(rackName) => {
            setSelectedNodeForDetail(null);
            setCurrentTab('digital-twin');
          }}
        />
      )}

      {isQRScannerOpen && (
        <QRScannerModal
          assets={assets}
          onClose={() => setIsQRScannerOpen(false)}
          onSelectAsset={(asset) => {
            setSelectedNodeForDetail(asset);
          }}
        />
      )}
    </div>
  );
};

export default App;
