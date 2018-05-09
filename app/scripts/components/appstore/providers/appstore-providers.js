import template from './appstore-providers.html';
import './appstore-providers.scss';

const appstoreProviders = {
  template: template,
  bindings: {
    services: '<',
    onSelect: '&',
    headerTitle: '@',
    collapsible: '<',
    detailsHidden: '<',
  },
  controller: class AppstoreProvidersController {
    // @ngInject
    constructor($uibModal) {
      this.$uibModal = $uibModal;
    }

    $onInit() {
      this.collapsed = false;
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
  }
};

export default appstoreProviders;
