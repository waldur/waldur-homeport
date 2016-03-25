'use strict';

(function () {
    angular.module('ncsaas')
        .directive('pieChart', pieChart);

    function pieChart() {
        return {
            restrict: 'E',
            replace: true,
            templateUrl: 'views/directives/pie-chart.html',
            scope: {
                data: '=chartData',
                height: '=chartHeight'
            },
            link: link
        };

        function link(scope, element) {
            scope.$watch('data', function(data) {
                data && init();
            });

            function init() {
                element.children().html('');
                var dataset = scope.data;

                var width = 200;
                var height = 200;
                var radius = Math.min(width, height) / 2;

                var color = d3.scale.category20c();

                var svg = d3.select(element.children()[0])
                    .append('svg')
                    .attr('width', width)
                    .attr('height', height)
                    .append('g')
                    .attr('transform', 'translate(' + (width / 2) +
                        ',' + (height / 2) + ')');

                var arc = d3.svg.arc()
                    .outerRadius(radius);

                var pie = d3.layout.pie()
                    .value(function(d) { return d.count; })
                    .sort(null);

                var path = svg.selectAll('path')
                    .data(pie(dataset))
                    .enter()
                    .append('path')
                    .attr('d', arc)
                    .attr('fill', function(d, i) {
                        return color(d.data.label);
                    });
            }
        }
    }
}());
