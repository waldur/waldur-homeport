import * as React from 'react';

import { ngInjector } from '@waldur/core/services';

import { Resource } from '../types';

import { ResourceTabsComponent } from './ResourceTabsComponent';
import { ResourceTabsConfiguration } from './ResourceTabsConfiguration';

export const ResourceTabs = ({ resource }: { resource: Resource }) => {
  const [tabs, setTabs] = React.useState([]);
  const [activeKey, setActiveKey] = React.useState<string>();

  React.useEffect(() => {
    const selectedTabName = ngInjector.get('$stateParams').tab;
    const tabs = ResourceTabsConfiguration.get(resource);
    setTabs(tabs);
    if (selectedTabName) {
      const selectedTab =
        tabs.filter(tab => tab.key === selectedTabName)[0] || tabs[0];
      setActiveKey(selectedTab.key);
    }
  }, [resource]);

  return (
    <ResourceTabsComponent
      activeKey={activeKey}
      tabs={tabs}
      resource={resource}
    />
  );
};
