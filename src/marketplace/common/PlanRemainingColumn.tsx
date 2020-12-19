import { FunctionComponent } from 'react';
import { Label } from 'react-bootstrap';

const getColor = (value) =>
  value === null
    ? 'primary'
    : value < 0.6
    ? 'warning'
    : value < 0.8
    ? 'danger'
    : 'success';

export const PlanRemainingColumn: FunctionComponent<{ row }> = ({ row }) => (
  <Label
    bsStyle={getColor(row.remaining)}
    className="m-r-sm m-l-sm"
    style={{ fontSize: 12 }}
  >
    {row.remaining === null ? 'N/A' : row.remaining}
  </Label>
);
