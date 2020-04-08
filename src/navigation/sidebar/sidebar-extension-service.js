import { flatten } from '@waldur/core/utils';

export default class SidebarExtensionService {
  // @ngInject
  constructor(features) {
    this.features = features;
    this._registry = {};
  }

  register(sidebar, callable) {
    if (!this._registry[sidebar]) {
      this._registry[sidebar] = [];
    }
    this._registry[sidebar].push(callable);
  }

  getItems(sidebar) {
    if (!this._registry[sidebar]) {
      return Promise.when([]);
    }
    const promise = this._registry[sidebar].map(callable => callable());
    return Promise.all(promise).then(flatten);
  }
}
