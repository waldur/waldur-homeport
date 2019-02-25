import template from './hook-details.html';

import store from '@waldur/store/store';
import { createEntity, updateEntity } from '@waldur/table-react/actions';
import { hooksListTable } from '@waldur/user/hooks/constants';

export default function hookDetails() {
  return {
    restrict: 'E',
    template: template,
    controller: HookDetailsController,
    controllerAs: 'HookController',
    scope: {},
    bindToController: {
      dismiss: '&',
      close: '&',
      resolve: '='
    }
  };
}

// @ngInject
function HookDetailsController(hooksService, eventsService, ncUtilsFlash, $filter) {
  let vm = this;
  vm.save = save;

  function init() {
    vm.hook = vm.resolve.hook;
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
        };
      });
    }).finally(function() {
      vm.loading = false;
    });
  }

  function getSelected() {
    return vm.choices.filter(function(choice) {
      return choice.selected;
    }).map(function(choice) {
      return choice.id;
    });
  }

  function save() {
    let promise, message;
    vm.instance.event_groups = getSelected();
    if (vm.instance.uuid) {
      promise = hooksService.update(vm.instance);
      message = gettext('Notification has been updated.');
    } else {
      promise = hooksService.create(vm.instance);
      message = gettext('Notification has been created.');
    }
    return promise.then(function(data) {
      let action = {};
      if (vm.instance.uuid) {
        action = updateEntity(hooksListTable, data.uuid, data);
      } else {
        action = createEntity(hooksListTable, data.uuid, data);
      }
      store.dispatch(action);
      ncUtilsFlash.success(message);
      vm.close();
    }, function(response) {
      vm.errors = response.data;
    });
  }
  init();
}
