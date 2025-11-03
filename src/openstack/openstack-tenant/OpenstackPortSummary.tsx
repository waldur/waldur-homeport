import { FC } from 'react';

import FormTable from '@waldur/form/FormTable';
import { translate } from '@waldur/i18n';
import { Field, ResourceSummaryProps } from '@waldur/resource/summary';

export const OpenstackPortSummary: FC<ResourceSummaryProps> = ({
  resource: row,
  formTableItem,
}) => {
  const Component = formTableItem ? FormTable.Item : Field;
  return (
    <>
      <Component
        label={translate('Device ID')}
        value={row.device_id || 'N/A'}
      />
      <Component
        label={translate('Device owner')}
        value={row.device_owner || 'N/A'}
      />
      <Component
        label={translate('Backend ID')}
        value={row.backend_id || 'N/A'}
        hasCopy={!!row.backend_id}
      />

      <Component
        label={translate('Allowed address pairs')}
        value={
          row.allowed_address_pairs && row.allowed_address_pairs?.length > 0
            ? JSON.stringify(row.allowed_address_pairs)
            : 'N/A'
        }
      />

      <Component
        label={translate('Port security enabled')}
        value={row.port_security_enabled ? translate('Yes') : translate('No')}
      />

      <Component
        label={translate('Security groups')}
        value={
          row.security_groups.length > 0
            ? row.security_groups.map((group) => group.name).join(', ')
            : 'N/A'
        }
      />
    </>
  );
};
