import template from './openstack-image-list.html';

export default function openstackImageList() {
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
