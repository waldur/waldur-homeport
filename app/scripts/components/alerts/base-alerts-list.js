// @ngInject
export default function BaseAlertsListController(
  baseControllerListClass,
  alertsService,
  alertFormatter,
  AlertDialogsService,
  $filter) {
  return baseControllerListClass.extend({
    init: function() {
      this.service = alertsService;
      this._super();

      this.tableOptions = {
        noDataText: 'No alerts yet',
        noMatchesText: 'No alerts found matching filter.',
        searchFieldName: 'message',
        columns: [
          {
            title: 'Message',
            className: 'all',
            render: function(row) {
              return alertFormatter.format(row);
            }
          },
          {
            title: 'Timestamp',
            className: 'all',
            render: function(row) {
              return $filter('dateTime')(row.created);
            }
          }
        ],
        tableActions: [
          {
            name: '<i class="fa fa-question-circle"></i> Alert types',
            callback: AlertDialogsService.alertTypes.bind(AlertDialogsService)
          }
        ]
      };
    }
  });
}
