import { ISSUE_CLASSES, ISSUE_FILTERS } from './constants';
import template from './issues-list.html';

export default function issueList() {
  return {
    restrict: 'E',
    template: template,
    controller: IssueListController,
    controllerAs: '$ctrl',
    scope: {},
    bindToController: {
      filter: '='
    }
  };
}

// @ngInject
function IssueListController(baseControllerListClass, issuesService, $filter, $scope, $state, ncUtils) {
  var controllerScope = this;
  var controllerClass = baseControllerListClass.extend({
    init: function() {
      this.service = issuesService;
      this.controllerScope = controllerScope;
      this._super();
      this.searchFieldName = 'search';
      this.tableOptions = {
        disableAutoUpdate: true,
        disableSearch: true,
        enableOrdering: true,
        entityData: {
          noDataText: 'No tickets yet.',
          noMatchesText: 'No tickets found matching filter.',
        },
        columns: [
          {
            title: 'Type',
            orderField: 'type',
            render: function(data, type, row, meta) {
              return row.type.toUpperCase();
            },
            width: 90
          },
          {
            title: 'Key',
            orderField: 'key',
            render: function(data, type, row, meta) {
              var href = $state.href('support.detail', {uuid: row.uuid});
              return ncUtils.renderLink(href, row.key);
            },
            width: 90
          },
          {
            title: 'Status',
            orderField: 'status',
            render: function(data, type, row, meta) {
              return row.status;
            },
            width: 50
          },
          {
            title: 'Title',
            orderField: 'summary',
            render: function(data, type, row, meta) {
              return row.summary;
            },
            width: 400
          },
          {
            title: 'Description',
            orderable: false,
            render: function(data, type, row, meta) {
              return `<span class="elipsis" style="width: 150px;" uib-tooltip="${row.description}">${row.description}</span>`;
            }
          },
          {
            title: 'Scope',
            orderable: false,
            render: function(data, type, row, meta) {
              return row.resource_type || 'N/A';
            }
          },
          {
            title: 'Organization',
            orderField: 'customer_name',
            render: function(data, type, row, meta) {
              return row.customer_name;
            }
          },
          {
            title: 'Caller',
            orderField: 'caller_name',
            render: function(data, type, row, meta) {
              return row.caller_name;
            },
            width: 170
          },
          {
            title: 'Reporter',
            orderField: 'reporter_name',
            render: function(data, type, row, meta) {
              return row.reporter_name;
            },
            width: 170
          },
          {
            title: 'Assigned to',
            orderField: 'assignee_name',
            render: function(data, type, row, meta) {
              return row.assignee_name || 'N/A';
            },
            width: 170
          },
          {
            title: 'Created',
            orderField: 'created',
            render: function(data, type, row, meta) {
              return $filter('shortDate')(row.created);
            },
            width: 130
          },
          {
            title: 'Updated',
            orderField: 'modified',
            render: function(data, type, row, meta) {
              return $filter('shortDate')(row.modified);
            },
            width: 130
          },
          {
            title: 'Time in progress',
            orderable: false,
            render: function(data, type, row, meta) {
              return '1h';
            },
            width: 100
          }
        ]
      };
      $scope.$watch(() => controllerScope.filter, filter => {
        controllerScope.getList();
      }, true);
    },
    getFilter: function() {
      return controllerScope.filter;
    }
  });

  controllerScope.__proto__ = new controllerClass();
}
