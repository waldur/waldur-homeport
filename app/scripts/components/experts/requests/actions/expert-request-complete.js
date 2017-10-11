import template from './expert-request-complete.html';
import { STATE } from '../constants';

const expertRequestComplete = {
  template,
  bindings: {
    expertRequest: '<'
  },
  controller: class ExpertRequestCompleteController {
    // @ngInject
    constructor($rootScope, expertRequestsService, customersService, ncUtilsFlash) {
      this.$rootScope = $rootScope;
      this.expertRequestsService = expertRequestsService;
      this.customersService = customersService;
      this.ncUtilsFlash = ncUtilsFlash;
    }

    $onInit() {
      this.customersService.isOwnerOrStaff()
        .then(canManageRequest => this.canManageRequest = canManageRequest);
    }

    isVisible() {
      return this.canManageRequest &&
        this.expertRequest.state === STATE.ACTIVE &&
        !this.expertRequest.recurring_billing;
    }

    submit() {
      return this.expertRequestsService.complete(this.expertRequest).then(() => {
        this.ncUtilsFlash.success(gettext('Expert request has been completed.'));
        this.$rootScope.$broadcast('refreshExpertDetails');
      }).catch(response => {
        this.ncUtilsFlash.errorFromResponse(response, gettext('Unable to complete expert request.'));
      });
    }
  }
};

export default expertRequestComplete;
