import { FunctionComponent } from 'react';

import { PaymentProfileDeleteButton } from './PaymentProfileDeleteButton';
import { PaymentProfileEditButton } from './PaymentProfileEditButton';
import { PaymentProfileEnableButton } from './PaymentProfileEnableButton';

export const PaymentProfileActions: FunctionComponent<any> = (props) => (
  <>
    <PaymentProfileEnableButton
      profile={props.profile}
      refetch={props.refetch}
      tooltipAndDisabledAttributes={props.tooltipAndDisabledAttributes}
    />
    <PaymentProfileEditButton
      profile={props.profile}
      refetch={props.refetch}
      tooltipAndDisabledAttributes={props.tooltipAndDisabledAttributes}
    />
    <PaymentProfileDeleteButton
      profile={props.profile}
      refetch={props.refetch}
      tooltipAndDisabledAttributes={props.tooltipAndDisabledAttributes}
    />
  </>
);
