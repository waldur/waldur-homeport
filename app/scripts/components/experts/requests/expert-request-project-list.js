import { APPSTORE_CATEGORY } from '../constants';

const expertRequestList = {
  templateUrl: 'views/partials/filtered-list.html',
  controllerAs: 'ListController',
  controller: ExpertRequestListController,
};

// @ngInject
function ExpertRequestListController(
  baseControllerListClass,
  $q,
  $state,
  $filter,
  expertRequestsService,
  AppStoreUtilsService,
  customersService,
  currentStateService) {
  let controllerScope = this;
  let Controller = baseControllerListClass.extend({
    init: function() {
      this.controllerScope = controllerScope;
      this.service = expertRequestsService;
      let fn = this._super.bind(this);
      this.loadContext().then(() => {
        this.tableOptions = this.getTableOptions();
        fn();
      });
    },
    loadContext: function() {
      return $q.all([
        customersService.isOwnerOrStaff().then(isOwnerOrStaff => {
          this.isOwnerOrStaff = isOwnerOrStaff;
        }),
        currentStateService.getProject().then(project => {
          this.project = project;
        }),
      ]);
    },
    getTableOptions: function() {
      return {
        searchFieldName: 'name',
        noDataText: gettext('You have no expert requests.'),
        noMatchesText: gettext('No expert requests found matching filter.'),
        columns: this.getColumns(),
        tableActions: this.getTableActions(),
      };
    },
    getColumns: function() {
      return [
        {
          title: gettext('Name'),
          render: row => {
            const href = $state.href('project.expertRequestDetails', {
              uuid: this.project.uuid,
              requestId: row.uuid
            });
            return '<a href="{href}">{name}</a>'
                   .replace('{href}', href)
                   .replace('{name}', row.name);
          }
        },
        {
          title: gettext('Type'),
          render: row => row.type_label
        },
        {
          title: gettext('State'),
          render: row => {
            const index = this.findIndexById(row);
            return `<expert-request-state model="controller.list[${index}]"/>`;
          }
        },
        {
          title: gettext('Creation date'),
          render: function(row) {
            return $filter('dateTime')(row.created);
          }
        }
      ];
    },
    getTableActions: function() {
      let actions = [];
      if (this.isOwnerOrStaff) {
        actions.push({
          title: gettext('Add request'),
          iconClass: 'fa fa-plus',
          callback: () => {
            AppStoreUtilsService.openDialog({
              currentCategory: APPSTORE_CATEGORY
            });
          },
        });
      }
      return actions;
    },
    getFilter: function() {
      return {
        project_uuid: this.project.uuid,
      };
    },
  });
  controllerScope.__proto__ = new Controller();
}

export default expertRequestList;
