import eventsService from './events-service';
import eventRegistry from './event-registry';
import BaseEventFormatter from './base-event-formatter';
import eventFormatter from './event-formatter';
import baseEventListController from './base-event-list';
import eventDetailsDialog from './event-details-dialog';
import eventTypesDialog from './EventTypesDialog';
import EventDialogsService from './event-dialogs-service';
import attachServices from './services';

export default module => {
  module.service('eventsService', eventsService);
  module.service('eventRegistry', eventRegistry);
  module.service('BaseEventFormatter', BaseEventFormatter);
  module.service('eventFormatter', eventFormatter);
  module.service('baseEventListController', baseEventListController);
  module.component('eventDetailsDialog', eventDetailsDialog);
  module.component('eventTypesDialog', eventTypesDialog);
  module.service('EventDialogsService', EventDialogsService);
  module.run(attachServices);
};
