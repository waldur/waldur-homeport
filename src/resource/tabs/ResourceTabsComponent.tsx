import * as React from 'react';
import * as PanelBody from 'react-bootstrap/lib/PanelBody';
import * as Tab from 'react-bootstrap/lib/Tab';
import * as Tabs from 'react-bootstrap/lib/Tabs';

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
    {tabs.map(tab => (
      <Tab key={tab.key} eventKey={tab.key} title={tab.title}>
        <PanelBody>
          <tab.component resource={resource} />
        </PanelBody>
      </Tab>
    ))}
  </Tabs>
);
