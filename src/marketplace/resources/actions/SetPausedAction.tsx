import { PauseIcon } from '@phosphor-icons/react';
import {
  marketplaceProviderResourcesSetPaused,
  Resource,
} from 'waldur-js-client';

import { translate } from '@/i18n';
import { useManagedMutation } from '@/modal/useManagedMutation';
import { ActionItem } from '@/resource/actions/ActionItem';
import { useUser } from '@/workspace/hooks';

interface SetPausedActionProps {
  resource: Resource;
  refetch?(): void;
}

export const SetPausedAction = ({
  resource,
  refetch,
}: SetPausedActionProps) => {
  const user = useUser();
  const isStaff = user?.is_staff;
  const mutation = useManagedMutation<any, any, boolean>({
    mutationFn: (paused) =>
      marketplaceProviderResourcesSetPaused({
        path: { uuid: resource.uuid },
        body: { paused },
      }),
    successMessage: translate('Resource paused status has been updated.'),
    errorMessage: translate('Unable to update resource paused status.'),
    refetch,
    invalidateQueries: [{ queryKey: ['marketplace-resources'] }],
  });

  const handleTogglePaused = () => {
    const newPausedState = !resource.paused;
    mutation.mutate(newPausedState);
  };

  const supportsPausing =
    (resource.offering_plugin_options as any)?.supports_pausing === true;

  if (!isStaff || !supportsPausing) {
    return null;
  }

  return (
    <ActionItem
      title={
        resource.paused
          ? translate('Unpause resource')
          : translate('Pause resource')
      }
      action={handleTogglePaused}
      staff
      iconNode={<PauseIcon weight="bold" />}
      disabled={mutation.isPending}
    />
  );
};
