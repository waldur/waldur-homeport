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
        noDataText: gettext('You have no permissions yet.'),
        noMatchesText: gettext('No permissions found matching filter.'),
        columns: [
          {
            title: gettext('User'),
            className: 'all',
            render: row => row.user_full_name || row.user_username
          },
          {
            title: gettext('User email'),
            className: 'desktop',
            render: row => row.user_email
          },
          {
            title: gettext('Role'),
            className: 'min-tablet-l',
            render: row => $filter('translate')(row.role)
          },
          {
            title: gettext('Created'),
            className: 'min-tablet-l',
            render: row => $filter('dateTime')(row.created)
          },
          {
            title: gettext('Expiration time'),
            className: 'min-tablet-l',
            render: row => $filter('dateTime')(row.expiration_time)
          }
        ],
      };
      this._super();
    },
    getFilter: function() {
      return {
        customer: this.currentCustomerUuid
      };
    },
  });

  controllerScope.__proto__ = new controllerClass();
}

export default customerPermissionsLogList;
