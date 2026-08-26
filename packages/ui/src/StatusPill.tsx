import { Badge } from './Badge';
import { cn } from './cn';

/**
 * The dot+label "status" shape from the dashboard mockup — composes the
 * shadcn-recipe Badge (see Badge.tsx) rather than duplicating its variant
 * plumbing, adding just the leading dot and pill (rounded-full, not
 * Badge's own rounded-md default) shape. Not a port of src/core/Badge.tsx
 * (the existing Bootstrap Badge wrapper) or any of src/'s feature-specific
 * status badges (ProjectLifecycleBadge, QuotaBadge, etc.) — general-purpose
 * component names collide, but this is specifically this mockup's shape.
 *
 * Deliberately does NOT use Badge's own variant/tone color system —
 * TONE_CLASSES below overrides bg/text/border directly with this
 * component's own --pill-* tokens (surfaceColors.css), unchanged since
 * before Badge grew a real Metronic-parity variant/tone system. Coupling
 * this to Badge's variant colors would have silently changed this
 * already-shipped mockup's appearance the moment Badge's own "success"/
 * "warning"/etc. variants started meaning something different (a real
 * Metronic-verified solid fill, not this component's own muted look).
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

const TONE_CLASSES: Record<StatusTone, string> = {
  success:
    'border-transparent bg-[var(--pill-success-bg)] text-[var(--pill-success-text)]',
  warning:
    'border-transparent bg-[var(--pill-warning-bg)] text-[var(--pill-warning-text)]',
  danger:
    'border-transparent bg-[var(--pill-danger-bg)] text-[var(--pill-danger-text)]',
  neutral:
    'border-transparent bg-[var(--pill-neutral-bg)] text-[var(--pill-neutral-text)]',
};

export const StatusPill = ({
  label,
  tone = 'neutral',
  className,
}: StatusPillProps) => (
  <Badge
    pill
    className={cn('w-fit gap-1.5 font-medium', TONE_CLASSES[tone], className)}
  >
    <span className={cn('size-1.5 rounded-full', DOT_CLASSES[tone])} />
    {label}
  </Badge>
);
