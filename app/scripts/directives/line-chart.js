'use strict';

(function () {
  angular.module('ncsaas')
    .directive('lineChart', lineChart);

  function lineChart() {
    return {
      restrict: 'E',
      replace: true,
      templateUrl: 'views/directives/line-chart.html',
      scope: {
        data: '=chartData',
        height: '=chartHeight',
        bottom: '=chartBottom'
      },
      link: link
    };

    function link(scope, element) {
      scope.$watch('data', init);

      function init() {
        element.children().html('');
        var m = [10, 40, (scope.bottom || 80), 60]; // margins
        var w = element[0].getBoundingClientRect().width - m[1] - m[3]; // width
        var h = (scope.height || 270) - m[0] - m[2]; // height

        var data = scope.data.y;
        var max = d3.max(data, function(d) { return d; });

        var x = d3.time.scale().range([0, w]);
        x.domain(d3.extent(data, function(d) { return d; }));

        x = d3.scale.linear().domain([0, data.length]).range([0, w]);

        var y = d3.scale.linear().domain([0, max]).range([h, 0]);
        var line = d3.svg.line()
          .x(function(d,i) {
            return x(i);
          })
          .y(function(d) {
            return y(d);
          });

        var graph = d3.select(element.children()[0]).append("svg:svg")
          .attr("width", w + m[1] + m[3])
          .attr("height", h + m[0] + m[2])
          .append("svg:g")
          .attr("transform", "translate(" + m[3] + "," + m[0] + ")");

        var xAxis = d3.svg.axis().scale(x).tickSize(-h).tickSubdivide(true)
          .tickFormat(function(d) {
            return scope.data.x[d];
          });

        graph.append("svg:g")
          .attr("class", "x axis")
          .attr("transform", "translate(0," + h + ")")
          .call(xAxis)
          .selectAll("text")
          .style("text-anchor", "end")
          .style("font-size", "12px")
          .attr("dx", "-.8em")
          .attr("dy", ".15em")
          .attr("transform", "rotate(-65)" );


        var yAxisLeft = d3.svg.axis().scale(y).ticks(4).orient("left");
        graph.append("svg:g")
          .attr("class", "y axis")
          .attr("transform", "translate(-25,0)")
          .call(yAxisLeft);

        graph.append("svg:path").attr("d", line(data));
      }
    }
  }
}());
