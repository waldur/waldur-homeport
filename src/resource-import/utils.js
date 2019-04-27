export default class ImportUtils {
  // @ngInject
  constructor($state, $q, $rootScope, $uibModal, ncUtils) {
    this.$state = $state;
    this.$q = $q;
    this.$rootScope = $rootScope;
    this.$uibModal = $uibModal;
    this.ncUtils = ncUtils;
  }

  openImportDialog(resourceListComponentTemplate, service, category, refreshEventName) {
    let dialog = this.$uibModal.open({
      component: 'resourceImportDialog',
      size: 'lg',
      resolve: {
        componentTemplate: () => resourceListComponentTemplate,
        service: () => service,
        category: () => category,
      }
    });
    const deferred = this.$q.defer();
    dialog.result.then(result => {
      if (refreshEventName) {
        this.$rootScope.$broadcast(refreshEventName);
      }
      deferred.resolve(result);
    });
    dialog.closed.then(() => deferred.reject());
    return deferred.promise;
  }

  getImportAction(customer, project, title, callback, requirePrivateService) {
    let disabled, tooltip;
    if (this.ncUtils.isCustomerQuotaReached(customer, 'resource')) {
      disabled = true;
      tooltip = gettext('Quota has been reached.');
    } else if (requirePrivateService && !this.projectHasPrivateService(project)) {
      disabled = true;
      tooltip = gettext('Import is not possible as there are no personal provider accounts registered.');
    } else {
      disabled = false;
      tooltip = gettext('Import resources from the registered provider accounts.');
    }

    return {
      key: 'import',
      title: title || gettext('Import'),
      iconClass: 'fa fa-plus',
      callback: callback || function() {
        this.$state.go('import.import');
      },
      disabled: disabled,
      titleAttr: tooltip
    };
  }

  projectHasPrivateService(project) {
    for (let i = 0; i < project.services.length; i++) {
      let service = project.services[i];
      if (!service.shared) {
        return true;
      }
    }
    return false;
  }
}
