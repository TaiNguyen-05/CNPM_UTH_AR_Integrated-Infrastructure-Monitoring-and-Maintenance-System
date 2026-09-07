/**
 * AR-IMMS Centralized UI Design Tokens & Theme Presets
 * Provides single source of truth for styles, surfaces, buttons, badges, tables, and forms.
 */

export function cn(...classes: (string | boolean | undefined | null)[]): string {
  return classes.filter(Boolean).join(' ');
}

export const UI_STYLES = {
  // Khung giao diện (Surfaces)
  surfaces: {
    appBg: "bg-[#080b0e] text-slate-100",
    pageContainer: "flex-1 overflow-y-auto p-4 lg:p-6 space-y-5 bg-[#080b0e] text-slate-100",
    maxContainer: "p-4 md:p-6 max-w-[1600px] mx-auto flex flex-col gap-6 text-slate-100",
    card: "card-surface p-4 flex flex-col justify-between relative overflow-hidden",
    cardGlass: "glass-card rounded-2xl overflow-hidden flex flex-col",
    cardSurface: "card-surface",
    subtlePanel: "panel-subtle",
    darkPanel: "bg-[#161d24] border border-[#222c37]",
  },

  // Tiêu đề & Header
  headers: {
    viewHeader: "flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-[#222c37] pb-5",
    title: "text-xl lg:text-2xl font-black text-white tracking-tight flex items-center gap-2",
    subtitle: "text-xs text-slate-400 mt-1",
    sectionTitle: "text-xs font-bold text-white uppercase tracking-wider font-mono flex items-center gap-2",
    cardHeader: "card-header",
  },

  // Nút bấm (Buttons)
  buttons: {
    primary: "btn-primary",
    secondary: "btn-secondary",
    danger: "btn-danger",
    iconAction: "p-1.5 rounded-lg border transition-all flex items-center justify-center cursor-pointer",
    tabActive: "btn-tab-active",
    tabInactive: "btn-tab-inactive",
    tabWrapper: "flex items-center bg-[#11161b] p-1 rounded-xl border border-[#222c37]",
  },

  // Ô nhập liệu (Forms)
  forms: {
    inputSearch: "input-dark pl-8 pr-3 py-1.5",
    select: "select-dark",
    searchWrapper: "flex items-center bg-[#11161b] rounded-xl px-3 py-1.5 border border-[#222c37] focus-within:border-[#38bdf8] transition-colors",
  },

  // Bảng dữ liệu (Tables)
  tables: {
    wrapper: "overflow-x-auto",
    table: "w-full text-left border-collapse",
    headTr: "border-b border-[#222c37] bg-[#0c1015] text-[11px] text-slate-400 font-mono uppercase",
    body: "text-xs divide-y divide-[#1e2733]",
    row: "hover:bg-[#161d24] transition-colors",
    cell: "p-3",
  },

  // Nhãn trạng thái (Badges)
  badges: {
    pill: "px-2.5 py-0.5 rounded-full text-[10px] font-bold font-mono tracking-wider uppercase bg-sky-500/10 text-sky-400 border border-sky-500/20",
    success: "badge-active",
    warning: "badge-pending",
    critical: "badge-locked",
    info: "badge-tech",
    admin: "badge-admin",
    tech: "badge-tech",
    neutral: "inline-flex items-center gap-1 text-slate-400 bg-slate-800 px-2 py-0.5 rounded-md text-[10px] font-bold font-mono",
  },

  // Chỉ số KPI
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
