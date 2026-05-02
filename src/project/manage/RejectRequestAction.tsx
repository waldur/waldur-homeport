import { XIcon } from '@phosphor-icons/react';
import { FC } from 'react';
import { projectEndDateChangeRequestsReject } from 'waldur-js-client';

import { translate } from '@/i18n';
import { useManagedMutation } from '@/modal/useManagedMutation';
import { ActionItem } from '@/resource/actions/ActionItem';

interface RejectRequestActionProps {
  row: { uuid: string };
  refetch(): void;
}

export const RejectRequestAction: FC<RejectRequestActionProps> = ({
  row,
  refetch,
}) => {
  const { mutate, isPending } = useManagedMutation<
    any,
    any,
    { uuid: string; comment?: string }
  >({
    mutationFn: (variables) =>
      projectEndDateChangeRequestsReject({
        path: { uuid: variables.uuid },
        body: variables.comment ? { comment: variables.comment } : {},
      }),
    successMessage: translate('Request has been rejected.'),
    errorMessage: translate('Unable to reject request.'),
    refetch,
    confirmation: {
      title: translate('Confirmation'),
      body: translate('Are you sure you want to reject this request?'),
    },
  });

  return (
    <ActionItem
      action={() => mutate({ uuid: row.uuid })}
      disabled={isPending}
      title={translate('Reject')}
      iconNode={<XIcon weight="bold" />}
    />
  );
};
