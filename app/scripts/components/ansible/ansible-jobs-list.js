import { APPLICAION_TYPE, APPSTORE_CATEGORY } from './constants';

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
  ApplicationService,
  AppStoreUtilsService) {
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
          render: row => this.getApplicationType(row) === APPLICAION_TYPE.ANSIBLE_PLAYBOOK
            ? row.playbook_name : $filter('translate')('Python Management')
        },
        {
          title: gettext('State'),
          orderField: 'state',
          render: row => {
            const index = this.findIndexById(row);
            const applicationType = this.getApplicationType(row);
            return this.buildStateTag(index, applicationType);
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
      if (applicationType === APPLICAION_TYPE.ANSIBLE_PLAYBOOK) {
        return `<ansible-job-state model="controller.list[${index}]"/>`;
      } else {
        return `<python-management-state model="controller.list[${index}]"/>`;
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
      if (applicationType === APPLICAION_TYPE.ANSIBLE_PLAYBOOK) {
        return $state.href('project.resources.ansible.details', {
          uuid: this.project.uuid,
          jobId: row.uuid
        });
      } else if (applicationType === APPLICAION_TYPE.PYTHON_MANAGEMENT) {
        return $state.href('project.resources.pythonManagement.details', {
          uuid: this.project.uuid,
          pythonManagementUuid: row.uuid
        });
      }
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
        return APPLICAION_TYPE.PYTHON_MANAGEMENT;
      } else {
        return APPLICAION_TYPE.ANSIBLE_PLAYBOOK;
      }
    }

  });
  controllerScope.__proto__ = new Controller();
}

export default ansibleJobsList;
