import template from './user-popover.html';

export default function userPopover() {
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
