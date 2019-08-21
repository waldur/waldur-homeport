import resourceTab from './resource-tab';
import resourceTabs from './resource-tabs';
import ResourceTabsConfiguration from './resource-tabs-configuration';
import { DEFAULT_RESOURCE_TABS, DEFAULT_SUBRESOURCE_TABS } from './constants';
import resourceEvents from './ResourceEvents';
import resourceIssues from './ResourceIssuesList';

export default module => {
  module.directive('resourceTab', resourceTab);
  module.component('resourceTabs', resourceTabs);
  module.provider('ResourceTabsConfiguration', ResourceTabsConfiguration);
  module.constant('DEFAULT_RESOURCE_TABS', DEFAULT_RESOURCE_TABS);
  module.constant('DEFAULT_SUBRESOURCE_TABS', DEFAULT_SUBRESOURCE_TABS);
  module.component('resourceEvents', resourceEvents);
  module.component('resourceIssues', resourceIssues);
};
