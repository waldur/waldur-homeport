const breadcrumbsContainer = {
  template: '<breadcrumbs items="$ctrl.items" active-item="$ctrl.activeItem"/>',
  controller: class BreadcrumbsContainerController {
    constructor(BreadcrumbsService) {
      this.BreadcrumbsService = BreadcrumbsService;
    }

    $onInit() {
      this.unlisten = this.BreadcrumbsService.listen(() => {
        this.activeItem = this.BreadcrumbsService.activeItem;
        this.items = this.BreadcrumbsService.items;
      });
    }

    $onDestroy() {
      this.unlisten();
    }
  }
};

export default breadcrumbsContainer;
