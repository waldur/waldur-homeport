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
  AppStoreUtilsService,
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
            } else if (applicationType === APPLICATION_TYPE.PYTHON_MANAGEMENT) {
              return $filter('translate')('Python Management');
            } else if (applicationType === APPLICATION_TYPE.JUPYTER_HUB_MANAGEMENT) {
              return $filter('translate')('JupyterHub Management');
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
      } else if ([APPLICATION_TYPE.PYTHON_MANAGEMENT, APPLICATION_TYPE.JUPYTER_HUB_MANAGEMENT].includes(applicationType)) {
        return `<python-management-state model="controller.list[${index}]"></python-management-state>`;
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
      } else if (applicationType === APPLICATION_TYPE.PYTHON_MANAGEMENT) {
        return $state.href('project.resources.pythonManagement.details', {
          uuid: this.project.uuid,
          pythonManagementUuid: row.uuid
        });
      } else if (applicationType === APPLICATION_TYPE.JUPYTER_HUB_MANAGEMENT) {
        return $state.href('project.resources.jupyterHubManagement.details', {
          uuid: this.project.uuid,
          jupyterHubManagementUuid: row.uuid
        });
      }
    },
    removeInstance: function(model) {
      const applicationType = this.getApplicationType(model);
      if (applicationType === APPLICATION_TYPE.PLAYBOOK_JOB) {
        return AnsibleJobsService.$delete(model.jobId);
      } else if (applicationType === APPLICATION_TYPE.PYTHON_MANAGEMENT) {
        return $http.delete(`${ENV.apiEndpoint}api/python-management/${model.uuid}/`);
      } else if (applicationType === APPLICATION_TYPE.JUPYTER_HUB_MANAGEMENT) {
        return $http.delete(`${ENV.apiEndpoint}api/jupyter-hub-management/${model.uuid}/`);
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

    getApplicationType(row) {
      if (row.type === 'python_management') {
        return APPLICATION_TYPE.PYTHON_MANAGEMENT;
      } else if (row.type === 'playbook_job') {
        return APPLICATION_TYPE.PLAYBOOK_JOB;
      } else {
        return APPLICATION_TYPE.JUPYTER_HUB_MANAGEMENT;
      }
    }
  });
  controllerScope.__proto__ = new Controller();
}

export default applicationList;
