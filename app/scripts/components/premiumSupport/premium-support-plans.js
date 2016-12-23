import template from './premium-support-plans.html';
import './premium-support-plans.scss';

export default function premiumSupportPlans() {
  return {
    restrict: 'E',
    template: template,
    scope: {},
    controller: function() {},
    controllerAs: '$ctrl',
    bindToController: {
      loading: '=',
      plans: '=',
      selected: '=',
      onSelect: '&'
    }
  };
}
