import * as React from 'react';

import { Tooltip } from '@waldur/core/Tooltip';
import { translate } from '@waldur/i18n';

interface PaymentProfile {
  name: string;
  payment_type: string;
  is_active: boolean;
}

interface CustomerPaymentProfileProps {
  paymentProfiles: PaymentProfile[];
}

export const CustomerPaymentProfile = (props: CustomerPaymentProfileProps) => {
  if (!props.paymentProfiles) {
    return;
  }
  const activePaymentProfile = props.paymentProfiles.find(
    element => element.is_active,
  );
  return activePaymentProfile ? (
    <dl className="dl-horizontal m-t-sm resource-details-table">
      <div className="m-b-xs">
        <dt>{translate('Payment profile ')}</dt>
        <dd>
          <Tooltip
            label={translate('Payment type {type}', {
              type: activePaymentProfile.payment_type,
            })}
            id="fieldLabel"
          >
            {translate(activePaymentProfile.name)}
          </Tooltip>
        </dd>
      </div>
    </dl>
  ) : null;
};
