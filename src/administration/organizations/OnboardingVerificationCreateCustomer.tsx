import { UserCirclePlusIcon } from '@phosphor-icons/react';
import { FunctionComponent } from 'react';
import { useDispatch } from 'react-redux';
import { onboardingVerificationsCreateCustomer } from 'waldur-js-client';

import { translate } from '@/i18n';
import { waitForConfirmation } from '@/modal/actions';
import { ActionItem } from '@/resource/actions/ActionItem';
import { showSuccess, showErrorResponse } from '@/store/notify';

export const OnboardingVerificationCreateCustomer: FunctionComponent<{
  row;
  refetch;
}> = ({ row, refetch }) => {
  const dispatch = useDispatch();

  const callback = async () => {
    try {
      await waitForConfirmation(
        dispatch,
        translate('Create customer'),
        translate(
          'Are you sure you want to create a customer from this verification entry?',
        ),
      );
    } catch {
      return;
    }
    try {
      await onboardingVerificationsCreateCustomer({
        path: { uuid: row.uuid },
      });
      await refetch();
      dispatch(
        showSuccess(
          translate('Customer has been created from verification entry.'),
        ),
      );
    } catch (e) {
      dispatch(showErrorResponse(e, translate('Unable to create customer.')));
    }
  };

  const isDisabled = row.status !== 'verified';

  return (
    <ActionItem
      title={translate('Create customer')}
      action={callback}
      iconNode={<UserCirclePlusIcon weight="bold" />}
      disabled={isDisabled}
      tooltip={
        isDisabled
          ? translate('Customers can be created only from verified entries')
          : undefined
      }
    />
  );
};
