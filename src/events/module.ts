import EventDialogsService from './event-dialogs-service';
import eventGroups from './event-groups';
import eventDetailsDialog from './EventDetailsDialog';
import eventsService from './events-service';
import eventTypesDialog from './EventTypesDialog';
import attachServices from './services';
import './help';

export default module => {
  module.service('eventsService', eventsService);
  module.component('eventDetailsDialog', eventDetailsDialog);
  module.component('eventTypesDialog', eventTypesDialog);
  module.component('eventGroups', eventGroups);
  module.service('EventDialogsService', EventDialogsService);
  module.run(attachServices);
};
