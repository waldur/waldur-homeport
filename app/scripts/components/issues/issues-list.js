import template from './issues-list.html';

export default function issueList() {
  return {
    restrict: 'E',
    template: template,
    controller: IssueListController,
    controllerAs: '$ctrl',
    scope: {},
    bindToController: {
      filter: '=',
      options: '='
    }
  };
}

// @ngInject
function IssueListController(
    baseControllerListClass, issuesService, $filter, $scope, $rootScope, $state, ncUtils) {
  var controllerScope = this;
  var controllerClass = baseControllerListClass.extend({
    init: function() {
      this.service = issuesService;
      this.controllerScope = controllerScope;
      this._super();
      this.tableOptions = angular.extend({
        disableAutoUpdate: true,
        disableSearch: true,
        enableOrdering: true,
        searchFieldName: 'summary',
        noDataText: 'No requests yet.',
        noMatchesText: 'No requests found matching filter.',
        columns: [
          {
            title: 'Type',
            orderField: 'type',
            render: function(row) {
              return row.type.toUpperCase();
            },
            width: 90
          },
          {
            title: 'Key',
            orderField: 'key',
            render: function(row) {
              var href = $state.href('support.detail', {uuid: row.uuid});
              return ncUtils.renderLink(href, row.key);
            },
            width: 90
          },
          {
            title: 'Status',
            orderField: 'status',
            render: function(row) {
              return row.status;
            },
            width: 50
          },
          {
            title: 'Title',
            orderField: 'summary',
            render: function(row) {
              return row.summary;
            },
            width: 400
          },
          {
            title: 'Description',
            orderable: false,
            render: function(row) {
              return `<span class="elipsis" style="width: 150px;" uib-tooltip="${row.description}">${row.description}</span>`;
            }
          },
          {
            title: 'Service type',
            orderable: false,
            render: function(row) {
              return row.resource_type || 'N/A';
            }
          },
          {
            title: 'Organization',
            orderField: 'customer_name',
            render: function(row) {
              return row.customer_name;
            }
          },
          {
            title: 'Caller',
            orderField: 'caller_full_name',
            render: function(row) {
              return row.caller_full_name;
            },
            width: 170
          },
          {
            title: 'Reporter',
            orderField: 'reporter_name',
            render: function(row) {
              return row.reporter_name;
            },
            width: 170
          },
          {
            title: 'Assigned to',
            orderField: 'assignee_name',
            render: function(row) {
              return row.assignee_name || 'N/A';
            },
            width: 170
          },
          {
            title: 'Created',
            orderField: 'created',
            render: function(row) {
              return $filter('shortDate')(row.created);
            },
            width: 130
          },
          {
            title: 'Updated',
            orderField: 'modified',
            render: function(row) {
              return $filter('shortDate')(row.modified);
            },
            width: 130
          },
          {
            title: 'Time in progress',
            orderable: false,
            render: function(row) {
              return ncUtils.relativeDate(row.created);
            },
            width: 100
          }
        ]
      }, controllerScope.options || {});
      this.connectWatchers();
    },
    connectWatchers: function() {
      $scope.$watch(() => controllerScope.filter, () => {
        controllerScope.getList();
      }, true);
      var unbind = $rootScope.$on('refreshIssuesList', () => {
        this.service.clearAllCacheForCurrentEndpoint();
        controllerScope.getList();
      });
      $scope.$on('$destroy', () => {
        unbind();
      });
    },
    getFilter: function() {
      return controllerScope.filter;
    }
  });

  controllerScope.__proto__ = new controllerClass();
}
