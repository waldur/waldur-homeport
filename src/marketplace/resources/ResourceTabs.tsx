import { FC } from 'react';
import { PanelBody, Tab, Tabs } from 'react-bootstrap';

import { Calendar } from '@waldur/booking/components/calendar/Calendar';
import { isFeatureVisible } from '@waldur/features/connect';
import { translate } from '@waldur/i18n';
import { IssuesList } from '@waldur/issues/list/IssuesList';
import { ResourceUsageTabsContainer } from '@waldur/marketplace/resources/usage/ResourceUsageTabsContainer';

import { ResourceOrderItems } from '../orders/item/list/ResourceOrderItems';

import { Resource } from './types';

export const ResourceTabs: FC<{ resource: Resource }> = ({ resource }) => (
  <Tabs
    defaultActiveKey="orderItems"
    id="resource-details"
    mountOnEnter
    unmountOnExit
  >
    <Tab eventKey="orderItems" title={translate('Order items')}>
      <PanelBody>
        <ResourceOrderItems resource_uuid={resource.uuid} />
      </PanelBody>
    </Tab>
    {isFeatureVisible('support') && resource.scope && (
      <Tab eventKey="issues" title={translate('Issues')}>
        <PanelBody>
          <IssuesList filter={{ resource: resource.scope }} />
        </PanelBody>
      </Tab>
    )}
    {resource.attributes.schedules && (
      <Tab eventKey="schedules" title={translate('Schedules')}>
        <PanelBody>
          <Calendar events={resource.attributes.schedules} />
        </PanelBody>
      </Tab>
    )}
    {resource.is_usage_based && (
      <Tab eventKey="usage" title={translate('Usage')}>
        <ResourceUsageTabsContainer
          offeringUuid={resource.offering_uuid}
          resourceUuid={resource.uuid}
        />
      </Tab>
    )}
  </Tabs>
);
