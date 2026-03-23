import * as React from 'react';
import { cn } from '@/lib/utils/cn';

export type ButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: 'primary' | 'ghost' | 'outline';
};

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = 'primary', ...props }, ref) => {
    const base =
      'inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 disabled:opacity-60 disabled:cursor-not-allowed ring-offset-surface';

    const variants: Record<typeof variant, string> = {
      primary:
        'bg-accent text-surface hover:bg-accent-soft px-4 py-2 shadow-sm',
      ghost:
        'bg-transparent text-text hover:bg-surface-muted/60 px-3 py-2 border border-transparent',
      outline:
        'bg-transparent text-text border border-border px-4 py-2 hover:bg-surface-muted/60',
    };

    return (
      <button
        ref={ref}
        className={cn(base, variants[variant], className)}
        {...props}
      />
    );
  },
);

Button.displayName = 'Button';
