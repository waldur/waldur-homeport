import { Play } from '@phosphor-icons/react';
import { useDispatch } from 'react-redux';

import { translate } from '@waldur/i18n';
import { RowActionButton } from '@waldur/table/ActionButton';

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
    <RowActionButton
      title={translate('Enable')}
      action={callback}
      iconNode={<Play />}
      size="sm"
      {...props.tooltipAndDisabledAttributes}
    />
  );
};
