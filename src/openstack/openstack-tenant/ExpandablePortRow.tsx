import { Container } from 'react-bootstrap';

import { translate } from '@waldur/i18n';
import { Field } from '@waldur/resource/summary';

export const ExpandablePortRow = ({ row }) => (
  <Container>
    <Field label={translate('Device ID')} value={row.device_id || 'N/A'} />
    <Field
      label={translate('Device owner')}
      value={row.device_owner || 'N/A'}
    />
    <Field
      label={translate('Allowed address pairs')}
      value={
        row.allowed_address_pairs && row.allowed_address_pairs?.length > 0
          ? JSON.stringify(row.allowed_address_pairs)
          : 'N/A'
      }
    />
    <Field
      label={translate('Port security enabled')}
      value={row.port_security_enabled ? translate('Yes') : translate('No')}
    />
    <Field
      label={translate('Security groups')}
      value={
        row.security_groups.length > 0
          ? row.security_groups.map((group) => group.name).join(', ')
          : 'N/A'
      }
    />
  </Container>
);
