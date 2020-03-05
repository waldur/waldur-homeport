import { openModalDialog } from '@waldur/modal/actions';

export const showEventTypes = () => openModalDialog('eventTypesDialog');

export const showEventDetails = event =>
  openModalDialog('eventDetailsDialog', { resolve: { event } });
