import React from 'react';
import { UI_STYLES, cn } from '../../styles/theme';

export type BadgeVariant = 'success' | 'warning' | 'critical' | 'info' | 'admin' | 'tech' | 'neutral' | 'pill';

interface UiBadgeProps {
  variant?: BadgeVariant;
  children: React.ReactNode;
  className?: string;
  icon?: React.ReactNode;
}

export const UiBadge: React.FC<UiBadgeProps> = ({
  variant = 'info',
  children,
  className,
  icon
}) => {
  const variantClass = UI_STYLES.badges[variant] || UI_STYLES.badges.info;

  return (
    <span className={cn(variantClass, className)}>
      {icon}
      {children}
    </span>
  );
};
