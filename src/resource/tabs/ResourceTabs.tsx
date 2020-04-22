import { useCurrentStateAndParams, useRouter } from '@uirouter/react';
import * as React from 'react';

import { Resource } from '../types';

import { ResourceTabsComponent } from './ResourceTabsComponent';
import { ResourceTabsConfiguration } from './ResourceTabsConfiguration';

export const ResourceTabs = ({ resource }: { resource: Resource }) => {
  const {
    params: { tab: selectedTabName },
  } = useCurrentStateAndParams();

  const router = useRouter();

  // eslint-disable-next-line react-hooks/exhaustive-deps
  const tabs = React.useMemo(() => ResourceTabsConfiguration.get(resource), []);

  const [activeKey, setActiveKey] = React.useState<string>();

  React.useEffect(() => {
    if (selectedTabName) {
      const selectedTab =
        tabs.filter(tab => tab.key === selectedTabName)[0] || tabs[0];
      if (selectedTab) {
        setActiveKey(selectedTab.key);
      }
    }
  }, [tabs, selectedTabName]);

  const onSelect = eventKey => {
    router.stateService.go('resources.details', { params: { tab: eventKey } });
    setActiveKey(eventKey);
  };

  return (
    <ResourceTabsComponent
      activeKey={activeKey}
      onSelect={onSelect}
      tabs={tabs}
      resource={resource}
    />
  );
};
