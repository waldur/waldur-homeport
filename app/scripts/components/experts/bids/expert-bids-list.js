
const expertBidsList = {
  templateUrl: 'views/partials/filtered-list.html',
  controllerAs: 'ListController',
  controller: ExpertBidsList,
};

// @ngInject
function ExpertBidsList(
  baseControllerListClass,
  $q,
  $scope,
  $state,
  $timeout,
  $filter,
  $uibModal,
  ExpertBidUtilsService,
  customersService,
  currentStateService,
  expertRequestsService,
  expertBidsService) {
  let controllerScope = this;
  let Controller = baseControllerListClass.extend({
    init: function() {
      this.controllerScope = controllerScope;
      this.service = expertBidsService;
      let fn = this._super.bind(this);
      $scope.$on('refreshBidsList', function() {
        $timeout(function() {
          controllerScope.resetCache();
        });
      });
      this.loadContext().then(() => {
        this.tableOptions = this.getTableOptions();
        fn();
      });
    },
    loadContext: function() {
      return $q.all([
        currentStateService.getProject().then(project => {
          this.project = project;
        }),
        expertRequestsService.$get($state.params.requestId).then(expertRequest => {
          this.expertRequest = expertRequest;
        }),
        customersService.isOwnerOrStaff()
          .then(canManageRequest => this.canManageRequest = canManageRequest),
      ]);
    },
    getTableOptions: function() {
      return {
        searchFieldName: 'team_name',
        disableSearch: true,
        noDataText: gettext('There are no bids yet.'),
        enableOrdering: false,
        columns: this.getColumns(),
        rowActions: this.getRowActions(),
        actionsColumnWidth: '200px',
      };
    },
    getColumns: function() {
      return [
        {
          title: gettext('Organization'),
          render: row => row.customer_name,
        },
        {
          title: gettext('Team'),
          render: row => row.team_name,
        },
        {
          title: gettext('Price'),
          render: row => $filter('defaultCurrency')(row.price) || 'N/A',
        },
        {
          title: gettext('Created'),
          render: row => $filter('dateTime')(row.created) || 'N/A'
        },
      ];
    },
    getRowActions: function() {
      let expertRequest = this.expertRequest;

      if (this.canManageRequest) {
        return [
          {
            title: gettext('View details'),
            iconClass: 'fa fa-info',
            callback: row => {
              $uibModal.open({
                component: 'expert-bid',
                resolve: {
                  bid: () => row,
                  expertRequest: () => expertRequest,
                }
              });
            },
          },
          {
            title: gettext('Accept'),
            iconClass: 'fa fa-check',
            callback: row => {
              return ExpertBidUtilsService.acceptBid(row.url);
            },
          }
        ];
      }
    },
    getFilter: function() {
      return {
        request_uuid: this.expertRequest.uuid,
      };
    },

  });
  controllerScope.__proto__ = new Controller();
}

export default expertBidsList;
