/*
  Controller should define tableOptions object with list of columns in `columns` field.
  Each column has following format:

  - `title` is required field; it is passed to `translate` filter for i18n;

  - `render` is required field; this is a function which accepts row as
    it's single argument and returns HTML code;

  - `feature` is optional field; it allows to toggle display of
    field according to configuration parameter `toBeFeatures`.
*/

import { formatDate } from '@waldur/core/dateUtils';
import { blockingExecutor } from '@waldur/core/services';

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
      let options = scope.controller.tableOptions;
      let table;
      let rootScopeListener;
      const childScope = scope.$new(true, $rootScope);
      childScope.controller = scope.controller;

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

      scope.$watchCollection('controller.tableOptions.hiddenColumns', cols => {
        if (!table) {
          return;
        }
        table.waldurColumns.forEach((col, index) => {
          if (col.id) {
            table.column(index).visible(!cols || cols.indexOf(col.id) === -1);
          }
        });
      });

      scope.$watchCollection('controller.tableOptions.tableActions', actions => {
        if (!table) {
          return;
        }
        actions.map(function(action, index) {
          const button = table.buttons(`.btn-${index}`);
          if (action.disabled) {
            button.disable();
          } else {
            button.enable();
          }
          button.action(function() {
            $timeout(function() {
              action.callback();
            });
          });
        });
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
        let buttons = getButtons();
        let columns = getColumns();
        let dom = getDom();

        let tableOptions = {
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
              try {
                $compile(element)(childScope);
              } catch (e) {
                // Skip error
              }
            });
          }
        };

        if (options.scrollY) {
          tableOptions.scrollY = options.scrollY;
        }

        if (options.scrollCollapse) {
          tableOptions.scrollCollapse = options.scrollCollapse;
        }

        const dt = $(element.find('.table')[0]).DataTable(tableOptions);
        dt.waldurColumns = columns;
        return dt;
      }

      function connectEventListeners(table) {
        function selectionHandler(event, datatable, type) {
          if (type === 'row') {
            let items = [];
            table.rows('.selected').every(function() {
              items.push(this.data());
            });
            if (scope.controller.onSelect) {
              scope.controller.onSelect(items);
            }
          }
        }
        table.on('select', selectionHandler);
        table.on('deselect', selectionHandler);

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

        let exportButtonTitle = $filter('translate')(gettext('Export as'));
        let exportButtonText = '<i class="fa fa-download"></i> ' + exportButtonTitle + ' <i class="caret"></i>';

        let refreshButtonTitle = $filter('translate')(gettext('Refresh'));
        let refreshButtonText = '<i class="fa fa-refresh"></i> ' + refreshButtonTitle;

        let exportButtons = getExportButtons(
          options.columns.length,
          options.rowActions,
          ['copyHtml5', 'csvHtml5', 'excelHtml5', 'pdfHtml5', 'print']
        );
        let exportCollection = {
          extend: 'collection',
          text: exportButtonText,
          autoClose: true,
          fade: 0,
          buttons: exportButtons
        };
        let buttons = [exportCollection];
        if (options.tableActions) {
          let tableButtons = getTableButtons(options.tableActions);
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
        let columns = options.columns.map(function(column) {
          let title = $filter('translate')(column.title);
          // eslint-disable-next-line no-unused-vars
          function render(data, type, row, meta) {
            return column.render(row);
          }
          return angular.extend({}, column, {
            render: render,
            title: title,
            orderable: column.hasOwnProperty('orderField'),
          });
        });
        columns = columns.filter(function(column) {
          return !column.feature || features.isVisible(column.feature);
        });
        columns = columns.filter(column => !column.hasOwnProperty('isVisible') || column.isVisible());
        if (options.rowActions && options.rowActions.length) {
          let actionColumn = getActionColumn(options.rowActions, options.actionsColumnWidth);
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
          if(childScope) {
            childScope.$destroy();
          }
        });
      }

      function connectWatcher(table) {
        scope.$watchCollection('controller.list', function() {
          table.draw(false);
        });

        let timer = $interval(
          blockingExecutor(scope.controller.resetCache.bind(scope.controller)),
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
          let rowShown = false;
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
          let target = $(event.target).closest('button');
          let rowIndex = parseInt(target.attr('row-index'));
          let actionIndex = parseInt(target.attr('action-index'));
          let action = options.rowActions[actionIndex];
          let row = scope.controller.list[rowIndex];
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
            let template = '<button title="{tooltip}" class="btn btn-default btn-sm {cls}" {disabled} row-index="{row}" action-index="{action}">{name}</button>';
            let visibleButtons = spec.filter((action) => !action.hasOwnProperty('isVisible') || action.isVisible(row));
            let buttons = visibleButtons.map(function(action, index) {
              let disabled = action.isDisabled && action.isDisabled(row) && 'disabled' || '';
              let tooltip = action.tooltip && action.tooltip(row) || '';
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
        let name = '';
        if (action.iconClass) {
          name = '<i class="' + action.iconClass + '"></i> ';
        }
        name += $filter('translate')(action.title);
        return name;
      }

      function getExportButtons(columnsCount, rowActions, formats) {
        let title = document.title + ' - ' + formatDate(new Date());
        let exportOptions = {};
        if (rowActions) {
          exportOptions.columns = range(columnsCount);
        }
        return formats.map(function(format) {
          return {
            extend: format,
            exportOptions: exportOptions,
            title: title,
            customize: doc => {
              if (format === 'pdfHtml5') {
                const defaultFont = ENV.defaultFont;
                if (defaultFont) {
                  doc.defaultStyle = {
                    font: defaultFont,
                  };
                }
              }
              return doc;
            }
          };
        });
      }

      function range(n) {
        let x = [];
        for (let i = 0; i < n; i++) {
          x.push(i);
        }
        return x;
      }

      // eslint-disable-next-line no-unused-vars
      function serverDataTableCallback(request, drawCallback, settings) {
        let filter = {};
        request.order.forEach(function(orderItem) {
          let orderField = options.columns[orderItem.column].orderField;
          filter.o = orderItem.dir === 'asc' ? orderField : '-' + orderField;
        });
        let selectedItems = getSelectedItems(table);
        scope.controller.requestLoad(request, filter).then(function() {
          let total = scope.controller.getTotal();
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
