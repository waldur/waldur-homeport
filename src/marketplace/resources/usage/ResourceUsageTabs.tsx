import { FunctionComponent } from 'react';
import { Card, Tab, Tabs } from 'react-bootstrap';

import { Tip } from '@waldur/core/Tooltip';
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
  <Card.Body>
    <div className="tabs-container">
      <Tabs
        defaultActiveKey="tab-0"
        id="resource-usage-component-tabs"
        unmountOnExit
        mountOnEnter
      >
        {props.components.map((component, index: number) => (
          <Tab
            title={
              <>
                <Tip
                  id={`tab-${index}-tooltip`}
                  label={getBillingTypeLabel(component.billing_type)}
                >
                  <i className="fa fa-question-circle" />
                </Tip>{' '}
                {component.name}
              </>
            }
            key={index}
            eventKey={`tab-${index}`}
          >
            <Card.Body style={{ display: 'flex', justifyContent: 'center' }}>
              <ResourceUsageChart
                offeringComponent={component}
                usages={props.usages}
                chartColor={props.colors[index]}
              />
            </Card.Body>
          </Tab>
        ))}
      </Tabs>
    </div>
  </Card.Body>
);
