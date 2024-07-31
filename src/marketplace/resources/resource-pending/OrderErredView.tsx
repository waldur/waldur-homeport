import { useMutation } from '@tanstack/react-query';
import { triggerTransition } from '@uirouter/redux';
import { FC } from 'react';
import { Button } from 'react-bootstrap';
import { useDispatch } from 'react-redux';

import { formatDateTime } from '@waldur/core/dateUtils';
import { lazyComponent } from '@waldur/core/lazyComponent';
import { ProgressSteps } from '@waldur/core/ProgressSteps';
import { omit } from '@waldur/core/utils';
import { translate } from '@waldur/i18n';
import { createOrder } from '@waldur/marketplace/common/api';
import { formatOrderForCreate } from '@waldur/marketplace/details/utils';
import { OrderDetailsLink } from '@waldur/marketplace/orders/details/OrderDetailsLink';
import { openModalDialog, waitForConfirmation } from '@waldur/modal/actions';
import { showErrorResponse, showSuccess } from '@waldur/store/notify';

import { Resource } from '../types';

const ResourceOrderErrorDialog = lazyComponent(
  () => import('./ResourceOrderErrorDialog'),
  'ResourceOrderErrorDialog',
);

interface OrderErredViewProps {
  resource: Resource;
}

const ShowError = ({ resource }) => {
  const dispatch = useDispatch();
  const showErrorDialog = () => {
    dispatch(
      openModalDialog(ResourceOrderErrorDialog, {
        resolve: { resource },
        size: 'lg',
      }),
    );
  };
  return (
    <>
      (
      <button
        type="button"
        className="text-link text-danger fw-bolder"
        onClick={showErrorDialog}
      >
        {translate('Show error')}
      </button>
      )
    </>
  );
};

const getSortedSteps = (resource: Resource) => [
  {
    label: translate('Order submitted'),
    description: [
      resource.creation_order.created_by_full_name,
      formatDateTime(resource.creation_order.created),
    ],
    state: [],
  },
  {
    label: translate('Approved'),
    description: [
      resource.creation_order.consumer_reviewed_by_full_name,
      formatDateTime(resource.creation_order.consumer_reviewed_at),
    ],
    state: [],
  },
  {
    label: (
      <>
        {translate('Creation has failed')} <ShowError resource={resource} />
      </>
    ),
    description: [
      translate('System'),
      formatDateTime(resource.creation_order.modified),
    ],
    state: ['erred'],
    icon: 'fa-times',
    color: 'bg-danger',
    labelClass: 'text-danger',
  },
];

const getSteps = (resource: Resource) => {
  const steps: Array<{ label; description?; completed; color?; icon? }> = [];
  const sortedSteps = getSortedSteps(resource);
  const currentStateIndex =
    sortedSteps.findIndex((step) =>
      step.state.includes(resource.creation_order.state),
    ) - 1;
  sortedSteps.forEach((step, i) => {
    steps.push({
      ...omit(step, 'state'),
      completed: i <= currentStateIndex,
    });
  });
  return steps;
};

export const OrderErredView: FC<OrderErredViewProps> = ({ resource }) => {
  const dispatch = useDispatch();
  const { mutate, isLoading } = useMutation(async () => {
    await waitForConfirmation(
      dispatch,
      translate('Confirmation'),
      translate('Are you sure you want to retry to submit this order?'),
    );
    const item: any = {
      formData: {
        attributes: resource.attributes || resource.creation_order.attributes,
        limits: resource.limits || resource.creation_order.limits,
        plan: {
          // We only need the url in the order request
          url: resource.plan || resource.creation_order.plan,
        },
        project: resource.project || resource.creation_order.project,
      },
      offering: {
        // We only need the url in the order request
        url: resource.offering || resource.creation_order.offering,
      },
    };
    try {
      const order: any = await createOrder(formatOrderForCreate(item));
      dispatch(showSuccess(translate('Order has been submitted.')));
      dispatch(
        triggerTransition('marketplace-resource-details', {
          resource_uuid: order.data.marketplace_resource_uuid,
        }),
      );
    } catch (error) {
      dispatch(showErrorResponse(error, translate('Unable to submit order.')));
    }
  });

  if (!resource.creation_order || resource.creation_order.state !== 'erred') {
    return null;
  }
  const steps = getSteps(resource);
  return (
    <ProgressSteps steps={steps} bgClass="bg-gray-100">
      <div className="fw-bolder mb-5">
        <span>
          {translate(
            "We're sorry, but the resource creation process has failed.",
          )}
        </span>
        <div className="ms-6 d-inline-block">
          <OrderDetailsLink
            order_uuid={resource.creation_order.uuid}
            project_uuid={resource.creation_order.project_uuid}
            className="btn btn-sm btn-outline btn-outline-success bg-body me-4"
          >
            {translate('View order')}
          </OrderDetailsLink>
          <Button
            variant="success"
            size="sm"
            className="btn-icon-right"
            onClick={() => mutate()}
            disabled={isLoading}
          >
            {translate('Retry')}
            <i className={'fa fa-refresh' + (isLoading ? ' fa-spin' : '')} />
          </Button>
        </div>
      </div>
    </ProgressSteps>
  );
};
