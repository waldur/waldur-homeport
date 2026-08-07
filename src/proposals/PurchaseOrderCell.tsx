import { CheckCircleIcon, WarningCircleIcon } from '@phosphor-icons/react';
import { FC } from 'react';

import { Tip } from '@/core/Tooltip';
import { translate } from '@/i18n';
import { DASH_ESCAPE_CODE } from '@/table/constants';

interface PurchaseOrderCellProps {
  row: {
    purchase_order_required?: boolean;
    has_purchase_order?: boolean;
    purchase_order_reference?: string;
    attachment?: string | null;
  };
}

/**
 * Whether this request carries the purchase order its call entry demands.
 *
 * The missing state is a warning rather than a dash because it blocks
 * submission — validate_purchase_orders_present rejects the whole proposal.
 */
export const PurchaseOrderCell: FC<PurchaseOrderCellProps> = ({ row }) => {
  if (!row.purchase_order_required && !row.has_purchase_order) {
    return <>{DASH_ESCAPE_CODE}</>;
  }
  if (!row.has_purchase_order) {
    return (
      <Tip
        id="purchase-order-missing"
        label={translate(
          'This offering requires a purchase order. The proposal cannot be submitted until one is attached.',
        )}
      >
        <span className="d-inline-flex align-items-center gap-2 text-warning">
          <WarningCircleIcon weight="bold" />
          {translate('Required')}
        </span>
      </Tip>
    );
  }
  return (
    <span className="d-inline-flex align-items-center gap-2">
      <CheckCircleIcon weight="bold" className="text-success" />
      {row.purchase_order_reference || translate('Attached')}
    </span>
  );
};
