/**
 * AR-IMMS Centralized UI Design Tokens & Theme Presets
 * Provides single source of truth for styles, surfaces, buttons, badges, tables, and forms.
 */

export function cn(...classes: (string | boolean | undefined | null)[]): string {
  return classes.filter(Boolean).join(' ');
}

export const UI_STYLES = {
  // Surfaces & Backgrounds
  surfaces: {
    appBg: "bg-[#080b0e] text-slate-100",
    pageContainer: "flex-1 overflow-y-auto p-4 lg:p-6 space-y-5 bg-[#080b0e] text-slate-100",
    maxContainer: "p-4 md:p-6 max-w-[1600px] mx-auto flex flex-col gap-6 text-slate-100",
    card: "bg-[#0c1015] border border-[#222c37] p-4 rounded-2xl flex flex-col justify-between relative overflow-hidden shadow-md",
    cardGlass: "glass-card rounded-2xl overflow-hidden flex flex-col",
    cardSurface: "bg-[#0c1015] border border-[#222c37] rounded-2xl overflow-hidden flex flex-col shadow-lg",
    subtlePanel: "bg-[#11161b] p-3 rounded-xl border border-[#222c37]",
    darkPanel: "bg-[#161d24] border border-[#222c37]",
  },

  // Headers & Section Dividers
  headers: {
    viewHeader: "flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-[#222c37] pb-5",
    title: "text-xl lg:text-2xl font-black text-white tracking-tight flex items-center gap-2",
    subtitle: "text-xs text-slate-400 mt-1",
    sectionTitle: "text-xs font-bold text-white uppercase tracking-wider font-mono flex items-center gap-2",
    cardHeader: "px-5 py-3.5 border-b border-[#222c37] flex justify-between items-center bg-[#11161b]",
  },

  // Interactive Buttons
  buttons: {
    primary: "bg-[#38bdf8] hover:bg-[#0284c7] text-slate-950 text-xs font-bold px-4 py-2 rounded-xl transition-all shadow-md flex items-center justify-center gap-1.5 cursor-pointer active:scale-95 disabled:opacity-50",
    secondary: "bg-[#11161b] hover:bg-[#1a222a] text-slate-300 hover:text-white text-xs font-bold px-3 py-2 rounded-xl border border-[#222c37] transition-all flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-50",
    danger: "bg-rose-500/10 hover:bg-rose-500/20 text-rose-300 border border-rose-500/30 text-xs font-bold px-3 py-2 rounded-xl transition-all flex items-center justify-center gap-1.5 cursor-pointer",
    iconAction: "p-1.5 rounded-lg border transition-all flex items-center justify-center cursor-pointer",
    tabActive: "flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all bg-[#38bdf8] text-slate-950 shadow-md cursor-pointer",
    tabInactive: "flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all text-slate-400 hover:text-white cursor-pointer",
    tabWrapper: "flex items-center bg-[#11161b] p-1 rounded-xl border border-[#222c37]",
  },

  // Form Controls
  forms: {
    inputSearch: "bg-[#161d24] border border-[#222c37] text-xs text-slate-200 rounded-lg pl-8 pr-3 py-1.5 focus:outline-none focus:border-[#38bdf8] font-mono",
    select: "bg-[#11161b] border border-[#222c37] text-slate-300 text-xs rounded-xl px-3 py-2 pr-8 appearance-none focus:outline-none focus:border-[#38bdf8] cursor-pointer outline-none",
    searchWrapper: "flex items-center bg-[#11161b] rounded-xl px-3 py-1.5 border border-[#222c37] focus-within:border-[#38bdf8] transition-colors",
  },

  // Tables
  tables: {
    wrapper: "overflow-x-auto",
    table: "w-full text-left border-collapse",
    headTr: "border-b border-[#222c37] bg-[#0c1015] text-[11px] text-slate-400 font-mono uppercase",
    body: "text-xs divide-y divide-[#1e2733]",
    row: "hover:bg-[#161d24] transition-colors",
    cell: "p-3",
  },

  // Status Badges & Pills
  badges: {
    pill: "px-2.5 py-0.5 rounded-full text-[10px] font-bold font-mono tracking-wider uppercase bg-sky-500/10 text-sky-400 border border-sky-500/20",
    success: "inline-flex items-center gap-1 text-emerald-300 bg-emerald-500/10 border border-emerald-500/20 px-2 py-0.5 rounded-md text-[10px] font-bold font-mono",
    warning: "inline-flex items-center gap-1 text-amber-300 bg-amber-500/10 border border-amber-500/20 px-2 py-0.5 rounded-md text-[10px] font-bold font-mono",
    critical: "inline-flex items-center gap-1 text-rose-300 bg-rose-500/10 border border-rose-500/20 px-2 py-0.5 rounded-md text-[10px] font-bold font-mono",
    info: "inline-flex items-center gap-1 text-sky-300 bg-sky-500/10 border border-sky-500/20 px-2 py-0.5 rounded-md text-[10px] font-bold font-mono",
    admin: "inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-[10px] font-bold border font-mono bg-indigo-500/20 text-indigo-300 border-indigo-500/30",
    tech: "inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-[10px] font-bold border font-mono bg-sky-500/20 text-sky-300 border-sky-500/30",
    neutral: "inline-flex items-center gap-1 text-slate-400 bg-slate-800 px-2 py-0.5 rounded-md text-[10px] font-bold font-mono",
  },

  // KPI Metrics
  kpi: {
    label: "text-[11px] font-bold text-slate-400 uppercase tracking-wider font-mono",
    value: "text-2xl lg:text-3xl font-black text-white font-mono",
    iconBoxSuccess: "p-2 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20",
    iconBoxInfo: "p-2 rounded-xl bg-sky-500/10 text-sky-400 border border-sky-500/20",
    iconBoxDanger: "p-2 rounded-xl bg-rose-500/10 text-rose-400 border border-rose-500/20",
    tagSuccess: "text-xs font-semibold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-md font-mono",
    tagInfo: "text-xs font-semibold text-sky-400 bg-sky-500/10 px-2 py-0.5 rounded-md font-mono",
    tagDanger: "text-xs font-semibold text-rose-400 bg-rose-500/10 px-2 py-0.5 rounded-md font-mono",
  }
} as const;
