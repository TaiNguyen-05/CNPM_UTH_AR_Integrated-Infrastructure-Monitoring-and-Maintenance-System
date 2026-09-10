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

  const directScanUrl = asset.guid || `ar-imms://node/${asset.id}`;
  const qrImageUrl = `https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${encodeURIComponent(directScanUrl)}&margin=10`;

  return (
    <div className="modal-overlay">
      <div className="modal-box max-w-md font-mono text-white">
        <div className="modal-header">
          <div className="modal-title">
            <Printer className="w-5 h-5 text-[#38bdf8]" />
            <h3 className="uppercase text-sm">In Thẻ Định Danh AR Công Nghiệp</h3>
          </div>
          <button onClick={onClose} className="modal-close-btn">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 flex flex-col items-center bg-[#0c1015]">
          {/* Printable Sticker Template */}
          <div className="w-full border-2 border-dashed border-[#38bdf8]/60 p-4 bg-[#11161b] flex flex-col items-center text-center shadow-lg mb-4">
            <div className="w-full bg-[#38bdf8] text-[#080b0e] py-1 text-xs font-bold uppercase tracking-wider mb-3">
              ĐIỂM NEO THEO DÕI AR-IMMS
            </div>

            <div className="bg-white p-2 border border-slate-700 mb-2">
              <img
                src={qrImageUrl}
                alt={`Mã QR ${asset.name}`}
                className="w-36 h-36 object-contain"
              />
            </div>

            <div className="font-bold text-sm text-white">{asset.name}</div>
            <div className="text-xs text-[#38bdf8] font-bold mt-0.5">MÃ GUID: {asset.guid}</div>
            <div className="text-xs text-slate-400 mt-0.5">{asset.uPosition} • {asset.model}</div>
            <div className="text-[10px] text-[#ffb03a] mt-2">SỐ SERIAL: {asset.serialNumber}</div>
          </div>

          <div className="text-[11px] text-slate-400 text-center mb-4">
            Đã tải cấu hình máy in mã vạch nhiệt Zebra chuẩn 4" x 3".
          </div>

          <div className="w-full flex gap-3">
            <button
              onClick={onClose}
              className="btn-secondary flex-1"
            >
              Hủy Bỏ
            </button>
            <button
              onClick={handlePrint}
              className="btn-primary flex-1"
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
