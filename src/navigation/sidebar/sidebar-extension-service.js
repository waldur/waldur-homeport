import {flatten} from '../../core/utils';

export default class SidebarExtensionService {
  // @ngInject
  constructor($q, features) {
    this.$q = $q;
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
    this.sortItems(items);
    return this.filterItems(items);
  }

  sortItems(items) {
    const compareIndex = (a, b) => a.index - b.index;
    const compareLabel = (a, b) => a.label.localeCompare(b.label);
    items.sort(compareIndex);
    items.forEach(parent => {
      if (parent.children) {
        if (parent.orderByLabel) {
          parent.children.sort(compareLabel);
        } else {
          parent.children.sort(compareIndex);
        }
      }
    });
  }

  filterItems(items) {
    const predicate = item => this.features.isVisible(item.feature);
    return items.filter(predicate).map(item => {
      if (!item.children) {
        return item;
      }
      return {
        ...item,
        children: item.children.filter(predicate),
      };
    });
  }

  getCounters(items) {
    let counters = [];
    const visitItem = item => {
      if (item.hasOwnProperty('countFieldKey') && this.features.isVisible(item.feature)) {
        counters.push(item.countFieldKey);
      }
    };
    items.forEach(item => {
      visitItem(item);
      if (item.children) {
        item.children.forEach(visitItem);
      }
    });
    return counters;
  }
}
