export default class ResourceBreadcrumbsConfiguration {
  constructor() {
    this.breadcrumbs = {};
  }

  register(type, breadcrumbs) {
    this.breadcrumbs[type] = breadcrumbs;
  }

  $get() {
    return this.breadcrumbs;
  }
}
