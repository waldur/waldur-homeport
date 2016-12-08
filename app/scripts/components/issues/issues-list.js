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
            title: 'Key',
            render: function(data, type, row, meta) {
              return `<span title="${row.type.toUpperCase()}" class="label ${ISSUE_CLASSES[row.type]}">${row.key}</span>`
            },
            width: 50
          },
          {
            title: 'Status',
            render: function(data, type, row, meta) {
              return row.status;
            },
            width: 50
          },
          {
            title: 'Summary',
            render: function(data, type, row, meta) {
              return row.summary;
            },
            width: 400
          },
          {
            title: 'Scope',
            render: function(data, type, row, meta) {
              return row.resource;
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
              return row.reporter_email;
            },
            width: 170
          },
          {
            title: 'Reporter',
            render: function(data, type, row, meta) {
              return row.creator_email;
            },
            width: 170
          },
          {
            title: 'Assigned to',
            render: function(data, type, row, meta) {
              return row.assignee_email && row.assignee_email || 'N/A';
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
        controllerScope.service.filter = filter;
        controllerScope.getList();
      }, true);
    }
  });

  controllerScope.__proto__ = new controllerClass();
}
