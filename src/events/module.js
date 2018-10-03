import eventsService from './events-service';
import eventDetailsDialog from './EventDetailsDialog';
import eventTypesDialog from './EventTypesDialog';
import EventDialogsService from './event-dialogs-service';
import attachServices from './services';
import eventGroups from './event-groups';
import './help';

export default module => {
  module.service('eventsService', eventsService);
  module.component('eventDetailsDialog', eventDetailsDialog);
  module.component('eventTypesDialog', eventTypesDialog);
  module.component('eventGroups', eventGroups);
  module.service('EventDialogsService', EventDialogsService);
  module.run(attachServices);
};
