import type { BadgeVariant } from '../Badge';

/** Every Badge variant except `secondary`, which is a pale tint with no bar use. */
export type ProgressVariant = Exclude<BadgeVariant, 'secondary'>;
export type ProgressSize = 'xs' | 'sm' | 'md' | 'lg';

// Static strings, one per variant, so Tailwind's scanner sees every class.
// The colours live in waldur-design-tokens/progressColors.css.
export const PROGRESS_FILL: Record<ProgressVariant, string> = {
  primary: 'bg-[var(--progress-fill-primary)]',
  success: 'bg-[var(--progress-fill-success)]',
  warning: 'bg-[var(--progress-fill-warning)]',
  danger: 'bg-[var(--progress-fill-danger)]',
  info: 'bg-[var(--progress-fill-info)]',
  neutral: 'bg-[var(--progress-fill-neutral)]',
  purple: 'bg-[var(--progress-fill-purple)]',
  blue: 'bg-[var(--progress-fill-blue)]',
  indigo: 'bg-[var(--progress-fill-indigo)]',
  moss: 'bg-[var(--progress-fill-moss)]',
  pink: 'bg-[var(--progress-fill-pink)]',
  teal: 'bg-[var(--progress-fill-teal)]',
  orange: 'bg-[var(--progress-fill-orange)]',
  rose: 'bg-[var(--progress-fill-rose)]',
};

export const PROGRESS_SIZE: Record<ProgressSize, string> = {
  xs: 'h-[var(--progress-height-xs)] rounded-[var(--progress-radius)]',
  sm: 'h-[var(--progress-height-sm)] rounded-[var(--progress-radius)]',
  md: 'h-[var(--progress-height-md)] rounded-[var(--progress-radius)]',
  lg: 'h-[var(--progress-height-lg)] rounded-[var(--progress-radius-lg)] text-[0.85rem] font-medium',
};

// Text colour for a label drawn inside a segment (see progressColors.css).
export const PROGRESS_LABEL: Record<ProgressVariant, string> = {
  primary: 'text-[var(--progress-label-primary)]',
  success: 'text-[var(--progress-label-success)]',
  warning: 'text-[var(--progress-label-warning)]',
  danger: 'text-[var(--progress-label-danger)]',
  info: 'text-[var(--progress-label-info)]',
  neutral: 'text-[var(--progress-label-neutral)]',
  purple: 'text-[var(--progress-label-purple)]',
  blue: 'text-[var(--progress-label-blue)]',
  indigo: 'text-[var(--progress-label-indigo)]',
  moss: 'text-[var(--progress-label-moss)]',
  pink: 'text-[var(--progress-label-pink)]',
  teal: 'text-[var(--progress-label-teal)]',
  orange: 'text-[var(--progress-label-orange)]',
  rose: 'text-[var(--progress-label-rose)]',
};
