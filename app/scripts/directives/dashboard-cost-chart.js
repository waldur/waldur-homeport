'use strict';

(function() {

  angular.module('ncsaas')
    .directive('dashboardCostChart', function($window) {
      return {
        restrict: 'E',
        replace: true,
        templateUrl: "views/directives/dashboard-cost-chart.html",
        link: function (scope, element, attrs) {
          //var data = attrs.data.split(',');

          var data = d3.csv.parse(getData());

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
            left: 10
          };

          var margin2 = {
            top: 360,
            right: 60,
            bottom: 30,
            left: 10
          };

          var bindId = "#chart";
          var formatDate = d3.time.format("%b-%d-%Y");
          var parseDate = formatDate.parse;

          var d, i, len;
          for (i = 0, len = data.length; i < len; i++) {
            d = data[i];
            d.date = parseDate(d.date);
            d.price = +d.price;
            d.yoy = (parseFloat(d.price) + parseFloat(d.yoy)).toFixed(2);
          }

          var width = 760 - margin.left - margin.right;
          var height = 450 - margin.top - margin.bottom;
          var height2 = 450 - margin2.top - margin2.bottom;

          var xScale = d3.time.scale().range([0,width]).domain(d3.extent(data, function (d) { return d.date }));
          var xAxis = d3.svg.axis().scale(xScale).orient("bottom").ticks(5);

          var line1Min = d3.min(data, function (d) { return parseFloat(d.price) });
          var line1Max = d3.max(data, function (d) { return parseFloat(d.price) });
          var line2Min = d3.min(data, function (d) { return parseFloat(d.yoy) });
          var line2Max = d3.max(data, function (d) { return parseFloat(d.yoy) });
          var yLeftMin = Math.min(line1Min, line2Min);
          var yLeftMax = Math.max(line1Max, line2Max);


          var yLeftScale = d3.scale.linear().domain([yLeftMin, yLeftMax]).range([height, 0]);
          var yLeftAxis = d3.svg.axis().scale(yLeftScale).orient("left");

          var make_y_axis = function() {
            return d3.svg.axis().scale(yLeftScale).orient("left").ticks(10);
          };

          var area1 = d3.svg.area()
            .x(function(d) {
              return xScale(d.date);
            })
            .y0(height)
            .y1(function(d) {
              return yLeftScale(d.price);
            });

          var area2 = d3.svg.area()
            .x(function(d) {
              return xScale(d.date);
            })
            .y0(function(d) {
              return yLeftScale(d.price);
            })
            .y1(function(d) {
              return yLeftScale(d.yoy);
            });

          var zoomed = function () {
            canvas.select("._x._axis").call(xAxis);
            canvas.select(".axisLeft").call(yLeftAxis);
            canvas.select(".y.grid").call(make_y_axis().tickSize(-width, 0, 0).tickFormat(""));
            canvas.select(".area1").attr("d", area1(data));
            canvas.select(".area2").attr("d", area2(data));
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

          drawPathArea(chartBody, area1, data, "", "", "area1");
          drawPathArea(chartBody, area2, data, "", "", "area2");


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
            .y1(function(d) { return yScale2(d.yoy); });

          var brushed = function() {
            xScale.domain((brush.empty() ? xScale2.domain() : brush.extent()));
            focus.select("._x._axis").call(xAxis);
            canvas.select(".area1").attr("d", area1(data));
            return canvas.select(".area2").attr("d", area2(data));
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


          var hoverPoint1 = hoverLineGroup
            .append("circle")
            .attr("cx", 0)
            .attr("cy", 25)
            .attr("r", 5)
            .style("fill", "steelblue");

          var hoverPoint2 = hoverLineGroup
            .append("circle")
            .attr("cx", 0)
            .attr("cy", 25)
            .attr("r", 5)
            .style("fill", "#ed8035");

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
              //console.log(data[focusDataIndex].yoy);
              hoverPoint1.attr("cy", yLeftScale(data[focusDataIndex].price));
              hoverPoint2.attr("cy", yLeftScale(data[focusDataIndex].yoy));
            }

            })  .on("mouseout", function() {
            console.log('mouseout');
            hoverLineGroup.style("opacity", 1e-6);
          });


        }
      };
    });

  function getData() {
    return "date,price,yoy\n" +
      "Nov-01-2011,31.71,0.7\n" +
      "Nov-02-2011,32.58,0.7\n" +
      "Nov-03-2011,33.52,0.7\n" +
      "Nov-04-2011,33.69,0.7\n" +
      "Nov-07-2011,33.44,0.7\n" +
      "Nov-08-2011,33.77,0.7\n" +
      "Nov-09-2011,32.7,0.7\n" +
      "Nov-10-2011,32.9,0.7\n" +
      "Nov-11-2011,33.92,0.7\n" +
      "Nov-14-2011,32.98,0.7\n" +
      "Nov-15-2011,32.25,0.7\n" +
      "Nov-16-2011,32.13,0.7\n" +
      "Nov-17-2011,31.67,0.7\n" +
      "Nov-18-2011,31.57,0.7\n" +
      "Nov-21-2011,31.19,0.7\n" +
      "Nov-22-2011,30.62,0.7\n" +
      "Nov-23-2011,29.87,0.7\n" +
      "Nov-25-2011,29.61,0.7\n" +
      "Nov-28-2011,30.09,0.7\n" +
      "Nov-29-2011,30.27,0.7\n" +
      "Nov-30-2011,32.04,0.7\n" +
      "Dec-01-2011,32.22,2.8\n" +
      "Dec-02-2011,32.98,2.8\n" +
      "Dec-05-2011,33.52,2.8\n" +
      "Dec-06-2011,33.3,2.8\n" +
      "Dec-07-2011,33.51,2.8\n" +
      "Dec-08-2011,33.2,2.8\n" +
      "Dec-09-2011,33.58,2.8\n" +
      "Dec-12-2011,33.18,2.8\n" +
      "Dec-13-2011,31.88,2.8\n" +
      "Dec-14-2011,32.37,2.8\n" +
      "Dec-15-2011,32.59,2.8\n" +
      "Dec-16-2011,32.64,2.8\n" +
      "Dec-19-2011,32.28,2.8\n" +
      "Dec-20-2011,33.44,2.8\n" +
      "Dec-21-2011,34.61,2.8\n" +
      "Dec-22-2011,35.19,2.8\n" +
      "Dec-23-2011,35.67,2.8\n" +
      "Dec-27-2011,35.29,2.8\n" +
      "Dec-28-2011,35.34,2.8\n" +
      "Dec-29-2011,35.51,2.8\n" +
      "Dec-30-2011,35.15,2.8\n" +
      "Dec-31-2011,35.15,2.8,-1.63\n" +
      "Jan-03-2012,35.02,1.2\n" +
      "Jan-04-2012,34.91,1.2\n" +
      "Jan-05-2012,33.97,1.2\n" +
      "Jan-06-2012,34.96,1.2\n" +
      "Jan-09-2012,34.57,1.2\n" +
      "Jan-10-2012,34.42,1.2\n" +
      "Jan-11-2012,34.56,1.2\n" +
      "Jan-12-2012,34.26,1.2\n" +
      "Jan-13-2012,33.74,1.2\n" +
      "Jan-17-2012,33.28,1.2\n" +
      "Jan-18-2012,33.92,1.2\n" +
      "Jan-19-2012,35.53,1.2\n" +
      "Jan-20-2012,35.09,1.2\n" +
      "Jan-23-2012,34.97,1.2\n" +
      "Jan-24-2012,34.6,1.2\n" +
      "Jan-25-2012,34.28,1.2\n" +
      "Jan-26-2012,40.72,1.2\n" +
      "Jan-27-2012,41.42,1.2\n" +
      "Jan-30-2012,41.81,1.2\n" +
      "Jan-31-2012,41.55,1.2\n" +
      "Feb-01-2012,41.32,4.5\n" +
      "Feb-02-2012,41.42,4.5\n" +
      "Feb-03-2012,41.06,4.5\n" +
      "Feb-06-2012,41.27,4.5\n" +
      "Feb-07-2012,42.14,4.5\n" +
      "Feb-08-2012,42.35,4.5\n" +
      "Feb-09-2012,43.13,4.5\n" +
      "Feb-10-2012,42.44,4.5\n" +
      "Feb-13-2012,42,4.5\n" +
      "Feb-14-2012,42.37,4.5\n" +
      "Feb-15-2012,42.25,4.5\n" +
      "Feb-16-2012,41.96,4.5\n" +
      "Feb-17-2012,42.68,4.5\n" +
      "Feb-21-2012,41.35,4.5\n" +
      "Feb-22-2012,41.6,4.5\n" +
      "Feb-23-2012,41.93,4.5\n" +
      "Feb-24-2012,41.72,4.5\n" +
      "Feb-27-2012,41.22,4.5\n" +
      "Feb-28-2012,41.34,4.5\n" +
      "Feb-29-2012,39.6,4.5\n" +
      "Mar-01-2012,38.99,4.5\n" +
      "Mar-02-2012,38.94,4.5\n" +
      "Mar-05-2012,38.68,4.5\n" +
      "Mar-06-2012,38.47,4.5\n" +
      "Mar-07-2012,38.79,4.5\n" +
      "Mar-08-2012,38.62,4.5\n" +
      "Mar-09-2012,37.66,4.5\n" +
      "Mar-12-2012,37.51,4.5\n" +
      "Mar-13-2012,37.63,4.5\n" +
      "Mar-14-2012,36.64,4.5\n" +
      "Mar-15-2012,36.99,4.5\n" +
      "Mar-16-2012,36.24,4.5\n" +
      "Mar-19-2012,36.22,4.5\n" +
      "Mar-20-2012,36.98,4.5\n" +
      "Mar-21-2012,36.86,4.5\n" +
      "Mar-22-2012,36.63,4.5\n" +
      "Mar-23-2012,36.05,4.5\n" +
      "Mar-26-2012,35.99,4.5\n" +
      "Mar-27-2012,36.68,4.5\n" +
      "Mar-28-2012,36.17,4.5\n" +
      "Mar-29-2012,35.68,4.5\n" +
      "Mar-30-2012,35.43,4.5,-7.71\n" +
      "Apr-02-2012,35.75,5.5\n" +
      "Apr-03-2012,35.26,5.5\n" +
      "Apr-04-2012,35.66,5.5\n" +
      "Apr-05-2012,34.97,5.5\n" +
      "Apr-09-2012,33.88,5.5\n" +
      "Apr-10-2012,33.21,5.5\n" +
      "Apr-11-2012,34.43,5.5\n" +
      "Apr-12-2012,34.46,5.5\n" +
      "Apr-13-2012,34.06,5.5\n" +
      "Apr-16-2012,33.88,5.5\n" +
      "Apr-17-2012,34.53,5.5\n" +
      "Apr-18-2012,33.87,5.5\n" +
      "Apr-19-2012,34.24,5.5\n" +
      "Apr-20-2012,33.48,5.5\n" +
      "Apr-23-2012,32.76,5.5\n" +
      "Apr-24-2012,33.81,5.5\n" +
      "Apr-25-2012,35.66,5.5\n" +
      "Apr-26-2012,36.32,5.5\n" +
      "Apr-27-2012,36.72,5.5\n" +
      "Apr-30-2012,36.06,5.5\n" +
      "May-01-2012,35.67,6.5\n" +
      "May-02-2012,35.27,6.5\n" +
      "May-03-2012,35.07,6.5\n" +
      "May-04-2012,33.66,6.5\n" +
      "May-07-2012,33.58,6.5\n" +
      "May-08-2012,33.22,6.5\n" +
      "May-09-2012,33.71,6.5\n" +
      "May-10-2012,33.81,6.5\n" +
      "May-11-2012,34.33,6.5\n" +
      "May-14-2012,33.54,6.5\n" +
      "May-15-2012,33.32,6.5\n" +
      "May-16-2012,26.75,6.5\n" +
      "May-17-2012,25.94,6.5\n" +
      "May-18-2012,26.29,6.5\n" +
      "May-21-2012,26.66,6.5\n" +
      "May-22-2012,26.46,6.5\n" +
      "May-23-2012,27.26,6.5\n" +
      "May-24-2012,27.31,6.5\n" +
      "May-25-2012,28.08,6.5\n" +
      "May-29-2012,28.01,6.5\n" +
      "May-30-2012,27.02,6.5\n" +
      "May-31-2012,26.23,6.5\n" +
      "Jun-01-2012,25.83,4.1\n" +
      "Jun-04-2012,25.27,4.1\n" +
      "Jun-05-2012,24.27,4.1\n" +
      "Jun-06-2012,24.88,4.1\n" +
      "Jun-07-2012,24.65,4.1\n" +
      "Jun-08-2012,25.18,4.1\n" +
      "Jun-11-2012,24,4.1\n" +
      "Jun-12-2012,24.17,4.1\n" +
      "Jun-13-2012,23.71,4.1\n" +
      "Jun-14-2012,24.29,4.1\n" +
      "Jun-15-2012,24.89,4.1\n" +
      "Jun-18-2012,24.33,4.1\n" +
      "Jun-19-2012,22.25,4.1\n" +
      "Jun-20-2012,23.49,4.1\n" +
      "Jun-21-2012,22.72,4.1\n" +
      "Jun-22-2012,22.56,4.1\n" +
      "Jun-25-2012,21.71,4.1\n" +
      "Jun-26-2012,21.95,4.1\n" +
      "Jun-27-2012,21.88,4.1\n" +
      "Jun-28-2012,22.46,4.1\n" +
      "Jun-29-2012,23.31,4.1\n" +
      "Jun-30-2012,23.31,4.1\n" +
      "Jul-02-2012,22.72,4.1\n" +
      "Jul-03-2012,21.88,4.1\n" +
      "Jul-05-2012,22.5,4.1\n" +
      "Jul-06-2012,22.13,4.1\n" +
      "Jul-09-2012,22.03,4.1\n" +
      "Jul-10-2012,20.76,4.1\n" +
      "Jul-11-2012,20.3,4.1\n" +
      "Jul-12-2012,20.04,4.1\n" +
      "Jul-13-2012,20.02,4.1\n" +
      "Jul-16-2012,19.58,4.1\n" +
      "Jul-17-2012,19.25,4.1\n" +
      "Jul-18-2012,19.71,4.1\n" +
      "Jul-19-2012,20.66,4.1\n" +
      "Jul-20-2012,20.62,4.1\n" +
      "Jul-23-2012,20.84,4.1\n" +
      "Jul-24-2012,21.01,4.1\n" +
      "Jul-25-2012,22,4.1\n" +
      "Jul-26-2012,22.21,4.1\n" +
      "Jul-27-2012,23,4.1\n" +
      "Jul-30-2012,22.19,4.1\n" +
      "Jul-31-2012,22.51,4.1\n" +
      "Aug-01-2012,21.02,9.4\n" +
      "Aug-02-2012,20.46,9.4\n" +
      "Aug-03-2012,20.9,9.4\n" +
      "Aug-06-2012,21.21,9.4\n" +
      "Aug-07-2012,21.24,9.4\n" +
      "Aug-08-2012,21.4,9.4\n" +
      "Aug-09-2012,22.1,9.4\n" +
      "Aug-10-2012,23.4,9.4\n" +
      "Aug-13-2012,22.67,9.4\n" +
      "Aug-14-2012,22.98,9.4\n" +
      "Aug-15-2012,23.67,9.4\n" +
      "Aug-16-2012,24.31,9.4\n" +
      "Aug-17-2012,24.1,9.4\n" +
      "Aug-20-2012,24.66,9.4\n" +
      "Aug-21-2012,24.41,9.4\n" +
      "Aug-22-2012,24.4,9.4\n" +
      "Aug-23-2012,24.5,9.4\n" +
      "Aug-24-2012,24.75,9.4\n" +
      "Aug-27-2012,24.65,9.4\n" +
      "Aug-28-2012,25.3,9.4\n" +
      "Aug-29-2012,26.23,9.4\n" +
      "Aug-30-2012,25.99,9.4\n" +
      "Aug-31-2012,26.08,9.4\n" +
      "Sep-04-2012,25.96,9.5\n" +
      "Sep-05-2012,26.43,9.5\n" +
      "Sep-06-2012,27.97,9.5\n" +
      "Sep-07-2012,28.5,9.5\n" +
      "Sep-10-2012,28.7,9.5\n" +
      "Sep-11-2012,29.47,9.5\n" +
      "Sep-12-2012,29.05,9.5\n" +
      "Sep-13-2012,28.66,9.5\n" +
      "Sep-14-2012,28.82,9.5\n"
  }

})();

