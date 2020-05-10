import eventDetailsDialog from './EventDetailsDialog';
import eventsService from './events-service';
import eventTypesDialog from './EventTypesDialog';

export default module => {
  module.service('eventsService', eventsService);
  module.component('eventDetailsDialog', eventDetailsDialog);
  module.component('eventTypesDialog', eventTypesDialog);
};
