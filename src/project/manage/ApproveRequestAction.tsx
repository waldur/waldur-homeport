import { CheckIcon } from '@phosphor-icons/react';
import { FC } from 'react';
import { projectEndDateChangeRequestsApprove } from 'waldur-js-client';

import { translate } from '@/i18n';
import { useManagedMutation } from '@/modal/useManagedMutation';
import { ActionItem } from '@/resource/actions/ActionItem';

interface ApproveRequestActionProps {
  row: { uuid: string };
  refetch(): void;
  onSuccess(): void;
}

export const ApproveRequestAction: FC<ApproveRequestActionProps> = ({
  row,
  refetch,
  onSuccess,
}) => {
  const { mutate, isPending } = useManagedMutation<
    any,
    any,
    { uuid: string; comment?: string }
  >({
    mutationFn: (variables) =>
      projectEndDateChangeRequestsApprove({
        path: { uuid: variables.uuid },
        body: variables.comment ? { comment: variables.comment } : {},
      }),
    successMessage: translate('Request has been approved.'),
    errorMessage: translate('Unable to approve request.'),
    refetch,
    onSuccess,
    confirmation: {
      title: translate('Confirmation'),
      body: translate('Are you sure you want to approve this request?'),
    },
  });

  return (
    <ActionItem
      action={() => mutate({ uuid: row.uuid })}
      disabled={isPending}
      title={translate('Approve')}
      iconNode={<CheckIcon weight="bold" />}
    />
  );
};
