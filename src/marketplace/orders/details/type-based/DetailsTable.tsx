import { ArrowUpIcon, ArrowDownIcon } from '@phosphor-icons/react';
import { createElement, ReactNode } from 'react';

import {
  Badge,
  Card,
  CardContent,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from 'waldur-ui';

import { DASH_ESCAPE_CODE } from '@/table/constants';
import { Column } from '@/table/types';

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
    <Badge
      variant={variant}
      size="sm"
      leftIcon={icon}
      shape="pill"
      tone="outline"
    >
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
    <Card variant="table" bordered>
      <CardContent className="p-0">
        <Table className="align-middle">
          <TableHeader>
            <TableRow className="align-middle">
              {columns.map((col, i) => (
                <TableHead key={i}>{col.title}</TableHead>
              ))}
            </TableRow>
          </TableHeader>
          <TableBody>
            {rows.map((row, index) => (
              <TableRow key={index}>
                {columns.map((col, i) => (
                  <TableCell key={i} className={col.className}>
                    {createElement(col.render, { row })}
                  </TableCell>
                ))}
              </TableRow>
            ))}
            {resolvedTotalRow}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
};
