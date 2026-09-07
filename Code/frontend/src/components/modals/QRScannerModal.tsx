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
    <div className="modal-overlay">
      <div className="modal-box max-w-lg font-mono text-white">
        
        {/* Header */}
        <div className="modal-header">
          <div className="modal-title">
            <div className="w-8 h-8 bg-[#38bdf8] flex items-center justify-center text-[#080b0e] shadow-lg rounded-lg">
              <Camera className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-bold text-sm text-white">Quét Tem Nhãn AR / QR Thiết Bị</h3>
              <p className="text-[11px] text-slate-400 font-light">Hướng camera về phía mã QR trên khung máy chủ</p>
            </div>
          </div>
          <button onClick={onClose} className="modal-close-btn">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Video / Scanning Viewport */}
        <div className="p-6 flex flex-col items-center bg-[#0c1015]">
          <div className="relative w-full aspect-square max-w-xs overflow-hidden bg-[#080b0e] border border-[#38bdf8]/40 flex items-center justify-center shadow-2xl rounded-xl">
            
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
                <Camera className="w-12 h-12 text-[#38bdf8] mb-3 animate-pulse" />
                <p className="text-xs text-slate-300 mb-2 font-medium">
                  {hasCameraPermission === false 
                    ? 'Chưa cấp quyền Camera hoặc đang trên thiết bị mô phỏng.' 
                    : 'Đang kết nối Camera...'}
                </p>
                <p className="text-[11px] text-slate-500">Bạn có thể chọn nhanh máy chủ bên dưới để mô phỏng quét QR.</p>
              </div>
            )}

            {/* Target Reticle Overlay */}
            <div className="absolute inset-8 border border-dashed border-[#38bdf8]/50 pointer-events-none flex flex-col justify-between p-2">
              <div className="flex justify-between">
                <div className="w-4 h-4 border-t-2 border-l-2 border-[#38bdf8]" />
                <div className="w-4 h-4 border-t-2 border-r-2 border-[#38bdf8]" />
              </div>
              
              {/* Laser Scanning Line */}
              <div className="w-full h-0.5 bg-[#38bdf8] shadow-[0_0_12px_#38bdf8] animate-bounce" />

              <div className="flex justify-between">
                <div className="w-4 h-4 border-b-2 border-l-2 border-[#38bdf8]" />
                <div className="w-4 h-4 border-b-2 border-r-2 border-[#38bdf8]" />
              </div>
            </div>

            <div className="absolute bottom-3 px-3 py-1 bg-[#080b0e]/90 backdrop-blur-xs text-[10px] text-[#38bdf8] flex items-center gap-1.5 border border-[#38bdf8]/30">
              <Sparkles className="w-3 h-3 text-[#ffb03a]" />
              Nhận diện điểm neo AR tự động
            </div>
          </div>

          {errorMessage && (
            <div className="mt-3 text-xs text-rose-300 bg-rose-950/40 border border-rose-500/40 px-3 py-1.5 flex items-center gap-1.5 rounded-lg">
              <AlertTriangle className="w-3.5 h-3.5 text-rose-400" />
              {errorMessage}
            </div>
          )}

          {/* Quick Select / Simulated QR Scans */}
          <div className="w-full mt-5">
            <div className="text-[11px] font-bold text-[#ffb03a] mb-2 uppercase tracking-wider">
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
                  className="p-2.5 bg-[#161d24] hover:bg-[#1c252e] border border-[#222c37] hover:border-[#38bdf8]/50 text-left transition-colors cursor-pointer group flex items-center justify-between rounded-lg"
                >
                  <div className="truncate">
                    <div className="font-bold text-xs text-white group-hover:text-[#38bdf8]">{asset.name}</div>
                    <div className="text-[10px] text-slate-400">{asset.rack} • {asset.guid.slice(0, 9)}</div>
                  </div>
                  <Scan className="w-3.5 h-3.5 text-slate-500 group-hover:text-[#38bdf8]" />
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
              className="form-input flex-1"
            />
            <button
              onClick={() => handleManualLookup(manualCode)}
              className="btn-primary"
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
