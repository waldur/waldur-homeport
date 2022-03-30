import { FC, useMemo } from 'react';
import { Card } from 'react-bootstrap';

import { Calendar } from '@waldur/booking/components/calendar/Calendar';
import { ENV } from '@waldur/configs/default';
import { translate } from '@waldur/i18n';
import { ResourceUsageTabsContainer } from '@waldur/marketplace/resources/usage/ResourceUsageTabsContainer';
import { VerticalTabs } from '@waldur/resource/tabs/VerticalTabs';

import { ResourceOrderItems } from '../orders/item/list/ResourceOrderItems';

import { ResourceIssuesTab } from './ResourceIssuesTab';
import { Resource } from './types';

export const ResourceTabs: FC<{ resource: Resource }> = ({ resource }) => {
  const tabs = useMemo(
    () => [
      {
        key: 'orderItems',
        title: translate('Order items'),
        visible: true,
        component: () => (
          <Card.Body>
            <ResourceOrderItems resource_uuid={resource.uuid} />
          </Card.Body>
        ),
      },
      {
        key: 'issues',
        title: translate('Issues'),
        visible: ENV.plugins.WALDUR_SUPPORT && resource.scope,
        component: () => <ResourceIssuesTab resource={resource} />,
      },
      {
        key: 'schedules',
        title: translate('Schedules'),
        visible: resource.attributes.schedules,
        component: () => (
          <Card.Body>
            <Calendar events={resource.attributes.schedules} />
          </Card.Body>
        ),
      },
      {
        key: 'usage',
        title: translate('Usage'),
        visible: resource.is_usage_based || resource.is_limit_based,
        component: () => (
          <ResourceUsageTabsContainer
            resource={{
              ...resource,
              offering_uuid:
                resource.offering_uuid || resource.marketplace_offering_uuid,
              resource_uuid:
                resource.uuid || resource.marketplace_resource_uuid,
            }}
          />
        ),
      },
    ],
    [],
  );

  return (
    <VerticalTabs
      containerId="resource-details"
      items={tabs}
      defaultActiveKey="orderItems"
    />
  );
};
