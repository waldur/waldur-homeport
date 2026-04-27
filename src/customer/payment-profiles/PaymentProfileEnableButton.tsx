import { PlayIcon } from '@phosphor-icons/react';
import { useDispatch, useSelector } from 'react-redux';
import { paymentProfilesEnable } from 'waldur-js-client';

import { translate } from '@/i18n';
import { ActionItem } from '@/resource/actions/ActionItem';
import { showErrorResponse, showSuccess } from '@/store/notify';
import { setCurrentCustomer } from '@/workspace/actions';
import { getCustomer } from '@/workspace/selectors';

import { getCustomer as getCustomerApi } from '../utils';

export const PaymentProfileEnableButton = (props) => {
  const dispatch = useDispatch();
  const customer = useSelector(getCustomer);
  const callback = async () => {
    try {
      await paymentProfilesEnable({ path: { uuid: props.row.uuid } });
      dispatch(showSuccess(translate('Payment profile has been enabled.')));
      await props.refetch();
      const updatedCustomer = await getCustomerApi(customer.uuid);
      dispatch(setCurrentCustomer(updatedCustomer));
    } catch (error) {
      dispatch(
        showErrorResponse(
          error,
          translate('Unable to enable payment profile.'),
        ),
      );
    }
  };
  if (props.row.is_active) {
    return null;
  }
  return (
    <ActionItem
      title={translate('Enable')}
      action={callback}
      iconNode={<PlayIcon weight="bold" />}
      {...props.tooltipAndDisabledAttributes}
    />
  );
};
