import { ResourceTab } from './types';

interface ParentTab {
  title: string;
  children: ResourceTab[];
}

class Store {
  private tabs: Record<string, () => ParentTab[]>;

  constructor() {
    this.tabs = {};
  }

  register(type: string, tabs: () => ParentTab[]) {
    this.tabs[type] = tabs;
  }

  get(resource_type) {
    const getter = this.tabs[resource_type];
    return getter ? getter() : [];
  }
}

export const NestedResourceTabsConfiguration = new Store();
