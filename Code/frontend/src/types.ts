export type TabType = 'digital-twin' | 'telemetry' | 'assets-qr' | 'alerts' | 'users' | 'audit-logs';

export interface RackUnit {
  u: number;
  name: string;
  model: string;
  status: 'healthy' | 'warning' | 'critical' | 'offline';
  temp: number;
  cpu: number;
  ram: number;
  disk: number;
  net: number;
}

export interface Rack {
  id: string;
  name: string;
  status: 'healthy' | 'warning' | 'critical';
  units: RackUnit[];
  zone?: string;
  location?: string;
  temperature?: number;
  powerDrawKw?: number;
  coolingStatus?: string;
  fanSpeedRpm?: number;
  networkBandwidthGbps?: number;
  nodesCount?: number;
  activeAlertsCount?: number;
}

export interface TelemetryLogEntry {
  id: string;
  timeStr: string;
  type: 'INFO' | 'WARN' | 'CRIT' | 'SYNC';
  node: string;
  message: string;
}

export interface AssetItem {
  id: string;
  name: string;
  model: string;
  rack: string;
  uPosition: string;
  qrStatus: 'Active' | 'Mismatch' | 'Pending';
  guid: string;
  manufacturer: string;
  serialNumber: string;
  installDate: string;
  powerDraw: string;
  networkInterfaces: string[];
}

export interface MaintenanceLog {
  id: string;
  title: string;
  timestamp: string;
  description: string;
  verified: boolean;
  duration?: string;
  icon: string;
}

export interface AlertItem {
  id: string;
  alertCode: string;
  title: string;
  description: string;
  severity: 'Critical' | 'Warning' | 'Info';
  time: string;
  loggedTimeUtc: string;
  location: string;
  assignedTo: string;
  zone: string;
  acknowledged: boolean;
  resolved: boolean;
  snapshot: {
    rackTemp: string;
    tempRate: string;
    fanSpeed: string;
    fanStatus: string;
    powerDraw: string;
    powerStatus: string;
    tempTrend: number[];
  };
  maintenanceLogs: MaintenanceLog[];
}

export interface UserItem {
  id: string;
  userId: string;
  name: string;
  email: string;
  role: 'Admin' | 'Technician' | 'Viewer';
  status: 'Active' | 'Pending' | 'Locked';
  lastAuth: string;
  initials: string;
  avatarUrl?: string;
  isSelf?: boolean;
}

export interface AuditLogItem {
  id: string;
  timestamp: string;
  user: string;
  userType: 'user' | 'system' | 'unknown';
  initials?: string;
  action: string;
  target?: string;
  ipAddress: string;
  status: 'Success' | 'Critical' | 'Warning';
  details?: Record<string, any>;
}
