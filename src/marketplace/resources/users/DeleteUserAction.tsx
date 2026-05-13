import { FC } from 'react';
import {
  marketplaceResourceProjectsDeleteUser,
  marketplaceResourcesDeleteUser,
} from 'waldur-js-client';

import { translate, formatJsxTemplate } from '@/i18n';
import { useManagedMutation } from '@/modal/useManagedMutation';
import { RemovalActionItem } from '@/resource/actions/RemovalActionItem';

export const DeleteUserAction: FC<{ row; refetch(): void }> = ({
  row,
  refetch,
}) => {
  const deleteMutation = useManagedMutation<any, any, void>({
    mutationFn: () => {
      const apiFn =
        row.scope_type === 'resource_project'
          ? marketplaceResourceProjectsDeleteUser
          : marketplaceResourcesDeleteUser;
      return apiFn({
        path: { uuid: row.scope_uuid },
        body: { user: row.user_uuid, role: row.role_name } as any,
      });
    },
    successMessage: translate('User has been removed.'),
    errorMessage: translate('Unable to remove user.'),
    refetch,
    confirmation: {
      title: translate('Confirmation'),
      body: translate(
        'Are you sure you want to remove {name} from this scope?',
        {
          name: <b>{row.user_full_name || row.user_username}</b>,
        },
        formatJsxTemplate,
      ),
      options: { forDeletion: true },
    },
  });

  return (
    <RemovalActionItem
      title={translate('Remove')}
      action={() => deleteMutation.mutate()}
      disabled={deleteMutation.isPending}
    />
  );
};
