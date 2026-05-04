import { StateIndicator } from '@/core/StateIndicator';
import { renderFieldOrDash } from '@/table/utils';

const VARIANTS: Record<string, string> = {
  ONLINE: 'success',
  OFFLINE: 'danger',
  DEGRADED: 'warning',
  ERROR: 'danger',
  DRAINING: 'warning',
  NO_MONITOR: 'secondary',
};

export const OperatingStatusBadge = ({
  status,
}: {
  status?: string | null;
}) => {
  if (!status) return renderFieldOrDash(status);
  const variant = VARIANTS[status] || 'secondary';
  return (
    <StateIndicator label={status} variant={variant as any} outline pill />
  );
};
