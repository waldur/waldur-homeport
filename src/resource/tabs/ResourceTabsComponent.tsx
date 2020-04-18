import * as React from 'react';
import * as PanelBody from 'react-bootstrap/lib/PanelBody';
import * as Tab from 'react-bootstrap/lib/Tab';
import * as Tabs from 'react-bootstrap/lib/Tabs';

export const ResourceTabsComponent = ({ tabs, activeKey, resource }) => (
  <Tabs
    id="ResourceTabsComponent"
    defaultActiveKey={activeKey}
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
