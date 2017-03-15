export const customerUsersDetailsList = {
  controller: customerUsersDetailsListController,
  controllerAs: 'ListController',
  templateUrl: 'views/partials/filtered-list.html',
  bindings: {
    customer: '<',
    options: '<'
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
        noDataText: gettext('You have no users yet'),
        noMatchesText: gettext('No users found matching filter.'),
        searchFieldName: 'full_name',
        columns: [
          {
            title: gettext('Member'),
            className: 'all',
            width: '20%',
            render: function(row) {
              var avatar = '<img gravatar-src="\'{gravatarSrc}\'" gravatar-size="100" alt="" class="avatar-img img-xs">'
                .replace('{gravatarSrc}', row.email);
              return avatar + ' ' + (row.full_name || row.username);
            }
          },
          {
            title: gettext('E-mail'),
            className: 'min-tablet-l',
            render: function(row) {
              return row.email;
            }
          },
          {
            title: gettext('Civil number'),
            className: 'min-tablet-l',
            render: function(row) {
              return row.civil_number || 'N/A';
            }
          },
          {
            title: gettext('Phone number'),
            className: 'min-tablet-l',
            render: function(row) {
              return row.phone_number || 'N/A';
            }
          },
          {
            title: gettext('Preferred language'),
            className: 'min-tablet-l',
            render: function(row) {
              return row.preferred_language || 'N/A';
            }
          },
          {
            title: gettext('Competence'),
            className: 'min-tablet-l',
            render: function(row) {
              return row.competence || 'N/A';
            }
          },
          {
            title: gettext('Job position'),
            className: 'min-tablet-l',
            render: function(row) {
              return row.job_title || 'N/A';
            }
          },
        ],
      };
    },
    getFilter: function() {
      return { customer_uuid: controllerScope.customer.uuid };
    }
  });

  controllerScope.__proto__ = new UsersController();
}
