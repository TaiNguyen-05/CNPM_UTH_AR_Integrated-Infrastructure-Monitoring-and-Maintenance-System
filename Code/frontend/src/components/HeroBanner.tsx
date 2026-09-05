import React, { useEffect, useRef, useState } from 'react';
import { Icon } from '@iconify/react';
import { Camera, Terminal, Box, ChevronUp, ChevronDown, Sparkles, Activity } from 'lucide-react';
import { TabType } from '../types';

interface HeroBannerProps {
  onSelectTab: (tab: TabType) => void;
  onOpenAROverlay: () => void;
}

export const HeroBanner: React.FC<HeroBannerProps> = ({
  onSelectTab,
  onOpenAROverlay
}) => {
  const [collapsed, setCollapsed] = useState<boolean>(false);
  const heroVideoRef = useRef<HTMLVideoElement | null>(null);
  const typewriterRef = useRef<HTMLSpanElement | null>(null);

  useEffect(() => {
    const sequences = [
      "init --datacenter=alpha_zone_1a",
      "stream_telemetry --realtime --socketio",
      "sync_digital_twin --threejs-3d",
      "detect_hotspots --threshold=80C"
    ];
    let sequenceIndex = 0;
    let characterIndex = 0;
    let deleting = false;
    let timeout: number | undefined;

    const tick = () => {
      const el = typewriterRef.current;
      if (!el) return;

      const current = sequences[sequenceIndex];

      if (!deleting) {
        characterIndex += 1;
        el.textContent = current.slice(0, characterIndex);
        if (characterIndex >= current.length) {
          deleting = true;
          timeout = window.setTimeout(tick, 1800);
          return;
        }
        timeout = window.setTimeout(tick, 75);
      } else {
        characterIndex -= 1;
        el.textContent = current.slice(0, Math.max(characterIndex, 0));
        if (characterIndex <= 0) {
          deleting = false;
          sequenceIndex = (sequenceIndex + 1) % sequences.length;
        }
        timeout = window.setTimeout(tick, deleting ? 35 : 100);
      }
    };

    timeout = window.setTimeout(tick, 600);
    return () => {
      if (timeout) window.clearTimeout(timeout);
    };
  }, []);

  return (
    <div className="relative w-full overflow-hidden border-b border-[#222c37] bg-[#080b0e] transition-all duration-300">
      {/* Background Video Layer */}
      <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none">
        <video
          ref={heroVideoRef}
          autoPlay
          loop
          muted
          playsInline
          className="h-full w-full object-cover opacity-35 mix-blend-screen"
        >
          <source src="/video.mp4" type="video/mp4" />
        </video>
        <div className="absolute inset-0 bg-gradient-to-t from-[#080b0e] via-[#080b0e]/30 to-transparent" />
        <div className="absolute inset-0 bg-gradient-to-r from-[#080b0e] via-transparent to-[#080b0e]" />
      </div>

      {/* Hero Content */}
      <div className="relative z-10 max-w-7xl mx-auto px-4 md:px-6 py-8 md:py-12">
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6">
          <div className="space-y-4 max-w-2xl">
            {/* Tag chip */}
            <div className="inline-flex items-center gap-2.5 border border-[#222c37] bg-[#11161b]/80 px-3.5 py-1 text-xs">
              <span className="w-2 h-2 rounded-full bg-[#ffb03a] animate-pulse" />
              <span className="font-mono text-[11px] uppercase tracking-widest text-slate-300">
                Micro Workspace // AR-IMMS Enclave
              </span>
            </div>

            {/* Headline */}
            <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold tracking-tight text-white leading-tight">
              Datacenter Intelligence <br />
              <span className="bg-gradient-to-r from-[#38bdf8] via-[#ffb03a] to-[#f59e0b] bg-clip-text text-transparent font-mono">
                Inside The Micro Matrix.
              </span>
            </h1>

            {!collapsed && (
              <p className="text-xs sm:text-sm font-light text-slate-400 leading-relaxed max-w-lg">
                Hạ tầng giám sát bản sao số 3D kết hợp camera tăng cường thực tế AR HUD, phát hiện điểm nóng tức thời và phân luồng xử lý phiếu sự cố tự động.
              </p>
            )}

            {/* Interactive Shell Typewriter */}
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-none border border-[#222c37] bg-[#080b0e]/90 font-mono text-xs">
              <span className="text-[#38bdf8]">nexus@ar-imms:~$</span>
              <span ref={typewriterRef} className="cursor-blink text-white" />
            </div>
          </div>

          {/* Action Callouts */}
          <div className="flex flex-col sm:flex-row lg:flex-col gap-3 shrink-0 w-full sm:w-auto">
            <button
              onClick={onOpenAROverlay}
              className="keycap-glow bg-[#38bdf8] hover:bg-[#00f0ff] px-6 py-3.5 text-center font-mono text-xs font-bold uppercase tracking-widest text-[#080b0e] transition-all cursor-pointer flex items-center justify-center gap-2 active:scale-95"
            >
              <Camera className="w-4 h-4" />
              <span>Kích Hoạt Lớp Phủ AR</span>
            </button>

            <button
              onClick={() => onSelectTab('telemetry')}
              className="border border-[#222c37] bg-[#11161b]/80 hover:border-slate-400 px-6 py-3 text-center font-mono text-xs uppercase tracking-widest text-slate-300 transition-all cursor-pointer flex items-center justify-center gap-2"
            >
              <Terminal className="w-4 h-4 text-[#ffb03a]" />
              <span>Initialize Console</span>
            </button>
          </div>
        </div>
      </div>

      {/* Collapse / Expand Tab */}
      <div className="relative z-10 flex justify-center -mb-3">
        <button
          onClick={() => setCollapsed(prev => !prev)}
          className="px-3 py-0.5 border border-[#222c37] bg-[#11161b] hover:bg-[#161d24] text-[10px] font-mono text-slate-400 hover:text-white transition-colors cursor-pointer flex items-center gap-1"
          title={collapsed ? 'Mở rộng banner' : 'Thu gọn banner'}
        >
          {collapsed ? <ChevronDown className="w-3 h-3" /> : <ChevronUp className="w-3 h-3" />}
          <span>{collapsed ? 'SHOW MATRIX HERO' : 'COLLAPSE'}</span>
        </button>
      </div>
    </div>
  );
};
