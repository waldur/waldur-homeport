import { APPSTORE_CATEGORY } from './constants';

const ansibleJobsList = {
  templateUrl: 'views/partials/filtered-list.html',
  controllerAs: 'ListController',
  controller: AnsibleJobsListController,
};

// @ngInject
function AnsibleJobsListController(
  baseControllerListClass,
  $q,
  $state,
  $filter,
  currentStateService,
  AnsibleJobsService,
  AppStoreUtilsService) {
  let controllerScope = this;
  let Controller = baseControllerListClass.extend({
    init: function() {
      this.controllerScope = controllerScope;
      this.service = AnsibleJobsService;
      let fn = this._super.bind(this);
      this.loadContext().then(() => {
        this.tableOptions = this.getTableOptions();
        fn();
      });
    },
    loadContext: function() {
      return $q.all([
        currentStateService.getProject().then(project => {
          this.project = project;
        }),
      ]);
    },
    getTableOptions: function() {
      return {
        searchFieldName: 'name',
        noDataText: gettext('There are no applications yet.'),
        noMatchesText: gettext('No applications found matching filter.'),
        enableOrdering: true,
        columns: this.getColumns(),
        tableActions: this.getTableActions(),
      };
    },
    getColumns: function() {
      return [
        {
          title: gettext('Name'),
          orderField: 'name',
          render: row => {
            const href = $state.href('project.resources.ansible.details', {
              uuid: this.project.uuid,
              jobId: row.uuid
            });
            return '<a href="{href}">{name}</a>'
                   .replace('{href}', href)
                   .replace('{name}', row.name);
          }
        },
        {
          title: gettext('Playbook'),
          render: row => row.playbook_name
        },
        {
          title: gettext('State'),
          orderField: 'state',
          render: row => {
            const index = this.findIndexById(row);
            return `<ansible-job-state model="controller.list[${index}]"/>`;
          }
        },
        {
          title: gettext('Creation date'),
          orderField: 'created',
          render: function(row) {
            return $filter('dateTime')(row.created);
          }
        }
      ];
    },
    getTableActions: function() {
      return [
        {
          title: gettext('Create application'),
          iconClass: 'fa fa-plus',
          callback: () => {
            AppStoreUtilsService.openDialog({
              currentCategory: APPSTORE_CATEGORY
            });
          },
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

export default ansibleJobsList;
