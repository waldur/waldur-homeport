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
        if (!this.offering.terms_of_service) {
          this.createButtonStatus = true;
        }
        this.wrapOptions();
        this.offering.order.unshift('name', 'description');
        angular.extend(this.offering.options, {
          name: {
            type: 'string',
            required: true,
            label: gettext('Name'),
            form_text: gettext('This name will be visible in accounting data.'),
            maxlength: 150
          },
          description: {
            type: 'string',
            required: false,
            label: gettext('Description'),
          },
        });
        // Make pre-filling of Name with Issue type configurable per issue type
        if (this.offering.prefill_name) {
          this.model.name = this.offering.label;
        }
        angular.forEach(offering.options, (option, name) => option.name = name);
      }).finally(() => this.loading = false);
    }

    wrapKey(key) {
      return `___attribute___${key}`;
    }

    wrapOptions() {
      this.keys = Object.keys(this.offering.options);
      this.offering.options = this.keys.reduce((result, key) => ({
        ...result,
        [this.wrapKey(key)]: this.offering.options[key],
      }), {});
      this.offering.order = this.keys.map(key => this.wrapKey(key));
    }

    unwrapOptions() {
      const offering = {
        type: this.offeringType,
        project: this.project.url,
        name: this.model.name,
        description: this.model.description,
        attributes: {},
      };
      this.keys.forEach(key => {
        offering.attributes[key] = this.model[this.wrapKey(key)];
      });
      return offering;
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
      const offering = this.unwrapOptions();
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
