// @ngInject
export default function pieChart($state) {
  return {
    restrict: 'E',
    replace: true,
    template: '<div><div class="d3-pie-chart"></div></div>',
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

    function init() {
      scope.currentCustomer = scope.controller.currentCustomer;
      element.children().html('');
      var dataset = scope.data.data,
        chartType = scope.data.chartType,
        legendDescription = scope.data.legendDescription,
        legendLink = scope.data.legendLink;

      var width = scope.data.chartWidth || 500;
      var height = 200;
      var radius = Math.min(width, height) / 2;

      var color;
      switch (chartType) {
      case 'vms':
        color = d3.scale.category10();
        break;
      case 'services':
        color = d3.scale.category20();
        break;
      default:
        color = d3.scale.category20();
        break;
      }

      var transformWidth = chartType === 'services' ? 2 : 3;
      var svg = d3.select(element.children()[0])
        .append('svg')
        .attr('width', width)
        .attr('height', height)
        .append('g')
        .attr('transform', 'translate(' + (width / transformWidth) +
          ',' + (height / 2) + ')');

      var arc = d3.svg.arc()
        .outerRadius(radius);

      var pie = d3.layout.pie()
        .value(function(d) { return d.count; })
        .sort(null);

      var div = d3.select('body').append('div')
        .attr('class', 'chart-tooltip')
        .style('opacity', 0);

      // path
      svg.selectAll('path')
        .data(pie(dataset))
        .enter()
        .append('path')
        .attr('d', arc)
        .attr('value', function(d) { return d.data.fullLabel || d.data.label; })
        .attr('fill', function(d) {
          return color(d.data.label);
        }).on('mouseenter', function() {
          var name = d3.event.toElement.getAttribute('value');
          div.transition()
            .duration(200)
            .style('opacity', .9)
            .style('display', 'block');
          div.html(name)
            .style('left', (d3.event.pageX) + 'px')
            .style('top', (d3.event.pageY) + 'px');
        })
        .on('mouseout', function() {
          div.transition()
            .style('display', 'none');
        });

      var legendRectSize = 18;
      var legendSpacing = 4;

      if (chartType === 'services') {
        var htmlLegend = d3.select('#monthCostChartLegend');
        var elem = htmlLegend.selectAll('div')
          .data(color.domain())
          .enter()
          .append('div');
        elem.append('div')
          .style('background-color', color)
          .style('width', legendRectSize + 'px')
          .style('height', legendRectSize + 'px')
          .style('float', 'left');
        elem.append('div')
          .style('text-align', 'left')
          .style('float', 'left')
          .style('padding-left', '5px')
          .style('padding-right', '5px')
          .style('max-width', '180px')
          .text(function(d, i) { return dataset[i].fullLabel;});
        elem.append('div')
          .style('clear', 'both');
      } else {
        var legend = svg.selectAll('.legend')
          .data(color.domain())
          .enter()
          .append('g')
          .attr('class', 'legend')
          .attr('transform', function(d, i) {
            var height = legendRectSize + legendSpacing;
            var offset = height * color.domain().length / 2;
            var horz = 2 * 60;
            var vert = i * height - offset;
            return 'translate(' + horz + ',' + (i ? vert + 6 * i : vert) + ')';
          });

        legend.append('rect')
          .attr('width', legendRectSize)
          .attr('height', legendRectSize)
          .style('fill', color);

        legend.append('text')
          .attr('x', legendRectSize + legendSpacing)
          .attr('y', legendRectSize - legendSpacing)
          .on('click', function(d, i) {
            var link = null;
            switch (dataset[i].name) {
            case 'apps':
              link = 'applications';
              break;
            case 'vms':
              link = 'vms';
              break;
            case 'plans':
              link = 'plans';
              break;
            case 'providers':
              link = 'providers';
              break;
            default:
              link = null;
              break;
            }
            link && (link !== 'plans') &&
            $state.go('organization.details', {uuid: scope.currentCustomer.uuid, tab: link});
            link && (link === 'plans') &&
            $state.go('organization.plans', {uuid: scope.currentCustomer.uuid});
          })
          .on('mouseover', function() { element.css( 'cursor', 'pointer' ); })
          .on('mouseout', function() { element.css( 'cursor', 'default' ); })
          .text(function(d) { return d; });
      }

      htmlLegend && appendTotal(htmlLegend);
      legend && appendTotal(svg);

      function appendTotal(elem) {
        elem.append('div')
          .style('text-align', 'left')
          .append('text')
          .on('click', function() {
            switch (legendLink) {
            case 'plans':
              $state.go('organization.plans', {uuid: scope.currentCustomer.uuid});
              break;
            case 'providers':
              $state.go('organization.details', {uuid: scope.currentCustomer.uuid, tab: legendLink});
              break;
            default:
              break;
            }
          })
          .text(legendDescription).attr('transform', function() {
            var offset = (legend && legend[0].length) <= 1 ? 5 : 0,
              height = legend ? (legendRectSize + legendSpacing) * legend[0].length + offset :
            (legendRectSize + legendSpacing) + offset,
              horz = 2 * 60;
            return 'translate(' + horz + ',' + height + ')';
          });
      }
    }
  }
}
