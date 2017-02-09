import template from './appstore-offering.html';

const appstoreOffering = {
  template: template,
  controller: class AppStoreOfferingController {
    constructor(
      $stateParams,
      $state,
      ncUtilsFlash,
      offeringsService,
      currentStateService) {
      // @ngInject
      this.$stateParams = $stateParams;
      this.$state = $state;
      this.ncUtilsFlash = ncUtilsFlash;
      this.offeringsService = offeringsService;
      this.currentStateService = currentStateService;
    }

    $onInit() {
      this.model = {};
      this.offeringType = this.$stateParams.category;
      this.loading = true;

      this.currentStateService.getProject().then(project => {
        this.project = project;
      });

      this.offeringsService.getConfiguration().then(offerings => {
        const offering = offerings[this.offeringType];
        if (!offering) {
          return this.$state.go('errorPage.notFound');
        }
        this.offering = offering;
        this.offering.order.unshift('name', 'description');
        angular.extend(this.offering.options, {
          name: {
            type: 'string',
            required: true,
            label: 'Name',
            max_length: 150
          },
          description: {
            type: 'string',
            required: false,
            label: 'Description',
          },
        });
        angular.forEach(offering.options, (option, name) => option.name = name);
      }).finally(() => this.loading = false);
    }

    save() {
      const offering = angular.extend({
        type: this.offeringType,
        project: this.project.url,
      }, this.model);
      return this.offeringsService.createOffering(offering).then(offering => {
        this.$state.go('support.detail', {uuid: offering.issue_uuid});
      }, response => {
        this.errors = response.data;
        this.ncUtilsFlash.error('Unable to create request for a turnkey solution.');
      });
    }
  }
};

export default appstoreOffering;
