import { Question } from '@phosphor-icons/react';
import { FunctionComponent } from 'react';
import { Tab, Tabs } from 'react-bootstrap';

import { Tip } from '@waldur/core/Tooltip';
import { ResourceUsageChart } from '@waldur/marketplace/resources/usage/ResourceUsageChart';
import { OfferingComponent } from '@waldur/marketplace/types';

import { ResourceUsageTable } from './ResourceUsageTable';
import { ComponentUsage } from './types';
import { getBillingTypeLabel } from './utils';

interface ResourceUsageTabsProps {
  components: OfferingComponent[];
  usages: ComponentUsage[];
  months?: number;
  colors: string[];
  displayMode?: 'chart' | 'table';
}

export const ResourceUsageTabs: FunctionComponent<ResourceUsageTabsProps> = (
  props,
) => (
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
                <Question />
              </Tip>{' '}
              {component.name}
            </>
          }
          key={index}
          eventKey={`tab-${index}`}
        >
          {props.displayMode === 'table' ? (
            <ResourceUsageTable
              offeringComponent={component}
              usages={props.usages}
            />
          ) : (
            <div style={{ display: 'flex', justifyContent: 'center' }}>
              <ResourceUsageChart
                offeringComponent={component}
                usages={props.usages}
                months={props.months}
                chartColor={props.colors[index]}
              />
            </div>
          )}
        </Tab>
      ))}
    </Tabs>
  </div>
);
