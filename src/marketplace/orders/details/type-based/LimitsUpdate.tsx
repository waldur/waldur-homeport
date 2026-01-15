import { QuestionIcon } from '@phosphor-icons/react';
import { useMemo } from 'react';

import { defaultCurrency } from '@waldur/core/formatCurrency';
import { Tip } from '@waldur/core/Tooltip';
import { translate } from '@waldur/i18n';
import { getFormLimitParser } from '@waldur/marketplace/common/registry';
import {
  getLimitChangeRequirements,
  getLimitChangeData,
} from '@waldur/marketplace/resources/change-limits/utils';
import { PriceTooltip } from '@waldur/price/PriceTooltip';

import { getPlanUnitAbbr } from '../../utils';

import { DetailsTable } from './DetailsTable';
import {
  OrderTypeBasedProps,
  RequestedByField,
  RequestCommentField,
  DescriptionField,
  CostChangeField,
} from './OrderCommonFields';

export const LimitsUpdate = ({ order, offering }: OrderTypeBasedProps) => {
  const data = useMemo(() => {
    const requirements = getLimitChangeRequirements(
      { limits: (order.attributes as any).old_limits },
      offering,
    );
    const limitParser = getFormLimitParser(order.offering_type);
    const resourceLimits = limitParser(order.limits);

    if (requirements) {
      const newLimits = resourceLimits;
      const plan = offering.plans.find((p) => p.uuid === order.plan_uuid);
      if (!plan) {
        return {
          periods: [],
          components: [],
          orderCanBeApproved: true,
          totalPeriods: [],
          changedTotalPeriods: [],
          offering,
          newLimits: resourceLimits,
        };
      }
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
      newLimits: resourceLimits,
    };
  }, [order, offering]);

  return (
    <>
      <RequestedByField order={order} />
      <RequestCommentField order={order} />
      <DescriptionField order={order} offering={offering} />
      <CostChangeField order={order} />

      <DetailsTable<(typeof data.components)[0]>
        rows={data.components}
        columns={[
          {
            title: translate('Limit'),
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
            title: translate('Old'),
            render: ({ row }) => `${row.limit ?? 0} ${row.measured_unit}`,
          },
          {
            title: translate('New'),
            render: ({ row }) =>
              data.newLimits[row.type] + ' ' + row.measured_unit,
          },
          {
            title: (
              <>
                {translate('Old price')}
                <PriceTooltip />
              </>
            ),
            render: ({ row }) =>
              defaultCurrency(row.prices[0] - row.changedPrices[0]),
          },
          {
            title: (
              <>
                {translate('New price')}
                <PriceTooltip />
              </>
            ),
            render: ({ row }) => defaultCurrency(row.prices[0]),
          },
        ]}
        totalRow={
          <tr className="fw-bolder">
            <td colSpan={4} className="text-dark text-end">
              {translate('Total cost')}
            </td>
            <td className="text-dark">
              {defaultCurrency(data.changedTotalPeriods[0], false, true)}
              {getPlanUnitAbbr(order.plan_unit)}
            </td>
          </tr>
        }
      />
    </>
  );
};
