import { ClipboardTextIcon } from '@phosphor-icons/react';
import { useMutation, useQuery } from '@tanstack/react-query';
import { FC, useMemo } from 'react';
import { Col, Row, Tab, Tabs } from 'react-bootstrap';
import { useDispatch } from 'react-redux';
import {
  marketplaceOrdersApproveByConsumer,
  marketplaceOrdersRejectByConsumer,
  marketplaceOrdersRetrieve,
  marketplacePublicOfferingsRetrieve,
  OrderDetails,
  PublicOfferingDetails,
} from 'waldur-js-client';

import { Badge } from '@waldur/core/Badge';
import { formatDateTime } from '@waldur/core/dateUtils';
import { FieldWithCopy } from '@waldur/core/FieldWithCopy';
import { defaultCurrency } from '@waldur/core/formatCurrency';
import { LoadingErred } from '@waldur/core/LoadingErred';
import { LoadingSpinner } from '@waldur/core/LoadingSpinner';
import { CompactSubmitButton } from '@waldur/form/CompactSubmitButton';
import FormTable from '@waldur/form/FormTable';
import { translate } from '@waldur/i18n';
import { getOrderType } from '@waldur/marketplace/orders/utils';
import { closeModalDialog } from '@waldur/modal/actions';
import { CloseDialogButton } from '@waldur/modal/CloseDialogButton';
import { ModalDialog } from '@waldur/modal/ModalDialog';
import { ResourceLink } from '@waldur/resource/ResourceLink';
import { Field } from '@waldur/resource/summary';
import { useNotify } from '@waldur/store/hooks';

import { ExtendedUserAction } from './types';

interface PendingOrderDetailsDialogProps {
  resolve: {
    row: ExtendedUserAction;
    refetch?: () => void;
  };
}

const OrderSummaryTab: FC<{ order: OrderDetails }> = ({ order }) => {
  const typeBadge = useMemo(() => getOrderType(order), [order]);

  return (
    <Row className="g-3">
      <Col xs={12} sm={6}>
        <Field
          label={translate('Organization')}
          value={order.customer_name}
          labelClass="w-100px"
        />
      </Col>
      <Col xs={12} sm={6}>
        <Field
          label={translate('Project')}
          value={order.project_name}
          labelClass="w-100px"
        />
      </Col>
      <Col xs={12} sm={6}>
        <Field
          label={translate('Resource')}
          value={
            order.marketplace_resource_uuid ? (
              <ResourceLink
                uuid={order.marketplace_resource_uuid}
                label={order.resource_name}
              />
            ) : (
              order.resource_name || '-'
            )
          }
          labelClass="w-100px"
        />
      </Col>
      <Col xs={12} sm={6}>
        <Field
          label={translate('Offering')}
          value={order.offering_name}
          labelClass="w-100px"
        />
      </Col>
      <Col xs={12} sm={6}>
        <Field
          label={translate('Type')}
          value={
            <Badge variant={typeBadge.variant} size="sm" pill outline>
              {typeBadge.label}
            </Badge>
          }
          labelClass="w-100px"
        />
      </Col>
      <Col xs={12} sm={6}>
        <Field
          label={translate('Created by')}
          value={
            order.created_by_full_name
              ? `${order.created_by_full_name} (${order.created_by_username})`
              : order.created_by_username
          }
          labelClass="w-100px"
        />
      </Col>
      <Col xs={12} sm={6}>
        <Field
          label={translate('Created at')}
          value={formatDateTime(order.created)}
          labelClass="w-100px"
        />
      </Col>
      <Col xs={12} sm={6}>
        <Field
          label={translate('Provider')}
          value={order.provider_name}
          labelClass="w-100px"
        />
      </Col>
    </Row>
  );
};

// Human-readable labels for common order attribute keys
const getAttributeLabel = (key: string): string => {
  const labels: Record<string, string> = {
    new_end_date: translate('New end date'),
    old_end_date: translate('Previous end date'),
    renewal_cost: translate('Renewal cost'),
    extension_months: translate('Extension period (months)'),
    action: translate('Action'),
    name: translate('Name'),
    description: translate('Description'),
    end_date: translate('End date'),
    start_date: translate('Start date'),
    limits: translate('Limits'),
    plan: translate('Plan'),
    old_plan: translate('Previous plan'),
    new_plan: translate('New plan'),
    old_limits: translate('Previous limits'),
    new_limits: translate('New limits'),
    termination_reason: translate('Termination reason'),
    accepting_terms_of_service: translate('Terms of service accepted'),
  };
  return (
    labels[key] ||
    key.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase())
  );
};

// Format attribute value for display
const formatAttributeValue = (key: string, value: unknown): string => {
  if (value === null || value === undefined) {
    return '-';
  }
  if (typeof value === 'boolean') {
    return value ? translate('Yes') : translate('No');
  }
  // Format currency values
  if (
    (key.includes('cost') || key.includes('price')) &&
    typeof value === 'number'
  ) {
    return defaultCurrency(value) || String(value);
  }
  if (typeof value === 'object') {
    return JSON.stringify(value, null, 2);
  }
  // Format date-like values
  if (
    typeof value === 'string' &&
    (key.includes('date') || key.includes('_at')) &&
    /^\d{4}-\d{2}-\d{2}/.test(value)
  ) {
    return formatDateTime(value);
  }
  return String(value);
};

const OrderAttributesTab: FC<{ order: OrderDetails }> = ({ order }) => {
  const attributes = order.attributes || {};
  const entries = Object.entries(attributes);

  if (entries.length === 0) {
    return (
      <div className="text-muted">{translate('No attributes submitted.')}</div>
    );
  }

  return (
    <FormTable detailsMode>
      {entries.map(([key, value]) => (
        <FormTable.Item
          key={key}
          label={getAttributeLabel(key)}
          value={<FieldWithCopy value={formatAttributeValue(key, value)} />}
        />
      ))}
    </FormTable>
  );
};

const OrderMetadataTab: FC<{
  order: OrderDetails;
  offering?: PublicOfferingDetails;
}> = ({ order, offering }) => {
  return (
    <FormTable detailsMode>
      {order.backend_id && (
        <FormTable.Item
          label={translate('Backend ID')}
          value={<FieldWithCopy value={order.backend_id} />}
        />
      )}

      {order.category_title && (
        <FormTable.Item
          label={translate('Category')}
          value={<FieldWithCopy value={order.category_title} />}
        />
      )}

      {offering?.components && offering.components.length > 0 && (
        <FormTable.Item
          label={translate('Components')}
          value={
            <FieldWithCopy
              value={offering.components
                .map((component) => component.type)
                .join(', ')}
            />
          }
        />
      )}

      <FormTable.Item
        label={translate('Offering type')}
        value={<FieldWithCopy value={order.offering_type} />}
      />

      <FormTable.Item
        label={translate('Offering UUID')}
        value={<FieldWithCopy value={order.offering_uuid} />}
      />

      <FormTable.Item
        label={translate('Order ID')}
        value={<FieldWithCopy value={order.slug} />}
      />

      <FormTable.Item
        label={translate('Provider UUID')}
        value={<FieldWithCopy value={order.provider_uuid} />}
      />

      {order.marketplace_resource_uuid && (
        <FormTable.Item
          label={translate('Resource UUID')}
          value={<FieldWithCopy value={order.marketplace_resource_uuid} />}
        />
      )}
    </FormTable>
  );
};

export const PendingOrderDetailsDialog: FC<PendingOrderDetailsDialogProps> = ({
  resolve: { row, refetch },
}) => {
  const dispatch = useDispatch();
  const { showSuccess, showErrorResponse } = useNotify();

  // Get order_uuid from route_params
  const orderUuid = row.route_params?.order_uuid as string;

  const {
    data: order,
    isLoading: isLoadingOrder,
    error: orderError,
    refetch: refetchOrder,
  } = useQuery({
    queryKey: ['pending-order-details', orderUuid],
    queryFn: async () => {
      const response = await marketplaceOrdersRetrieve({
        path: { uuid: orderUuid },
      });
      return response.data;
    },
    enabled: Boolean(orderUuid),
  });

  const { data: offering, isLoading: isLoadingOffering } = useQuery({
    queryKey: ['pending-order-offering', order?.offering_uuid],
    queryFn: async () => {
      const response = await marketplacePublicOfferingsRetrieve({
        path: { uuid: order.offering_uuid },
      });
      return response.data;
    },
    enabled: Boolean(order?.offering_uuid),
  });

  const { mutate: approveOrder, isPending: isApproving } = useMutation({
    mutationFn: async () => {
      await marketplaceOrdersApproveByConsumer({
        path: { uuid: orderUuid },
      });
    },
    onSuccess: () => {
      showSuccess(translate('Order has been approved.'));
      refetch?.();
      dispatch(closeModalDialog());
    },
    onError: (error) => {
      showErrorResponse(error, translate('Unable to approve order.'));
    },
  });

  const { mutate: rejectOrder, isPending: isRejecting } = useMutation({
    mutationFn: async () => {
      await marketplaceOrdersRejectByConsumer({
        path: { uuid: orderUuid },
      });
    },
    onSuccess: () => {
      showSuccess(translate('Order has been rejected.'));
      refetch?.();
      dispatch(closeModalDialog());
    },
    onError: (error) => {
      showErrorResponse(error, translate('Unable to reject order.'));
    },
  });

  const isLoading = isLoadingOrder || isLoadingOffering;
  const isSubmitting = isApproving || isRejecting;

  return (
    <ModalDialog
      title={translate('Review order')}
      subtitle={translate(
        'Review the order details and approve or reject this request.',
      )}
      iconNode={<ClipboardTextIcon weight="bold" />}
      iconColor="warning"
      bodyClassName="min-h-300px"
      footer={
        <>
          <CloseDialogButton className="min-w-100px" disabled={isSubmitting} />
          <CompactSubmitButton
            submitting={isRejecting}
            disabled={isSubmitting || !order}
            variant="danger"
            className="min-w-100px"
            onClick={() => rejectOrder()}
            type="button"
            label={translate('Reject')}
          />
          <CompactSubmitButton
            submitting={isApproving}
            disabled={isSubmitting || !order}
            variant="success"
            className="min-w-100px"
            onClick={() => approveOrder()}
            type="button"
            label={translate('Approve')}
          />
        </>
      }
    >
      {isLoading ? (
        <LoadingSpinner />
      ) : orderError ? (
        <LoadingErred
          message={translate('Unable to load order details.')}
          loadData={refetchOrder}
        />
      ) : order ? (
        <Tabs
          defaultActiveKey="summary"
          className="nav-line-tabs mb-4"
          unmountOnExit
        >
          <Tab eventKey="summary" title={translate('Summary')}>
            <OrderSummaryTab order={order} />
          </Tab>
          <Tab eventKey="attributes" title={translate('Attributes')}>
            <OrderAttributesTab order={order} />
          </Tab>
          <Tab eventKey="metadata" title={translate('Metadata')}>
            <OrderMetadataTab order={order} offering={offering} />
          </Tab>
        </Tabs>
      ) : (
        <div className="text-muted">
          {translate('No order information available.')}
        </div>
      )}
    </ModalDialog>
  );
};
