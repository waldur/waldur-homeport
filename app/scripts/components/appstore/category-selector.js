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
      $scope,
      $uibModal,
      ENV,
      currentStateService,
      usersService,
      ISSUE_IDS,
      offeringsService,
      projectPermissionsService,
      ResourceProvisionPolicy) {
      // @ngInject
      this.$q = $q;
      this.$state = $state;
      this.$scope = $scope;
      this.$uibModal = $uibModal;
      this.ENV = ENV;
      this.currentStateService = currentStateService;
      this.usersService = usersService;
      this.ISSUE_IDS = ISSUE_IDS;
      this.offeringsService = offeringsService;
      this.projectPermissionsService = projectPermissionsService;
      this.ResourceProvisionPolicy = ResourceProvisionPolicy;
    }

    $onInit() {
      this.loading = true;
      this.$q.all([
        this.loadCustomer(),
        this.loadProject(),
        this.loadOfferings(),
      ]).finally(() => this.loading = false);
    }

    loadCustomer() {
      return this.currentStateService.getCustomer().then(customer => this.currentCustomer = customer);
    }

    loadProject() {
      this.$scope.$watch(() => this.selectedProject, () => this.checkPolicy());
      this.selectProject = this.resolve.selectProject;

      return this.usersService.getCurrentUser()
        .then(user => this.currentUser = user)
        .then(() => {
          if (this.resolve.selectProject) {
            return this.currentStateService.getCustomer().then(customer => {
              this.projects = customer.projects;
            });
          } else {
            return this.currentStateService.getProject().then(project => {
              return this.projectPermissionsService.getList({
                user: this.currentUser.uuid,
                project: project.uuid,
              }).then(permissions => {
                project.permissions = permissions;
                this.selectedProject = project;
                this.checkPolicy();
              });
            });
          }
        });
    }

    checkPolicy() {
      if (!this.selectedProject || !this.currentCustomer || !this.currentUser) {
        return;
      }

      angular.forEach(this.offerings, offering => {
        if (!this.isResource(offering.key)) {
          return;
        }
        const { disabled, errorMessage } = this.ResourceProvisionPolicy.checkResource(
          this.currentUser, this.currentCustomer, this.selectedProject, offering.key
        );
        offering.disabled = disabled;
        offering.errorMessage = errorMessage;
      });
    }

    isResource(key) {
      return angular.isDefined(this.ENV.resourcesTypes[key]);
    }

    loadOfferings() {
      return this.loadCustomOfferings().then(customOfferings => {
        let offerings = customOfferings.concat(this.ENV.offerings);

        this.offerings = offerings.reduce((map, item) => {
          map[item.key] = item;
          return map;
        }, {});

        const groups = this.ENV.offeringCategories.map(category => ({
          label: category.label,
          items: category.items.map(item => this.offerings[item]).filter(x => !!x)
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
          issue: () => ({
            customer: this.currentCustomer,
            type: this.ISSUE_IDS.SERVICE_REQUEST
          }),
          options: {
            title: gettext('Request a new service'),
            descriptionPlaceholder: gettext('Please clarify why do you need it'),
            descriptionLabel: gettext('Motivation'),
            summaryLabel: gettext('Service name'),
          }
        }
      });
    }
  }
};

export default appstoreCategorySelector;
