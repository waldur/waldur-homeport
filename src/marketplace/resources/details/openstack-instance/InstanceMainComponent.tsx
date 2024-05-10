import { useContext, useEffect } from 'react';
import { Card } from 'react-bootstrap';

import { translate } from '@waldur/i18n';
import { PageBarContext } from '@waldur/marketplace/context';
import { Field } from '@waldur/resource/summary';

import { ResourceImageField } from './ResourceImageField';

export const InstanceMainComponent = ({ scope, activeTab }) => {
  const { addTabs } = useContext(PageBarContext);
  useEffect(() => {
    if (scope)
      addTabs([
        {
          key: 'vm-details',
          title: translate('Details'),
          priority: 10,
        },
      ]);
  });
  if (!scope) {
    return null;
  }
  return (
    <div className={activeTab === 'vm-details' ? undefined : 'd-none'}>
      <Card className="mb-7" id="vm-details">
        <Card.Header>
          <Card.Title>
            <h3>{translate('Details')}</h3>
          </Card.Title>
        </Card.Header>
        <Card.Body>
          <Field
            label={translate('Image')}
            value={<ResourceImageField scope={scope} />}
          />
          <Field
            label={translate('Flavor')}
            value={scope.flavor_name}
            hasCopy
          />
          <Field
            label={translate('Internal IPs')}
            value={scope.internal_ips.join(', ')}
            hasCopy
          />
          <Field
            label={translate('Floating IP')}
            value={scope.floating_ips.map((item) => item.address).join(', ')}
            hasCopy
          />
        </Card.Body>
      </Card>
    </div>
  );
};
