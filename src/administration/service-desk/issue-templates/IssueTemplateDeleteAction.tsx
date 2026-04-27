import { supportTemplatesDestroy } from 'waldur-js-client';

import { DeleteButton } from '@/core/buttons';
import { translate } from '@/i18n';

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
