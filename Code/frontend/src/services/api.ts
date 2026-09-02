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

import { supabase } from './supabase';

export const ApiService = {
  // Nodes CRUD
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

  async createNode(node: Partial<ServerNodeDto>): Promise<{ data: ServerNodeDto }> {
    if (supabase) {
      try {
        const { data, error } = await supabase.from('server_nodes').insert([{
          id: node.id,
          rack_id: node.rack_id || 'rack-a1',
          name: node.name,
          u_start: node.u_start || 1,
          u_height: node.u_size || 2,
          ip_address: node.ip_address || '192.168.1.100',
          model: node.model,
          qr_code_payload: node.qr_code || `ar-imms://node/${node.id}`,
          status: (node.status || 'HEALTHY').toUpperCase()
        }]).select().single();
        if (!error && data) return { data: data as any };
      } catch (err) {
        console.warn('Supabase createNode fallback:', err);
      }
    }
    return request<{ data: ServerNodeDto }>('/nodes', {
      method: 'POST',
      body: JSON.stringify(node)
    });
  },

  async updateNode(id: string, node: Partial<ServerNodeDto>): Promise<{ data: ServerNodeDto }> {
    if (supabase) {
      try {
        const updatePayload: any = {};
        if (node.name) updatePayload.name = node.name;
        if (node.model) updatePayload.model = node.model;
        if (node.status) updatePayload.status = node.status.toUpperCase();
        const { data, error } = await supabase.from('server_nodes').update(updatePayload).eq('id', id).select().single();
        if (!error && data) return { data: data as any };
      } catch (err) {
        console.warn('Supabase updateNode fallback:', err);
      }
    }
    return request<{ data: ServerNodeDto }>(`/nodes/${id}`, {
      method: 'PUT',
      body: JSON.stringify(node)
    });
  },

  async deleteNode(id: string): Promise<{ success: boolean; message: string }> {
    if (supabase) {
      try {
        const { error } = await supabase.from('server_nodes').delete().eq('id', id);
        if (!error) return { success: true, message: 'Node deleted successfully' };
      } catch (err) {
        console.warn('Supabase deleteNode fallback:', err);
      }
    }
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
    if (supabase) {
      try {
        const { data, error } = await supabase.from('racks').select('*');
        if (!error && data && data.length > 0) {
          const mapped: RackDto[] = data.map((r: any) => ({
            id: r.id,
            name: r.name,
            location: r.room_name || 'Server Room 01',
            total_u: r.total_u || 42,
            status: 'healthy',
            power_draw_kw: 6.4,
            max_power_kw: r.power_limit_kw || 15.0
          }));
          return { data: mapped };
        }
      } catch (err) {
        console.warn('Supabase getRacks fallback:', err);
      }
    }
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

  // Tickets CRUD
  async getTickets(status?: string): Promise<{ data: TicketDto[] }> {
    if (supabase) {
      try {
        let query = supabase.from('maintenance_tickets').select('*');
        if (status) query = query.eq('status', status.toUpperCase());
        const { data, error } = await query;
        if (!error && data && data.length > 0) {
          const mapped: TicketDto[] = data.map((t: any) => ({
            id: t.id,
            title: t.title,
            description: t.description,
            node_id: t.server_node_id,
            priority: (t.priority || 'medium').toLowerCase() as any,
            status: (t.status || 'open').toLowerCase() as any,
            assigned_to_id: t.assigned_technician_name || t.assigned_technician_id,
            created_at: t.created_at || new Date().toISOString()
          }));
          return { data: mapped };
        }
      } catch (err) {
        console.warn('Supabase getTickets fallback:', err);
      }
    }
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
    if (supabase) {
      try {
        let query = supabase.from('users').select('*');
        if (role) query = query.eq('role', role.toUpperCase());
        const { data, error } = await query;
        if (!error && data && data.length > 0) {
          const mapped: UserDto[] = data.map((u: any) => ({
            id: u.id,
            email: u.email,
            full_name: u.full_name,
            role: (u.role || 'viewer').toLowerCase() as any,
            status: u.status === 'APPROVED' ? 'active' : u.status === 'PENDING_APPROVAL' ? 'pending' : 'locked'
          }));
          return { data: mapped };
        }
      } catch (err) {
        console.warn('Supabase getUsers fallback:', err);
      }
    }
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

