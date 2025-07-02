import { InfoIcon } from '@phosphor-icons/react';
import { FC } from 'react';
import { Button, Card } from 'react-bootstrap';
import { Resource } from 'waldur-js-client';

import { formatDateTime } from '@waldur/core/dateUtils';
import { ProgressSteps } from '@waldur/core/ProgressSteps';
import { translate } from '@waldur/i18n';
import { OrderConsumerActions } from '@waldur/marketplace/orders/actions/OrderConsumerActions';
import { OrderProviderActions } from '@waldur/marketplace/orders/actions/OrderProviderActions';
import { OrderDetailsLink } from '@waldur/marketplace/orders/details/OrderDetailsLink';

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
  const steps: Array<{ label; description?; completed; variant? }> = [];
  steps.push({
    label: translate('Order created'),
    description: [
      [
        resource.order_in_progress.created_by_full_name,
        formatDateTime(resource.order_in_progress.created),
      ].join(', '),
    ],

    completed: true,
  });
  const isStep2Completed = order.state !== 'pending-consumer';
  steps.push({
    label: isStep2Completed
      ? translate('Approved')
      : translate('Pending approval'),
    description: isStep2Completed
      ? [
          [
            order.consumer_reviewed_by_full_name,
            formatDateTime(order.consumer_reviewed_at),
          ].join(', '),
        ]
      : [translate('Pending organization approval')],
    completed: isStep2Completed,
  });
  const isStep3Completed = !['pending-consumer', 'pending-provider'].includes(
    order.state,
  );
  steps.push({
    label: isStep3Completed
      ? translate('Approved')
      : translate('Pending approval'),
    description: isStep3Completed
      ? [
          order.provider_reviewed_at
            ? [
                order.provider_reviewed_by_full_name ||
                  translate('By provider'),
                formatDateTime(order.provider_reviewed_at),
              ].join(', ')
            : translate('Auto-approved'),
        ]
      : [translate('Pending provider approval')],
    completed: isStep3Completed,
  });
  steps.push({
    label: getTranslatedOrderType(order.type),
    description: [
      translate('Resource {type} process', {
        type: getTranslatedOrderType(
          resource.order_in_progress.type,
        ).toLowerCase(),
      }),
    ],

    completed: steps[steps.length - 1].completed && order.state !== 'executing',
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
      : [
          order.type === 'Create'
            ? translate('Resource successfully created')
            : order.type === 'Terminate'
              ? translate('Resource successfully terminated')
              : translate('Resource successfully updated'),
        ],

    completed: isStep4Completed,
    variant: order.state === 'done' ? 'primary' : 'danger',
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
    <div className="container-fluid mt-6">
      <Card className="card-bordered border-gray-300 border-dashed border-1 overflow-hidden">
        <Card.Body className="d-flex flex-column flex-sm-row align-items-center gap-4">
          <ProgressSteps
            steps={steps}
            bgClass="bg-body"
            className="flex-grow-1"
          />

          <div className="d-flex flex-sm-column gap-3 text-nowrap">
            {resource.order_in_progress.state === 'pending-consumer' ? (
              <OrderConsumerActions
                order={resource.order_in_progress}
                refetch={refetch}
                as={Button}
              />
            ) : resource.order_in_progress.state === 'pending-provider' ? (
              <OrderProviderActions
                order={resource.order_in_progress}
                refetch={refetch}
                as={Button}
              />
            ) : null}
            <OrderDetailsLink
              order_uuid={resource.order_in_progress.uuid}
              project_uuid={resource.order_in_progress.project_uuid}
              className="btn btn-sm btn-outline btn-outline-default"
            >
              <span className="svg-icon svg-icon-4">
                <InfoIcon weight="bold" />
              </span>
              {translate('View order')}
            </OrderDetailsLink>
          </div>
        </Card.Body>
      </Card>
    </div>
  );
};
