export default function resourceIssues() {
  return {
    restrict: 'E',
    controller: ResourceIssuesController,
    controllerAs: '$ctrl',
    template: `<issues-list filter="$ctrl.filter" options="$ctrl.options"></issues-list>`,
    scope: {
      resource: '='
    },
    bindToController: true
  };
}

// @ngInject
class ResourceIssuesController {
  constructor($uibModal, $rootScope) {
    this.$uibModal = $uibModal;
    this.$rootScope = $rootScope;
    this.init();
  }

  init() {
    this.filter = {
      resource: this.resource.url
    };
    this.options = {
      disableAutoUpdate: false,
      disableSearch: false,
      tableActions: [
        {
          name: '<i class="fa fa-plus"></i> Create',
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
