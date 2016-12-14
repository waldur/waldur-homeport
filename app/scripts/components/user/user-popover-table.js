import template from './user-popover-table.html';

export default function userPopoverTable() {
  return {
    restrict: 'E',
    template: template,
    controller: function() {},
    controllerAs: '$ctrl',
    scope: {},
    bindToController: {
      user: '='
    }
  };
}
