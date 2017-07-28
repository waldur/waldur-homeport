const expertRequestList = {
  templateUrl: 'views/partials/filtered-list.html',
  controllerAs: 'ListController',
  controller: ExpertRequestListController,
};

// @ngInject
function ExpertRequestListController(
  baseControllerListClass,
  $scope,
  $q,
  $state,
  $filter,
  $uibModal,
  currentStateService,
  expertRequestsService,
  customersService) {
  let controllerScope = this;
  let Controller = baseControllerListClass.extend({
    init: function() {
      this.controllerScope = controllerScope;
      this.service = expertRequestsService;
      let fn = this._super.bind(this);
      this.loadContext().then(() => {
        this.tableOptions = this.getTableOptions();
        fn();
        $scope.$emit('expertRequestCustomerList.initialized');
      });
    },
    loadContext: function() {
      return $q.all([
        customersService.isOwnerOrStaff().then(isOwnerOrStaff => {
          this.isOwnerOrStaff = isOwnerOrStaff;
        }),
        currentStateService.getCustomer().then(customer => {
          this.customer = customer;
        }),
      ]);
    },
    getTableOptions: function() {
      return {
        searchFieldName: 'name',
        noDataText: gettext('There are no requests for experts yet.'),
        noMatchesText: gettext('No requests for experts found matching filter.'),
        enableOrdering: true,
        columns: this.getColumns(),
        rowActions: this.getRowActions(),
      };
    },
    getColumns: function() {
      return [
        {
          title: gettext('Name'),
          orderField: 'name',
          render: row => {
            const href = $state.href('organization.expertRequestDetails', {
              uuid: this.customer.uuid,
              requestId: row.uuid
            });
            return '<a href="{href}">{name}</a>'
                   .replace('{href}', href)
                   .replace('{name}', row.name);
          }
        },
        {
          title: gettext('Organization'),
          orderField: 'customer_name',
          render: row => row.customer_name
        },
        {
          title: gettext('Project'),
          orderField: 'project_name',
          render: row => row.project_name
        },
        {
          title: gettext('Type'),
          orderField: 'type',
          render: row => row.type_label
        },
        {
          title: gettext('State'),
          orderField: 'state',
          render: row => {
            const index = this.findIndexById(row);
            return `<expert-request-state model="controller.list[${index}]"/>`;
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
    getRowActions: function() {
      let actions = [];
      if (this.isOwnerOrStaff) {
        actions.push({
          title: gettext('Create bid'),
          iconClass: 'fa fa-plus',
          callback: this.createBid.bind(this),
          isDisabled: row => row.state !== 'Pending',
          tooltip: function(row) {
            if (row.state !== 'Pending') {
              return gettext('Bid could be created only for pending expert request.');
            }
          }
        });
      }

      return actions;
    },
    createBid: function(expertRequest) {
      return $uibModal.open({
        component: 'expertBidCreateDialog',
        size: 'lg',
        resolve: {
          expertRequest: expertRequest,
        }
      });
    }
  });
  controllerScope.__proto__ = new Controller();
}

export default expertRequestList;
