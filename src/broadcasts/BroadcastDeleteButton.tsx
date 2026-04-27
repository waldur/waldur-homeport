import { FunctionComponent } from 'react';
import { broadcastMessagesDestroy } from 'waldur-js-client';

import { DeleteButton } from '@/core/buttons';
import { formatJsxTemplate, translate } from '@/i18n';

export const BroadcastDeleteButton: FunctionComponent<{ row; refetch }> = ({
  row,
  refetch,
}) => (
  <DeleteButton
    row={row}
    apiFunction={(r) => broadcastMessagesDestroy({ path: { uuid: r.uuid } })}
    confirmTitle={translate('Delete broadcast')}
    confirmMessage={(r) =>
      translate(
        'Are you sure you would like to delete broadcast {broadcast}?',
        { broadcast: <strong>{r.subject}</strong> },
        formatJsxTemplate,
      )
    }
    successMessage={translate('Broadcast has been deleted.')}
    errorMessage={translate('Unable to delete broadcast.')}
    refetch={refetch}
  />
);
