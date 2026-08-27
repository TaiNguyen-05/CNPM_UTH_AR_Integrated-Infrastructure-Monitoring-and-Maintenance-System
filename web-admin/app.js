// AR-IMMS Central Command Center State & Engine

// State Data Store
const DATA_STORE = {
  activeTab: 'dashboard',
  selectedRack: 'rack-a1',
  selectedNodeId: 'SRV-NODE-01',
  telemetryTargetNode: 'SRV-NODE-01',
  simulatorRunning: true,
  streamIntervalSec: 5,
  currentUser: null, // null when logged out

  // User Accounts & Approval Database
  users: [
    {
      id: 'USR-001',
      name: 'System Administrator',
      email: 'admin@ar-imms.dc',
      role: 'ADMIN',
      status: 'APPROVED',
      registeredAt: '2026-08-01 09:00',
      avatar: 'AD'
    },
    {
      id: 'USR-002',
      name: 'System Operator',
      email: 'operator@ar-imms.dc',
      role: 'OPERATOR',
      status: 'APPROVED',
      registeredAt: '2026-08-10 14:30',
      avatar: 'OP'
    },
    {
      id: 'USR-003',
      name: 'Nguyen Van B (Field Tech)',
      email: 'tech.nguyenvanb@ar-imms.dc',
      role: 'TECHNICIAN',
      status: 'PENDING_APPROVAL',
      registeredAt: '2026-08-27 17:45',
      avatar: 'NB'
    }
  ],

  nodes: {
    'SRV-NODE-01': {
      id: 'SRV-NODE-01',
      name: 'Primary Compute Node 01',
      rack: 'rack-a1',
      slot: 'U38 - U39 (2U)',
      uHeight: 2,
      uStart: 38,
      ip: '192.168.1.101',
      mac: '52:54:00:8b:22:11',
      model: 'Dell PowerEdge R740 / Xeon Gold 6248R',
      ramTotal: '64 GB',
      qr: 'ar-imms://node/SRV-NODE-01',
      status: 'HEALTHY', // HEALTHY, WARNING, CRITICAL, OFFLINE
      metrics: { cpu: 48.2, ram: 62.5, disk: 38.0, netIn: 142, netOut: 320, temp: 41.5 },
      containers: [
        { name: 'auth-gateway-svc', image: 'ar-imms/auth:v1.2', cpu: '4.2%', ram: '512MB', status: 'RUNNING' },
        { name: 'telemetry-engine', image: 'ar-imms/telemetry:v2.0', cpu: '12.8%', ram: '1.4GB', status: 'RUNNING' },
        { name: 'spatial-sync-worker', image: 'ar-imms/ar-spatial:v1.0', cpu: '6.1%', ram: '768MB', status: 'RUNNING' }
      ]
    },
    'SRV-NODE-02': {
      id: 'SRV-NODE-02',
      name: 'Storage & DB Replica 01',
      rack: 'rack-a1',
      slot: 'U34 - U36 (3U)',
      uHeight: 3,
      uStart: 34,
      ip: '192.168.1.102',
      mac: '52:54:00:8b:22:12',
      model: 'HPE ProLiant DL380 Gen10 / 128GB',
      ramTotal: '128 GB',
      qr: 'ar-imms://node/SRV-NODE-02',
      status: 'HEALTHY',
      metrics: { cpu: 32.1, ram: 74.0, disk: 62.0, netIn: 210, netOut: 580, temp: 39.0 },
      containers: [
        { name: 'timescale-postgres', image: 'timescale/timescaledb:latest', cpu: '18.4%', ram: '8.2GB', status: 'RUNNING' },
        { name: 'redis-cache-cluster', image: 'redis:7-alpine', cpu: '3.1%', ram: '2.1GB', status: 'RUNNING' }
      ]
    },
    'SRV-NODE-03': {
      id: 'SRV-NODE-03',
      name: 'AR Vision Processor Node',
      rack: 'rack-a1',
      slot: 'U28 - U30 (3U)',
      uHeight: 3,
      uStart: 28,
      ip: '192.168.1.103',
      mac: '52:54:00:8b:22:13',
      model: 'NVIDIA RTX Server / Tesla T4 x2',
      ramTotal: '64 GB',
      qr: 'ar-imms://node/SRV-NODE-03',
      status: 'WARNING',
      metrics: { cpu: 84.6, ram: 88.2, disk: 45.0, netIn: 450, netOut: 890, temp: 68.5 },
      containers: [
        { name: 'aruco-spatial-tracker', image: 'ar-imms/vision-aruco:v1.4', cpu: '54.0%', ram: '4.8GB', status: 'RUNNING' },
        { name: 'pointcloud-builder', image: 'ar-imms/pcl:v1.1', cpu: '28.2%', ram: '3.2GB', status: 'RESTARTING' }
      ]
    },
    'SRV-NODE-04': {
      id: 'SRV-NODE-04',
      name: 'Application Web Gateway',
      rack: 'rack-a2',
      slot: 'U36 - U37 (2U)',
      uHeight: 2,
      uStart: 36,
      ip: '192.168.1.104',
      mac: '52:54:00:8b:22:14',
      model: 'Supermicro 1U TwinPro',
      ramTotal: '32 GB',
      qr: 'ar-imms://node/SRV-NODE-04',
      status: 'HEALTHY',
      metrics: { cpu: 22.4, ram: 41.0, disk: 25.0, netIn: 110, netOut: 240, temp: 37.5 },
      containers: [
        { name: 'nginx-ingress', image: 'nginx:alpine', cpu: '5.0%', ram: '256MB', status: 'RUNNING' },
        { name: 'web-admin-portal', image: 'ar-imms/web:v1.0', cpu: '8.4%', ram: '512MB', status: 'RUNNING' }
      ]
    },
    'SRV-NODE-05': {
      id: 'SRV-NODE-05',
      name: 'Log Aggregator & Pipeline',
      rack: 'rack-a2',
      slot: 'U20 - U22 (3U)',
      uHeight: 3,
      uStart: 20,
      ip: '192.168.1.105',
      mac: '52:54:00:8b:22:15',
      model: 'Dell PowerEdge R640',
      ramTotal: '64 GB',
      qr: 'ar-imms://node/SRV-NODE-05',
      status: 'HEALTHY',
      metrics: { cpu: 35.8, ram: 55.4, disk: 71.0, netIn: 320, netOut: 190, temp: 40.0 },
      containers: [
        { name: 'fluentbit-collector', image: 'fluent/fluent-bit:latest', cpu: '6.2%', ram: '400MB', status: 'RUNNING' }
      ]
    },
    'SRV-NODE-06': {
      id: 'SRV-NODE-06',
      name: 'Deep Learning & Analytics Node',
      rack: 'rack-b1',
      slot: 'U30 - U33 (4U)',
      uHeight: 4,
      uStart: 30,
      ip: '192.168.1.106',
      mac: '52:54:00:8b:22:16',
      model: 'Gigabyte GPU Chassis / 4x RTX 4090',
      ramTotal: '128 GB',
      qr: 'ar-imms://node/SRV-NODE-06',
      status: 'HEALTHY',
      metrics: { cpu: 55.0, ram: 60.0, disk: 44.0, netIn: 180, netOut: 300, temp: 52.0 },
      containers: [
        { name: 'capacity-planner-ml', image: 'ar-imms/ml-capacity:v1.0', cpu: '38.0%', ram: '6.0GB', status: 'RUNNING' }
      ]
    }
  },

  alerts: [],

  tickets: [],

  auditLogs: [
    { time: '17:00:12', user: 'collector-agent-01', action: 'STREAM_TELEMETRY', entity: 'SRV-NODE-01', ip: '192.168.1.101', details: 'Heartbeat ingested (5s cycle)' }
  ]
};

// Chart.js Instances
let charts = {};
const MAX_CHART_POINTS = 15;
const chartTimeLabels = [];

// Initialize Dashboard
document.addEventListener('DOMContentLoaded', () => {
  initCharts();
  renderRackSlots();
  renderNodeDetail(DATA_STORE.selectedNodeId);
  renderAssetsTable();
  renderAlerts();
  renderTickets();
  renderAuditTable();
  renderUserApprovals();
  startTelemetrySimulator();
  lucide.createIcons();

  // Check initial session
  evaluateAuthGate();
});

// ==========================================
// AUTHENTICATION & ACCESS GATEKEEPER
// ==========================================

function evaluateAuthGate() {
  const authGate = document.getElementById('authGateScreen');
  const pendingGate = document.getElementById('pendingApprovalScreen');
  const lockedGate = document.getElementById('lockedAccountScreen');

  if (!DATA_STORE.currentUser) {
    // 1. Not logged in -> Show Login Gate
    authGate?.classList.remove('hidden');
    pendingGate?.classList.add('hidden');
    lockedGate?.classList.add('hidden');
  } else if (DATA_STORE.currentUser.status === 'LOCKED') {
    // 2. Account Locked / Suspended by Admin
    authGate?.classList.add('hidden');
    pendingGate?.classList.add('hidden');
    lockedGate?.classList.remove('hidden');
    
    document.getElementById('lockedUserName').innerText = DATA_STORE.currentUser.name;
    document.getElementById('lockedUserEmail').innerText = DATA_STORE.currentUser.email;
  } else if (DATA_STORE.currentUser.status === 'PENDING_APPROVAL') {
    // 3. Logged in but Pending Admin Approval
    authGate?.classList.add('hidden');
    pendingGate?.classList.remove('hidden');
    lockedGate?.classList.add('hidden');
    
    document.getElementById('pendingUserName').innerText = DATA_STORE.currentUser.name;
    document.getElementById('pendingUserEmail').innerText = DATA_STORE.currentUser.email;
    document.getElementById('pendingUserRole').innerText = DATA_STORE.currentUser.role;
  } else if (DATA_STORE.currentUser.status === 'APPROVED') {
    // 4. Approved -> Grant full portal access
    authGate?.classList.add('hidden');
    pendingGate?.classList.add('hidden');
    lockedGate?.classList.add('hidden');
    updateHeaderUserProfile();
    checkRolePermissions();
  }
}

function checkRolePermissions() {
  const usersTabBtn = document.getElementById('nav-users');
  if (DATA_STORE.currentUser?.role === 'ADMIN') {
    usersTabBtn?.classList.remove('hidden');
  } else {
    usersTabBtn?.classList.add('hidden');
    if (DATA_STORE.activeTab === 'users') {
      switchTab('dashboard');
    }
  }
}

function switchAuthGateTab(tab) {
  const isSignIn = tab === 'signin';
  document.getElementById('gateTabBtnSignIn')?.classList.toggle('active', isSignIn);
  document.getElementById('gateTabBtnSignUp')?.classList.toggle('active', !isSignIn);
  document.getElementById('gateSignInForm')?.classList.toggle('hidden', !isSignIn);
  document.getElementById('gateSignUpForm')?.classList.toggle('hidden', isSignIn);
}

function handleGateSignIn(e) {
  e.preventDefault();
  const email = document.getElementById('gateEmail')?.value.trim();

  // Find user in database
  let user = DATA_STORE.users.find(u => u.email.toLowerCase() === email.toLowerCase());

  if (!user) {
    // If not found, create as pending user by default
    user = {
      id: `USR-${Math.floor(100 + Math.random() * 900)}`,
      name: email.split('@')[0],
      email: email,
      role: email.includes('admin') ? 'ADMIN' : 'OPERATOR',
      status: email.includes('admin') || email.includes('operator') ? 'APPROVED' : 'PENDING_APPROVAL',
      registeredAt: new Date().toLocaleString(),
      avatar: email.substring(0, 2).toUpperCase()
    };
    DATA_STORE.users.push(user);
    renderUserApprovals();
  }

  DATA_STORE.currentUser = user;
  evaluateAuthGate();

  DATA_STORE.auditLogs.unshift({
    time: new Date().toLocaleTimeString(),
    user: user.email,
    action: 'USER_LOGIN',
    entity: 'AUTH_GATE',
    ip: '127.0.0.1',
    details: `Signed in with status: ${user.status} [Role: ${user.role}]`
  });
  renderAuditTable();
}

function handleGateSignUp(e) {
  e.preventDefault();
  const name = document.getElementById('gateRegName')?.value.trim();
  const email = document.getElementById('gateRegEmail')?.value.trim();
  const role = document.getElementById('gateRegRole')?.value;

  const initials = name.split(' ').map(w => w[0]).join('').substring(0, 2).toUpperCase() || 'US';

  // Check if exists
  let existing = DATA_STORE.users.find(u => u.email.toLowerCase() === email.toLowerCase());
  if (existing) {
    alert(`Email ${email} đã tồn tại trong hệ thống. Vui lòng chuyển sang Đăng nhập.`);
    switchAuthGateTab('signin');
    return;
  }

  const newUser = {
    id: `USR-${Math.floor(100 + Math.random() * 900)}`,
    name: name,
    email: email,
    role: role,
    status: 'PENDING_APPROVAL', // Mandatory Admin Approval
    registeredAt: new Date().toLocaleString(),
    avatar: initials
  };

  DATA_STORE.users.push(newUser);
  DATA_STORE.currentUser = newUser;
  renderUserApprovals();
  evaluateAuthGate();

  DATA_STORE.auditLogs.unshift({
    time: new Date().toLocaleTimeString(),
    user: email,
    action: 'USER_REGISTRATION',
    entity: 'AUTH_GATE',
    ip: '127.0.0.1',
    details: `Registered account [Role: ${role}]. Status: PENDING_APPROVAL`
  });
  renderAuditTable();
}

function handleGoogleSignIn() {
  console.log('[Google Auth Hook] Initiating Google Sign In flow...');
  
  const googleEmail = 'user.google@ar-imms.dc';
  let user = DATA_STORE.users.find(u => u.email === googleEmail);

  if (!user) {
    user = {
      id: `USR-${Math.floor(100 + Math.random() * 900)}`,
      name: 'Google User (New Register)',
      email: googleEmail,
      role: 'TECHNICIAN',
      status: 'PENDING_APPROVAL', // New Google users must be approved by Admin
      registeredAt: new Date().toLocaleString(),
      avatar: 'GG'
    };
    DATA_STORE.users.push(user);
    renderUserApprovals();
  }

  DATA_STORE.currentUser = user;
  evaluateAuthGate();

  DATA_STORE.auditLogs.unshift({
    time: new Date().toLocaleTimeString(),
    user: googleEmail,
    action: 'OAUTH_GOOGLE_LOGIN',
    entity: 'AUTH_SERVICE',
    ip: '127.0.0.1 (Google OAuth)',
    details: `Google SSO Sign In. Status: ${user.status}`
  });
  renderAuditTable();
}

function fillTestAccount(type) {
  const emailInput = document.getElementById('gateEmail');
  const passInput = document.getElementById('gatePassword');

  if (type === 'ADMIN') {
    if (emailInput) emailInput.value = 'admin@ar-imms.dc';
    if (passInput) passInput.value = '123456';
  } else if (type === 'OPERATOR') {
    if (emailInput) emailInput.value = 'operator@ar-imms.dc';
    if (passInput) passInput.value = '123456';
  } else if (type === 'PENDING_USER') {
    if (emailInput) emailInput.value = 'tech.nguyenvanb@ar-imms.dc';
    if (passInput) passInput.value = '123456';
  }
}

function logoutToAuthGate() {
  DATA_STORE.currentUser = null;
  evaluateAuthGate();
  alert('Đã đăng xuất khỏi hệ thống.');
}

function checkApprovalStatus() {
  if (!DATA_STORE.currentUser) return;
  const current = DATA_STORE.users.find(u => u.email === DATA_STORE.currentUser.email);
  if (current && current.status === 'APPROVED') {
    DATA_STORE.currentUser = current;
    evaluateAuthGate();
    alert('🎉 Tài khoản của bạn đã được Admin phê duyệt thành công!');
  } else {
    alert('⏳ Tài khoản của bạn vẫn đang ở trạng thái Chờ Admin phê duyệt.');
  }
}

function updateHeaderUserProfile() {
  if (!DATA_STORE.currentUser) return;
  document.getElementById('currentUserName').innerText = DATA_STORE.currentUser.name;
  document.getElementById('currentUserRole').innerText = `${DATA_STORE.currentUser.email} • ${DATA_STORE.currentUser.role}`;
  document.getElementById('currentUserAvatar').innerText = DATA_STORE.currentUser.avatar;
}

// ==========================================
// ADMIN USER APPROVALS & LOCK/UNLOCK MANAGEMENT
// ==========================================

function renderUserApprovals() {
  const tbody = document.getElementById('userApprovalTableBody');
  if (!tbody) return;

  const pendingCount = DATA_STORE.users.filter(u => u.status === 'PENDING_APPROVAL').length;
  const badge = document.getElementById('sidebarPendingBadge');
  const topBadge = document.getElementById('pendingQueueCountBadge');

  if (badge) badge.innerText = pendingCount;
  if (topBadge) topBadge.innerText = `${pendingCount} Pending Request${pendingCount > 1 ? 's' : ''}`;

  tbody.innerHTML = DATA_STORE.users.map(u => {
    const isPending = u.status === 'PENDING_APPROVAL';
    const isApproved = u.status === 'APPROVED';
    const isLocked = u.status === 'LOCKED';
    const isCurrentUser = (DATA_STORE.currentUser && (DATA_STORE.currentUser.email.toLowerCase() === u.email.toLowerCase())) || (u.role === 'ADMIN' && DATA_STORE.currentUser?.role === 'ADMIN');

    let statusBadgeClass = 'status-badge-healthy';
    if (isPending) statusBadgeClass = 'status-badge-warning';
    else if (isLocked) statusBadgeClass = 'status-badge-locked';
    else if (u.status === 'REJECTED') statusBadgeClass = 'status-badge-critical';

    let actionButtons = '';
    if (isCurrentUser) {
      actionButtons = `<span class="status-badge status-badge-healthy font-mono">✔ Đang đăng nhập (Admin)</span>`;
    } else if (isPending) {
      actionButtons = `
        <button onclick="approveUser('${u.email}')" class="btn btn-success btn-sm">
          <i data-lucide="check"></i>
          <span>Approve (Duyệt)</span>
        </button>
        <button onclick="rejectUser('${u.email}')" class="btn btn-danger btn-sm">
          <i data-lucide="x"></i>
          <span>Reject</span>
        </button>
      `;
    } else if (isLocked) {
      actionButtons = `
        <button onclick="unlockUser('${u.email}')" class="btn btn-success btn-sm">
          <i data-lucide="unlock"></i>
          <span>Mở khóa</span>
        </button>
      `;
    } else if (isApproved) {
      actionButtons = `
        <button onclick="lockUser('${u.email}')" class="btn btn-warning btn-sm">
          <i data-lucide="lock"></i>
          <span>Khóa tài khoản</span>
        </button>
      `;
    } else {
      actionButtons = `
        <button onclick="approveUser('${u.email}')" class="btn btn-secondary btn-sm">
          <i data-lucide="refresh-cw"></i>
          <span>Phê duyệt lại</span>
        </button>
      `;
    }

    return `
      <tr>
        <td class="font-bold">
          <div class="node-title-group">
            <span class="user-avatar" style="width: 28px; height: 28px; font-size: 0.625rem;">${u.avatar}</span>
            <span>${u.name}</span>
          </div>
        </td>
        <td class="font-mono text-cyan">${u.email}</td>
        <td>
          <span class="priority-badge ${u.role === 'ADMIN' ? 'priority-badge-high' : u.role === 'OPERATOR' ? 'priority-badge-low' : 'priority-badge-medium'} font-mono">${u.role}</span>
        </td>
        <td class="font-mono text-muted">${u.registeredAt}</td>
        <td>
          <span class="status-badge ${statusBadgeClass}">${u.status}</span>
        </td>
        <td class="text-right">
          ${actionButtons}
        </td>
      </tr>
    `;
  }).join('');

  lucide.createIcons();
}

function approveUser(email) {
  const user = DATA_STORE.users.find(u => u.email === email);
  if (!user) return;

  user.status = 'APPROVED';
  renderUserApprovals();

  DATA_STORE.auditLogs.unshift({
    time: new Date().toLocaleTimeString(),
    user: DATA_STORE.currentUser?.email || 'admin@ar-imms.dc',
    action: 'ADMIN_APPROVE_USER',
    entity: user.email,
    ip: '127.0.0.1',
    details: `Admin approved access for ${user.name} with role ${user.role}`
  });
  renderAuditTable();

  alert(`✅ Đã phê duyệt quyền truy cập cho: ${user.name} (${user.email})`);
}

function rejectUser(email) {
  const user = DATA_STORE.users.find(u => u.email === email);
  if (!user) return;

  user.status = 'REJECTED';
  renderUserApprovals();

  DATA_STORE.auditLogs.unshift({
    time: new Date().toLocaleTimeString(),
    user: DATA_STORE.currentUser?.email || 'admin@ar-imms.dc',
    action: 'ADMIN_REJECT_USER',
    entity: user.email,
    ip: '127.0.0.1',
    details: `Admin rejected access for ${user.name}`
  });
  renderAuditTable();

  alert(`❌ Đã từ chối cấp quyền cho: ${user.name}`);
}

function lockUser(email) {
  const user = DATA_STORE.users.find(u => u.email === email);
  if (!user) return;

  if (user.email === DATA_STORE.currentUser?.email) {
    alert('Không thể tự khóa tài khoản Admin đang đăng nhập!');
    return;
  }

  user.status = 'LOCKED';
  renderUserApprovals();

  DATA_STORE.auditLogs.unshift({
    time: new Date().toLocaleTimeString(),
    user: DATA_STORE.currentUser?.email || 'admin@ar-imms.dc',
    action: 'ADMIN_LOCK_USER',
    entity: user.email,
    ip: '127.0.0.1',
    details: `Admin suspended/locked account: ${user.name} (${user.email})`
  });
  renderAuditTable();

  alert(`🔒 Đã khóa tài khoản của: ${user.name} (${user.email})!`);
}

function unlockUser(email) {
  const user = DATA_STORE.users.find(u => u.email === email);
  if (!user) return;

  user.status = 'APPROVED';
  renderUserApprovals();

  DATA_STORE.auditLogs.unshift({
    time: new Date().toLocaleTimeString(),
    user: DATA_STORE.currentUser?.email || 'admin@ar-imms.dc',
    action: 'ADMIN_UNLOCK_USER',
    entity: user.email,
    ip: '127.0.0.1',
    details: `Admin unlocked and restored access for ${user.name} (${user.email})`
  });
  renderAuditTable();

  alert(`🔓 Đã mở khóa thành công cho: ${user.name} (${user.email})!`);
}

// ==========================================
// NAVIGATION & DIGITAL TWIN LOGIC
// ==========================================

function switchTab(tabId) {
  DATA_STORE.activeTab = tabId;
  document.querySelectorAll('.tab-view').forEach(el => el.classList.add('hidden'));
  document.querySelectorAll('.nav-item').forEach(el => el.classList.remove('active'));

  const targetTab = document.getElementById(`tab-${tabId}`);
  const targetNav = document.getElementById(`nav-${tabId}`);
  if (targetTab) targetTab.classList.remove('hidden');
  if (targetNav) targetNav.classList.add('active');

  lucide.createIcons();
}

function selectRack(rackId) {
  DATA_STORE.selectedRack = rackId;
  document.querySelectorAll('.rack-tab-btn').forEach(btn => btn.classList.remove('active'));
  document.getElementById(`btn-${rackId}`)?.classList.add('active');
  renderRackSlots();
}

function renderRackSlots() {
  const container = document.getElementById('rackSlotContainer');
  if (!container) return;

  const currentRackNodes = Object.values(DATA_STORE.nodes).filter(n => n.rack === DATA_STORE.selectedRack);
  
  let html = '';
  html += `
    <div class="rack-chassis-top">
      <span class="font-bold text-cyan">${DATA_STORE.selectedRack.toUpperCase()} TOP (42U)</span>
      <span>COOLING AIRFLOW INTAKE &darr;</span>
    </div>
  `;

  let occupiedSlots = new Set();

  for (let u = 42; u >= 1; u--) {
    if (occupiedSlots.has(u)) continue;

    const node = currentRackNodes.find(n => n.uStart <= u && u < n.uStart + n.uHeight);

    if (node && u === node.uStart + node.uHeight - 1) {
      for (let i = node.uStart; i < node.uStart + node.uHeight; i++) {
        occupiedSlots.add(i);
      }

      const isSelected = node.id === DATA_STORE.selectedNodeId;
      const statusClass = `rack-node-${node.status.toLowerCase()}`;
      const statusBadgeClass = `status-badge-${node.status.toLowerCase()}`;
      const isCritical = node.status === 'CRITICAL';
      const isWarning = node.status === 'WARNING';
      const isOffline = node.status === 'OFFLINE';

      html += `
        <div onclick="selectNode('${node.id}')" 
             class="rack-node-unit ${statusClass} ${isSelected ? 'selected' : ''}">
          <div class="node-title-group">
            <span class="unit-tag">U${node.uStart}-U${node.uStart + node.uHeight - 1}</span>
            <span class="font-mono font-bold">${node.id}</span>
            <span class="text-muted font-sans">• ${node.name}</span>
          </div>

          <div class="node-title-group font-mono">
            <span class="text-muted">CPU: <b class="${isCritical ? 'text-critical' : isWarning ? 'text-warning' : 'text-cyan'}">${node.metrics.cpu}%</b></span>
            <span class="text-muted">RAM: <b>${node.metrics.ram}%</b></span>
            <div class="node-title-group">
              <span class="beacon-dot ${isOffline ? 'legend-offline' : 'legend-healthy'}"></span>
              <span class="status-badge ${statusBadgeClass}">${node.status}</span>
            </div>
          </div>
        </div>
      `;
    } else if (!occupiedSlots.has(u)) {
      html += `
        <div class="rack-slot-empty">
          <span>U${u}</span>
          <span>Empty Slot</span>
        </div>
      `;
    }
  }

  container.innerHTML = html;
}

function selectNode(nodeId) {
  DATA_STORE.selectedNodeId = nodeId;
  renderRackSlots();
  renderNodeDetail(nodeId);
}

function renderNodeDetail(nodeId) {
  const node = DATA_STORE.nodes[nodeId];
  if (!node) return;

  document.getElementById('detailNodeName').innerText = `${node.id} (${node.name})`;
  document.getElementById('detailRackLocation').innerText = `${node.rack.toUpperCase()} • ${node.slot} • IP: ${node.ip}`;
  document.getElementById('detailCpuVal').innerText = `${node.metrics.cpu}%`;
  document.getElementById('detailRamVal').innerText = `${node.metrics.ram}%`;
  document.getElementById('detailCpuModel').innerText = node.model;
  document.getElementById('detailDiskTemp').innerText = `${node.metrics.temp}°C • ${node.metrics.disk}% Disk`;
  document.getElementById('detailNetVal').innerText = `${node.metrics.netIn} KB/s in • ${node.metrics.netOut} KB/s out`;
  document.getElementById('detailContainerCount').innerText = `${node.containers.length} Containers`;

  const beacon = document.getElementById('detailStatusBeacon');
  if (beacon) {
    beacon.className = `beacon-dot ${node.status === 'HEALTHY' ? 'legend-healthy' : node.status === 'WARNING' ? 'legend-warning' : 'legend-critical'}`;
  }

  const containerList = document.getElementById('detailContainerList');
  if (containerList) {
    containerList.innerHTML = node.containers.map(c => `
      <div class="container-card-item">
        <div class="container-left">
          <i data-lucide="box" class="text-cyan"></i>
          <div>
            <div class="font-semibold">${c.name}</div>
            <div class="text-dim" style="font-size: 0.625rem;">${c.image}</div>
          </div>
        </div>
        <div class="text-right">
          <div class="font-bold ${c.status === 'RUNNING' ? 'text-healthy' : 'text-warning'}">${c.status}</div>
          <div class="text-muted" style="font-size: 0.625rem;">CPU: ${c.cpu} • RAM: ${c.ram}</div>
        </div>
      </div>
    `).join('');
  }

  lucide.createIcons();
}

function renderAssetsTable() {
  const tbody = document.getElementById('assetTableBody');
  if (!tbody) return;

  tbody.innerHTML = Object.values(DATA_STORE.nodes).map(n => {
    const statusBadgeClass = `status-badge-${n.status.toLowerCase()}`;
    return `
      <tr>
        <td class="font-mono font-bold">
          <div class="node-title-group">
            <span class="beacon-dot legend-${n.status.toLowerCase()}"></span>
            <span>${n.id}</span>
          </div>
          <div class="text-muted font-sans" style="font-size: 0.6875rem;">${n.name}</div>
        </td>
        <td class="font-mono text-muted">${n.rack.toUpperCase()} / ${n.slot}</td>
        <td class="font-mono text-cyan">${n.ip}</td>
        <td>
          <div>${n.model}</div>
          <div class="text-dim font-mono" style="font-size: 0.625rem;">RAM: ${n.ramTotal} | MAC: ${n.mac}</div>
        </td>
        <td>
          <button onclick="openQrModal('${n.id}')" class="link-qr-tag">
            <i data-lucide="qr-code"></i>
            <span>${n.qr}</span>
          </button>
        </td>
        <td>
          <span class="status-badge ${statusBadgeClass}">${n.status}</span>
        </td>
        <td class="text-right">
          <button onclick="selectNode('${n.id}'); switchTab('dashboard');" class="btn btn-secondary btn-sm">
            Inspect
          </button>
        </td>
      </tr>
    `;
  }).join('');
}

function renderAlerts() {
  const container = document.getElementById('alertListContainer');
  if (!container) return;

  const activeCount = DATA_STORE.alerts.filter(a => a.status === 'OPEN').length;
  const badge = document.getElementById('alertCountBadge');
  const sidebarBadge = document.getElementById('sidebarAlertBadge');

  if (badge) badge.innerText = `${activeCount} Active`;
  if (sidebarBadge) {
    if (activeCount > 0) {
      sidebarBadge.innerText = activeCount;
      sidebarBadge.classList.remove('hidden');
    } else {
      sidebarBadge.classList.add('hidden');
    }
  }

  if (DATA_STORE.alerts.length === 0) {
    container.innerHTML = `
      <div style="text-align: center; padding: 3rem 1rem; border: 1px dashed var(--border-color); border-radius: var(--radius-lg); background: #f8fafc; display: flex; flex-direction: column; align-items: center; gap: 0.5rem;">
        <div style="width: 48px; height: 48px; border-radius: var(--radius-full); background: #ecfdf5; color: var(--status-healthy); display: flex; align-items: center; justify-content: center;">
          <i data-lucide="shield-check" style="width: 24px; height: 24px;"></i>
        </div>
        <div class="font-bold text-main" style="font-size: 0.875rem;">Hệ thống an toàn (0 Cảnh báo)</div>
        <p class="text-muted" style="font-size: 0.75rem; max-width: 280px;">Chưa có cảnh báo vi phạm ngưỡng nào. Sẵn sàng tiếp nhận dữ liệu đo lường thực tế.</p>
      </div>
    `;
    lucide.createIcons();
    return;
  }

  container.innerHTML = DATA_STORE.alerts.map(a => `
    <div class="alert-feed-item ${a.severity === 'CRITICAL' ? 'alert-feed-critical' : 'alert-feed-warning'}">
      <div class="alert-feed-top">
        <div class="node-title-group font-bold font-mono">
          <span class="beacon-dot ${a.severity === 'CRITICAL' ? 'legend-critical' : 'legend-warning'}"></span>
          <span>${a.title}</span>
        </div>
        <span class="font-mono text-dim" style="font-size: 0.625rem;">${a.time}</span>
      </div>
      <p style="font-size: 0.6875rem; line-height: 1.4;">${a.message}</p>
      <div class="alert-feed-bottom">
        <span class="text-muted">Target: <b>${a.nodeId}</b></span>
        <button onclick="dispatchTicketFromAlert('${a.id}')" class="btn btn-danger" style="padding: 0.125rem 0.5rem; font-size: 0.625rem;">
          Create Ticket &rarr;
        </button>
      </div>
    </div>
  `).join('');

  lucide.createIcons();
}

function clearAllAlerts() {
  if (DATA_STORE.alerts.length === 0) {
    alert('Danh sách cảnh báo hiện đang trống.');
    return;
  }
  DATA_STORE.alerts = [];
  renderAlerts();
  alert('Đã xóa sạch danh sách cảnh báo!');
}

function renderTickets() {
  const container = document.getElementById('ticketListContainer');
  if (!container) return;

  const inProgressCount = DATA_STORE.tickets.filter(t => t.status === 'IN_PROGRESS' || t.status === 'ASSIGNED').length;
  const resolvedCount = DATA_STORE.tickets.filter(t => t.status === 'RESOLVED').length;
  
  const summary = document.getElementById('ticketSummaryCounts');
  if (summary) {
    summary.innerHTML = `<span class="text-warning">● ${inProgressCount} In-Progress</span> &nbsp; <span class="text-healthy">● ${resolvedCount} Resolved</span>`;
  }

  const kpiTicket = document.getElementById('kpiTicketCount');
  if (kpiTicket) {
    kpiTicket.innerText = inProgressCount > 0 ? `${inProgressCount} Open` : '0 Open';
  }

  if (DATA_STORE.tickets.length === 0) {
    container.innerHTML = `
      <div style="text-align: center; padding: 3rem 1rem; border: 1px dashed var(--border-color); border-radius: var(--radius-lg); background: #f8fafc; display: flex; flex-direction: column; align-items: center; gap: 0.5rem;">
        <div style="width: 48px; height: 48px; border-radius: var(--radius-full); background: #eff6ff; color: var(--primary-600); display: flex; align-items: center; justify-content: center;">
          <i data-lucide="check-circle-2" style="width: 24px; height: 24px;"></i>
        </div>
        <div class="font-bold text-main" style="font-size: 0.875rem;">Không có vé bảo trì cần xử lý</div>
        <p class="text-muted" style="font-size: 0.75rem; max-width: 320px;">Tất cả thiết bị máy chủ đang hoạt động bình thường. Vé mới sẽ tự động sinh ra khi Operator phân công từ cảnh báo thực.</p>
      </div>
    `;
    lucide.createIcons();
    return;
  }

  container.innerHTML = DATA_STORE.tickets.map(t => `
    <div class="ticket-card-item">
      <div class="ticket-card-header">
        <div class="node-title-group">
          <span class="font-mono font-bold text-cyan">${t.id}</span>
          <span class="priority-badge priority-badge-${t.priority.toLowerCase()}">${t.priority}</span>
          <span class="font-semibold">${t.title}</span>
        </div>
        <span class="status-badge ${t.status === 'IN_PROGRESS' ? 'status-badge-warning' : 'status-badge-healthy'}">${t.status}</span>
      </div>
      
      <div class="ticket-meta-grid">
        <div>Target Device: <span class="font-bold text-cyan">${t.nodeId} (${t.rack})</span></div>
        <div>Assigned Tech: <span class="font-bold text-indigo">${t.technician}</span></div>
      </div>

      <div class="ticket-notes-box">
        <span class="text-dim font-mono">Field Notes:</span> ${t.notes}
      </div>
    </div>
  `).join('');

  lucide.createIcons();
}

function renderAuditTable() {
  const tbody = document.getElementById('auditTableBody');
  if (!tbody) return;

  tbody.innerHTML = DATA_STORE.auditLogs.map(l => `
    <tr class="font-mono" style="font-size: 0.6875rem;">
      <td class="text-dim">${l.time}</td>
      <td class="text-cyan font-bold">${l.user}</td>
      <td class="font-semibold">${l.action}</td>
      <td class="text-indigo">${l.entity}</td>
      <td class="text-muted">${l.ip}</td>
      <td class="font-sans">${l.details}</td>
    </tr>
  `).join('');
}

function initCharts() {
  const now = new Date();
  for (let i = MAX_CHART_POINTS - 1; i >= 0; i--) {
    const d = new Date(now.getTime() - i * 5000);
    chartTimeLabels.push(`${d.getHours()}:${String(d.getMinutes()).padStart(2, '0')}:${String(d.getSeconds()).padStart(2, '0')}`);
  }

  const commonOptions = {
    responsive: true,
    maintainAspectRatio: false,
    animation: false,
    scales: {
      x: { grid: { color: '#f1f5f9' }, ticks: { color: '#64748b', font: { size: 10, family: "'JetBrains Mono', monospace" } } },
      y: { grid: { color: '#f1f5f9' }, ticks: { color: '#64748b', font: { size: 10, family: "'JetBrains Mono', monospace" } } }
    },
    plugins: { legend: { display: false } }
  };

  charts.cpu = new Chart(document.getElementById('chartCpu'), {
    type: 'line',
    data: {
      labels: [...chartTimeLabels],
      datasets: [{
        label: 'CPU Load %',
        data: Array(MAX_CHART_POINTS).fill(45),
        borderColor: '#0284c7',
        backgroundColor: 'rgba(2, 132, 199, 0.08)',
        borderWidth: 2,
        tension: 0.3,
        fill: true
      }]
    },
    options: commonOptions
  });

  charts.ram = new Chart(document.getElementById('chartRam'), {
    type: 'line',
    data: {
      labels: [...chartTimeLabels],
      datasets: [{
        label: 'RAM Usage %',
        data: Array(MAX_CHART_POINTS).fill(60),
        borderColor: '#6366f1',
        backgroundColor: 'rgba(99, 102, 241, 0.08)',
        borderWidth: 2,
        tension: 0.3,
        fill: true
      }]
    },
    options: commonOptions
  });

  charts.net = new Chart(document.getElementById('chartNet'), {
    type: 'line',
    data: {
      labels: [...chartTimeLabels],
      datasets: [{
        label: 'Network KB/s',
        data: Array(MAX_CHART_POINTS).fill(150),
        borderColor: '#059669',
        backgroundColor: 'rgba(5, 150, 105, 0.08)',
        borderWidth: 2,
        tension: 0.3,
        fill: true
      }]
    },
    options: commonOptions
  });

  charts.temp = new Chart(document.getElementById('chartTemp'), {
    type: 'line',
    data: {
      labels: [...chartTimeLabels],
      datasets: [{
        label: 'Temperature °C',
        data: Array(MAX_CHART_POINTS).fill(42),
        borderColor: '#d97706',
        backgroundColor: 'rgba(217, 119, 6, 0.08)',
        borderWidth: 2,
        tension: 0.3,
        fill: true
      }]
    },
    options: commonOptions
  });
}

function startTelemetrySimulator() {
  setInterval(() => {
    if (!DATA_STORE.simulatorRunning) return;

    const now = new Date();
    const timeStr = `${now.getHours()}:${String(now.getMinutes()).padStart(2, '0')}:${String(now.getSeconds()).padStart(2, '0')}`;

    Object.values(DATA_STORE.nodes).forEach(node => {
      if (node.status === 'OFFLINE') return;

      const deltaCpu = (Math.random() * 4 - 2);
      node.metrics.cpu = Math.max(10, Math.min(99, +(node.metrics.cpu + deltaCpu).toFixed(1)));

      const deltaRam = (Math.random() * 2 - 1);
      node.metrics.ram = Math.max(20, Math.min(99, +(node.metrics.ram + deltaRam).toFixed(1)));

      node.metrics.netIn = Math.max(50, Math.min(1200, Math.floor(node.metrics.netIn + (Math.random() * 40 - 20))));
      node.metrics.temp = +(40 + (node.metrics.cpu * 0.3) + (Math.random() * 1.5 - 0.75)).toFixed(1);
    });

    renderNodeDetail(DATA_STORE.selectedNodeId);

    const targetNode = DATA_STORE.nodes[DATA_STORE.telemetryTargetNode];
    if (targetNode && charts.cpu) {
      updateChart(charts.cpu, timeStr, targetNode.metrics.cpu);
      updateChart(charts.ram, timeStr, targetNode.metrics.ram);
      updateChart(charts.net, timeStr, targetNode.metrics.netIn);
      updateChart(charts.temp, timeStr, targetNode.metrics.temp);

      const liveCpu = document.getElementById('liveChartCpuVal');
      const liveRam = document.getElementById('liveChartRamVal');
      const liveNet = document.getElementById('liveChartNetVal');
      const liveTemp = document.getElementById('liveChartTempVal');
      if (liveCpu) liveCpu.innerText = `${targetNode.metrics.cpu}%`;
      if (liveRam) liveRam.innerText = `${targetNode.metrics.ram}%`;
      if (liveNet) liveNet.innerText = `${targetNode.metrics.netIn} KB/s`;
      if (liveTemp) liveTemp.innerText = `${targetNode.metrics.temp}°C`;
    }

    const activeNodes = Object.values(DATA_STORE.nodes).filter(n => n.status !== 'OFFLINE');
    const avgCpu = (activeNodes.reduce((acc, n) => acc + n.metrics.cpu, 0) / activeNodes.length).toFixed(1);
    const kpiAvgCpu = document.getElementById('kpiAvgCpu');
    const kpiCpuBar = document.getElementById('kpiCpuBar');
    if (kpiAvgCpu) kpiAvgCpu.innerText = `${avgCpu}%`;
    if (kpiCpuBar) kpiCpuBar.style.width = `${avgCpu}%`;

  }, 2500);
}

function updateChart(chart, label, value) {
  chart.data.labels.push(label);
  chart.data.datasets[0].data.push(value);
  if (chart.data.labels.length > MAX_CHART_POINTS) {
    chart.data.labels.shift();
    chart.data.datasets[0].data.shift();
  }
  chart.update('none');
}

function changeTelemetryNode(nodeId) {
  DATA_STORE.telemetryTargetNode = nodeId;
}

let qrcodeInstance = null;
function openQrModal(nodeId) {
  const node = DATA_STORE.nodes[nodeId];
  if (!node) return;

  document.getElementById('modalNodeId').innerText = node.id;
  document.getElementById('modalPayloadUri').innerText = node.qr;
  document.getElementById('modalDeviceDesc').innerText = `${node.name} (${node.model})`;

  const qrContainer = document.getElementById('qrcodeContainer');
  qrContainer.innerHTML = '';
  qrcodeInstance = new QRCode(qrContainer, {
    text: node.qr,
    width: 180,
    height: 180,
    colorDark: "#000000",
    colorLight: "#ffffff",
    correctLevel: QRCode.CorrectLevel.H
  });

  document.getElementById('qrModal').classList.remove('hidden');
}

function openQrModalCurrent() {
  openQrModal(DATA_STORE.selectedNodeId);
}

function closeQrModal() {
  document.getElementById('qrModal').classList.add('hidden');
}

// BATCH PRINT ALL 6 NODES QR CODES
function openBatchQrModal() {
  const container = document.getElementById('batchQrContainer');
  if (!container) return;
  
  container.innerHTML = '';
  const nodes = Object.values(DATA_STORE.nodes);

  nodes.forEach((node, idx) => {
    const qrDivId = `batch-qr-code-${idx}`;
    const card = document.createElement('div');
    card.className = 'batch-tag-card';
    card.innerHTML = `
      <div class="batch-tag-header">
        <span class="font-bold text-cyan">${node.id}</span>
        <span class="status-badge status-badge-${node.status.toLowerCase()}">${node.status}</span>
      </div>
      <div class="batch-tag-qr" id="${qrDivId}"></div>
      <div class="batch-tag-meta">
        <div class="font-bold text-main">${node.name}</div>
        <div>${node.rack.toUpperCase()} • ${node.slot}</div>
        <div class="text-cyan">${node.ip} | MAC: ${node.mac}</div>
        <div class="text-dim" style="font-size: 0.5625rem;">${node.qr}</div>
      </div>
    `;
    container.appendChild(card);

    setTimeout(() => {
      const qrEl = document.getElementById(qrDivId);
      if (qrEl) {
        new QRCode(qrEl, {
          text: node.qr,
          width: 120,
          height: 120,
          colorDark: "#000000",
          colorLight: "#ffffff",
          correctLevel: QRCode.CorrectLevel.H
        });
      }
    }, 50);
  });

  document.getElementById('batchQrModal')?.classList.remove('hidden');
  lucide.createIcons();
}

function closeBatchQrModal() {
  document.getElementById('batchQrModal')?.classList.add('hidden');
}

function triggerNodeAlert() {
  const node = DATA_STORE.nodes[DATA_STORE.selectedNodeId];
  if (!node) return;

  node.metrics.cpu = 95.8;
  node.status = 'CRITICAL';
  DATA_STORE.alerts.unshift({
    id: `ALT-${Math.floor(1000 + Math.random() * 9000)}`,
    nodeId: node.id,
    severity: 'CRITICAL',
    title: 'High CPU Spike (>95%)',
    message: `Thermal and CPU overload trigger on node ${node.id}.`,
    time: 'Just now',
    status: 'OPEN'
  });

  DATA_STORE.auditLogs.unshift({
    time: new Date().toLocaleTimeString(),
    user: DATA_STORE.currentUser?.email || 'automated.engine',
    action: 'TRIGGER_THRESHOLD_ALERT',
    entity: node.id,
    ip: '127.0.0.1',
    details: 'Triggered CPU > 95% critical alert'
  });

  renderRackSlots();
  renderNodeDetail(node.id);
  renderAlerts();
  renderAuditTable();
  alert(`Cảnh báo ngưỡng nghiêm trọng đã được kích hoạt cho ${node.id}!`);
}

function triggerNodeOffline() {
  const node = DATA_STORE.nodes[DATA_STORE.selectedNodeId];
  if (!node) return;

  node.status = 'OFFLINE';
  node.metrics.cpu = 0;
  node.metrics.ram = 0;
  node.metrics.netIn = 0;
  
  DATA_STORE.alerts.unshift({
    id: `ALT-${Math.floor(1000 + Math.random() * 9000)}`,
    nodeId: node.id,
    severity: 'CRITICAL',
    title: 'Node Heartbeat Timeout (>90s)',
    message: `Collector agent on ${node.id} is unreachable. Heartbeat lost.`,
    time: 'Just now',
    status: 'OPEN'
  });

  DATA_STORE.auditLogs.unshift({
    time: new Date().toLocaleTimeString(),
    user: 'stale.detector',
    action: 'SERVER_OFFLINE',
    entity: node.id,
    ip: '127.0.0.1',
    details: 'Marked node as OFFLINE after 90s silence'
  });

  renderRackSlots();
  renderNodeDetail(node.id);
  renderAlerts();
  renderAuditTable();
  alert(`Máy chủ ${node.id} đã bị ngắt kết nối (Mất heartbeat >90s)!`);
}

function dispatchTicketFromAlert(alertId) {
  const alertItem = DATA_STORE.alerts.find(a => a.id === alertId);
  if (!alertItem) return;

  const newTicket = {
    id: `TCK-2026-${Math.floor(100 + Math.random() * 900)}`,
    nodeId: alertItem.nodeId,
    rack: DATA_STORE.nodes[alertItem.nodeId]?.rack || 'Rack A1',
    title: alertItem.title,
    priority: alertItem.severity === 'CRITICAL' ? 'HIGH' : 'MEDIUM',
    status: 'ASSIGNED',
    technician: 'Nguyen Van A (Tech #12)',
    created: 'Just now',
    notes: `Dispatched from ${alertItem.id}: ${alertItem.message}`
  };

  DATA_STORE.tickets.unshift(newTicket);
  alertItem.status = 'RESOLVED';
  renderTickets();
  renderAlerts();
  switchTab('alerts');
  alert(`Đã tạo vé bảo trì ${newTicket.id} và phân công cho Kỹ thuật viên!`);
}
