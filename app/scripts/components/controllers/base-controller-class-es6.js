export class BaseControllerClass {
  // @ngInject
  constructor($injector) {
    this.$injector = $injector;
    this.ncUtilsFlash = $injector.get('ncUtilsFlash');
  }
  handleActionException(response) {
    if (response.status === 409) {
      let message = response.data.detail || response.data.status;
      this.ncUtilsFlash.error(message);
    }
  }
}

export class BaseControllerAddClass extends BaseControllerClass {
  // @ngInject
  constructor($injector) {
    super($injector);
    this.$injector = $injector;
    this.$rootScope = $injector.get('$rootScope');
    this.$state = $injector.get('$state');
    this.currentStateService = $injector.get('currentStateService');
    this.ErrorMessageFormatter = $injector.get('ErrorMessageFormatter');
    this.listState = null; // required in init
    this.errors = {};
    this.detailsState = null;
    this.redirectToDetailsPage = false;
    this.successMessage = gettext('Saving of {vm_name} was successful.');
  }

  $onInit(service) {
    this.service = service;
    this.instance = this.service.$create();
  }

  save() {
    this.beforeSave();
    return this.saveInstance().then(
      (model) => {
        this.afterSave(model);
        this.ncUtilsFlash.success(this.getSuccessMessage());
        this.service.clearAllCacheForCurrentEndpoint();
        this.successRedirect(model);
        return true;
      },
      (response) => {
        angular.merge(this.errors, this.ErrorMessageFormatter.parseError(response));
        this.onError(response);
      });
  }

  cancel() {
    this.$state.go(this.listState);
  }

  beforeSave() {
  }

  saveInstance() {
    return this.instance.$save();
  }

  afterSave() {
    this.currentStateService.reloadCurrentCustomer(() => {
      this.$rootScope.$broadcast('checkQuotas:refresh');
      this.$rootScope.$broadcast('customerBalance:refresh');
    });
  }

  activate() {
  }

  successRedirect() {
    if (this.redirectToDetailsPage) {
      this.$state.go(this.detailsState, {uuid: this.instance.uuid});
    } else {
      this.$state.go(this.listState);
    }
  }

  getSuccessMessage() {
    return this.successMessage.replace('{vm_name}', this.instance.name);
  }

// eslint-disable-next-line no-unused-vars
  onError(errorObject) {
  }
}
