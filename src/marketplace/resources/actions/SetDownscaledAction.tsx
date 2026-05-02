import { ArrowDownIcon } from '@phosphor-icons/react';
import { useSelector } from 'react-redux';
import {
  marketplaceProviderResourcesSetDownscaled,
  Resource,
} from 'waldur-js-client';

import { translate } from '@/i18n';
import { useManagedMutation } from '@/modal/useManagedMutation';
import { ActionItem } from '@/resource/actions/ActionItem';
import { isStaff as isStaffSelector } from '@/workspace/selectors';

interface SetDownscaledActionProps {
  resource: Resource;
  refetch?(): void;
}

export const SetDownscaledAction = ({
  resource,
  refetch,
}: SetDownscaledActionProps) => {
  const isStaff = useSelector(isStaffSelector);
  const { mutate, isPending: isLoading } = useManagedMutation<
    any,
    any,
    boolean
  >({
    mutationFn: (downscaled) =>
      marketplaceProviderResourcesSetDownscaled({
        path: { uuid: resource.uuid },
        body: { downscaled },
      }),
    invalidateQueries: [{ queryKey: ['marketplace-resources'] }],
    refetch,
    successMessage: translate('Resource downscaled status has been updated.'),
    errorMessage: translate('Unable to update resource downscaled status.'),
  });

  const handleToggleDownscaled = () => {
    const newDownscaledState = !resource.downscaled;
    mutate(newDownscaledState);
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
      disabled={isLoading}
    />
  );
};
