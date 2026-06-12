import { FunctionComponent } from 'react';
import { Offering } from 'waldur-js-client';

import { translate } from '@/i18n';
import { ReferralsList } from '@/marketplace/referral/ReferralsList';
import { CloseDialogButton } from '@/modal/CloseDialogButton';
import { ModalDialog } from '@/modal/ModalDialog';

interface OfferingReferralsDialogProps {
  resolve: Offering;
}

export const OfferingReferralsDialog: FunctionComponent<
  OfferingReferralsDialogProps
> = (props) => (
  <ModalDialog
    title={translate('Referrals for {name}', {
      name: props.resolve.name,
    })}
    footer={<CloseDialogButton label={translate('Close')} />}
  >
    <ReferralsList offering={props.resolve} />
  </ModalDialog>
);
