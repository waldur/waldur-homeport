import template from './appstore-providers.html';

const appstoreProviders = {
  template: template,
  bindings: {
    services: '<',
    onSelect: '&',
    headerTitle: '@',
    collapsible: '<',
  },
  controller: class AppstoreProvidersController {
    constructor($state, $q, $stateParams, $uibModal, AppStoreUtilsService, coreUtils, currentStateService) {
      // @ngInject
      this.$state = $state;
      this.$q = $q;
      this.$stateParams = $stateParams;
      this.$uibModal = $uibModal;
      this.AppStoreUtilsService = AppStoreUtilsService;
      this.coreUtils = coreUtils;
      this.currentStateService = currentStateService;
    }

    $onInit() {
      this.loading = true;

      this.$q.all([
        this.initNoProvidersMessage(),
        this.initProvidersManagementMessage(),
      ]).then(() => {
        this.collapsed = false;
        this.loading = false;
      });
    }

    getTitle() {
      return this.headerTitle || gettext('Select provider');
    }

    collapse() {
      if(!this.collapsible) {
        return;
      }

      this.collapsed = !this.collapsed;
    }

    initNoProvidersMessage() {
      return this.currentStateService.getCustomer().then(customer => {
        this.currentCustomer = customer;
        this.createProviderLink = this.$state.href('organization.createProvider', {uuid: this.currentCustomer.uuid});
      }).then(() => {
        let category = this.$state.current.data.category || this.$stateParams.category;
        if (category) {
          category = this.AppStoreUtilsService.findCategory(category);
          if (!category) {
            return this.$q.when([]);
          }
          this.noProvidersMessage = this.coreUtils.templateFormatter(
            gettext('There are no {categoryLabel} providers available for the current project.'),
            { categoryLabel: category.label.toLowerCase() });
        }
      });
    }

    initProvidersManagementMessage() {
      return this.currentStateService.getProject().then(project => {
        const link = this.$state.href('appstore.private_clouds', { uuid: project.uuid });
        this.providerManagementMessage = this.coreUtils.templateFormatter(
          gettext('You can provision a new provider through <a href="{link}">Service store</a>.'), { link });
      });
    }

    select(service) {
      if (!this.isSelected(service)) {
        this.onSelect({service: service});
        this.selectedService = service;
      }
    }

    getSelectButtonText(service) {
      if (this.isSelected(service)) {
        return gettext('Selected');
      } else {
        return gettext('Select');
      }
    }

    isSelected(service) {
      return angular.equals(this.selectedService, service);
    }

    showDetails(service) {
      this.$uibModal.open({
        component: 'providerDialog',
        size: 'lg',
        resolve: {
          provider_uuid: () => service.uuid,
          provider_type: () => service.type,
        }
      });
    }

    showServiceStoreDialog() {
      return this.AppStoreUtilsService.openDialog();
    }
  }
};

export default appstoreProviders;
