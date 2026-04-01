import { QuestionIcon } from '@phosphor-icons/react';
import { useMemo } from 'react';

import { formatDate } from '@waldur/core/dateUtils';
import { defaultCurrency } from '@waldur/core/formatCurrency';
import { Tip } from '@waldur/core/Tooltip';
import { translate } from '@waldur/i18n';
import { getFormLimitParser } from '@waldur/marketplace/common/registry';
import { useShouldConcealPrices } from '@waldur/marketplace/common/useShouldConcealPrices';
import { ChangedLimitField } from '@waldur/marketplace/resources/change-limits/ChangedLimitField';
import {
  getLimitChangeData,
  getLimitChangeRequirements,
} from '@waldur/marketplace/resources/change-limits/utils';
import { PriceTooltip } from '@waldur/price/PriceTooltip';
import { Field } from '@waldur/resource/summary';
import { DASH_ESCAPE_CODE } from '@waldur/table/constants';

import { DetailsTable } from './DetailsTable';
import {
  CostChangeField,
  OrderTypeBasedProps,
  RequestCommentField,
  StartDateField,
} from './OrderCommonFields';

interface RenewalAttributes {
  action: 'renew';
  extension_months: number;
  new_end_date: string;
  old_end_date: string;
  old_limits: Record<string, any>;
  renewal_cost: number;
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
      periods: [],
      components: [],
      orderCanBeApproved: true,
      totalPeriods: [],
      changedTotalPeriods: [],
      offering,
    };
  }, [order, offering, newLimits, attributes.old_limits]);

  return (
    <>
      <StartDateField order={order} />
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
      {!shouldConcealPrices && (
        <Field
          label={translate('Renewal cost')}
          labelWidth={200}
          value={defaultCurrency(attributes.renewal_cost)}
        />
      )}
      <CostChangeField
        order={order}
        shouldConcealPrices={shouldConcealPrices}
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
            : data.periods.map((period, i) => ({
                title: (
                  <>
                    {period} <PriceTooltip />
                  </>
                ),
                render: ({ row }) => defaultCurrency(row.prices[i]),
              }))),
        ]}
        totalRow={(columnCount) =>
          shouldConcealPrices ? null : (
            <tr className="fw-bolder">
              <td
                colSpan={columnCount - data.totalPeriods.length}
                className="text-dark text-end"
              >
                {translate('Total renewal cost')}
              </td>
              {data.totalPeriods.map((total, index) => (
                <td key={index} className="text-dark">
                  {defaultCurrency(total)}
                </td>
              ))}
            </tr>
          )
        }
      />
    </>
  );
};
