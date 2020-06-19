import { flatten } from '@waldur/core/utils';

class SidebarExtensionRegistry {
  private registry = {};

  register(sidebar, callable) {
    if (!this.registry[sidebar]) {
      this.registry[sidebar] = [];
    }
    this.registry[sidebar].push(callable);
  }

  getItems(sidebar) {
    if (!this.registry[sidebar]) {
      return Promise.resolve([]);
    }
    const promise = this.registry[sidebar].map((callable) => callable());
    return Promise.all(promise).then(flatten);
  }
}

export const SidebarExtensionService = new SidebarExtensionRegistry();
