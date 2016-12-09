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
function IssueListController(baseControllerListClass, issuesService, $filter, $scope) {
  var controllerScope = this;
  var controllerClass = baseControllerListClass.extend({
    init: function() {
      this.service = issuesService;
      this.controllerScope = controllerScope;
      this._super();
      this.searchFieldName = 'search';
      this.tableOptions = {
        disableButtons: true,
        entityData: {
          noDataText: 'No tickets yet.',
          noMatchesText: 'No tickets found matching filter.',
        },
        tableActions: [
          {
            name: '<i class="fa fa fa-plus"></i> Create new issue',
            callback: function() {
              $state.go('support.create');
            }
          }
        ],
        columns: [
          {
            title: 'Type',
            render: function(data, type, row, meta) {
              return row.type.toUpperCase();
            },
            width: 90
          },
          {
            title: 'Key',
            render: function(data, type, row, meta) {
              return row.key;
            },
            width: 90
          },
          {
            title: 'Status',
            render: function(data, type, row, meta) {
              return row.status;
            },
            width: 50
          },
          {
            title: 'Title',
            render: function(data, type, row, meta) {
              return row.summary;
            },
            width: 400
          },
          {
            title: 'Description',
            render: function(data, type, row, meta) {
              return `<span class="elipsis" style="width: 150px;" uib-tooltip="${row.description}">${row.description}</span>`;
            }
          },
          {
            title: 'Scope',
            render: function(data, type, row, meta) {
              return row.resource_type || 'N/A';
            }
          },
          {
            title: 'Organization',
            render: function(data, type, row, meta) {
              return row.customer_name;
            }
          },
          {
            title: 'Caller',
            render: function(data, type, row, meta) {
              return row.caller_name;
            },
            width: 170
          },
          {
            title: 'Reporter',
            render: function(data, type, row, meta) {
              return row.reporter_name;
            },
            width: 170
          },
          {
            title: 'Assigned to',
            render: function(data, type, row, meta) {
              return row.assignee_name || 'N/A';
            },
            width: 170
          },
          {
            title: 'Created',
            render: function(data, type, row, meta) {
              return $filter('shortDate')(row.created);
            },
            width: 130
          },
          {
            title: 'Updated',
            render: function(data, type, row, meta) {
              return $filter('shortDate')(row.modified);
            },
            width: 130
          },
          {
            title: 'Time in progress',
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
