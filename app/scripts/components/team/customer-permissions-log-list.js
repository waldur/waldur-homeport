const customerPermissionsLogList = {
  templateUrl: 'views/partials/filtered-list.html',
  controller: customerPermissionsLogListController,
  controllerAs: 'ListController'
};

// @ngInject
function customerPermissionsLogListController(
  baseControllerListClass, customerPermissionsLogService, currentStateService, $filter) {
  var controllerScope = this;
  var controllerClass = baseControllerListClass.extend({
    init: function() {
      this.controllerScope = controllerScope;
      this.service = customerPermissionsLogService;
      this.currentCustomerUuid = currentStateService.getCustomerUuid();
      this.tableOptions = {
        searchFieldName: 'username',
        noDataText: 'You have no permissions yet.',
        noMatchesText: 'No permissions found matching filter.',
        columns: [
          {
            title: 'User',
            className: 'all',
            render: function(row) {
              return row.user_full_name || row.user_username;
            }
          },
          {
            title: 'User email',
            className: 'desktop',
            render: function(row) {
              return row.user_email;
            }
          },
          {
            title: 'Role',
            className: 'min-tablet-l',
            render: function(row) {
              return $filter('translate')(row.role);
            }
          },
          {
            title: 'Created',
            className: 'min-tablet-l',
            render: function(row) {
              return $filter('dateTime')(row.created);
            }
          },
          {
            title: 'Expiration time',
            className: 'min-tablet-l',
            render: function(row) {
              return $filter('dateTime')(row.expiration_time);
            }
          }
        ],
      };
      this._super();
    },
    getFilter: function() {
      return {
        customer_uuid: this.currentCustomerUuid
      };
    },
  });

  controllerScope.__proto__ = new controllerClass();
}

export default customerPermissionsLogList;
