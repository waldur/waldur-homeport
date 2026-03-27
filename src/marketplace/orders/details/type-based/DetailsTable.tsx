import { ArrowUpIcon, ArrowDownIcon } from '@phosphor-icons/react';
import { createElement, ReactNode } from 'react';
import { Card } from 'react-bootstrap';

import { Badge } from '@waldur/core/Badge';
import { DASH_ESCAPE_CODE } from '@waldur/table/constants';
import { Column } from '@waldur/table/types';

interface ValueIndicatorProps {
  value: string | number;
  isPositive?: boolean;
  isZero?: boolean;
}

export const ValueIndicator = ({
  value,
  isPositive = true,
  isZero = false,
}: ValueIndicatorProps) => {
  if (isZero) {
    return DASH_ESCAPE_CODE;
  }

  const variant = isPositive ? 'success' : 'danger';
  const icon = isPositive ? (
    <ArrowUpIcon weight="bold" size={16} />
  ) : (
    <ArrowDownIcon weight="bold" size={16} />
  );

  return (
    <Badge variant={variant} size="sm" leftIcon={icon} pill outline>
      {value}
    </Badge>
  );
};

interface DetailsTableProps<RowType> {
  columns: Column<RowType>[];
  rows: any[];
  totalRow?: ReactNode | ((columnCount: number) => ReactNode);
}

export const DetailsTable = <RowType,>({
  columns,
  rows,
  totalRow,
}: DetailsTableProps<RowType>) => {
  const columnCount = columns.length;
  const resolvedTotalRow =
    typeof totalRow === 'function' ? totalRow(columnCount) : totalRow;

  return (
    <Card className="card-table card-bordered">
      <Card.Body className="p-0">
        <div className="table-responsive">
          <div className="table-container">
            <table className="table table-row-bordered align-middle">
              <thead>
                <tr className="align-middle">
                  {columns.map((col, i) => (
                    <th key={i}>{col.title}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {rows.map((row, index) => (
                  <tr key={index}>
                    {columns.map((col, i) => (
                      <td key={i} className={col.className}>
                        {createElement(col.render, { row })}
                      </td>
                    ))}
                  </tr>
                ))}
                {resolvedTotalRow}
              </tbody>
            </table>
          </div>
        </div>
      </Card.Body>
    </Card>
  );
};
