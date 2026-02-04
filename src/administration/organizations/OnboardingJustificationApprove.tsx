import { CheckCircleIcon } from '@phosphor-icons/react';
import { FunctionComponent } from 'react';
import { useDispatch } from 'react-redux';
import {
  onboardingJustificationsApprove,
  onboardingVerificationsCreateCustomer,
} from 'waldur-js-client';

import { translate } from '@waldur/i18n';
import { waitForConfirmation } from '@waldur/modal/actions';
import { ActionItem } from '@waldur/resource/actions/ActionItem';
import { showSuccess, showErrorResponse } from '@waldur/store/notify';

export const OnboardingJustificationApprove: FunctionComponent<{
  row;
  refetch;
}> = ({ row, refetch }) => {
  const dispatch = useDispatch();

  const callback = async () => {
    try {
      const staff_notes = await waitForConfirmation(
        dispatch,
        translate('Approve justification'),
        translate(
          'Are you sure you want to approve this onboarding justification? This will create the organization automatically.',
        ),
        {
          showInput: true,
          inputPlaceholder: translate('Staff notes'),
          inputRequired: false,
        },
      );

      await onboardingJustificationsApprove({
        path: { uuid: row.uuid },
        body: { staff_notes: staff_notes.input },
      });
      await refetch();
      dispatch(
        showSuccess(translate('Onboarding justification has been approved.')),
      );
      await onboardingVerificationsCreateCustomer({
        path: { uuid: row.verification_uuid },
      });
      showSuccess(
        translate('Company verification successful. Organization created!'),
      );
    } catch (e) {
      dispatch(
        showErrorResponse(
          e,
          translate('Unable to approve onboarding justification.'),
        ),
      );
    }
  };

  const isDisabled = row.validation_decision !== 'pending';

  return (
    <ActionItem
      title={translate('Approve')}
      action={callback}
      iconNode={<CheckCircleIcon weight="bold" />}
      iconColor="success"
      className="text-success"
      disabled={isDisabled}
      tooltip={
        isDisabled
          ? translate('This justification has already been reviewed')
          : undefined
      }
    />
  );
};
