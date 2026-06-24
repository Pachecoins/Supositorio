import type { ButtonHTMLAttributes } from 'react';
import { cn } from '@/lib/utils';

type Variant = 'primary' | 'secondary' | 'danger' | 'ghost';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
}

const variantClasses: Record<Variant, string> = {
  primary: 'bg-accent text-white hover:bg-accent2 disabled:opacity-50',
  secondary: 'bg-panel2 text-white border border-border hover:border-accent disabled:opacity-50',
  danger: 'bg-red-600/90 text-white hover:bg-red-600 disabled:opacity-50',
  ghost: 'bg-transparent text-zinc-300 hover:bg-panel2 disabled:opacity-50',
};

export function Button({ variant = 'primary', className, ...props }: ButtonProps) {
  return (
    <button
      className={cn(
        'inline-flex items-center justify-center gap-2 rounded-md px-3.5 py-2 text-sm font-medium transition-colors',
        variantClasses[variant],
        className
      )}
      {...props}
    />
  );
}
