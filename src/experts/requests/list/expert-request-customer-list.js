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
  $sanitize,
  currentStateService,
  expertBidsService,
  expertRequestsService,
  ExpertUtilsService,
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
          return this.loadExpertBids();
        }),
      ]);
    },
    loadExpertBids() {
      return expertBidsService.getAll({customer_uuid: this.customer.uuid}).then(bids => {
        this.expertBids = bids;
      });
    },
    getTableOptions: function() {
      return {
        searchFieldName: 'name',
        noDataText: gettext('There are no experts yet.'),
        noMatchesText: gettext('No experts found matching filter.'),
        enableOrdering: true,
        columns: this.getColumns(),
        rowActions: this.getRowActions(),
      };
    },
    getColumns: function() {
      return [
        {
          title: gettext('Organization'),
          orderField: 'customer_name',
          render: row => {
            const href = $state.href('organization.expertRequestDetails', {
              uuid: this.customer.uuid,
              requestId: row.uuid
            });
            return '<a href="{href}">{name}</a>'
              .replace('{href}', href)
              .replace('{name}', row.customer_name);
          }
        },
        {
          title: gettext('Type'),
          orderField: 'type',
          render: row => row.type_label
        },
        {
          title: gettext('Objectives'),
          orderable: false,
          render: row => {
            const tooltip = $sanitize(row.objectives).replace('\'', '\\\'');
            const label = $sanitize(row.objectives.substring(0, 30));
            return `<span uib-tooltip-html="'${tooltip}'">${label}</span>`;
          }
        },
        {
          title: gettext('State'),
          orderField: 'state',
          render: row => {
            const index = this.findIndexById(row);
            let submittedProposal = '';
            if (this.requestHasBids(row.uuid)) {
              submittedProposal = `<span class="m-l-sm">` +
                `<i class="fa fa-thumbs-o-up" uib-tooltip="${gettext('You have placed a proposal already.')}"></i></span>`;
            }
            return `<expert-request-state model="controller.list[${index}]"></expert-request-state>` + submittedProposal;
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
    requestHasBids: function(request_uuid) {
      return this.expertBids.filter(bid => bid.request_uuid === request_uuid)[0];
    },
    getRowActions: function() {
      let vm = this;
      let actions = [
        {
          title: gettext('Details'),
          iconClass: 'fa fa-info-circle',
          callback: request => ExpertUtilsService.showRequest(request),
        }
      ];
      if (this.isOwnerOrStaff) {
        actions.push({
          title: gettext('Create proposal'),
          iconClass: 'fa fa-plus',
          callback: expertRequest => ExpertUtilsService.createBid(expertRequest),
          isDisabled: row => {
            return row.state !== 'Pending' || vm.requestHasBids(row.uuid);
          },
          tooltip: function(row) {
            if (row.state !== 'Pending') {
              return gettext('Proposal could be created only for pending expert request.');
            } else if (vm.requestHasBids(row.uuid)) {
              return gettext('You have placed a proposal already.');
            }
          }
        });
      }

      return actions;
    },
    getUserFilter: function() {
      return {
        name: 'state',
        choices: [
          {
            title: gettext('Completed'),
            value: 'completed',
          },
          {
            title: gettext('Cancelled'),
            value: 'cancelled'
          },
          {
            title: gettext('Active'),
            value: 'active',
            chosen: true,
          },
          {
            title: gettext('Pending'),
            value: 'pending',
            chosen: true,
          }
        ]
      };
    },
  });
  controllerScope.__proto__ = new Controller();
}

export default expertRequestList;
