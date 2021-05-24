import { FunctionComponent } from 'react';
import { PanelBody, Tab, Tabs } from 'react-bootstrap';

import { Tooltip } from '@waldur/core/Tooltip';
import { ResourceUsageChart } from '@waldur/marketplace/resources/usage/ResourceUsageChart';
import { OfferingComponent } from '@waldur/marketplace/types';

import { ComponentUsage } from './types';
import { getBillingTypeLabel } from './utils';

interface ResourceUsageTabsProps {
  components: OfferingComponent[];
  usages: ComponentUsage[];
  colors: string[];
}

export const ResourceUsageTabs: FunctionComponent<ResourceUsageTabsProps> = (
  props,
) => (
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
          <Tab
            title={
              <>
                <Tooltip
                  id={`tab-${index}-tooltip`}
                  label={getBillingTypeLabel(component.billing_type)}
                >
                  <i className="fa fa-question-circle" />
                </Tooltip>{' '}
                {component.name}
              </>
            }
            key={index}
            eventKey={`tab-${index}`}
          >
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
