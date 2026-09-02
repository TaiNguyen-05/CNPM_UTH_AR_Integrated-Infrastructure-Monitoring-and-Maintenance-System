import React, { useState, useEffect, useRef } from 'react';
import { 
  X, 
  Camera, 
  Scan, 
  AlertTriangle, 
  Search,
  Sparkles
} from 'lucide-react';
import { AssetItem } from '../../types';

interface QRScannerModalProps {
  assets: AssetItem[];
  onClose: () => void;
  onSelectAsset: (asset: AssetItem) => void;
}

export const QRScannerModal: React.FC<QRScannerModalProps> = ({
  assets,
  onClose,
  onSelectAsset
}) => {
  const [hasCameraPermission, setHasCameraPermission] = useState<boolean | null>(null);
  const [manualCode, setManualCode] = useState<string>('');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);

  useEffect(() => {
    // Start camera stream
    const startCamera = async () => {
      try {
        if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
          const stream = await navigator.mediaDevices.getUserMedia({
            video: { facingMode: 'environment' }
          });
          streamRef.current = stream;
          if (videoRef.current) {
            videoRef.current.srcObject = stream;
          }
          setHasCameraPermission(true);
        } else {
          setHasCameraPermission(false);
        }
      } catch (err) {
        console.warn('Camera access error or unsupported:', err);
        setHasCameraPermission(false);
      }
    };

    startCamera();

    return () => {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
      }
    };
  }, []);

  const handleManualLookup = (code: string) => {
    const trimmed = code.trim().toLowerCase();
    if (!trimmed) return;

    let targetId = trimmed;
    if (trimmed.includes('node=')) {
      const match = trimmed.match(/node=([^&]+)/);
      if (match) targetId = match[1].toLowerCase();
    } else if (trimmed.includes('guid=')) {
      const match = trimmed.match(/guid=([^&]+)/);
      if (match) targetId = match[1].toLowerCase();
    }

    const matched = assets.find(a => 
      a.id.toLowerCase() === targetId ||
      a.name.toLowerCase() === targetId ||
      a.guid.toLowerCase() === targetId ||
      a.serialNumber.toLowerCase() === targetId
    );

    if (matched) {
      onSelectAsset(matched);
      onClose();
    } else {
      setErrorMessage(`Không tìm thấy máy chủ với mã "${code}". Vui lòng thử lại.`);
      setTimeout(() => setErrorMessage(null), 3000);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/40 backdrop-blur-xs z-50 flex items-center justify-center p-3 sm:p-4 animate-in fade-in duration-150">
      <div className="bg-white rounded-2xl border border-[#c2c6d6] shadow-2xl w-full max-w-lg overflow-hidden flex flex-col text-[#191c1e]">
        
        {/* Header */}
        <div className="px-6 py-4 bg-[#f8fafc] border-b border-[#c2c6d6] flex justify-between items-center">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-[#0058be] flex items-center justify-center text-white shadow-2xs">
              <Camera className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-bold text-sm text-[#191c1e]">Quét Tem Nhãn AR / QR Thiết Bị</h3>
              <p className="text-[11px] text-[#727785]">Hướng camera về phía mã QR trên khung máy chủ</p>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="p-1.5 rounded-full text-[#727785] hover:text-[#191c1e] hover:bg-[#e0e3e5] cursor-pointer transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Video / Scanning Viewport */}
        <div className="p-6 flex flex-col items-center bg-white">
          <div className="relative w-full aspect-square max-w-xs rounded-2xl overflow-hidden bg-slate-900 border-2 border-[#0058be] flex items-center justify-center shadow-md">
            
            {hasCameraPermission ? (
              <video 
                ref={videoRef} 
                autoPlay 
                playsInline 
                muted 
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="flex flex-col items-center justify-center p-6 text-center text-white">
                <Camera className="w-12 h-12 text-[#94a3b8] mb-3 animate-pulse" />
                <p className="text-xs text-[#94a3b8] mb-2 font-medium">
                  {hasCameraPermission === false 
                    ? 'Chưa cấp quyền Camera hoặc đang trên thiết bị mô phỏng.' 
                    : 'Đang kết nối Camera...'}
                </p>
                <p className="text-[11px] text-[#64748b]">Bạn có thể chọn nhanh máy chủ bên dưới để mô phỏng quét QR.</p>
              </div>
            )}

            {/* Target Reticle Overlay */}
            <div className="absolute inset-8 border-2 border-dashed border-white/60 rounded-xl pointer-events-none flex flex-col justify-between p-2">
              <div className="flex justify-between">
                <div className="w-4 h-4 border-t-2 border-l-2 border-[#4edea3]" />
                <div className="w-4 h-4 border-t-2 border-r-2 border-[#4edea3]" />
              </div>
              
              {/* Laser Scanning Line */}
              <div className="w-full h-0.5 bg-[#4edea3] shadow-[0_0_8px_#4edea3] animate-bounce" />

              <div className="flex justify-between">
                <div className="w-4 h-4 border-b-2 border-l-2 border-[#4edea3]" />
                <div className="w-4 h-4 border-b-2 border-r-2 border-[#4edea3]" />
              </div>
            </div>

            <div className="absolute bottom-3 px-3 py-1 bg-black/70 backdrop-blur-xs rounded-full text-[10px] text-white flex items-center gap-1.5 border border-white/20">
              <Sparkles className="w-3 h-3 text-[#4edea3]" />
              Nhận diện điểm neo AR tự động
            </div>
          </div>

          {errorMessage && (
            <div className="mt-3 text-xs text-[#ba1a1a] bg-[#ffdad6] border border-[#ba1a1a]/30 px-3 py-1.5 rounded-lg flex items-center gap-1.5">
              <AlertTriangle className="w-3.5 h-3.5" />
              {errorMessage}
            </div>
          )}

          {/* Quick Select / Simulated QR Scans */}
          <div className="w-full mt-5">
            <div className="text-xs font-bold text-[#424754] mb-2 uppercase tracking-wider">
              Chọn nhanh máy chủ mẫu để kiểm tra:
            </div>
            <div className="grid grid-cols-2 gap-2">
              {assets.slice(0, 4).map(asset => (
                <button
                  key={asset.id}
                  onClick={() => {
                    onSelectAsset(asset);
                    onClose();
                  }}
                  className="p-2.5 rounded-xl bg-[#f8fafc] hover:bg-[#d8e2ff]/40 border border-[#c2c6d6] text-left transition-colors cursor-pointer group flex items-center justify-between shadow-2xs"
                >
                  <div className="truncate">
                    <div className="font-bold text-xs text-[#191c1e] group-hover:text-[#0058be]">{asset.name}</div>
                    <div className="text-[10px] text-[#727785]">{asset.rack} • {asset.guid.slice(0, 9)}</div>
                  </div>
                  <Scan className="w-3.5 h-3.5 text-[#727785] group-hover:text-[#0058be]" />
                </button>
              ))}
            </div>
          </div>

          {/* Manual Code Input */}
          <div className="w-full mt-4 flex gap-2">
            <input
              type="text"
              placeholder="Hoặc nhập Mã Máy / GUID / Serial..."
              value={manualCode}
              onChange={e => setManualCode(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && handleManualLookup(manualCode)}
              className="flex-1 bg-[#f8fafc] border border-[#c2c6d6] rounded-xl px-3 py-2 text-xs text-[#191c1e] placeholder-[#727785] focus:outline-hidden focus:border-[#0058be]"
            />
            <button
              onClick={() => handleManualLookup(manualCode)}
              className="px-4 py-2 bg-[#0058be] hover:bg-[#2170e4] text-white text-xs font-bold rounded-xl flex items-center gap-1.5 transition-colors cursor-pointer shadow-xs active:scale-95"
            >
              <Search className="w-3.5 h-3.5" />
              Tìm
            </button>
          </div>

        </div>

      </div>
    </div>
  );
};
