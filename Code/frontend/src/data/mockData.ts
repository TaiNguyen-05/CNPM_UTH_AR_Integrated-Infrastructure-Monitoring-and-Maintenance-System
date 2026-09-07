import { AssetItem, AlertItem, UserItem, AuditLogItem, Rack } from '../types';

export const INITIAL_ASSETS: AssetItem[] = [
  {
    id: 'asset-1',
    name: 'Primary Compute Node 01',
    model: 'Dell PowerEdge R740 / Xeon Gold 6248R',
    rack: 'Rack A1',
    uPosition: 'Rack A1, U38-39',
    qrStatus: 'Active',
    guid: 'ar-imms://node/SRV-NODE-01',
    manufacturer: 'Dell Technologies',
    serialNumber: 'CN-0XNODE01',
    installDate: '2024-01-15',
    powerDraw: '450W (Avg)',
    networkInterfaces: ['eth0: 192.168.1.101', 'eth1: 10.0.1.101']
  },
  {
    id: 'asset-2',
    name: 'Secondary Compute Node 02',
    model: 'Dell PowerEdge R740 / Xeon Gold 6248R',
    rack: 'Rack A1',
    uPosition: 'Rack A1, U35-36',
    qrStatus: 'Active',
    guid: 'ar-imms://node/SRV-NODE-02',
    manufacturer: 'Dell Technologies',
    serialNumber: 'CN-0XNODE02',
    installDate: '2024-01-15',
    powerDraw: '420W (Avg)',
    networkInterfaces: ['eth0: 192.168.1.102', 'eth1: 10.0.1.102']
  },
  {
    id: 'asset-3',
    name: 'Database Primary Replica',
    model: 'HPE ProLiant DL380 Gen10',
    rack: 'Rack A1',
    uPosition: 'Rack A1, U30-33',
    qrStatus: 'Active',
    guid: 'ar-imms://node/SRV-NODE-03',
    manufacturer: 'Hewlett Packard Enterprise',
    serialNumber: 'HP-0XNODE03',
    installDate: '2023-11-20',
    powerDraw: '680W (Avg)',
    networkInterfaces: ['eth0: 192.168.1.103', 'iscsi0: 10.0.50.10']
  },
  {
    id: 'asset-4',
    name: 'Application Web Gateway',
    model: 'Supermicro 1U TwinPro',
    rack: 'Rack A2',
    uPosition: 'Rack A2, U36-37',
    qrStatus: 'Active',
    guid: 'ar-imms://node/SRV-NODE-04',
    manufacturer: 'Supermicro Inc.',
    serialNumber: 'SM-0XNODE04',
    installDate: '2024-02-10',
    powerDraw: '310W (Avg)',
    networkInterfaces: ['eth0: 192.168.1.104', 'eth1: 10.0.1.104']
  },
  {
    id: 'asset-5',
    name: 'Log Aggregator & Pipeline',
    model: 'Dell PowerEdge R640',
    rack: 'Rack A2',
    uPosition: 'Rack A2, U20-22',
    qrStatus: 'Mismatch',
    guid: 'ar-imms://node/SRV-NODE-05',
    manufacturer: 'Dell Technologies',
    serialNumber: 'CN-0XNODE05',
    installDate: '2024-03-05',
    powerDraw: '390W (Avg)',
    networkInterfaces: ['eth0: 192.168.1.105', 'eth1: 10.0.1.105']
  },
  {
    id: 'asset-6',
    name: 'Edge Router B1',
    model: 'Juniper MX204',
    rack: 'Rack B1',
    uPosition: 'Rack B1, U01-02',
    qrStatus: 'Active',
    guid: 'ar-imms://node/SRV-ROUTER-01',
    manufacturer: 'Juniper Networks',
    serialNumber: 'JN-0XROUT01',
    installDate: '2023-08-12',
    powerDraw: '220W (Avg)',
    networkInterfaces: ['ge0: 192.168.1.1', 'xe0: 10.100.0.1']
  }
];

export const INITIAL_ALERTS: AlertItem[] = [
  {
    id: 'alt-1',
    alertCode: '#ALT-0992',
    title: 'Cooling System Failure',
    description: 'Rack A4 ambient temperature exceeded safe threshold (38°C). Impending thermal throttling.',
    severity: 'Critical',
    time: '10:42 AM',
    loggedTimeUtc: '10:42:15 UTC',
    location: 'Rack A4, Data Hall 1',
    assignedTo: 'Unassigned',
    zone: 'Zone 1',
    acknowledged: false,
    resolved: false,
    snapshot: {
      rackTemp: '38.2°C',
      tempRate: '+12°C/hr',
      fanSpeed: '0 RPM',
      fanStatus: 'Stalled',
      powerDraw: '2.4 kW',
      powerStatus: 'Normal',
      tempTrend: [24, 25, 24, 26, 28, 33, 38.2]
    },
    maintenanceLogs: [
      {
        id: 'log-1',
        title: 'Fan Unit Replacement (Routine)',
        timestamp: 'Oct 12, 2023 - 14:30',
        description: 'Technician J. Doe replaced Fan Unit 2 using AR overlay guidance. Calibration successful.',
        verified: true,
        duration: '45m',
        icon: 'build'
      },
      {
        id: 'log-2',
        title: 'Filter Cleaning',
        timestamp: 'Aug 05, 2023 - 09:15',
        description: 'Scheduled cleaning of dust filters on Intake A. No anomalies reported.',
        verified: false,
        icon: 'cleaning_services'
      }
    ]
  },
  {
    id: 'alt-2',
    alertCode: '#ALT-0988',
    title: 'Power Fluctuation',
    description: 'Minor voltage drop detected on UPS Line B. Redundancy systems active.',
    severity: 'Warning',
    time: '09:15 AM',
    loggedTimeUtc: '09:15:30 UTC',
    location: 'Substation B, Data Hall 2',
    assignedTo: 'Sarah Jenkins',
    zone: 'Substation B',
    acknowledged: true,
    resolved: false,
    snapshot: {
      rackTemp: '26.4°C',
      tempRate: '+0.5°C/hr',
      fanSpeed: '2800 RPM',
      fanStatus: 'Optimal',
      powerDraw: '4.8 kW',
      powerStatus: 'UPS Line B Inverted',
      tempTrend: [26.0, 26.1, 26.2, 26.4, 26.3, 26.4]
    },
    maintenanceLogs: [
      {
        id: 'log-3',
        title: 'UPS Battery Inspection',
        timestamp: 'Sep 18, 2023 - 11:00',
        description: 'Lead electrician calibrated inverter thresholds on Line B bank.',
        verified: true,
        duration: '1h 20m',
        icon: 'battery_charging_full'
      }
    ]
  },
  {
    id: 'alt-3',
    alertCode: '#ALT-0975',
    title: 'Network Uplink Down',
    description: 'Primary fiber connection to Sector 4 severed. Failing over to microwave backup.',
    severity: 'Critical',
    time: '08:02 AM',
    loggedTimeUtc: '08:02:10 UTC',
    location: 'Network Switch 4, Core Area',
    assignedTo: 'Robert King',
    zone: 'Network Switch 4',
    acknowledged: true,
    resolved: false,
    snapshot: {
      rackTemp: '28.0°C',
      tempRate: '+1.1°C/hr',
      fanSpeed: '4200 RPM',
      fanStatus: 'High',
      powerDraw: '1.8 kW',
      powerStatus: 'Failover Active',
      tempTrend: [27.5, 27.8, 28.0, 28.0, 27.9]
    },
    maintenanceLogs: [
      {
        id: 'log-4',
        title: 'Fiber Patch Inspection',
        timestamp: 'Jul 22, 2023 - 16:45',
        description: 'Cleaned LC optical transceiver terminals on Uplink 0/4.',
        verified: true,
        duration: '30m',
        icon: 'cable'
      }
    ]
  }
];

export const INITIAL_USERS: UserItem[] = [
  {
    id: 'usr-1',
    userId: 'TECH-8892',
    name: 'John Doe',
    email: 'jdoe@ar-imms.corp',
    role: 'Technician',
    status: 'Pending',
    lastAuth: '--',
    initials: 'JD'
  },
  {
    id: 'usr-2',
    userId: 'TECH-1024',
    name: 'Michael Chen',
    email: 'mchen@ar-imms.corp',
    role: 'Technician',
    status: 'Locked',
    lastAuth: '10 mins ago (Zone B)',
    initials: 'MC',
    avatarUrl: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDp1bxCCgZ_ym-B_2RthP1RvTpBSYbnRPShSBg2nI2ACAR5y6k83GQg-h_Nth9cBGQ2diU3CYYRQGfGLcdBbezqMrPtOfQtPXpYGk3UxKJlHTuGDSk8cY2f1deFOZ0h0NOQbEZHkOp98IGQas977qanG6-RAAdBTyJWEWKTp_XeDz4_u4lCqb5Gr0jXBtI5jSRwl8lATOIDeyd40L6wFLGBh0Hhb3_zog0St2D1kRd0niFIOlueySqi'
  },
  {
    id: 'usr-3',
    userId: 'ADM-0001',
    name: 'Sarah Jenkins (You)',
    email: 'sjenkins@ar-imms.corp',
    role: 'Admin',
    status: 'Active',
    lastAuth: 'Current Session',
    initials: 'SJ',
    avatarUrl: 'https://lh3.googleusercontent.com/aida-public/AB6AXuD2Jfcm0LMS_16-EFLOQKlPg7UXCjzVu4nTB1dksjx2Wokw5cQ3o8mKTuxpVvajk5W_KDDcuZT84wq2e3GjuTH-J0Up0SW-P8L3VUbxiCWRroUjqHNuEWUnoesp57nSGHkYjQ5Otc8gEHQYhE-p6FEQv7NE8KFq28FW9ib2-D9ptXZXdEVwSNRVlFtFWy_fA2HKe0-hOsXlqExLtXLf3zOLHk67yolwVCg3MrddTuaXPHrFu37ZtVcT',
    isSelf: true
  },
  {
    id: 'usr-4',
    userId: 'TECH-4421',
    name: 'Robert King',
    email: 'rking@ar-imms.corp',
    role: 'Technician',
    status: 'Active',
    lastAuth: '2 hrs ago (Zone A)',
    initials: 'RK'
  },
  {
    id: 'usr-5',
    userId: 'TECH-1940',
    name: 'Elena Rostova',
    email: 'erostova@ar-imms.corp',
    role: 'Technician',
    status: 'Active',
    lastAuth: '4 hrs ago (Zone C)',
    initials: 'ER'
  },
  {
    id: 'usr-6',
    userId: 'TECH-0002',
    name: 'System Operator',
    email: 'operator@ar-imms.dc',
    role: 'Technician',
    status: 'Active',
    lastAuth: 'Current Session',
    initials: 'OP'
  },
  {
    id: 'usr-7',
    userId: 'ADM-0002',
    name: 'System Administrator',
    email: 'admin@ar-imms.dc',
    role: 'Admin',
    status: 'Active',
    lastAuth: 'Current Session',
    initials: 'AD'
  }
];

export const INITIAL_AUDIT_LOGS: AuditLogItem[] = [
  {
    id: 'audit-1',
    timestamp: '2023-10-27 14:32:01',
    user: 'jdoe@ar-imms.corp',
    userType: 'user',
    initials: 'JD',
    action: 'Acknowledged Alert',
    target: 'ALT-8492',
    ipAddress: '192.168.1.104',
    status: 'Success'
  },
  {
    id: 'audit-2',
    timestamp: '2023-10-27 14:28:45',
    user: 'SYSTEM_AUTO',
    userType: 'system',
    action: 'Deleted Node',
    target: 'RACK-B-04',
    ipAddress: '10.0.0.5 (Internal)',
    status: 'Critical'
  },
  {
    id: 'audit-3',
    timestamp: '2023-10-27 13:15:22',
    user: 'asmith@ar-imms.corp',
    userType: 'user',
    initials: 'AS',
    action: 'Updated Asset Config',
    target: 'SW-CORE-01',
    ipAddress: '192.168.1.42',
    status: 'Success'
  },
  {
    id: 'audit-4',
    timestamp: '2023-10-27 11:05:10',
    user: 'jdoe@ar-imms.corp',
    userType: 'user',
    initials: 'JD',
    action: 'Login Successful',
    ipAddress: '203.0.113.45',
    status: 'Success'
  },
  {
    id: 'audit-5',
    timestamp: '2023-10-27 10:59:55',
    user: 'Unknown',
    userType: 'unknown',
    action: 'Login Failed (Invalid Password)',
    ipAddress: '203.0.113.45',
    status: 'Warning'
  },
  {
    id: 'audit-6',
    timestamp: '2023-10-27 09:40:12',
    user: 'sjenkins@ar-imms.corp',
    userType: 'user',
    initials: 'SJ',
    action: 'Modified Policy: Tech Team Alpha',
    target: 'ROLE_TECH_WRITE',
    ipAddress: '192.168.1.10',
    status: 'Success'
  }
];

export const INITIAL_RACKS: Rack[] = [
  {
    id: 'rack-a1',
    name: 'A1',
    status: 'healthy',
    temperature: 32.5,
    powerDrawKw: 4.8,
    fanSpeedRpm: 3800,
    units: [
      { u: 38, name: 'Primary Compute Node 01', model: 'Dell PowerEdge R740 / Xeon Gold 6248R', status: 'healthy', temp: 38, cpu: 48, ram: 62, disk: 38, net: 28 },
      { u: 35, name: 'Secondary Compute Node 02', model: 'Dell PowerEdge R740 / Xeon Gold 6248R', status: 'healthy', temp: 42, cpu: 52, ram: 58, disk: 45, net: 34 },
      { u: 30, name: 'Database Primary Replica', model: 'HPE ProLiant DL380 Gen10', status: 'healthy', temp: 45, cpu: 45, ram: 54, disk: 52, net: 22 }
    ]
  },
  {
    id: 'rack-a2',
    name: 'A2',
    status: 'warning',
    temperature: 39.0,
    powerDrawKw: 5.2,
    fanSpeedRpm: 4200,
    units: [
      { u: 36, name: 'Application Web Gateway', model: 'Supermicro 1U TwinPro', status: 'healthy', temp: 39, cpu: 32, ram: 44, disk: 41, net: 45 },
      { u: 20, name: 'Log Aggregator & Pipeline', model: 'Dell PowerEdge R640', status: 'warning', temp: 58, cpu: 65, ram: 72, disk: 60, net: 38 }
    ]
  },
  {
    id: 'rack-b1',
    name: 'B1',
    status: 'healthy',
    temperature: 27.0,
    powerDrawKw: 2.2,
    fanSpeedRpm: 3200,
    units: [
      { u: 1, name: 'Edge Router B1', model: 'Juniper MX204', status: 'healthy', temp: 27, cpu: 22, ram: 35, disk: 12, net: 92 }
    ]
  }
];

export const MOCK_AVATAR_ADMIN = 'https://lh3.googleusercontent.com/aida-public/AB6AXuAWnQ4BM2uzfXr8UbWFvGqxk4suKWjYOMl2fEOfVHTx5jj6LSbQmz0nPc3pcBmLm-6ixPBftbFaSaJo7cvKX4lhRfg3MHt6025I-qqQ4Dr6x7TjaXsSNGuUfk7GAaLOJfKTjT-yBHbf2391zm04KHjZ6p2m8E2QOd8IeD0TBsUb3d2FYGFsnBSBE1wxzawzrBE2PgESpmwdBlEs3nsCpI0UFXp8A_Ks39NAZsOmiByt2yMO1mKKLLDm';
export const MOCK_QR_CODE_IMAGE = 'https://lh3.googleusercontent.com/aida-public/AB6AXuC5pECbkbrFyinwpuSEWhERNlG46XhgwGhlBT93KuVFK2vzvbXhgILcAMnX5tucQgyjpgpn1u1aSI6h7EQ1Uly4EeilBgr9ZpJ-Pb1DWHyEdzOnPv022oSkAVve1woGhsT9Nn3atXrGJ0yhtMgeXLgarUVuULjgMxbBjssKFXOB2kJ-94MEcisavT5U-dZvlhkt8VkEKnt2jJicQMcDmdzBvmTLRlHbkJBS7j2BYytd4amZhzCmYrBu';
export const MOCK_RACK_ISOMETRIC = 'https://lh3.googleusercontent.com/aida-public/AB6AXuDaBVm7rU4oSO5HPoaOiokH5S3cdFyqVf8LCL-Dz6eWHAI9fLggBDBDNMbJJw4mgylrLOUmkFbR5Q9_rFOkxfgudmH1LzWEaJD-XDJ8FpkjZh11KxsxtUXoVwGyy-zunIlfXl2h3NkFrxoxCU5m16ECpKW_oBxUbLxt-e9AzAHcCy5Yn502rHDHxyaktFdWMTLLDoDGsCn7eIq8z0__yz-tQH7CBCZJfANFl-Ur7AOuBxpITZy9fpzB';
export const MOCK_SYSTEM_NODE_ICON = 'https://lh3.googleusercontent.com/aida-public/AB6AXuA5vzpQN2mVcjmD09gCZn_UfbASNbiD508SzXogW23dVIfJ8kGbPVpDqsYyvW6CvEm9U-bafojENfTzRG6ksHpdQ7yPEJ9sRljk7Zm6YgxPx2ja2Sn-tI1k_TtgkdubW_E-n23Ev7y4WKl7y3Q1QhT9fINpXrPNQCck-QHGAiiE2CaXM1CiFNzZXivriIIdbUmMK4c6XCkxsLf5MA214P2od66QKXPFXX1zvQjPMUGfNF7jBcEyYZb_';
