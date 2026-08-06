import { CheckCircleIcon } from '@phosphor-icons/react';
import {
  RemoteProject,
  openportalRemoteProjectsApproveNow,
} from 'waldur-js-client';

import { translate } from '@/i18n';
import { useManagedMutation } from '@/modal/useManagedMutation';
import { ActionItem } from '@/resource/actions/ActionItem';

interface Props {
  row: RemoteProject;
  refetch: () => void;
}

export const ApproveNowButton = ({ row, refetch }: Props) => {
  const { mutate, isPending } = useManagedMutation<any, any, void>({
    mutationFn: () =>
      openportalRemoteProjectsApproveNow({
        path: { uuid: row.uuid },
      }),
    refetch,
    successMessage: translate('Remote project has been approved.'),
    errorMessage: translate('Unable to approve remote project now.'),
    confirmation: {
      title: translate('Approve now'),
      body: translate(
        'This skips the earliest-approve window and asks the remote portal to approve the project immediately. Continue?',
      ),
    },
  });

  return (
    <ActionItem
      title={translate('Approve now')}
      action={mutate}
      disabled={isPending}
      iconNode={<CheckCircleIcon weight="bold" />}
    />
  );
};
