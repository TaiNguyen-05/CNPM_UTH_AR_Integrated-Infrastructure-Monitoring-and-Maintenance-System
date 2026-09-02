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
  Check
} from 'lucide-react';
import { AssetItem } from '../types';
import { MOCK_QR_CODE_IMAGE } from '../data/mockData';

interface AssetsViewProps {
  assets: AssetItem[];
  onOpenNewAsset: () => void;
  onOpenPrintModal: (asset: AssetItem) => void;
  onEditAsset: (asset: AssetItem) => void;
  onOpenNodeDetail?: (asset: AssetItem) => void;
  onOpenQRScanner?: () => void;
  searchQuery: string;
  onSearchChange: (q: string) => void;
}

export const AssetsView: React.FC<AssetsViewProps> = ({
  assets,
  onOpenNewAsset,
  onOpenPrintModal,
  onEditAsset,
  onOpenNodeDetail,
  onOpenQRScanner,
  searchQuery,
  onSearchChange
}) => {
  const [selectedAssetId, setSelectedAssetId] = useState<string>(assets[0]?.id || 'asset-1');
  const [selectedRackFilter, setSelectedRackFilter] = useState<string>('All Racks');
  const [downloadSuccess, setDownloadSuccess] = useState<boolean>(false);

  const selectedAsset = assets.find(a => a.id === selectedAssetId) || assets[0];

  const filteredAssets = assets.filter(a => {
    const matchesRack = selectedRackFilter === 'All Racks' || a.rack === selectedRackFilter || a.uPosition.includes(selectedRackFilter);
    const matchesSearch = !searchQuery || 
      a.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      a.model.toLowerCase().includes(searchQuery.toLowerCase()) ||
      a.guid.toLowerCase().includes(searchQuery.toLowerCase()) ||
      a.serialNumber.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesRack && matchesSearch;
  });

  const handleDownloadSVG = () => {
    // Generate an authentic downloadable SVG asset tag with QR representation
    const svgContent = `
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 300 400" width="300" height="400">
  <rect width="100%" height="100%" fill="#ffffff" stroke="#0058be" stroke-width="4" rx="12"/>
  <rect x="20" y="20" width="260" height="50" fill="#0058be" rx="6"/>
  <text x="150" y="45" fill="#ffffff" font-family="sans-serif" font-size="16" font-weight="bold" text-anchor="middle">AR-IMMS INDUSTRIAL MARKER</text>
  <text x="150" y="62" fill="#d8e2ff" font-family="sans-serif" font-size="10" text-anchor="middle">DATACENTER ASSET TRACKING</text>
  
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
  <circle cx="150" cy="260" r="10" fill="#0058be"/>

  <text x="150" y="320" fill="#191c1e" font-family="sans-serif" font-size="18" font-weight="bold" text-anchor="middle">${selectedAsset.name}</text>
  <text x="150" y="345" fill="#0058be" font-family="monospace" font-size="12" text-anchor="middle">GUID: ${selectedAsset.guid}</text>
  <text x="150" y="370" fill="#727785" font-family="sans-serif" font-size="11" text-anchor="middle">${selectedAsset.uPosition} | ${selectedAsset.model}</text>
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
    <div className="p-4 md:p-6 max-w-[1600px] mx-auto flex flex-col gap-6">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-2xl lg:text-3xl font-bold text-[#191c1e] tracking-tight">Tài Sản & Mã Định Danh AR</h1>
          <p className="text-xs text-[#727785] mt-0.5">Quản trị cơ sở dữ liệu phần cứng và mã QR tương tác không gian AR.</p>
        </div>

        {/* Filters and New Asset Button */}
        <div className="w-full md:w-auto flex flex-col sm:flex-row gap-3">
          <div className="md:hidden flex items-center bg-white rounded-full px-4 py-2 border border-[#c2c6d6] focus-within:border-[#0058be] transition-colors w-full">
            <Search className="w-4 h-4 text-[#727785] mr-2 shrink-0" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
              placeholder="Tìm kiếm tài sản, mã GUID, số sê-ri..."
              className="bg-transparent border-none focus:outline-none text-xs w-full text-[#191c1e]"
            />
          </div>

          <div className="flex items-center bg-white rounded-lg px-3 py-2 border border-[#c2c6d6] hover:border-[#0058be] transition-colors shadow-xs">
            <Filter className="w-4 h-4 text-[#727785] mr-2 shrink-0" />
            <select
              value={selectedRackFilter}
              onChange={(e) => setSelectedRackFilter(e.target.value)}
              className="bg-transparent border-none focus:outline-none text-xs font-semibold text-[#191c1e] cursor-pointer outline-none"
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
              className="bg-[#1e293b] hover:bg-[#334155] text-white px-4 py-2 rounded-full text-xs font-bold flex items-center justify-center gap-2 transition-colors shadow-xs cursor-pointer border border-[#475569] active:scale-95"
            >
              <QrCode className="w-4 h-4 text-[#4edea3]" />
              Quét Mã QR
            </button>
          )}

          <button
            onClick={onOpenNewAsset}
            className="bg-[#0058be] text-white px-4 py-2 rounded-full text-xs font-bold flex items-center justify-center gap-2 hover:bg-[#2170e4] transition-colors shadow-xs cursor-pointer active:scale-95"
          >
            <Plus className="w-4 h-4" />
            Thêm Tài Sản Mới
          </button>
        </div>
      </div>

      {/* Bento Grid Layout */}
      <div className="grid grid-cols-1 xl:grid-cols-12 gap-6">
        {/* Data Table Section (Spans 8 cols on XL) */}
        <div className="xl:col-span-8 bg-white rounded-xl border border-[#c2c6d6] shadow-xs overflow-hidden flex flex-col h-[600px]">
          <div className="px-4 py-3.5 border-b border-[#c2c6d6] flex justify-between items-center bg-[#f8fafc]">
            <h2 className="text-sm font-bold text-[#191c1e]">Danh Mục Thiết Bị Phần Cứng</h2>
            <span className="text-xs font-bold bg-[#d0e1fb] text-[#004395] px-2.5 py-0.5 rounded-full">
              {filteredAssets.length} Thiết bị
            </span>
          </div>

          <div className="overflow-y-auto flex-1 p-2">
            <table className="w-full text-left border-collapse">
              <thead className="sticky top-0 bg-white z-10 border-b border-[#c2c6d6] shadow-2xs">
                <tr>
                  <th className="p-3 text-xs font-bold text-[#424754] w-10"></th>
                  <th className="p-3 text-xs font-bold text-[#424754]">Tên Thiết Bị</th>
                  <th className="p-3 text-xs font-bold text-[#424754]">Dòng Máy (Model)</th>
                  <th className="p-3 text-xs font-bold text-[#424754]">Vị Trí U-Rack</th>
                  <th className="p-3 text-xs font-bold text-[#424754]">Trạng Thái QR</th>
                  <th className="p-3 text-xs font-bold text-[#424754] text-right">Thao Tác</th>
                </tr>
              </thead>
              <tbody className="text-xs divide-y divide-[#c2c6d6]/60">
                {filteredAssets.map((asset) => {
                  const isSelected = asset.id === selectedAssetId;
                  const isActive = asset.qrStatus === 'Active';
                  const isMismatch = asset.qrStatus === 'Mismatch';

                  return (
                    <tr
                      key={asset.id}
                      onClick={() => setSelectedAssetId(asset.id)}
                      className={`
                        hover:bg-[#f2f4f6] transition-colors group cursor-pointer
                        ${isSelected ? 'bg-[#d8e2ff]/25 border-l-3 border-l-[#0058be]' : ''}
                      `}
                    >
                      <td className="p-3 text-center">
                        <div className={`w-2 h-2 rounded-full inline-block ${
                          isActive ? 'bg-[#00855b]' : isMismatch ? 'bg-[#ba1a1a] animate-pulse' : 'bg-[#727785]'
                        }`} />
                      </td>
                      <td className="p-3 font-bold text-[#191c1e]">{asset.name}</td>
                      <td className="p-3 text-[#424754] font-mono">{asset.model}</td>
                      <td className="p-3 text-[#424754]">{asset.uPosition}</td>
                      <td className="p-3">
                        {isActive ? (
                          <span className="inline-flex items-center gap-1 text-[#006947] bg-[#6ffbbe]/40 px-2 py-0.5 rounded text-[11px] font-bold">
                            <CheckCircle2 className="w-3.5 h-3.5" /> Hoạt động
                          </span>
                        ) : isMismatch ? (
                          <span className="inline-flex items-center gap-1 text-[#93000a] bg-[#ffdad6] px-2 py-0.5 rounded text-[11px] font-bold">
                            <AlertCircle className="w-3.5 h-3.5" /> Lệch vị trí
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 text-[#424754] bg-[#e0e3e5] px-2 py-0.5 rounded text-[11px] font-bold">
                            <Clock className="w-3.5 h-3.5" /> Chờ cấu hình
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
                            className="p-1 rounded text-[#424754] hover:text-[#0058be] hover:bg-[#d8e2ff] transition-colors cursor-pointer"
                            title="Kiểm tra mã AR"
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              onOpenPrintModal(asset);
                            }}
                            className="p-1 rounded text-[#424754] hover:text-[#0058be] hover:bg-[#d8e2ff] transition-colors cursor-pointer"
                            title="In nhãn QR"
                          >
                            <Printer className="w-4 h-4" />
                          </button>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              onEditAsset(asset);
                            }}
                            className="p-1 rounded text-[#424754] hover:text-[#0058be] hover:bg-[#d8e2ff] transition-colors cursor-pointer"
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
          <div className="bg-white rounded-xl border border-[#c2c6d6] shadow-xs overflow-hidden flex flex-col relative">
            <div className="px-4 py-3 border-b border-[#c2c6d6] flex justify-between items-center bg-[#f8fafc]">
              <h3 className="text-xs font-bold text-[#191c1e] uppercase tracking-wider">Xem Trước Mã AR Marker</h3>
              <QrCode className="w-4 h-4 text-[#727785]" />
            </div>

            <div className="p-6 flex flex-col items-center justify-center bg-[#f8fafc] relative overflow-hidden">
              {/* Pattern Background */}
              <div 
                className="absolute inset-0 opacity-10" 
                style={{
                  backgroundImage: 'radial-gradient(#0058be 1px, transparent 1px)',
                  backgroundSize: '16px 16px'
                }}
              />

              {/* QR Code Container with Frame */}
              <div 
                onClick={() => onOpenNodeDetail && onOpenNodeDetail(selectedAsset)}
                className="relative p-4 bg-white border-2 border-[#0058be] rounded-lg shadow-md mb-4 group cursor-pointer z-10 hover:shadow-lg transition-shadow"
                title="Nhấn để xem chỉ số & chi tiết máy chủ"
              >
                {/* Laser Scanning Animation */}
                <div className="absolute top-0 left-0 w-full h-[2px] bg-[#00855b] shadow-[0_0_8px_rgba(78,222,163,0.8)] animate-scan z-20" />
                
                <img
                  src={`https://api.qrserver.com/v1/create-qr-code/?size=250x250&data=${encodeURIComponent(
                    typeof window !== 'undefined' ? `${window.location.origin}/?node=${selectedAsset.id}` : `http://localhost:9999/?node=${selectedAsset.id}`
                  )}&margin=10`}
                  alt={`Mã QR ${selectedAsset.name}`}
                  className="w-44 h-44 object-contain"
                />

                {/* AR Corner Target Markers */}
                <div className="absolute top-2 left-2 w-4 h-4 border-t-2 border-l-2 border-[#0058be]" />
                <div className="absolute top-2 right-2 w-4 h-4 border-t-2 border-r-2 border-[#0058be]" />
                <div className="absolute bottom-2 left-2 w-4 h-4 border-b-2 border-l-2 border-[#0058be]" />
                <div className="absolute bottom-2 right-2 w-4 h-4 border-b-2 border-r-2 border-[#0058be]" />
              </div>

              <div className="text-center z-10">
                <div className="text-lg font-bold text-[#191c1e] mb-1">{selectedAsset.name}</div>
                <div className="text-xs font-mono text-[#0058be] bg-[#d8e2ff]/50 px-3 py-1 rounded inline-block">
                  GUID: {selectedAsset.guid}
                </div>
              </div>
            </div>

            <div className="p-3 bg-[#f2f4f6] border-t border-[#c2c6d6] flex justify-stretch gap-3">
              <button
                onClick={handleDownloadSVG}
                className="flex-1 bg-white border border-[#c2c6d6] text-[#191c1e] px-4 py-2 rounded-lg text-xs font-bold flex items-center justify-center gap-1.5 hover:bg-[#e0e3e5] transition-colors cursor-pointer shadow-2xs"
              >
                {downloadSuccess ? (
                  <>
                    <Check className="w-3.5 h-3.5 text-[#00855b]" />
                    Đã Lưu!
                  </>
                ) : (
                  <>
                    <Download className="w-3.5 h-3.5 text-[#727785]" />
                    Tải File SVG
                  </>
                )}
              </button>

              <button
                onClick={() => onOpenPrintModal(selectedAsset)}
                className="flex-1 bg-[#0058be] text-white px-4 py-2 rounded-lg text-xs font-bold flex items-center justify-center gap-1.5 hover:bg-[#2170e4] transition-colors shadow-xs cursor-pointer active:scale-95"
              >
                <Printer className="w-3.5 h-3.5" />
                In Nhãn Mã
              </button>
            </div>
          </div>

          {/* Asset Details Snippet */}
          <div className="bg-white rounded-xl border border-[#c2c6d6] shadow-xs p-4 flex-1">
            <h3 className="text-xs font-bold text-[#191c1e] uppercase tracking-wider mb-3 border-b border-[#c2c6d6] pb-2">
              Thông Số Kỹ Thuật Phần Cứng
            </h3>

            <dl className="grid grid-cols-2 gap-y-3 gap-x-2 text-xs">
              <div>
                <dt className="text-[#727785] text-[11px] mb-0.5">Nhà Sản Xuất</dt>
                <dd className="text-[#191c1e] font-semibold">{selectedAsset.manufacturer}</dd>
              </div>

              <div>
                <dt className="text-[#727785] text-[11px] mb-0.5">Số Sê-ri (Serial)</dt>
                <dd className="text-[#191c1e] font-mono bg-[#f2f4f6] px-1.5 py-0.5 rounded inline-block">
                  {selectedAsset.serialNumber}
                </dd>
              </div>

              <div>
                <dt className="text-[#727785] text-[11px] mb-0.5">Ngày Lắp Đặt</dt>
                <dd className="text-[#191c1e] font-medium">{selectedAsset.installDate}</dd>
              </div>

              <div>
                <dt className="text-[#727785] text-[11px] mb-0.5">Công Suất Điện</dt>
                <dd className="text-[#191c1e] font-medium">{selectedAsset.powerDraw}</dd>
              </div>

              <div className="col-span-2">
                <dt className="text-[#727785] text-[11px] mb-1">Giao Diện Mạng</dt>
                <dd className="flex flex-wrap gap-1.5">
                  {selectedAsset.networkInterfaces.map((iface, idx) => (
                    <span key={idx} className="bg-[#eceef0] border border-[#c2c6d6] px-2 py-0.5 rounded text-[11px] font-mono text-[#191c1e]">
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
