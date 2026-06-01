import * as React from 'react';
import { cn } from '@/lib/utils/cn';

export type ButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: 'primary' | 'ghost' | 'outline';
};

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = 'primary', ...props }, ref) => {
    const base =
      'inline-flex min-h-10 items-center justify-center rounded-lg text-sm font-semibold transition duration-150 ease-out active:scale-[0.99] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-60 disabled:active:scale-100 ring-offset-surface';

    const variants: Record<typeof variant, string> = {
      primary:
        'bg-accent px-4 py-2 text-accent-foreground hover:bg-accent-soft',
      ghost:
        'border border-transparent bg-transparent px-3 py-2 text-text hover:bg-surface-muted',
      outline:
        'border border-border bg-surface px-4 py-2 text-text hover:bg-surface-muted',
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
