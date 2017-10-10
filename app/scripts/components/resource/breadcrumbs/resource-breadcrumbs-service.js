export default class ResourceBreadcrumbsService {
  constructor(ENV, CATEGORY_ITEMS) {
    this.ENV = ENV;
    this.CATEGORY_ITEMS = CATEGORY_ITEMS;
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
          uuid: resource.project_uuid
        }
      }
    ];

    const func = this.breadcrumbs[resource.resource_type];
    if (func) {
      return items.concat(func(resource));
    }

    const category = this.ENV.resourceCategory[resource.resource_type];
    if (category) {
      return items.concat([
        {
          label: gettext('Resources'),
        },
        {
          params: {
            uuid: resource.project_uuid
          },
          ...this.CATEGORY_ITEMS[category],
        }
      ]);
    }

    return items;
  }
}
