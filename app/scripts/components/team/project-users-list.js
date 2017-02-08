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
  ENV,
  $q,
  $rootScope,
  $uibModal) {
  var controllerScope = this;
  var TeamController = baseControllerListClass.extend({
    init: function() {
      this.controllerScope = controllerScope;
      this.service = projectsService;
      var fn = this._super.bind(this);
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
        noDataText: 'You have no team members yet',
        noMatchesText: 'No members found matching filter.',
        searchFieldName: 'full_name',
        columns: [
          {
            title: 'Member',
            className: 'all',
            width: '20%',
            render: function(row) {
              var avatar = '<img gravatar-src="\'{gravatarSrc}\'" gravatar-size="100" alt="" class="avatar-img img-xs">'
                .replace('{gravatarSrc}', row.email);
              return avatar + ' ' + (row.full_name || row.username);
            }
          },
          {
            title: 'E-mail',
            className: 'min-tablet-l',
            render: function(row) {
              return row.email;
            }
          },
          {
            title: 'Role in project:',
            className: 'min-tablet-l',
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
            name: '<i class="fa fa-plus"></i> Add member',
            callback: this.openPopup.bind(this)
          }
        ];
      }
    },
    getRowActions: function() {
      var vm = this;
      var actions = [];

      if (this.isOwnerOrStaff) {
        actions.push({
          name: '<i class="fa fa-pencil"></i> Edit',
          callback: this.openPopup.bind(this),
        });
      }

      if (this.isOwnerOrStaff || this.isProjectManager) {
        actions.push({
          name: '<i class="fa fa-trash"></i> Remove',
          callback: this.remove.bind(this),
          isDisabled: function(row) {
            return vm.isProjectManager && row.role === 'manager';
          },
          tooltip: function(row) {
            if (vm.isProjectManager && row.role === 'manager') {
              return 'Project manager cannot edit users with same role';
            }
          }
        });
      }

      return actions;
    },
    removeInstance: function(user) {
      return projectPermissionsService.deletePermission(user.permission);
    },
    openPopup: function(user) {
      var isProjectManager = this.isProjectManager,
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
