import { FC } from 'react';
import { RequestedOffering } from 'waldur-js-client';

import { Tip } from '@/core/Tooltip';
import { translate } from '@/i18n';
import { DASH_ESCAPE_CODE } from '@/table/constants';

interface CallOfferingPurchaseOrderFieldProps {
  row: RequestedOffering;
}

/**
 * Whether this call entry demands a purchase order.
 *
 * The requirement belongs to the offering's provider, and the call takes a copy
 * of it when the offering is added. A call manager could not see it anywhere,
 * yet it decides whether their applicants are asked for a purchase order and
 * whether a proposal can be submitted without one — so it is shown here as a
 * fact about the entry, not as something to act on.
 */
export const CallOfferingPurchaseOrderField: FC<
  CallOfferingPurchaseOrderFieldProps
> = ({ row }) => {
  if (!row.require_purchase_order) {
    return <>{DASH_ESCAPE_CODE}</>;
  }
  return (
    <Tip
      id="call-offering-purchase-order-required"
      label={translate(
        'Applicants must give a purchase order reference or attach the document before the proposal can be submitted. The provider sets this on the offering; the call keeps the setting it had when the offering was added.',
      )}
    >
      <span>{translate('Required')}</span>
    </Tip>
  );
};
