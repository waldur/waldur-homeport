// @ngInject
export default function multiLineChart($window) {
  return {
    restrict: 'E',
    replace: true,
    template: '<div><div class="d3-multi-line-chart"></div></div>',
    scope: {
      data: '=chartData',
      controller: '=chartController'
    },
    link: link
  };

  function link(scope, element) {
    scope.$watch('data', function(data) {
      data && init();
    });

    angular.element($window).bind('resize', onResize);

    scope.$on('$destroy', function() {
      angular.element($window).unbind('resize', onResize);
    });

    function onResize() {
      scope.data && init();
    }

    function init() {
      element.children().html('');

      let margin = {top: 20, right: 80, bottom: 30, left: 50},
        width = element[0].getBoundingClientRect().width - margin.left - margin.right,
        height = 400 - margin.top - margin.bottom;

      let x = d3.time.scale()
        .range([0, width]);

      let y = d3.scale.linear()
        .range([height, 0]);

      let color = d3.scale.category10();

      let xAxis = d3.svg.axis()
        .scale(x).innerTickSize(-height).tickSubdivide(true)
        .orient('bottom');

      let yAxis = d3.svg.axis()
        .scale(y)
        .orient('left').innerTickSize(-width).tickSubdivide(true).ticks(5);

      let line = d3.svg.line()
        .interpolate('basis')
        .x(function(d) { return x(d.date); })
        .y(function(d) { return y(d.cpuUtilization); });

      let svg = d3.select(element.children()[0]).append('svg')
        .attr('width', width + margin.left + margin.right)
        .attr('height', height + margin.top + margin.bottom)
        .append('g')
        .attr('transform', 'translate(' + margin.left + ',' + margin.top + ')');

      let data = scope.data;

      color.domain(d3.keys(data[0]).filter(function(key) { return key !== 'date'; }));

      let cores = color.domain().map(function(name) {
        return {
          name: name,
          values: data.map(function(d) {
            return {date: d.date, cpuUtilization: +d[name]};
          })
        };
      });

      x.domain(d3.extent(data, function(d) { return d.date; }));

      y.domain([
        d3.min(cores, function(c) { return d3.min(c.values, function(v) { return v.cpuUtilization; }); }),
        d3.max(cores, function(c) { return d3.max(c.values, function(v) { return v.cpuUtilization; }); })
      ]);

      svg.append('g')
        .attr('class', 'x axis')
        .attr('transform', 'translate(0,' + height + ')')
        .call(xAxis);

      svg.append('g')
        .attr('class', 'y axis')
        .call(yAxis)
        .append('text')
        .attr('transform', 'rotate(-90)')
        .attr('y', 6)
        .attr('dy', '.71em')
        .style('text-anchor', 'end')
        .text('');

      let core = svg.selectAll('.core')
        .data(cores)
        .enter().append('g')
        .attr('class', 'core');

      core.append('path')
        .attr('class', 'line')
        .attr('d', function(d) { return line(d.values); })
        .style('stroke', function(d) { return color(d.name); });

      core.append('text')
        .datum(function(d) { return {name: d.name, value: d.values[d.values.length - 1]}; })
        .attr('transform', function(d) { return 'translate(' + x(d.value.date) + ',' + y(d.value.cpuUtilization) + ')'; })
        .attr('x', 3)
        .attr('dy', '.35em')
        .text(function(d) { return d.name; });
    }
  }
}
