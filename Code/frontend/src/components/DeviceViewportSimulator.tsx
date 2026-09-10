import React, { useState, useEffect } from 'react';
import { 
  Smartphone, 
  Tablet, 
  Monitor, 
  RotateCw, 
  X, 
  Maximize2, 
  Minimize2, 
  QrCode, 
  Wifi, 
  Battery, 
  Sparkles,
  ChevronDown,
  Layers
} from 'lucide-react';

export type DeviceMode = 'desktop' | 'iphone' | 'android' | 'tablet';
export type DeviceOrientation = 'portrait' | 'landscape';

interface DeviceViewportSimulatorProps {
  children: React.ReactNode;
}

interface DeviceSpec {
  id: DeviceMode;
  name: string;
  width: number;
  height: number;
  type: 'mobile' | 'tablet' | 'desktop';
  bezel: string;
  notchType: 'island' | 'hole' | 'none';
}

const DEVICE_SPECS: Record<DeviceMode, DeviceSpec> = {
  desktop: {
    id: 'desktop',
    name: 'Máy Tính (Full 100%)',
    width: 0,
    height: 0,
    type: 'desktop',
    bezel: '',
    notchType: 'none'
  },
  iphone: {
    id: 'iphone',
    name: 'iPhone 15 Pro',
    width: 393,
    height: 852,
    type: 'mobile',
    bezel: 'rounded-[46px] border-[10px] border-[#222831]',
    notchType: 'island'
  },
  android: {
    id: 'android',
    name: 'Samsung Galaxy S24',
    width: 360,
    height: 800,
    type: 'mobile',
    bezel: 'rounded-[38px] border-[8px] border-[#1e232b]',
    notchType: 'hole'
  },
  tablet: {
    id: 'tablet',
    name: 'iPad Pro / Tablet',
    width: 820,
    height: 1080,
    type: 'tablet',
    bezel: 'rounded-[32px] border-[12px] border-[#1f242d]',
    notchType: 'none'
  }
};

export const DeviceViewportSimulator: React.FC<DeviceViewportSimulatorProps> = ({ children }) => {
  const [device, setDevice] = useState<DeviceMode>('desktop');
  const [orientation, setOrientation] = useState<DeviceOrientation>('portrait');
  const [scale, setScale] = useState<number>(0.9);
  const [showQrModal, setShowQrModal] = useState<boolean>(false);
  const [currentTime, setCurrentTime] = useState<string>('09:41');
  const [isMenuExpanded, setIsMenuExpanded] = useState<boolean>(false);

  // Cập nhật đồng hồ thời gian thực
  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setCurrentTime(
        now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false })
      );
    };
    updateTime();
    const interval = setInterval(updateTime, 10000);
    return () => clearInterval(interval);
  }, []);

  // Tự động thu phóng để vừa màn hình khi chuyển sang tablet hoặc xoay ngang
  useEffect(() => {
    if (device === 'tablet') {
      setScale(0.75);
    } else if (orientation === 'landscape') {
      setScale(0.75);
    } else if (device === 'iphone' || device === 'android') {
      setScale(0.88);
    } else {
      setScale(1.0);
    }
  }, [device, orientation]);

  const activeSpec = DEVICE_SPECS[device];

  const currentW = orientation === 'portrait' ? activeSpec.width : activeSpec.height;
  const currentH = orientation === 'portrait' ? activeSpec.height : activeSpec.width;

  // Nếu đang xem ở chế độ Desktop bình thường
  if (device === 'desktop') {
    return (
      <div className="relative w-full min-h-screen">
        {children}

        {/* Floating Quick Action: Đa Thiết Bị / Mobile View Switcher */}
        <div className="fixed bottom-5 right-5 z-[9999] flex flex-col items-end gap-2 font-mono">
          {isMenuExpanded && (
            <div className="bg-[#0c1015]/95 backdrop-blur-xl border border-[#38bdf8]/40 shadow-2xl rounded-2xl p-3 flex flex-col gap-2 w-64 animate-in fade-in slide-in-from-bottom-4 duration-200">
              <div className="flex items-center justify-between pb-2 border-b border-[#222c37] text-xs font-bold text-sky-400">
                <span className="flex items-center gap-1.5">
                  <Smartphone className="w-4 h-4 text-[#38bdf8]" />
                  CHẾ ĐỘ XEM ĐA THIẾT BỊ
                </span>
                <button
                  onClick={() => setIsMenuExpanded(false)}
                  className="text-slate-400 hover:text-white p-1 rounded hover:bg-slate-800 cursor-pointer"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>

              <div className="text-[11px] text-slate-400 leading-tight">
                Mô phỏng trải nghiệm giao diện trên các dòng điện thoại & máy tính bảng:
              </div>

              <div className="grid grid-cols-1 gap-1.5">
                <button
                  onClick={() => {
                    setDevice('iphone');
                    setIsMenuExpanded(false);
                  }}
                  className="flex items-center justify-between px-3 py-2 rounded-xl bg-[#161d24] hover:bg-[#38bdf8]/15 border border-[#222c37] hover:border-[#38bdf8]/50 text-xs font-bold text-slate-200 hover:text-[#38bdf8] transition-all cursor-pointer text-left"
                >
                  <div className="flex items-center gap-2">
                    <Smartphone className="w-4 h-4 text-sky-400" />
                    <span>iPhone 15 Pro</span>
                  </div>
                  <span className="text-[10px] text-slate-500 font-mono">393×852</span>
                </button>

                <button
                  onClick={() => {
                    setDevice('android');
                    setIsMenuExpanded(false);
                  }}
                  className="flex items-center justify-between px-3 py-2 rounded-xl bg-[#161d24] hover:bg-amber-500/15 border border-[#222c37] hover:border-amber-500/50 text-xs font-bold text-slate-200 hover:text-amber-400 transition-all cursor-pointer text-left"
                >
                  <div className="flex items-center gap-2">
                    <Smartphone className="w-4 h-4 text-amber-400" />
                    <span>Galaxy S24 / Android</span>
                  </div>
                  <span className="text-[10px] text-slate-500 font-mono">360×800</span>
                </button>

                <button
                  onClick={() => {
                    setDevice('tablet');
                    setIsMenuExpanded(false);
                  }}
                  className="flex items-center justify-between px-3 py-2 rounded-xl bg-[#161d24] hover:bg-indigo-500/15 border border-[#222c37] hover:border-indigo-500/50 text-xs font-bold text-slate-200 hover:text-indigo-400 transition-all cursor-pointer text-left"
                >
                  <div className="flex items-center gap-2">
                    <Tablet className="w-4 h-4 text-indigo-400" />
                    <span>iPad Pro / Tablet</span>
                  </div>
                  <span className="text-[10px] text-slate-500 font-mono">820×1080</span>
                </button>

                <button
                  onClick={() => {
                    setShowQrModal(true);
                    setIsMenuExpanded(false);
                  }}
                  className="flex items-center gap-2 px-3 py-2 rounded-xl bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/30 text-xs font-bold text-emerald-300 transition-all cursor-pointer"
                >
                  <QrCode className="w-4 h-4 text-emerald-400" />
                  <span>Quét QR mở trên đth thật</span>
                </button>
              </div>
            </div>
          )}

          <button
            onClick={() => setIsMenuExpanded(!isMenuExpanded)}
            className="group flex items-center gap-2 px-4 py-2.5 bg-[#0c1015]/95 hover:bg-[#161d24] border border-[#38bdf8]/50 hover:border-[#00f0ff] rounded-full shadow-[0_0_25px_rgba(56,189,248,0.25)] text-xs font-bold text-white transition-all cursor-pointer active:scale-95"
            title="Mở bộ giả lập xem trên điện thoại đa thiết bị"
          >
            <Smartphone className="w-4 h-4 text-[#38bdf8] group-hover:scale-110 transition-transform" />
            <span className="text-slate-200 font-mono tracking-wider">Xem Trên ĐT</span>
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
          </button>
        </div>

        {/* Modal Quét QR Code để mở trên điện thoại thật */}
        {showQrModal && (
          <div className="fixed inset-0 z-[10000] flex items-center justify-center bg-black/80 backdrop-blur-md p-4">
            <div className="bg-[#0c1015] border border-[#38bdf8]/40 rounded-3xl p-6 max-w-sm w-full text-center shadow-2xl relative font-mono">
              <button
                onClick={() => setShowQrModal(false)}
                className="absolute top-4 right-4 text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>

              <div className="w-12 h-12 rounded-2xl bg-sky-500/10 border border-sky-500/30 flex items-center justify-center mx-auto mb-3">
                <QrCode className="w-6 h-6 text-sky-400" />
              </div>

              <h3 className="text-base font-bold text-white mb-1">Mở Trực Tiếp Trên Điện Thoại</h3>
              <p className="text-xs text-slate-400 mb-4 leading-relaxed">
                Mở camera hoặc ứng dụng Zalo trên điện thoại của bạn quét mã này để trải nghiệm trực tiếp:
              </p>

              <div className="bg-white p-3 rounded-2xl inline-block shadow-lg mb-4">
                <img
                  src={`https://api.qrserver.com/v1/create-qr-code/?size=220x220&data=${encodeURIComponent(
                    typeof window !== 'undefined' ? window.location.href : 'http://localhost:5173'
                  )}&margin=10`}
                  alt="QR Mở trên điện thoại"
                  className="w-48 h-48 object-contain"
                />
              </div>

              <div className="text-[11px] text-slate-400 bg-[#161d24] border border-[#222c37] p-2.5 rounded-xl break-all">
                URL: <span className="text-sky-300 font-semibold">{typeof window !== 'undefined' ? window.location.href : ''}</span>
              </div>

              <button
                onClick={() => setShowQrModal(false)}
                className="mt-4 w-full py-2 bg-[#38bdf8] hover:bg-[#7dd3fc] text-[#080b0e] rounded-xl text-xs font-bold uppercase tracking-wider transition-colors cursor-pointer"
              >
                Đã Hiểu
              </button>
            </div>
          </div>
        )}
      </div>
    );
  }

  // Nếu đang ở chế độ giả lập Thiết Bị Mobile / Tablet
  return (
    <div className="fixed inset-0 z-[9990] bg-[#05070a] flex flex-col items-center justify-start overflow-hidden select-none font-mono">
      {/* Top Simulator Control Bar */}
      <header className="w-full bg-[#0c1015]/90 backdrop-blur-md border-b border-[#222c37] px-4 py-2.5 flex items-center justify-between z-50 text-xs shadow-md">
        {/* Left: Device Selector */}
        <div className="flex items-center gap-2">
          <span className="text-slate-400 text-[11px] font-bold uppercase tracking-wider hidden sm:inline">Thiết Bị:</span>
          
          <button
            onClick={() => setDevice('desktop')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
              device === 'desktop' ? 'bg-[#38bdf8] text-[#080b0e]' : 'bg-[#161d24] text-slate-300 hover:text-white border border-[#222c37]'
            }`}
          >
            <Monitor className="w-3.5 h-3.5" />
            <span className="hidden md:inline">Máy Tính</span>
          </button>

          <button
            onClick={() => setDevice('iphone')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
              device === 'iphone' ? 'bg-[#38bdf8] text-[#080b0e]' : 'bg-[#161d24] text-slate-300 hover:text-white border border-[#222c37]'
            }`}
          >
            <Smartphone className="w-3.5 h-3.5" />
            <span>iPhone</span>
          </button>

          <button
            onClick={() => setDevice('android')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
              device === 'android' ? 'bg-[#38bdf8] text-[#080b0e]' : 'bg-[#161d24] text-slate-300 hover:text-white border border-[#222c37]'
            }`}
          >
            <Smartphone className="w-3.5 h-3.5" />
            <span>Android</span>
          </button>

          <button
            onClick={() => setDevice('tablet')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
              device === 'tablet' ? 'bg-[#38bdf8] text-[#080b0e]' : 'bg-[#161d24] text-slate-300 hover:text-white border border-[#222c37]'
            }`}
          >
            <Tablet className="w-3.5 h-3.5" />
            <span>Tablet</span>
          </button>
        </div>

        {/* Center: Dimensions & Orientation */}
        <div className="flex items-center gap-3">
          <div className="hidden lg:flex items-center gap-2 bg-[#11161b] px-3 py-1 rounded-xl border border-[#222c37] text-slate-300 text-[11px]">
            <span className="text-sky-400 font-bold">{activeSpec.name}</span>
            <span>•</span>
            <span className="text-slate-400">{currentW} × {currentH} px</span>
            <span>•</span>
            <span className="text-amber-400">{Math.round(scale * 100)}%</span>
          </div>

          <button
            onClick={() => setOrientation(orientation === 'portrait' ? 'landscape' : 'portrait')}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-[#161d24] hover:bg-[#222c37] text-slate-200 border border-[#222c37] rounded-xl text-xs font-bold transition-all cursor-pointer"
            title="Xoay màn hình Dọc / Ngang"
          >
            <RotateCw className="w-3.5 h-3.5 text-sky-400" />
            <span className="hidden sm:inline">{orientation === 'portrait' ? 'Xoay Ngang' : 'Xoay Dọc'}</span>
          </button>

          {/* Scale controls */}
          <div className="hidden sm:flex items-center gap-1 bg-[#161d24] border border-[#222c37] rounded-xl p-0.5 text-xs">
            <button
              onClick={() => setScale(Math.max(0.5, scale - 0.1))}
              className="px-2 py-1 text-slate-400 hover:text-white cursor-pointer"
              title="Thu nhỏ"
            >
              -
            </button>
            <span className="px-1 text-[10px] text-slate-300">{Math.round(scale * 100)}%</span>
            <button
              onClick={() => setScale(Math.min(1.2, scale + 0.1))}
              className="px-2 py-1 text-slate-400 hover:text-white cursor-pointer"
              title="Phóng to"
            >
              +
            </button>
          </div>
        </div>

        {/* Right: Exit */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowQrModal(true)}
            className="px-3 py-1.5 bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer"
            title="Mở mã QR quét bằng điện thoại thật"
          >
            <QrCode className="w-3.5 h-3.5" />
            <span className="hidden md:inline">Mở ĐT Thật</span>
          </button>

          <button
            onClick={() => setDevice('desktop')}
            className="px-3.5 py-1.5 bg-rose-500/10 hover:bg-rose-500/25 text-rose-300 border border-rose-500/30 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer"
          >
            <X className="w-3.5 h-3.5" />
            <span>Thoát Giả Lập</span>
          </button>
        </div>
      </header>

      {/* Simulator Workspace Body */}
      <div className="flex-1 w-full overflow-auto flex items-center justify-center p-4 md:p-8 terminal-grid relative">
        <div
          style={{
            transform: `scale(${scale})`,
            transformOrigin: 'center center',
            transition: 'all 0.3s cubic-bezier(0.16, 1, 0.3, 1)'
          }}
          className={`relative shadow-[0_25px_60px_rgba(0,0,0,0.8),0_0_80px_rgba(56,189,248,0.15)] ${activeSpec.bezel} bg-[#080b0e] flex flex-col overflow-hidden shrink-0`}
        >
          {/* Simulated Mobile Status Bar */}
          <div className="h-10 bg-[#080b0e] w-full flex items-center justify-between px-6 z-50 text-[11px] font-bold text-white shrink-0 select-none relative">
            {/* Left: Clock */}
            <span className="tracking-tight">{currentTime}</span>

            {/* Center: Dynamic Island or Notch */}
            {activeSpec.notchType === 'island' && orientation === 'portrait' && (
              <div className="absolute left-1/2 -translate-x-1/2 top-2 h-6 w-24 bg-black rounded-full border border-slate-800 flex items-center justify-end px-2">
                <div className="w-2.5 h-2.5 rounded-full bg-[#111] border border-slate-700 mr-1" />
              </div>
            )}

            {activeSpec.notchType === 'hole' && (
              <div className="absolute left-1/2 -translate-x-1/2 top-2 w-3.5 h-3.5 bg-black rounded-full border border-slate-800" />
            )}

            {/* Right: Signal, Wifi, Battery */}
            <div className="flex items-center gap-1.5 text-slate-300">
              <span className="text-[9px] font-mono text-sky-400 mr-0.5">5G</span>
              <Wifi className="w-3.5 h-3.5" />
              <div className="flex items-center gap-1">
                <span className="text-[10px]">98%</span>
                <Battery className="w-3.5 h-3.5 text-emerald-400" />
              </div>
            </div>
          </div>

          {/* Interactive Screen Container */}
          <div
            style={{
              width: `${currentW}px`,
              height: `${currentH - 60}px`,
            }}
            className="w-full bg-[#080b0e] overflow-y-auto overflow-x-hidden relative"
          >
            {children}
          </div>

          {/* Simulated Bottom Home Gesture Indicator */}
          <div className="h-6 bg-[#080b0e] w-full flex items-center justify-center shrink-0 z-50">
            <div className="w-32 h-1 bg-slate-500/60 rounded-full" />
          </div>
        </div>
      </div>

      {/* Modal Quét QR Code để mở trên điện thoại thật */}
      {showQrModal && (
        <div className="fixed inset-0 z-[10000] flex items-center justify-center bg-black/80 backdrop-blur-md p-4">
          <div className="bg-[#0c1015] border border-[#38bdf8]/40 rounded-3xl p-6 max-w-sm w-full text-center shadow-2xl relative font-mono">
            <button
              onClick={() => setShowQrModal(false)}
              className="absolute top-4 right-4 text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800 cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="w-12 h-12 rounded-2xl bg-sky-500/10 border border-sky-500/30 flex items-center justify-center mx-auto mb-3">
              <QrCode className="w-6 h-6 text-sky-400" />
            </div>

            <h3 className="text-base font-bold text-white mb-1">Mở Trực Tiếp Trên Điện Thoại</h3>
            <p className="text-xs text-slate-400 mb-4 leading-relaxed">
              Mở camera hoặc ứng dụng Zalo trên điện thoại quét mã này để trải nghiệm trực tiếp trên máy thật:
            </p>

            <div className="bg-white p-3 rounded-2xl inline-block shadow-lg mb-4">
              <img
                src={`https://api.qrserver.com/v1/create-qr-code/?size=220x220&data=${encodeURIComponent(
                  typeof window !== 'undefined' ? window.location.href : 'http://localhost:5173'
                )}&margin=10`}
                alt="QR Mở trên điện thoại"
                className="w-48 h-48 object-contain"
              />
            </div>

            <div className="text-[11px] text-slate-400 bg-[#161d24] border border-[#222c37] p-2.5 rounded-xl break-all">
              URL: <span className="text-sky-300 font-semibold">{typeof window !== 'undefined' ? window.location.href : ''}</span>
            </div>

            <button
              onClick={() => setShowQrModal(false)}
              className="mt-4 w-full py-2 bg-[#38bdf8] hover:bg-[#7dd3fc] text-[#080b0e] rounded-xl text-xs font-bold uppercase tracking-wider transition-colors cursor-pointer"
            >
              Đóng
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
