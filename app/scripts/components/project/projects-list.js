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
  ncUtils,
  currentStateService,
  usersService) {
  var controllerScope = this;
  var Controller = baseControllerListClass.extend({
    init: function() {
      this.service = projectsService;
      var fn = this._super.bind(this);
      this.activate().then(function() {
        fn();
      });
      $scope.$on('currentCustomerUpdated', function() {
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
        vm.tableOptions = {
          searchFieldName: 'name',
          noDataText: gettext('You have no projects yet.'),
          noMatchesText: gettext('No projects found matching filter.'),
          columns: vm.getColumns(),
          tableActions: vm.getTableActions()
        };
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
          title: gettext('SLA'),
          feature: 'premiumSupport',
          render: function(row) {
            if (row.plan) {
              return row.plan.name;
            } else if (row.has_pending_contracts) {
              return 'Pending';
            } else {
              return 'No plan';
            }
          }
        }
      ];
    },
    getTableActions: function() {
      var vm = this;
      var ownerOrStaff = customersService.checkCustomerUser(vm.currentCustomer, vm.currentUser);
      var quotaReached = ncUtils.isCustomerQuotaReached(vm.currentCustomer, 'project');
      var title;
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
          disabled: !ownerOrStaff || quotaReached,
          titleAttr: title
        }
      ];
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
    }
  });

  controllerScope.__proto__ = new Controller();
}
