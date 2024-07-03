import { FC } from 'react';
import { Button } from 'react-bootstrap';

import { formatDateTime } from '@waldur/core/dateUtils';
import { ProgressSteps } from '@waldur/core/ProgressSteps';
import { translate } from '@waldur/i18n';
import { OrderConsumerActions } from '@waldur/marketplace/orders/actions/OrderConsumerActions';
import { OrderDetailsLink } from '@waldur/marketplace/orders/details/OrderDetailsLink';

import { Resource } from '../types';

interface OrderInProgressViewProps {
  resource: Resource;
  refetch(): void;
}

const getTranslatedOrderType = (type) =>
  type === 'Create'
    ? translate('Creation')
    : type === 'Terminate'
      ? translate('Termination')
      : translate('Change');

const getSteps = (resource: Resource) => {
  const order = resource.order_in_progress;
  const steps: Array<{ label; description?; completed; color? }> = [];
  steps.push({
    label: translate('Created'),
    description: [
      resource.order_in_progress.created_by_full_name,
      formatDateTime(resource.order_in_progress.created),
    ],
    completed: true,
  });
  steps.push({
    label:
      order.state === 'pending-consumer'
        ? translate('Pending approval')
        : translate('Approved'),
    description:
      order.state !== 'pending-consumer'
        ? [
            order.consumer_reviewed_by_full_name,
            formatDateTime(order.consumer_reviewed_at),
          ]
        : [translate('Pending approval by requesting organization')],
    completed: order.state !== 'pending-consumer',
    color: 'bg-warning',
  });
  steps.push({
    label: getTranslatedOrderType(order.type),
    description: null,
    completed:
      steps[steps.length - 1].completed &&
      order.state !== 'pending-provider' &&
      order.state !== 'executing',
  });

  const isStep4Completed =
    steps[steps.length - 1].completed &&
    ['done', 'canceled', 'erred', 'rejected'].includes(order.state);
  steps.push({
    label: translate('Completed'),
    description: isStep4Completed
      ? [
          order.state === 'canceled'
            ? translate('Canceled')
            : order.state === 'erred'
              ? translate('Erred')
              : order.state === 'rejected'
                ? translate('Rejected')
                : translate('Done'),
        ]
      : null,
    completed: isStep4Completed,
    color: order.state === 'done' ? 'bg-success' : 'bg-danger',
  });
  return steps;
};

export const OrderInProgressView: FC<OrderInProgressViewProps> = ({
  resource,
  refetch,
}) => {
  if (!resource.order_in_progress) {
    return null;
  }
  const steps = getSteps(resource);
  return (
    <ProgressSteps steps={steps} bgClass="bg-gray-100">
      <div className="fw-bolder mb-5">
        <span>
          {translate('Resource {type} {activeStep}', {
            type: getTranslatedOrderType(
              resource.order_in_progress.type,
            ).toLowerCase(),
            activeStep: !steps[1].completed
              ? translate('approval')
              : translate('pending'),
          })}
          ...{' '}
        </span>
        <OrderDetailsLink
          order_uuid={resource.order_in_progress.uuid}
          project_uuid={resource.order_in_progress.project_uuid}
          className="text-link"
        >
          ({translate('View order')})
        </OrderDetailsLink>
        {resource.order_in_progress.state === 'pending-consumer' && (
          <div className="ms-6 d-inline-flex gap-2">
            <OrderConsumerActions
              order={resource.order_in_progress}
              refetch={refetch}
              as={Button}
            />
          </div>
        )}
      </div>
    </ProgressSteps>
  );
};
