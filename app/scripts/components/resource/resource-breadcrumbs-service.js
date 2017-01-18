export default class ResourceBreadcrumbsService {
  constructor(ENV, CATEGORY_ITEMS) {
    this.ENV = ENV;
    this.CATEGORY_ITEMS = CATEGORY_ITEMS;
    this.breadcrumbs = {};
  }

  register(type, breadcrumbs) {
    this.breadcrumbs[type] = breadcrumbs;
  }

  get(resource) {
    const func = this.breadcrumbs[resource.resource_type];
    if (func) {
      return func(resource);
    }
    const category = this.ENV.resourceCategory[resource.resource_type];
    if (!category) {
      return [];
    }
    return [angular.extend({
      params: {
        uuid: resource.project_uuid
      },
    }, this.CATEGORY_ITEMS[category])];
  }
}
