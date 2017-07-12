function flatten(lists) {
  return Array.prototype.concat.apply([], lists);
}

function groupBy(field, items) {
  return items.reduce(function(result, item) {
    const key = item[field];
    if (!result[key]) {
      result[key] = [];
    }
    result[key].push(item);
    return result;
  }, {});
}

function groupToList(groups) {
  return Object.keys(groups).map(label => ({ label, items: groups[label] }));
}

export default class AppstoreCategoriesService {
  // @ngInject
  constructor($q, ENV) {
    this.$q = $q;
    this._registry = [];
    this.ENV = ENV;
  }

  registerCategory(callable) {
    this._registry.push(callable);
  }

  getGroups() {
    const promise = this.$q.all(this._registry.map(callable => callable()));
    return promise.then(items => {
      const categories = flatten(items);
      const groupsDict = groupBy('category', categories);
      const groupsList = groupToList(groupsDict);
      groupsList.unshift({
        label: this.ENV.defaultGroup,
        items: this.ENV.defaultCategories,
      });
      return groupsList;
    });
  }
}
