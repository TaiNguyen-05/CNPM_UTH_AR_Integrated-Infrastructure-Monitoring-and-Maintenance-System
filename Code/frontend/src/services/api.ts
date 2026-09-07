/**
 * AR-IMMS Backend REST API Client
 * Clean Architecture & OOP Endpoints connection
 */

import { supabase } from './supabase';

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
  server_node_id: string;
  title: string;
  description?: string;
  priority: 'low' | 'medium' | 'high' | 'critical';
  status: 'created' | 'assigned' | 'in_progress' | 'resolved' | 'closed';
  alert_id?: string;
  assigned_technician_id?: string;
  assigned_technician_name?: string;
  ar_action_logs_json?: string;
  created_at: string;
  updated_at?: string;
  resolved_at?: string;
  closed_at?: string;
  resolution_notes?: string;
}

export interface UserDto {
  id: string;
  email: string;
  full_name: string;
  role: string;
  status: string;
  department?: string;
  phone_number?: string;
  avatar?: string;
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
  // ==========================================
  // NODES CRUD
  // ==========================================
  async getNodes(rackId?: string): Promise<{ data: ServerNodeDto[] }> {
    if (supabase) {
      try {
        let query = supabase.from('server_nodes').select('*');
        if (rackId) query = query.eq('rack_id', rackId);
        const { data, error } = await query;
        if (!error && data && data.length > 0) {
          const mapped: ServerNodeDto[] = data.map((n: any) => {
            let metrics: any = {};
            try { metrics = typeof n.metrics_json === 'string' ? JSON.parse(n.metrics_json) : (n.metrics_json || {}); } catch(e) {}
            return {
              id: n.id,
              name: n.name,
              model: n.model || 'Dell PowerEdge R740',
              rack_id: n.rack_id,
              u_start: n.u_start,
              u_size: n.u_height || 2,
              status: (n.status || 'healthy').toLowerCase() as any,
              ip_address: n.ip_address,
              cpu_usage: metrics.cpu || 45,
              ram_usage: metrics.ram || 60,
              ram_total_gb: n.ram_total_gb || 64,
              disk_temp_c: metrics.temp || 42,
              qr_code: n.qr_code_payload || `ar-imms://node/${n.id}`,
              workload_count: 3,
              tags: ['compute', 'production']
            };
          });
          return { data: mapped };
        }
      } catch (err) {
        console.warn('Supabase getNodes fallback:', err);
      }
    }
    const query = rackId ? `?rack_id=${encodeURIComponent(rackId)}` : '';
    return request<{ data: ServerNodeDto[] }>(`/nodes${query}`);
  },

  async getNode(id: string): Promise<{ data: ServerNodeDto }> {
    if (supabase) {
      try {
        const { data, error } = await supabase.from('server_nodes').select('*').eq('id', id).single();
        if (!error && data) {
          let metrics: any = {};
          try { metrics = typeof data.metrics_json === 'string' ? JSON.parse(data.metrics_json) : (data.metrics_json || {}); } catch(e) {}
          return {
            data: {
              id: data.id,
              name: data.name,
              model: data.model || 'Dell PowerEdge R740',
              rack_id: data.rack_id,
              u_start: data.u_start,
              u_size: data.u_height || 2,
              status: (data.status || 'healthy').toLowerCase() as any,
              ip_address: data.ip_address,
              cpu_usage: metrics.cpu || 45,
              ram_usage: metrics.ram || 60,
              ram_total_gb: data.ram_total_gb || 64,
              disk_temp_c: metrics.temp || 42,
              qr_code: data.qr_code_payload || `ar-imms://node/${data.id}`,
              workload_count: 3,
              tags: ['compute', 'production']
            }
          };
        }
      } catch (err) {
        console.warn('Supabase getNode fallback:', err);
      }
    }
    return request<{ data: ServerNodeDto }>(`/nodes/${id}`);
  },

  async createNode(node: Partial<ServerNodeDto> & { qr_code_payload?: string; u_height?: number }): Promise<{ data: ServerNodeDto }> {
    const payload = {
      id: node.id,
      name: node.name,
      model: node.model || 'Standard Compute Server',
      rack_id: node.rack_id || 'rack-a1',
      u_start: node.u_start || 1,
      u_height: node.u_height || node.u_size || 2,
      ip_address: node.ip_address || '192.168.1.100',
      status: (node.status || 'HEALTHY').toUpperCase(),
      qr_code_payload: node.qr_code_payload || node.qr_code || `ar-imms://node/${node.id}`
    };
    return request<{ data: ServerNodeDto }>('/nodes', {
      method: 'POST',
      body: JSON.stringify(payload)
    });
  },

  async updateNode(id: string, node: Partial<ServerNodeDto> & { qr_code_payload?: string; u_height?: number }): Promise<{ data: ServerNodeDto }> {
    const payload: any = {};
    if (node.name) payload.name = node.name;
    if (node.model) payload.model = node.model;
    if (node.status) payload.status = node.status.toUpperCase();
    if (node.ip_address) payload.ip_address = node.ip_address;
    if (node.u_start) payload.u_start = node.u_start;
    if (node.u_height || node.u_size) payload.u_height = node.u_height || node.u_size;
    if (node.rack_id) payload.rack_id = node.rack_id;
    if (node.qr_code_payload || node.qr_code) payload.qr_code_payload = node.qr_code_payload || node.qr_code;
    return request<{ data: ServerNodeDto }>(`/nodes/${id}`, {
      method: 'PUT',
      body: JSON.stringify(payload)
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

  // ==========================================
  // RACKS CRUD
  // ==========================================
  async getRacks(): Promise<{ data: RackDto[] }> {
    return request<{ data: RackDto[] }>('/racks');
  },

  async createRack(rack: Partial<RackDto> & { code?: string; room_name?: string; power_limit_kw?: number }): Promise<{ data: RackDto }> {
    const payload = {
      id: rack.id,
      name: rack.name,
      code: rack.code || rack.id?.toUpperCase() || `RACK-${Date.now().toString().slice(-4)}`,
      room_name: rack.room_name || rack.location || 'Server Room 01',
      total_u: rack.total_u || 42,
      power_limit_kw: rack.power_limit_kw || rack.max_power_kw || rack.power_draw_kw || 15.0
    };
    return request<{ data: RackDto }>('/racks', {
      method: 'POST',
      body: JSON.stringify(payload)
    });
  },

  async updateRack(id: string, rack: Partial<RackDto> & { code?: string; room_name?: string; power_limit_kw?: number }): Promise<{ data: RackDto }> {
    return request<{ data: RackDto }>(`/racks/${id}`, {
      method: 'PUT',
      body: JSON.stringify(rack)
    });
  },

  async deleteRack(id: string): Promise<{ success: boolean; message: string }> {
    return request<{ success: boolean; message: string }>(`/racks/${id}`, {
      method: 'DELETE'
    });
  },

  // ==========================================
  // ALERTS CRUD
  // ==========================================
  async getAlerts(status?: string): Promise<{ data: AlertDto[] }> {
    if (supabase) {
      try {
        let query = supabase.from('alerts').select('*');
        if (status) query = query.eq('status', status.toUpperCase());
        const { data, error } = await query;
        if (!error && data && data.length > 0) {
          const mapped: AlertDto[] = data.map((a: any) => ({
            id: a.id,
            node_id: a.server_node_id,
            type: a.metric_name || 'temperature',
            severity: (a.severity || 'warning').toLowerCase() as any,
            message: a.message || a.title,
            status: a.status === 'RESOLVED' ? 'resolved' : a.status === 'ACKNOWLEDGED' ? 'acknowledged' : 'active',
            created_at: a.created_at || new Date().toISOString()
          }));
          return { data: mapped };
        }
      } catch (err) {
        console.warn('Supabase getAlerts fallback:', err);
      }
    }
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

  // ==========================================
  // TICKETS CRUD & LIFECYCLE
  // ==========================================
  async getTickets(status?: string, techId?: string, nodeId?: string): Promise<{ data: any[] }> {
    const params = new URLSearchParams();
    if (status) params.append('status', status);
    if (techId) params.append('technician_id', techId);
    if (nodeId) params.append('node_id', nodeId);
    const queryString = params.toString() ? `?${params.toString()}` : '';
    return request<{ data: any[] }>(`/tickets${queryString}`);
  },

  async createTicket(ticket: {
    server_node_id: string;
    title: string;
    description?: string;
    priority?: string;
    alert_id?: string;
    assigned_technician_id?: string;
    assigned_technician_name?: string;
  }): Promise<{ data: any; message?: string }> {
    return request<{ data: any; message?: string }>('/tickets', {
      method: 'POST',
      body: JSON.stringify(ticket)
    });
  },

  async assignTicket(id: string, technicianId: string, technicianName?: string): Promise<{ data: any; message?: string }> {
    return request<{ data: any; message?: string }>(`/tickets/${id}/assign`, {
      method: 'POST',
      body: JSON.stringify({ technician_id: technicianId, technician_name: technicianName })
    });
  },

  async addArLog(id: string, action: string, details?: Record<string, any>): Promise<{ data: any; message?: string }> {
    return request<{ data: any; message?: string }>(`/tickets/${id}/ar-log`, {
      method: 'POST',
      body: JSON.stringify({ action, details })
    });
  },

  async resolveTicket(id: string, notes?: string): Promise<{ data: any; message?: string }> {
    return request<{ data: any; message?: string }>(`/tickets/${id}/resolve`, {
      method: 'POST',
      body: JSON.stringify({ notes })
    });
  },

  async closeTicket(id: string): Promise<{ data: any; message?: string }> {
    return request<{ data: any; message?: string }>(`/tickets/${id}/close`, {
      method: 'POST'
    });
  },

  async deleteTicket(id: string): Promise<{ message?: string }> {
    return request<{ message?: string }>(`/tickets/${id}`, {
      method: 'DELETE'
    });
  },

  // ==========================================
  // USERS CRUD & AUTH
  // ==========================================
  async getUsers(role?: string): Promise<{ data: any[] }> {
    const query = role ? `?role=${encodeURIComponent(role)}` : '';
    return request<{ data: any[] }>(`/users${query}`);
  },

  async createUser(user: Partial<UserDto>): Promise<{ data: UserDto }> {
    return request<{ data: UserDto }>('/users', {
      method: 'POST',
      body: JSON.stringify(user)
    });
  },

  async googleLogin(data: { email: string; full_name: string; avatar?: string }): Promise<{ data: any; message?: string }> {
    return request<{ data: any; message?: string }>('/users/google', {
      method: 'POST',
      body: JSON.stringify(data)
    });
  },

  async approveUser(userId: string): Promise<{ data: any; message?: string }> {
    return request<{ data: any; message?: string }>(`/users/${userId}/approve`, {
      method: 'POST'
    });
  },

  async updateUserRole(userId: string, role: string): Promise<{ data: any; message?: string }> {
    return request<{ data: any; message?: string }>(`/users/${userId}/role`, {
      method: 'POST',
      body: JSON.stringify({ role })
    });
  },

  async lockUser(userId: string): Promise<{ data: any; message?: string }> {
    return request<{ data: any; message?: string }>(`/users/${userId}/lock`, {
      method: 'POST'
    });
  },

  async unlockUser(userId: string): Promise<{ data: any; message?: string }> {
    return request<{ data: any; message?: string }>(`/users/${userId}/unlock`, {
      method: 'POST'
    });
  },

  async deleteUser(userId: string): Promise<{ message?: string }> {
    return request<{ message?: string }>(`/users/${userId}`, {
      method: 'DELETE'
    });
  },

  async testSendAlertEmail(targetEmail?: string): Promise<{ data: any; message?: string }> {
    return request<{ data: any; message?: string }>('/users/test-email', {
      method: 'POST',
      body: JSON.stringify({ email: targetEmail })
    });
  },
};

export const arImmsApi = ApiService;

