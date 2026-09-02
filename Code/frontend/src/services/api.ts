/**
 * AR-IMMS Backend REST API Client
 * Clean Architecture & OOP Endpoints connection
 */

const API_BASE_URL = '/api';

export interface ServerNodeDto {
  id: string;
  name: string;
  model: string;
  rack_id: string;
  u_start: number;
  u_size: number;
  status: 'healthy' | 'warning' | 'critical' | 'offline';
  ip_address: string;
  cpu_usage: number;
  ram_usage: number;
  ram_total_gb: number;
  disk_temp_c: number;
  qr_code: string;
  workload_count: number;
  tags: string[];
}

export interface RackDto {
  id: string;
  name: string;
  location: string;
  total_u: number;
  status: string;
  power_draw_kw: number;
  max_power_kw: number;
}

export interface AlertDto {
  id: string;
  node_id: string;
  type: string;
  severity: 'critical' | 'warning' | 'info';
  message: string;
  status: 'active' | 'acknowledged' | 'resolved';
  created_at: string;
}

export interface TicketDto {
  id: string;
  title: string;
  description: string;
  node_id: string;
  priority: 'low' | 'medium' | 'high' | 'critical';
  status: 'open' | 'in_progress' | 'resolved' | 'closed';
  assigned_to_id?: string;
  created_at: string;
}

export interface UserDto {
  id: string;
  email: string;
  full_name: string;
  role: 'admin' | 'operator' | 'technician' | 'viewer';
  status: 'active' | 'pending' | 'locked';
}

async function request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const url = `${API_BASE_URL}${endpoint}`;
  const defaultHeaders = {
    'Content-Type': 'application/json',
    'Accept': 'application/json'
  };

  const response = await fetch(url, {
    ...options,
    headers: {
      ...defaultHeaders,
      ...options.headers
    }
  });

  if (!response.ok) {
    const errorBody = await response.text();
    throw new Error(`API Error ${response.status}: ${errorBody || response.statusText}`);
  }

  return response.json();
}

export const ApiService = {
  // Nodes CRUD
  async getNodes(rackId?: string): Promise<{ data: ServerNodeDto[] }> {
    const query = rackId ? `?rack_id=${encodeURIComponent(rackId)}` : '';
    return request<{ data: ServerNodeDto[] }>(`/nodes${query}`);
  },

  async getNode(id: string): Promise<{ data: ServerNodeDto }> {
    return request<{ data: ServerNodeDto }>(`/nodes/${id}`);
  },

  async createNode(node: Partial<ServerNodeDto>): Promise<{ data: ServerNodeDto }> {
    return request<{ data: ServerNodeDto }>('/nodes', {
      method: 'POST',
      body: JSON.stringify(node)
    });
  },

  async updateNode(id: string, node: Partial<ServerNodeDto>): Promise<{ data: ServerNodeDto }> {
    return request<{ data: ServerNodeDto }>(`/nodes/${id}`, {
      method: 'PUT',
      body: JSON.stringify(node)
    });
  },

  async deleteNode(id: string): Promise<{ success: boolean; message: string }> {
    return request<{ success: boolean; message: string }>(`/nodes/${id}`, {
      method: 'DELETE'
    });
  },

  async updateTelemetry(id: string, telemetry: { cpu_usage?: number; ram_usage?: number; disk_temp_c?: number }): Promise<{ data: ServerNodeDto }> {
    return request<{ data: ServerNodeDto }>(`/nodes/${id}/telemetry`, {
      method: 'POST',
      body: JSON.stringify(telemetry)
    });
  },

  // Racks CRUD
  async getRacks(): Promise<{ data: RackDto[] }> {
    return request<{ data: RackDto[] }>('/racks');
  },

  async createRack(rack: Partial<RackDto>): Promise<{ data: RackDto }> {
    return request<{ data: RackDto }>('/racks', {
      method: 'POST',
      body: JSON.stringify(rack)
    });
  },

  // Alerts CRUD
  async getAlerts(status?: string): Promise<{ data: AlertDto[] }> {
    const query = status ? `?status=${encodeURIComponent(status)}` : '';
    return request<{ data: AlertDto[] }>(`/alerts${query}`);
  },

  async createAlert(alert: Partial<AlertDto>): Promise<{ data: AlertDto }> {
    return request<{ data: AlertDto }>('/alerts', {
      method: 'POST',
      body: JSON.stringify(alert)
    });
  },

  async acknowledgeAlert(id: string, operatorId?: string): Promise<{ data: AlertDto }> {
    return request<{ data: AlertDto }>(`/alerts/${id}/acknowledge`, {
      method: 'POST',
      body: JSON.stringify({ operator_id: operatorId || 'current_operator' })
    });
  },

  async resolveAlert(id: string, resolutionNotes?: string): Promise<{ data: AlertDto }> {
    return request<{ data: AlertDto }>(`/alerts/${id}/resolve`, {
      method: 'POST',
      body: JSON.stringify({ notes: resolutionNotes || 'Resolved via Dashboard' })
    });
  },

  // Tickets CRUD
  async getTickets(status?: string): Promise<{ data: TicketDto[] }> {
    const query = status ? `?status=${encodeURIComponent(status)}` : '';
    return request<{ data: TicketDto[] }>(`/tickets${query}`);
  },

  async createTicket(ticket: Partial<TicketDto>): Promise<{ data: TicketDto }> {
    return request<{ data: TicketDto }>('/tickets', {
      method: 'POST',
      body: JSON.stringify(ticket)
    });
  },

  async assignTicket(id: string, technicianId: string): Promise<{ data: TicketDto }> {
    return request<{ data: TicketDto }>(`/tickets/${id}/assign`, {
      method: 'POST',
      body: JSON.stringify({ technician_id: technicianId })
    });
  },

  // Users CRUD
  async getUsers(role?: string): Promise<{ data: UserDto[] }> {
    const query = role ? `?role=${encodeURIComponent(role)}` : '';
    return request<{ data: UserDto[] }>(`/users${query}`);
  },

  async createUser(user: Partial<UserDto>): Promise<{ data: UserDto }> {
    return request<{ data: UserDto }>('/users', {
      method: 'POST',
      body: JSON.stringify(user)
    });
  },

  async approveUser(id: string, approverRole: string = 'admin'): Promise<{ data: UserDto }> {
    return request<{ data: UserDto }>(`/users/${id}/approve`, {
      method: 'POST',
      body: JSON.stringify({ approver_role: approverRole })
    });
  }
};

export const arImmsApi = ApiService;

