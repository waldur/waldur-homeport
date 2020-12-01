import React from 'react';
import { PanelBody, Tab, Tabs } from 'react-bootstrap';

import { ResourceTab } from './types';

export const ResourceTabsComponent = ({
  tabs,
  activeKey,
  resource,
  onSelect,
}: {
  tabs: ResourceTab[];
  activeKey?: string;
  resource: any;
  onSelect: React.EventHandler<any>;
}) => (
  <Tabs
    id="ResourceTabsComponent"
    activeKey={activeKey}
    onSelect={onSelect}
    mountOnEnter
    unmountOnExit
    animation={false}
  >
    {tabs.map((tab) => (
      <Tab key={tab.key} eventKey={tab.key} title={tab.title}>
        <PanelBody>
          <tab.component resource={resource} />
        </PanelBody>
      </Tab>
    ))}
  </Tabs>
);
