'use strict';

(function() {

  angular.module('ncsaas')
    .directive('dashboardCostChart', function() {
      return {
        restrict: 'E',
        replace: true,
        templateUrl: 'views/directives/dashboard-cost-chart.html',
        scope: {
          data: '@'
        },
        link: dashboardCostChartLink
      };
    });

  function dashboardCostChartLink(scope, element, attrs) {

    var  createCanvas = function (el, width, height, margin, callFunc) {
      var result = d3.select(el).html('').append('svg:svg')
        .attr('width', width + margin.left + margin.right)
        .attr('height', height + margin.top + margin.bottom)
        .append('svg:g')
        .attr('transform', 'translate(' + margin.left + ',' + margin.top + ')');
      //result = result.call(callFunc) if callFunc
      return result;
    }

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
        .text(title)
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
        .text(title)
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

    var width = 760 - margin.left - margin.right;
    var height = 450 - margin.top - margin.bottom;
    var height2 = 450 - margin2.top - margin2.bottom;

    var bindId = '#chart';

    var color = d3.scale.category20();

    var initData = JSON.parse(attrs.data);

    var formatDate = d3.time.format('%m-%Y');
    var parseDate = formatDate.parse;

    var rd, rData = [], projectList = {};
    for (var k in initData){
      if (initData.hasOwnProperty(k)) {

        /* -------- TEST PROJECT ----------- */
        initData[k].project.push({
          name: 'project test',
          value: +(Math.random().toFixed(2))
        });
        initData[k].project.push({
          name: 'project test2',
          value: +(Math.random().toFixed(2))
        });
        initData[k].project.push({
          name: 'project test3',
          value: +(Math.random().toFixed(2))
        });
        /* -------- TEST PROJECT ----------- */

        rd = {};
        rd.date = parseDate(k);
        rd.total = initData[k].customer[0].value + 3 + Math.random();

        initData[k].project.forEach(function(project, i) {
          var projectTitle = project.name.split('|')[0].trim();
          var projectName = projectTitle.split(' ').join('_');

          rd[projectName] = +project.value;
          projectList[projectName] = { title: projectTitle, name: projectName };
        });
        projectList.total = { title: 'Total', name: 'total' };

        rData.unshift(rd);
      }
    }

    scope.entities = getInitEntities(projectList, color);

    scope.$watch('entities', function(newEntities) {

      var entities = angular.copy(newEntities.filter(function(e) { return e.on; }));

      var data = getDataByEntities(entities, rData);

      var xScale = d3.time.scale().range([0,width]).domain(d3.extent(data, function (d) { return d.date }));
      var xAxis = d3.svg.axis().scale(xScale).orient('bottom').ticks(5);

      var min = [], max = [];
      entities.forEach(function(entity) {
        min.push(d3.min(data, function (d) { return parseFloat(d[entity.name]) }));
        max.push(d3.max(data, function (d) { return parseFloat(d[entity.name]) }));
      });

      var yLeftMin = d3.min(min);
      var yLeftMax = d3.max(max);


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

        area.forEach(function(v, i) {
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

  function debounce(func, wait, immediate) {
    if (!wait) return func;

    var timeout;

    return function() {
      var context = this, args = arguments;

      var later = function() {
        timeout = null;

        if (!immediate) func.apply(context, args);
      };

      var callNow = immediate && !timeout;

      clearTimeout(timeout);
      timeout = setTimeout(later, wait);

      if (callNow) func.apply(context, args);
    };
  }

  function hoverCallback(entities) {
    entities.forEach(function(e) {
      d3.select('.legend .current_value__' + e.name).text(e.currentValue.toFixed(2));
    });
    d3.select('.legend .date').text(d3.time.format('%Y %b')(entities[entities.length - 1].currentDate));
  }

  function getInitEntities(projectList, color) {
    var entities = [];
    for (var k in projectList) {
      if (projectList.hasOwnProperty(k)) {
        entities.push({
          title: projectList[k].title,
          name: projectList[k].name,
          currentValue: 0,
          on: true,
          color: color(projectList[k].name)
        });
      }
    }

    return entities;
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


    // Hover line group. Hide hover group by default.
    var hoverLineGroup = focus.append('g')
      .attr('transform', 'translate(0,0)')
      .attr('class', 'hover-line')
      .style('opacity', 1e-6);

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
      var x = d3.mouse(this)[0];
      hoverLineGroup.style('opacity', 1).attr('transform', 'translate(' + x + ',' + 0 + ')');

      var timestamp = xScale.invert(x);
      var focusDataIndex = bisectX(data, timestamp);

      if ((focusDataIndex > 0) && (focusDataIndex < data.length)) {
        entities.forEach(function(entity, i) {
          //hoverPoints[i].attr("cy", yLeftScale(data[focusDataIndex][entity.name]));
          entities[i].currentValue = rData[focusDataIndex][entity.name];
          entities[i].currentDate = rData[focusDataIndex].date;

          var
            startDatum = data[focusDataIndex - 1],
            endDatum = data[focusDataIndex],
            interpolate = d3.interpolateNumber(startDatum[entity.name], endDatum[entity.name]),
            range = endDatum.date - startDatum.date,
            valueY = interpolate((timestamp % range) / range);

          var lineDataX = d3.range(0, 1, 1/10).map(d3.interpolateNumber(+startDatum.date, +endDatum.date));
          lineDataX.push(+endDatum.date);
          var lineDataY = d3.range(0, 1, 1/10).map(d3.interpolateNumber(startDatum[entity.name], endDatum[entity.name]));
          lineDataY.push(endDatum[entity.name]);

          var idx = bisect(lineDataX, +timestamp);
          valueY = lineDataY[idx];

          hoverPoints[i].attr('cy', yLeftScale(valueY));
        });
      }

      onMove(entities);

    })  .on('mouseout', function() {
      hoverLineGroup.style('opacity', 1e-6);
    });
  }

})();

