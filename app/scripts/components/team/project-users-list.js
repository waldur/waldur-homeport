export const projectUsers = {
  templateUrl: 'views/partials/filtered-list.html',
  controller: ProjectUsersListController,
  controllerAs: 'ListController',
};

// @ngInject
export default function ProjectUsersListController(
  baseControllerListClass,
  customersService,
  currentStateService,
  usersService,
  projectsService,
  projectPermissionsService,
  ncUtils,
  ENV,
  $q,
  $rootScope,
  $uibModal) {
  let controllerScope = this;
  let TeamController = baseControllerListClass.extend({
    init: function() {
      this.controllerScope = controllerScope;
      this.service = projectsService;
      let fn = this._super.bind(this);
      $q.all([
        currentStateService.getCustomer().then(customer => {
          controllerScope.currentCustomer = customer;
        }),
        currentStateService.getProject().then(project => {
          controllerScope.currentProject = project;
        }),
        usersService.getCurrentUser().then(user => {
          controllerScope.currentUser = user;
        })
      ]).then(() => {
        this.isOwnerOrStaff = customersService.checkCustomerUser(controllerScope.currentCustomer, controllerScope.currentUser);
        this.getProjectRole('manager').then(result => {
          this.isProjectManager = !this.isOwnerOrStaff && result.length > 0;
          this.tableOptions = this.getTableOptions();
          fn();
        });
      });
    },
    getTableOptions: function() {
      return {
        noDataText: gettext('You have no team members yet.'),
        noMatchesText: gettext('No members found matching filter.'),
        searchFieldName: 'full_name',
        columns: [
          {
            title: gettext('Member'),
            render: ncUtils.renderAvatar
          },
          {
            title: gettext('E-mail'),
            render: function(row) {
              return row.email;
            }
          },
          {
            title: gettext('Role in project'),
            render: function(row) {
              return ENV.roles[row.role];
            }
          }
        ],
        tableActions: this.getTableActions(),
        rowActions: this.getRowActions()
      };
    },
    getTableActions: function() {
      if (this.isOwnerOrStaff || this.isProjectManager) {
        return [
          {
            title: gettext('Add member'),
            iconClass: 'fa fa-plus',
            callback: this.openPopup.bind(this)
          }
        ];
      }
    },
    getRowActions: function() {
      let vm = this;
      let actions = [
        {
          title: gettext('Details'),
          iconClass: 'fa fa-eye',
          callback: this.openDetails.bind(this)
        }
      ];

      if (this.isOwnerOrStaff) {
        actions.push({
          title: gettext('Edit'),
          iconClass: 'fa fa-pencil',
          callback: this.openPopup.bind(this),
        });
      }

      if (this.isOwnerOrStaff || this.isProjectManager) {
        actions.push({
          title: gettext('Remove'),
          iconClass: 'fa fa-trash',
          callback: this.remove.bind(this),
          isDisabled: function(row) {
            return vm.isProjectManager && row.role === 'manager';
          },
          tooltip: function(row) {
            if (vm.isProjectManager && row.role === 'manager') {
              return gettext('Project manager cannot edit users with same role.');
            }
          }
        });
      }

      return actions;
    },
    removeInstance: function(user) {
      return projectPermissionsService.deletePermission(user.permission);
    },
    openDetails: function(user) {
      $uibModal.open({
        component: 'userPopover',
        resolve: {
          user_uuid: () => user.uuid
        }
      });
    },
    openPopup: function(user) {
      let isProjectManager = this.isProjectManager,
        addedUsers = this.list.map(function(users) {
          return users.uuid;
        });
      $uibModal.open({
        component: 'addProjectMember',
        resolve: {
          currentProject: () => controllerScope.currentProject,
          currentCustomer: () => controllerScope.currentCustomer,
          editUser: () => user,
          isProjectManager: () => isProjectManager,
          addedUsers: () => addedUsers
        }
      }).result.then(function() {
        controllerScope.resetCache();
      });
    },
    getFilter: function() {
      return {
        operation: 'users',
        UUID: controllerScope.currentProject.uuid,
        o: 'concatenated_name'
      };
    },
    getProjectRole: function(role) {
      return projectPermissionsService.getList({
        user_url: controllerScope.currentUser.url,
        project: controllerScope.currentProject.uuid,
        role: role});
    }
  });

  controllerScope.__proto__ = new TeamController();
}
