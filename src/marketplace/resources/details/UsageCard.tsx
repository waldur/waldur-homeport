import { useMemo } from 'react';
import { Card } from 'react-bootstrap';

import { translate } from '@waldur/i18n';

import { ResourceUsageTabsContainer } from '../usage/ResourceUsageTabsContainer';

export const UsageCard = ({ resource }) => {
  const resourceRef = useMemo(
    () => ({
      offering_uuid: resource.offering_uuid,
      resource_uuid: resource.uuid,
    }),
    [resource],
  );

  return resource.is_usage_based || resource.is_limit_based ? (
    <Card>
      <Card.Body>
        <h3 className="mb-5">{translate('Usage history')}</h3>
        <ResourceUsageTabsContainer resource={resourceRef} hideHeader={true} />
      </Card.Body>
    </Card>
  ) : null;
};
