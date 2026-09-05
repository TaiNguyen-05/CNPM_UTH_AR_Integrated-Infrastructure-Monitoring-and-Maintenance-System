import React, { useState } from 'react';
import { X, Server, QrCode, Plus } from 'lucide-react';
import { AssetItem } from '../../types';

interface NewAssetModalProps {
  onClose: () => void;
  onSave: (asset: AssetItem) => void;
}

export const NewAssetModal: React.FC<NewAssetModalProps> = ({ onClose, onSave }) => {
  const [name, setName] = useState('');
  const [model, setModel] = useState('');
  const [rack, setRack] = useState('Rack A1');
  const [uPosition, setUPosition] = useState('U05-06');
  const [manufacturer, setManufacturer] = useState('Dell Technologies');
  const [serialNumber, setSerialNumber] = useState('');
  const [powerDraw, setPowerDraw] = useState('420W');
  const [ipAddress, setIpAddress] = useState('10.0.1.55');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !model) return;

    const randomGuid = `${Math.random().toString(36).substring(2, 6)}-${Math.random().toString(36).substring(2, 6)}-${Math.random().toString(36).substring(2, 6)}`;
    
    const newAsset: AssetItem = {
      id: `asset-${Date.now()}`,
      name,
      model,
      rack,
      uPosition: `${rack}, ${uPosition}`,
      qrStatus: 'Active',
      guid: randomGuid,
      manufacturer,
      serialNumber: serialNumber || `SN-${Math.floor(100000 + Math.random() * 900000)}`,
      installDate: new Date().toISOString().slice(0, 10),
      powerDraw: `${powerDraw} (Trung bình)`,
      networkInterfaces: [`eth0: ${ipAddress}`, 'eth1: 10.0.2.55']
    };

    onSave(newAsset);
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-[#080b0e] rounded-xl border border-[#222c37] shadow-2xl w-full max-w-lg overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        <div className="px-6 py-4 bg-[#11161b] border-b border-[#222c37] flex justify-between items-center">
          <div className="flex items-center gap-2">
            <Server className="w-5 h-5 text-[#38bdf8]" />
            <h3 className="font-bold text-base text-white tracking-wide">Đăng Ký Tài Sản Phần Cứng Mới</h3>
          </div>
          <button 
            onClick={onClose}
            className="p-1 rounded-md text-slate-400 hover:text-white hover:bg-[#161d24] cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Tên Máy Chủ / Thiết Bị (Hostname)</label>
            <input
              type="text"
              required
              placeholder="VD: SRV-COMPUTE-08C"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-3 py-2 bg-[#161d24] border border-[#222c37] text-white rounded-lg text-sm focus:outline-none focus:border-[#38bdf8] font-mono"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Model Phần Cứng</label>
              <input
                type="text"
                required
                placeholder="VD: Dell PowerEdge R750"
                value={model}
                onChange={(e) => setModel(e.target.value)}
                className="w-full px-3 py-2 bg-[#161d24] border border-[#222c37] text-white rounded-lg text-sm focus:outline-none focus:border-[#38bdf8]"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Nhà Sản Xuất</label>
              <input
                type="text"
                value={manufacturer}
                onChange={(e) => setManufacturer(e.target.value)}
                className="w-full px-3 py-2 bg-[#161d24] border border-[#222c37] text-white rounded-lg text-sm focus:outline-none focus:border-[#38bdf8]"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Vị Trí Tủ Rack</label>
              <select
                value={rack}
                onChange={(e) => setRack(e.target.value)}
                className="w-full px-3 py-2 bg-[#161d24] border border-[#222c37] text-white rounded-lg text-sm cursor-pointer focus:border-[#38bdf8]"
              >
                <option value="Rack A1" className="bg-[#11161b]">Tủ Rack A1</option>
                <option value="Rack A2" className="bg-[#11161b]">Tủ Rack A2</option>
                <option value="Rack B1" className="bg-[#11161b]">Tủ Rack B1</option>
                <option value="Rack B2" className="bg-[#11161b]">Tủ Rack B2</option>
                <option value="Rack C1" className="bg-[#11161b]">Tủ Rack C1</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Vị Trí Khoang (U-Slot)</label>
              <input
                type="text"
                value={uPosition}
                onChange={(e) => setUPosition(e.target.value)}
                placeholder="VD: U10-12"
                className="w-full px-3 py-2 bg-[#161d24] border border-[#222c37] text-white rounded-lg text-sm focus:outline-none focus:border-[#38bdf8]"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Số Serial (Serial Number)</label>
              <input
                type="text"
                value={serialNumber}
                onChange={(e) => setSerialNumber(e.target.value)}
                placeholder="VD: DELL-99214X"
                className="w-full px-3 py-2 bg-[#161d24] border border-[#222c37] text-white rounded-lg text-sm font-mono focus:outline-none focus:border-[#38bdf8]"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Địa Chỉ IP (eth0)</label>
              <input
                type="text"
                value={ipAddress}
                onChange={(e) => setIpAddress(e.target.value)}
                placeholder="10.0.1.X"
                className="w-full px-3 py-2 bg-[#161d24] border border-[#222c37] text-white rounded-lg text-sm font-mono focus:outline-none focus:border-[#38bdf8]"
              />
            </div>
          </div>

          <div className="pt-4 border-t border-[#222c37] flex justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border border-[#222c37] text-slate-400 font-bold text-xs rounded-lg hover:bg-[#161d24] hover:text-white cursor-pointer"
            >
              Hủy Bỏ
            </button>
            <button
              type="submit"
              className="px-5 py-2 bg-[#38bdf8] text-[#080b0e] font-bold text-xs rounded-lg hover:bg-[#7dd3fc] flex items-center gap-1.5 shadow-xs cursor-pointer active:scale-95 transition-colors"
            >
              <Plus className="w-4 h-4" />
              Tạo Mã AR & Đăng Ký
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
