'use strict';

(function() {

  angular.module('ncsaas')
    .directive('dashboardCostChart', dashboardCostChart);

  dashboardCostChart.$inject = ['$window'];
  function dashboardCostChart ($window) {
    return {
      restrict: 'E',
      replace: true,
      templateUrl: 'views/directives/dashboard-cost-chart.html',
      scope: {
        data: '@'
      },
      link: dashboardCostChartLink
    };

    function dashboardCostChartLink(scope, element, attrs) {
      var bindId = '#chart';

      angular.element($window).bind('resize', function () {
        scope.$apply();
      });

      scope.getContainerWidth = function() {
        return element[0].getBoundingClientRect().width;
      };

      scope.$watch(scope.getContainerWidth, function(newWidth) {
        scope.width = newWidth;
      });

      var  createCanvas = function (el, width, height, margin) {
        return d3.select(el).html('').append('svg:svg')
          .attr('width', width + margin.left + margin.right)
          .attr('height', height + margin.top + margin.bottom)
          .append('svg:g')
          .attr('transform', 'translate(' + margin.left + ',' + margin.top + ')');
      };

      var drawHorizontalAxis = function (canvas, component, width, height, title, id) {
        canvas.append('g').attr('id', (id) ? id : '')
          .attr('class', '_x _axis')
          .attr('transform', 'translate(0,' + height + ')')
          .call(component)
          .append('text')
          .attr('x', width)
          .attr('y', 15)
          .attr('dy', '-0.29em')
          .style('text-anchor', 'end')
          .text(title);
      };

      var drawVerticalAxis = function (canvas, component, title, id) {
        return canvas.append('g')
          .attr('id', id)
          .attr('class', '_y _axis axisLeft')
          .call(component)
          .append('text')
          .attr('transform', 'rotate(-90)')
          .attr('y', 6)
          .attr('dy', '.71em')
          .style('text-anchor', 'end')
          .text(title);
      };

      var drawPathLine = function(canvas, lineGenerator, data, color, id, attrClass) {
        return canvas
          .append('svg:path')
          .attr('stroke-width', 2)
          .style('fill', 'none')
          .style('stroke', color != null ? color : 'black')
          .attr('d', lineGenerator(data))
          .attr('id', id != null ? id : '')
          .attr('class', attrClass != null ? attrClass : '');
      };

      var drawPathArea = function(canvas, lineGenerator, data, color, id, attrClass) {
        var rgb = d3.rgb(color);
        return canvas
          .append('svg:path')
          .attr('stroke-width', 0)
          .style('stroke', color != null ? color : 'black')
          .style('fill', 'rgba('+ rgb.r +', ' + rgb.g + ', '+rgb.b+', .5)')
          .attr('d', lineGenerator(data))
          .attr('id', id != null ? id : '')
          .attr('class', attrClass != null ? attrClass : '');
      };

      var color = d3.scale.category20();

      var initData = JSON.parse(attrs.data);

      var formatDate = d3.time.format('%Y%m');
      var parseDate = formatDate.parse;

      var projectList = getProjectList(initData);

      var rd, rData = [];

      for (var k in initData){
        if (initData.hasOwnProperty(k)) {

          rd = {};
          rd.date = parseDate(k);
          rd.total = initData[k].customer[0] ? initData[k].customer[0].value : 0;

          var currentProjects = initData[k].project;

          projectList.forEach(function(pl) {
            rd[pl.name] = currentProjects.reduce(function(sum, cp) {
              return sum + (cp.name === pl.full ? +cp.value : 0);
            }, 0);
          });

          rData.push(rd);
        }
      }

      projectList.push({ full: "total", title: 'Total', name: 'total' });

      scope.entities = getInitEntities(projectList, color);

      scope.$watch('[entities, width]', function(newValue) {
        var
          newEntities = newValue[0],
          newWidth = newValue[1];

        var margin = {
          top: 10,
          right: 60,
          bottom: 120,
          left: 20
        };
        var margin2 = {
          top: 360,
          right: 60,
          bottom: 30,
          left: 20
        };
        var marginLegend = 210;

        var width = newWidth - marginLegend - margin.left - margin.right;
        var height = 450 - margin.top - margin.bottom;
        var height2 = 450 - margin2.top - margin2.bottom;

        var entities = angular.copy(newEntities.filter(function(e) { return e.on; }));

        var data = getDataByEntities(entities, rData);

        var xScale = d3.time.scale().range([0,width]).domain(d3.extent(data, function (d) { return d.date; }));
        var xAxis = d3.svg.axis().scale(xScale).orient('bottom').ticks(5);

        var min = [], max = [];
        entities.forEach(function(entity) {
          min.push(d3.min(data, function (d) { return parseFloat(d[entity.name]); }));
          max.push(d3.max(data, function (d) { return parseFloat(d[entity.name]); }));
        });

        var yLeftMin = d3.min(min);
        var yLeftMax = d3.max(max);
        if (yLeftMin === yLeftMax) { yLeftMin -= .1; yLeftMax += .1; }

        var yLeftScale = d3.scale.linear().domain([yLeftMin, yLeftMax]).range([height, 0]);
        var yLeftAxis = d3.svg.axis().scale(yLeftScale).orient('left');

        var makeYAxis = function() {
          return d3.svg.axis().scale(yLeftScale).orient('left').ticks(10);
        };

        var area =[];
        var lineTotal;
        entities.forEach(function(entity, i) {
          if (entity.name === 'total') {
            lineTotal = d3.svg.line()
              .x(function(d) {
                return xScale(d.date);
              })
              .y(function(d) {
                return yLeftScale(d[entities[i].name]);
              });
            return;
          }

          area.push({
            scale: d3.svg.area()
              .x(function(d) {
                return xScale(d.date);
              })
              .y0(i===0 ? height : function(d) {
                return yLeftScale(d[entities[i-1].name]);
              } )
              .y1(function(d) {
                return yLeftScale(d[entities[i].name]);
              }),
            entity: entity.name
          });
        });

        var canvas = createCanvas(bindId, width, height, margin);

        var focus = canvas.append('g').attr('transform', 'translate(' + margin.left + ',' + margin.top + ')');

        focus.append('svg:rect').attr('width', width).attr('height', height).attr('class', 'plot');
        var clip = focus.append('svg:clipPath')
          .attr('id', 'clip')
          .append('svg:rect')
          .attr('x', 0)
          .attr('y', 0)
          .attr('width', width)
          .attr('height', height);


        drawHorizontalAxis(focus, xAxis, width, height, '', '');
        drawVerticalAxis(focus, yLeftAxis, 'price', '');

        // make grid
        focus.append('g')
          .attr('class', 'y grid')
          .call(makeYAxis().tickSize(-width, 0, 0).tickFormat(''));

        var chartBody = focus.append('g')
          .attr('clip-path', 'url(#clip)');

        area.forEach(function(v) {
          drawPathArea(chartBody, v.scale, data, color(v.entity), '', v.entity);
        });

        drawPathLine(chartBody, lineTotal, data, color('total'), '', 'line_total');


        // --- Below chart ---

        var xScale2 = d3.time.scale().range([0, width]).domain(d3.extent(data, function(d) {
          return d.date;
        }));

        var xAxis2 = d3.svg.axis().scale(xScale).orient('bottom').ticks(5);

        var yScale2 = d3.scale.linear().domain([yLeftMin, yLeftMax]).range([height2, 0]);

        var areaBrush = d3.svg.area()
          .x(function(d) { return xScale2(d.date); })
          .y0(height2)
          .y1(function(d) {
            return yScale2(d[entities[entities.length-1].name]);
          });

        var brushed = function() {
          xScale.domain((brush.empty() ? xScale2.domain() : brush.extent()));
          focus.select('._x._axis').call(xAxis);

          area.forEach(function(v) {
            canvas.select('.' + v.entity).attr('d', v.scale(data));
          });
          canvas.select('.line_total').attr('d', lineTotal(data));

        };

        var brush = d3.svg.brush()
          .x(xScale2)
          .on('brush', brushed);

        var context = canvas.append('g').attr('transform', 'translate(' + margin2.left + ',' + margin2.top + ')');
        context.append('path')
          .datum(data)
          .attr('class', 'area')
          .attr('d', areaBrush);

        context.append('g').attr('class', '_x _axis').attr('transform', 'translate(0,' + height2 + ')').call(xAxis2);
        context.append('g')
          .attr('class', '_x brush')
          .call(brush)
          .selectAll('rect')
          .attr('y', -6)
          .attr('height', height2 + 7);

        // --- Below chart ---

        hover(color, data, rData, entities, focus, width, height, xScale, yLeftScale, hoverCallback);

      }, true);
    }
  }

  function getProjectList(data) {
    var list = [];
    var exist = {};
    for(var k in data) {
      if (data.hasOwnProperty(k)) {
        data[k].project.forEach(function(p) {
          if (!exist[p.name]) {
            exist[p.name] = true;
            var projectTitle = getShortProjectName(p.name);
            list.push({
              full: p.name,
              title: projectTitle,
              name: projectTitle.split(' ').join('_')
            });
          }
        });
      }
    }
    return list;
  }

  function getShortProjectName(name) {
    return name.split('|')[0].trim();
  }

  function hoverCallback(entities) {
    entities.forEach(function(e) {
      d3.select('.legend .current_value__' + e.name).text(e.currentValue.toFixed(2));
    });
    d3.select('.legend .date').text(d3.time.format('%Y %b')(entities[entities.length - 1].currentDate));
  }

  function getInitEntities(projectList, color) {
    return projectList.map(function(project) {
      return {
        title: project.title,
        name: project.name,
        currentValue: 0,
        on: true,
        color: color(project.name)
      };
    });
  }

  function getDataByEntities(entities, rData) {
    var onCharts = [], d, data = [];

    entities.forEach(function(e) {
      if (e.name !== 'total') {
        onCharts.push(e.name);
      }
    });

    rData.forEach(function(rd) {

      d = {};
      d.date = rd.date;
      d.total = rd.total;

      var previousValue = 0;
      for (var k in rd){
        if (rd.hasOwnProperty(k) && onCharts.indexOf(k) >= 0) {

          var val = rd[k] + previousValue;
          d[k] = val;
          previousValue = val;

        }
      }
      data.push(d);
    });

    return data;
  }

  function hover(color, data, rData, entities, focus, width, height, xScale, yLeftScale, onMove) {
    var bisectX = d3.bisector(function(d) { return d.date; }).right;
    var bisect = d3.bisector(function(d) { return d; }).right;

    var hoverTool = function () {
      var x = d3.mouse(this)[0];
      var rectSize = this.getBoundingClientRect();

      if (x < 0 || x >= rectSize.width) {
        hoverLineGroup.style('opacity', 0);
        return;
      }

      hoverLineGroup.style('opacity', 1).attr('transform', 'translate(' + x + ',' + 0 + ')');

      var timestamp = xScale.invert(x);
      var focusDataIndex = bisectX(data, timestamp);

      if ((focusDataIndex > 0) && (focusDataIndex < data.length)) {
        entities.forEach(function(entity, i) {
          entities[i].currentValue = rData[focusDataIndex][entity.name];
          entities[i].currentDate = rData[focusDataIndex].date;

          var
            startDatum = data[focusDataIndex - 1],
            endDatum = data[focusDataIndex],
            distance = xScale(endDatum.date)-xScale(startDatum.date),
            range = d3.range(0, 1, distance < 100 ? 1/15 : 1/30);

          range.push(1);

          var lineDataX = range.map(d3.interpolateNumber(+startDatum.date, +endDatum.date));
          var lineDataY = range.map(d3.interpolateNumber(startDatum[entity.name], endDatum[entity.name]));

          var idx = bisect(lineDataX, +timestamp);
          var valueY = lineDataY[idx];

          hoverPoints[i].attr('cy', yLeftScale(valueY));
        });
      }

      onMove(entities);
    };

    // Hover line group. Hide hover group by default.
    var hoverLineGroup = focus.append('g')
      .attr('transform', 'translate(0,0)')
      .attr('class', 'hover-line')
      .style('opacity', 0);

    var hoverLine = hoverLineGroup
      .append('line')
      .attr('x1', 0).attr('x2', 0)
      .attr('y1', 0).attr('y2', height);


    var hoverPoints = entities.map(function(entity) {
      return hoverLineGroup
        .append('circle')
        .attr('class', 'hover_point__' + entity.name)
        .attr('cx', 0)
        .attr('cy', 25)
        .attr('r', 5)
        .attr('fill', color(entity.name));
    });

    focus.append('svg:rect')
      .attr('width', width)
      .attr('height', height)
      .attr('fill', 'transparent')
      .attr('class', 'hover-rect');

    // Add mouseover events.
    d3.select('.hover-rect').on('mouseover', function() {
    }).on('mousemove', function() {
      hoverTool.call(this);
    }).on('touchmove', function() {
      hoverTool.call(this);
    }).on('mouseout', function() {
      hoverLineGroup.style('opacity', 0);
    }).on('touchend', function() {
      hoverLineGroup.style('opacity', 0);
    });
  }

})();

