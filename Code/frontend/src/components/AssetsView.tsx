import React, { useState } from 'react';
import { 
  Plus, 
  Search, 
  Filter, 
  Eye, 
  Printer, 
  Edit, 
  Download, 
  QrCode, 
  CheckCircle2, 
  AlertCircle, 
  Clock, 
  ShieldCheck,
  Check,
  Server,
  Sparkles,
  Cpu
} from 'lucide-react';
import { AssetItem } from '../types';
import { MOCK_QR_CODE_IMAGE } from '../data/mockData';

interface AssetsViewProps {
  assets: AssetItem[];
  onOpenNewAsset?: () => void;
  onOpenPrintModal?: (asset: AssetItem) => void;
  onPrintLabel?: (asset: AssetItem) => void;
  onEditAsset?: (asset: AssetItem) => void;
  onSelectAsset?: (asset: AssetItem) => void;
  onOpenNodeDetail?: (asset: AssetItem) => void;
  onOpenQRScanner?: () => void;
  searchQuery?: string;
  onSearchChange?: (q: string) => void;
}

export const AssetsView: React.FC<AssetsViewProps> = ({
  assets = [],
  onOpenNewAsset,
  onOpenPrintModal,
  onPrintLabel,
  onEditAsset,
  onSelectAsset,
  onOpenNodeDetail,
  onOpenQRScanner,
  searchQuery = '',
  onSearchChange
}) => {
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

  const handleDownloadSVG = () => {
    // Generate an authentic downloadable SVG asset tag with QR representation
    const svgContent = `
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 300 400" width="300" height="400">
  <rect width="100%" height="100%" fill="#ffffff" stroke="#0284c7" stroke-width="4" rx="12"/>
  <rect x="20" y="20" width="260" height="50" fill="#0f172a" rx="6"/>
  <text x="150" y="45" fill="#38bdf8" font-family="sans-serif" font-size="16" font-weight="bold" text-anchor="middle">AR-IMMS INDUSTRIAL MARKER</text>
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

  <text x="150" y="320" fill="#0f172a" font-family="sans-serif" font-size="18" font-weight="bold" text-anchor="middle">${selectedAsset.name}</text>
  <text x="150" y="345" fill="#0284c7" font-family="monospace" font-size="12" text-anchor="middle">GUID: ${selectedAsset.guid}</text>
  <text x="150" y="370" fill="#64748b" font-family="sans-serif" font-size="11" text-anchor="middle">${selectedAsset.uPosition} | ${selectedAsset.model}</text>
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
            <h1 className="text-xl md:text-2xl lg:text-3xl font-black text-white tracking-tight">Tài Sản & Mã Định Danh AR</h1>
            <span className="px-2 py-0.5 rounded-md text-[10px] font-mono font-bold bg-sky-500/10 text-sky-400 border border-sky-500/20">
              Hardware Registry
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-0.5">Quản trị cơ sở dữ liệu phần cứng và mã QR tương tác không gian AR HUD.</p>
        </div>

        {/* Filters and New Asset Button */}
        <div className="w-full md:w-auto flex flex-col sm:flex-row gap-3">
          <div className="md:hidden flex items-center bg-slate-900 rounded-xl px-4 py-2 border border-slate-700 focus-within:border-sky-500 transition-colors w-full">
            <Search className="w-4 h-4 text-slate-400 mr-2 shrink-0" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
              placeholder="Tìm kiếm tài sản, mã GUID, serial..."
              className="bg-transparent border-none focus:outline-none text-xs w-full text-white placeholder:text-slate-500"
            />
          </div>

          <div className="flex items-center bg-slate-900/90 rounded-xl px-3 py-2 border border-slate-700/80 hover:border-sky-500 transition-colors shadow-inner">
            <Filter className="w-4 h-4 text-slate-400 mr-2 shrink-0" />
            <select
              value={selectedRackFilter}
              onChange={(e) => setSelectedRackFilter(e.target.value)}
              className="bg-transparent border-none focus:outline-none text-xs font-semibold text-slate-200 cursor-pointer outline-none"
            >
              <option value="All Racks">Tất cả tủ Rack</option>
              <option value="Rack A1">Tủ Rack A1</option>
              <option value="Rack A2">Tủ Rack A2</option>
              <option value="Rack B1">Tủ Rack B1</option>
              <option value="Rack B2">Tủ Rack B2</option>
              <option value="Rack C1">Tủ Rack C1</option>
            </select>
          </div>

          {onOpenQRScanner && (
            <button
              onClick={onOpenQRScanner}
              className="bg-slate-800 hover:bg-slate-700 text-white px-4 py-2 rounded-xl text-xs font-bold flex items-center justify-center gap-2 transition-all shadow-sm cursor-pointer border border-slate-600 active:scale-95"
            >
              <QrCode className="w-4 h-4 text-emerald-400" />
              <span>Quét Mã QR</span>
            </button>
          )}

          <button
            onClick={onOpenNewAsset}
            className="bg-gradient-to-r from-sky-500 to-blue-600 hover:from-sky-400 hover:to-blue-500 text-white px-4 py-2 rounded-xl text-xs font-bold flex items-center justify-center gap-2 transition-all shadow-md shadow-sky-500/20 cursor-pointer active:scale-95"
          >
            <Plus className="w-4 h-4" />
            <span>Thêm Tài Sản Mới</span>
          </button>
        </div>
      </div>

      {/* Bento Grid Layout */}
      <div className="grid grid-cols-1 xl:grid-cols-12 gap-6">
        {/* Data Table Section (Spans 8 cols on XL) */}
        <div className="xl:col-span-8 glass-card rounded-2xl overflow-hidden flex flex-col h-[600px]">
          <div className="px-5 py-3.5 border-b border-slate-800/80 flex justify-between items-center bg-slate-900/60">
            <h2 className="text-sm font-bold text-white flex items-center gap-2">
              <Server className="w-4 h-4 text-sky-400" />
              Danh Mục Thiết Bị Phần Cứng
            </h2>
            <span className="text-xs font-mono font-bold bg-sky-500/15 text-sky-300 border border-sky-500/30 px-2.5 py-0.5 rounded-md">
              {filteredAssets.length} Nodes
            </span>
          </div>

          <div className="overflow-y-auto flex-1 p-2">
            <table className="w-full text-left border-collapse">
              <thead className="sticky top-0 bg-slate-900 z-10 border-b border-slate-800 shadow-sm">
                <tr>
                  <th className="p-3 text-[11px] font-bold text-slate-400 w-10"></th>
                  <th className="p-3 text-[11px] font-bold text-slate-400">Tên Thiết Bị</th>
                  <th className="p-3 text-[11px] font-bold text-slate-400">Dòng Máy (Model)</th>
                  <th className="p-3 text-[11px] font-bold text-slate-400">Vị Trí U-Rack</th>
                  <th className="p-3 text-[11px] font-bold text-slate-400">Trạng Thái QR</th>
                  <th className="p-3 text-[11px] font-bold text-slate-400 text-right">Thao Tác</th>
                </tr>
              </thead>
              <tbody className="text-xs divide-y divide-slate-800/60">
                {filteredAssets.map((asset) => {
                  const isSelected = asset.id === selectedAssetId;
                  const isActive = asset.qrStatus === 'Active';
                  const isMismatch = asset.qrStatus === 'Mismatch';

                  return (
                    <tr
                      key={asset.id}
                      onClick={() => setSelectedAssetId(asset.id)}
                      className={`
                        hover:bg-slate-800/50 transition-colors group cursor-pointer
                        ${isSelected ? 'bg-sky-500/15 border-l-2 border-l-sky-400' : ''}
                      `}
                    >
                      <td className="p-3 text-center">
                        <div className={`w-2 h-2 rounded-full inline-block ${
                          isActive ? 'bg-emerald-400 shadow-[0_0_6px_rgba(16,185,129,0.6)]' : isMismatch ? 'bg-rose-500 pulse-critical' : 'bg-slate-500'
                        }`} />
                      </td>
                      <td className="p-3 font-bold text-slate-100">{asset.name}</td>
                      <td className="p-3 text-slate-400 font-mono">{asset.model}</td>
                      <td className="p-3 text-slate-300 font-medium">{asset.uPosition}</td>
                      <td className="p-3">
                        {isActive ? (
                          <span className="inline-flex items-center gap-1 text-emerald-300 bg-emerald-500/20 border border-emerald-500/30 px-2 py-0.5 rounded-md text-[10px] font-bold">
                            <CheckCircle2 className="w-3 h-3" /> Hoạt động
                          </span>
                        ) : isMismatch ? (
                          <span className="inline-flex items-center gap-1 text-rose-300 bg-rose-500/20 border border-rose-500/30 px-2 py-0.5 rounded-md text-[10px] font-bold">
                            <AlertCircle className="w-3 h-3" /> Lệch vị trí
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 text-slate-400 bg-slate-800 px-2 py-0.5 rounded-md text-[10px] font-bold">
                            <Clock className="w-3 h-3" /> Chờ cấu hình
                          </span>
                        )}
                      </td>
                      <td className="p-3 text-right">
                        <div className="flex items-center justify-end gap-1.5 opacity-100 transition-opacity">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              setSelectedAssetId(asset.id);
                            }}
                            className="p-1.5 rounded-lg text-slate-400 hover:text-sky-300 hover:bg-sky-500/20 transition-colors cursor-pointer"
                            title="Kiểm tra mã AR"
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              onOpenPrintModal(asset);
                            }}
                            className="p-1.5 rounded-lg text-slate-400 hover:text-sky-300 hover:bg-sky-500/20 transition-colors cursor-pointer"
                            title="In nhãn QR"
                          >
                            <Printer className="w-4 h-4" />
                          </button>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              onEditAsset(asset);
                            }}
                            className="p-1.5 rounded-lg text-slate-400 hover:text-sky-300 hover:bg-sky-500/20 transition-colors cursor-pointer"
                            title="Chỉnh sửa thông số"
                          >
                            <Edit className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        {/* Contextual Panel (Spans 4 cols on XL) */}
        <div className="xl:col-span-4 flex flex-col gap-6">
          {/* AR Marker Preview Card */}
          <div className="glass-card rounded-2xl overflow-hidden flex flex-col relative">
            <div className="px-4 py-3 border-b border-slate-800/80 flex justify-between items-center bg-slate-900/60">
              <h3 className="text-xs font-bold text-white uppercase tracking-wider">Xem Trước Mã AR Marker</h3>
              <QrCode className="w-4 h-4 text-sky-400" />
            </div>

            <div className="p-6 flex flex-col items-center justify-center bg-[#060911] relative overflow-hidden">
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
                <div className="text-base font-black text-white mb-1">{selectedAsset.name}</div>
                <div className="text-xs font-mono text-sky-300 bg-sky-500/15 border border-sky-500/30 px-3 py-1 rounded-md inline-block">
                  GUID: {selectedAsset.guid}
                </div>
              </div>
            </div>

            <div className="p-3 bg-slate-900/90 border-t border-slate-800 flex justify-stretch gap-3">
              <button
                onClick={handleDownloadSVG}
                className="flex-1 bg-slate-800/80 hover:bg-slate-800 border border-slate-700 text-slate-200 px-4 py-2 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
              >
                {downloadSuccess ? (
                  <>
                    <Check className="w-3.5 h-3.5 text-emerald-400" />
                    <span className="text-emerald-300">Đã Lưu!</span>
                  </>
                ) : (
                  <>
                    <Download className="w-3.5 h-3.5 text-slate-400" />
                    <span>Tải File SVG</span>
                  </>
                )}
              </button>

              <button
                onClick={() => onOpenPrintModal(selectedAsset)}
                className="flex-1 bg-gradient-to-r from-sky-500 to-blue-600 hover:from-sky-400 hover:to-blue-500 text-white px-4 py-2 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-all shadow-md shadow-sky-500/20 cursor-pointer active:scale-95"
              >
                <Printer className="w-3.5 h-3.5" />
                <span>In Nhãn Mã</span>
              </button>
            </div>
          </div>

          {/* Asset Details Snippet */}
          <div className="glass-card rounded-2xl p-5 flex-1">
            <h3 className="text-xs font-bold text-white uppercase tracking-wider mb-3 border-b border-slate-800 pb-2">
              Thông Số Kỹ Thuật Phần Cứng
            </h3>

            <dl className="grid grid-cols-2 gap-y-3.5 gap-x-3 text-xs">
              <div>
                <dt className="text-slate-400 text-[11px] mb-0.5">Nhà Sản Xuất</dt>
                <dd className="text-slate-100 font-semibold">{selectedAsset.manufacturer}</dd>
              </div>

              <div>
                <dt className="text-slate-400 text-[11px] mb-0.5">Số Sê-ri (Serial)</dt>
                <dd className="text-sky-300 font-mono bg-slate-900 px-2 py-0.5 rounded border border-slate-800 inline-block text-[11px]">
                  {selectedAsset.serialNumber}
                </dd>
              </div>

              <div>
                <dt className="text-slate-400 text-[11px] mb-0.5">Ngày Lắp Đặt</dt>
                <dd className="text-slate-200 font-medium">{selectedAsset.installDate}</dd>
              </div>

              <div>
                <dt className="text-slate-400 text-[11px] mb-0.5">Công Suất Điện</dt>
                <dd className="text-slate-200 font-medium">{selectedAsset.powerDraw}</dd>
              </div>

              <div className="col-span-2">
                <dt className="text-slate-400 text-[11px] mb-1">Giao Diện Mạng</dt>
                <dd className="flex flex-wrap gap-1.5">
                  {selectedAsset.networkInterfaces.map((iface, idx) => (
                    <span key={idx} className="bg-slate-900 border border-slate-800 px-2 py-0.5 rounded text-[11px] font-mono text-slate-300">
                      {iface}
                    </span>
                  ))}
                </dd>
              </div>
            </dl>
          </div>
        </div>
      </div>
    </div>
  );
};
