const resourceIssues = {
  controller: ResourceIssuesController,
  template: '<issues-list filter="$ctrl.filter" options="$ctrl.options"></issues-list>',
  bindins: {
    resource: '<'
  },
};

export default resourceIssues;

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
