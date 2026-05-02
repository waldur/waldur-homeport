import { adminArrowSettingsDestroy } from 'waldur-js-client';

import { translate } from '@/i18n';
import { useManagedMutation } from '@/modal/useManagedMutation';
import { RemovalActionButton } from '@/table/RemovalActionButton';

import { arrowQueryKeys } from '../api';

interface ArrowSettingsDeleteActionProps {
  settingsUuid: string;
}

export const ArrowSettingsDeleteAction = ({
  settingsUuid,
}: ArrowSettingsDeleteActionProps) => {
  const { mutate: handleDelete, isPending } = useManagedMutation<
    any,
    any,
    string
  >({
    mutationFn: (uuid) => adminArrowSettingsDestroy({ path: { uuid } }),
    invalidateQueries: [{ queryKey: arrowQueryKeys.all }],
    successMessage: translate('Arrow settings deleted'),
    errorMessage: translate('Failed to delete settings'),
    confirmation: {
      title: translate('Confirm deletion'),
      body: translate(
        'Are you sure you want to delete Arrow integration settings? This will remove all customer mappings and billing sync data.',
      ),
      options: { forDeletion: true },
    },
  });

  return (
    <RemovalActionButton
      action={() => handleDelete(settingsUuid)}
      title={translate('Delete')}
      pending={isPending}
    />
  );
};
