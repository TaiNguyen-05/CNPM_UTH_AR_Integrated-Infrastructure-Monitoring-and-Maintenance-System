import React, { useState } from 'react';
import { 
  Plus, 
  Search, 
  Filter, 
  Eye, 
  Printer, 
  Edit, 
  Trash2,
  Download, 
  QrCode, 
  CheckCircle2, 
  AlertCircle, 
  Clock, 
  ShieldCheck,
  Check,
  Server,
  Sparkles,
  Cpu,
  Layers,
  Activity,
  Zap,
  Thermometer
} from 'lucide-react';
import { AssetItem, Rack } from '../types';

interface AssetsViewProps {
  assets: AssetItem[];
  racks?: Rack[];
  onOpenNewAsset?: () => void;
  onOpenPrintModal?: (asset: AssetItem) => void;
  onPrintLabel?: (asset: AssetItem) => void;
  onEditAsset?: (asset: AssetItem) => void;
  onDeleteAsset?: (assetId: string) => void;
  onOpenNewRack?: () => void;
  onEditRack?: (rack: Rack) => void;
  onDeleteRack?: (rackId: string) => void;
  onSelectAsset?: (asset: AssetItem) => void;
  onOpenNodeDetail?: (asset: AssetItem) => void;
  searchQuery?: string;
  onSearchChange?: (q: string) => void;
}

export const AssetsView: React.FC<AssetsViewProps> = ({
  assets = [],
  racks = [],
  onOpenNewAsset,
  onOpenPrintModal,
  onPrintLabel,
  onEditAsset,
  onDeleteAsset,
  onOpenNewRack,
  onEditRack,
  onDeleteRack,
  onSelectAsset,
  onOpenNodeDetail,
  searchQuery = '',
  onSearchChange
}) => {
  const [activeTab, setActiveTab] = useState<'devices' | 'racks'>('devices');
  const [selectedAssetId, setSelectedAssetId] = useState<string>(assets[0]?.id || 'asset-1');
  const [selectedRackFilter, setSelectedRackFilter] = useState<string>('All Racks');
  const [downloadSuccess, setDownloadSuccess] = useState<boolean>(false);
  const [localSearch, setLocalSearch] = useState<string>('');

  const currentSearch = searchQuery || localSearch;
  const selectedAsset = assets.find(a => a.id === selectedAssetId) || assets[0];

  const filteredAssets = assets.filter(a => {
    const matchesRack = selectedRackFilter === 'All Racks' || a.rack === selectedRackFilter || a.uPosition.includes(selectedRackFilter);
    const q = currentSearch.toLowerCase();
    const matchesSearch = !q || 
      (a.name && a.name.toLowerCase().includes(q)) ||
      (a.model && a.model.toLowerCase().includes(q)) ||
      (a.guid && a.guid.toLowerCase().includes(q)) ||
      (a.serialNumber && a.serialNumber.toLowerCase().includes(q));
    return matchesRack && matchesSearch;
  });

  const filteredRacks = racks.filter(r => {
    const q = currentSearch.toLowerCase();
    return !q || 
      r.name.toLowerCase().includes(q) || 
      (r.zone && r.zone.toLowerCase().includes(q)) ||
      (r.location && r.location.toLowerCase().includes(q));
  });

  const handleDownloadSVG = () => {
    if (!selectedAsset) return;
    const svgContent = `
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 300 400" width="300" height="400">
  <rect width="100%" height="100%" fill="#080b0e" stroke="#00f0ff" stroke-width="4" rx="12"/>
  <rect x="20" y="20" width="260" height="50" fill="#11161b" rx="6"/>
  <text x="150" y="45" fill="#38bdf8" font-family="sans-serif" font-size="14" font-weight="bold" text-anchor="middle">AR-IMMS INDUSTRIAL MARKER</text>
  <text x="150" y="62" fill="#94a3b8" font-family="sans-serif" font-size="10" text-anchor="middle">DATACENTER ASSET TRACKING</text>
  
  <rect x="50" y="90" width="200" height="200" fill="#ffffff" stroke="#191c1e" stroke-width="2"/>
  <rect x="65" y="105" width="40" height="40" fill="#000000"/>
  <rect x="75" y="115" width="20" height="20" fill="#ffffff"/>
  <rect x="195" y="105" width="40" height="40" fill="#000000"/>
  <rect x="205" y="115" width="20" height="20" fill="#ffffff"/>
  <rect x="65" y="235" width="40" height="40" fill="#000000"/>
  <rect x="75" y="245" width="20" height="20" fill="#ffffff"/>
  
  <rect x="130" y="120" width="40" height="40" fill="#000000"/>
  <rect x="120" y="180" width="60" height="30" fill="#000000"/>
  <rect x="190" y="220" width="45" height="45" fill="#000000"/>
  <circle cx="150" cy="260" r="10" fill="#0284c7"/>

  <text x="150" y="320" fill="#ffffff" font-family="sans-serif" font-size="16" font-weight="bold" text-anchor="middle">${selectedAsset.name}</text>
  <text x="150" y="345" fill="#38bdf8" font-family="monospace" font-size="12" text-anchor="middle">GUID: ${selectedAsset.guid}</text>
  <text x="150" y="370" fill="#94a3b8" font-family="sans-serif" font-size="11" text-anchor="middle">${selectedAsset.uPosition} | ${selectedAsset.model}</text>
</svg>`;

    const blob = new Blob([svgContent], { type: 'image/svg+xml' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `AR_MARKER_${selectedAsset.name}_${selectedAsset.guid}.svg`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);

    setDownloadSuccess(true);
    setTimeout(() => setDownloadSuccess(false), 2500);
  };

  return (
    <div className="p-4 md:p-6 max-w-[1600px] mx-auto flex flex-col gap-6 text-slate-100">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl md:text-2xl lg:text-3xl font-black text-white tracking-tight font-mono">
              Quản Trị Tủ Rack & Thiết Bị AR
            </h1>
            <span className="px-2 py-0.5 rounded-md text-[10px] font-mono font-bold bg-sky-500/10 text-sky-400 border border-sky-500/20">
              CRUD Registry
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-0.5">
            Quản lý phần cứng, cấu hình tủ Rack, hiển thị và in tem mã định danh không gian AR.
          </p>
        </div>

        {/* Tab switcher & Actions */}
        <div className="w-full md:w-auto flex flex-wrap items-center gap-3">
          {/* Sub-tab Switcher */}
          <div className="flex bg-[#11161b] p-1 rounded-xl border border-[#222c37]">
            <button
              onClick={() => setActiveTab('devices')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                activeTab === 'devices'
                  ? 'bg-[#38bdf8] text-[#080b0e] shadow-sm'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <Server className="w-3.5 h-3.5" />
              <span>Thiết Bị ({assets.length})</span>
            </button>
            <button
              onClick={() => setActiveTab('racks')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                activeTab === 'racks'
                  ? 'bg-[#38bdf8] text-[#080b0e] shadow-sm'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <Layers className="w-3.5 h-3.5" />
              <span>Tủ Rack ({racks.length})</span>
            </button>
          </div>

          {activeTab === 'devices' && (
            <div className="flex items-center bg-[#11161b] rounded-xl px-3 py-1.5 border border-[#222c37] hover:border-[#38bdf8] transition-colors">
              <Filter className="w-3.5 h-3.5 text-slate-400 mr-2 shrink-0" />
              <select
                value={selectedRackFilter}
                onChange={(e) => setSelectedRackFilter(e.target.value)}
                className="bg-transparent border-none focus:outline-none text-xs font-semibold text-slate-200 cursor-pointer outline-none"
              >
                <option value="All Racks" className="bg-[#11161b]">Tất cả tủ Rack</option>
                {racks.map(r => (
                  <option key={r.id} value={r.name.includes('Rack') ? r.name : `Rack ${r.name}`} className="bg-[#11161b]">
                    {r.name.includes('Rack') ? r.name : `Tủ Rack ${r.name}`}
                  </option>
                ))}
              </select>
            </div>
          )}

          {activeTab === 'devices' ? (
            <button
              onClick={onOpenNewAsset}
              className="bg-[#38bdf8] hover:bg-[#7dd3fc] text-[#080b0e] px-4 py-2 rounded-xl text-xs font-bold font-mono flex items-center justify-center gap-1.5 transition-all shadow-md cursor-pointer active:scale-95"
            >
              <Plus className="w-4 h-4" />
              <span>Thêm Thiết Bị Mới</span>
            </button>
          ) : (
            <button
              onClick={onOpenNewRack}
              className="bg-[#38bdf8] hover:bg-[#7dd3fc] text-[#080b0e] px-4 py-2 rounded-xl text-xs font-bold font-mono flex items-center justify-center gap-1.5 transition-all shadow-md cursor-pointer active:scale-95"
            >
              <Plus className="w-4 h-4" />
              <span>Thêm Tủ Rack Mới</span>
            </button>
          )}
        </div>
      </div>

      {activeTab === 'devices' ? (
        /* Bento Grid Layout for Devices */
        <div className="grid grid-cols-1 xl:grid-cols-12 gap-6">
          {/* Data Table Section (Spans 8 cols on XL) */}
          <div className="xl:col-span-8 bg-[#0c1015] border border-[#222c37] rounded-2xl overflow-hidden flex flex-col h-[600px]">
            <div className="px-5 py-3.5 border-b border-[#222c37] flex justify-between items-center bg-[#11161b]">
              <h2 className="text-xs font-bold text-white flex items-center gap-2 font-mono uppercase tracking-wider">
                <Server className="w-4 h-4 text-[#38bdf8]" />
                Danh Mục Thiết Bị Phần Cứng
              </h2>
              <span className="text-xs font-mono font-bold bg-sky-500/15 text-sky-300 border border-sky-500/30 px-2.5 py-0.5 rounded-md">
                {filteredAssets.length} Nodes
              </span>
            </div>

            <div className="overflow-y-auto flex-1 p-2">
              <table className="w-full text-left border-collapse">
                <thead className="sticky top-0 bg-[#11161b] z-10 border-b border-[#222c37] shadow-sm">
                  <tr>
                    <th className="p-3 text-[11px] font-bold text-slate-400 w-10"></th>
                    <th className="p-3 text-[11px] font-bold text-slate-400">Tên Thiết Bị</th>
                    <th className="p-3 text-[11px] font-bold text-slate-400">Dòng Máy (Model)</th>
                    <th className="p-3 text-[11px] font-bold text-slate-400">Vị Trí U-Rack</th>
                    <th className="p-3 text-[11px] font-bold text-slate-400">Trạng Thái QR</th>
                    <th className="p-3 text-[11px] font-bold text-slate-400 text-right">Thao Tác CRUD</th>
                  </tr>
                </thead>
                <tbody className="text-xs divide-y divide-[#1e2733]">
                  {filteredAssets.map((asset) => {
                    const isSelected = asset.id === selectedAssetId;
                    const isActive = asset.qrStatus === 'Active';
                    const isMismatch = asset.qrStatus === 'Mismatch';

                    return (
                      <tr
                        key={asset.id}
                        onClick={() => setSelectedAssetId(asset.id)}
                        className={`
                          hover:bg-[#161d24] transition-colors group cursor-pointer
                          ${isSelected ? 'bg-[#38bdf8]/10 border-l-2 border-l-[#38bdf8]' : ''}
                        `}
                      >
                        <td className="p-3 text-center">
                          <div className={`w-2 h-2 rounded-full inline-block ${
                            isActive ? 'bg-emerald-400 shadow-[0_0_6px_rgba(52,211,153,0.8)]' : isMismatch ? 'bg-rose-500 pulse-critical' : 'bg-slate-500'
                          }`} />
                        </td>
                        <td className="p-3 font-bold text-white font-mono">{asset.name}</td>
                        <td className="p-3 text-slate-300 font-mono text-[11px]">{asset.model}</td>
                        <td className="p-3 text-slate-300 font-medium">{asset.uPosition}</td>
                        <td className="p-3">
                          {isActive ? (
                            <span className="inline-flex items-center gap-1 text-emerald-300 bg-emerald-500/10 border border-emerald-500/20 px-2 py-0.5 rounded-md text-[10px] font-bold">
                              <CheckCircle2 className="w-3 h-3" /> Sẵn sàng AR
                            </span>
                          ) : isMismatch ? (
                            <span className="inline-flex items-center gap-1 text-rose-300 bg-rose-500/10 border border-rose-500/20 px-2 py-0.5 rounded-md text-[10px] font-bold">
                              <AlertCircle className="w-3 h-3" /> Lệch vị trí
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 text-slate-400 bg-slate-800 px-2 py-0.5 rounded-md text-[10px] font-bold">
                              <Clock className="w-3 h-3" /> Chờ cấu hình
                            </span>
                          )}
                        </td>
                        <td className="p-3 text-right">
                          <div className="flex items-center justify-end gap-1.5">
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                setSelectedAssetId(asset.id);
                                if (onOpenNodeDetail) onOpenNodeDetail(asset);
                              }}
                              className="p-1.5 rounded-lg text-slate-400 hover:text-[#38bdf8] hover:bg-[#38bdf8]/10 transition-colors cursor-pointer"
                              title="Xem chi tiết & mã QR"
                            >
                              <Eye className="w-4 h-4" />
                            </button>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                if (onOpenPrintModal) onOpenPrintModal(asset);
                              }}
                              className="p-1.5 rounded-lg text-slate-400 hover:text-[#38bdf8] hover:bg-[#38bdf8]/10 transition-colors cursor-pointer"
                              title="In tem mã QR"
                            >
                              <Printer className="w-4 h-4" />
                            </button>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                if (onEditAsset) onEditAsset(asset);
                              }}
                              className="p-1.5 rounded-lg text-slate-400 hover:text-amber-400 hover:bg-amber-500/10 transition-colors cursor-pointer"
                              title="Chỉnh sửa thiết bị"
                            >
                              <Edit className="w-4 h-4" />
                            </button>
                            {onDeleteAsset && (
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  if (window.confirm(`Xác nhận xóa thiết bị: ${asset.name}?`)) {
                                    onDeleteAsset(asset.id);
                                  }
                                }}
                                className="p-1.5 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 transition-colors cursor-pointer"
                                title="Xóa thiết bị"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>

          {/* Contextual Panel (Spans 4 cols on XL) - Show QR & Hardware Details */}
          <div className="xl:col-span-4 flex flex-col gap-6">
            {/* AR Marker Preview Card */}
            {selectedAsset && (
              <div className="bg-[#0c1015] border border-[#222c37] rounded-2xl overflow-hidden flex flex-col relative">
                <div className="px-4 py-3 border-b border-[#222c37] flex justify-between items-center bg-[#11161b]">
                  <h3 className="text-xs font-bold text-white uppercase tracking-wider font-mono">
                    Mã Định Danh AR Không Gian
                  </h3>
                  <QrCode className="w-4 h-4 text-[#38bdf8]" />
                </div>

                <div className="p-6 flex flex-col items-center justify-center bg-[#080b0e] relative overflow-hidden">
                  {/* Pattern Background */}
                  <div 
                    className="absolute inset-0 opacity-15" 
                    style={{
                      backgroundImage: 'radial-gradient(#38bdf8 1px, transparent 1px)',
                      backgroundSize: '16px 16px'
                    }}
                  />

                  {/* QR Code Container with Frame */}
                  <div 
                    onClick={() => onOpenNodeDetail && onOpenNodeDetail(selectedAsset)}
                    className="relative p-3 bg-[#11161b] border border-[#222c37] rounded-xl shadow-2xl mb-4 group cursor-pointer z-10 hover:border-[#38bdf8]/60 hover:scale-105 transition-all"
                    title="Nhấn để xem chỉ số & chi tiết máy chủ"
                  >
                    {/* Laser Scanning Animation */}
                    <div className="absolute top-0 left-0 w-full h-[2px] bg-emerald-400 shadow-[0_0_10px_rgba(52,211,153,1)] animate-scan z-20" />
                    
                    <div className="bg-white p-2 rounded-lg">
                      <img
                        src={`https://api.qrserver.com/v1/create-qr-code/?size=250x250&data=${encodeURIComponent(
                          typeof window !== 'undefined' ? `${window.location.origin}/?node=${selectedAsset.id}` : `http://localhost:9999/?node=${selectedAsset.id}`
                        )}&margin=10`}
                        alt={`Mã QR ${selectedAsset.name}`}
                        className="w-40 h-40 object-contain rounded"
                      />
                    </div>

                    {/* AR Corner Target Markers */}
                    <div className="absolute top-2 left-2 w-4 h-4 border-t-2 border-l-2 border-sky-500" />
                    <div className="absolute top-2 right-2 w-4 h-4 border-t-2 border-r-2 border-sky-500" />
                    <div className="absolute bottom-2 left-2 w-4 h-4 border-b-2 border-l-2 border-sky-500" />
                    <div className="absolute bottom-2 right-2 w-4 h-4 border-b-2 border-r-2 border-sky-500" />
                  </div>

                  <div className="text-center z-10">
                    <div className="text-base font-black text-white mb-1 font-mono">{selectedAsset.name}</div>
                    <div className="text-xs font-mono text-sky-300 bg-sky-500/15 border border-sky-500/30 px-3 py-1 rounded-md inline-block">
                      GUID: {selectedAsset.guid}
                    </div>
                  </div>
                </div>

                <div className="p-3 bg-[#11161b] border-t border-[#222c37] flex justify-stretch gap-3">
                  <button
                    onClick={handleDownloadSVG}
                    className="flex-1 bg-[#161d24] hover:bg-[#222c37] border border-[#222c37] text-slate-200 px-4 py-2 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                  >
                    {downloadSuccess ? (
                      <>
                        <Check className="w-3.5 h-3.5 text-emerald-400" />
                        <span className="text-emerald-300 font-mono">Đã Lưu!</span>
                      </>
                    ) : (
                      <>
                        <Download className="w-3.5 h-3.5 text-slate-400" />
                        <span className="font-mono">Tải SVG QR</span>
                      </>
                    )}
                  </button>

                  <button
                    onClick={() => onOpenPrintModal && onOpenPrintModal(selectedAsset)}
                    className="flex-1 bg-[#38bdf8] hover:bg-[#7dd3fc] text-[#080b0e] px-4 py-2 rounded-xl text-xs font-bold font-mono flex items-center justify-center gap-1.5 transition-all shadow-md cursor-pointer active:scale-95"
                  >
                    <Printer className="w-3.5 h-3.5" />
                    <span>In Nhãn Tem</span>
                  </button>
                </div>
              </div>
            )}

            {/* Asset Details Snippet */}
            {selectedAsset && (
              <div className="bg-[#0c1015] border border-[#222c37] rounded-2xl p-5 flex-1">
                <h3 className="text-xs font-bold text-white uppercase tracking-wider mb-3 border-b border-[#222c37] pb-2 font-mono">
                  Thông Số Kỹ Thuật Chi Tiết
                </h3>

                <dl className="grid grid-cols-2 gap-y-3.5 gap-x-3 text-xs">
                  <div>
                    <dt className="text-slate-400 text-[11px] mb-0.5">Nhà Sản Xuất</dt>
                    <dd className="text-white font-semibold">{selectedAsset.manufacturer}</dd>
                  </div>

                  <div>
                    <dt className="text-slate-400 text-[11px] mb-0.5">Số Sê-ri (Serial)</dt>
                    <dd className="text-sky-300 font-mono bg-[#11161b] px-2 py-0.5 rounded border border-[#222c37] inline-block text-[11px]">
                      {selectedAsset.serialNumber}
                    </dd>
                  </div>

                  <div>
                    <dt className="text-slate-400 text-[11px] mb-0.5">Ngày Lắp Đặt</dt>
                    <dd className="text-slate-300 font-medium">{selectedAsset.installDate}</dd>
                  </div>

                  <div>
                    <dt className="text-slate-400 text-[11px] mb-0.5">Công Suất Điện</dt>
                    <dd className="text-slate-300 font-medium">{selectedAsset.powerDraw}</dd>
                  </div>

                  <div className="col-span-2">
                    <dt className="text-slate-400 text-[11px] mb-1">Giao Diện Mạng (IP)</dt>
                    <dd className="flex flex-wrap gap-1.5">
                      {selectedAsset.networkInterfaces.map((iface, idx) => (
                        <span key={idx} className="bg-[#11161b] border border-[#222c37] px-2 py-0.5 rounded text-[11px] font-mono text-slate-300">
                          {iface}
                        </span>
                      ))}
                    </dd>
                  </div>
                </dl>
              </div>
            )}
          </div>
        </div>
      ) : (
        /* Rack Management CRUD View */
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredRacks.map(rack => {
            const isCritical = rack.status === 'critical';
            const isWarning = rack.status === 'warning';

            return (
              <div 
                key={rack.id}
                className="bg-[#0c1015] border border-[#222c37] rounded-2xl overflow-hidden flex flex-col hover:border-[#38bdf8]/50 transition-all p-5 shadow-lg"
              >
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <div className="flex items-center gap-2">
                      <Layers className="w-5 h-5 text-[#38bdf8]" />
                      <h3 className="font-bold text-lg text-white font-mono">
                        {rack.name.includes('Rack') ? rack.name : `Tủ Rack ${rack.name}`}
                      </h3>
                    </div>
                    <div className="text-xs text-slate-400 mt-1">{rack.zone || 'Khu Vực Alpha (Zone 1)'}</div>
                  </div>

                  <span className={`px-2.5 py-1 rounded-md text-[10px] font-bold uppercase font-mono border ${
                    isCritical 
                      ? 'bg-rose-500/10 text-rose-400 border-rose-500/30' 
                      : isWarning 
                      ? 'bg-amber-500/10 text-amber-400 border-amber-500/30' 
                      : 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'
                  }`}>
                    {rack.status}
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-3 mb-4 text-xs bg-[#11161b] p-3 rounded-xl border border-[#222c37]">
                  <div className="flex items-center gap-2">
                    <Server className="w-4 h-4 text-slate-400" />
                    <div>
                      <div className="text-[10px] text-slate-400">Thiết Bị (Units)</div>
                      <div className="font-bold text-white font-mono">{rack.units ? rack.units.length : 5} Slots</div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <Thermometer className="w-4 h-4 text-[#ffb03a]" />
                    <div>
                      <div className="text-[10px] text-slate-400">Nhiệt Độ TB</div>
                      <div className="font-bold text-white font-mono">{rack.temperature || 28}°C</div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <Zap className="w-4 h-4 text-emerald-400" />
                    <div>
                      <div className="text-[10px] text-slate-400">Công Suất</div>
                      <div className="font-bold text-white font-mono">{rack.powerDrawKw || 2.4} kW</div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <Activity className="w-4 h-4 text-[#38bdf8]" />
                    <div>
                      <div className="text-[10px] text-slate-400">Vị Trí Phòng</div>
                      <div className="font-bold text-white font-mono text-[11px] truncate">{rack.location || 'Data Hall 1'}</div>
                    </div>
                  </div>
                </div>

                {/* Rack Units List preview */}
                <div className="flex-1 mb-4">
                  <div className="text-[11px] font-bold text-slate-400 mb-2 uppercase tracking-wider">Danh Sách Server Trong Tủ:</div>
                  <div className="space-y-1.5 max-h-32 overflow-y-auto pr-1">
                    {rack.units && rack.units.map(unit => (
                      <div key={unit.u} className="flex justify-between items-center text-xs py-1 px-2 rounded bg-[#161d24] border border-[#222c37]/50">
                        <span className="font-mono text-slate-300 truncate">U{unit.u}: {unit.name}</span>
                        <span className="text-[10px] font-mono text-slate-400">{unit.temp}°C</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Actions */}
                <div className="pt-3 border-t border-[#222c37] flex justify-end gap-2">
                  <button
                    onClick={() => onEditRack && onEditRack(rack)}
                    className="px-3 py-1.5 bg-[#161d24] hover:bg-[#222c37] text-slate-200 border border-[#222c37] rounded-lg text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer"
                  >
                    <Edit className="w-3.5 h-3.5 text-amber-400" />
                    <span>Sửa Tủ</span>
                  </button>

                  {onDeleteRack && (
                    <button
                      onClick={() => {
                        if (window.confirm(`Xác nhận xóa tủ rack ${rack.name}?`)) {
                          onDeleteRack(rack.id);
                        }
                      }}
                      className="px-3 py-1.5 bg-rose-500/10 hover:bg-rose-500/20 text-rose-300 border border-rose-500/30 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      <span>Xóa</span>
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
