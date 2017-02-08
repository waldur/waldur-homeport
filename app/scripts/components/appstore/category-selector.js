import template from './category-selector.html';
import './category-selector.scss';

const appstoreCategorySelector = {
  template,
  bindings: {
    dismiss: '&',
    close: '&',
    resolve: '<'
  },
  controller: class AppStoreCategorySelectorController {
    constructor(
      $q,
      $state,
      $http,
      $uibModal,
      ENV,
      currentStateService,
      ISSUE_IDS,
      offeringsService) {
      // @ngInject
      this.$q = $q;
      this.$state = $state;
      this.$http = $http;
      this.$uibModal = $uibModal;
      this.ENV = ENV;
      this.currentStateService = currentStateService;
      this.ISSUE_IDS = ISSUE_IDS;
      this.offeringsService = offeringsService;
    }

    $onInit() {
      this.loadProject();
      this.loadOfferings();
    }

    loadProject() {
      this.selectProject = this.resolve.selectProject;
      if (this.resolve.selectProject) {
        this.currentStateService.getCustomer().then(customer => {
          this.projects = customer.projects;
        });
      } else {
        this.currentStateService.getProject().then(project => {
          this.selectedProject = project;
        });
      }
    }

    loadOfferings() {
      this.loadCustomOfferings().then(customOfferings => {
        let offerings = [customOfferings, ...this.ENV.offerings];

        offerings = offerings.filter(item =>
          !item.requireOwnerOrStaff || this.currentStateService.getOwnerOrStaff());

        offerings = offerings.reduce((map, item) => {
          map[item.key] = item;
          return map;
        }, {});

        const groups = this.ENV.offeringCategories.map(category => ({
          label: category.label,
          items: category.items.map(item => offerings[item]).filter(x => !!x)
        }));

        const customOfferingsCategory = {
          label: 'Turnkey solutions',
          items: customOfferings
        };

        this.groups = [...groups, customOfferingsCategory];
      });
    }

    loadCustomOfferings() {
      return this.offeringsService.getConfiguration()
        .then(offerings => Object.keys(offerings).map(key => ({
          key,
          label: offerings[key].label,
          icon: 'fa-gear',
          state: 'appstore.offering',
        })
      ));
    }

    selectOffering(offering) {
      if (this.DialogForm.$valid) {
        this.submitting = true;
        return this.$state.go(offering.state, {
          category: offering.key,
          uuid: this.selectedProject.uuid
        })
        .then(() => this.close())
        .finally(() => this.submitting = false);
      }
    }

    requestService() {
      this.close();
      return this.$uibModal.open({
        component: 'issueCreateDialog',
        resolve: {
          issue: this.currentStateService.getCustomer().then(customer => ({
            customer,
            type: this.ISSUE_IDS.SERVICE_REQUEST
          })),
          options: {
            title: 'Request a new service',
            descriptionPlaceholder: 'Please clarify why do you need it',
            descriptionLabel: 'Motivation',
            summaryLabel: 'Service name'
          }
        }
      });
    }
  }
};

export default appstoreCategorySelector;
