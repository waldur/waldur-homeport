import { PanelBody, Tab, Tabs } from 'react-bootstrap';

import { ResourceUsageChart } from '@waldur/marketplace/resources/usage/ResourceUsageChart';

interface ResourceUsageTabsProps {
  components;
  usages;
  colors: string[];
}

export const ResourceUsageTabs = (props: ResourceUsageTabsProps) => (
  <PanelBody>
    <div className="tabs-container">
      <Tabs
        defaultActiveKey="tab-0"
        id="resource-usage-component-tabs"
        unmountOnExit
        mountOnEnter
        animation
      >
        {props.components.map((component, index: number) => (
          <Tab title={component.name} key={index} eventKey={`tab-${index}`}>
            <PanelBody style={{ display: 'flex', justifyContent: 'center' }}>
              <ResourceUsageChart
                offeringComponent={component}
                usages={props.usages}
                chartColor={props.colors[index]}
              />
            </PanelBody>
          </Tab>
        ))}
      </Tabs>
    </div>
  </PanelBody>
);
