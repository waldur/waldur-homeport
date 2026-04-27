import { EyeIcon } from '@phosphor-icons/react';
import { FunctionComponent } from 'react';
import { useDispatch } from 'react-redux';

import { lazyComponent } from '@/core/lazyComponent';
import { translate } from '@/i18n';
import { Offering } from '@/marketplace/types';
import { openModalDialog } from '@/modal/actions';
import { ActionButton } from '@/table/ActionButton';

const OfferingReferralsDialog = lazyComponent(() =>
  import('./OfferingReferralsDialog').then((module) => ({
    default: module.OfferingReferralsDialog,
  })),
);

interface ReferralDetailsButtonProps {
  offering: Offering;
}

const openReferralsDialog = (offering: Offering) => {
  return openModalDialog(OfferingReferralsDialog, {
    resolve: offering,
    size: 'lg',
  });
};

export const ReferralDetailsButton: FunctionComponent<
  ReferralDetailsButtonProps
> = (props) => {
  const dispatch = useDispatch();
  return (
    <ActionButton
      title={translate('Details')}
      iconNode={<EyeIcon weight="bold" />}
      action={() => dispatch(openReferralsDialog(props.offering))}
    />
  );
};
