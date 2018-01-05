import eventsService from './events-service';
import eventRegistry from './event-registry';
import BaseEventFormatter from './base-event-formatter';
import eventFormatter from './event-formatter';
import baseEventListController from './base-event-list';
import eventDetailsDialog from './EventDetailsDialog';
import eventTypesDialog from './EventTypesDialog';
import EventDialogsService from './event-dialogs-service';
import attachServices from './services';
import eventGroups from './event-groups';
import './help';

export default module => {
  module.service('eventsService', eventsService);
  module.service('eventRegistry', eventRegistry);
  module.service('BaseEventFormatter', BaseEventFormatter);
  module.service('eventFormatter', eventFormatter);
  module.service('baseEventListController', baseEventListController);
  module.component('eventDetailsDialog', eventDetailsDialog);
  module.component('eventTypesDialog', eventTypesDialog);
  module.component('eventGroups', eventGroups);
  module.service('EventDialogsService', EventDialogsService);
  module.run(attachServices);
};
