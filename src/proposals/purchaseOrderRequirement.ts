interface PurchaseOrderRequirement {
  showPurchaseOrder: boolean;
  /** The proposal cannot be submitted until a reference or a document is given. */
  isRequired: boolean;
}

interface RequestedOfferingLike {
  require_purchase_order?: boolean;
}

interface OfferingLike {
  plugin_options?: Record<string, unknown> | null;
}

/**
 * Whether a resource request needs a purchase order, and whether it must have one.
 *
 * The requirement lives on the call entry
 * (`RequestedOffering.require_purchase_order`), seeded from the offering but
 * owned by the call manager afterwards — so it is the authority here, not the
 * offering flag. `validate_purchase_orders_present` enforces the same field at
 * submission.
 *
 * The offering's own `enable_purchase_order_upload` still opens the block
 * without making it mandatory, so a provider that merely accepts purchase
 * orders keeps offering the field.
 */
export const getPurchaseOrderRequirement = (
  requestedOffering: RequestedOfferingLike | undefined,
  offering: OfferingLike | undefined,
): PurchaseOrderRequirement => {
  const isRequired = requestedOffering?.require_purchase_order === true;
  const options = (offering?.plugin_options as Record<string, unknown>) || {};
  const showPurchaseOrder =
    isRequired ||
    options.enable_purchase_order_upload === true ||
    options.require_purchase_order_upload === true;
  return { showPurchaseOrder, isRequired };
};
