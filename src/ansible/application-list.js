import { APPLICATION_TYPE, APPSTORE_CATEGORY } from './constants';

const applicationList = {
  templateUrl: 'views/partials/filtered-list.html',
  controllerAs: 'ListController',
  controller: ApplicationListController,
};

// @ngInject
function ApplicationListController(
  baseControllerListClass,
  $q,
  $state,
  $filter,
  $http,
  ENV,
  currentStateService,
  ApplicationService,
  AnsibleJobsService) {
  let controllerScope = this;
  let Controller = baseControllerListClass.extend({
    init: function() {
      this.controllerScope = controllerScope;
      this.service = ApplicationService;
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
        rowActions: this.getRowActions(),
      };
    },
    getColumns: function() {
      return [
        {
          title: gettext('Name'),
          orderField: 'name',
          render: row => this.buildLinkTag(row)
        },
        {
          title: gettext('Playbook'),
          render: row => {
            const applicationType = this.getApplicationType(row);
            if (applicationType === APPLICATION_TYPE.PLAYBOOK_JOB) {
              return row.playbook_name;
            }
          }
        },
        {
          title: gettext('State'),
          orderField: 'state',
          render: row => {
            const index = this.findIndexById(row);
            return this.buildStateTag(index);
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
    buildStateTag: function (index, applicationType) {
      if (applicationType === APPLICATION_TYPE.PLAYBOOK_JOB) {
        return `<ansible-job-state model="controller.list[${index}]"></ansible-job-state>`;
      }
    },
    buildLinkTag: function (row) {
      const applicationType = this.getApplicationType(row);
      return '<a href="{href}">{name}</a>'
        .replace('{href}', this.buildStateTransition(row, applicationType))
        .replace('{name}', this.buildLinkName(row, applicationType));
    },
    buildLinkName: function (row) {
      return row.name;
    },
    buildStateTransition: function (row, applicationType) {
      if (applicationType === APPLICATION_TYPE.PLAYBOOK_JOB) {
        return $state.href('project.resources.ansible.details', {
          uuid: this.project.uuid,
          jobId: row.uuid
        });
      }
    },
    removeInstance: function(model) {
      const applicationType = this.getApplicationType(model);
      if (applicationType === APPLICATION_TYPE.PLAYBOOK_JOB) {
        return AnsibleJobsService.$delete(model.jobId);
      }
    },
    handleActionException: function() {
      alert('Action failed or is not allowed!');
    },
    getRowActions: function() {
      const checkState = app => ['OK', 'Erred'].includes(app.state);
      return [
        {
          title: gettext('Remove application'),
          iconClass: 'fa fa-trash',
          callback: this.remove.bind(controllerScope),
          isDisabled: (app) => !checkState(app),
          tooltip: (app) => {
            if (!checkState(app)) {
              return gettext('Please wait until provisioning is completed.');
            }
          }
        }
      ];
    },
    getTableActions: function() {
      return [];
    },
    getFilter: function() {
      return {
        project_uuid: this.project.uuid,
      };
    },

    getApplicationType(row) {
      if (row.type === 'playbook_job') {
        return APPLICATION_TYPE.PLAYBOOK_JOB;
      }
    }
  });
  controllerScope.__proto__ = new Controller();
}

export default applicationList;
