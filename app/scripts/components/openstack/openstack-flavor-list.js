import template from './openstack-flavor-list.html';

export default function openstackFlavorList() {
  return {
    restrict: 'E',
    template: template,
    scope: {},
    bindToController: {
      choices: '=',
      value: '=',
      onChange: '&'
    },
    controller: function() {},
    controllerAs: '$ctrl',
  }
}
