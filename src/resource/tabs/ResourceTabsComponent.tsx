import { ErrorBoundary } from '@sentry/react';
import React from 'react';
import { PanelBody, Tab, Tabs } from 'react-bootstrap';

import { ErrorMessage } from '@waldur/ErrorMessage';

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
          <ErrorBoundary fallback={ErrorMessage}>
            <tab.component resource={resource} />
          </ErrorBoundary>
        </PanelBody>
      </Tab>
    ))}
  </Tabs>
);
