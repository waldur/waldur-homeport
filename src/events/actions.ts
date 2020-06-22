import { openModalDialog } from '@waldur/modal/actions';

import { EventDetailsDialog } from './EventDetailsDialog';
import { EventTypesDialog } from './EventTypesDialog';

export const showEventTypes = () => openModalDialog(EventTypesDialog);

export const showEventDetails = (event) =>
  openModalDialog(EventDetailsDialog, { resolve: { event } });
