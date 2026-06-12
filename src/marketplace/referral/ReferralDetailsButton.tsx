import { EyeIcon } from '@phosphor-icons/react';
import { FunctionComponent } from 'react';
import { Offering } from 'waldur-js-client';

import { lazyComponent } from '@/core/lazyComponent';
import { translate } from '@/i18n';
import { useModal } from '@/modal/actions';
import { ActionButton } from '@/table/ActionButton';

const OfferingReferralsDialog = lazyComponent(() =>
  import('./OfferingReferralsDialog').then((module) => ({
    default: module.OfferingReferralsDialog,
  })),
);

interface ReferralDetailsButtonProps {
  offering: Offering;
}

export const ReferralDetailsButton: FunctionComponent<
  ReferralDetailsButtonProps
> = (props) => {
  const { openDialog } = useModal();
  return (
    <ActionButton
      title={translate('Details')}
      iconNode={<EyeIcon weight="bold" />}
      action={() =>
        openDialog(OfferingReferralsDialog, {
          resolve: props.offering,
          size: 'lg',
        })
      }
    />
  );
};
