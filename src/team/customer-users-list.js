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
    ncUtils,
    $q,
    $uibModal,
    $state,
    ENV) {
  let controllerScope = this;
  let TeamController = baseControllerListClass.extend({
    init: function() {
      this.controllerScope = controllerScope;
      this.service = customersService;

      let fn = this._super.bind(this);
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
      let vm = this;
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
            title: gettext('Owner'),
            className: 'desktop',
            render: function(row) {
              let cls = row.role === 'owner' ? 'fa-check' : 'fa-minus';
              let title = ENV.roles[row.role];
              return '<span class="fa {cls}" title="{title}"></span>'
                .replace('{cls}', cls)
                .replace('{title}', title);
            }
          },
          {
            title: ENV.roles.manager + ' in:',
            className: 'desktop',
            render: function(row) {
              return vm.formatProjectRolesList('manager', row);
            }
          },
          {
            title: ENV.roles.admin + ' in:',
            className: 'desktop',
            render: function(row) {
              return vm.formatProjectRolesList('admin', row);
            }
          }
        ],
        rowActions: this.getRowActions()
      };
    },
    formatProjectRolesList: function (roleName, row) {
      let filteredProjects = row.projects.filter(function(item) {
        return item.role === roleName;
      });
      if (filteredProjects.length === 0) {
        return gettext('No projects are assigned to this role.');
      }
      return filteredProjects.map(function(item) {
        let projectName = item.name;
        let href = $state.href('project.details', { uuid: item.uuid });
        return '<a href="{href}">{projectName}</a>'
          .replace('{projectName}', projectName)
          .replace('{href}', href);
      }).join(', ');
    },
    getRowActions: function() {
      return [
        {
          title: gettext('Details'),
          iconClass: 'fa fa-eye',
          callback: this.openDetails.bind(this),
          isVisible: () => this.isOwnerOrStaff || this.currentUser.is_support
        },
        {
          title: gettext('Edit'),
          iconClass: 'fa fa-pencil',
          callback: this.openPopup.bind(this),
          isVisible: () => this.isOwnerOrStaff
        },
        {
          title: gettext('Remove'),
          iconClass: 'fa fa-trash',
          callback: this.remove.bind(this),
          isVisible: () => this.isOwnerOrStaff
        }
      ];
    },
    getList: function(filter) {
      return this._super(angular.extend({
        operation: 'users',
        UUID: this.currentCustomer.uuid,
        o: 'concatenated_name'
      }, filter));
    },
    removeInstance: function(user) {
      let deferred = $q.defer();
      let promises = user.projects.map(function(project) {
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
    openDetails: function(user) {
      $uibModal.open({
        component: 'userPopover',
        resolve: {
          user_uuid: () => user.uuid
        }
      });
    },
    openPopup: function(user) {
      let currentCustomer = this.currentCustomer,
        currentUser = this.currentUser,
        editUser = user;
      $uibModal.open({
        component: 'addTeamMember',
        resolve: {
          currentCustomer: () => currentCustomer,
          currentUser: () => currentUser,
          editUser: () => editUser,
        }
      }).result.then(function() {
        controllerScope.resetCache();
        customerPermissionsService.clearAllCacheForCurrentEndpoint();
      });
    }
  });

  controllerScope.__proto__ = new TeamController();
}
