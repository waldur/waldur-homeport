import * as React from 'react';

import { ngInjector } from '@waldur/core/services';
import { isFeatureVisible } from '@waldur/features/connect';

import { Resource } from '../types';

import { getDefaultResourceTabs } from './constants';
import { ResourceTabsComponent } from './ResourceTabsComponent';

export const ResourceTabs = ({ resource }: { resource: Resource }) => {
  const [tabs, setTabs] = React.useState([]);
  const [activeKey, setActiveKey] = React.useState<string>();

  React.useEffect(() => {
    const registry = ngInjector.get('ResourceTabsConfiguration');
    const selectedTabName = ngInjector.get('$stateParams').tab;
    const config =
      registry[resource.resource_type]() || getDefaultResourceTabs();
    const tabs = config
      .filter(tab => isFeatureVisible(tab.feature))
      .filter(tab => !tab.isVisible || tab.isVisible(resource));

    setTabs(tabs);
    if (selectedTabName) {
      const selectedTab =
        tabs.filter(tab => tab.name === selectedTabName)[0] || tabs[0];
      setActiveKey(selectedTab.name);
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
