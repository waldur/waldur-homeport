import { Card } from 'react-bootstrap';

import { translate } from '@/i18n';
import { Field } from '@/resource/summary';

import { ResourceImageField } from './ResourceImageField';

export const InstanceMainComponent = ({ resourceScope }) => {
  if (!resourceScope) {
    return null;
  }
  return (
    <Card className="card-bordered">
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

        {resourceScope.server_group && (
          <Field
            label={translate('Server group')}
            value={`${resourceScope.server_group.name} (${resourceScope.server_group.policy})`}
          />
        )}

        <Field
          label={translate('Internal IPs')}
          value={resourceScope.internal_ips.join(', ')}
          hasCopy
        />

        <Field
          label={translate('Floating IPs')}
          value={resourceScope.floating_ips
            .map((item) => item.address)
            .join(', ')}
          hasCopy
        />

        <Field
          label={translate('External IPs')}
          value={resourceScope.external_address.join(', ')}
          hasCopy
        />
      </Card.Body>
    </Card>
  );
};
