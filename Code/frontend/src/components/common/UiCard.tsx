import React from 'react';
import { UI_STYLES, cn } from '../../styles/theme';

interface UiCardProps {
  children: React.ReactNode;
  className?: string;
  variant?: 'card' | 'cardSurface' | 'cardGlass';
}

export const UiCard: React.FC<UiCardProps> = ({
  children,
  className,
  variant = 'cardSurface'
}) => {
  const surfaceClass = UI_STYLES.surfaces[variant] || UI_STYLES.surfaces.cardSurface;

  return (
    <div className={cn(surfaceClass, className)}>
      {children}
    </div>
  );
};

interface UiKpiCardProps {
  label: string;
  value: string | number;
  tagText?: string;
  variant?: 'success' | 'info' | 'danger';
  icon: React.ReactNode;
  className?: string;
}

export const UiKpiCard: React.FC<UiKpiCardProps> = ({
  label,
  value,
  tagText,
  variant = 'info',
  icon,
  className
}) => {
  const iconBoxClass = variant === 'success' 
    ? UI_STYLES.kpi.iconBoxSuccess 
    : variant === 'danger' 
    ? UI_STYLES.kpi.iconBoxDanger 
    : UI_STYLES.kpi.iconBoxInfo;

  const tagClass = variant === 'success' 
    ? UI_STYLES.kpi.tagSuccess 
    : variant === 'danger' 
    ? UI_STYLES.kpi.tagDanger 
    : UI_STYLES.kpi.tagInfo;

  return (
    <div className={cn(UI_STYLES.surfaces.card, className)}>
      <div className="flex justify-between items-center mb-2">
        <span className={UI_STYLES.kpi.label}>{label}</span>
        <div className={iconBoxClass}>
          {icon}
        </div>
      </div>
      <div className="flex items-baseline gap-2">
        <span className={UI_STYLES.kpi.value}>{value}</span>
        {tagText && (
          <span className={tagClass}>
            {tagText}
          </span>
        )}
      </div>
    </div>
  );
};
