import { ActionsDropdown } from '@waldur/table/ActionsDropdown';

import { PaymentProfileDeleteButton } from './PaymentProfileDeleteButton';
import { PaymentProfileEditButton } from './PaymentProfileEditButton';
import { PaymentProfileEnableButton } from './PaymentProfileEnableButton';

export const PaymentProfileActions = ({
  profile,
  refetch,
  tooltipAndDisabledAttributes,
}) => (
  <ActionsDropdown
    row={profile}
    refetch={refetch}
    actions={[
      (props) => (
        <PaymentProfileEnableButton
          {...props}
          tooltipAndDisabledAttributes={tooltipAndDisabledAttributes}
        />
      ),

      (props) => (
        <PaymentProfileEditButton
          {...props}
          tooltipAndDisabledAttributes={tooltipAndDisabledAttributes}
        />
      ),

      (props) => (
        <PaymentProfileDeleteButton
          {...props}
          tooltipAndDisabledAttributes={tooltipAndDisabledAttributes}
        />
      ),
    ].filter(Boolean)}
  />
);
