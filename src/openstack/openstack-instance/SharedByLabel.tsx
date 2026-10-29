import { ReactNode } from 'react';

// Who shares a network or subnet goes beside its name rather than into it: it
// stays in view when a long name is cut short, and the name reads as it is.
export const SharedByLabel = ({
  label,
  sharedBy,
}: {
  label: ReactNode;
  sharedBy?: string;
}) =>
  sharedBy ? (
    <span className="flex min-w-0 items-baseline gap-2">
      <span className="truncate">{label}</span>
      <span className="shrink-0 text-sm text-tertiary">{sharedBy}</span>
    </span>
  ) : (
    <>{label}</>
  );
