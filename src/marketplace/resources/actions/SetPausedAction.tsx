import { PauseIcon } from '@phosphor-icons/react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useDispatch, useSelector } from 'react-redux';
import {
  marketplaceProviderResourcesSetPaused,
  Resource,
} from 'waldur-js-client';

import { translate } from '@/i18n';
import { ActionItem } from '@/resource/actions/ActionItem';
import { showErrorResponse, showSuccess } from '@/store/notify';
import { isStaff as isStaffSelector } from '@/workspace/selectors';

interface SetPausedActionProps {
  resource: Resource;
  refetch?(): void;
}

export const SetPausedAction = ({
  resource,
  refetch,
}: SetPausedActionProps) => {
  const dispatch = useDispatch();
  const isStaff = useSelector(isStaffSelector);
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: (paused: boolean) =>
      marketplaceProviderResourcesSetPaused({
        path: { uuid: resource.uuid },
        body: { paused },
      }),
    onSuccess: () => {
      dispatch(
        showSuccess(translate('Resource paused status has been updated.')),
      );
      refetch?.();
      queryClient.invalidateQueries({ queryKey: ['marketplace-resources'] });
    },
    onError: (error) => {
      dispatch(
        showErrorResponse(
          error as any,
          translate('Unable to update resource paused status.'),
        ),
      );
    },
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
