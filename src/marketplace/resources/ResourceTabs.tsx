import * as React from 'react';
import * as PanelBody from 'react-bootstrap/lib/PanelBody';
import * as Tab from 'react-bootstrap/lib/Tab';
import * as Tabs from 'react-bootstrap/lib/Tabs';

import { Calendar } from '@waldur/booking/components/calendar/Calendar';
import { isFeatureVisible } from '@waldur/features/connect';
import { translate } from '@waldur/i18n';
import { IssuesList } from '@waldur/issues/list/IssuesList';

import { ResourceOrderItems } from '../orders/item/list/ResourceOrderItems';

export const ResourceTabs = ({ resource }) => (
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
    {isFeatureVisible('support') && (
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
  </Tabs>
);
