'use strict';

(function() {

  angular.module('ncsaas')
    .directive('sparkline', sparkline);

  function sparkline() {
    return {
      restrict: 'E',
      scope: {
        sparkData: '=',
      },
      template: '<div/>',
      link: function(scope, element, attrs) {
        var width = 330;
        var height = 60;
        var x = d3.scale.linear().range([0, width]);
        var y = d3.scale.linear().range([height, 0]);
        var line = d3.svg.line()
                     .interpolate("basis")
                     .x(function(d) { return x(d.date); })
                     .y(function(d) { return y(d.value); });

        function sparkline(data) {
          x.domain(d3.extent(data, function(d) { return d.date; }));
          y.domain(d3.extent(data, function(d) { return d.value; }));

          d3.select(element.children()[0])
            .append('svg')
            .attr('width', width)
            .attr('height', height)
            .attr('class', 'full-width')
            .append('path')
            .datum(data)
            .attr('class', 'sparkline')
            .attr('d', line);
        }

        scope.$watch('sparkData', function(data) {
          if (!data) {
            return;
          }
          element.children().html('');
          sparkline(data);
        });
      }
    };
  }
})();

