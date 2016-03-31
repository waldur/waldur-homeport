'use strict';

(function () {
    angular.module('ncsaas')
        .directive('pieChart', ['$state', 'currentStateService', pieChart]);

    function pieChart($state, currentStateService) {
        return {
            restrict: 'E',
            replace: true,
            templateUrl: 'views/directives/pie-chart.html',
            scope: {
                data: '=chartData',
                height: '=chartHeight',
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

                var width = 400;
                var height = 200;
                var radius = Math.min(width, height) / 2;

                //var color = d3.scale.category20c();
                var color;
                switch (chartType) {
                    case 'vms':
                        color = d3.scale.category20c();
                        break;
                    case 'services':
                        color = d3.scale.category10();
                        break;
                    default:
                        color = d3.scale.category20c();
                        break;
                }

                var svg = d3.select(element.children()[0])
                    .append('svg')
                    .attr('width', width)
                    .attr('height', height)
                    .append('g')
                    .attr('transform', 'translate(' + (width / 3) +
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


                var legendRectSize = 18;                                  
                var legendSpacing = 4;

                var legend = svg.selectAll('.legend')                     
                    .data(color.domain())                                   
                    .enter()                                                
                    .append('g')                                            
                    .attr('class', 'legend')                                
                    .attr('transform', function(d, i) {
                        var height = legendRectSize + legendSpacing;
                        var offset =  height * color.domain().length / 2;
                        var horz = 2 * 60;
                        var vert = i * height - offset;
                        return 'translate(' + horz + ',' + (i ? vert + 6 * i : vert) + ')';
                    });

                legend.append('rect')
                    .attr('width', legendRectSize)
                    .attr('height', legendRectSize)
                    .style('fill', color)
                    .style('stroke', color);

                legend.append('text')
                    .attr('x', legendRectSize + legendSpacing)
                    .attr('y', legendRectSize - legendSpacing)
                    .on("click", function(d, i) {
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
                            $state.go('organizations.details', {uuid: scope.currentCustomer.uuid, tab: link});
                        link && (link === 'plans') &&
                            $state.go('organizations.plans', {uuid: scope.currentCustomer.uuid});
                    })
                    .on("mouseover", function(d) { element.css( 'cursor', 'pointer' ); })
                    .on("mouseout", function(d) { element.css( 'cursor', 'default' ); })
                    .text(function(d) { return d; });

                svg.append('text')
                    .on("click", function(d, i) {
                        switch (legendLink) {
                            case 'plans':
                                $state.go('organizations.plans', {uuid: scope.currentCustomer.uuid});
                                break;
                            case 'providers':
                                $state.go('organizations.details', {uuid: scope.currentCustomer.uuid, tab: legendLink});
                                break;
                            default:
                                break;
                        }
                    })
                    .text(legendDescription).attr('transform', function() {
                    var offset = legend[0].length <= 1 ? 5 : 0,
                        height = (legendRectSize + legendSpacing) * legend[0].length + offset,
                        horz = 2 * 60;
                    return 'translate(' + horz + ',' + height + ')';
                });
            }
        }
    }
}());
