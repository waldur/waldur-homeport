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
  $filter,
  $q,
  $state,
  $scope,
  $timeout,
  $uibModal,
  ncUtils,
  ncUtilsFlash,
  TableExtensionService,
  currentStateService,
  QuotaUtilsService,
  usersService) {
  let controllerScope = this;
  let Controller = baseControllerListClass.extend({
    init: function() {
      this.controllerScope = controllerScope;
      this.service = projectsService;
      let fn = this._super.bind(this);
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
      let vm = this;
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
      const extraColumns = TableExtensionService.getColumns('projects-list');
      const baseColumns = [
        {
          title: gettext('Name'),
          render: function(row) {
            let href = $state.href('project.details', {uuid: row.uuid});
            return '<a href="{href}">{name}</a>'
                   .replace('{href}', href)
                   .replace('{name}', row.name);
          },
          index: 10,
        },
        {
          title: gettext('Description'),
          width: '200px',
          render: row => this.renderLongText(row.description),
          index: 20,
        },
        {
          title: gettext('Creation date'),
          render: function(row) {
            return $filter('dateTime')(row.created);
          },
          index: 30,
        },
        {
          title: gettext('VMs'),
          render: row => row.vm_count,
          index: 100,
        },
        {
          title: gettext('Storage'),
          render: row => row.storage_count,
          index: 110,
        },
        {
          title: gettext('Apps'),
          feature: ResourceFeatures.APPLICATIONS,
          render: row => row.app_count,
          index: 120,
        },
        {
          title: gettext('Private clouds'),
          render: row => row.private_cloud_count,
          index: 130,
        },
        {
          title: gettext('Estimated cost'),
          feature: 'projectCostDetails',
          render: row => $filter('defaultCurrency')(row.billing_price_estimate && row.billing_price_estimate.total),
          index: 310,
        },
      ];
      return baseColumns.concat(extraColumns).sort((a, b) => a.index - b.index);
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
      this.list.forEach(item => angular.extend(item, QuotaUtilsService.parseCounters(item)));
      this._super();
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
