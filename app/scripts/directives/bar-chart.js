'use strict';

(function () {
    angular.module('ncsaas')
        .directive('barChart', ['$state', barChart]);

    function barChart($state) {
        return {
            restrict: 'E',
            replace: true,
            templateUrl: 'views/directives/bar-chart.html',
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
                element.children().html('');
                scope.currentCustomer = scope.controller.currentCustomer;

                var margins = {
                        top: 12,
                        left: 200,
                        right: 24,
                        bottom: 24
                    },
                    legendPanel = {
                        width: 180
                    },
                    width = 1200 - margins.left - margins.right - legendPanel.width,
                    height = 250 - margins.top - margins.bottom,
                    dataset = scope.data.data,
                    chartType = scope.data.chartType,
                    series = dataset.map(function (d) {
                        return d.name;
                    }),
                    stack = d3.layout.stack();

                dataset = dataset.map(function (d) {
                    return d.data.map(function (o, i) {
                        return {
                            y: o.count,
                            x: o.project
                        };
                    });
                });

                stack(dataset);

                dataset = dataset.map(function (group) {
                        return group.map(function (d) {
                            return {
                                x: d.y,
                                y: d.x,
                                x0: d.y0
                            };
                        });
                    });
                var svg = d3.select(element.children()[0])
                        .append('svg')
                        .attr('width', width + margins.left + margins.right + legendPanel.width)
                        .attr('height', height + margins.top + margins.bottom)
                        .append('g')
                        .attr('class', 'bar-chart')
                        .attr('transform', 'translate(' + margins.left + ',' + margins.top + ')'),
                    xMax = d3.max(dataset, function (group) {
                        return d3.max(group, function (d) {
                            return d.x + d.x0;
                        });
                    }),
                    xScale = d3.scale.linear()
                        .domain([0, xMax])
                        .range([0, width]),
                    projects = dataset[0].map(function (d) {
                        return d.y;
                    }),
                    yScale = d3.scale.ordinal()
                        .domain(projects)
                        .rangeRoundBands([0, height], .1),
                    xAxis = d3.svg.axis()
                        .scale(xScale)
                        .orient('bottom'),
                    yAxis = d3.svg.axis().tickFormat(function(d) {
                        var project =  scope.data.projects.filter(function(item) {
                           return item.uuid === d;
                        })[0];
                        var resources = 0,
                            barName;
                        project.quotas.forEach(function(item) {
                            if (item.name === 'nc_resource_count') {
                                resources = item.usage;
                            }
                        });
                        barName = chartType === 'resources' ?
                            project.name + ' ('+ resources +' resources)' :
                            project.name;
                        return barName;
                            //return scope.data.x[d];
                        })
                        .scale(yScale)
                        .orient('left'),
                    colours = d3.scale.category10(),
                    groups = svg.selectAll('g')
                        .data(dataset)
                        .enter()
                        .append('g')
                        .style('fill', function (d, i) {
                            return colours(i);
                        }),
                    rects = groups.selectAll('rect')
                        .data(function (d) {
                            return d;
                        })
                        .enter()
                        .append('rect')
                        .attr('x', function (d) {
                            return xScale(d.x0);
                        })
                        .attr('y', function (d, i) {
                            return yScale(d.y);
                        })
                        .attr('height', function (d) {
                            return yScale.rangeBand();
                        })
                        .attr('width', function (d) {
                            return xScale(d.x);
                        });

                svg.append('g')
                    .attr('class', 'axis')
                    .attr('transform', 'translate(0,' + height + ')')
                    .call(xAxis);

                svg.append('g')
                    .attr('class', 'axis')
                    .call(yAxis);

                svg.append('rect')
                    .attr('fill', '#eee')
                    .attr('width', 160)
                    .attr('height', 30 * dataset.length)
                    .attr('x', width+ 20)
                    .attr('y', 0);

                series.forEach(function (s, i) {
                    svg.append('text')
                        .attr('fill', 'black')
                        .attr('x', width + 28)
                        .attr('y', i * 24 + 24)
                        .on('click', function() {
                            var link;
                            switch (s) {
                                case 'VMs':
                                    link = 'vms';
                                    break;
                                case 'Apps':
                                    link = 'applications';
                                    break;
                                default:
                                    break;
                            }
                            $state.go('organizations.details', {uuid: scope.currentCustomer.uuid, tab: link});
                        })
                        .text(s);
                    svg.append('rect')
                        .attr('fill', colours(i))
                        .attr('width', 60)
                        .attr('height', 20)
                        .attr('x', width + 110)
                        .attr('y', i * 24 + 6);
                });

                dataset.forEach(function(resourcesTypes) {
                    resourcesTypes.forEach(function(resource) {
                        if (resource.x) {
                            svg.append('text')
                              .text(resource.x)
                              .attr('x', xScale(resource.x) - 100)
                              .attr('y', yScale(resource.y) + 38)
                              .attr('fill', "#fff");
                        }
                    });
                });
            }
        }
    }
}());
