import { broadcastMessageTemplatesDestroy } from 'waldur-js-client';

import { DeleteButton } from '@/core/buttons';
import { formatJsxTemplate, translate } from '@/i18n';

export const BroadcastTemplateDeleteButton = ({ row, refetch }) => (
  <DeleteButton
    row={row}
    apiFunction={(r) =>
      broadcastMessageTemplatesDestroy({ path: { uuid: r.uuid } })
    }
    confirmMessage={(r) =>
      translate(
        'Are you sure you want to delete the template {template_name}?',
        { template_name: <strong>{r.name}</strong> },
        formatJsxTemplate,
      )
    }
    title={translate('Remove')}
    refetch={refetch}
  />
);
