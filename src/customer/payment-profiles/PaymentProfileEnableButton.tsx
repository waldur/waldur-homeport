import { useDispatch } from 'react-redux';

import { translate } from '@waldur/i18n';
import { ActionButton } from '@waldur/table/ActionButton';

import { enablePaymentProfile } from './store/actions';

export const PaymentProfileEnableButton = (props) => {
  const dispatch = useDispatch();
  const callback = () =>
    dispatch(
      enablePaymentProfile({
        uuid: props.profile.uuid,
        refetch: props.refetch,
      }),
    );
  if (props.profile.is_active) {
    return null;
  }
  return (
    <ActionButton
      title={translate('Enable')}
      action={callback}
      icon="fa fa-play"
      {...props.tooltipAndDisabledAttributes}
    />
  );
};
