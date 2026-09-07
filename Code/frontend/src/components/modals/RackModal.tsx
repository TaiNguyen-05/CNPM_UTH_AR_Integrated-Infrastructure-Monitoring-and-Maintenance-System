import React, { useState } from 'react';
import { X, Layers, Plus, Check } from 'lucide-react';
import { Rack } from '../../types';

interface RackModalProps {
  rackToEdit?: Rack | null;
  onClose: () => void;
  onSave: (rack: Rack) => void;
}

export const RackModal: React.FC<RackModalProps> = ({ rackToEdit, onClose, onSave }) => {
  const [name, setName] = useState(rackToEdit ? rackToEdit.name : 'A3');
  const [zone, setZone] = useState(rackToEdit?.zone || 'Khu Vực Alpha (Zone 1)');
  const [location, setLocation] = useState(rackToEdit?.location || 'Data Hall 1 - Row A');
  const [status, setStatus] = useState<'healthy' | 'warning' | 'critical'>(rackToEdit?.status || 'healthy');
  const [powerDrawKw, setPowerDrawKw] = useState(rackToEdit?.powerDrawKw || 2.4);
  const [temperature, setTemperature] = useState(rackToEdit?.temperature || 26);
  const [coolingStatus, setCoolingStatus] = useState(rackToEdit?.coolingStatus || 'Optimal');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name) return;

    const savedRack: Rack = {
      id: rackToEdit ? rackToEdit.id : `rack-${name.toLowerCase().replace(/\s+/g, '-')}-${Date.now()}`,
      name,
      status,
      units: rackToEdit ? rackToEdit.units : [
        { u: 1, name: `PDU Main ${name}`, model: 'APC 8000', status: 'healthy', temp: 24, cpu: 10, ram: 15, disk: 8, net: 10 },
        { u: 2, name: `TOR Switch ${name}`, model: 'Cisco Nexus', status: 'healthy', temp: 28, cpu: 30, ram: 40, disk: 12, net: 65 },
        { u: 3, name: `Compute Node ${name}-01`, model: 'Dell R750', status: 'healthy', temp: 32, cpu: 45, ram: 55, disk: 30, net: 28 }
      ],
      zone,
      location,
      temperature,
      powerDrawKw,
      coolingStatus,
      fanSpeedRpm: 3200,
      networkBandwidthGbps: 10.5,
      nodesCount: rackToEdit ? rackToEdit.units.length : 3,
      activeAlertsCount: status === 'critical' ? 1 : 0
    };

    onSave(savedRack);
    onClose();
  };

  return (
    <div className="modal-overlay">
      <div className="modal-box max-w-md">
        <div className="modal-header">
          <div className="modal-title">
            <Layers className="w-5 h-5 text-[#38bdf8]" />
            <h3>
              {rackToEdit ? `Chỉnh Sửa Tủ Rack: ${rackToEdit.name}` : 'Thêm Tủ Rack Mới'}
            </h3>
          </div>
          <button onClick={onClose} className="modal-close-btn">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4 text-xs">
          <div>
            <label className="form-label">Mã / Tên Tủ Rack</label>
            <input
              type="text"
              required
              placeholder="VD: A3 hoặc Rack C2"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="form-input font-mono"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="form-label">Khu Vực (Zone)</label>
              <select
                value={zone}
                onChange={(e) => setZone(e.target.value)}
                className="form-select"
              >
                <option value="Khu Vực Alpha (Zone 1)" className="bg-[#11161b]">Khu Vực Alpha (Zone 1)</option>
                <option value="Khu Vực Beta (Zone 2)" className="bg-[#11161b]">Khu Vực Beta (Zone 2)</option>
                <option value="Khu Vực Gamma (Zone 3)" className="bg-[#11161b]">Khu Vực Gamma (Zone 3)</option>
              </select>
            </div>
            <div>
              <label className="form-label">Trạng Thái Vận Hành</label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value as any)}
                className="form-select"
              >
                <option value="healthy" className="bg-[#11161b]">🟢 Bình thường (Healthy)</option>
                <option value="warning" className="bg-[#11161b]">🟡 Cảnh báo nhiệt (Warning)</option>
                <option value="critical" className="bg-[#11161b]">🔴 Quá tải / Lỗi (Critical)</option>
              </select>
            </div>
          </div>

          <div>
            <label className="form-label">Vị Trí Cụ Thể Trong Phòng Máy</label>
            <input
              type="text"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              placeholder="VD: Data Hall 1 - Row A - Pos 04"
              className="form-input"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="form-label">Công Suất Nguồn (kW)</label>
              <input
                type="number"
                step="0.1"
                value={powerDrawKw}
                onChange={(e) => setPowerDrawKw(parseFloat(e.target.value) || 0)}
                className="form-input font-mono"
              />
            </div>
            <div>
              <label className="form-label">Nhiệt Độ Trung Bình (°C)</label>
              <input
                type="number"
                value={temperature}
                onChange={(e) => setTemperature(parseInt(e.target.value) || 0)}
                className="form-input font-mono"
              />
            </div>
          </div>

          <div className="modal-footer">
            <button
              type="button"
              onClick={onClose}
              className="btn-secondary"
            >
              Hủy Bỏ
            </button>
            <button
              type="submit"
              className="btn-primary"
            >
              {rackToEdit ? <Check className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
              {rackToEdit ? 'Lưu Thay Đổi Tủ Rack' : 'Tạo Tủ Rack Mới'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
