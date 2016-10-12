import template from './sparkline.html';
import './sparkline.scss';

export default function sparkline() {
  return {
    restrict: 'E',
    scope: {
      sparkData: '=',
    },
    template: template,
    link: function(scope) {
      var max = Math.max.apply(null, scope.sparkData.map(function(item) {
        return item.value || 0;
      }));
      scope.items = scope.sparkData.map(function(item) {
        return angular.extend({}, item, {
          relative: max && Math.round(item.value * 100 / max)
        });
      });
    }
  };
}
