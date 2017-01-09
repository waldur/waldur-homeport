export const customerUsersDetailsList = {
  controller: customerUsersDetailsListController,
  controllerAs: 'ListController',
  templateUrl: 'views/partials/filtered-list.html',
  bindings: {
    customer: '=',
    options: '='
  }
};

// @ngInject
function customerUsersDetailsListController(
    baseControllerListClass,
    usersService) {
  var controllerScope = this;
  var UsersController = baseControllerListClass.extend({
    init: function() {
      this.controllerScope = controllerScope;
      this.service = usersService;
      this._super();
      this.tableOptions = angular.extend(this.getTableOptions(), controllerScope.options);
    },
    getTableOptions: function() {
      return {
        noDataText: 'You have no users yet',
        noMatchesText: 'No users found matching filter.',
        searchFieldName: 'full_name',
        columns: [
          {
            title: 'Member',
            className: 'all',
            width: '20%',
            render: function(row) {
              var avatar = '<img gravatar-src="\'{gravatarSrc}\'" gravatar-size="100" alt="" class="avatar-img img-xs">'
                .replace('{gravatarSrc}', row.email);
              return avatar + ' ' + (row.full_name || row.username);
            }
          },
          {
            title: 'E-mail',
            className: 'min-tablet-l',
            render: function(row) {
              return row.email;
            }
          },
          {
            title: 'Civil number',
            className: 'min-tablet-l',
            render: function(row) {
              return row.civil_number || 'N/A';
            }
          },
          {
            title: 'Phone number',
            className: 'min-tablet-l',
            render: function(row) {
              return row.phone_number || 'N/A';
            }
          },
          {
            title: 'Preferred language',
            className: 'min-tablet-l',
            render: function(row) {
              return row.preferred_language || 'N/A';
            }
          },
          {
            title: 'Competence',
            className: 'min-tablet-l',
            render: function(row) {
              return row.competence || 'N/A';
            }
          },
          {
            title: 'Job position',
            className: 'min-tablet-l',
            render: function(row) {
              return row.job_title || 'N/A';
            }
          },
        ],
      };
    },
    getList: function(filter) {
      return this._super(angular.extend({
        customer_uuid: controllerScope.customer.uuid
      }, filter));
    },
  });

  controllerScope.__proto__ = new UsersController();
}
