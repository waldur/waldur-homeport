import { getTabs } from '@waldur/resource/tabs/registry';
import { TableTab } from '@waldur/table/types';

export const getRancherTabsAndTitle = (
  group: 'cluster' | 'apps' | 'service-discovery' | 'team',
): { title: string; tabs: TableTab[] } => {
  const tabs = getTabs('Rancher.Cluster');
  const tabsGroup = tabs.find((tab) => tab.key === group);
  return {
    title: tabsGroup.title,
    tabs: tabsGroup?.children.map((tab) => ({
      key: tab.key,
      title: tab.title,
      params: { tab: tab.key },
      component: tab.component,
    })),
  };
};
