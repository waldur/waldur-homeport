import React from 'react';
import { PanelBody, Tab, Tabs } from 'react-bootstrap';
import { useAsync } from 'react-use';

import { LoadingSpinner } from '@waldur/core/LoadingSpinner';
import { translate } from '@waldur/i18n';
import { OrderItemResponse } from '@waldur/marketplace/orders/types';
import { ResourceUsageChart } from '@waldur/marketplace/resources/usage/ResourceUsageChart';

import { getOfferingComponentsAndUsages } from './api';

interface ResourceUsageTabsContainerProps {
  resource: OrderItemResponse;
}

export const ResourceUsageTabsContainer = ({
  resource,
}: ResourceUsageTabsContainerProps) => {
  const { loading, error, value } = useAsync(() =>
    getOfferingComponentsAndUsages(resource),
  );
  return loading ? (
    <LoadingSpinner />
  ) : error ? (
    <>{translate('Unable to load data')}</>
  ) : value.components.length === 0 ? (
    <h3>
      {translate(
        'Marketplace offering does not have any usage-based components.',
      )}
    </h3>
  ) : (
    <PanelBody>
      <div className="tabs-container">
        <Tabs
          defaultActiveKey="tab-0"
          id="resource-usage-component-tabs"
          unmountOnExit
          mountOnEnter
          animation
        >
          {value.components.map((component, index: number) => (
            <Tab title={component.name} key={index} eventKey={`tab-${index}`}>
              <PanelBody style={{ display: 'flex', justifyContent: 'center' }}>
                <ResourceUsageChart
                  offeringComponent={component}
                  usages={value.usages}
                  colors={value.colors}
                  tabIndex={index}
                />
              </PanelBody>
            </Tab>
          ))}
        </Tabs>
      </div>
    </PanelBody>
  );
};
