import { generateModalContentComponent } from '@waldur/core/utils';

import eventsService from './events-service';
import eventRegistry from './event-registry';
import BaseEventFormatter from './base-event-formatter';
import eventFormatter from './event-formatter';
import baseEventListController from './base-event-list';
import eventDetailsDialog from './event-details-dialog';
import EventTypesDialog from './EventTypesDialog';
import EventDialogsService from './event-dialogs-service';
import attachServices from './services';

export default module => {
  module.service('eventsService', eventsService);
  module.service('eventRegistry', eventRegistry);
  module.service('BaseEventFormatter', BaseEventFormatter);
  module.service('eventFormatter', eventFormatter);
  module.service('baseEventListController', baseEventListController);
  module.component('eventDetailsDialog', eventDetailsDialog);

  // TODO: a temporary solution for as long as we have heterogenuous (React-Ng) system.
  module.component('eventTypesDialogReact', EventTypesDialog);
  module.component('eventTypesDialog', generateModalContentComponent('event-types-dialog-react'));

  module.service('EventDialogsService', EventDialogsService);
  module.run(attachServices);
};
