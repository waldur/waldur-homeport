import { FunctionComponent } from 'react';
import { Resource, OfferingComponent } from 'waldur-js-client';

import { Tabs, TabsList, TabsTrigger, TabsContent } from 'waldur-ui';

import { ResourceUsageChart } from '@/marketplace/resources/usage/ResourceUsageChart';

import { ResourceUsageTable } from './ResourceUsageTable';
import { ComponentUserUsage } from './types';
import { getBillingTypeLabelOrDash } from './utils';

interface ResourceUsageTabsProps {
  resource?: Pick<Resource, 'name' | 'uuid'>;
  components: OfferingComponent[];
  usages: any[];
  userUsages?: Pick<
    ComponentUserUsage,
    'username' | 'component_type' | 'billing_period'
  >[];
  months?: number;
  colors: string[];
  displayMode?: 'chart' | 'table';
  hasExport?: boolean;
}

export const ResourceUsageTabs: FunctionComponent<ResourceUsageTabsProps> = (
  props,
) => (
  <Tabs mount="active" defaultValue={props.components[0]?.type}>
    <TabsList className="icon-align">
      {props.components.map((component) => (
        <TabsTrigger
          key={component.type}
          value={component.type}
          hint={getBillingTypeLabelOrDash(component.billing_type)}
        >
          {component.name}
        </TabsTrigger>
      ))}
    </TabsList>
    <div className="tab-content">
      {props.components.map((component, index: number) => (
        <TabsContent key={component.type} value={component.type}>
          {props.displayMode === 'table' ? (
            <ResourceUsageTable
              offeringComponent={component}
              resource={props.resource}
            />
          ) : (
            <div style={{ display: 'flex', justifyContent: 'center' }}>
              <ResourceUsageChart
                resource={props.resource}
                offeringComponent={component}
                usages={props.usages}
                userUsages={props.userUsages}
                months={props.months}
                chartColor={props.colors[index]}
                hasExport={props.hasExport}
              />
            </div>
          )}
        </TabsContent>
      ))}
    </div>
  </Tabs>
);
