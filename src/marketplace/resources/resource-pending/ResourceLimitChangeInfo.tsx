import { useMemo } from 'react';
import { Offering, Resource } from 'waldur-js-client';

import {
  HelpIcon,
  PropertyItem,
  PropertyList,
  Card,
  CardContent,
} from 'waldur-ui';

import { defaultCurrency } from '@/core/formatCurrency';
import { translate } from '@/i18n';
import { getFormLimitParser } from '@/marketplace/common/registry';
import { OrderDetailsQuickBody } from '@/marketplace/orders/details/OrderDetailsQuickBody';
import { OrderStateField } from '@/marketplace/orders/details/OrderStateField';
import { ChangesAmountBadge } from '@/marketplace/service-providers/dashboard/ChangesAmountBadge';
import { PriceTooltip } from '@/price/PriceTooltip';
import { propVal } from '@/property/propertyFields';
import { DASH_ESCAPE_CODE } from '@/table/constants';
import { useUser } from '@/workspace/hooks';

import { ChangedLimitField } from '../change-limits/ChangedLimitField';
import {
  getLimitChangeData,
  getLimitChangeRequirements,
} from '../change-limits/utils';

import { CostEstimatedChangeView } from './CostEstimatedChangeView';

export const ResourceLimitChangeInfo = ({
  resource,
  offering,
}: {
  resource: Resource;
  offering: Offering;
}) => {
  const user = useUser();
  const order = resource.order_in_progress;

  const userIsRequestor = user.username === order.created_by_username;

  const orderPlan = useMemo(
    () =>
      offering.plans.find(
        (p) => p.uuid === resource.order_in_progress?.plan_uuid,
      ),
    [offering.plans, resource.order_in_progress?.plan_uuid],
  );
  const requirements = useMemo(
    () => getLimitChangeRequirements(resource, offering, orderPlan),
    [resource, offering, orderPlan],
  );
  const limitParser = useMemo(
    () => getFormLimitParser(offering.type),
    [offering.type],
  );

  const parsedNewLimits = useMemo(
    () => limitParser(resource.order_in_progress?.limits),
    [limitParser, resource.order_in_progress?.limits],
  );

  const data = useMemo(() => {
    if (requirements) {
      const newLimits = parsedNewLimits;
      const plan = orderPlan;
      const { usages, limits: currentLimits } = requirements;
      return getLimitChangeData(
        plan,
        offering,
        newLimits,
        currentLimits,
        usages,
        true,
        false,
        resource.end_date,
      );
    }
    return {
      components: [],
      periodTotals: [],
      orderCanBeApproved: true,
      offering,
    };
  }, [requirements, resource, offering]);

  return (
    <>
      <PropertyList variant="summary" space={1.5}>
        <PropertyItem
          label={translate('Requestor')}
          value={propVal.user({
            full_name: order.created_by_full_name,
            username: order.created_by_username,
          })}
        />
        <PropertyItem
          label={translate('Requested at')}
          value={propVal.date(order.created)}
        />
        <OrderDetailsQuickBody order={order} space={1.5} />
        {userIsRequestor && (
          <PropertyItem
            label={translate('Status')}
            value={
              <OrderStateField order={order} shape="pill" tone="outline" />
            }
          />
        )}
      </PropertyList>

      {userIsRequestor &&
        (order.state === 'pending-consumer' ? (
          <p className="text-quaternary my-5">
            {translate(
              'Your request has been submitted and is awaiting organization approval.',
            )}
          </p>
        ) : order.state === 'pending-provider' ? (
          <p className="text-quaternary my-5">
            {translate(
              'Your request has been submitted and is awaiting provider approval.',
            )}
          </p>
        ) : null)}

      <Card variant="table" bordered className="mt-5 mb-5">
        <CardContent className="p-0">
          <div className="table-responsive">
            <div className="table-container">
              <table className="table table-row-bordered align-middle">
                <thead>
                  <tr className="align-middle">
                    <th>{translate('Resource type')}</th>
                    <th>{translate('Current limit')}</th>
                    <th>{translate('Requested limit')}</th>
                    <th>{translate('Change')}</th>
                    <th className="sm:w-2/12 [&_svg]:-mt-0.75">
                      {translate('Impact')}
                      <PriceTooltip />
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {data.components.map((component, index) => (
                    <tr key={index}>
                      <td className="whitespace-nowrap [&_svg]:-mt-0.75">
                        {component.name}
                        <HelpIcon label={component.type} className="ms-1" />
                      </td>
                      <td>
                        {component.limit ?? 0} {component.measured_unit}
                      </td>
                      {component.changedLimit ? (
                        <td>
                          {parsedNewLimits?.[component.type]}{' '}
                          {component.measured_unit}
                        </td>
                      ) : (
                        <td>{DASH_ESCAPE_CODE}</td>
                      )}
                      <td>
                        {component.changedLimit ? (
                          <ChangedLimitField
                            changedLimit={component.changedLimit}
                            unit={component.measured_unit}
                          />
                        ) : (
                          DASH_ESCAPE_CODE
                        )}
                      </td>
                      <td>
                        {!component.changedLimit ? (
                          DASH_ESCAPE_CODE
                        ) : (
                          <>
                            <ChangesAmountBadge
                              changes={component.changedPrice}
                              asPrice
                              unit={null}
                              badgeSm
                              showSign
                              reverseColor
                            />
                            {component.priceSuffix && (
                              <span className="text-quaternary ms-1">
                                {component.priceSuffix}
                              </span>
                            )}
                          </>
                        )}
                      </td>
                    </tr>
                  ))}
                  {data.periodTotals.map((row) => (
                    <tr className="font-semibold" key={row.chargeMode}>
                      <td colSpan={4}>
                        <span className="text-primary">
                          {translate('Estimated impact')} ({row.label})
                        </span>
                      </td>
                      <td className="text-primary">
                        {defaultCurrency(row.changedTotal, false, true)}
                        {row.priceSuffix}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </CardContent>
      </Card>

      <CostEstimatedChangeView
        order={order}
        message={
          order.plan_unit === 'hour'
            ? translate('New estimated hourly fee')
            : order.plan_unit === 'day'
              ? translate('New estimated daily fee')
              : order.plan_unit === 'half_month'
                ? translate('New estimated half month fee')
                : order.plan_unit === 'month'
                  ? translate('New estimated monthly fee')
                  : order.plan_unit === 'quarter'
                    ? translate('New estimated quarterly fee')
                    : translate('New estimated {period} fee', {
                        period: order.plan_unit,
                      })
        }
      />
    </>
  );
};
