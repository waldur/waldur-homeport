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
      this.loading = true;
      this.$q.all([
        this.loadProject(),
        this.loadOfferings(),
      ]).finally(() => this.loading = false);
    }

    loadProject() {
      this.selectProject = this.resolve.selectProject;
      if (this.resolve.selectProject) {
        return this.currentStateService.getCustomer().then(customer => {
          this.projects = customer.projects;
        });
      } else {
        return this.currentStateService.getProject().then(project => {
          this.selectedProject = project;
        });
      }
    }

    loadOfferings() {
      return this.loadCustomOfferings().then(customOfferings => {
        let offerings = customOfferings.concat(this.ENV.offerings);

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

        let customOfferingCategories = customOfferings.reduce((map, offering) => {
          if (map[offering.category] !== undefined) {
            map[offering.category].push(offering);
          } else {
            map[offering.category] = [offering];
          }
          return map;
        }, {});

        let customGroups = Object.keys(customOfferingCategories).map(key => ({
          label: key,
          items: customOfferingCategories[key],
        }));
        this.groups = groups.concat(customGroups);
      });
    }

    loadCustomOfferings() {
      return this.offeringsService.getConfiguration()
        .then(offerings => Object.keys(offerings).map(key => ({
          key,
          label: offerings[key].label,
          icon: offerings[key].icon || 'fa-gear',
          description: offerings[key].description,
          category: offerings[key].category || gettext('Custom request'),
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
            title: gettext('Request a new service'),
            descriptionPlaceholder: gettext('Please clarify why do you need it'),
            descriptionLabel: 'Motivation',
            summaryLabel: 'Service name'
          }
        }
      });
    }
  }
};

export default appstoreCategorySelector;
