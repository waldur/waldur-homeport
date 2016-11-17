// @ngInject
export default function ProjectUsersListController(
  baseControllerListClass,
  customersService,
  projectsService,
  projectPermissionsService,
  currentUser,
  currentCustomer,
  currentProject,
  ENV,
  $rootScope,
  $uibModal) {
  var controllerScope = this;
  var TeamController = baseControllerListClass.extend({
    init: function() {
      this.controllerScope = controllerScope;
      this.service = projectsService;
      this.hideNoDataText = true;
      this.isOwnerOrStaff = customersService.checkCustomerUser(currentCustomer, currentUser);
      this.tableOptions = {};
      var fn = this._super.bind(this);
      var vm = this;
      this.getProjectRole('manager').then(function(result) {
        vm.isProjectManager = !vm.isOwnerOrStaff && result.length > 0;
        vm.tableOptions = vm.getTableOptions();
        fn();
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
            render: function(data, type, row, meta) {
              var avatar = '<img gravatar-src="\'{gravatarSrc}\'" gravatar-size="100" alt="" class="avatar-img img-xs">'
                .replace('{gravatarSrc}', row.email);
              return avatar + ' ' + (row.full_name || row.username);
            }
          },
          {
            title: 'E-mail',
            className: 'min-tablet-l',
            render: function(data, type, row, meta) {
              return row.email;
            }
          },
          {
            title: 'Role in project:',
            className: 'min-tablet-l',
            render: function(data, type, row, meta) {
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
      var dialogScope = $rootScope.$new();
      dialogScope.currentProject = currentProject;
      dialogScope.currentCustomer = currentCustomer;
      dialogScope.editUser = user;
      dialogScope.isProjectManager = this.isProjectManager;
      dialogScope.addedUsers = this.list.map(function(users) {
        return users.uuid;
      });
      $uibModal.open({
        component: 'addProjectMember',
        scope: dialogScope
      }).result.then(function() {
        controllerScope.resetCache();
      });
    },
    getFilter: function() {
      return {operation: 'users', UUID: currentProject.uuid};
    },
    getProjectRole: function(role) {
      return projectPermissionsService.getList({
        user_url: currentUser.url,
        project: currentProject.uuid,
        role: role});
    }
  });

  controllerScope.__proto__ = new TeamController();
}
