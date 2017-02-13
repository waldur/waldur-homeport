'use strict';

(function() {

  angular.module('ncsaas').directive('responsiveTable', responsiveTable);

  responsiveTable.$inject = ['$timeout', '$interval', '$compile', '$filter', 'ENV', 'features'];

  /*
    Controller should define tableOptions object with list of columns in `columns` field.
    Each column has following format:

    - `title` is required field; it is passed to `translate` filter for i18n;

    - `render` is required field; this is a function which accepts row as
      it's single argument and returns HTML code;

    - `feature` is optional field; it allows to toggle display of
      field according to configuration parameter `toBeFeatures`.
  */

  function responsiveTable($timeout, $interval, $compile, $filter, ENV, features) {
    return {
      restrict: 'E',
      scope: {
        controller: '=tableCtrl',
        isVisible: '='
      },
      template: '<table class="table table-striped"></table>',
      link: function(scope, element) {
        var options = scope.controller.tableOptions;
        var table;

        scope.$watch('controller.tableOptions', function(newTableOptions) {
          if (table) {
            // Table should be initialized once
            return;
          }
          if (newTableOptions && newTableOptions.columns) {
            options = newTableOptions;
            if (options.hiddenColumns) {
              options.columns = options.columns.filter(function(column) {
                return options.hiddenColumns.indexOf(column.id) === -1;
              });
            }
            table = initTable();
            connectRowButtons(table);

            if (!newTableOptions.disableAutoUpdate) {
              connectWatcher(table);
            }
            registerEvents(table);
          }
        });

        // http://www.gyrocode.com/articles/jquery-datatables-column-width-issues-with-bootstrap-tabs
        scope.$watch('isVisible', function(value) {
          if (table) {
            $timeout(function() {
              table.columns.adjust().responsive.recalc();
            })
          }
        });

        function initTable() {
          var buttons = getButtons();
          var columns = getColumns();
          var dom = getDom();

          var tableOptions = {
            responsive: true,
            processing: true,
            serverSide: true,
            ordering: !!options.enableOrdering,
            autoWidth: false,
            ajax: serverDataTableCallback,
            dom: dom,
            buttons: buttons && buttons,
            columns: columns,
            language: {
              emptyTable: $filter('translate')(options.noDataText),
              zeroRecords: $filter('translate')(options.noMatchesText)
            },
            fnDrawCallback: function() {
              $(element).find('tr').each(function(index, element) {
                $compile(element)(scope);
              });
            }
          };

          if (options.scrollY) {
            tableOptions.scrollY = options.scrollY;
          }

          if (options.scrollCollapse) {
            tableOptions.scrollCollapse = options.scrollCollapse;
          }

          return $(element.find('.table')[0]).DataTable(tableOptions);
        }

        function getDom() {
          if (options.disableButtons) {
            return 'Tgitp';
          } else if (options.disableSearch) {
            return '<"html5buttons"B>rgitp'
          } else {
            return '<"html5buttons"B>lTfgitp';
          }
        }

        function getButtons() {
          if (options.disableButtons) {
            return;
          }

          var exportButtons = getExportButtons(
            options.columns.length,
            options.rowActions,
            ['copyHtml5', 'csvHtml5', 'excelHtml5', 'pdfHtml5', 'print']
          );
          var exportCollection = {
            extend: 'collection',
            text: '<i class="fa fa-download"></i> Export as <span class="caret"></span>',
            autoClose: true,
            fade: 0,
            buttons: exportButtons
          };
          var buttons = [exportCollection];
          if (options.tableActions) {
            var tableButtons = getTableButtons(options.tableActions);
            buttons = buttons.concat(tableButtons);
          }
          buttons.push({
            text: '<i class="fa fa-refresh"></i> Refresh',
            action: function() {
              $timeout(function() {
                scope.controller.resetCache();
              });
            }
          });
          return buttons;
        }

        function getColumns() {
          var columns = options.columns.map(function(column) {
            var title = $filter('translate')(title);
            function render(data, type, row, meta) {
              return column.render(row);
            };
            return angular.extend({}, column, {render: render, title: title});
          });
          columns = columns.filter(function(column) {
            return !column.feature || features.isVisible(column.feature);
          });
          if (options.rowActions && options.rowActions.length) {
            var actionColumn = getActionColumn(options.rowActions, options.actionsColumnWidth);
            columns.push(actionColumn);
          }
          return columns;
        }

        function connectWatcher(table) {
          scope.$watchCollection('controller.list', function() {
            table.draw(false);
          });

          var timer = $interval(
            scope.controller.resetCache.bind(scope.controller),
            ENV.countersTimerInterval * 1000
          );
          scope.$on('$destroy', function() {
            $interval.cancel(timer);
          });
        }

        function getTableButtons(actions) {
          return actions.map(function(action) {
            return {
              text: action.name,
              action: function() {
                $timeout(function() {
                  action.callback();
                });
              },
              className: action.disabled && 'disabled' || '',
              titleAttr: action.titleAttr
            };
          });
        }

        function registerEvents(table) {
          table.on('click', 'tr', function() {
            var tr = $(this).closest('tr');
            var row = table.row(tr);
            var rowShown = false;
            table.rows().every(function(rowIndex){
              if (table.row(rowIndex).child.isShown()) {
                rowShown = true;
              }
            });
            if (rowShown) {
              scope.controller.toggleRefresh(true);
            }
            else {
              scope.controller.toggleRefresh(false);
            }
          });
        }

        function connectRowButtons(table) {
          if (!options.rowActions || options.rowActions instanceof Function) {
            return;
          }
          table.on('click', 'button', function(event) {
            $(this).blur();
            var target = $(event.target).closest('button');
            var rowIndex = parseInt(target.attr('row-index'));
            var actionIndex = parseInt(target.attr('action-index'));
            var action = options.rowActions[actionIndex];
            var row = scope.controller.list[rowIndex];
            $timeout(function() {
              if (action.isDisabled && action.isDisabled(row)) {
                return;
              }
              action.callback.apply(scope, [row]);
            });
          });
        }

        function getActionColumn(spec, width) {
          return {
            title: 'Actions',
            orderable: false,
            className: 'actions text-center all',
            render: function(data, type, row, meta) {
              if (options.rowActions instanceof Function) {
                return options.rowActions.call(scope.controller, row);
              }
              var template = '<button title="{tooltip}" class="btn btn-default btn-sm {cls}" {disabled} row-index="{row}" action-index="{action}">{name}</button>';
              var buttons = spec.map(function(action, index) {
                var disabled = action.isDisabled && action.isDisabled(row) && 'disabled' || '';
                var tooltip = action.tooltip && action.tooltip(row) || '';
                return template.replace('{disabled}', disabled)
                               .replace('{cls}', action.className)
                               .replace('{row}', meta.row)
                               .replace('{action}', index)
                               .replace('{name}', action.name)
                               .replace('{tooltip}', tooltip);
              }).join('');
              return '<div class="btn-group">' + buttons + '</div>';
            },
            width: width
          };
        }

        function getExportButtons(columnsCount, rowActions, formats) {
          var title = document.title + ' - ' + moment().format('YYYY-MM-DD');
          var exportOptions = {};
          if (rowActions) {
            exportOptions.columns = range(columnsCount);
          }
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
          request.order.forEach(function(orderItem) {
            var orderField = options.columns[orderItem.column].orderField;
            filter.o = orderItem.dir === 'asc' ? orderField : '-' + orderField;
          });
          scope.controller.requestLoad(request, filter).then(function(list) {
            var total = scope.controller.getTotal();
            drawCallback({
              draw: request.draw,
              recordsTotal: total,
              recordsFiltered: total,
              data: scope.controller.list
            });
          });
        }
      }
    };
  }
})();
