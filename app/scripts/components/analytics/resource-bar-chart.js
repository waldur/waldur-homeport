import Chart from 'chart.js';
import template from './resource-bar-chart.html';

export default function resourceBarChart() {
  return {
    restrict: 'E',
    scope: {
      items: '=',
      labels: '=',
    },
    template: template,
    link: function(scope, element) {
      // @ngInject
      const ctx = element[0].querySelector('canvas');
      new Chart(ctx, {
        type: 'horizontalBar',
        data: {
          labels: scope.labels,
          datasets: scope.items
        },
        options: {
          legend: {
            display: false
          },
          scales: {
            xAxes: [{
              stacked: true
            }],
            yAxes: [{
              stacked: true,
            }]
          }
        }
      });
    }
  };
}
