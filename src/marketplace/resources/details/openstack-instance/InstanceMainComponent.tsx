import { OpenStackInstance } from 'waldur-js-client';

import {
  PropertyItem,
  PropertyList,
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from 'waldur-ui';

import { translate } from '@/i18n';
import { propVal } from '@/property/propertyFields';

import { ResourceImageField } from './ResourceImageField';

export const InstanceMainComponent = ({
  resourceScope,
}: {
  resourceScope: OpenStackInstance;
}) => {
  if (!resourceScope) {
    return null;
  }
  return (
    <Card bordered>
      <CardHeader>
        <CardTitle as="div">
          <h3>{translate('Details')}</h3>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <PropertyList variant="summary">
          <PropertyItem
            label={translate('Image')}
            value={<ResourceImageField scope={resourceScope} />}
          />

          <PropertyItem
            label={translate('Flavor')}
            value={resourceScope.flavor_name}
            hasCopy
          />

          {resourceScope.server_group && (
            <PropertyItem
              label={translate('Server group')}
              value={`${resourceScope.server_group.name} (${resourceScope.server_group.policy})`}
            />
          )}

          <PropertyItem
            label={translate('Fixed IPs')}
            value={propVal.list(resourceScope.internal_ips)}
            hasCopy
          />

          <PropertyItem
            label={translate('Floating IPs')}
            value={propVal.list(
              resourceScope.floating_ips.map((item) => item.address),
            )}
            hasCopy
          />

          <PropertyItem
            label={translate('External IPs')}
            value={propVal.list(resourceScope.external_address)}
            hasCopy
          />
        </PropertyList>
      </CardContent>
    </Card>
  );
};
