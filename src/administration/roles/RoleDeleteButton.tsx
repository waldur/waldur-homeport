import { rolesDestroy } from 'waldur-js-client';

import { ENV } from '@/core/config';
import { formatJsxTemplate, translate } from '@/i18n';
import { useManagedMutation } from '@/modal/useManagedMutation';
import { RemovalActionItem } from '@/resource/actions/RemovalActionItem';

import { getRoles } from './utils';

export const RoleDeleteButton = ({ row, refetch }) => {
  const { mutate: mutate, isPending: isPending } = useManagedMutation<
    any,
    any,
    void
  >({
    mutationFn: () => rolesDestroy({ path: { uuid: row.uuid } }),
    refetch: refetch,

    onSuccess: async () => {
      ENV.roles = await getRoles();
    },

    confirmation: {
      title: translate('Confirmation'),

      body: translate(
        'Are you sure you want to delete the role {name}?',
        { name: <strong>{row.name}</strong> },
        formatJsxTemplate,
      ),

      options: {
        forDeletion: true,
      },
    },
  });

  return (
    <RemovalActionItem
      title={translate('Remove')}
      action={mutate}
      disabled={isPending}
      tooltip={translate('Users should be revoked before role is removed.')}
    />
  );
};
