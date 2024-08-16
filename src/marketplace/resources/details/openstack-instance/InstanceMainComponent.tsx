import { Card } from 'react-bootstrap';

import { translate } from '@waldur/i18n';
import { Field } from '@waldur/resource/summary';

import { ResourceImageField } from './ResourceImageField';

export const InstanceMainComponent = ({ resourceScope }) => {
  if (!resourceScope) {
    return null;
  }
  return (
    <Card>
      <Card.Header>
        <Card.Title>
          <h3>{translate('Details')}</h3>
        </Card.Title>
      </Card.Header>
      <Card.Body>
        <Field
          label={translate('Image')}
          value={<ResourceImageField scope={resourceScope} />}
        />
        <Field
          label={translate('Flavor')}
          value={resourceScope.flavor_name}
          hasCopy
        />
        <Field
          label={translate('Internal IPs')}
          value={resourceScope.internal_ips.join(', ')}
          hasCopy
        />
        <Field
          label={translate('Floating IP')}
          value={resourceScope.floating_ips
            .map((item) => item.address)
            .join(', ')}
          hasCopy
        />
        <Field
          label={translate('External IP')}
          value={resourceScope.offering_external_ips
            .map((item) => item)
            .join(', ')}
          hasCopy
        />
      </Card.Body>
    </Card>
  );
};
