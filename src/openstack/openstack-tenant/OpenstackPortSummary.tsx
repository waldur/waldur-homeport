import { FC } from 'react';
import type { OpenStackPort } from 'waldur-js-client';

import { PropertyItem } from 'waldur-ui';

import { translate } from '@/i18n';
import { propVal } from '@/property/propertyFields';
import { ResourceSummaryProps } from '@/resource/summary';

export const OpenstackPortSummary: FC<ResourceSummaryProps<OpenStackPort>> = ({
  resource: row,
}) => {
  return (
    <>
      <PropertyItem label={translate('Device ID')} value={row.device_id} />
      <PropertyItem
        label={translate('Device owner')}
        value={row.device_owner}
      />
      <PropertyItem
        label={translate('Backend ID')}
        value={row.backend_id}
        hasCopy
      />

      <PropertyItem
        label={translate('Allowed address pairs')}
        value={propVal.json(row.allowed_address_pairs, { compact: true })}
      />

      <PropertyItem
        label={translate('Port security enabled')}
        value={propVal.boolean(row.port_security_enabled)}
      />

      <PropertyItem
        label={translate('Security groups')}
        value={propVal.list(row.security_groups.map((group) => group.name))}
      />
    </>
  );
};
