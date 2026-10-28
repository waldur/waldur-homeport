import { translate } from '@/i18n';
import { Field } from '@/resource/summary';

import { ResourceImageField } from './ResourceImageField';

export const InstanceMainComponent = ({ resourceScope }) => {
  if (!resourceScope) {
    return null;
  }
  return (
    <div className="card card-bordered">
      <div className="card-header">
        <div className="card-title">
          <h3>{translate('Details')}</h3>
        </div>
      </div>
      <div className="card-body">
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
          label={translate('Fixed IPs')}
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
      </div>
    </div>
  );
};
