import { Resource } from 'waldur-js-client';

interface PurchaseOrderConfig {
  showPurchaseOrder: boolean;
  isRequired: boolean;
}

export const getPurchaseOrderConfig = (
  resource: Pick<Resource, 'offering_plugin_options'> | undefined,
): PurchaseOrderConfig => {
  const opts =
    (resource?.offering_plugin_options as Record<string, unknown>) || {};
  const isRequired = opts.require_purchase_order_upload === true;
  const showPurchaseOrder =
    opts.enable_purchase_order_upload === true || isRequired;
  return { showPurchaseOrder, isRequired };
};
