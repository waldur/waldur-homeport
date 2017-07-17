import {flatten} from '../core/utils';

export default class SidebarExtensionService {
  // @ngInject
  constructor($q) {
    this.$q = $q;
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
      return this.$q.when([]);
    }
    const promise = this._registry[sidebar].map(callable => callable());
    return this.$q.all(promise).then(flatten);
  }

  mergeItems(items, customItems) {
    const map = items.reduce((map, item) => {
      if (item.key) {
        map[item.key] = item;
      }
      return map;
    }, {});
    customItems.forEach(item => {
      if (item.parent && map[item.parent]) {
        map[item.parent].children.push(item);
      } else {
        items.push(item);
      }
    });
    const compareIndex = (a, b) => a.index - b.index;
    items.sort(compareIndex);
    items.forEach(parent => {
      if (parent.children) {
        parent.children.sort(compareIndex);
      }
    });
    return items;
  }
}
