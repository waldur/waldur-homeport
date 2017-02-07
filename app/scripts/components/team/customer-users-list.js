export default function customerUsersList() {
  return {
    restrict: 'E',
    controller: CustomerUsersListController,
    controllerAs: 'ListController',
    templateUrl: 'views/partials/filtered-list.html',
    scope: {},
    bindToController: {
      customer: '=',
      options: '='
    }
  };
}

// @ngInject
function CustomerUsersListController(
    baseControllerListClass,
    customerPermissionsService,
    customersService,
    projectPermissionsService,
    currentStateService,
    usersService,
    $q,
    $rootScope,
    $uibModal,
    $state,
    ENV) {
  var controllerScope = this;
  var TeamController = baseControllerListClass.extend({
    init: function() {
      this.controllerScope = controllerScope;
      this.service = customersService;

      var fn = this._super.bind(this);
      this.loading = true;
      $q.all([
        this.loadCustomer(),
        usersService.getCurrentUser().then(user => {
          this.currentUser = user;
        })
      ]).then(() => {
        this.isOwnerOrStaff = customersService.checkCustomerUser(this.currentCustomer, this.currentUser);
        this.tableOptions = angular.extend(this.getTableOptions(), controllerScope.options);
        fn();
      }).finally(() => {
        this.loading = false;
      });
    },
    loadCustomer: function() {
      if (controllerScope.customer) {
        this.currentCustomer = controllerScope.customer;
      } else {
        return currentStateService.getCustomer().then(customer => {
          this.currentCustomer = customer;
        });
      }
    },
    getTableOptions: function() {
      var vm = this;
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
            title: 'Owner',
            className: 'all',
            render: function(row) {
              var cls = row.role == 'owner' ? 'check' : 'minus';
              var title = ENV.roles[row.role];
              return '<span class="icon {cls}" title="{title}"></span>'
                .replace('{cls}', cls)
                .replace('{title}', title);
            }
          },
          {
            title: ENV.roles.manager + ' in:',
            className: 'min-tablet-l',
            render: function(row) {
              return vm.formatProjectRolesList('manager', row);
            }
          },
          {
            title: ENV.roles.admin + ' in:',
            className: 'min-tablet-l',
            render: function(row) {
              return vm.formatProjectRolesList('admin', row);
            }
          }
        ],
        rowActions: this.getRowActions()
      };
    },
    formatProjectRolesList: function (roleName, row) {
      var filteredProjects = row.projects.filter(function(item) {
        return item.role === roleName;
      });
      if (filteredProjects.length === 0) {
        return 'No projects are assigned to this role';
      }
      return filteredProjects.map(function(item) {
        var projectName = item.name;
        var href = $state.href('project.details', { uuid: item.uuid });
        return '<a href="{href}">{projectName}</a>'
          .replace('{projectName}', projectName)
          .replace('{href}', href);
      }).join(', ');
    },
    getRowActions: function() {
      if (this.isOwnerOrStaff) {
        return [
          {
            name: '<i class="fa fa-pencil"></i> Edit',
            callback: this.openPopup.bind(this)
          },
          {
            name: '<i class="fa fa-trash"></i> Remove',
            callback: this.remove.bind(this)
          }
        ];
      }
    },
    getList: function(filter) {
      return this._super(angular.extend({
        operation: 'users',
        UUID: this.currentCustomer.uuid,
        o: 'concatenated_name'
      }, filter));
    },
    removeInstance: function(user) {
      var deferred = $q.defer();
      var promises = user.projects.map(function(project) {
        return projectPermissionsService.deletePermission(project.permission);
      });
      $q.all(promises).then(function() {
        if (user.permission) {
          customerPermissionsService.deletePermission(user.permission).then(
            function() {
              deferred.resolve();
            },
            function(response) {
              deferred.reject(response.data.detail);
            }
          );
        } else {
          deferred.resolve();
        }
      });
      return deferred.promise;
    },
    openPopup: function(user) {
      var currentCustomer = this.currentCustomer,
        currentUser = this.currentUser,
        editUser = user;
      $uibModal.open({
        component: 'addTeamMember',
        resolve: {
          currentCustomer: function() { return currentCustomer; },
          currentUser: function() { return currentUser; },
          editUser: function() { return editUser; }
        }
      }).result.then(function() {
        controllerScope.resetCache();
        customerPermissionsService.clearAllCacheForCurrentEndpoint();
      });
    }
  });

  controllerScope.__proto__ = new TeamController();
}
