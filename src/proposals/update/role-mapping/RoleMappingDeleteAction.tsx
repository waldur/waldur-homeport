import { FunctionComponent } from 'react';
import { callProposalProjectRoleMappingsDestroy } from 'waldur-js-client';

import { DeleteButton } from '@/core/buttons';
import { translate } from '@/i18n';

export const RoleMappingDeleteAction: FunctionComponent<{ row; refetch }> = ({
  row,
  refetch,
}) => (
  <DeleteButton
    row={row}
    apiFunction={(r) =>
      callProposalProjectRoleMappingsDestroy({ path: { uuid: r.uuid } })
    }
    refetch={refetch}
    confirmTitle={translate('Delete mapping')}
    confirmMessage={translate(
      'Are you sure you would like to delete the mapping?',
    )}
    successMessage={translate('Mapping has been deleted.')}
    errorMessage={translate('Unable to delete mapping.')}
  />
);
