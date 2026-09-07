import React from 'react';
import { UI_STYLES, cn } from '../../styles/theme';

export type ButtonVariant = 'primary' | 'secondary' | 'danger' | 'iconAction';

interface UiButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  icon?: React.ReactNode;
  children?: React.ReactNode;
  className?: string;
}

export const UiButton: React.FC<UiButtonProps> = ({
  variant = 'primary',
  icon,
  children,
  className,
  disabled,
  ...props
}) => {
  const variantClass = UI_STYLES.buttons[variant] || UI_STYLES.buttons.primary;

  return (
    <button
      className={cn(variantClass, className)}
      disabled={disabled}
      {...props}
    >
      {icon}
      {children}
    </button>
  );
};
