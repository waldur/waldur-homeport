import { XCircleIcon } from '@phosphor-icons/react';
import { FunctionComponent } from 'react';
import { useDispatch } from 'react-redux';
import { onboardingJustificationsReject } from 'waldur-js-client';

import { translate } from '@waldur/i18n';
import { waitForConfirmation } from '@waldur/modal/actions';
import { ActionItem } from '@waldur/resource/actions/ActionItem';
import { showSuccess, showErrorResponse } from '@waldur/store/notify';

export const OnboardingJustificationReject: FunctionComponent<{
  row;
  refetch;
}> = ({ row, refetch }) => {
  const dispatch = useDispatch();

  const callback = async () => {
    try {
      const staff_notes = await waitForConfirmation(
        dispatch,
        translate('Reject justification'),
        translate(
          'Are you sure you want to reject this onboarding justification?',
        ),
        {
          showInput: true,
          inputPlaceholder: translate('Staff notes'),
          inputRequired: false,
        },
      );
      await onboardingJustificationsReject({
        path: { uuid: row.uuid },
        body: { staff_notes: staff_notes },
      });
      await refetch();
      dispatch(
        showSuccess(translate('Onboarding justification has been rejected.')),
      );
    } catch (e) {
      dispatch(
        showErrorResponse(
          e,
          translate('Unable to reject onboarding justification.'),
        ),
      );
    }
  };

  const isDisabled = row.validation_decision !== 'pending';

  return (
    <ActionItem
      title={translate('Reject')}
      action={callback}
      iconNode={<XCircleIcon weight="bold" />}
      iconColor="danger"
      className="text-danger"
      disabled={isDisabled}
      tooltip={
        isDisabled
          ? translate('This justification has already been reviewed')
          : undefined
      }
    />
  );
};
