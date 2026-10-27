import { startCase } from 'es-toolkit/compat';
import { CustomerCredit, ProjectCredit } from 'waldur-js-client';

import { formatMonth } from '@/core/dateUtils';
import { defaultCurrency } from '@/core/formatCurrency';
import { translate } from '@/i18n';
import { formatCompensateIn } from '@/project/manage/EarlierInvoicesField';
import { Field } from '@/resource/summary';
import { BooleanField } from '@/table/BooleanField';
import { ExpandableContainer } from '@/table/ExpandableContainer';

import { CreditCostPolicies } from './CreditCostPolicies';

export const CreditExpandableRow = ({
  row,
}: {
  row: CustomerCredit | ProjectCredit;
}) => (
  <ExpandableContainer asTable>
    <Field
      label={translate('Minimal consumption logic')}
      value={startCase(row.minimal_consumption_logic)}
    />

    <Field
      label={translate('Minimal consumption')}
      value={defaultCurrency(row.minimal_consumption)}
    />

    <Field
      label={translate('Expected consumption')}
      value={defaultCurrency(row.expected_consumption)}
    />

    <Field
      label={translate('Grace coefficient')}
      value={row.grace_coefficient}
    />

    <Field
      label={translate('Apply as minimal consumption')}
      value={<BooleanField value={row.apply_as_minimal_consumption} />}
    />

    {'pay_earlier_invoices' in row ? (
      <Field
        label={translate('Pays earlier invoices')}
        value={
          row.pay_earlier_invoices
            ? translate('Yes, from {from} to {until}, written on: {where}', {
                from: row.earlier_invoices_from
                  ? formatMonth(row.earlier_invoices_from)
                  : translate('the first invoice'),
                until: row.earlier_invoices_until
                  ? formatMonth(row.earlier_invoices_until)
                  : translate('the last closed invoice'),
                where: formatCompensateIn(row.earlier_invoices_compensate_in),
              })
            : translate('No')
        }
      />
    ) : null}

    <CreditCostPolicies credit={row} />
  </ExpandableContainer>
);
