import { QuestionIcon } from '@phosphor-icons/react';
import { useMemo } from 'react';
import { Card } from 'react-bootstrap';
import { useMediaQuery } from 'react-responsive';
import { Offering, Resource } from 'waldur-js-client';

import { GRID_BREAKPOINTS } from '@waldur/core/constants';
import { formatDate } from '@waldur/core/dateUtils';
import { defaultCurrency } from '@waldur/core/formatCurrency';
import { Tip } from '@waldur/core/Tooltip';
import { translate } from '@waldur/i18n';
import { getFormLimitParser } from '@waldur/marketplace/common/registry';
import { OrderDetailsQuickBody } from '@waldur/marketplace/orders/details/OrderDetailsQuickBody';
import { OrderStateField } from '@waldur/marketplace/orders/details/OrderStateField';
import { ChangesAmountBadge } from '@waldur/marketplace/service-providers/dashboard/ChangesAmountBadge';
import { PriceTooltip } from '@waldur/price/PriceTooltip';
import { Field } from '@waldur/resource/summary';
import { DASH_ESCAPE_CODE } from '@waldur/table/constants';
import { useUser } from '@waldur/workspace/hooks';

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

  const requirements = useMemo(
    () => getLimitChangeRequirements(resource, offering),
    [resource, offering],
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
      const plan = offering.plans.find(
        (p) => p.uuid === resource.order_in_progress.plan_uuid,
      );
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
      periods: [],
      components: [],
      orderCanBeApproved: true,
      totalPeriods: [],
      changedTotalPeriods: [],
      offering,
    };
  }, [requirements, resource, offering]);

  const isMd = useMediaQuery({ maxWidth: GRID_BREAKPOINTS.md });
  const periodsCountToShow = isMd ? 1 : 3;

  return (
    <>
      <Field
        label={translate('Requestor')}
        value={order.created_by_full_name + ` (${order.created_by_username})`}
        space={2}
      />
      <Field
        label={translate('Requested at')}
        value={formatDate(order.created)}
        space={2}
      />
      <OrderDetailsQuickBody order={order} space={2} />
      {userIsRequestor && (
        <Field
          label={translate('Status')}
          value={<OrderStateField order={order} pill outline />}
          space={2}
        />
      )}

      {userIsRequestor &&
        (order.state === 'pending-consumer' ? (
          <p className="text-quaternary my-6">
            {translate(
              'Your request has been submitted and is awaiting organization approval.',
            )}
          </p>
        ) : order.state === 'pending-provider' ? (
          <p className="text-quaternary my-6">
            {translate(
              'Your request has been submitted and is awaiting provider approval.',
            )}
          </p>
        ) : null)}

      <Card className="card-table card-bordered mt-6 mb-6">
        <Card.Body className="p-0">
          <div className="table-responsive">
            <div className="table-container">
              <table className="table table-row-bordered align-middle">
                <thead>
                  <tr className="align-middle">
                    <th>{translate('Resource type')}</th>
                    <th>{translate('Current limit')}</th>
                    <th>{translate('Requested limit')}</th>
                    <th>{translate('Change')}</th>
                    {data.periods
                      .slice(0, periodsCountToShow)
                      .map((period, index) => (
                        <th className="col-sm-1 icon-align" key={index}>
                          {translate('Impact')} (
                          {period
                            ? period.substring(period.indexOf(' ') + 1)
                            : null}
                          )
                          <PriceTooltip />
                        </th>
                      ))}
                  </tr>
                </thead>
                <tbody>
                  {data.components.map((component, index) => (
                    <tr key={index}>
                      <td className="text-nowrap icon-align">
                        {component.name}
                        <Tip
                          label={component.type}
                          id={'tip-' + component.type}
                          className="ms-1"
                        >
                          <QuestionIcon weight="bold" />
                        </Tip>
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
                      {component.prices
                        .slice(0, periodsCountToShow)
                        .map((_, i) => (
                          <td key={i}>
                            {!component.changedLimit && DASH_ESCAPE_CODE}
                            <ChangesAmountBadge
                              changes={component.changedPrices[i]}
                              asPrice
                              badgePill
                              badgeOutline
                              unit={null}
                              badgeSm
                              showSign
                              reverseColor
                            />
                          </td>
                        ))}
                    </tr>
                  ))}
                  {/* Total row */}
                  <tr className="fw-bolder">
                    <td colSpan={4}>
                      <span className="text-dark">
                        {order.plan_unit === 'hour'
                          ? translate('Estimated hourly fee impact')
                          : order.plan_unit === 'day'
                            ? translate('Estimated daily fee impact')
                            : order.plan_unit === 'half_month'
                              ? translate('Estimated half month fee impact')
                              : order.plan_unit === 'month'
                                ? translate('Estimated monthly fee impact')
                                : order.plan_unit === 'quarter'
                                  ? translate('Estimated quarterly fee impact')
                                  : translate('Estimated {period} fee impact', {
                                      period: order.plan_unit,
                                    })}
                      </span>
                    </td>
                    {data.totalPeriods
                      .slice(0, periodsCountToShow)
                      .map((_, index) => (
                        <td key={index} className="text-dark">
                          {defaultCurrency(
                            data.changedTotalPeriods[index],
                            false,
                            true,
                          )}
                        </td>
                      ))}
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </Card.Body>
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
