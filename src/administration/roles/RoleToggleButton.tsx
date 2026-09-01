import { CheckSquareIcon, XSquareIcon } from '@phosphor-icons/react';
import { FunctionComponent, useMemo } from 'react';
import { rolesDisable, rolesEnable } from 'waldur-js-client';

import { formatJsxTemplate, translate } from '@/i18n';
import { useManagedMutation } from '@/modal/useManagedMutation';
import { ActionItem } from '@/resource/actions/ActionItem';

export const RoleToggleButton: FunctionComponent<{
  row;
  refetch;
}> = ({ row, refetch }) => {
  // Disabling keeps every existing grant but stops the role from being handed
  // out again, which is not what "disable" suggests on its own — so it is
  // confirmed, and the confirmation says how many users keep it. Enabling takes
  // nothing away and stays a single click.
  const confirmation = useMemo(
    () =>
      row.is_active
        ? {
            title: translate('Confirmation'),
            body: row.users_count
              ? translate(
                  'Disable {name}? {count} users keep the role, but it can no longer be granted to anyone new.',
                  {
                    name: <strong>{row.description || row.name}</strong>,
                    count: row.users_count,
                  },
                  formatJsxTemplate,
                )
              : translate(
                  'Disable {name}? It can no longer be granted to anyone.',
                  { name: <strong>{row.description || row.name}</strong> },
                  formatJsxTemplate,
                ),
            options: {
              positiveButton: translate('Confirm'),
              negativeButton: translate('Cancel'),
            },
          }
        : undefined,
    [row.is_active, row.users_count, row.description, row.name],
  );

  const { mutate, isPending } = useManagedMutation<any, any, void>({
    mutationFn: () =>
      row.is_active
        ? rolesDisable({ path: { uuid: row.uuid } })
        : rolesEnable({ path: { uuid: row.uuid } }),
    successMessage: row.is_active
      ? translate('The role has been disabled')
      : translate('The role has been enabled'),
    errorMessage: row.is_active
      ? translate('Error disabling the role.')
      : translate('Error enabling the role.'),
    confirmation,
    refetch,
  });
  return (
    <ActionItem
      action={mutate}
      disabled={isPending}
      title={row.is_active ? translate('Disable') : translate('Enable')}
      iconNode={
        row.is_active ? (
          <XSquareIcon weight="bold" />
        ) : (
          <CheckSquareIcon weight="bold" />
        )
      }
    />
  );
};
