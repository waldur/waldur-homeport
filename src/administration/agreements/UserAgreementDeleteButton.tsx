import { FC } from 'react';
import { userAgreementsDestroy } from 'waldur-js-client';

import { DeleteButton } from '@waldur/core/buttons';
import { translate } from '@waldur/i18n';

export const UserAgreementDeleteButton: FC<{ row; refetch }> = ({
  row,
  refetch,
}) => (
  <DeleteButton
    row={row}
    apiFunction={(r) => userAgreementsDestroy({ path: { uuid: r.uuid } })}
    refetch={refetch}
    confirmTitle={translate('Delete user agreement')}
    confirmMessage={translate(
      'Are you sure you would like to delete the user agreement?',
    )}
    successMessage={translate('User agreement has been deleted.')}
    errorMessage={translate('Unable to delete the user agreement.')}
  />
);
