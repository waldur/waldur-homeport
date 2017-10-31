import { STATE } from '../constants';
import template from './expert-request-details.html';

const TABS = {
  COMMENTS: 0,
  BIDS: 1,
};

const USER_ROLE_STAFF = gettext('staff');

const USER_ROLE_SUPPORT = gettext('support');

const USER_ROLE_EXPERT = gettext('expert');

const USER_ROLE_OWNER = gettext('owner');


const expertRequestDetails = {
  template: template,
  controller: class ExpertRequestDetailsController {
    // @ngInject
    constructor(
      $q,
      $rootScope,
      $scope,
      $state,
      $stateParams,
      customersService,
      currentStateService,
      BreadcrumbsService,
      WorkspaceService,
      expertRequestsService,
      usersService) {
      this.$q = $q;
      this.$rootScope = $rootScope;
      this.$scope = $scope;
      this.$state = $state;
      this.$stateParams = $stateParams;
      this.customersService = customersService;
      this.currentStateService = currentStateService;
      this.BreadcrumbsService = BreadcrumbsService;
      this.WorkspaceService = WorkspaceService;
      this.expertRequestsService = expertRequestsService;
      this.usersService = usersService;
    }

    $onInit() {
      this.$scope.$on('reloadExpertRequest', this.loadExpertRequest.bind(this));
      this.loadExpertRequest();
      this.unlisten = this.$rootScope.$on('refreshExpertDetails', this.loadExpertRequest.bind(this));
    }

    loadExpertRequest() {
      this.loading = true;
      this.loadContext().then(() => {
        this.workspace = this.WorkspaceService.getWorkspace().workspace;
        this.initTabs();
        this.refreshBreadcrumbs(this.currentCustomer);
        this.loading = false;
        this.$scope.$digest();
      }).catch(response => {
        if (response.status === 404) {
          this.$state.go('errorPage.notFound');
        } else {
          this.erred = true;
        }
        this.loading = false;
        this.$scope.$digest();
      });
    }

    async loadContext() {
      const expertRequest = await this.expertRequestsService.$get(this.$stateParams.requestId);
      this.expertRequest = {...expertRequest, ...expertRequest.extra};

      this.currentCustomer = await this.currentStateService.getCustomer();
      this.currentUser = await this.usersService.getCurrentUser();

      this.users = await this.expertRequestsService.getUsers(this.expertRequest);
      this.populateCurrentUser();
    }

    populateCurrentUser() {
      if (this.users[this.currentUser.uuid]) {
        return;
      }
      let roles = this.users[this.currentUser.uuid] = [];
      if (this.currentUser.is_staff) {
        roles.push(USER_ROLE_STAFF);
      }
      if (this.currentUser.is_support) {
        roles.push(USER_ROLE_SUPPORT);
      }
      if (this.customersService.isOwner(this.currentCustomer, this.currentUser)) {
        roles.push(USER_ROLE_OWNER);
      }
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
