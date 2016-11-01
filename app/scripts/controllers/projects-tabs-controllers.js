(function() {
  angular.module('ncsaas')
    .controller('ProjectEventTabController', [
      '$stateParams',
      'projectsService',
      'baseEventListController',
      'currentStateService',
      ProjectEventTabController
    ]);

  function ProjectEventTabController($stateParams, projectsService, baseEventListController, currentStateService) {
    var controllerScope = this;
    var EventController = baseEventListController.extend({
      project: null,

      init: function() {
        this.controllerScope = controllerScope;
        this._super();
        this.getProject();
      },
      getList: function(filter) {
        if (this.project) {
          this.service.defaultFilter.scope = this.project.url;
          return this._super(filter);
        } else {
          return this.getProject();
        }
      },
      getProject: function() {
        var vm = this;
        if ($stateParams.uuid) {
          return projectsService.$get($stateParams.uuid).then(function(response) {
            vm.project = response;
            return vm.getList();
          });
        } else {
          return currentStateService.getProject().then(function(response) {
            vm.project = response;
            return vm.getList();
          });
        }
      }
    });

    controllerScope.__proto__ = new EventController();
  }

})();

(function() {
  angular.module('ncsaas')
    .controller('ProjectAlertTabController', [
      'BaseAlertsListController',
      'currentStateService',
      ProjectAlertTabController
    ]);

  function ProjectAlertTabController(
    BaseAlertsListController,
    currentStateService
  ) {
    var controllerScope = this;
    var AlertController = BaseAlertsListController.extend({
      init: function() {
        this.controllerScope = controllerScope;
        this._super();
      },
      getList: function(filter) {
        var getList = this._super.bind(controllerScope),
          vm = this;
        this.service.defaultFilter.aggregate = 'project';
        this.service.defaultFilter.opened = true;
        return currentStateService.getProject().then(function(response) {
          vm.service.defaultFilter.uuid = response.uuid;
          return getList(filter);
        });
      }
    });

    controllerScope.__proto__ = new AlertController();
  }

})();

(function() {
  angular.module('ncsaas')
    .service('BaseProjectResourcesTabController', [
      'baseResourceListController', 'currentStateService', BaseProjectResourcesTabController]);

  function BaseProjectResourcesTabController(baseResourceListController, currentStateService) {
    var controllerClass = baseResourceListController.extend({
      getList: function(filter) {
        var vm = this;
        var fn = this._super.bind(vm);
        return currentStateService.getProject().then(function(project){
          vm.service.defaultFilter.project_uuid = project.uuid;
          return fn(filter);
        })
      }
    });
    return controllerClass;
  }
})();

(function() {
  angular.module('ncsaas')
    .controller('ProjectResourcesTabController', [
      'BaseProjectResourcesTabController',
      'ENV',
      ProjectResourcesTabController
    ]);

  function ProjectResourcesTabController(BaseProjectResourcesTabController, ENV) {
    var controllerScope = this;
    var ResourceController = BaseProjectResourcesTabController.extend({
      init: function() {
        this.controllerScope = controllerScope;
        this.category = ENV.VirtualMachines;
        this._super();
      },
      getTableOptions: function() {
        var options = this._super();
        options.noDataText = 'You have no virtual machines yet';
        options.noMatchesText = 'No virtual machines found matching filter.';
        return options;
      },
      getImportTitle: function() {
        return 'Import virtual machine';
      },
      getCreateTitle: function() {
        return 'Add virtual machine';
      },
    });
    controllerScope.__proto__ = new ResourceController();
  }
})();

(function() {
  angular.module('ncsaas')
    .controller('ProjectPrivateCloudsTabController', [
      'BaseProjectResourcesTabController',
      'ENV',
      ProjectPrivateCloudsTabController
    ]);

  function ProjectPrivateCloudsTabController(BaseProjectResourcesTabController, ENV) {
    var controllerScope = this;
    var ResourceController = BaseProjectResourcesTabController.extend({
      init: function() {
        this.controllerScope = controllerScope;
        this.category = ENV.PrivateClouds;
        this._super();
      },
      getTableOptions: function() {
        var options = this._super();
        options.noDataText = 'You have no private clouds yet';
        options.noMatchesText = 'No private clouds found matching filter.';
        return options;
      },
      getImportTitle: function() {
        return 'Import private cloud';
      },
      getCreateTitle: function() {
        return 'Add private cloud';
      }
    });
    controllerScope.__proto__ = new ResourceController();
  }
})();

(function() {

  angular.module('ncsaas')
    .controller('ProjectApplicationsTabController', [
      'BaseProjectResourcesTabController', 'ENV',
      ProjectApplicationsTabController]);

  function ProjectApplicationsTabController(BaseProjectResourcesTabController, ENV) {
    var controllerScope = this;
    var ResourceController = BaseProjectResourcesTabController.extend({
      init:function() {
        this.controllerScope = controllerScope;
        this.category = ENV.Applications;
        this._super();
      },
      getTableOptions: function() {
        var options = this._super();
        options.noDataText = 'You have no applications yet.';
        options.noMatchesText = 'No applications found matching filter.';
        return options;
      },
      getImportTitle: function() {
        return 'Import application';
      },
      getCreateTitle: function() {
        return 'Add application';
      }
    });
    controllerScope.__proto__ = new ResourceController();
  }
})();

(function() {
  angular.module('ncsaas')
    .controller('StorageTabController', [
      '$scope',
      'resourcesService',
      'currentProject',
      StorageTabController]);

  function StorageTabController($scope, resourcesService, currentProject) {
    $scope.isNumber = angular.isNumber;
    $scope.tabs = [
      {
        title: 'Volumes',
        countKey: 'OpenStack.Volume',
        viewKey: 'volumes'
      },
      {
        title: 'Snapshots',
        countKey: 'OpenStack.Snapshot',
        viewKey: 'snapshots'
      }
    ];
    function refreshCount() {
      var query = {
        resource_category: 'storages',
        project: currentProject.uuid
      };
      resourcesService.countByType(query).then(function(counts) {
        angular.forEach($scope.tabs, function(tab) {
          tab.count = counts[tab.countKey];
        });
      });
    }
    $scope.$on('refreshCounts', function() {
      refreshCount();
    });
    refreshCount();
  }
})();

(function() {

  angular.module('ncsaas')
    .controller('VolumesListController', [
      'BaseProjectResourcesTabController',
      'ncUtils',
      '$state',
      'ENV',
      VolumesListController]);

  function VolumesListController(BaseProjectResourcesTabController, ncUtils, $state, ENV) {
    var controllerScope = this;
    var ResourceController = BaseProjectResourcesTabController.extend({
      init:function() {
        this.category = ENV.Storages;
        this.controllerScope = controllerScope;
        this._super();
        this.rowFields.push('instance');
        this.rowFields.push('instance_name');
      },
      getFilter: function() {
        return {
          resource_type: 'OpenStack.Volume'
        };
      },
      getTableOptions: function() {
        var options = this._super();
        options.noDataText = 'You have no volumes yet.';
        options.noMatchesText = 'No volumes found matching filter.';
        options.columns.push({
          title: 'Attached to',
          render: function(data, type, row, meta) {
            if (!row.instance) {
              return 'Not known';
            }
            var uuid = ncUtils.getUUID(row.instance);
            var href = $state.href('resources.details', {
              uuid: uuid,
              resource_type: 'OpenStack.Instance'
            });
            return ncUtils.renderLink(href, row.instance_name || 'Link');
          }
        });
        return options;
      },
      getImportTitle: function() {
        return 'Import volumes';
      },
      getCreateTitle: function() {
        return 'Add volumes';
      }
    });
    controllerScope.__proto__ = new ResourceController();
  }
})();

(function() {

  angular.module('ncsaas')
    .controller('SnapshotsListController', [
      'BaseProjectResourcesTabController', 'ncUtils', '$state',
      SnapshotsListController]);

  function SnapshotsListController(BaseProjectResourcesTabController, ncUtils, $state) {
    var controllerScope = this;
    var ResourceController = BaseProjectResourcesTabController.extend({
      init:function() {
        this.controllerScope = controllerScope;
        this._super();
        this.rowFields.push('source_volume');
        this.rowFields.push('source_volume_name');
      },
      getFilter: function(filter) {
        return {
          resource_type: 'OpenStack.Snapshot'
        };
      },
      getTableOptions: function() {
        var options = this._super();
        options.noDataText = 'You have no snapshots yet.';
        options.noMatchesText = 'No snapshots found matching filter.';
        options.columns.push({
          title: 'Volume',
          render: function(data, type, row, meta) {
            if (!row.source_volume) {
              return 'Not known';
            }
            var uuid = ncUtils.getUUID(row.source_volume);
            var href = $state.href('resources.details', {
              uuid: uuid,
              resource_type: 'OpenStack.Volume'
            });
            return ncUtils.renderLink(href, row.source_volume_name || 'Link');
          }
        });
        return options;
      },
      getImportTitle: function() {
        return 'Import snapshots';
      },
      getCreateTitle: function() {
        return 'Add snapshots';
      }
    });
    controllerScope.__proto__ = new ResourceController();
  }
})();

(function() {
  angular.module('ncsaas')
    .controller('ProjectSupportTabController', [
      'baseControllerListClass',
      'premiumSupportContractsService',
      'premiumSupportPlansService',
      'currentStateService',
      'ENTITYLISTFIELDTYPES',
      'ENV',
      '$filter',
      '$stateParams',
      'ncUtils',
      ProjectSupportTabController
    ]);

  function ProjectSupportTabController(
    baseControllerListClass,
    premiumSupportContractsService,
    premiumSupportPlansService,
    currentStateService,
    ENTITYLISTFIELDTYPES,
    ENV,
    $filter,
    $stateParams,
    ncUtils
  ) {
    var controllerScope = this;
    var ResourceController = baseControllerListClass.extend({
      init: function() {
        this.controllerScope = controllerScope;
        this.service = premiumSupportContractsService;
        this._super();

        this.entityOptions = {
          entityData: {
            noDataText: 'You have no SLAs yet.',
            createLink: 'appstore.store({category: "support"})',
            createLinkText: 'Add SLA',
            expandable: true,
            hideActionButtons: true
          },
          list: [
            {
              name: 'Name',
              propertyName: 'plan_name',
              type: ENTITYLISTFIELDTYPES.none,
              showForMobile: ENTITYLISTFIELDTYPES.showForMobile
            },
            {
              name: 'State',
              propertyName: 'state',
              type: ENTITYLISTFIELDTYPES.none,
              showForMobile: ENTITYLISTFIELDTYPES.showForMobile
            }
          ]
        };
        this.expandableOptions = [
          {
            isList: false,
            addItemBlock: false,
            viewType: 'description',
            items: [
              {
                key: 'plan_description',
                label: 'Description'
              },
              {
                key: 'plan_base_rate',
                label: 'Base rate'
              },
              {
                key: 'plan_hour_rate',
                label: 'Hour rate'
              },
              {
                key: 'plan_terms',
                label: 'Terms'
              }
            ]
          }
        ];
      },
      getList: function(filter) {
        var vm = this;
        var fn = this._super.bind(vm);
        if ($stateParams.uuid) {
          this.service.defaultFilter.project_uuid = $stateParams.uuid;
          return fn(filter);
        }
        return currentStateService.getProject().then(function(project) {
          vm.service.defaultFilter.project_uuid = project.uuid;
          return fn(filter);
        })
      },
      showMore: function(contract) {
        var promise = premiumSupportPlansService.$get(null, contract.plan).then(function(response) {
          contract.plan_description = response.description;
          contract.plan_terms = response.terms;
          contract.plan_base_rate = $filter('currency')(response.base_rate, ENV.currency);
          contract.plan_hour_rate = $filter('currency')(response.hour_rate, ENV.currency);
        });
        ncUtils.blockElement('block_'+contract.uuid, promise);
      }
    });

    controllerScope.__proto__ = new ResourceController();
  }

})();

(function() {
  angular.module('ncsaas')
    .controller('ProjectDeleteTabController', [
      'baseControllerClass',
      'projectsService',
      'currentStateService',
      '$rootScope',
      '$state',
      '$q',
      ProjectDeleteTabController
    ]);

  function ProjectDeleteTabController(
    baseControllerClass,
    projectsService,
    currentStateService,
    $rootScope,
    $state,
    $q
  ) {
    var controllerScope = this;
    var DeleteController = baseControllerClass.extend({
      init: function() {
        this.controllerScope = controllerScope;
        this.service = projectsService;
        this._super();

        var vm = this;
        currentStateService.getProject().then(function(project) {
          vm.project = project;
        });
      },
      removeProject: function () {
        var confirmDelete = confirm('Confirm deletion?'),
          vm = this;
        if (confirmDelete) {
          currentStateService.setProject(null);
          return this.project.$delete().then(function() {
            projectsService.clearAllCacheForCurrentEndpoint();
            return projectsService.getFirst().then(function(project) {
              currentStateService.setProject(project);
              $rootScope.$broadcast('refreshProjectList', {model: controllerScope.project, remove: true});
            });
          }, function() {
            currentStateService.setProject(vm.project);
          }).then(function() {
            currentStateService.reloadCurrentCustomer(function(customer) {
              $rootScope.$broadcast('checkQuotas:refresh');
              $rootScope.$broadcast('customerBalance:refresh');
              $state.go('organization.projects', {uuid: customer.uuid});
            });
          });
        } else {
          return $q.reject();
        }
      }
    });

    controllerScope.__proto__ = new DeleteController();
  }

})();

(function() {
  angular.module('ncsaas')
    .controller('ProjectUsersListController', [
      'baseControllerListClass',
      'customersService',
      'projectsService',
      'projectPermissionsService',
      'currentUser',
      'currentCustomer',
      'currentProject',
      'ENV',
      '$rootScope',
      '$uibModal',
      ProjectUsersListController
    ]);

  function ProjectUsersListController(
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
          vm.isProjectManager = result.length ? true : false;
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
              render: function(data, type, row, meta) {
                var avatar = '<img gravatar-src="\'{gravatarSrc}\'" gravatar-size="100" alt="" class="avatar-img img-xs">'
                  .replace('{gravatarSrc}', row.email);
                return avatar + ' ' + (row.full_name || row.username);
              }
            },
            {
              title: 'E-mail',
              render: function(data, type, row, meta) {
                return row.email;
              }
            },
            {
              title: 'Role in project:',
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

})();
