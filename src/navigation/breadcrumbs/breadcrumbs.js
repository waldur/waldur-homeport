import template from './breadcrumbs.html';

const breadcrumbs = {
  template,
  bindings: {
    items: '<',
    activeItem: '<'
  },
  controller: class BreadcrumbsController {
    // @ngInject
    constructor($state) {
      this.$state = $state;
    }

    onClick(item) {
      if (item.action) {
        item.action();
      }
      else if (item.state) {
        this.$state.go(item.state, item.params);
      }
    }
  }
};

export default breadcrumbs;
