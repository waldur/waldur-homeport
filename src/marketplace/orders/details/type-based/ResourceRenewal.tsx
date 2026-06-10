import { QuestionIcon } from '@phosphor-icons/react';
import { useMemo } from 'react';

import { formatDate } from '@/core/dateUtils';
import { defaultCurrency } from '@/core/formatCurrency';
import { Tip } from '@/core/Tooltip';
import { translate } from '@/i18n';
import { getFormLimitParser } from '@/marketplace/common/registry';
import { useShouldConcealPrices } from '@/marketplace/common/useShouldConcealPrices';
import { ChangedLimitField } from '@/marketplace/resources/change-limits/ChangedLimitField';
import {
  getLimitChangeData,
  getLimitChangeRequirements,
} from '@/marketplace/resources/change-limits/utils';
import { PriceTooltip } from '@/price/PriceTooltip';
import { Field } from '@/resource/summary';
import { DASH_ESCAPE_CODE } from '@/table/constants';

import { DetailsTable } from './DetailsTable';
import { OrderTypeBasedProps, RequestCommentField } from './OrderCommonFields';

interface RenewalAttributes {
  action: 'renew';
  extension_months: number;
  new_end_date: string;
  old_end_date: string;
  old_limits: Record<string, any>;
}

export const ResourceRenewal = ({ order, offering }: OrderTypeBasedProps) => {
  const shouldConcealPrices = useShouldConcealPrices(order.project_uuid);
  const attributes = order.attributes as RenewalAttributes;

  const newLimits = useMemo(
    () => getFormLimitParser(offering.type)(order.limits),
    [offering.type, order.limits],
  );

  const data = useMemo(() => {
    const requirements = getLimitChangeRequirements(
      { limits: attributes.old_limits },
      offering,
    );

    if (requirements) {
      const plan = offering.plans.find((p) => p.uuid === order.plan_uuid);
      const { usages, limits: currentLimits } = requirements;
      return getLimitChangeData(
        plan,
        offering,
        newLimits,
        currentLimits,
        usages,
        true,
      );
    }
    return {
      components: [],
      periodTotals: [],
      orderCanBeApproved: true,
      offering,
    };
  }, [order, offering, newLimits, attributes.old_limits]);

  // Renewal extends the resource lifetime by N months — the per-component price
  // we read from `row.price` is the monthly-equivalent value, so the cost for
  // the extension period is just price × months.
  const monthlyTotal = useMemo(
    () => data.periodTotals.find((r) => r.chargeMode === 'month')?.total ?? 0,
    [data.periodTotals],
  );

  return (
    <>
      <Field
        label={translate('Old end date')}
        labelWidth={200}
        value={formatDate(attributes.old_end_date)}
      />
      <Field
        label={translate('New end date')}
        labelWidth={200}
        value={formatDate(attributes.new_end_date)}
      />
      <Field
        label={translate('Extension')}
        labelWidth={200}
        value={
          '+ ' +
          (attributes.extension_months === 1
            ? translate('1 month')
            : translate('{count} months', {
                count: attributes.extension_months,
              }))
        }
      />
      <RequestCommentField order={order} />

      <DetailsTable<(typeof data.components)[0]>
        rows={data.components}
        columns={[
          {
            title: translate('Component'),
            render: ({ row }) => (
              <>
                {row.name}
                <Tip label={row.type} id={'tip-' + row.type} className="ms-1">
                  <QuestionIcon weight="bold" />
                </Tip>
              </>
            ),
            className: 'text-nowrap',
          },
          {
            title: translate('Old limit'),
            render: ({ row }) => `${row.limit ?? 0} ${row.measured_unit}`,
          },
          {
            title: translate('New limit'),
            render: ({ row }) => newLimits[row.type] + ' ' + row.measured_unit,
          },
          {
            title: translate('Difference'),
            render: ({ row }) =>
              row.changedLimit ? (
                <ChangedLimitField
                  changedLimit={row.changedLimit}
                  unit={row.measured_unit}
                />
              ) : (
                DASH_ESCAPE_CODE
              ),
          },
          ...(shouldConcealPrices
            ? []
            : [
                {
                  title: (
                    <>
                      {translate('Price per month')} <PriceTooltip />
                    </>
                  ),
                  render: ({ row }) =>
                    defaultCurrency(row.chargeMode === 'month' ? row.price : 0),
                },
                {
                  title: (
                    <>
                      {translate('Cost for {count} months', {
                        count: attributes.extension_months,
                      })}{' '}
                      <PriceTooltip />
                    </>
                  ),
                  render: ({ row }) =>
                    defaultCurrency(
                      (row.chargeMode === 'month' ? row.price : 0) *
                        attributes.extension_months,
                    ),
                },
              ]),
        ]}
        totalRow={(columnCount) =>
          shouldConcealPrices ? null : (
            <tr className="fw-bolder">
              <td colSpan={columnCount - 2} className="text-dark text-end">
                {translate('Total renewal cost')}
              </td>
              <td className="text-dark">{defaultCurrency(monthlyTotal)}</td>
              <td className="text-dark">
                {defaultCurrency(monthlyTotal * attributes.extension_months)}
              </td>
            </tr>
          )
        }
      />
    </>
  );
};
