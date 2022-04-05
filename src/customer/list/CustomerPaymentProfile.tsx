import { FunctionComponent } from 'react';

import { Tip } from '@waldur/core/Tooltip';
import { translate } from '@waldur/i18n';
import { ResourceDetailsTable } from '@waldur/resource/summary/ResourceDetailsTable';
import { PaymentProfile } from '@waldur/workspace/types';

interface CustomerPaymentProfileProps {
  paymentProfiles: PaymentProfile[];
}

export const CustomerPaymentProfile: FunctionComponent<CustomerPaymentProfileProps> =
  (props) => {
    if (!props.paymentProfiles) {
      return null;
    }
    const activePaymentProfile = props.paymentProfiles.find(
      (element) => element.is_active,
    );
    return activePaymentProfile ? (
      <ResourceDetailsTable>
        <div className="mb-1 mt-2 ">
          <dt>{translate('Payment profile ')}</dt>
          <dd>
            <Tip
              label={translate('Payment type {type}', {
                type: activePaymentProfile.payment_type,
              })}
              id="fieldLabel"
            >
              {activePaymentProfile.name}
            </Tip>
          </dd>
        </div>
      </ResourceDetailsTable>
    ) : null;
  };
