import { DownloadSimpleIcon } from '@phosphor-icons/react';
import { OrderDetails } from 'waldur-js-client';

import { Badge, PropertyItem, PropertyList } from 'waldur-ui';

import { FileDownloader } from '@/form/upload/FileDownloader';
import { translate } from '@/i18n';
import { canUseMarketplaceShopUi } from '@/marketplace/canUseMarketplaceShopUi';
import { propVal } from '@/property/propertyFields';
import { useUser } from '@/workspace/hooks';

import { shouldLinkProviderResource } from '../utils';

import { OrderDetailsQuickBody } from './OrderDetailsQuickBody';

const PurchaseOrderBadge = ({ order, offering }) => {
  const requireUpload = offering?.plugin_options?.require_purchase_order_upload;
  const enableUpload = offering?.plugin_options?.enable_purchase_order_upload;

  if (!enableUpload && !requireUpload) return null;

  if (order.attachment) {
    return (
      <FileDownloader
        url={order.attachment}
        name={translate('PDF file')}
        className="text-btn inline-flex items-center gap-1 no-underline"
      >
        <Badge
          variant="success"
          size="sm"
          leftIcon={<DownloadSimpleIcon weight="bold" size={12} />}
          shape="pill"
          tone="outline"
        >
          {translate('Download')}
        </Badge>
      </FileDownloader>
    );
  }

  if (requireUpload) {
    return (
      <Badge variant="warning" size="sm" shape="pill" tone="outline">
        {translate('Required')}
      </Badge>
    );
  }

  return (
    <Badge variant="neutral" size="sm" shape="pill" tone="outline">
      {translate('Optional')}
    </Badge>
  );
};

export const OrderDetailsHeaderBody = ({
  order,
  offering = undefined,
}: {
  order: OrderDetails;
  offering?: any;
}) => {
  const user = useUser();
  const showOfferingLink = canUseMarketplaceShopUi(user);
  const showPurchaseOrder =
    offering?.plugin_options?.enable_purchase_order_upload ||
    offering?.plugin_options?.require_purchase_order_upload;

  return (
    <div className="flex flex-wrap gap-x-5">
      <div className="w-full sm:w-auto sm:flex-none">
        <PropertyList variant="summary" termWidth="100px">
          <PropertyItem
            label={translate('Organization')}
            value={order.customer_name}
          />
          <PropertyItem
            label={translate('Project')}
            value={order.project_name}
          />
        </PropertyList>
      </div>
      <div className="w-full sm:w-auto sm:flex-none">
        <PropertyList variant="summary" termWidth="100px">
          <PropertyItem
            label={translate('Resource')}
            value={
              shouldLinkProviderResource(user, order)
                ? propVal.link(order.resource_name, {
                    state: 'marketplace-provider-resource-details',
                    params: {
                      uuid: order.provider_uuid,
                      resource_uuid: order.marketplace_resource_uuid,
                    },
                  })
                : propVal.link(order.resource_name, {
                    state: 'marketplace-resource-details',
                    params: {
                      resource_uuid: order.marketplace_resource_uuid,
                    },
                  })
            }
          />
          <OrderDetailsQuickBody order={order} autoWidth />
          <PropertyItem
            label={translate('Offering')}
            value={
              showOfferingLink
                ? propVal.link(order.offering_name, {
                    state: 'public-offering.marketplace-public-offering',
                    params: { uuid: order.offering_uuid },
                  })
                : order.offering_name
            }
          />
        </PropertyList>
      </div>
      {showPurchaseOrder && (
        <div className="w-full sm:w-auto sm:flex-none">
          <PropertyList variant="summary" termWidth="125px">
            <PropertyItem
              label={translate('Purchase order')}
              value={<PurchaseOrderBadge order={order} offering={offering} />}
            />
          </PropertyList>
        </div>
      )}
    </div>
  );
};
