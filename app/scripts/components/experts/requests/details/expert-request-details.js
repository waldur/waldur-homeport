import { STATE } from '../constants';
import template from './expert-request-details.html';

const TABS = {
  COMMENTS: 0,
  BIDS: 1,
};

const expertRequestDetails = {
  template: template,
  controller: class ExpertRequestDetailsController {
    // ngInject
    constructor($rootScope,
                $scope,
                $state,
                $stateParams,
                currentStateService,
                BreadcrumbsService,
                WorkspaceService,
                expertRequestsService) {
      this.$rootScope = $rootScope;
      this.$scope = $scope;
      this.$state = $state;
      this.$stateParams = $stateParams;
      this.currentStateService = currentStateService;
      this.BreadcrumbsService = BreadcrumbsService;
      this.WorkspaceService = WorkspaceService;
      this.expertRequestsService = expertRequestsService;
    }

    $onInit() {
      this.$scope.$on('reloadExpertRequest', this.loadExpertRequest.bind(this));
      this.loadExpertRequest();
      this.unlisten = this.$rootScope.$on('refreshExpertDetails', this.loadExpertRequest.bind(this));
    }

    loadExpertRequest() {
      this.loading = true;
      this.currentStateService.getCustomer().then(customer => {
        return this.expertRequestsService.$get(this.$stateParams.requestId)
          .then(expertRequest => {
            this.expertRequest = {...expertRequest, ...expertRequest.extra};
            this.workspace = this.WorkspaceService.getWorkspace().workspace;
            this.initTabs();
            this.refreshBreadcrumbs(customer);
          }).catch(response => {
            if (response.status === 404) {
              this.$state.go('errorPage.notFound');
            } else {
              this.erred = true;
            }
          }).finally(() => {
            this.loading = false;
          });
      });
    }

    get showBidDetails() {
      return this.workspace === 'organization' && this.expertRequest.state === 'Pending';
    }

    initTabs() {
      if (this.expertRequest.state === STATE.PENDING && !this.showBidDetails) {
        this.activeTab = TABS.BIDS;
      } else {
        this.activeTab = TABS.COMMENTS;
      }

      this.issue = {
        uuid: this.expertRequest.issue_uuid,
        url: this.expertRequest.issue,
      };
    }

    refreshBreadcrumbs(customer) {
      if (this.workspace === 'project') {
        this.BreadcrumbsService.items = [
          {
            label: gettext('Project workspace'),
            state: 'project.details',
            params: {
              uuid: this.expertRequest.project_uuid
            }
          },
          {
            label: gettext('Resources')
          },
          {
            label: gettext('Experts'),
            state: 'project.resources.experts',
            params: {
              uuid: this.expertRequest.project_uuid
            }
          }
        ];
      } else {
        this.BreadcrumbsService.items = [
          {
            label: gettext('Organization workspace'),
            state: 'organization.dashboard',
            params: {
              uuid: customer.uuid
            }
          },
          {
            label: gettext('Expert requests'),
            state: 'organization.experts',
            params: {
              uuid: customer.uuid
            }
          }
        ];
      }
      this.BreadcrumbsService.activeItem = this.expertRequest.name;
    }

    $onDestroy() {
      this.unlisten();
    }
  }
};

export default expertRequestDetails;
