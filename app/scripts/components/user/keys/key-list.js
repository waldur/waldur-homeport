export default function keyList() {
  return {
    restrict: 'E',
    templateUrl: 'views/partials/filtered-list.html',
    controller: KeyListController,
    controllerAs: 'ListController',
    scope: {}
  };
}

// @ngInject
function KeyListController(
  $stateParams,
  keysService,
  baseControllerListClass,
  usersService,
  $state) {
  var controllerScope = this;
  var Controller = baseControllerListClass.extend({
    init: function() {
      this.controllerScope = controllerScope;
      this.service = keysService;
      this._super();

      this.tableOptions = {
        searchFieldName: 'name',
        noDataText: 'No SSH keys yet.',
        noMatchesText: 'No SSH keys found matching filter.',
        columns: [
          {
            title: 'Title',
            className: 'all',
            render: function(row) {
              return row.name;
            }
          },
          {
            title: 'Fingerprint',
            className: 'min-tablet-l',
            render: function(row) {
              return row.fingerprint;
            }
          }
        ],
        rowActions: this.getRowActions(),
        tableActions: this.getTableActions()
      };
    },
    getRowActions: function() {
      if (this.isStaffOrSelf()) {
        return [
          {
            name: '<i class="fa fa-trash"></i> Remove',
            callback: this.remove.bind(controllerScope)
          }
        ];
      }
    },
    getTableActions: function() {
      if (this.isStaffOrSelf()) {
        return [
          {
            name: '<i class="fa fa-plus"></i> Add SSH key',
            callback: function() {
              $state.go('keys.create');
            }
          }
        ];
      }
    },
    isStaffOrSelf: function() {
      return angular.isUndefined($stateParams.uuid) ||
             usersService.currentUser.uuid === $stateParams.uuid ||
             usersService.currentUser.is_staff;
    },
    getList: function(filter) {
      this.service.defaultFilter.user_uuid = $stateParams.uuid || usersService.currentUser.uuid;
      return this._super(filter);
    }
  });
  controllerScope.__proto__ = new Controller();
}
