import { DateTime } from 'luxon';

import { formatDate } from '@/core/dateUtils';
import { defaultCurrency } from '@/core/formatCurrency';
import {
  composeValidators,
  lessThanOrEqual,
  positive,
} from '@/core/validators';
import { translate } from '@/i18n';
import { Column } from '@/table/types';
import { renderFieldOrDash } from '@/table/utils';

export const COMMON_CREDIT_COLUMNS: Column[] = [
  {
    title: translate('Eligible offerings'),
    render: ({ row }) => (
      <>
        {renderFieldOrDash(
          row.offerings.map((offering) => offering.name).join(', '),
        )}
      </>
    ),

    export: (row) =>
      renderFieldOrDash(
        row.offerings.map((offering) => offering.name).join(', '),
      ),
  },
  {
    title: translate('End date'),
    render: ({ row }) =>
      row.end_date ? formatDate(row.end_date) : <>&mdash;</>,
    orderField: 'end_date',
    export: 'end_date',
  },
  {
    title: translate('Allocated credit'),
    render: ({ row }) => defaultCurrency(row.value),
    orderField: 'value',
    export: (row) => defaultCurrency(row.value),
  },
];

export const getStartOfNextMonth = () =>
  DateTime.now().plus({ months: 1 }).startOf('month');

export const validatePercent = composeValidators(
  positive,
  lessThanOrEqual(100),
);

export const minimalConsumptionLogicOptions = [
  {
    label: translate('Fixed'),
    value: 'fixed',
    description: translate('A minimal guaranteed credit reduction per month.'),
  },
  {
    label: translate('Linear'),
    value: 'linear',
    description: translate(
      'A minimum amount deducted monthly, calculated based on the end date. Updated on the start of the month.',
    ),
  },
];
