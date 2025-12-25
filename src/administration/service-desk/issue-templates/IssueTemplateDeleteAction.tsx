import { supportTemplatesDestroy } from 'waldur-js-client';

import { DeleteButton } from '@waldur/core/buttons';
import { translate } from '@waldur/i18n';

export const IssueTemplateDeleteAction = ({ row, refetch }) => (
  <DeleteButton
    row={row}
    apiFunction={(r) => supportTemplatesDestroy({ path: { uuid: r.uuid } })}
    refetch={refetch}
    confirmTitle={translate('Confirmation')}
    confirmMessage={translate(
      'Are you sure you want to delete the issue template?',
    )}
    title={translate('Remove')}
  />
);
