const expertRequestList = {
  templateUrl: 'views/partials/filtered-list.html',
  controllerAs: 'ListController',
  controller: ExpertRequestListController,
};

// @ngInject
function ExpertRequestListController(
  baseControllerListClass,
  $state,
  $filter,
  expertRequestsService,
  currentStateService) {
  var controllerScope = this;
  var Controller = baseControllerListClass.extend({
    init: function() {
      this.controllerScope = controllerScope;
      this.service = expertRequestsService;
      let fn = this._super.bind(this);
      currentStateService.getProject().then(project => {
        this.project = project;
        this.tableOptions = {
          searchFieldName: 'name',
          noDataText: gettext('You have no expert requests.'),
          noMatchesText: gettext('No expert requests found matching filter.'),
          columns: this.getColumns(),
        };
        fn();
      });
    },
    getColumns: function() {
      return [
        {
          title: gettext('Name'),
          render: row => {
            let href = $state.href('expertRequestDetails', {uuid: row.uuid});
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
    getFilter: function() {
      return {
        project_uuid: this.project.uuid,
      };
    },
  });
  controllerScope.__proto__ = new Controller();
}

export default expertRequestList;
