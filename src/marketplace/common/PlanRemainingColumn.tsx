import { FunctionComponent } from 'react';
import { Badge } from 'react-bootstrap';

const getColor = (value) =>
  value === null
    ? 'primary'
    : value < 0.6
    ? 'warning'
    : value < 0.8
    ? 'danger'
    : 'success';

export const PlanRemainingColumn: FunctionComponent<{ row }> = ({ row }) => (
  <Badge
    bg={getColor(row.remaining)}
    className="me-2 ms-2"
    style={{ fontSize: 12 }}
  >
    {row.remaining === null ? 'N/A' : row.remaining}
  </Badge>
);
