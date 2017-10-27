const providerIcon = {
  bindings: {
    type: '<',
    size: '@',
  },
  template: '<img ng-src="{{ $ctrl.getIcon() }}" ng-class="::$ctrl.size"/>',
  controller: class ComponentController {
    // @ngInject
    constructor(ncServiceUtils) {
      this.utils = ncServiceUtils;
    }
    getIcon() {
      if (this.type) {
        return this.utils.getServiceIcon(this.type);
      }
    }
  }
};

export default providerIcon;
