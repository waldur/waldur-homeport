export default function issueList() {
  return {
    restrict: 'E',
    templateUrl: 'views/partials/filtered-list.html',
    controller: IssueListController,
    controllerAs: 'ListController'
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
            title: 'Status',
            render: function(data, type, row, meta) {
              const classes = {
                TODO: 'label-primary',
                FIXED: 'label-warning',
                BUG: 'label-danger'
              };
              return `<span class="label ${classes[row.status]}">${row.status}</span>`
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
            title: 'Issuer',
            render: function(data, type, row, meta) {
              return row.user_username;
            }
          },
          {
            title: 'Created',
            render: function(data, type, row, meta) {
              return $filter('dateTime')(row.created);
            },
            width: 150
          }
        ]
      };
    }
  });

  controllerScope.__proto__ = new controllerClass();
}
