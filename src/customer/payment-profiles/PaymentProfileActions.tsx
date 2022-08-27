import { FunctionComponent } from 'react';

import { PaymentProfileDeleteButton } from './PaymentProfileDeleteButton';
import { PaymentProfileEditButton } from './PaymentProfileEditButton';
import { PaymentProfileEnableButton } from './PaymentProfileEnableButton';

export const PaymentProfileActions: FunctionComponent<any> = (props) => (
  <>
    <PaymentProfileEnableButton
      profile={props.profile}
      refreshList={props.refreshList}
      tooltipAndDisabledAttributes={props.tooltipAndDisabledAttributes}
    />
    <PaymentProfileEditButton
      profile={props.profile}
      refreshList={props.refreshList}
      tooltipAndDisabledAttributes={props.tooltipAndDisabledAttributes}
    />
    <PaymentProfileDeleteButton
      profile={props.profile}
      refreshList={props.refreshList}
      tooltipAndDisabledAttributes={props.tooltipAndDisabledAttributes}
    />
  </>
);
