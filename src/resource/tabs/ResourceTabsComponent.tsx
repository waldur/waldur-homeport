import React from 'react';

import { ResourceTab } from './types';
import { VerticalTabs } from './VerticalTabs';

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
  <VerticalTabs
    containerId="ResourceTabsComponent"
    items={tabs.map((tab) => ({
      ...tab,
      component: () => <tab.component resource={resource} />,
    }))}
    activeKey={activeKey}
    defaultActiveKey={tabs[0].key}
    onSelect={onSelect}
  />
);
