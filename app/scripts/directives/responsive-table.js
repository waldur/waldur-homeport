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
        $(element.find('table')[0]).DataTable({
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
          columns: scope.controller.columns
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

  angular.module('ncsaas').controller('ProjectListController', ProjectListController);

  ProjectListController.$inject = ['$state', 'projectsService'];

  function ProjectListController($state, projectsService) {
    this.service = projectsService;
    this.columns = [
      {
        data: 'uuid',
        title: 'ID'
      },
      {
        data: 'name',
        title: 'Project name'
      },
      {
        title: 'Customer name',
        render: function(data, type, row, meta) {
          var href = $state.href('organization.details', {uuid: row.customer_uuid});
          return '<a href="' + href + '">' + row.customer_name + '</a>';
        }
      }
    ];
  }
})();
