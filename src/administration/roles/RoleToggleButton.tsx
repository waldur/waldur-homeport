import { CheckSquareIcon, XSquareIcon } from '@phosphor-icons/react';
import { FunctionComponent } from 'react';
import { rolesDisable, rolesEnable } from 'waldur-js-client';

import { translate } from '@/i18n';
import { useManagedMutation } from '@/modal/useManagedMutation';
import { ActionItem } from '@/resource/actions/ActionItem';

export const RoleToggleButton: FunctionComponent<{
  row;
  refetch;
}> = ({ row, refetch }) => {
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
