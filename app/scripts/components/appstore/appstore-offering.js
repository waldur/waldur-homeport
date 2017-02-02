import template from './appstore-offering.html';

const appstoreOffering = {
  template: template,
  controller: class AppStoreOfferingController {
    constructor(
      $stateParams,
      $state,
      ncUtilsFlash,
      AppstoreOfferings,
      currentStateService) {
      this.$stateParams = $stateParams;
      this.$state = $state;
      this.ncUtilsFlash = ncUtilsFlash;
      this.AppstoreOfferings = AppstoreOfferings;
      this.currentStateService = currentStateService;
    }

    $onInit() {
      this.model = {};
      const key = this.$stateParams.category;
      this.loading = true;

      this.currentStateService.getProject().then(project => {
        this.project = project;
      });

      this.AppstoreOfferings.getConfiguration().then(offerings => {
        const offering = offerings[key];
        if (!offering) {
          return this.$state.go('errorPage.notFound');
        }
        this.offering = offering;
      }).finally(() => this.loading = false);
    }

    save() {
      const offering = angular.extend({
        type: this.offering.key,
        project: this.project.url,
      }, this.model);
      return this.AppstoreOfferings.createOffering(offering).then(issue => {
        this.$state.go('support.detail', {uuid: issue.uuid});
      }, response => {
        this.errors = response.data;
        this.ncUtilsFlash.error('Unable to create request for a turnkey solution.');
      });
    }
  }
};

export default appstoreOffering;
