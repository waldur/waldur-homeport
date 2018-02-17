import template from './appstore-offering.html';

const appstoreOffering = {
  template: template,
  controller: class AppStoreOfferingController {
    // @ngInject
    constructor(
      $stateParams,
      $state,
      ncUtilsFlash,
      offeringsService,
      currentStateService,
      $uibModal) {
      this.$stateParams = $stateParams;
      this.$state = $state;
      this.ncUtilsFlash = ncUtilsFlash;
      this.offeringsService = offeringsService;
      this.currentStateService = currentStateService;
      this.$uibModal = $uibModal;
      this.createButtonStatus = false;
      this.form = null;
    }

    $onInit() {
      this.summaryComponent = 'appstoreOfferingSummary';
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
            label: gettext('Name'),
            form_text: gettext('This name will be visible in accounting data.'),
            max_length: 150
          },
          description: {
            type: 'string',
            required: false,
            label: gettext('Description'),
          },
        });
        this.model.name = this.offering.label;
        angular.forEach(offering.options, (option, name) => option.name = name);
      }).finally(() => this.loading = false);
    }

    toggleCreateBtnStatus() {
      this.createButtonStatus = !this.createButtonStatus;
    }

    createBtnDisabled() {
      if (this.form) {
        if (this.form.$invalid) {
          return true;
        }
        return !this.createButtonStatus;
      }
      return !this.createButtonStatus;
    }

    openPolicy() {
      this.$uibModal.open({
        component: 'offeringPolicy',
        resolve: {
          terms_of_service: () => this.offering.terms_of_service
        }
      });
    }

    cancel() {
      this.$state.go('project.details', {uuid: this.project.uuid});
    }

    save() {
      const offering = angular.extend({
        type: this.offeringType,
        project: this.project.url,
      }, this.model);
      return this.offeringsService.createOffering(offering).then(offering => {
        this.$state.go('offeringDetails', {uuid: offering.uuid});
      }, response => {
        this.errors = response.data;
        this.ncUtilsFlash.error(gettext('Unable to create request for a turnkey solution.'));
      });
    }
  }
};

export default appstoreOffering;
