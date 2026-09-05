import React from 'react';
import { Rack, RackUnit } from '../types';
import { Server, Activity, Flame, ShieldAlert, CheckCircle2, HardDrive, Wifi, Zap } from 'lucide-react';

interface RackElevationViewProps {
  racks: Rack[];
  selectedRackId: string;
  selectedUnit: RackUnit;
  onSelectRack: (rackId: string) => void;
  onSelectUnit: (unit: RackUnit, rack: Rack) => void;
  viewMode: 'normal' | 'thermal' | 'workload';
}

export const RackElevationView: React.FC<RackElevationViewProps> = ({
  racks,
  selectedRackId,
  selectedUnit,
  onSelectRack,
  onSelectUnit,
  viewMode
}) => {
  return (
    <div className="flex flex-col lg:flex-row items-center justify-around gap-6 p-4 min-h-[460px] bg-[#060913] rounded-xl border border-slate-800/80 overflow-x-auto select-none">
      {racks.slice(0, 3).map((rack) => {
        const isSelectedRack = rack.id === selectedRackId;

        return (
          <div
            key={rack.id}
            onClick={() => onSelectRack(rack.id)}
            className={`flex flex-col items-center gap-2 cursor-pointer transition-all duration-200 ${
              isSelectedRack ? 'scale-100' : 'opacity-80 hover:opacity-100'
            }`}
          >
            {/* Rack Top Header Label */}
            <div className="flex items-center gap-2">
              <span className={`text-xs font-black tracking-widest ${
                isSelectedRack ? 'text-sky-400' : 'text-slate-400'
              }`}>
                {rack.name.toUpperCase()}
              </span>
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
            </div>

            {/* Authentic 42U Server Rack Cabinet */}
            <div className={`
              w-56 md:w-64 bg-gradient-to-b from-[#0e1626] via-[#090d16] to-[#0b1120]
              border-2 rounded-2xl shadow-2xl p-2.5 flex flex-col gap-1.5 relative transition-all
              ${isSelectedRack 
                ? 'border-sky-500 ring-4 ring-sky-500/20 shadow-sky-500/20' 
                : 'border-slate-800 hover:border-slate-700'}
            `}>
              {/* Rack Roof Bezel & Exhaust Fans */}
              <div className="flex justify-between items-center px-2 py-1 bg-slate-900/90 rounded-lg border border-slate-800 text-[9px] font-mono text-slate-500">
                <span className="flex items-center gap-1 text-slate-400">
                  <Zap className="w-2.5 h-2.5 text-amber-400" />
                  PDU-A 208V
                </span>
                <span className="flex items-center gap-1">
                  <span className="w-1 h-1 rounded-full bg-emerald-400"></span>
                  42U CHASSIS
                </span>
              </div>

              {/* Server Units inside Rack */}
              <div className="flex flex-col gap-1.5 py-1">
                {rack.units.map((unit) => {
                  const isSelected = selectedUnit.name === unit.name && isSelectedRack;
                  const isCritical = unit.status === 'critical';

                  let thermalBg = 'bg-slate-900/90 border-slate-800 text-slate-300';
                  if (viewMode === 'thermal') {
                    if (unit.temp > 80) thermalBg = 'bg-rose-950/80 border-rose-500/60 text-rose-200';
                    else if (unit.temp > 60) thermalBg = 'bg-amber-950/80 border-amber-500/60 text-amber-200';
                    else thermalBg = 'bg-emerald-950/80 border-emerald-500/60 text-emerald-200';
                  } else if (isCritical) {
                    thermalBg = 'bg-rose-950/60 border-rose-500/80 text-rose-200 shadow-sm shadow-rose-950';
                  }

                  return (
                    <div
                      key={unit.u}
                      onClick={(e) => {
                        e.stopPropagation();
                        onSelectRack(rack.id);
                        onSelectUnit(unit, rack);
                      }}
                      className={`
                        w-full rounded-xl p-2 border transition-all cursor-pointer relative group flex flex-col justify-between
                        ${unit.u >= 3 ? 'min-h-[56px]' : 'min-h-[46px]'}
                        ${isSelected 
                          ? 'bg-sky-500/25 border-2 border-sky-400 shadow-lg shadow-sky-500/25 ring-2 ring-sky-500/30' 
                          : thermalBg}
                      `}
                    >
                      {/* Top Server Blade Bar */}
                      <div className="flex justify-between items-center gap-1">
                        <div className="flex items-center gap-1.5 min-w-0">
                          {/* Unit Height Tag */}
                          <span className="text-[9px] font-mono font-bold text-slate-500 bg-slate-950 px-1 rounded border border-slate-800">
                            U{String(unit.u).padStart(2, '0')}
                          </span>
                          <span className="text-[11px] font-black text-white truncate group-hover:text-sky-300 transition-colors">
                            {unit.name}
                          </span>
                        </div>

                        {/* Status Pill & Temp */}
                        <div className="flex items-center gap-1.5 shrink-0 font-mono text-[10px]">
                          <span className={`font-bold ${
                            unit.temp > 80 ? 'text-rose-400' : unit.temp > 60 ? 'text-amber-400' : 'text-emerald-400'
                          }`}>
                            {unit.temp}°C
                          </span>
                          <span className={`w-2 h-2 rounded-full shrink-0 ${
                            isCritical ? 'bg-rose-500 pulse-critical' : 'bg-emerald-400'
                          }`} />
                        </div>
                      </div>

                      {/* Hardware Faceplate Simulation (Drive Caddies & LED Array) */}
                      <div className="flex items-center justify-between mt-1 pt-1 border-t border-slate-800/80 text-[9px] text-slate-400">
                        {/* 4 Simulated SFF SSD Caddies */}
                        <div className="flex items-center gap-0.5">
                          {[1, 2, 3, 4].map(slot => (
                            <div 
                              key={slot}
                              className={`w-3.5 h-2 rounded-xs border ${
                                isCritical && slot === 2 
                                  ? 'bg-rose-500/40 border-rose-500' 
                                  : 'bg-slate-950 border-slate-800'
                              }`} 
                              title={`Disk Slot ${slot}: OK`}
                            />
                          ))}
                        </div>

                        {/* Telemetry Micro-Stats */}
                        <div className="flex items-center gap-2 font-mono text-[9px]">
                          <span className="text-slate-400">CPU: <strong className="text-slate-200">{unit.cpu}%</strong></span>
                          <span className="text-slate-400">RAM: <strong className="text-slate-200">{unit.ram}%</strong></span>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Rack Floor Power Foot */}
              <div className="py-1 px-2 bg-slate-950 rounded-lg text-center text-[9px] font-mono text-slate-600 border border-slate-800/80">
                ROOM ALPHA • AISLE 01
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
};
