import { get } from '@waldur/core/api';
import { translate } from '@waldur/i18n';
import {
  getProviderOffering,
  getResource,
} from '@waldur/marketplace/common/api';
import { Tab } from '@waldur/navigation/Tab';
import { NestedResourceTabsConfiguration } from '@waldur/resource/tabs/NestedResourceTabsConfiguration';
import { ResourceEvents } from '@waldur/resource/tabs/ResourceEvents';
import { ResourceIssuesList } from '@waldur/resource/tabs/ResourceIssuesList';

export const fetchData = async (state, params) => {
  const resource = await getResource(params.resource_uuid);
  let scope;
  let tabSources = [];
  let tabs: Tab[] = [
    {
      title: translate('Dashboard'),
      to: state.name,
      params: {
        tab: '',
      },
    },
  ];
  if (resource.scope) {
    scope = await get(resource.scope).then((response) => response.data);
    const spec = NestedResourceTabsConfiguration.get(scope.resource_type);
    tabSources = spec.map((conf) => conf.children).flat();
    tabs = tabs.concat(
      spec
        .map((parentTab) => ({
          title: parentTab.title,
          children: parentTab.children
            .map((childTab) => ({
              title: childTab.title,
              to: state.name,
              params: {
                tab: childTab.key,
              },
            }))
            .sort((t1, t2) => t1.title.localeCompare(t2.title)),
        }))
        .sort((t1, t2) => t1.title.localeCompare(t2.title)),
    );
  }
  const offering = await getProviderOffering(resource.offering_uuid);
  const components = offering.components;

  tabSources = tabSources.concat([
    {
      key: 'events',
      title: translate('Events'),
      component: ResourceEvents,
    },
    {
      key: 'issues',
      title: translate('Issues'),
      component: ResourceIssuesList,
    },
  ]);

  const tabSpec = params.tab
    ? tabSources.find((child) => child.key === params.tab)
    : null;

  const parentTab = tabs.find((tab) =>
    tab.children?.find((child) => child.params['tab'] === params.tab),
  )?.title;
  const breadcrumbs = [];
  if (parentTab) {
    breadcrumbs.push(parentTab);
  }
  if (tabSpec) {
    breadcrumbs.push(tabSpec.title);
  }
  return { resource, scope, components, offering, tabSpec, tabs, breadcrumbs };
};
