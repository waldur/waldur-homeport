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
        noDataText: gettext('No alerts yet'),
        noMatchesText: gettext('No alerts found matching filter.'),
        searchFieldName: 'message',
        columns: [
          {
            title: gettext('Message'),
            className: 'all',
            render: function(row) {
              return alertFormatter.format(row);
            }
          },
          {
            title: gettext('Timestamp'),
            className: 'all',
            render: function(row) {
              return $filter('dateTime')(row.created);
            }
          }
        ],
        tableActions: [
          {
            title: gettext('Alert types'),
            iconClass: 'fa fa-question-circle',
            callback: AlertDialogsService.alertTypes.bind(AlertDialogsService)
          }
        ]
      };
    }
  });
}
