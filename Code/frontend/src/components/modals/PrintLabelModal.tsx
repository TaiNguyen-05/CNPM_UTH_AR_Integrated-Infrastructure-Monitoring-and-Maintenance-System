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
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-[#080b0e] border border-[#222c37] shadow-2xl w-full max-w-md overflow-hidden animate-in fade-in zoom-in-95 duration-150 font-mono text-white">
        <div className="px-6 py-4 bg-[#11161b] border-b border-[#222c37] flex justify-between items-center">
          <div className="flex items-center gap-2">
            <Printer className="w-5 h-5 text-[#38bdf8]" />
            <h3 className="font-bold text-sm text-white font-mono uppercase">In Thẻ Định Danh AR Công Nghiệp</h3>
          </div>
          <button 
            onClick={onClose}
            className="p-1 text-slate-500 hover:text-white cursor-pointer transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 flex flex-col items-center bg-[#0c1015]">
          {/* Printable Sticker Template */}
          <div className="w-full border-2 border-dashed border-[#38bdf8]/60 p-4 bg-[#11161b] flex flex-col items-center text-center shadow-lg mb-4">
            <div className="w-full bg-[#38bdf8] text-[#080b0e] py-1 text-xs font-bold font-mono uppercase tracking-wider mb-3">
              ĐIỂM NEO THEO DÕI AR-IMMS
            </div>

            <div className="bg-white p-2 border border-slate-700 mb-2">
              <img
                src={qrImageUrl}
                alt={`Mã QR ${asset.name}`}
                className="w-36 h-36 object-contain"
              />
            </div>

            <div className="font-bold text-sm text-white font-mono">{asset.name}</div>
            <div className="text-xs font-mono text-[#38bdf8] font-bold mt-0.5">MÃ GUID: {asset.guid}</div>
            <div className="text-xs text-slate-400 mt-0.5">{asset.uPosition} • {asset.model}</div>
            <div className="text-[10px] text-[#ffb03a] font-mono mt-2">SỐ SERIAL: {asset.serialNumber}</div>
          </div>

          <div className="text-[11px] text-slate-400 text-center mb-4 font-mono">
            Đã tải cấu hình máy in mã vạch nhiệt Zebra chuẩn 4" x 3".
          </div>

          <div className="w-full flex gap-3">
            <button
              onClick={onClose}
              className="flex-1 py-2 border border-[#222c37] bg-[#161d24] text-slate-300 font-mono font-bold text-xs uppercase hover:text-white transition-colors cursor-pointer"
            >
              Hủy Bỏ
            </button>
            <button
              onClick={handlePrint}
              className="flex-1 py-2 bg-[#38bdf8] text-[#080b0e] font-mono font-bold text-xs uppercase hover:bg-[#00f0ff] flex items-center justify-center gap-1.5 transition-colors cursor-pointer active:scale-95"
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
