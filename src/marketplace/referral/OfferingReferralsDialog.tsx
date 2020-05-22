import * as React from 'react';

import { translate } from '@waldur/i18n';
import { ReferralsList } from '@waldur/marketplace/referral/ReferralsList';
import { CloseDialogButton } from '@waldur/modal/CloseDialogButton';
import { ModalDialog } from '@waldur/modal/ModalDialog';
import { Offering } from '@waldur/offering/types';

interface OfferingReferralsDialogProps {
  resolve: Offering;
}

export const OfferingReferralsDialog = (
  props: OfferingReferralsDialogProps,
) => (
  <ModalDialog
    title={translate('Referrals for {name}', {
      name: props.resolve.name,
    })}
    footer={<CloseDialogButton />}
  >
    <ReferralsList offering={props.resolve} />
  </ModalDialog>
);
