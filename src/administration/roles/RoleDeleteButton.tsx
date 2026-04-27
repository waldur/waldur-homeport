import { rolesDestroy } from 'waldur-js-client';

import { DeleteButton } from '@/core/buttons';
import { ENV } from '@/core/config';
import { formatJsxTemplate, translate } from '@/i18n';

import { getRoles } from './utils';

export const RoleDeleteButton = ({ row, refetch }) => (
  <DeleteButton
    row={row}
    apiFunction={(r) => rolesDestroy({ path: { uuid: r.uuid } })}
    refetch={refetch}
    onSuccess={async () => {
      ENV.roles = await getRoles();
    }}
    confirmTitle={translate('Confirmation')}
    confirmMessage={(r) =>
      translate(
        'Are you sure you want to delete the role {name}?',
        { name: <strong>{r.name}</strong> },
        formatJsxTemplate,
      )
    }
    title={translate('Remove')}
    disabled={row.users_count > 0}
    tooltip={translate('Users should be revoked before role is removed.')}
  />
);
