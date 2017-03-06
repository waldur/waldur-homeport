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
        noDataText: gettext('No support requests yet.'),
        noMatchesText: gettext('No support requests found matching filter.'),
        columns: [
          {
            id: 'type',
            title: gettext('Type'),
            orderField: 'type',
            render: function(row) {
              return $filter('translate')(row.type).toUpperCase();
            },
            width: 90
          },
          {
            id: 'key',
            title: gettext('Key'),
            orderField: 'key',
            render: function(row) {
              var href = $state.href('support.detail', {uuid: row.uuid});
              return ncUtils.renderLink(href, row.key);
            },
            width: 90
          },
          {
            id: 'status',
            title: gettext('Status'),
            orderField: 'status',
            render: function(row) {
              return row.status;
            },
            width: 50
          },
          {
            id: 'title',
            title: gettext('Title'),
            orderField: 'summary',
            render: function(row) {
              return `<span class="elipsis" style="width: 150px;" uib-tooltip="${row.summary}">${row.summary}</span>`;
            },
            width: 400
          },
          {
            id: 'description',
            title: gettext('Description'),
            orderable: false,
            render: function(row) {
              return `<span class="elipsis" style="width: 150px;" uib-tooltip="${row.description}">${row.description}</span>`;
            }
          },
          {
            id: 'resource_type',
            title: gettext('Service type'),
            orderable: false,
            render: function(row) {
              return row.resource_type || 'N/A';
            }
          },
          {
            id: 'customer',
            title: gettext('Organization'),
            orderField: 'customer_name',
            render: function(row) {
              return row.customer_name || 'N/A';
            }
          },
          {
            id: 'caller',
            title: gettext('Caller'),
            orderField: 'caller_full_name',
            render: function(row) {
              return row.caller_full_name || 'N/A';
            },
            width: 170
          },
          {
            id: 'reporter',
            title: gettext('Reporter'),
            orderField: 'reporter_name',
            render: function(row) {
              return row.reporter_name || 'N/A';
            },
            width: 170
          },
          {
            id: 'assignee',
            title: gettext('Assigned to'),
            orderField: 'assignee_name',
            render: function(row) {
              return row.assignee_name || 'N/A';
            },
            width: 170
          },
          {
            id: 'created',
            title: gettext('Created'),
            orderField: 'created',
            render: function(row) {
              return $filter('shortDate')(row.created);
            },
            width: 130
          },
          {
            id: 'modified',
            title: gettext('Updated'),
            orderField: 'modified',
            render: function(row) {
              return $filter('shortDate')(row.modified);
            },
            width: 130
          },
          {
            id: 'in_progress',
            title: gettext('Time in progress'),
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
