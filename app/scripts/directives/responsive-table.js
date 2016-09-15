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
        var rowActions = {
          title: 'Actions',
          orderable: false,
          render: function(data, type, row, meta) {
            return scope.controller.rowActions.map(function(action, index) {
              return '<button class="btn btn-default" row-index="' + meta.row + '" action-index="' + index + '">' + action.name + '</button>';
            }).join('');
          }
        }

        var table = $(element.find('table')[0]).DataTable({
          responsive: true,
          processing: true,
          serverSide: true,
          ajax: serverDataTableCallback,
          dom: '<"html5buttons"B>lTfgitp',
          buttons: [
            {extend: 'copy'},
            {extend: 'csv'},
            {extend: 'excel'},
            {extend: 'pdf'}
          ],
          columns: scope.controller.columns.concat([rowActions])
        });

        table.on('click', 'button', function(event) {
          var rowIndex = $(event.target).attr('row-index');
          var actionIndex = $(event.target).attr('action-index');
          var action = scope.controller.rowActions[actionIndex];
          var row = scope.controller.list[rowIndex];
          $timeout(function() {
            action.callback.apply(scope.controller, [row]);
          });
        });

        function serverDataTableCallback(request, drawCallback, settings) {
          var filter = {};
          if (request.search.value) {
            filter[scope.controller.searchFieldName] = request.search.value;
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
