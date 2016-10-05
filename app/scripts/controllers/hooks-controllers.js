'use strict';

(function() {
  angular.module('ncsaas')
    .controller('HookListController', [
      'baseControllerListClass',
      '$filter',
      '$uibModal',
      '$rootScope',
      'hooksService',
      HookListController
    ]);

  function HookListController(
    baseControllerListClass,
    $filter,
    $uibModal,
    $rootScope,
    hooksService) {
    var controllerScope = this;
    var Controller = baseControllerListClass.extend({
      init: function() {
        this.controllerScope = controllerScope;
        this.service = hooksService;
        this._super();

        this.tableOptions = {
          noDataText: 'No notifications registered.',
          noMatchesText: 'No notifications found matching filter.',
          columns: [
            {
              title: 'State',
              className: 'text-center',
              render: function(data, type, row, meta) {
                var cls = row.is_active && 'online' || '';
                var title = row.is_active && 'Enabled' || 'Disabled';
                return '<a class="status-circle {cls}" title="{title}"></a>'
                          .replace('{cls}', cls).replace('{title}', title);
              },
              width: '40px'
            },
            {
              title: 'Method',
              render: function(data, type, row, meta) {
                return row.label;
              }
            },
            {
              title: 'Destination',
              render: function(data, type, row, meta) {
                return row.destination;
              }
            },
            {
              title: 'Events',
              render: function(data, type, row, meta) {
                return row.events;
              }
            }
          ],
          tableActions: [
            {
              name: '<i class="fa fa-plus"></i> Add notification',
              callback: this.openDialog.bind(controllerScope)
            }
          ],
          rowActions: [
            {
              name: '<i class="fa fa-pencil"></i> Edit',
              callback: this.openDialog.bind(controllerScope)
            },
            {
              name: '<i class="fa fa-trash"></i> Remove',
              className: 'danger',
              callback: this.remove.bind(controllerScope)
            },
          ]
        };
      },

      openDialog: function(hook) {
        var scope = $rootScope.$new();
        scope.hook = hook;
        $uibModal.open({
          templateUrl: 'views/profile/hook-dialog.html',
          controller: 'HookDialogController',
          controllerAs: 'HookController',
          bindToController: true,
          scope: scope
        }).result.then(function() {
          controllerScope.resetCache();
        });
      },

      removeInstance: function(hook) {
        return this.service.$deleteByUrl(hook.url);
      },

      search: function() {
        var vm = this,
          searchInput = vm.searchInput.toLowerCase();

        vm.list = vm.service.list.filter(function(item) {
          if (
            item.label.toLowerCase().indexOf(searchInput) >= 0
            || item.destination.toLowerCase().indexOf(searchInput) >= 0
          ) {
            return item;
          }
        });
      },

      afterGetList: function() {
        this.list.forEach(function(item) {
          item.label = $filter('titleCase')(item.hook_type);
          item.destination = item.destination_url || item.email;
          item.events = item.event_groups.map($filter('formatEventTitle')).join(', ');
        });
        this.service.list = this.list;
      }
    });
    Object.setPrototypeOf(controllerScope, new Controller());
  }
})();

(function() {
  angular.module('ncsaas').filter('formatEventTitle', ['$filter', formatEventTitle]);
  function formatEventTitle($filter) {
    return function(choice) {
      var map = {
        ssh: 'SSH',
        jira: 'JIRA',
        vms: 'Resources',
        customers: 'Organizations'
      };
      if (map[choice]) {
        choice = map[choice];
      } else {
        choice = $filter('titleCase')(choice.replace('_', ' '));
      }
      return choice + ' events';
    }
  }
})();

(function() {
  angular.module('ncsaas')
    .controller('HookDialogController', [
      'hooksService', 'eventsService', 'ncUtilsFlash', '$filter',
      HookDialogController]);

  function HookDialogController(hooksService, eventsService, ncUtilsFlash, $filter) {
    var vm = this;
    vm.save = save;

    function init() {
      loadEventGroups();
      vm.types = hooksService.getTypes();
      if (vm.hook) {
        vm.instance = angular.copy(vm.hook);
      } else {
        vm.instance = {
          hook_type: 'webhook',
          event_groups: []
        };
      }
    }

    function loadEventGroups() {
      vm.loading = true;
      eventsService.getEventGroups().then(function(groups) {
        vm.choices = Object.keys(groups).sort().map(function(choice) {
          return {
            id: choice,
            title: $filter('formatEventTitle')(choice),
            selected: vm.instance.event_groups.indexOf(choice) !== -1,
            help_text: groups[choice].join(', ')
          }
        });
      }).finally(function() {
        vm.loading = false;
      });
    }

    function getSelected() {
      return vm.choices.filter(function(choice) {
        return choice.selected
      }).map(function(choice) {
        return choice.id;
      });
    }

    function save() {
      var promise, message;
      vm.instance.event_groups = getSelected();
      if (vm.instance.uuid) {
        promise = hooksService.update(vm.instance);
        message = 'Notification has been updated'
      } else {
        promise = hooksService.create(vm.instance);
        message = 'Notification has been created';
      }
      return promise.then(function() {
        ncUtilsFlash.success(message);
        vm.$close();
      }, function(response) {
        vm.errors = response.data;
      });
    }
    init();
  }
})();
