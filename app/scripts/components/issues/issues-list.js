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
            name: 'Create ticket',
            callback: function() {
              $state.go('support.create');
            }
          }
        ],
        columns: [
          {
            title: 'Type',
            render: function(data, type, row, meta) {
              return `<span class="label ${ISSUE_CLASSES[row.type]}">${row.type.toUpperCase()}</span>`
            },
            width: 50
          },
          {
            title: 'Resolution',
            render: function(data, type, row, meta) {
              return row.resolution;
            },
            width: 50
          },
          {
            title: 'Summary',
            className: 'issue-info',
            render: function(data, type, row, meta) {
              return `<a href="issue.details">${row.key}</a><p><small>${row.title}</small></p>`
            }
          },
          {
            title: 'Reporter',
            render: function(data, type, row, meta) {
              return row.user.username;
            }
          },
          {
            title: 'Assigned to',
            render: function(data, type, row, meta) {
              return row.assigned.username;
            }
          },
          {
            title: 'Created',
            render: function(data, type, row, meta) {
              return $filter('dateTime')(row.created);
            },
            width: 150
          },
          {
            title: 'Updated',
            render: function(data, type, row, meta) {
              return $filter('dateTime')(row.updated);
            },
            width: 150
          }
        ]
      };
      this.filterList = [
        {
          name: 'customer',
          label: 'Organization name'
        },
        {
          name: 'project',
          label: 'Project name'
        },
        {
          name: 'resource',
          label: 'Affected resource'
        },
        {
          name: 'type',
          label: 'Ticket type'
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
