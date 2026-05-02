import { ArrowsClockwiseIcon } from '@phosphor-icons/react';
import { useSelector } from 'react-redux';
import { Project, projectsSyncUserRoles } from 'waldur-js-client';

import { translate } from '@/i18n';
import { useManagedMutation } from '@/modal/useManagedMutation';
import { ActionItem } from '@/resource/actions/ActionItem';
import { isStaff as isStaffSelector } from '@/workspace/selectors';

interface SyncMembersButtonProps {
  project: Project;
  refetch: () => void;
}

export const SyncMembersButton = ({
  project,
  refetch,
}: SyncMembersButtonProps) => {
  const isStaff = useSelector(isStaffSelector);

  const { mutate, isPending } = useManagedMutation<any, any, void>({
    mutationFn: () =>
      projectsSyncUserRoles({
        path: { uuid: project.uuid },
      }),
    successMessage: translate(
      'Project members have been synchronised successfully.',
    ),
    errorMessage: translate('Unable to synchronise project members.'),
    refetch,
    confirmation: {
      title: translate('Synchronise members'),
      body: translate(
        'This action will send an event requesting to synchronise membership information to all Waldur site agents connected with resources in this project.',
      ),
      options: {
        positiveButton: translate('Synchronise'),
        positiveButtonVariant: 'primary',
      },
    },
  });
  if (!isStaff || project.is_removed) {
    return null;
  }
  return (
    <ActionItem
      title={translate('Sync members')}
      action={mutate}
      disabled={isPending}
      iconNode={<ArrowsClockwiseIcon weight="bold" />}
    />
  );
};
