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
    appBg: "bg-app",
    pageContainer: "page-container",
    maxContainer: "max-container",
    card: "card-base",
    cardGlass: "card-glass",
    cardSurface: "card-surface",
    subtlePanel: "panel-subtle",
    darkPanel: "panel-dark",
  },

  // Tiêu đề & Header
  headers: {
    viewHeader: "view-header",
    title: "view-title",
    subtitle: "view-subtitle",
    sectionTitle: "section-title",
    cardHeader: "card-header",
  },

  // Nút bấm (Buttons)
  buttons: {
    primary: "btn-primary",
    secondary: "btn-secondary",
    danger: "btn-danger",
    iconAction: "btn-icon",
    tabActive: "btn-tab-active",
    tabInactive: "btn-tab-inactive",
    tabWrapper: "tab-wrapper",
  },

  // Ô nhập liệu (Forms)
  forms: {
    inputSearch: "input-search",
    select: "select-dark",
    searchWrapper: "search-wrapper",
  },

  // Bảng dữ liệu (Tables)
  tables: {
    wrapper: "table-wrapper",
    table: "table-main",
    headTr: "table-head-tr",
    body: "table-body",
    row: "table-row",
    cell: "table-cell",
  },

  // Nhãn trạng thái (Badges)
  badges: {
    pill: "badge-pill",
    success: "badge-active",
    warning: "badge-pending",
    critical: "badge-locked",
    info: "badge-tech",
    admin: "badge-admin",
    tech: "badge-tech",
    neutral: "badge-neutral",
  },

  // Chỉ số KPI
  kpi: {
    label: "kpi-label",
    value: "kpi-value",
    iconBoxSuccess: "kpi-icon-success",
    iconBoxInfo: "kpi-icon-info",
    iconBoxDanger: "kpi-icon-danger",
    tagSuccess: "kpi-tag-success",
    tagInfo: "kpi-tag-info",
    tagDanger: "kpi-tag-danger",
  }
} as const;
