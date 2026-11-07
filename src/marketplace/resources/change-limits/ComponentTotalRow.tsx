import { FC } from 'react';

import { TableCell, TableRow } from 'waldur-ui';

import { PriceField } from '@/marketplace/resources/change-limits/PriceField';

import { PeriodTotalRow } from './utils';

export const ComponentTotalRow: FC<{ row: PeriodTotalRow }> = ({ row }) => (
  <TableRow>
    <TableCell colSpan={5} className="text-end">
      <span className="font-semibold text-primary me-8">{row.label}:</span>
    </TableCell>
    <TableCell className="font-medium text-primary">
      <PriceField
        price={row.total}
        changedPrice={row.changedTotal}
        suffix={row.priceSuffix}
      />
    </TableCell>
  </TableRow>
);
