import { QuestionIcon } from '@phosphor-icons/react';
import { useMemo } from 'react';
import { Card } from 'react-bootstrap';
import { Offering, Resource } from 'waldur-js-client';

import { formatDate } from '@/core/dateUtils';
import { defaultCurrency } from '@/core/formatCurrency';
import { Tip } from '@/core/Tooltip';
import { translate } from '@/i18n';
import { getFormLimitParser } from '@/marketplace/common/registry';
import { OrderDetailsQuickBody } from '@/marketplace/orders/details/OrderDetailsQuickBody';
import { OrderStateField } from '@/marketplace/orders/details/OrderStateField';
import { ChangesAmountBadge } from '@/marketplace/service-providers/dashboard/ChangesAmountBadge';
import { PriceTooltip } from '@/price/PriceTooltip';
import { Field } from '@/resource/summary';
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
      components: [],
      periodTotals: [],
      orderCanBeApproved: true,
      offering,
    };
  }, [requirements, resource, offering]);

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
                    <th className="col-sm-2 icon-align">
                      {translate('Impact')}
                      <PriceTooltip />
                    </th>
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
                      <td>
                        {!component.changedLimit ? (
                          DASH_ESCAPE_CODE
                        ) : (
                          <>
                            <ChangesAmountBadge
                              changes={component.changedPrice}
                              asPrice
                              badgePill
                              badgeOutline
                              unit={null}
                              badgeSm
                              showSign
                              reverseColor
                            />
                            {component.priceSuffix && (
                              <span className="text-muted ms-1">
                                {component.priceSuffix}
                              </span>
                            )}
                          </>
                        )}
                      </td>
                    </tr>
                  ))}
                  {data.periodTotals.map((row) => (
                    <tr className="fw-bolder" key={row.chargeMode}>
                      <td colSpan={4}>
                        <span className="text-dark">
                          {translate('Estimated impact')} ({row.label})
                        </span>
                      </td>
                      <td className="text-dark">
                        {defaultCurrency(row.changedTotal, false, true)}
                        {row.priceSuffix}
                      </td>
                    </tr>
                  ))}
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
