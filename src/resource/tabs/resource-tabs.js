import template from './resource-tabs.html';

const resourceTabs = {
  template,
  bindings: {
    resource: '<'
  },
  controller: class ResourceTabs {
    // @ngInject
    constructor(ResourceTabsConfiguration, DEFAULT_RESOURCE_TABS, $stateParams, features) {
      this.registry = ResourceTabsConfiguration;
      this.defaults = DEFAULT_RESOURCE_TABS;
      this.selectedTabName = $stateParams.tab;
      this.features = features;
    }

    $onInit() {
      const config = this.registry[this.resource.resource_type] || this.defaults;
      this.tabs = config.order.map(tab => angular.extend({name: tab}, config.options[tab])).filter(
        tab => this.features.isVisible(tab.feature),
      ).filter(tab => !tab.isVisible || tab.isVisible(this.resource));
      if (this.tabs.length === 0) {
        return;
      }
      let selectedTab = this.tabs.filter(tab => tab.name === this.selectedTabName)[0] || this.tabs[0];
      this.active = selectedTab.name;
    }
  }
};

export default resourceTabs;
