import * as React from 'react';
import { cn } from '@/lib/utils';

interface OtpInputProps {
  value: string;
  onChange: (value: string) => void;
  length?: number;
  disabled?: boolean;
  error?: boolean;
  autoFocus?: boolean;
}

export function OtpInput({
  value,
  onChange,
  length = 6,
  disabled = false,
  error = false,
  autoFocus = true,
}: OtpInputProps) {
  const inputRefs = React.useRef<(HTMLInputElement | null)[]>([]);

  // Split value into array of digits
  const digits = React.useMemo(() => {
    const chars = value.split('');
    return Array.from({ length }, (_, i) => chars[i] || '');
  }, [value, length]);

  const focusInput = (index: number) => {
    if (index >= 0 && index < length) {
      inputRefs.current[index]?.focus();
    }
  };

  const handleChange = (index: number, digit: string) => {
    // Only allow single digit
    const cleanDigit = digit.replace(/\D/g, '').slice(-1);

    // Build new value
    const newDigits = [...digits];
    newDigits[index] = cleanDigit;
    const newValue = newDigits.join('');

    onChange(newValue);

    // Move to next input if digit entered
    if (cleanDigit && index < length - 1) {
      focusInput(index + 1);
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    switch (e.key) {
      case 'Backspace':
        e.preventDefault();
        if (digits[index]) {
          // Clear current digit
          handleChange(index, '');
        } else if (index > 0) {
          // Move to previous and clear
          focusInput(index - 1);
          handleChange(index - 1, '');
        }
        break;
      case 'ArrowLeft':
        e.preventDefault();
        focusInput(index - 1);
        break;
      case 'ArrowRight':
        e.preventDefault();
        focusInput(index + 1);
        break;
      case 'Delete':
        e.preventDefault();
        handleChange(index, '');
        break;
    }
  };

  const handlePaste = (e: React.ClipboardEvent) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, length);
    onChange(pastedData);

    // Focus the input after the last pasted digit
    const nextIndex = Math.min(pastedData.length, length - 1);
    focusInput(nextIndex);
  };

  const handleFocus = (e: React.FocusEvent<HTMLInputElement>) => {
    e.target.select();
  };

  return (
    <div className="flex gap-2 justify-center">
      {digits.map((digit, index) => (
        <input
          key={index}
          ref={(el) => (inputRefs.current[index] = el)}
          type="text"
          inputMode="numeric"
          maxLength={1}
          value={digit}
          onChange={(e) => handleChange(index, e.target.value)}
          onKeyDown={(e) => handleKeyDown(index, e)}
          onPaste={handlePaste}
          onFocus={handleFocus}
          disabled={disabled}
          autoFocus={autoFocus && index === 0}
          aria-label={`Digit ${index + 1} of ${length}`}
          className={cn(
            'w-12 h-14 text-center text-2xl font-semibold rounded-lg border-2 transition-all duration-200',
            'focus:outline-none focus:ring-2 focus:ring-offset-2',
            disabled && 'bg-muted cursor-not-allowed opacity-50',
            error
              ? 'border-destructive focus:border-destructive focus:ring-destructive'
              : 'border-input focus:border-primary focus:ring-primary',
            digit && !error && 'border-primary bg-primary/5'
          )}
        />
      ))}
    </div>
  );
}
