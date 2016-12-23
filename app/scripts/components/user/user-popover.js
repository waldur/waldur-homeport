import template from './user-popover.html';

export default function userPopover() {
  return {
    restrict: 'E',
    template: template,
    controller: UserPopoverController,
    controllerAs: '$ctrl',
    scope: {},
    bindToController: {
      dismiss: '&',
      close: '&',
      resolve: '='
    }
  };
}

function UserPopoverController() {
  this.user = this.resolve.user;
}
