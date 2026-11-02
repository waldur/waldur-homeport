import { CustomerCredit, ProjectCredit } from 'waldur-js-client';

import { PropertyItem } from 'waldur-ui';

import { formatMonth } from '@/core/dateUtils';
import { translate } from '@/i18n';
import { formatCompensateIn } from '@/project/manage/EarlierInvoicesField';
import { propVal } from '@/property/propertyFields';
import { ExpandableContainer } from '@/table/ExpandableContainer';

import { minimalConsumptionLogicOptions } from './constants';
import { CreditCostPolicies } from './CreditCostPolicies';

export const CreditExpandableRow = ({
  row,
}: {
  row: CustomerCredit | ProjectCredit;
}) => (
  <ExpandableContainer asTable>
    <PropertyItem
      label={translate('Minimal consumption logic')}
      value={propVal.enum(row.minimal_consumption_logic, {
        options: minimalConsumptionLogicOptions,
      })}
    />

    <PropertyItem
      label={translate('Minimal consumption')}
      value={propVal.currency(row.minimal_consumption)}
    />

    <PropertyItem
      label={translate('Expected consumption')}
      value={propVal.currency(row.expected_consumption)}
    />

    <PropertyItem
      label={translate('Grace coefficient')}
      value={row.grace_coefficient}
    />

    <PropertyItem
      label={translate('Apply as minimal consumption')}
      value={propVal.boolean(row.apply_as_minimal_consumption, {
        display: 'badge',
      })}
    />

    {'pay_earlier_invoices' in row ? (
      <PropertyItem
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
