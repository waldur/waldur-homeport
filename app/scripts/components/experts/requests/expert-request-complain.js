import template from './expert-request-complain.html';
import { STATE } from './constants';

const expertRequestComplain = {
  template,
  bindings: {
    expertRequest: '<'
  },
  controller: class ExpertRequestComplainController {
    // @ngInject
    constructor($rootScope,
                $uibModal,
                $filter,
                expertRequestsService,
                customersService,
                ncUtilsFlash,
                ISSUE_IDS) {
      this.$rootScope = $rootScope;
      this.$uibModal = $uibModal;
      this.$filter = $filter;
      this.expertRequestsService = expertRequestsService;
      this.customersService = customersService;
      this.ncUtilsFlash = ncUtilsFlash;
      this.ISSUE_IDS = ISSUE_IDS;
    }

    $onInit() {
      this.customersService.isOwnerOrStaff()
        .then(canManageRequest => this.canManageRequest = canManageRequest);
    }

    isVisible() {
      return this.canManageRequest &&
        (this.expertRequest.state === STATE.COMPLETED || this.expertRequest.state === STATE.ACTIVE) &&
        !this.expertRequest.recurring_billing;
    }

    getRequestDetails() {
      const request = this.expertRequest;
      const description = this.$filter('decodeHtml')(request.description);
      return `\n\nName: ${request.name}. \nUrl: ${request.url}. \nDescription: ${description}\n`;
    }

    submit() {
      return this.$uibModal.open({
        component: 'issueCreateDialog',
        resolve: {
          issue: () => ({
            type: this.ISSUE_IDS.INCIDENT,
            summary: `Expert request ${this.expertRequest.name} complaint`,
            additionalDetails: this.getRequestDetails(),
          }),
          options: {
            title: gettext('Request complaint'),
            hideTitle: true,
            descriptionPlaceholder: gettext('We are sorry you had a bad experience. Tell us what happend?'),
            descriptionLabel: gettext('Reason'),
            submitTitle: gettext('Submit complaint')
          }
        }
      });
    }
  }
};

export default expertRequestComplain;
