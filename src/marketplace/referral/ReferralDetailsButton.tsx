import { EyeIcon } from '@phosphor-icons/react';
import { FunctionComponent } from 'react';
import { Offering } from 'waldur-js-client';

import { BaseButton } from 'waldur-ui';

import { lazyComponent } from '@/core/lazyComponent';
import { translate } from '@/i18n';
import { useModal } from '@/modal/actions';

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
    <BaseButton
      label={translate('Details')}
      iconNode={<EyeIcon weight="bold" />}
      onClick={() =>
        openDialog(OfferingReferralsDialog, {
          resolve: props.offering,
          size: 'lg',
        })
      }
      variant="tertiary"
      size="lg"
    />
  );
};
