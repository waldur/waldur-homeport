import { ArrowsClockwiseIcon } from '@phosphor-icons/react';
import { Project, projectsSyncUserRoles } from 'waldur-js-client';

import { translate } from '@/i18n';
import { useManagedMutation } from '@/modal/useManagedMutation';
import { ActionItem } from '@/resource/actions/ActionItem';
import { useUser } from '@/workspace/hooks';

interface SyncMembersButtonProps {
  project: Project;
  refetch: () => void;
}

export const SyncMembersButton = ({
  project,
  refetch,
}: SyncMembersButtonProps) => {
  const user = useUser();
  const isStaff = user?.is_staff;

  const { mutate, isPending } = useManagedMutation<any, any, void>({
    mutationFn: () =>
      projectsSyncUserRoles({
        path: { uuid: project.uuid },
      }),
    successMessage: translate(
      'Project members have been synchronized successfully.',
    ),
    errorMessage: translate('Unable to synchronize project members.'),
    refetch,
    confirmation: {
      title: translate('Synchronize members'),
      body: translate(
        'This action will send an event requesting to synchronize membership information to all Waldur site agents connected with resources in this project.',
      ),
      options: {
        positiveButton: translate('Synchronize'),
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
