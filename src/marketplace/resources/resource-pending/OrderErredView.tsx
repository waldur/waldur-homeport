import { FC, useCallback } from 'react';
import { Button } from 'react-bootstrap';
import { useDispatch, useSelector } from 'react-redux';

import { formatDateTime } from '@waldur/core/dateUtils';
import { lazyComponent } from '@waldur/core/lazyComponent';
import { ProgressSteps } from '@waldur/core/ProgressSteps';
import { omit } from '@waldur/core/utils';
import { translate } from '@waldur/i18n';
import { addItemRequest } from '@waldur/marketplace/cart/store/actions';
import { isAddingItem } from '@waldur/marketplace/cart/store/selectors';
import { OrderRequest } from '@waldur/marketplace/cart/types';
import { OrderDetailsLink } from '@waldur/marketplace/orders/details/OrderDetailsLink';
import { openModalDialog, waitForConfirmation } from '@waldur/modal/actions';

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
  const isRetrying = useSelector(isAddingItem);
  const dispatch = useDispatch();
  const retry = useCallback(() => {
    waitForConfirmation(
      dispatch,
      translate('Confirmation'),
      translate('Are you sure you want to retry to submit this order?'),
    ).then(() => {
      const item: OrderRequest = {
        attributes: resource.attributes || resource.creation_order.attributes,
        limits: resource.limits || resource.creation_order.limits,
        offering: {
          // We only need the url in the order request
          url: resource.offering || resource.creation_order.offering,
        },
        plan: {
          // We only need the url in the order request
          url: resource.plan || resource.creation_order.plan,
        },
        project: resource.project || resource.creation_order.project,
      };
      dispatch(addItemRequest(item));
    });
  }, [dispatch, resource]);

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
            onClick={retry}
            disabled={isRetrying}
          >
            {translate('Retry')}
            <i className={'fa fa-refresh' + (isRetrying ? ' fa-spin' : '')} />
          </Button>
        </div>
      </div>
    </ProgressSteps>
  );
};
