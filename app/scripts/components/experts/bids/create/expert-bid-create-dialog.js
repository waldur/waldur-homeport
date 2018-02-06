import template from './expert-bid-create-dialog.html';

const expertBidCreateDialog = {
  template,
  bindings: {
    dismiss: '&',
    close: '&',
    resolve: '<'
  },
  controller: class ExpertBidCreateDialogController {
    // @ngInject
    constructor(
      $q,
      $state,
      $rootScope,
      ENV,
      ncUtilsFlash,
      expertBidsService,
      currentStateService,
      projectsService) {
      this.$q = $q;
      this.$state = $state;
      this.$rootScope = $rootScope;
      this.ncUtilsFlash = ncUtilsFlash;
      this.expertBidsService = expertBidsService;
      this.currentStateService = currentStateService;
      this.projectsService = projectsService;
      this.currency = ENV.currency;
    }

    $onInit() {
      this.usersByProject = {};
      this.loading = true;
      this.price = 0;
      this.expertRequest = this.resolve.expertRequest;
      this.currentStateService.getCustomer().then(customer => {
        this.customer = customer;
        this.projects = customer.projects;
        if (this.projects.length === 1) {
          this.selectedProject = this.projects[0];
          this.onProjectSelect(this.selectedProject);
        }
        this.loading = false;
      });
    }

    onProjectSelect(project) {
      this.selectedProjectUsers = null;
      if (this.usersByProject[project.uuid]) {
        this.selectedProjectUsers = this.usersByProject[project.uuid];
      } else {
        this.loadingUsers = true;
        this.projectsService.getAll({
          operation: 'users',
          UUID: project.uuid,
          o: 'concatenated_name'
        }).then(users => {
          this.selectedProjectUsers = this.usersByProject[project.uuid] = users;
          this.loadingUsers = false;
        });
      }
    }

    isSubmitEnabled() {
      return this.selectedProjectUsers.length === 0;
    }

    save() {
      this.BidForm.$submitted = true;
      if (this.BidForm.$invalid) {
        return this.$q.reject();
      }

      let instance = this.expertBidsService.$create();
      instance.request = this.expertRequest.url;
      instance.team = this.selectedProject.url;
      instance.description = this.description;
      instance.price = this.price;
      return instance.$save().then(() => {
        this.expertBidsService.clearAllCacheForCurrentEndpoint();
        this.$rootScope.$broadcast('refreshBidsList');
        this.close();
      })
      .then(() => {
        this.ncUtilsFlash.success(gettext('Proposal has been created.'));
        this.$state.go('organization.expertRequestDetails', {
          uuid: this.customer.uuid,
          requestId: this.expertRequest.uuid
        });
      })
      .catch(response => {
        if (response.data) {
          this.ncUtilsFlash.errorFromResponse(response, gettext('Unable to create proposal'));
          this.errors = response.data;
        }
      });
    }
  }
};

export default expertBidCreateDialog;
