import { CustomerCredit, ProjectCredit } from 'waldur-js-client';

import { PropertyItem } from 'waldur-ui';

import { formatMonth } from '@/core/dateUtils';
import { translate } from '@/i18n';
import { formatCompensateIn } from '@/project/manage/EarlierInvoicesField';
import { propVal } from '@/property/propertyFields';
import { ExpandableContainer } from '@/table/ExpandableContainer';

import { minimalConsumptionLogicOptions } from './constants';
import { CreditCostPolicies } from './CreditCostPolicies';
import { getCreditKindHelp } from './creditKinds';

const CreditKindItems = ({ credit }: { credit: CustomerCredit }) => {
  const help = getCreditKindHelp();
  return (
    <>
      <PropertyItem
        label={translate('Paid credit')}
        tooltip={help.paid}
        value={propVal.currency(credit.paid_balance)}
      />
      <PropertyItem
        label={translate('Granted credit')}
        tooltip={help.granted}
        value={propVal.currency(credit.granted_balance)}
      />
      <PropertyItem
        label={translate('Withdrawable balance')}
        tooltip={help.withdrawable}
        value={propVal.currency(credit.withdrawable_balance)}
      />
    </>
  );
};

export const CreditExpandableRow = ({
  row,
}: {
  row: CustomerCredit | ProjectCredit;
}) => (
  <ExpandableContainer asTable>
    {/* An organization credit is made of lots; a project credit is only a
        cap on it, so it has none. */}
    {'paid_balance' in row ? <CreditKindItems credit={row} /> : null}

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
