import { ArrowDownIcon } from '@phosphor-icons/react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useDispatch, useSelector } from 'react-redux';
import {
  marketplaceProviderResourcesSetDownscaled,
  Resource,
} from 'waldur-js-client';

import { translate } from '@/i18n';
import { ActionItem } from '@/resource/actions/ActionItem';
import { showErrorResponse, showSuccess } from '@/store/notify';
import { isStaff as isStaffSelector } from '@/workspace/selectors';

interface SetDownscaledActionProps {
  resource: Resource;
  refetch?(): void;
}

export const SetDownscaledAction = ({
  resource,
  refetch,
}: SetDownscaledActionProps) => {
  const dispatch = useDispatch();
  const isStaff = useSelector(isStaffSelector);
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: (downscaled: boolean) =>
      marketplaceProviderResourcesSetDownscaled({
        path: { uuid: resource.uuid },
        body: { downscaled },
      }),
    onSuccess: () => {
      dispatch(
        showSuccess(translate('Resource downscaled status has been updated.')),
      );
      refetch?.();
      queryClient.invalidateQueries({ queryKey: ['marketplace-resources'] });
    },
    onError: (error) => {
      dispatch(
        showErrorResponse(
          error as any,
          translate('Unable to update resource downscaled status.'),
        ),
      );
    },
  });

  const handleToggleDownscaled = () => {
    const newDownscaledState = !resource.downscaled;
    mutation.mutate(newDownscaledState);
  };

  const supportsDownscaling =
    (resource.offering_plugin_options as any)?.supports_downscaling === true;

  if (!isStaff || !supportsDownscaling) {
    return null;
  }

  return (
    <ActionItem
      title={
        resource.downscaled
          ? translate('Unmark as downscaled')
          : translate('Mark as downscaled')
      }
      action={handleToggleDownscaled}
      staff
      iconNode={<ArrowDownIcon weight="bold" />}
      disabled={mutation.isPending}
    />
  );
};
