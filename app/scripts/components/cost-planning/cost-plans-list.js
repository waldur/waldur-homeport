// @ngInject
function CostsPlansListController(
  baseControllerListClass,
  costPlansService,
  currentStateService,
  $uibModal) {
  const controllerScope = this;
  const ListController = baseControllerListClass.extend({
    init: function() {
      this.controllerScope = controllerScope;
      this.service = costPlansService;

      const fn = this._super.bind(this);

      this.loading = true;
      currentStateService.getProject()
        .then(project => this.currentProject = project)
        .then(() => {
          this.tableOptions = this.getTableOptions();
          fn();
        })
        .finally(() => this.loading = false);
    },

    getTableOptions: function() {
      return {
        noDataText: gettext('You have no cost plans yet'),
        noMatchesText: gettext('No cost plans found matching filter.'),
        columns: [
          {
            title: gettext('Name'),
            render: row => row.name
          }
        ],
        tableActions: this.getTableActions(),
        rowActions: this.getRowActions(),
        actionsColumnWidth: '250px'
      };
    },

    getTableActions: function() {
      return [
        {
          title: gettext('Create plan'),
          iconClass: 'fa fa-plus',
          callback: this.openCreateDialog.bind(this),
        }
      ];
    },

    getRowActions: function() {
      return [
        {
          title: gettext('Details'),
          iconClass: 'fa fa-eye',
          callback: this.openDetailsDialog.bind(this),
        },
        {
          title: gettext('Remove'),
          iconClass: 'fa fa-trash',
          callback: this.remove.bind(controllerScope),
        }
      ];
    },

    openDetailsDialog: function(plan) {
      $uibModal.open({
        component: 'costPlanDialog',
        resolve: {
          project: () => this.currentProject,
          plan: () => plan,
        },
        size: 'lg'
      }).closed.then(() => controllerScope.resetCache());
    },

    openCreateDialog: function() {
      $uibModal.open({
        component: 'costPlanDialog',
        resolve: {
          project: () => this.currentProject
        },
        size: 'lg'
      }).closed.then(() => controllerScope.resetCache());
    },

    getFilter: function() {
      return {
        project_uuid: this.currentProject.uuid
      };
    }
  });
  controllerScope.__proto__ = new ListController();
}

const costPlansList = {
  controller: CostsPlansListController,
  controllerAs: 'ListController',
  templateUrl: 'views/partials/filtered-list.html',
};

export default costPlansList;
