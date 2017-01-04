import template from './resource-tabs.html';

const resourceTabs = {
  template,
  bindings: {
    resource: '<'
  },
  controller: class ResourceTabs {
    constructor(ResourceTabsConfiguration, DEFAULT_RESOURCE_TABS) {
      this.registry = ResourceTabsConfiguration;
      this.defaults = DEFAULT_RESOURCE_TABS;
    }

    $onInit() {
      const config = this.registry[this.resource.resource_type] || this.defaults;
      this.tabs = config.order.map(tab => config.options[tab]);
    }
  }
};

export default resourceTabs;
