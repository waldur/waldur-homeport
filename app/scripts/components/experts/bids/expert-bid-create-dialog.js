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
    constructor($q, $state, $rootScope, ncUtilsFlash, expertBidsService, currentStateService) {
      this.$q = $q;
      this.$state = $state;
      this.$rootScope = $rootScope;
      this.ncUtilsFlash = ncUtilsFlash;
      this.expertBidsService = expertBidsService;
      this.currentStateService = currentStateService;
    }

    $onInit() {
      this.loading = true;
      this.price = 0;
      this.expertRequest = this.resolve.expertRequest;
      this.currentStateService.getCustomer().then(customer => {
        this.projects = customer.projects;
        if (this.projects.length === 1) {
          this.selectedProject = this.projects[0];
        }
        this.loading = false;
      });
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
        this.ncUtilsFlash.success('Expert bid has been created.');
        this.$rootScope.$broadcast('refreshBidsList');
        this.close();
      })
      .then(() => {
        this.ncUtilsFlash.success('Expert bid has been created.');
        this.$state.go('expertRequestDetails', {uuid: this.expertRequest.uuid});
      })
      .catch(response => {
        if (response.data) {
          this.errors = response.data;
        }
      });
    }
  }
};

export default expertBidCreateDialog;
