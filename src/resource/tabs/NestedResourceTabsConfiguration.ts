import { ResourceParentTab } from './types';

class Store {
  private tabs: Record<string, () => ResourceParentTab[]>;

  constructor() {
    this.tabs = {};
  }

  register(type: string, tabs: () => ResourceParentTab[]) {
    this.tabs[type] = tabs;
  }

  get(resource_type) {
    const getter = this.tabs[resource_type];
    return getter ? getter() : [];
  }
}

export const NestedResourceTabsConfiguration = new Store();
