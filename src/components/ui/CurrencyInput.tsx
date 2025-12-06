import React from 'react';
import { cn } from '../../lib/utils';

interface CurrencyInputProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'onChange' | 'value'> {
  value: number;
  onChange: (value: number) => void;
}

export const CurrencyInput = React.forwardRef<HTMLInputElement, CurrencyInputProps>(
  ({ className, value, onChange, ...props }, ref) => {
    
    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      // Remove dots to get the raw number string
      const rawValue = e.target.value.replace(/\./g, '');
      
      // Allow only numbers
      if (/^\d*$/.test(rawValue)) {
        const numberValue = rawValue === '' ? 0 : parseInt(rawValue, 10);
        onChange(numberValue);
      }
    };

    // Format the current value for display
    const displayValue = (value ?? 0) === 0 && props.placeholder ? '' : (value ?? 0).toLocaleString('id-ID');

    return (
      <input
        {...props}
        ref={ref}
        type="text"
        value={(value ?? 0) === 0 && props.placeholder && (value ?? 0).toString() !== '0' ? '' : displayValue}
        onChange={handleChange}
        className={cn(
          "focus:ring-primary focus:border-primary block w-full sm:text-sm border-2 border-slate-400 rounded-md",
          className
        )}
      />
    );
  }
);

CurrencyInput.displayName = 'CurrencyInput';
