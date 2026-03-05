import { Badge } from '@waldur/core/Badge';
import { renderFieldOrDash } from '@waldur/table/utils';

const STATUS_COLORS = {
  Open: 'primary',
  'Waiting for support': 'warning',
  Closed: 'danger',
  Resolved: 'default',
};

export const IssueStatus = ({ status }) => (
  <Badge
    variant={STATUS_COLORS[status] || 'default'}
    size="sm"
    pill
    outline
    className="flex-shrink-0"
  >
    {renderFieldOrDash(status)}
  </Badge>
);
