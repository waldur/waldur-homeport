import { TrashIcon } from '@phosphor-icons/react';
import { FC } from 'react';
import { marketplaceOfferingProfilesDestroy } from 'waldur-js-client';

import { formatJsxTemplate, translate } from '@/i18n';
import { useManagedMutation } from '@/modal/useManagedMutation';
import { ActionItem } from '@/resource/actions/ActionItem';

export const DeleteProfileAction: FC<{ row; refetch(): void }> = ({
  row,
  refetch,
}) => {
  const deleteMutation = useManagedMutation<any, any, void>({
    mutationFn: () =>
      marketplaceOfferingProfilesDestroy({ path: { uuid: row.uuid } }),
    successMessage: translate('Profile deleted.'),
    errorMessage: translate('Unable to delete profile.'),
    refetch,
    confirmation: {
      title: translate('Confirmation'),
      body: translate(
        'Delete service profile {name}? This will unbind {count} offering(s) and revoke role grants for those offerings.',
        {
          name: <b>{row.name}</b>,
          count: <b>{row.offerings_count}</b>,
        },
        formatJsxTemplate,
      ),
      options: { forDeletion: true },
    },
  });

  return (
    <ActionItem
      title={translate('Delete')}
      action={() => deleteMutation.mutate()}
      iconNode={<TrashIcon weight="bold" />}
      className="text-danger"
      disabled={deleteMutation.isPending}
    />
  );
};
