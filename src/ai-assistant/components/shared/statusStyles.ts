// The row of the status line and of the thinking header.
export const STATUS_ROW =
  'inline-flex max-w-full min-h-5 items-center gap-1.5 text-sm font-medium text-secondary whitespace-normal';

// A highlight moving across the text. Reduced motion gets plain text.
export const SHIMMER =
  'bg-[linear-gradient(90deg,var(--text-secondary)_35%,var(--text-quaternary)_50%,var(--text-secondary)_65%)] bg-size-[220%_100%] bg-clip-text text-transparent animate-[waldur-shimmer_1.8s_linear_infinite] motion-reduce:animate-none motion-reduce:bg-none motion-reduce:text-secondary';
