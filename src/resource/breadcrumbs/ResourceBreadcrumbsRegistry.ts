import { translate } from '@waldur/i18n';

class ResourceBreadcrumbsRegistryClass {
  private breadcrumbs = {};

  register(type, breadcrumbs) {
    this.breadcrumbs[type] = breadcrumbs;
  }

  getItems(resource) {
    const items = [
      {
        label: translate('Project workspace'),
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

    return [
      ...items,
      {
        label: translate('Resources'),
      },
      {
        params: {
          category_uuid: resource.marketplace_category_uuid,
          uuid: resource.project_uuid,
        },
        label: resource.marketplace_category_name,
        state: 'marketplace-project-resources',
      },
    ];
  }
}

export const ResourceBreadcrumbsRegistry = new ResourceBreadcrumbsRegistryClass();
