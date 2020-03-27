export default class ResourceBreadcrumbsService {
  // @ngInject
  constructor(ENV, CATEGORY_ITEMS, features) {
    this.ENV = ENV;
    this.CATEGORY_ITEMS = CATEGORY_ITEMS;
    this.features = features;
    this.breadcrumbs = {};
  }

  register(type, breadcrumbs) {
    this.breadcrumbs[type] = breadcrumbs;
  }

  getItems(resource) {
    const items = [
      {
        label: gettext('Project workspace'),
        state: 'project.details',
        params: {
          uuid: resource.project_uuid,
        },
      },
    ];

    const func = this.breadcrumbs[resource.resource_type];
    if (func) {
      return items.concat(func(resource));
    }

    return items.concat([
      {
        label: gettext('Resources'),
      },
      {
        params: {
          category_uuid: resource.marketplace_category_uuid,
          uuid: resource.project_uuid,
        },
        label: resource.marketplace_category_name,
        state: 'marketplace-project-resources',
      },
    ]);
  }
}
