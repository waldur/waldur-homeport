'use strict';

(function() {

  angular.module('ncsaas')
    .directive('dashboardCostChart', function($window) {
      return {
        restrict: 'E',
        replace: true,
        templateUrl: "views/directives/dashboard-cost-chart.html",
        scope: {
          data: '@',
          entities: '@'
        },
        link: function (scope, element, attrs) {
          //var data = attrs.data.split(',');
          var entities = [
            {
              name: "customer",
              on: true,
              currentVaue: 0
            },
            {
              name: "service",
              on: true,
              currentVaue: 0
            },
            {
              name: "project",
              on: true,
              currentVaue: 0
            },
            {
              name: "resource",
              on: false,
              currentVaue: 0
            }
          ];

          scope.entities = entities;

          var initData = JSON.parse(attrs.data);

          var formatDate = d3.time.format("%m-%Y");
          var parseDate = formatDate.parse;

         /* var d, i, len;
          for (i = 0, len = data.length; i < len; i++) {
            d = data[i];
            d.date = parseDate(d.date);
            d.price = +d.price;
            d.yoy = (parseFloat(d.price) + parseFloat(d.yoy)).toFixed(2);
          }*/

          var d, rd, data = [], rData = [];
          for (var k in initData){
            if (initData.hasOwnProperty(k)) {

              rd = angular.copy(initData[k]);
              rd.date = parseDate(k);
              rd.customer = parseFloat(rd.customer) + Math.random();
              rd.service =  parseFloat(rd.service) + Math.random();
              rd.project =  parseFloat(rd.project) + Math.random();
              rd.resource = parseFloat(rd.resource) + Math.random();
              rData.unshift(rd);

              d = angular.copy(rd);
              d.date = parseDate(k);
              d.customer = parseFloat(d.customer);
              d.service = (parseFloat(d.customer) + parseFloat(d.service));
              d.project = (parseFloat(d.service) + parseFloat(d.project));
              d.resource = (parseFloat(d.project) + parseFloat(d.resource));
              data.unshift(d);
            }
          }

          var  createCanvas = function (el, width, height, margin, callFunc) {
            var result = d3.select(el).append("svg:svg")
              .attr("width", width + margin.left + margin.right)
              .attr("height", height + margin.top + margin.bottom)
              .append("svg:g")
              .attr("transform", "translate(" + margin.left + "," + margin.top + ")");
            //result = result.call(callFunc) if callFunc
            return result;
          }

          var drawHorizontalAxis = function (canvas, component, width, height, title, id) {
            canvas.append("g").attr("id", (id) ? id : "")
            .attr("class", "_x _axis")
              .attr("transform", "translate(0," + height + ")")
              .call(component)
              .append("text")
              .attr("x", width)
              .attr("y", 15)
              .attr("dy", "-0.29em")
              .style("text-anchor", "end")
              .text(title)
          };

          var drawVerticalAxis = function (canvas, component, title, id) {
            return canvas.append("g")
              .attr("id", id)
              .attr("class", "_y _axis axisLeft")
              .call(component)
              .append("text")
              .attr("transform", "rotate(-90)")
              .attr("y", 6)
              .attr("dy", ".71em")
              .style("text-anchor", "end")
              .text(title)
          };

          var drawPathLine = function(canvas, lineGenerator, data, color, id, attrClass) {
            return canvas
              .append("svg:path")
              .attr("stroke-width", 2)
              .style("fill", "none")
              .style("stroke", color != null ? color : "black")
              .attr("d", lineGenerator(data))
              .attr("id", id != null ? id : "")
              .attr("class", attrClass != null ? attrClass : "");
          };

          var drawPathArea = function(canvas, lineGenerator, data, color, id, attrClass) {
            return canvas
              .append("svg:path")
              .attr("stroke-width", 0)
              .style("stroke", color != null ? color : "black")
              .attr("d", lineGenerator(data))
              .attr("id", id != null ? id : "")
              .attr("class", attrClass != null ? attrClass : "");
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

          var bindId = "#chart";

          var width = 760 - margin.left - margin.right;
          var height = 450 - margin.top - margin.bottom;
          var height2 = 450 - margin2.top - margin2.bottom;

          var xScale = d3.time.scale().range([0,width]).domain(d3.extent(data, function (d) { return d.date }));
          var xAxis = d3.svg.axis().scale(xScale).orient("bottom").ticks(5);

          //var line1Min = d3.min(data, function (d) { return parseFloat(d.price) });
          //var line1Max = d3.max(data, function (d) { return parseFloat(d.price) });
          //var line2Min = d3.min(data, function (d) { return parseFloat(d.yoy) });
          //var line2Max = d3.max(data, function (d) { return parseFloat(d.yoy) });

          var min = [], max = [];
          entities.forEach(function(entity) {
            min.push(d3.min(data, function (d) { return parseFloat(d[entity.name]) }));
            max.push(d3.max(data, function (d) { return parseFloat(d[entity.name]) }));
          });

          var yLeftMin = d3.min(min);
          var yLeftMax = d3.max(max);


          var yLeftScale = d3.scale.linear().domain([yLeftMin, yLeftMax]).range([height, 0]);
          var yLeftAxis = d3.svg.axis().scale(yLeftScale).orient("left");

          var make_y_axis = function() {
            return d3.svg.axis().scale(yLeftScale).orient("left").ticks(10);
          };


          var area =[];

          entities.forEach(function(d, i) {

            area.push(d3.svg.area()
              .x(function(d) {
                return xScale(d.date);
              })
              .y0(i==0 ? height : function(d) {
                return yLeftScale(d[entities[i-1].name]);
              } )
              .y1(function(d) {
                return yLeftScale(d[entities[i].name]);
              }))
          });

          var zoomed = function () {
            canvas.select("._x._axis").call(xAxis);
            canvas.select(".axisLeft").call(yLeftAxis);
            canvas.select(".y.grid").call(make_y_axis().tickSize(-width, 0, 0).tickFormat(""));

            area.forEach(function(v, i) {
              canvas.select(".area" + i).attr("d", v(data));
            });

            brush.extent(xScale.domain());
            return canvas.select(".brush").call(brush);
          };

          // make zoom
          var zoom = d3.behavior.zoom()
            //.x(xScale)
            //.y(yLeftScale)
            .scaleExtent([1,20]) // 20x times zoom
            .on("zoom", zoomed);


          var canvas = createCanvas(bindId, width, height, margin, zoom);

          var focus = canvas.append("g").attr("transform", "translate(" + margin.left + "," + margin.top + ")").call(zoom);

          focus.append("svg:rect").attr("width", width).attr("height", height).attr("class", "plot");
          var clip = focus.append("svg:clipPath")
            .attr("id", "clip")
            .append("svg:rect")
            .attr("x", 0)
            .attr("y", 0)
            .attr("width", width)
            .attr("height", height);


          drawHorizontalAxis(focus, xAxis, width, height, "dates", "");
          drawVerticalAxis(focus, yLeftAxis, "price", "");

          // make grid
          focus.append("g")
            .attr("class", "y grid")
            .call(make_y_axis().tickSize(-width, 0, 0).tickFormat(""));

          var chartBody = focus.append("g")
            .attr("clip-path", "url(#clip)");


          area.forEach(function(v, i) {
            drawPathArea(chartBody, v, data, "", "", "area"+i);
          });

          /*var chart = d3.select('#chart')
            .append("div").attr("class", "chart")
            .selectAll('div')
            .data(data).enter()
            .append("div")
            .transition().ease("elastic")
            .style("width", function(d) { return d + "%"; })
            .text(function(d) { return d + "%"; });*/


          // --- Below chart ---

          var xScale2 = d3.time.scale().range([0, width]).domain(d3.extent(data, function(d) {
            return d.date;
          }));

          var xAxis2 = d3.svg.axis().scale(xScale).orient("bottom").ticks(5);

          var yScale2 = d3.scale.linear().domain([yLeftMin, yLeftMax]).range([height2, 0]);

          var areaBrush = d3.svg.area()
            .x(function(d) { return xScale2(d.date); })
            .y0(height2)
            .y1(function(d) { return yScale2(d[entities[entities.length-1].name]); });

          var brushed = function() {
            xScale.domain((brush.empty() ? xScale2.domain() : brush.extent()));
            focus.select("._x._axis").call(xAxis);

            area.forEach(function(v, i) {
              canvas.select(".area" + i).attr("d", area[i](data));
            });

          };

          var brush = d3.svg.brush()
            .x(xScale2)
            .on("brush", brushed);

          var context = canvas.append("g").attr("transform", "translate(" + margin2.left + "," + margin2.top + ")");
          context.append("path")
            .datum(data)
            .attr("class", "area")
            .attr("d", areaBrush);

          context.append("g").attr("class", "_x _axis").attr("transform", "translate(0," + height2 + ")").call(xAxis2);
          context.append("g")
            .attr("class", "_x brush")
            .call(brush)
            .selectAll("rect")
            .attr("y", -6)
            .attr("height", height2 + 7);
          // --- Below chart ---



          hover(data, rData, entities, focus, width, height, xScale, yLeftScale, function(ent) {
            var total = 0;
            ent.forEach(function(e, i) {
              d3.select('.legend .current_value__' + e.name).text(e.currentValue.toFixed(2));
              total += e.currentValue;
            });
            d3.select('.legend .total_value').text(total.toFixed(2));
            d3.select('.legend .date').text(d3.time.format("%Y %b")(ent[ent.length - 1].currentDate));
          });

        }
      };
    });

  function hover(data, rData, entities, focus, width, height, xScale, yLeftScale, onMove) {
    var bisectX = d3.bisector(function(d) { return d.date; }).left;

    // Hover line group. Hide hover group by default.
    var hoverLineGroup = focus.append("g")
      .attr("transform", "translate(0,0)")
      .attr("class", "hover-line")
      .style("opacity", 1e-6);

    var hoverLine = hoverLineGroup
      .append("line")
      .attr("x1", 0).attr("x2", 0)
      .attr("y1", 0).attr("y2", height);


    var hoverPoints = entities.map(function(entity) {
      return hoverLineGroup
        .append("circle")
        .attr("class", "hover_point__" + entity.name)
        .attr("cx", 0)
        .attr("cy", 25)
        .attr("r", 5)
    });

    focus.append("svg:rect")
      .attr("width", width)
      .attr("height", height)
      .attr("fill", "transparent")
      .attr("class", "hover-rect");

    // Add mouseover events.
    d3.select(".hover-rect").on("mouseover", function() {
      console.log('mouseover')
    }).on("mousemove", function() {
      //console.log('mousemove', d3.mouse(this));
      var x = d3.mouse(this)[0];
      hoverLineGroup.style("opacity", 1).attr("transform", "translate(" + x + "," + 0 + ")");

      var focusDataIndex = bisectX(data, xScale.invert(x));

      if ((focusDataIndex > 0) && (focusDataIndex < data.length)) {
        entities.forEach(function(entity, i) {
          hoverPoints[i].attr("cy", yLeftScale(data[focusDataIndex][entity.name]));
          entities[i].currentValue = rData[focusDataIndex][entity.name];
          entities[i].currentDate = rData[focusDataIndex].date;
        });
      }

      onMove(entities);

    })  .on("mouseout", function() {
      console.log('mouseout');
      hoverLineGroup.style("opacity", 1e-6);
    });
  }

})();

