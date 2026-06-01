import * as React from 'react';
import { cn } from '@/lib/utils/cn';

type BadgeVariant =
  | 'default'
  | 'success'
  | 'warning'
  | 'danger'
  | 'info'
  | 'slate';

type BadgeProps = React.HTMLAttributes<HTMLSpanElement> & {
  variant?: BadgeVariant;
};

export function Badge({
  className,
  variant = 'default',
  ...props
}: BadgeProps) {
  const variants: Record<BadgeVariant, string> = {
    default: 'bg-[#F3E4D5] text-accent ring-[#D2B59D]',
    success: 'bg-[#E5EBD9] text-success ring-[#C8D3B1]',
    warning: 'bg-[#F7E6C7] text-warning ring-[#E3C38D]',
    danger: 'bg-destructive-muted text-destructive ring-[#EDC0B6]',
    info: 'bg-[#DCE9EA] text-info ring-[#B8CDD1]',
    slate: 'bg-surface-muted text-text-muted ring-border',
  };

  return (
    <span
      className={cn(
        'inline-flex items-center rounded-md px-2 py-1 text-xs font-semibold ring-1 ring-inset',
        variants[variant],
        className,
      )}
      {...props}
    />
  );
}
