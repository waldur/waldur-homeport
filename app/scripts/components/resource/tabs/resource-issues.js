export default {
  template: '<issues-list filter="$ctrl.filter" options="$ctrl.options"></issues-list>',
  bindings: {
    resource: '<'
  },
  controller: class ResourceIssuesController {
    constructor($uibModal, $rootScope) {
      // @ngInject
      this.$uibModal = $uibModal;
      this.$rootScope = $rootScope;
    }

    $onInit() {
      this.filter = {
        resource: this.resource.url
      };
      this.options = {
        disableAutoUpdate: false,
        disableSearch: false,
        hiddenColumns: [
          'customer',
          'resource_type',
        ],
        tableActions: [
          {
            title: gettext('Create'),
            iconClass: 'fa fa-plus',
            callback: () => {
              this.$uibModal.open({
                component: 'issueCreateDialog',
                resolve: {
                  issue: () => ({resource: this.resource})
                }
              });
            }
          }
        ]
      };
    }
  }
};
