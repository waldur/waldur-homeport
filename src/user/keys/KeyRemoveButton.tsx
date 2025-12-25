import { keysDestroy } from 'waldur-js-client';

import { DeleteButton } from '@waldur/core/buttons';
import { translate } from '@waldur/i18n';

export const KeyRemoveButton = ({ row, refetch }) => (
  <DeleteButton
    row={row}
    apiFunction={(r) => keysDestroy({ path: { uuid: r.uuid } })}
    refetch={refetch}
    confirmTitle={translate('Key removal')}
    confirmMessage={translate('Are you sure you would like to delete the key?')}
    successMessage={translate('SSH key has been removed.')}
    errorMessage={translate('Unable to remove SSH key.')}
    title={translate('Remove')}
  />
);
