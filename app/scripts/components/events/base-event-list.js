import { gettext } from '@waldur/i18n/utils';

// @ngInject
export default function baseEventListController(
  baseControllerListClass,
  eventsService,
  EventDialogsService,
  eventFormatter,
  $filter) {
  let ControllerListClass = baseControllerListClass.extend({
    init:function() {
      this.service = eventsService;
      this.tableOptions = {
        noDataText: gettext('No events yet'),
        noMatchesText: gettext('No events found matching filter.'),
        searchFieldName: 'search',

        columns: [
          {
            title: gettext('Message'),
            className: 'all',
            render: function(row) {
              return eventFormatter.format(row);
            }
          },
          {
            title: gettext('Timestamp'),
            className: 'all',
            render: function(row) {
              return $filter('dateTime')(row['@timestamp']);
            }
          },
        ],

        tableActions: [
          {
            title: gettext('Event types'),
            iconClass: 'fa fa-question-circle',
            callback: EventDialogsService.eventTypes.bind(EventDialogsService)
          }
        ],

        rowActions: [
          {
            title: gettext('Details'),
            callback: EventDialogsService.eventDetails.bind(EventDialogsService)
          }
        ]
      };
      this._super();
    },
  });

  return ControllerListClass;
}
