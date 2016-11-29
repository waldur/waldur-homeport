import { ISSUE_CLASSES } from './constants';
import template from './issues-list.html';

export default function issueList() {
  return {
    restrict: 'E',
    template: template,
    controller: IssueListController,
    controllerAs: 'ListController',
    scope: {},
    bindToController: true
  };
}

// @ngInject
function IssueListController(baseControllerListClass, FakeIssuesService, $filter) {
  var controllerScope = this;
  var controllerClass = baseControllerListClass.extend({
    init: function() {
      this.service = FakeIssuesService;
      this.controllerScope = controllerScope;
      this._super();
      this.searchFieldName = 'search';
      this.tableOptions = {
        entityData: {
          noDataText: 'No tickets yet.',
          noMatchesText: 'No tickets found matching filter.',
        },
        tableActions: [
          {
            name: '<i class="fa fa fa-plus"></i> Create ticket',
            callback: function() {
              $state.go('support.create');
            }
          }
        ],
        columns: [
          {
            title: 'Type',
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
              return row.title;
            },
            width: 400
          },
          {
            title: 'Scope',
            render: function(data, type, row, meta) {
              return row.scope;
            }
          },
          {
            title: 'Reporter',
            render: function(data, type, row, meta) {
              return row.user.username;
            },
            width: 170
          },
          {
            title: 'Assigned to',
            render: function(data, type, row, meta) {
              return row.assigned.username;
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
              return $filter('shortDate')(row.updated);
            },
            width: 130
          },
          {
            title: 'Time spent',
            render: function(data, type, row, meta) {
              return row.timeSpent;
            },
            width: 100
          }
        ]
      };
      this.filterList = [
        {
          name: 'customer',
          label: 'Organization'
        },
        {
          name: 'project',
          label: 'Project'
        },
        {
          name: 'resource',
          label: 'Affected resource'
        },
        {
          name: 'type',
          label: 'Issue type'
        },
        {
          name: 'status',
          label: 'Status'
        },
        {
          name: 'reporter',
          label: 'Reporter'
        },
        {
          name: 'assignee',
          label: 'Assignee'
        }
      ];
    }
  });

  controllerScope.__proto__ = new controllerClass();
}
