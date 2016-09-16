'use strict';

(function() {

  angular.module('ncsaas').directive('responsiveTable', responsiveTable);

  function responsiveTable($timeout) {
    return {
      restrict: 'E',
      scope: {
        controller: '=tableCtrl'
      },
      template: '<table class="table table-striped table-bordered table-hover"/>',
      link: function(scope, element) {
        var options = scope.controller.tableOptions;

        var table = initTable();
        connectRowButtons(table);

        function initTable() {
          var exportButtons = getExportButtons(
            options.columns.length,
            ['copyHtml5', 'csvHtml5', 'excelHtml5', 'pdfHtml5', 'print']
          );
          var tableButtons = getTableButtons(options.tableActions || []);
          var buttons = exportButtons.concat(tableButtons)

          var actionColumn = getActionColumn(options.rowActions || []);
          var columns = options.columns.concat([actionColumn]);

          var table = $(element.find('table')[0]).DataTable({
            responsive: true,
            processing: true,
            serverSide: true,
            ajax: serverDataTableCallback,
            dom: '<"html5buttons"B>lTfgitp',
            buttons: buttons,
            columns: columns
          });
          return table;
        }

        function getTableButtons(actions) {
          return actions.map(function(action) {
            return {
              text: action.name,
              action: function() {
                $timeout(function() {
                  action.callback();
                });
              }
            };
          });
        }

        function connectRowButtons(table) {
          table.on('click', 'button', function(event) {
            $(this).blur();
            var rowIndex = parseInt($(event.target).attr('row-index'));
            var actionIndex = parseInt($(event.target).attr('action-index'));
            var action = options.rowActions[actionIndex];
            var row = scope.controller.list[rowIndex];
            $timeout(function() {
              action.callback.apply(scope, [row]);
            });
          });
        }

        function getActionColumn(spec) {
          return {
            title: 'Actions',
            orderable: false,
            render: function(data, type, row, meta) {
              return spec.map(function(action, index) {
                return '<button class="btn btn-default" row-index="' + meta.row + '" action-index="' + index + '">' + action.name + '</button>';
              }).join('');
            }
          };
        }

        function getExportButtons(columnsCount, formats) {
          var title = document.title + ' - ' + moment().format('YYYY-MM-DD');
          var exportOptions = {
            columns: range(columnsCount)
          };
          return formats.map(function(format) {
            return {
              extend: format,
              exportOptions: exportOptions,
              title: title
            };
          });
        }

        function range(n) {
          var x = [];
          for (var i = 0; i < n; i++) {
            x.push(i);
          }
          return x;
        }

        function serverDataTableCallback(request, drawCallback, settings) {
          var filter = {};
          if (request.search.value) {
            filter[options.searchFieldName] = request.search.value;
          }
          var service = scope.controller.service;
          service.pageSize = request.length;
          service.page = Math.ceil(request.start / request.length) + 1;
          service.getList(filter).then(function(list) {
            scope.controller.list = list;
            var total = service.resultCount;
            drawCallback({
              draw: request.draw,
              recordsTotal: total,
              recordsFiltered: total,
              data: list
            });
          });
        }
      }
    };
  }
})();
