import React from 'react';
import { Search } from 'lucide-react';
import { UI_STYLES, cn } from '../../styles/theme';

interface UiSearchInputProps {
  value: string;
  onChange: (val: string) => void;
  placeholder?: string;
  className?: string;
  inputClassName?: string;
  onClear?: () => void;
}

export const UiSearchInput: React.FC<UiSearchInputProps> = ({
  value,
  onChange,
  placeholder = 'Tìm kiếm...',
  className,
  inputClassName,
  onClear
}) => {
  return (
    <div className={cn("relative flex items-center", className)}>
      <input
        type="text"
        placeholder={placeholder}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className={cn(UI_STYLES.forms.inputSearch, inputClassName)}
      />
      <Search className="w-3.5 h-3.5 text-slate-500 absolute left-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
      {value && onClear && (
        <button
          onClick={onClear}
          className="text-slate-500 hover:text-white absolute right-2 top-1/2 -translate-y-1/2 text-xs cursor-pointer"
        >
          ✕
        </button>
      )}
    </div>
  );
};
