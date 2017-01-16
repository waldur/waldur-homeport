const CATEGORY_ITEMS = {
  apps: {
    label: 'Applications',
    state: 'project.resources.apps',
  },
  private_clouds: {
    label: 'Private clouds',
    state: 'project.resources.clouds',
  },
  storages: {
    label: 'Storage',
    state: 'project.resources.storage.tabs',
  },
  vms: {
    label: 'Virtual machines',
    state: 'project.resources.vms',
  }
};

export const resourceBreadcrumbs = {
  template: '<breadcrumbs items="$ctrl.items" active-item="$ctrl.activeItem"/>',
  bindings: {
    resource: '<'
  },
  controller: class ResourceBreadcrumbsController {
    constructor(ENV, ResourceBreadcrumbsConfiguration) {
      this.resourceCategory = ENV.resourceCategory;
      this.ResourceBreadcrumbsConfiguration = ResourceBreadcrumbsConfiguration;
    }

    $onInit() {
      let items = [];
      let customFunc = this.ResourceBreadcrumbsConfiguration[this.resource.resource_type];
      if (customFunc) {
        items = customFunc(this.resource);
      } else {
        items = [this.getCategoryItem()];
      }
      this.items = [
        {
          label: 'Project dashboard',
          state: 'project.details',
          params: {
            uuid: this.resource.project_uuid
          }
        },
        ...items,
      ];

      this.activeItem = this.resource.name;
    }

    getCategoryItem() {
      const category = this.resourceCategory[this.resource.resource_type];
      return angular.extend({
        params: {
          uuid: this.resource.project_uuid
        },
      }, CATEGORY_ITEMS[category]);
    }
  }
};
