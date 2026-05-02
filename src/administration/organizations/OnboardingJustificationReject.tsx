import { XCircleIcon } from '@phosphor-icons/react';
import { FunctionComponent } from 'react';
import { onboardingJustificationsReject } from 'waldur-js-client';

import { translate } from '@/i18n';
import { useManagedMutation } from '@/modal/useManagedMutation';
import { ActionItem } from '@/resource/actions/ActionItem';

export const OnboardingJustificationReject: FunctionComponent<{
  row;
  refetch;
}> = ({ row, refetch }) => {
  const { mutate, isPending } = useManagedMutation<any, any, any>({
    mutationFn: (staff_notes) =>
      onboardingJustificationsReject({
        path: { uuid: row.uuid },
        body: { staff_notes: staff_notes.input },
      }),
    confirmation: {
      title: translate('Reject justification'),
      body: translate(
        'Are you sure you want to reject this onboarding justification?',
      ),
      options: {
        showInput: true,
        inputPlaceholder: translate('Staff notes'),
        inputRequired: false,
      },
    },
    successMessage: translate('Onboarding justification has been rejected.'),
    errorMessage: translate('Unable to reject onboarding justification.'),
    refetch,
  });

  const isDisabled = row.validation_decision !== 'pending' || isPending;

  return (
    <ActionItem
      title={translate('Reject')}
      action={mutate}
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
