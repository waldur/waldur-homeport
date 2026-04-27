import { personalAccessTokensDestroy } from 'waldur-js-client';

import { DeleteButton } from '@/core/buttons';
import { translate } from '@/i18n';

export const PersonalAccessTokenRevokeButton = ({ row, refetch }) => (
  <DeleteButton
    row={row}
    apiFunction={(r) => personalAccessTokensDestroy({ path: { uuid: r.uuid } })}
    refetch={refetch}
    confirmTitle={translate('Revoke token')}
    confirmMessage={translate(
      'Are you sure you want to revoke this token? This action cannot be undone.',
    )}
    successMessage={translate('Token has been revoked.')}
    errorMessage={translate('Unable to revoke token.')}
    title={translate('Revoke')}
  />
);
