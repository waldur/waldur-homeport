import { FC } from 'react';

import { PriceField } from '@/marketplace/resources/change-limits/PriceField';

import { PeriodTotalRow } from './utils';

export const ComponentTotalRow: FC<{ row: PeriodTotalRow }> = ({ row }) => (
  <tr>
    <td colSpan={5} className="text-end">
      <span className="font-semibold text-primary me-10">{row.label}:</span>
    </td>
    <td className="font-medium text-primary">
      <PriceField
        price={row.total}
        changedPrice={row.changedTotal}
        suffix={row.priceSuffix}
      />
    </td>
  </tr>
);
