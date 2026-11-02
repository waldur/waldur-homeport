import { ClipboardTextIcon } from '@phosphor-icons/react';
import { useQuery } from '@tanstack/react-query';
import { FC, useCallback, useMemo } from 'react';
import {
  marketplaceOrdersApproveByConsumer,
  marketplaceOrdersRejectByConsumer,
  marketplaceOrdersRetrieve,
  marketplacePublicOfferingsRetrieve,
  OrderDetails,
  PublicOfferingDetails,
} from 'waldur-js-client';

import {
  BaseButton,
  PropertyItem,
  PropertyList,
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from 'waldur-ui';

import { lazyComponent } from '@/core/lazyComponent';
import { LoadingErred } from '@/core/LoadingErred';
import { LoadingSpinner } from '@/core/LoadingSpinner';
import { translate } from '@/i18n';
import { getOrderType } from '@/marketplace/orders/utils';
import { useModal } from '@/modal/actions';
import { CloseDialogButton } from '@/modal/CloseDialogButton';
import { ModalDialog } from '@/modal/ModalDialog';
import { useManagedMutation } from '@/modal/useManagedMutation';
import { propVal } from '@/property/propertyFields';

const UploadPurchaseOrderDialog = lazyComponent(() =>
  import('@/marketplace/orders/actions/UploadPurchaseOrderDialog').then(
    (module) => ({ default: module.UploadPurchaseOrderDialog }),
  ),
);

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
    <PropertyList
      variant="summary"
      className="grid grid-cols-1 gap-2.5 sm:grid-cols-2"
      labelClass="w-[100px]"
    >
      <PropertyItem
        label={translate('Organization')}
        value={order.customer_name}
      />
      <PropertyItem label={translate('Project')} value={order.project_name} />
      <PropertyItem
        label={translate('Resource')}
        value={
          order.marketplace_resource_uuid
            ? propVal.link(order.resource_name, {
                state: 'marketplace-resource-details',
                params: { resource_uuid: order.marketplace_resource_uuid },
              })
            : order.resource_name
        }
      />
      <PropertyItem label={translate('Offering')} value={order.offering_name} />
      <PropertyItem
        label={translate('Type')}
        value={propVal.badge(typeBadge.label, {
          variant: typeBadge.variant,
        })}
      />
      <PropertyItem
        label={translate('Created by')}
        value={propVal.user({
          full_name: order.created_by_full_name,
          username: order.created_by_username,
        })}
      />
      <PropertyItem
        label={translate('Created at')}
        value={propVal.date(order.created, { precision: 'datetime' })}
      />
      <PropertyItem label={translate('Provider')} value={order.provider_name} />
    </PropertyList>
  );
};

// Human-readable labels for common order attribute keys
export const getAttributeLabel = (key: string): string => {
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

export interface OrderAttributePropertyProps {
  name: string;
  value: unknown;
  label?: string;
  hasCopy?: boolean;
}

export const OrderAttributeProperty: FC<OrderAttributePropertyProps> = ({
  name,
  value,
  label = getAttributeLabel(name),
  hasCopy = true,
}) => {
  if (typeof value === 'boolean') {
    return (
      <PropertyItem
        label={label}
        value={propVal.boolean(value)}
        hasCopy={hasCopy}
      />
    );
  }
  if (
    (name.includes('cost') || name.includes('price')) &&
    typeof value === 'number'
  ) {
    return (
      <PropertyItem
        label={label}
        value={propVal.currency(value)}
        hasCopy={hasCopy}
      />
    );
  }
  if (
    typeof value === 'string' &&
    (name.includes('date') || name.includes('_at')) &&
    /^\d{4}-\d{2}-\d{2}/.test(value)
  ) {
    return (
      <PropertyItem
        label={label}
        value={propVal.date(value, { precision: 'datetime' })}
        hasCopy={hasCopy}
      />
    );
  }
  if (typeof value === 'object' && value !== null) {
    return (
      <PropertyItem
        label={label}
        value={propVal.json(value)}
        hasCopy={hasCopy}
      />
    );
  }
  return (
    <PropertyItem
      label={label}
      value={value as string | number | null | undefined}
      hasCopy={hasCopy}
    />
  );
};

const OrderAttributesTab: FC<{ order: OrderDetails }> = ({ order }) => {
  const attributes = order.attributes || {};
  const entries = Object.entries(attributes);

  if (entries.length === 0) {
    return (
      <div className="text-quaternary">
        {translate('No attributes submitted.')}
      </div>
    );
  }

  return (
    <PropertyList detailsMode>
      {entries.map(([key, value]) => (
        <OrderAttributeProperty key={key} name={key} value={value} />
      ))}
    </PropertyList>
  );
};

const OrderMetadataTab: FC<{
  order: OrderDetails;
  offering?: PublicOfferingDetails;
}> = ({ order, offering }) => {
  return (
    <PropertyList detailsMode hideIfEmpty>
      <PropertyItem
        label={translate('Backend ID')}
        value={order.backend_id}
        hasCopy
      />

      <PropertyItem
        label={translate('Category')}
        value={order.category_title}
        hasCopy
      />

      <PropertyItem
        label={translate('Components')}
        value={propVal.list(
          offering?.components?.map((component) => component.type),
        )}
        hasCopy
      />

      <PropertyItem
        label={translate('Offering type')}
        value={order.offering_type}
        hasCopy
      />

      <PropertyItem
        label={translate('Offering UUID')}
        value={order.offering_uuid}
        hasCopy
      />

      <PropertyItem label={translate('Order ID')} value={order.slug} hasCopy />

      <PropertyItem
        label={translate('Provider UUID')}
        value={order.provider_uuid}
        hasCopy
      />

      <PropertyItem
        label={translate('Resource UUID')}
        value={order.marketplace_resource_uuid}
        hasCopy
      />
    </PropertyList>
  );
};

export const PendingOrderDetailsDialog: FC<PendingOrderDetailsDialogProps> = ({
  resolve: { row, refetch },
}) => {
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

  const { openDialog } = useModal();

  const approveOrderMutation = useManagedMutation<any, any, void>({
    mutationFn: () =>
      marketplaceOrdersApproveByConsumer({
        path: { uuid: orderUuid },
      }),
    successMessage: translate('Order has been approved.'),
    errorMessage: translate('Unable to approve order.'),
    refetch,
  });

  const handleApprove = useCallback(() => {
    if (
      // Already carrying the document — a proposal hands its purchase order to
      // the order it allocates — there is nothing left to ask for, and the
      // dialog's upload would replace what is there.
      !order?.attachment &&
      (offering?.plugin_options?.enable_purchase_order_upload ||
        offering?.plugin_options?.require_purchase_order_upload)
    ) {
      openDialog(UploadPurchaseOrderDialog, {
        order,
        refetch,
        required: Boolean(
          offering?.plugin_options?.require_purchase_order_upload,
        ),
      });
    } else {
      approveOrderMutation.mutate();
    }
  }, [offering, openDialog, order, refetch, approveOrderMutation]);

  const rejectOrderMutation = useManagedMutation<any, any, void>({
    mutationFn: () =>
      marketplaceOrdersRejectByConsumer({
        path: { uuid: orderUuid },
      }),
    successMessage: translate('Order has been rejected.'),
    errorMessage: translate('Unable to reject order.'),
    refetch,
  });

  const isLoading = isLoadingOrder || isLoadingOffering;
  const isSubmitting =
    approveOrderMutation.isPending || rejectOrderMutation.isPending;

  return (
    <ModalDialog
      title={translate('Review order')}
      subtitle={translate(
        'Review the order details and approve or reject this request.',
      )}
      iconNode={<ClipboardTextIcon weight="bold" />}
      iconColor="warning"
      bodyClassName="min-h-[300px]"
      footer={
        <>
          <CloseDialogButton
            className="min-w-[100px]"
            disabled={isSubmitting}
            disabledReason={translate(
              'Please wait for the current action to complete',
            )}
          />
          <BaseButton
            size="sm"
            pending={rejectOrderMutation.isPending}
            disabled={isSubmitting || !order}
            disabledReason={
              isSubmitting
                ? translate('Please wait for the current action to complete')
                : !order
                  ? translate('Order details unavailable')
                  : undefined
            }
            variant="danger"
            className="min-w-[100px]"
            onClick={() => rejectOrderMutation.mutate()}
            label={translate('Reject')}
          />
          <BaseButton
            size="sm"
            pending={approveOrderMutation.isPending}
            disabled={isSubmitting || !order}
            disabledReason={
              isSubmitting
                ? translate('Please wait for the current action to complete')
                : !order
                  ? translate('Order details unavailable')
                  : undefined
            }
            variant="success"
            className="min-w-[100px]"
            onClick={handleApprove}
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
        <Tabs mount="active" defaultValue="summary">
          <TabsList className="mb-3">
            <TabsTrigger value="summary">{translate('Summary')}</TabsTrigger>
            <TabsTrigger value="attributes">
              {translate('Attributes')}
            </TabsTrigger>
            <TabsTrigger value="metadata">{translate('Metadata')}</TabsTrigger>
          </TabsList>
          <div className="tab-content">
            <TabsContent value="summary">
              <OrderSummaryTab order={order} />
            </TabsContent>
            <TabsContent value="attributes">
              <OrderAttributesTab order={order} />
            </TabsContent>
            <TabsContent value="metadata">
              <OrderMetadataTab order={order} offering={offering} />
            </TabsContent>
          </div>
        </Tabs>
      ) : (
        <div className="text-quaternary">
          {translate('No order information available.')}
        </div>
      )}
    </ModalDialog>
  );
};
