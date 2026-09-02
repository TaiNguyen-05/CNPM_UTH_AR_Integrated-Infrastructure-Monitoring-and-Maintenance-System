import React from 'react';
import { X, Printer, Check, QrCode } from 'lucide-react';
import { AssetItem } from '../../types';
import { MOCK_QR_CODE_IMAGE } from '../../data/mockData';

interface PrintLabelModalProps {
  asset: AssetItem;
  onClose: () => void;
}

export const PrintLabelModal: React.FC<PrintLabelModalProps> = ({ asset, onClose }) => {
  const handlePrint = () => {
    window.print();
  };

  const directScanUrl = typeof window !== 'undefined'
    ? `${window.location.origin}/?node=${asset.id}`
    : `http://localhost:9999/?node=${asset.id}`;

  const qrImageUrl = `https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${encodeURIComponent(directScanUrl)}&margin=10`;

  return (
    <div className="fixed inset-0 bg-black/40 backdrop-blur-xs z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl border border-[#c2c6d6] shadow-2xl w-full max-w-md overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        <div className="px-6 py-4 bg-[#f8fafc] border-b border-[#c2c6d6] flex justify-between items-center">
          <div className="flex items-center gap-2">
            <Printer className="w-5 h-5 text-[#0058be]" />
            <h3 className="font-bold text-base text-[#191c1e]">In Thẻ Định Danh AR Công Nghiệp</h3>
          </div>
          <button 
            onClick={onClose}
            className="p-1 rounded-full text-[#727785] hover:text-[#191c1e] hover:bg-[#e0e3e5] cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 flex flex-col items-center">
          {/* Printable Sticker Template */}
          <div className="w-full border-2 border-dashed border-[#0058be] rounded-xl p-4 bg-white flex flex-col items-center text-center shadow-xs mb-4">
            <div className="w-full bg-[#0058be] text-white py-1 rounded text-xs font-black uppercase tracking-wider mb-3">
              ĐIỂM NEO THEO DÕI AR-IMMS
            </div>

            <img
              src={qrImageUrl}
              alt={`Mã QR ${asset.name}`}
              className="w-40 h-40 object-contain mb-2 border border-slate-100 rounded-lg p-1"
            />

            <div className="font-bold text-sm text-[#191c1e]">{asset.name}</div>
            <div className="text-xs font-mono text-[#0058be] font-bold">MÃ GUID: {asset.guid}</div>
            <div className="text-xs text-[#727785] mt-0.5">{asset.uPosition} • {asset.model}</div>
            <div className="text-[10px] text-[#727785] font-mono mt-2">SỐ SERIAL: {asset.serialNumber}</div>
          </div>

          <div className="text-xs text-[#727785] text-center mb-4">
            Đã tải cấu hình máy in mã vạch nhiệt Zebra chuẩn 4" x 3".
          </div>

          <div className="w-full flex gap-3">
            <button
              onClick={onClose}
              className="flex-1 py-2 border border-[#c2c6d6] text-[#424754] font-bold text-xs rounded-lg hover:bg-[#f2f4f6] cursor-pointer"
            >
              Hủy Bỏ
            </button>
            <button
              onClick={handlePrint}
              className="flex-1 py-2 bg-[#0058be] text-white font-bold text-xs rounded-lg hover:bg-[#2170e4] flex items-center justify-center gap-1.5 shadow-xs cursor-pointer active:scale-95"
            >
              <Printer className="w-4 h-4" />
              In Thẻ Tem (1 Bản)
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
