import { Badge } from './Badge';
import { cn } from './cn';

/**
 * The dot+label "status" shape from the dashboard mockup — composes the
 * shadcn-recipe Badge (see Badge.tsx) rather than duplicating its variant
 * plumbing, adding just the leading dot and pill (rounded-full, not
 * Badge's own rounded-md) shape. Not a port of src/core/Badge.tsx (the
 * existing Bootstrap Badge wrapper) or any of src/'s feature-specific
 * status badges (ProjectLifecycleBadge, QuotaBadge, etc.) — those are
 * general-purpose; this is specifically this mockup's shape.
 */
export type StatusTone = 'success' | 'warning' | 'danger' | 'neutral';

export interface StatusPillProps {
  label: string;
  tone?: StatusTone;
  className?: string;
}

const DOT_CLASSES: Record<StatusTone, string> = {
  success: 'bg-[var(--pill-success-dot)]',
  warning: 'bg-[var(--pill-warning-dot)]',
  danger: 'bg-[var(--pill-danger-dot)]',
  neutral: 'bg-[var(--pill-neutral-dot)]',
};

export const StatusPill = ({
  label,
  tone = 'neutral',
  className,
}: StatusPillProps) => (
  <Badge
    variant={tone}
    className={cn('w-fit gap-1.5 rounded-full font-medium', className)}
  >
    <span className={cn('size-1.5 rounded-full', DOT_CLASSES[tone])} />
    {label}
  </Badge>
);
