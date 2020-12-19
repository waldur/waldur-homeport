import { FunctionComponent } from 'react';
import { useDispatch } from 'react-redux';

import { lazyComponent } from '@waldur/core/lazyComponent';
import { translate } from '@waldur/i18n';
import { Offering } from '@waldur/marketplace/types';
import { openModalDialog } from '@waldur/modal/actions';
import { ActionButton } from '@waldur/table/ActionButton';

const OfferingReferralsDialog = lazyComponent(
  () =>
    import(
      /* webpackChunkName: "OfferingReferralsDialog" */ './OfferingReferralsDialog'
    ),
  'OfferingReferralsDialog',
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

export const ReferralDetailsButton: FunctionComponent<ReferralDetailsButtonProps> = (
  props,
) => {
  const dispatch = useDispatch();
  return (
    <ActionButton
      title={translate('Details')}
      icon="fa fa-eye"
      action={() => dispatch(openReferralsDialog(props.offering))}
    />
  );
};
