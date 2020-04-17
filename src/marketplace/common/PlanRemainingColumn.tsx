import * as React from 'react';
import * as Label from 'react-bootstrap/lib/Label';

const getColor = value =>
  value === null
    ? 'primary'
    : value < 0.6
    ? 'warning'
    : value < 0.8
    ? 'danger'
    : 'success';

export const PlanRemainingColumn = ({ row }) => (
  <Label
    bsStyle={getColor(row.remaining)}
    className="m-r-sm m-l-sm"
    style={{ fontSize: 12 }}
  >
    {row.remaining === null ? 'N/A' : row.remaining}
  </Label>
);
