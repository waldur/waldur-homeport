import './vertical-bar-chart.scss';

// @ngInject
export default function verticalBarChart($window) {
  return {
    restrict: 'E',
    replace: true,
    template: '<div class="vertical-bar-chart-wrapper"><div class="d3-bar-chart"></div></div>',
    scope: {
      data: '=chartData'
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

      let data = scope.data;

      let margin = {top: 20, right: 20, bottom: 90, left: 80},
        width = element[0].getBoundingClientRect().width - margin.left - margin.right,
        height = 300 - margin.top - margin.bottom;

      let x = d3.scale.ordinal().rangeRoundBands([0, width], .05);

      let y = d3.scale.linear().range([height, 0]);

      let xAxis = d3.svg.axis()
        .scale(x)
        .orient('bottom')
        .tickFormat(d3.time.format('%B'));

      let yAxis = d3.svg.axis()
        .scale(y)
        .orient('left')
        .ticks(10);

      let svg = d3.select(element.children()[0]).append('svg')
        .attr('width', width + margin.left + margin.right)
        .attr('height', height + margin.top + margin.bottom)
        .append('g')
        .attr('transform',
        'translate(' + margin.left + ',' + margin.top + ')');

      x.domain(data.map(function(d) { return d.date; }));
      y.domain([0, 100]);

      svg.append('g')
          .attr('class', 'x axis')
          .attr('transform', 'translate(0,' + height + ')')
          .call(xAxis)
          .selectAll('text')
          .style('text-anchor', 'end')
          .attr('dx', '-.8em')
          .attr('dy', '-.55em')
          .attr('transform', 'rotate(-90)' );

      svg.append('g')
          .attr('class', 'y axis')
          .call(yAxis)
          .append('text')
          .attr('transform', 'rotate(-90)')
          .attr('y', -50)
          .attr('x', -50)
          .attr('dy', '.71em')
          .style('text-anchor', 'end')
          .text('SLA (%)');

      svg.selectAll('bar')
        .data(data)
        .enter().append('rect')
        .style('fill', 'red')
        .attr('x', function(d) { return x(d.date); })
        .attr('width', x.rangeBand())
        .attr('y', 0)
        .attr('height', function() {
          return height;
        });

      let barGroups = svg.selectAll('bar')
        .data(data)
        .enter().append('g')
        .attr('width', x.rangeBand())
        .attr('transform', function(d) {
          return 'translate(' + x(d.date) + ',' + y(d.value) + ')';
        });
      barGroups.append('rect')
        .style('fill', '#28ae60')
        .attr('width', x.rangeBand())
        .attr('height', function(d) {
          return height - y(d.value);
        });
      barGroups.append('text')
        .attr('x', function(d) {
          return (d.value < 10 ? x.rangeBand() / 2 : x.rangeBand() / 3) - 3;
        })
        .attr('y', function(d) {
          return d.value ? d.value + 5 : d.value;
        })
        .style('font-size', function() {
          let size = x.rangeBand() / 3;
          return size > 120 ? 120 : size;
        })
        .attr('width', x.rangeBand())
        .attr('class', 'bar-info')
        .attr('fill', '#fff')
        .text(function(d) {
          return d.value;
        });
    }
  }
}
