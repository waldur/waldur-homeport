import { Badge } from '@/core/Badge';
import { renderFieldOrDash } from '@/table/utils';

const STATUS_COLORS = {
  Open: 'primary',
  'Waiting for support': 'warning',
  Closed: 'danger',
  Resolved: 'default',
  // Terminal like Closed. This is the spelling Waldur seeds and the one its
  // status-type label uses; a status an operator named something else falls
  // through to the neutral badge below, as any custom name does.
  Canceled: 'danger',
};

export const IssueStatus = ({ status }) => {
  if (!status) {
    return <>{renderFieldOrDash(status)}</>;
  }
  return (
    <Badge
      variant={STATUS_COLORS[status] || 'default'}
      size="sm"
      pill
      outline
      className="flex-shrink-0"
    >
      {status}
    </Badge>
  );
};
