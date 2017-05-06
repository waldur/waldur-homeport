import ResourceFeatures from '../resource/features';

const projectsList = {
  templateUrl: 'views/partials/filtered-list.html',
  controller: ProjectsListController,
  controllerAs: 'ListController',
};

export default projectsList;

// @ngInject
function ProjectsListController(
  baseControllerListClass,
  projectsService,
  customersService,
  features,
  $filter,
  $q,
  $state,
  $scope,
  $timeout,
  $uibModal,
  ncUtils,
  ncUtilsFlash,
  currentStateService,
  usersService) {
  var controllerScope = this;
  var Controller = baseControllerListClass.extend({
    init: function() {
      this.controllerScope = controllerScope;
      this.service = projectsService;
      var fn = this._super.bind(this);
      this.activate().then(function() {
        fn();
      });
      $scope.$on('refreshProjectList', function() {
        $timeout(function() {
          controllerScope.resetCache();
        });
      });
    },
    activate: function() {
      var vm = this;
      vm.loading = true;
      return $q.all([
        currentStateService.getCustomer().then(function(customer) {
          vm.currentCustomer = customer;
        }),
        usersService.getCurrentUser().then(function(user) {
          vm.currentUser = user;
        })
      ]).finally(function() {
        vm.loading = false;
      }).then(function() {
        vm.controllerScope.addProjectDisabled = !vm.userCanAddProject();
        vm.tableOptions = {
          searchFieldName: 'name',
          noDataText: gettext('You have no projects yet.'),
          noMatchesText: gettext('No projects found matching filter.'),
          columns: vm.getColumns(),
          tableActions: vm.getTableActions(),
          rowActions: vm.getRowActions(),
        };
      });
    },
    refreshCustomer: function() {
      return customersService.$get(this.currentCustomer.uuid).then((customer) => {
        this.currentCustomer = customer;
        currentStateService.setCustomer(this.currentCustomer);
        this.controllerScope.addProjectDisabled = !this.userCanAddProject();
      });
    },
    getFilter: function() {
      return {
        customer: controllerScope.currentCustomer.uuid,
        o: 'name'
      };
    },
    getColumns: function() {
      return [
        {
          title: gettext('Name'),
          render: function(row) {
            var href = $state.href('project.details', {uuid: row.uuid});
            return '<a href="{href}">{name}</a>'
                   .replace('{href}', href)
                   .replace('{name}', row.name);
          }
        },
        {
          title: gettext('Description'),
          width: '200px',
          render: function(row) {
            return `<span class="elipsis" style="width: 150px;" uib-tooltip="${row.description}">${row.description}</span>`;
          }
        },
        {
          title: gettext('Creation date'),
          render: function(row) {
            return $filter('dateTime')(row.created);
          }
        },
        {
          title: gettext('VMs'),
          render: row => row.vm_count || 0
        },
        {
          title: gettext('Storage'),
          render: row => row.storage_count || 0
        },
        {
          title: gettext('Apps'),
          feature: ResourceFeatures.APPLICATIONS,
          render: row => row.app_count || 0
        },
        {
          title: gettext('Private clouds'),
          render: row => row.private_cloud_count || 0
        },
        {
          title: gettext('Estimated cost'),
          feature: 'projectCostDetails',
          render: row => $filter('defaultCurrency')(row.price_estimate.total)
        },
        {
          title: gettext('SLA'),
          feature: 'premiumSupport',
          render: function(row) {
            if (row.plan) {
              return row.plan.name;
            } else if (row.has_pending_contracts) {
              return gettext('Pending');
            } else {
              return gettext('No plan');
            }
          }
        }
      ];
    },
    userCanAddProject: function() {
      const ownerOrStaff = customersService.checkCustomerUser(this.currentCustomer, this.currentUser);
      let quotaReached = ncUtils.isCustomerQuotaReached(this.currentCustomer, 'project');
      return ownerOrStaff && !quotaReached;
    },
    getTableActions: function() {
      let vm = this;
      let ownerOrStaff = customersService.checkCustomerUser(vm.currentCustomer, vm.currentUser);
      let quotaReached = ncUtils.isCustomerQuotaReached(vm.currentCustomer, 'project');
      let title;
      if (!ownerOrStaff) {
        title = gettext('You don\'t have enough privileges to perform this operation.');
      } else if (quotaReached) {
        title = gettext('Quota has been reached.');
      }
      return [
        {
          title: gettext('Add project'),
          iconClass: 'fa fa-plus',
          callback: function() {
            $state.go('organization.createProject', {
              uuid: vm.currentCustomer.uuid
            });
          },
          disabled: vm.controllerScope.addProjectDisabled,
          isDisabled: () => { return vm.controllerScope.addProjectDisabled; },
          titleAttr: title,
        }
      ];
    },
    getRowActions: function() {
      let vm = this;
      let ownerOrStaff = customersService.checkCustomerUser(vm.currentCustomer, vm.currentUser);
      return [
        {
          title: gettext('Details'),
          iconClass: 'fa fa-eye',
          callback: this.openDetailsDialog.bind(this),
        },
        {
          title: gettext('Remove'),
          iconClass: 'fa fa-trash',
          callback: this.remove.bind(this.controllerScope),
          isDisabled: (project) => {
            return !ownerOrStaff || vm.hasConnectedResources(project);
          },
          tooltip: (project) => {
            if (!ownerOrStaff) {
              return gettext('You don\'t have enough privileges to perform this operation.');
            } else if(vm.hasConnectedResources(project)) {
              return gettext('Project has connected resources and can\'t be removed');
            }
          }
        }
      ];
    },
    openDetailsDialog: function(project) {
      $uibModal.open({
        component: 'projectDialog',
        resolve: {
          project: () => project
        },
        size: 'lg',
      });
    },
    afterGetList: function() {
      for (var i = 0; i < this.list.length; i++) {
        var item = this.list[i];
        this.setProjectCounters(item);
      }
      this._super();
    },
    setProjectCounters: function(project) {
      for (var i = 0; i < project.quotas.length; i++) {
        var quota = project.quotas[i];
        if (quota.name == 'nc_app_count') {
          project.app_count = quota.usage;
        } else if (quota.name == 'nc_vm_count') {
          project.vm_count = quota.usage;
        } else if (quota.name == 'nc_private_cloud_count') {
          project.private_cloud_count = quota.usage;
        } else if (quota.name == 'nc_storage_count') {
          project.storage_count = quota.usage;
        }
      }
    },
    hasConnectedResources: function(project) {
      return ncUtils.getQuotaUsage(project.quotas).nc_resource_count !== 0;
    },
    removeInstance: function(project) {
      return project.$delete()
        .then(() => {
          return this.refreshCustomer().then(()=> {
            ncUtilsFlash.success(gettext('Project has been removed successfully.'));
          });
        })
        .catch((response)=>{
          let message = response.data.detail || gettext('An error occurred on project removal.');
          ncUtilsFlash.error(message);
        });
    },
  });

  controllerScope.__proto__ = new Controller();
}
