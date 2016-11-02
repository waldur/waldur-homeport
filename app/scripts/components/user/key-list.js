// @ngInject
export default function KeyListController(
  $stateParams,
  keysService,
  baseControllerListClass,
  currentUser,
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
            render: function(data, type, row, meta) {
              return row.name;
            }
          },
          {
            title: 'Fingerprint',
            render: function(data, type, row, meta) {
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
             currentUser.uuid === $stateParams.uuid ||
             currentUser.is_staff;
    },
    getList: function(filter) {
      this.service.defaultFilter.user_uuid = $stateParams.uuid || currentUser.uuid;
      return this._super(filter);
    }
  });
  controllerScope.__proto__ = new Controller();
}
