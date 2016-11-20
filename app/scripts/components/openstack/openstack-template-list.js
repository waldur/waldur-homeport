import template from './openstack-template-list.html';

export default function openstackTemplateList() {
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
