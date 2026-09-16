import { FC } from 'react';

import { BadgeVariant } from 'waldur-ui';
import { Badge } from 'waldur-ui';

import { renderFieldOrDash } from '@/table/utils';

// Display-only colour mapping off the backend's status/priority strings.
// Unknown values fall back to a neutral badge — no behavioural coupling.
const STATUS_VARIANTS: Record<string, BadgeVariant> = {
  open: 'warning',
  new: 'warning',
  'in progress': 'info',
  in_progress: 'info',
  resolved: 'success',
  closed: 'secondary',
  canceled: 'secondary',
  cancelled: 'secondary',
};

const PRIORITY_VARIANTS: Record<string, BadgeVariant> = {
  blocker: 'danger',
  critical: 'danger',
  high: 'warning',
  major: 'warning',
  medium: 'info',
  normal: 'info',
  low: 'secondary',
  minor: 'secondary',
};

const variantFor = (
  map: Record<string, BadgeVariant>,
  value: string | null | undefined,
): BadgeVariant =>
  value ? (map[value.toLowerCase()] ?? 'secondary') : 'secondary';

export const TicketStatusBadge: FC<{ status: string | null }> = ({
  status,
}) => {
  if (!status) return <>{renderFieldOrDash(status)}</>;
  return (
    <Badge
      variant={variantFor(STATUS_VARIANTS, status)}
      shape="pill"
      tone="outline"
    >
      {status}
    </Badge>
  );
};

export const TicketPriorityBadge: FC<{ priority: string | null }> = ({
  priority,
}) => {
  if (!priority) return <>{renderFieldOrDash(priority)}</>;
  return (
    <Badge
      variant={variantFor(PRIORITY_VARIANTS, priority)}
      shape="pill"
      tone="outline"
    >
      {priority}
    </Badge>
  );
};
