import template from './dashboard-cost-chart.html';
import './dashboard-cost-chart.scss';

// @ngInject
export default function dashboardCostChart($window, $filter, ENV, ncUtils) {
  return {
    restrict: 'E',
    replace: true,
    template: template,
    scope: {
      data: '='
    },
    link: dashboardCostChartLink
  };

  function dashboardCostChartLink(scope, element) {
    let bindId = '#chart';

    let onResize = function() {
      scope.$apply();
    };

    angular.element($window).bind('resize', onResize);
    scope.$on('$destroy', function() {
      angular.element($window).unbind('resize', onResize);
    });

    let getContainerWidth = function() {
      return element[0].getBoundingClientRect().width;
    };

    scope.$watch(getContainerWidth, function(newWidth) {
      scope.width = newWidth;
    });

    let createCanvas = function(el, width, height, margin) {
      return d3.select(el).html('').append('svg:svg')
        .attr('width', width + margin.left + margin.right)
        .attr('height', height + margin.top + margin.bottom)
        .append('svg:g')
        .attr('transform', 'translate(' + margin.left + ',' + margin.top + ')');
    };

    let drawHorizontalAxis = function(canvas, component, width, height, title, id) {
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

    let drawVerticalAxis = function(canvas, component, title, id) {
      return canvas.append('g')
        .attr('id', id)
        .attr('class', '_y _axis axisLeft')
        .call(component)
        .append('text')
        .attr('y', -15)
        .attr('dy', '.71em')
        .style('text-anchor', 'end')
        .text(title);
    };

    let drawPathLine = function(canvas, lineGenerator, data, color, id, attrClass) {
      return canvas
        .append('svg:path')
        .attr('stroke-width', 2)
        .style('fill', 'none')
        .style('stroke', color != null ? color : 'black')
        .attr('d', lineGenerator(data))
        .attr('id', id != null ? id : '')
        .attr('class', attrClass != null ? attrClass : '');
    };

    let drawPathArea = function(canvas, lineGenerator, data, color, id, attrClass) {
      let rgb = d3.rgb(color);
      return canvas
        .append('svg:path')
        .attr('stroke-width', 1)
        .style('stroke', color != null ? color : 'black')
        .style('fill', 'rgba(' + rgb.r + ', ' + rgb.g + ', ' + rgb.b + ', .4)')
        .attr('d', lineGenerator(data))
        .attr('id', id != null ? id : '')
        .attr('class', attrClass != null ? attrClass : '');
    };

    let color = d3.scale.category20();

    let initData = ncUtils.sortObj(scope.data);

    scope.projectSelect = 'project';

    let tmp = init(initData, scope.projectSelect),
      rData = tmp.rData,
      legendList = tmp.legendList;

    scope.entities = getInitEntities(legendList, color);

    scope.$watch('[entities, width, projectSelect]', draw, true);

    function draw(newValue, oldValue) {
      let
        newEntities = newValue[0],
        newWidth = newValue[1],
        sourceType = newValue[2];

      if (oldValue[2] !== sourceType) {
        color = d3.scale.category20();
        tmp = init(initData, sourceType);
        rData = tmp.rData;
        legendList = tmp.legendList;

        scope.entities = newEntities = getInitEntities(legendList, color);
        d3.select('.legend .date').text('');
      }

      let margin = {
        top: 10,
        right: 40,
        bottom: 120,
        left: 20
      };
      let margin2 = {
        top: 360,
        right: 60,
        bottom: 30,
        left: 20
      };
      let marginLegend = 325;
      let inlineMode = newWidth > 600;

      let xTicksCount = (newWidth - marginLegend) > 640 ? 8 : 3;
      let width = (inlineMode  ? newWidth - marginLegend : newWidth) - margin.left - margin.right;
      let height = 450 - margin.top - margin.bottom;
      let height2 = 450 - margin2.top - margin2.bottom;

      let entities = angular.copy(newEntities.filter(function(e) { return e.on; }));

      let data = getDataByEntities(entities, rData);

      let xScale = d3.time.scale().range([0, width]).domain(d3.extent(data, function(d) { return d.date; }));
      let xAxis = d3.svg.axis().scale(xScale).orient('bottom').ticks(xTicksCount);

      let min = [], max = [];
      entities.forEach(function(entity) {
        min.push(d3.min(data, function(d) { return parseFloat(d[entity.name]); }));
        max.push(d3.max(data, function(d) { return parseFloat(d[entity.name]); }));
      });

      let yLeftMin = d3.min(min);
      let yLeftMax = d3.max(max);
      if (yLeftMin === yLeftMax) {
        yLeftMin -= 0.1;
        yLeftMax += 0.1;
      }

      let yLeftScale = d3.scale.linear().domain([yLeftMin, yLeftMax]).range([height, 0]);
      let yLeftAxis = d3.svg.axis().scale(yLeftScale).orient('left');

      let makeYAxis = function() {
        return d3.svg.axis().scale(yLeftScale).orient('left').ticks(10);
      };

      let area = [];
      let lineTotal;
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
            .y0(i === 0 ? height : function(d) {
              return yLeftScale(d[entities[i - 1].name]);
            })
            .y1(function(d) {
              return yLeftScale(d[entities[i].name]);
            }),
          entity: entity.name
        });
      });

      let canvas = createCanvas(bindId, width, height, margin);

      let focus = canvas.append('g').attr('transform', 'translate(' + margin.left + ',' + margin.top + ')');

      focus.append('svg:rect').attr('width', width).attr('height', height).attr('class', 'plot');
      focus.append('svg:clipPath')
        .attr('id', 'clip')
        .append('svg:rect')
        .attr('x', 0)
        .attr('y', 0)
        .attr('width', width)
        .attr('height', height);

      drawHorizontalAxis(focus, xAxis, width, height, '', '');
      drawVerticalAxis(focus, yLeftAxis, 'cost ' +  ENV.currency, '');

      // make grid
      focus.append('g')
        .attr('class', 'y grid')
        .call(makeYAxis().tickSize(-width, 0, 0).tickFormat(''));

      let chartBody = focus.append('g')
        .attr('clip-path', 'url(#clip)');

      area.forEach(function(v) {
        drawPathArea(chartBody, v.scale, data, color(v.entity), '', v.entity);
      });

      drawPathLine(chartBody, lineTotal, data, color('total'), '', 'line_total');

      // --- Below chart ---

      let xScale2 = d3.time.scale().range([0, width]).domain(d3.extent(data, function(d) {
        return d.date;
      }));

      let xAxis2 = d3.svg.axis().scale(xScale).orient('bottom').ticks(xTicksCount);

      let yScale2 = d3.scale.linear().domain([yLeftMin, yLeftMax]).range([height2, 0]);

      let areaBrush = d3.svg.area()
        .x(function(d) { return xScale2(d.date); })
        .y0(height2)
        .y1(function(d) {
          return yScale2(d[entities[entities.length - 1].name]);
        });

      let brushed = function() {
        xScale.domain((brush.empty() ? xScale2.domain() : brush.extent()));
        focus.select('._x._axis').call(xAxis);

        area.forEach(function(v) {
          canvas.select('.' + v.entity).attr('d', v.scale(data));
        });
        canvas.select('.line_total').attr('d', lineTotal(data));

      };

      let brush = d3.svg.brush()
        .x(xScale2)
        .extent(getBrushExtent(data))
        .on('brush', brushed);

      brushed();

      let context = canvas.append('g').attr('transform', 'translate(' + margin2.left + ',' + margin2.top + ')');
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

      hover(bindId, color, data, rData, entities, focus, width, height, xScale, yLeftScale, hoverCallback);
    }

    function hoverCallback(entities) {
      if (!entities[entities.length - 1].currentDate) {
        return;
      }
      scope.currentValues = {};
      entities.forEach(function(e) {
        scope.currentValues[e.name] = e.currentValue.toFixed(2) +  ENV.currency;
      });
      scope.currentValues['date'] = d3.time.format('%Y %b')(entities[entities.length - 1].currentDate);
      scope.$apply();
    }
  }

  function init(initData, type) {
    let formatDate = d3.time.format('%Y%m');
    let parseDate = formatDate.parse;
    let legendList = getLegendList(initData, type);
    let rd, rData = [];

    for (let k in initData) {
      if (initData.hasOwnProperty(k)) {

        rd = {};
        rd.date = parseDate(k);
        rd.total = initData[k].customer[0] ? initData[k].customer[0].value : 0;

        let currentProjects = initData[k][type];

        legendList.forEach(function(pl) {
          rd[pl.name] = currentProjects.reduce(function(sum, cp) {
            return sum + (cp.name === pl.full ? +cp.value : 0);
          }, 0);
        });

        rData.push(rd);
      }
    }

    legendList.push({full: 'total', title: 'Total', name: 'total'});

    return {
      rData: rData,
      legendList: legendList
    };
  }

  function getLegendList(data, type) {
    let list = [],
      exist = {},
      count = 0;

    type = type ? type : 'project';

    for (let k in data) {
      if (data.hasOwnProperty(k)) {
        data[k][type].forEach(function(p) {
          if (!exist[p.name]) {
            exist[p.name] = true;
            let projectTitle = getShortProjectName(p.name);
            list.push({
              full: p.name,
              title: projectTitle,
              name: type + '_' + count
            });
            count++;
          }
        });
      }
    }
    return $filter('orderBy')(list, 'title');
  }

}

function getBrushExtent(data) {
  let firstDate = moment(data[0].date);
  let lastDate = moment(data[data.length - 1].date);
  let lastYear = moment(data[data.length - 1].date).subtract('years', 1);

  return [(firstDate < lastYear ? lastYear : firstDate).toDate(), lastDate.toDate()];
}

function getShortProjectName(name) {
  return name.split('|')[0].trim();
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
  let onCharts = [], d, data = [];

  entities.forEach(function(e) {
    if (e.name !== 'total') {
      onCharts.push(e.name);
    }
  });

  rData.forEach(function(rd) {

    d = {};
    d.date = rd.date;
    d.total = rd.total;

    let previousValue = 0;
    for (let k in rd) {
      if (rd.hasOwnProperty(k) && onCharts.indexOf(k) >= 0) {

        let val = rd[k] + previousValue;
        d[k] = val;
        previousValue = val;

      }
    }
    data.push(d);
  });

  return data;
}

function hover(bindId, color, data, rData, entities, focus, width, height, xScale, yLeftScale, onMove) {
  let bisectX = d3.bisector(function(d) { return d.date; }).right;
  let bisect = d3.bisector(function(d) { return d; }).right;

  let rectSize, x, y;

  // Define the div for the tooltip
  let tooltip = d3.select(bindId).append('div')
    .attr('class', 'tooltip-cost')
    .style('opacity', 0);

  let hoverTool = function() {
    let mouse = d3.mouse(this);
    x = mouse[0];
    y = mouse[1];

    rectSize = this.getBoundingClientRect();

    if (x < 0 || x >= rectSize.width) {
      hoverLineGroup.style('opacity', 0);
      return;
    }

    hoverLineGroup.style('opacity', 1).attr('transform', 'translate(' + x + ',' + 0 + ')');

    let timestamp = xScale.invert(x);
    let focusDataIndex = bisectX(data, timestamp);

    if ((focusDataIndex > 0) && (focusDataIndex < data.length)) {
      entities.forEach(function(entity, i) {
        entities[i].currentValue = rData[focusDataIndex][entity.name];
        entities[i].currentDate = rData[focusDataIndex].date;

        let
          startDatum = data[focusDataIndex - 1],
          endDatum = data[focusDataIndex],
          distance = xScale(endDatum.date) - xScale(startDatum.date),
          range = d3.range(0, 1, distance < 100 ? 1 / 15 : 1 / 30);

        range.push(1);

        let lineDataX = range.map(d3.interpolateNumber(+startDatum.date, +endDatum.date));
        let lineDataY = range.map(d3.interpolateNumber(startDatum[entity.name], endDatum[entity.name]));

        let idx = bisect(lineDataX, +timestamp);
        let valueY = lineDataY[idx];

        (entity.name !== 'total') && hoverPoints[i].attr('cy', yLeftScale(valueY));
      });
    }

    onMove(entities);
  };

  // hoverRect
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
    let mouse = d3.mouse(this);
    x = mouse[0];
    y = mouse[1];

    if (x <= 0 || x >= rectSize.width || y <= 0 || y >= rectSize.height) {
      hoverLineGroup.style('opacity', 0);
    }
  }).on('touchend', function() {
    hoverLineGroup.style('opacity', 0);
  });

  // Hover line group. Hide hover group by default.
  let hoverLineGroup = focus.append('g')
    .attr('transform', 'translate(0,0)')
    .attr('class', 'hover-line')
    .style('opacity', 0);

  // hoverLine
  hoverLineGroup
    .append('line')
    .attr('x1', 0).attr('x2', 0)
    .attr('y1', 0).attr('y2', height)
    .on('mouseout', function() {
      y = d3.mouse(this)[1];
      if (x <= 0 || x >= rectSize.width || y <= 0 || y >= rectSize.height) {
        hoverLineGroup.style('opacity', 0);
      }
    });

  let hoverPoints = entities
    .filter(function(entity) { return entity.name !== 'total'; })
    .map(function(entity) {
      return hoverLineGroup
        .append('circle')
        .attr('class', 'hover_point__' + entity.name)
        .attr('cx', 0)
        .attr('cy', 25)
        .attr('r', 5)
        .attr('fill', color(entity.name))
        .on('mouseover', function() {
          tooltip.transition()
            .duration(200)
            .style('opacity', .9);
          tooltip.html(entity.title)
            .style('left', (d3.event.layerX + 10) + 'px')
            .style('top', (d3.event.layerY - 28) + 'px');
        })
        .on('mouseout', function() {
          tooltip.transition()
            .duration(500)
            .style('opacity', 0);
        });
    });
}
