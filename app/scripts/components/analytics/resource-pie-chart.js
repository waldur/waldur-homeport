import Chart from 'chart.js';
import template from './resource-pie-chart.html';
import './resource-pie-chart.scss';

export default function resourcePieChart() {
  return {
    restrict: 'E',
    scope: {
      items: '='
    },
    template: template,
    link: function(scope, element) {
      // @ngInject
      scope.$watch('items', () => scope.total = scope.items.reduce(
        (accum, item) => accum + item.value, 0));
      const ctx = element[0].querySelector('canvas');
      new Chart(ctx, {
        type: 'pie',
        data: {
          labels: scope.items.map(item => item.label),
          datasets: [{
            data: scope.items.map(item => item.value),
            backgroundColor: scope.items.map(item => item.color)
          }]
        },
        options: {
          maintainAspectRatio: false,
          legend: {
            display: false
          }
        }
      });
    }
  };
}
