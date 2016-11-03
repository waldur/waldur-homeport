// @ngInject
export default function UserOrganizationsController(
  baseControllerListClass, customerPermissionsService, usersService) {
  var controllerScope = this;
  var ControllerListClass = baseControllerListClass.extend({
    init: function() {
      this.service = customerPermissionsService;
      this.controllerScope = controllerScope;
      this.tableOptions = {
        noDataText: 'No organizations yet',
        noMatchesText: 'No organizations found matching filter.',

        columns: [
          {
            title: 'Organization name',
            className: 'all',
            render: function(data, type, row, meta) {
              return row.customer_name;
            }
          }
        ]
      };
      this._super();
    },
    getFilter: function() {
      return {
        user_url: usersService.currentUser.url
      };
    }
  });

  controllerScope.__proto__ = new ControllerListClass();
}
