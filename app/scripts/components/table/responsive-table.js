/*
  Controller should define tableOptions object with list of columns in `columns` field.
  Each column has following format:

  - `title` is required field; it is passed to `translate` filter for i18n;

  - `render` is required field; this is a function which accepts row as
    it's single argument and returns HTML code;

  - `feature` is optional field; it allows to toggle display of
    field according to configuration parameter `toBeFeatures`.
*/

// @ngInject
export default function responsiveTable($rootScope, $q, $timeout, $interval, $compile, $filter, ENV, features) {
  return {
    restrict: 'E',
    scope: {
      controller: '=tableCtrl',
      isVisible: '='
    },
    template: '<table class="table table-striped"></table>',
    link: function(scope, element) {
      // Inject scope so that timers are cancelled
      scope.controller.controllerScope.$$scope = scope;

      var options = scope.controller.tableOptions;
      var table;
      var rootScopeListener;

      scope.$on('updateRow', (event, args) => {
        let data = args.data;
        table.rows().every(function() {
          let rowData = this.data();
          if (rowData.uuid === data.uuid) {
            table.row(this).data(data).draw();
          }
        });
      });

      scope.$on('removeRow', (event, args) => {
        let uuid = args.data;
        table.rows().every(function() {
          let rowData = this.data();
          if (rowData && rowData.uuid === uuid) {
            table.row(this).remove().draw();
          }
        });
      });

      scope.$on('gotoFirstPage', () => {
        table.page('first').draw();
      });

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
          connectEventListeners(table);
          connectRowButtons(table);

          if (!newTableOptions.disableAutoUpdate) {
            connectWatcher(table);
          }
          connectTranslate(table);
          registerEvents(table);
        }
      });

      // http://www.gyrocode.com/articles/jquery-datatables-column-width-issues-with-bootstrap-tabs
      scope.$watch('isVisible', function() {
        if (table) {
          $timeout(function() {
            table.columns.adjust().responsive.recalc();
          });
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
          select: options.select || false,
          ajax: serverDataTableCallback,
          dom: dom,
          buttons: buttons && buttons,
          columns: columns,
          language: {
            emptyTable:     $filter('translate')(options.noDataText),
            zeroRecords:    $filter('translate')(options.noMatchesText),
            info:           $filter('translate')(gettext('Showing _START_ to _END_ of _TOTAL_ entries')),
            lengthMenu:     $filter('translate')(gettext('Show _MENU_ entries')),
            loadingRecords: $filter('translate')(gettext('Loading...')),
            processing:     $filter('translate')(gettext('Processing...')),
            search:         $filter('translate')(gettext('Search')),
            paginate: {
              first:        $filter('translate')(gettext('First')),
              last:         $filter('translate')(gettext('Last')),
              next:         $filter('translate')(gettext('Next')),
              previous:     $filter('translate')(gettext('Previous')),
            },
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

      function connectEventListeners(table) {
        table.on('select', function(event, datatable, type, indexes) {
          if (type === 'row') {
            let items = [];
            table.rows(indexes).every(function() {
              items.push(this.data());
            });
            if (scope.controller.onSelect) {
              scope.controller.onSelect(items);
            }
          }
        });

        table.on('deselect', function(event, datatable, type, indexes) {
          if (type === 'row') {
            let items = [];
            table.rows(indexes).every(function() {
              items.push(this.data());
            });
            if (scope.controller.onDeselect) {
              scope.controller.onDeselect(items);
            }
          }
        });

        // eslint-disable-next-line no-unused-vars
        table.on('responsive-display.dt', function(event, datatable, row, show) {
          if (show) {
            $compile(row.node().nextSibling)(scope);
          }
        });
      }

      function getDom() {
        if (options.disableButtons) {
          return 'Tgitp';
        } else if (options.disableSearch) {
          return '<"html5buttons"B>rgitp';
        } else {
          return '<"html5buttons"B>lTfgitp';
        }
      }

      function getButtons() {
        if (options.disableButtons) {
          return;
        }

        var exportButtonTitle = $filter('translate')(gettext('Export as'));
        var exportButtonText = '<i class="fa fa-download"></i> ' + exportButtonTitle + ' <i class="caret"></i>';

        var refreshButtonTitle = $filter('translate')(gettext('Refresh'));
        var refreshButtonText = '<i class="fa fa-refresh"></i> ' + refreshButtonTitle;

        var exportButtons = getExportButtons(
          options.columns.length,
          options.rowActions,
          ['copyHtml5', 'csvHtml5', 'excelHtml5', 'pdfHtml5', 'print']
        );
        var exportCollection = {
          extend: 'collection',
          text: exportButtonText,
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
          text: refreshButtonText,
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
          var title = $filter('translate')(column.title);
          // eslint-disable-next-line no-unused-vars
          function render(data, type, row, meta) {
            return column.render(row);
          }
          return angular.extend({}, column, {
            render: render,
            title: title
          });
        });
        columns = columns.filter(function(column) {
          return !column.feature || features.isVisible(column.feature);
        });
        columns = columns.filter(column => !column.hasOwnProperty('isVisible') || column.isVisible());
        if (options.rowActions && options.rowActions.length) {
          var actionColumn = getActionColumn(options.rowActions, options.actionsColumnWidth);
          columns.push(actionColumn);
        }
        return columns;
      }

      function connectTranslate(table) {
        if(rootScopeListener) {
          rootScopeListener();
          rootScopeListener = null;
        }
        rootScopeListener = $rootScope.$on('$translateChangeSuccess', function() {
          angular.forEach(getColumns(), function(column, index) {
            table.columns(index).header().to$().text(column.title);
          });
          table.columns.adjust().draw();
          angular.forEach(getButtons(), function(button, index) {
            table.buttons(index).text(button.text);
          });
        });
        scope.$on('$destroy', function() {
          if(rootScopeListener) {
            rootScopeListener();
          }
        });
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

      function setupActionWatcher(action, uniqueClassName) {
        if (action.hasOwnProperty('isDisabled')) {
          scope.$watch(action.isDisabled, function(newValue, oldValue){
            if (newValue !== oldValue) {
              let action = $('.' + uniqueClassName);
              action.toggleClass('disabled');
              // title is lost through clojures, clean it up from leftovers.
              action.removeAttr('title');
            }
          });
        }
      }

      function getTableButtons(actions) {
        return actions.map(function(action, index) {
          let uniqueClassName = 'btn-' + index;
          setupActionWatcher(action, uniqueClassName);

          return {
            text: formatActionName(action),
            action: function() {
              $timeout(function() {
                action.callback();
              });
            },
            className: (action.disabled && 'disabled' || '') + ' ' + uniqueClassName,
            titleAttr: action.titleAttr
          };
        });
      }

      function registerEvents(table) {
        table.on('click', 'tr', function() {
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
          title: $filter('translate')(gettext('Actions')),
          orderable: false,
          className: 'actions text-center min-tablet-l',
          render: function(data, type, row, meta) {
            if (options.rowActions instanceof Function) {
              return options.rowActions.call(scope.controller, row);
            }
            var template = '<button title="{tooltip}" class="btn btn-default btn-sm {cls}" {disabled} row-index="{row}" action-index="{action}">{name}</button>';
            var visibleButtons = spec.filter((action) => !action.hasOwnProperty('isVisible') || action.isVisible(row));
            var buttons = visibleButtons.map(function(action, index) {
              var disabled = action.isDisabled && action.isDisabled(row) && 'disabled' || '';
              var tooltip = action.tooltip && action.tooltip(row) || '';
              return template.replace('{disabled}', disabled)
                             .replace('{cls}', action.className)
                             .replace('{row}', meta.row)
                             .replace('{action}', index)
                             .replace('{name}', formatActionName(action))
                             .replace('{tooltip}', tooltip);
            }).join('');
            return '<div class="btn-group">' + buttons + '</div>';
          },
          width: width
        };
      }

      function formatActionName(action) {
        var name = '';
        if (action.iconClass) {
          name = '<i class="' + action.iconClass + '"></i> ';
        }
        name += $filter('translate')(action.title);
        return name;
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

      // eslint-disable-next-line no-unused-vars
      function serverDataTableCallback(request, drawCallback, settings) {
        var filter = {};
        request.order.forEach(function(orderItem) {
          var orderField = options.columns[orderItem.column].orderField;
          filter.o = orderItem.dir === 'asc' ? orderField : '-' + orderField;
        });
        let selectedItems = getSelectedItems(table);
        scope.controller.requestLoad(request, filter).then(function() {
          var total = scope.controller.getTotal();
          $q.when([drawCallback({
            draw: request.draw,
            recordsTotal: total,
            recordsFiltered: total,
            data: scope.controller.list
          })]).then(function() {
            selectItems(table, selectedItems);
          });
        });
      }

      function selectItems(table, selectedItems) {
        if (!selectedItems) {
          return;
        }

        table.rows().every(function(index) {
          let data = this.data();
          let isSelected = selectedItems.filter(function(item) {
            return item.name === data.name;
          })[0];
          if (isSelected) {
            this.row(index).select();
          }
        });
      }

      function getSelectedItems(table) {
        let items = [];

        if (table) {
          table.rows({selected: true}).every(function() {
            items.push(this.data());
          });
        }

        return items;
      }
    }
  };
}
